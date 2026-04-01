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

// Route for Admin to get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find({}).select("-password");
    res.json({ success: true, users });
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