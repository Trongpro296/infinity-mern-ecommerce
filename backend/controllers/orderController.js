import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";


// PLACING ORDERS USING COD
const placeOrder = async (req, res) => {
  try {
    const { userId, items, amount, address, appliedVoucher } = req.body;

    // Check voucher validity
    let user;
    if (appliedVoucher) {
      user = await userModel.findById(userId);
      if (user && user.usedVouchers.includes(appliedVoucher)) {
        return res.json({ success: false, message: "Mã giảm giá này đã được sử dụng cho tài khoản của bạn." });
      }
    }

    // Check availability
    for (const item of items) {
      const productData = await productModel.findById(item._id);
      if (productData) {
        // Automatically attach image if not provided by client (Postman/API testing)
        if (!item.image) {
          item.image = productData.image;
        }

        const currentStock = productData.sizesStock && productData.sizesStock[item.size] !== undefined
          ? productData.sizesStock[item.size]
          : productData.quantity;

        if (currentStock < item.quantity) {
          return res.json({ success: false, message: `Sản phẩm ${item.name} size ${item.size} không đủ trong kho.` });
        }
      }
    }

    // Deduct stock
    for (const item of items) {
      const productData = await productModel.findById(item._id);
      if (productData) {
        if (productData.sizesStock && productData.sizesStock[item.size] !== undefined) {
          productData.sizesStock[item.size] -= item.quantity;
          productData.markModified('sizesStock');
        } else {
          productData.quantity -= item.quantity;
        }
        await productData.save();
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

    // Mark voucher as used if provided
    let updateQuery = { cartData: {} };
    if (appliedVoucher && user) {
      updateQuery.$push = { usedVouchers: appliedVoucher };
    }

    await userModel.findByIdAndUpdate(userId, updateQuery);

    console.log(orderData);
    res.json({ success: true, message: "Order Placed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// APPLY VOUCHER LOGIC
const applyVoucherCode = async (req, res) => {
  try {
    const { userId, voucherCode } = req.body;

    // Only allow BARCA20 for now
    if (voucherCode !== 'BARCA20') {
      return res.json({ success: false, message: "Mã giảm giá không hợp lệ!" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "Người dùng không tồn tại." });
    }

    // Check newsletter subscription (any email is ok, but must be linked to this account)
    const newsletterModel = (await import("../models/newsletterModel.js")).default;
    const subscription = await newsletterModel.findOne({ userId });
    if (!subscription) {
      return res.json({ success: false, message: "Bạn cần đăng ký nhận tin trước khi sử dụng mã giảm giá!" });
    }

    if (user.usedVouchers && user.usedVouchers.includes(voucherCode)) {
      return res.json({ success: false, message: "Bạn đã sử dụng mã giảm giá này rồi." });
    }

    res.json({ success: true, message: "Áp dụng mã giảm giá thành công!", discountPercent: 20 });
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
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

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
