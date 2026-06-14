const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, seller } = require('../middleware/auth');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, async (req, res, next) => {
  try {
    const { orderItems, shippingAddress, totalPrice } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    const order = new Order({
      customer: req.user._id,
      orderItems,
      shippingAddress,
      totalPrice,
    });

    const createdOrder = await order.save();

    // Deduct stock for each product
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    next(error);
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
router.get('/myorders', protect, async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

// @desc    Get orders for seller's products
// @route   GET /api/orders/seller
// @access  Private/Seller
router.get('/seller', protect, seller, async (req, res, next) => {
  try {
    // 1. Find all products belonging to this seller
    const myProducts = await Product.find({ seller: req.user._id });
    const myProductIds = myProducts.map((p) => p._id.toString());

    // 2. Find orders containing any of these products
    const orders = await Order.find({
      'orderItems.product': { $in: myProductIds },
    })
      .populate('customer', 'name email')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    next(error);
  }
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Seller
router.put('/:id/status', protect, seller, async (req, res, next) => {
  try {
    const { status } = req.body; // Processing, Shipped, Delivered, Cancelled
    const order = await Order.findById(req.params.id);

    if (order) {
      // Optional: check if seller actually owns any item in this order
      // (Simplified: if they hit this route and they are a seller, allow it for this demo store)
      order.status = status;
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
