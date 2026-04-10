import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import newsletterModel from "../models/newsletterModel.js";

const ALLOWED_STATUSES = ['Active', 'Blocked'];

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};


//Route for user login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "Tài khoản không tồn tại" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {

      const token = createToken(user._id);
      res.json({ success: true, token });

    } else {
      return res.json({ success: false, message: "Thông tin đăng nhập không chính xác" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//Route for user register
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    // checking user already exist or not
    const exists = await userModel.findOne({ email });

    if (exists) {
      return res.json({ success: false, message: "Tài khoản (Email) này đã tồn tại" });
    }

    //validating email formate and strong password
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Vui lòng nhập email hợp lệ", });
    }

    if (password.length < 8) {
      return res.json({ success: false, message: "Vui lòng nhập mật khẩu mạnh", });
    }

    //hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword
    });

    const user = await newUser.save();

    const token = createToken(user._id);

    res.json({ success: true, token });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//Route for Admin login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Thông tin đăng nhập không chính xác" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Route for Admin to get all users with total spending, search & pagination
const getAllUsers = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10, sortOrder = "desc" } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortDir = sortOrder === "asc" ? 1 : -1;
    const pipeline = [];

    // Server-side search: filter before expensive $lookup
    if (search) {
      const regex = { $regex: search, $options: "i" };
      pipeline.push({ $match: { $or: [{ name: regex }, { email: regex }] } });
    }

    pipeline.push(
      // Join orders — pipeline form handles ObjectId vs String mismatch
      {
        $lookup: {
          from: "orders",
          let: { uid: { $toString: "$_id" } },
          pipeline: [
            { $match: { $expr: { $eq: ["$userId", "$$uid"] } } },
            { $project: { amount: 1 } },
          ],
          as: "orders",
        },
      },
      { $addFields: { totalSpent: { $sum: "$orders.amount" } } },
      { $project: { password: 0, orders: 0, cartData: 0 } },
      { $sort: { totalSpent: sortDir } },
      // $facet: get paginated data + total count in one query
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: parseInt(limit) }],
          total: [{ $count: "count" }],
        },
      }
    );

    const [result] = await userModel.aggregate(pipeline);
    const users = result?.data || [];
    const total = result?.total[0]?.count || 0;

    res.json({ success: true, users, total });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Route for Admin to update user status
const updateUserStatus = async (req, res) => {
  try {
    const { userId, status } = req.body;

    if (!ALLOWED_STATUSES.includes(status)) {
      return res.json({ success: false, message: `Status is not valid. Only accept: ${ALLOWED_STATUSES.join(', ')}` });
    }

    await userModel.findByIdAndUpdate(userId, { status });
    res.json({ success: true, message: "Cập nhật trạng thái thành công" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Route for Admin to delete user
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.body;

    await Promise.all([
      userModel.findByIdAndDelete(userId),
      orderModel.deleteMany({ userId }),
      newsletterModel.deleteMany({ userId }),
    ]);

    res.json({ success: true, message: "Đã xóa tài khoản và dọn dẹp dữ liệu thành công" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { registerUser, loginUser, adminLogin, getAllUsers, updateUserStatus, deleteUser };