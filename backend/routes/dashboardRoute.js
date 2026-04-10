import express from "express";
import { getDashboardStats, getPublicBestSellers } from "../controllers/dashboardController.js";
import adminAuth from "../middleware/adminAuth.js";

const dashboardRouter = express.Router();

dashboardRouter.get("/stats", adminAuth, getDashboardStats);
dashboardRouter.get("/best-sellers", getPublicBestSellers);

export default dashboardRouter;
