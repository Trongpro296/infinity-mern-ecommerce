import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";
import orderModel from "../models/orderModel.js";
import categoryModel from "../models/categoryModel.js";

// Shared: Aggregate top N best-selling products from order data
const aggregateBestSellers = async (limit = 5) => {
  const topProductsResult = await orderModel.aggregate([
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items._id",
        name: { $first: "$items.name" },
        totalQuantity: { $sum: "$items.quantity" },
        totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        image: { $first: { $arrayElemAt: ["$items.image", 0] } }
      }
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: limit }
  ]);

  return topProductsResult;
};

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

    // 5. Top 5 Best Selling Products (reused shared logic)
    const topProductsRaw = await aggregateBestSellers(5);

    const topProducts = topProductsRaw.map(item => ({
      name: item.name,
      quantity: item.totalQuantity,
      revenue: item.totalRevenue,
      image: item.image
    }));

    // 6. Monthly Revenue for current year (for bar chart)
    const currentYear = now.getFullYear();
    const startOfYear = new Date(currentYear, 0, 1).getTime();
    const endOfYear = new Date(currentYear + 1, 0, 1).getTime();

    const monthlyRevenueResult = await orderModel.aggregate([
      { $match: { status: "Delivered", date: { $gte: startOfYear, $lt: endOfYear } } },
      {
        $group: {
          _id: { $month: { $toDate: "$date" } },
          revenue: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill all 12 months (0 for months with no revenue)
    const monthNames = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];
    const monthlyRevenue = monthNames.map((name, idx) => {
      const found = monthlyRevenueResult.find((m) => m._id === idx + 1);
      return { month: name, revenue: found ? found.revenue : 0 };
    });

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
        topProducts,
        monthlyRevenue
      }
    });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Public endpoint: Top 5 best sellers for Frontend (no auth required)
const getPublicBestSellers = async (req, res) => {
  try {
    const topProductsRaw = await aggregateBestSellers(5);

    // Enrich with current product data (price, category, full images)
    const productIds = topProductsRaw
      .map(item => item._id)
      .filter(id => id); // filter out nulls

    const productsFromDB = await productModel.find(
      { _id: { $in: productIds } },
      { name: 1, price: 1, image: 1, category: 1 }
    );

    const productMap = {};
    productsFromDB.forEach(p => {
      productMap[p._id.toString()] = p;
    });

    const bestSellers = topProductsRaw.map(item => {
      const dbProduct = item._id ? productMap[item._id.toString()] : null;
      return {
        _id: dbProduct?._id || null,
        name: dbProduct?.name || item.name,
        price: dbProduct?.price || 0,
        image: dbProduct?.image || (item.image ? [item.image] : []),
        category: dbProduct?.category || "",
        totalSold: item.totalQuantity,
      };
    }).filter(item => item._id); // only include products that still exist

    res.json({ success: true, bestSellers });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { getDashboardStats, getPublicBestSellers };
