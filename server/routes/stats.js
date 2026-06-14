const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect, seller } = require('../middleware/auth');

// @desc    Get stats for a seller's dashboard
// @route   GET /api/stats/seller
// @access  Private/Seller
router.get('/seller', protect, seller, async (req, res, next) => {
  try {
    // 1. Total products listed
    const productCount = await Product.countDocuments({ seller: req.user._id });

    // 2. Find all products belonging to this seller
    const myProducts = await Product.find({ seller: req.user._id });
    const myProductIds = myProducts.map((p) => p._id.toString());

    // 3. Find all orders containing seller's products
    const orders = await Order.find({
      'orderItems.product': { $in: myProductIds },
    });

    // Calculate total revenue and units sold from seller's items in those orders
    let totalRevenue = 0;
    let totalUnitsSold = 0;

    orders.forEach((order) => {
      if (order.status !== 'Cancelled') {
        order.orderItems.forEach((item) => {
          if (myProductIds.includes(item.product.toString())) {
            totalRevenue += item.price * item.quantity;
            totalUnitsSold += item.quantity;
          }
        });
      }
    });

    res.json({
      productCount,
      orderCount: orders.length,
      totalRevenue,
      totalUnitsSold,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
