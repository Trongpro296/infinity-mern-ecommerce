import express from 'express';
import {
  allOrders,
  userOrders,
  placeOrder,
  updateStatus,
} from '../controllers/orderController.js';

import adminAuth from '../middleware/adminAuth.js';
import authUser from '../middleware/auth.js';

const orderRouter = express.Router();

// Admin features
orderRouter.post('/list', adminAuth, allOrders);
orderRouter.post('/status', adminAuth, updateStatus);

// Place order / Payment features
orderRouter.post('/place', authUser, placeOrder);

// User features
orderRouter.post('/userorders', authUser, userOrders);

export default orderRouter;