const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, seller } = require('../middleware/auth');

// @desc    Get all products (with search & filtering)
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const { keyword, category, seller: sellerId, sort } = req.query;

    let query = {};

    if (keyword) {
      query.name = { $regex: keyword, $options: 'i' };
    }

    if (category) {
      query.category = category;
    }

    if (sellerId) {
      query.seller = sellerId;
    }

    let apiQuery = Product.find(query).populate('seller', 'name email');

    // Sorting
    if (sort) {
      if (sort === 'priceAsc') {
        apiQuery = apiQuery.sort({ price: 1 });
      } else if (sort === 'priceDesc') {
        apiQuery = apiQuery.sort({ price: -1 });
      } else if (sort === 'rating') {
        apiQuery = apiQuery.sort({ averageRating: -1 });
      }
    } else {
      apiQuery = apiQuery.sort({ createdAt: -1 }); // newest first
    }

    const products = await apiQuery;
    res.json(products);
  } catch (error) {
    next(error);
  }
});

// @desc    Get single product details
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('seller', 'name email');

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Seller
router.post('/', protect, seller, async (req, res, next) => {
  try {
    const { name, price, description, image, category, stock } = req.body;

    const product = new Product({
      name,
      price,
      description,
      image,
      category,
      stock,
      seller: req.user._id,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    next(error);
  }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Seller
router.put('/:id', protect, seller, async (req, res, next) => {
  try {
    const { name, price, description, image, category, stock } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      // Check if product belongs to the seller
      if (product.seller.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'User not authorized to edit this product' });
      }

      product.name = name || product.name;
      product.price = price !== undefined ? price : product.price;
      product.description = description || product.description;
      product.image = image || product.image;
      product.category = category || product.category;
      product.stock = stock !== undefined ? stock : product.stock;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Seller
router.delete('/:id', protect, seller, async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      // Check if product belongs to the seller
      if (product.seller.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'User not authorized to delete this product' });
      }

      await Product.deleteOne({ _id: product._id });
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Create a new review
// @route   POST /api/products/:id/reviews
// @access  Private
router.post('/:id/reviews', protect, async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      // Check if user already reviewed this product
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        return res.status(400).json({ message: 'Product already reviewed' });
      }

      const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user._id,
      };

      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.averageRating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

      await product.save();
      res.status(201).json({ message: 'Review added' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
