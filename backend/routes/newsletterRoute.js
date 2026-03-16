import express from "express";
import { subscribeNewsletter } from "../controllers/newsletterController.js";
import authUserOptional from "../middleware/authOptional.js";

const newsletterRouter = express.Router();

newsletterRouter.post("/subscribe", authUserOptional, subscribeNewsletter);

export default newsletterRouter;
