import categoryModel from "../models/categoryModel.js";

// Add new category
const addCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.json({ success: false, message: "Vui lòng nhập tên danh mục" });
    }

    const existing = await categoryModel.findOne({ name });
    if (existing) {
      return res.json({ success: false, message: "Danh mục đã tồn tại" });
    }

    const category = new categoryModel({ name, date: Date.now() });
    await category.save();

    res.json({ success: true, message: "Thêm danh mục thành công", category });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const listCategory = async (req, res) => {
  try {
    const categories = await categoryModel.aggregate([
      {
        $lookup: {
          from: "orders",
          let: { categoryName: "$name" },
          pipeline: [
            { $match: { $expr: { $eq: ["$status", "Delivered"] } } },
            { $unwind: "$items" },
            {
              $match: {
                $expr: { $eq: ["$items.category", "$$categoryName"] },
              },
            },
            {
              $group: {
                _id: null,
                total: {
                  $sum: { $multiply: ["$items.price", "$items.quantity"] },
                },
              },
            },
          ],
          as: "revenueData",
        },
      },
      // Stage 2: Gán revenue = 0 nếu chưa có đơn nào
      {
        $addFields: {
          revenue: {
            $ifNull: [{ $arrayElemAt: ["$revenueData.total", 0] }, 0],
          },
        },
      },
      // Stage 3: Chỉ giữ các field cần thiết
      {
        $project: {
          _id: 1,
          name: 1,
          date: 1,
          revenue: 1,
        },
      },
      { $sort: { revenue: -1, date: -1 } },
    ]);


    res.json({ success: true, categories });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Remove category
const removeCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.json({ success: false, message: "Vui lòng cung cấp tên danh mục" });
    }

    await categoryModel.deleteOne({ name });

    res.json({ success: true, message: "Xóa danh mục thành công" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { addCategory, listCategory, removeCategory };
