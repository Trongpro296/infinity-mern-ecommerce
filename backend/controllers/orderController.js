import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";
import newsletterModel from "../models/newsletterModel.js";

// Voucher config — thêm các mã khác ở đây khi cần
const VOUCHERS = {
  BARCA20: { discountPercent: 20, requiresNewsletter: true },
};


// PLACING ORDERS USING COD
const placeOrder = async (req, res) => {
  try {
    const { userId, items, address, appliedVoucher } = req.body;

    // [M-5] Validate cart không rỗng
    if (!items || items.length === 0) {
      return res.json({ success: false, message: "Giỏ hàng trống." });
    }

    // Check voucher validity
    let user;
    if (appliedVoucher) {
      user = await userModel.findById(userId);
      if (user && user.usedVouchers.includes(appliedVoucher)) {
        return res.json({ success: false, message: "Mã giảm giá này đã được sử dụng cho tài khoản của bạn." });
      }
    }

    // Validate stock & attach real price/image from DB
    for (const item of items) {
      const productData = await productModel.findById(item._id);
      if (!productData) {
        return res.json({ success: false, message: `Sản phẩm không tồn tại.` });
      }

      // Use price from DB — ignore any price sent by client
      item.price = productData.price;
      if (!item.image) item.image = productData.image;

      const currentStock = productData.sizesStock && productData.sizesStock[item.size] !== undefined
        ? productData.sizesStock[item.size]
        : productData.quantity;

      if (currentStock < item.quantity) {
        return res.json({ success: false, message: `Sản phẩm ${productData.name} size ${item.size} không đủ trong kho.` });
      }
    }

    // Calculate amount server-side
    let amount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // [M-4] Apply voucher discount server-side dùng VOUCHERS config
    if (appliedVoucher && VOUCHERS[appliedVoucher]) {
      if (!user) user = await userModel.findById(userId);
      const voucherConfig = VOUCHERS[appliedVoucher];

      let isValid = !user.usedVouchers.includes(appliedVoucher);
      if (isValid && voucherConfig.requiresNewsletter) {
        const subscription = await newsletterModel.findOne({ userId });
        isValid = !!subscription;
      }

      if (isValid) {
        amount = Math.round(amount * (1 - voucherConfig.discountPercent / 100));
      } else {
        return res.json({ success: false, message: "Mã giảm giá không hợp lệ hoặc đã được sử dụng." });
      }
    } else if (appliedVoucher) {
      return res.json({ success: false, message: "Mã giảm giá không tồn tại." });
    }

    // [C-5] Atomic stock deduction — tránh race condition, không fetch product 2 lần
    for (const item of items) {
      // Thử deduct sizesStock trước
      const updatedBySizeStock = await productModel.findOneAndUpdate(
        { _id: item._id, [`sizesStock.${item.size}`]: { $gte: item.quantity } },
        { $inc: { [`sizesStock.${item.size}`]: -item.quantity } }
      );

      // Nếu không có sizesStock, deduct quantity chung
      if (!updatedBySizeStock) {
        const updatedByQty = await productModel.findOneAndUpdate(
          { _id: item._id, quantity: { $gte: item.quantity } },
          { $inc: { quantity: -item.quantity } }
        );
        if (!updatedByQty) {
          return res.json({ success: false, message: `Sản phẩm hết hàng hoặc không đủ số lượng.` });
        }
      }
    }

    const orderData = {
      userId,
      items,
      address,
      amount,
      paymentMethod: "COD",
      payment: false,
      date: Date.now(),
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    // Mark voucher as used + clear cart
    let updateQuery = { cartData: {} };
    if (appliedVoucher && user) {
      updateQuery.$push = { usedVouchers: appliedVoucher };
    }

    await userModel.findByIdAndUpdate(userId, updateQuery);

    res.json({ success: true, message: "Order Placed", amount });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// APPLY VOUCHER LOGIC
const applyVoucherCode = async (req, res) => {
  try {
    const { userId, voucherCode } = req.body;

    // [M-4] Kiểm tra voucher trong config thay vì hardcode
    const voucherConfig = VOUCHERS[voucherCode];
    if (!voucherConfig) {
      return res.json({ success: false, message: "Mã giảm giá không hợp lệ!" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "Người dùng không tồn tại." });
    }

    if (user.usedVouchers && user.usedVouchers.includes(voucherCode)) {
      return res.json({ success: false, message: "Bạn đã sử dụng mã giảm giá này rồi." });
    }

    // Kiểm tra điều kiện newsletter nếu voucher yêu cầu
    if (voucherConfig.requiresNewsletter) {
      const subscription = await newsletterModel.findOne({ userId });
      if (!subscription) {
        return res.json({ success: false, message: "Bạn cần đăng ký nhận tin trước khi sử dụng mã giảm giá!" });
      }
    }

    res.json({ success: true, message: "Áp dụng mã giảm giá thành công!", discountPercent: voucherConfig.discountPercent });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//ALL ORDERS DATA FOR ADMIN PANEL
const allOrders = async (req, res) => {
  try {
    const orders = await orderModel.find();
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//USER ORDERS DATA FOR FRONTEND
const userOrders = async (req, res) => {
  try {
    const { userId } = req.body;

    const orders = await orderModel.find({ userId });

    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//UPDATE ORDER STATUS FROM ADMIN PANEL
const VALID_STATUSES = ['Order Placed', 'Packing', 'Shipped', 'Out for delivery', 'Delivered', 'Cancelled'];

const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      return res.json({
        success: false,
        message: `Status không hợp lệ. Chỉ chấp nhận: ${VALID_STATUSES.join(', ')}`,
      });
    }

    const orderData = await orderModel.findById(orderId);

    // If cancelling, and it wasn't already cancelled, restore stock
    if (status === "Cancelled" && orderData.status !== "Cancelled") {
      for (const item of orderData.items) {
        const productData = await productModel.findById(item._id);
        if (productData) {
          if (productData.sizesStock && productData.sizesStock[item.size] !== undefined) {
            productData.sizesStock[item.size] += item.quantity;
            productData.markModified('sizesStock');
          } else {
            productData.quantity += item.quantity;
          }
          await productData.save();
        }
      }
    }

    await orderModel.findByIdAndUpdate(orderId, { status });

    res.json({ success: true, message: "Status updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { placeOrder, allOrders, userOrders, updateStatus, applyVoucherCode };
