import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";


//GLOBAL VARIABLES
const currency = "usd";
const deliveryCharges = 10;

// PLACING ORDERS USING COD
const placeOrder = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;

    // Check availability
    for (const item of items) {
      const productData = await productModel.findById(item._id);
      if (productData) {
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

    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    res.json({ success: true, message: "Order Placed" });
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

export { placeOrder, allOrders, userOrders, updateStatus };
