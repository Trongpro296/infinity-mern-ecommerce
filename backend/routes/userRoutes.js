import express from "express";
import { adminLogin, loginUser, registerUser, getAllUsers, updateUserStatus, deleteUser } from "../controllers/userController.js";
import adminAuth from "../middleware/adminAuth.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/admin", adminLogin);

// Admin user management routes
userRouter.get("/list", adminAuth, getAllUsers);
userRouter.post("/status", adminAuth, updateUserStatus);
userRouter.post("/delete", adminAuth, deleteUser);

export default userRouter;