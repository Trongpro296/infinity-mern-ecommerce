import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";
import orderModel from "../models/orderModel.js";

const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();

    // Calculate start of current month and start of last month
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();

    // 1. Total counts & MoM calculations
    const totalUsers = await userModel.countDocuments();
    const totalProducts = await productModel.countDocuments();
    const totalOrders = await orderModel.countDocuments();

    // Aggregations for Users MoM
    const thisMonthUsers = await userModel.countDocuments({ createdAt: { $gte: new Date(startOfThisMonth) } });
    const lastMonthUsers = await userModel.countDocuments({ createdAt: { $gte: new Date(startOfLastMonth), $lt: new Date(startOfThisMonth) } });

    const usersGrowth = lastMonthUsers === 0 ? (thisMonthUsers > 0 ? 100 : 0) : ((thisMonthUsers - lastMonthUsers) / lastMonthUsers) * 100;

    // Aggregations for Orders & Revenue MoM
    const thisMonthOrdersResult = await orderModel.aggregate([
      { $match: { date: { $gte: startOfThisMonth } } },
      { $group: { _id: null, revenue: { $sum: "$amount" }, count: { $sum: 1 } } }
    ]);

    const lastMonthOrdersResult = await orderModel.aggregate([
      { $match: { date: { $gte: startOfLastMonth, $lt: startOfThisMonth } } },
      { $group: { _id: null, revenue: { $sum: "$amount" }, count: { $sum: 1 } } }
    ]);

    const thisMonthRevenue = thisMonthOrdersResult.length > 0 ? thisMonthOrdersResult[0].revenue : 0;
    const thisMonthOrders = thisMonthOrdersResult.length > 0 ? thisMonthOrdersResult[0].count : 0;

    const lastMonthRevenue = lastMonthOrdersResult.length > 0 ? lastMonthOrdersResult[0].revenue : 0;
    const lastMonthOrders = lastMonthOrdersResult.length > 0 ? lastMonthOrdersResult[0].count : 0;

    const revenueGrowth = lastMonthRevenue === 0 ? (thisMonthRevenue > 0 ? 100 : 0) : ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
    const ordersGrowth = lastMonthOrders === 0 ? (thisMonthOrders > 0 ? 100 : 0) : ((thisMonthOrders - lastMonthOrders) / lastMonthOrders) * 100;

    // Overall Revenue
    const revenueResult = await orderModel.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: "$amount" } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;


    // 2. Order Status Distribution
    const orderStatusResult = await orderModel.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const orderStatuses = {};
    orderStatusResult.forEach(item => {
      orderStatuses[item._id] = item.count;
    });

    const lowStockProducts = await productModel.aggregate([
      {
        $addFields: {
          totalStock: {
            $cond: {
              if: { $gt: [{ $size: { $objectToArray: "$sizesStock" } }, 0] },
              then: { $sum: { $map: { input: { $objectToArray: "$sizesStock" }, as: "s", in: "$$s.v" } } },
              else: "$quantity"
            }
          }
        }
      },
      { $match: { totalStock: { $lt: 10 } } },
      { $sort: { totalStock: 1 } },
      { $limit: 10 },
      { $project: { name: 1, image: 1, quantity: "$totalStock", category: 1 } }
    ]);

    // 4. Ten Recent Orders Feed
    const recentOrders = await orderModel.find({})
      .sort({ date: -1 })
      .limit(10)
      .select("address.firstName address.lastName amount status date items paymentMethod");

    const formattedRecentOrders = recentOrders.map(order => ({
      _id: order._id,
      customerName: `${order.address.firstName} ${order.address.lastName}`,
      amount: order.amount,
      status: order.status,
      date: order.date,
      itemsCount: order.items.length,
      method: order.paymentMethod
    }));

    // 5. Top 5 Best Selling Products (Kept from previous version)
    const topProductsResult = await orderModel.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          image: { $first: { $arrayElemAt: ["$items.image", 0] } }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 }
    ]);

    const topProducts = topProductsResult.map(item => ({
      name: item._id,
      quantity: item.totalQuantity,
      revenue: item.totalRevenue,
      image: item.image
    }));

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        growth: {
          revenue: revenueGrowth.toFixed(1),
          orders: ordersGrowth.toFixed(1),
          users: usersGrowth.toFixed(1)
        },
        orderStatuses,
        lowStockProducts,
        recentOrders: formattedRecentOrders,
        topProducts
      }
    });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { getDashboardStats };
