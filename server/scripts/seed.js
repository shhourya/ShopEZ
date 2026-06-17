const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');

// Force IPv4 DNS resolution order and use public DNS resolvers to bypass local network DNS failures
dns.setDefaultResultOrder('ipv4first');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  console.warn('Failed to set public DNS servers, falling back to system default', e.message);
}

const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Load environment variables
dotenv.config();

const mockProducts = (sellerId) => [
  {
    name: 'AcousticWave Wireless Headphones',
    description: 'Experience studio-quality sound with adaptive active noise cancellation, 40-hour battery life, and ultra-comfortable memory foam earcups.',
    price: 14999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60',
    stock: 25,
    seller: sellerId,
    averageRating: 4.8,
    numReviews: 2,
    reviews: [
      {
        name: 'Jane Doe',
        rating: 5,
        comment: 'Absolutely love these! The sound quality is pristine and the battery lasts forever.',
      },
      {
        name: 'Alex Smith',
        rating: 4,
        comment: 'Great ANC, but can feel a bit tight on larger heads after a few hours.',
      },
    ],
  },
  {
    name: 'ChronoClassic Minimalist Watch',
    description: 'Sleek, minimalist design featuring a premium leather strap, scratch-resistant sapphire crystal glass, and Japanese quartz movement. Waterproof up to 50m.',
    price: 9999,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60',
    stock: 15,
    seller: sellerId,
    averageRating: 4.5,
    numReviews: 1,
    reviews: [
      {
        name: 'John Doe',
        rating: 5,
        comment: 'Looks elegant and goes with almost any outfit. Excellent build quality.',
      },
    ],
  },
  {
    name: 'ErgoComfort Office Chair',
    description: 'Ergonomically designed office chair with full lumbar support, 3D adjustable armrests, breathable mesh back, and multi-angle recline lock.',
    price: 18999,
    category: 'Home & Living',
    image: 'https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?w=800&auto=format&fit=crop&q=60',
    stock: 8,
    seller: sellerId,
    averageRating: 4.2,
    numReviews: 1,
    reviews: [
      {
        name: 'Michael Scott',
        rating: 4,
        comment: 'Much better than my old chair. Good back support, but assembly instructions could be clearer.',
      },
    ],
  },
  {
    name: 'AromaPulse Precision Espresso Machine',
    description: 'Bring the cafe experience home. 15-bar Italian pump pressure, integrated steam wand for latte art, and digital temperature control for optimal flavor extraction.',
    price: 29999,
    category: 'Home & Living',
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=800&auto=format&fit=crop&q=60',
    stock: 5,
    seller: sellerId,
    averageRating: 4.7,
    numReviews: 1,
    reviews: [
      {
        name: 'CoffeeLover99',
        rating: 5,
        comment: 'Takes a bit of practice to dial in, but makes the absolute best espresso shots.',
      },
    ],
  },
  {
    name: 'Nomad Canvas Travel Backpack',
    description: 'Heavy-duty water-resistant waxed canvas backpack with a padded 15.6" laptop sleeve, anti-theft secret compartments, and comfortable padded shoulder straps.',
    price: 4999,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=60',
    stock: 30,
    seller: sellerId,
    averageRating: 4.0,
    numReviews: 1,
    reviews: [
      {
        name: 'Emily Watson',
        rating: 4,
        comment: 'Very spacious and looks stylish. The canvas feels very durable, but it is a bit heavy.',
      },
    ],
  },
  {
    name: 'FlexGrip Smart Dumbbells Set',
    description: 'All-in-one adjustable dumbbells ranging from 5 to 50 lbs. Features a textured steel handle for secure grip and a smooth dial system for quick weight changes.',
    price: 24999,
    category: 'Sports & Outdoors',
    image: 'https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=800&auto=format&fit=crop&q=60',
    stock: 12,
    seller: sellerId,
    averageRating: 4.6,
    numReviews: 2,
    reviews: [
      {
        name: 'HerculeanFit',
        rating: 5,
        comment: 'Saves so much space in my home gym. Adjusting the weights is super smooth.',
      },
      {
        name: 'Sarah T.',
        rating: 4,
        comment: 'Good grip, though the weights are slightly bulkier than traditional dumbbells.',
      },
    ],
  },
  {
    name: 'The Art of Simplicity (Hardcover)',
    description: 'A bestselling guide to decluttering your life, finding focus, and cultivating daily mindfulness in a hyper-connected world.',
    price: 999,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&auto=format&fit=crop&q=60',
    stock: 50,
    seller: sellerId,
    averageRating: 4.9,
    numReviews: 1,
    reviews: [
      {
        name: 'Reader7',
        rating: 5,
        comment: 'A life-changing book. Recommended for anyone feeling overwhelmed by modern clutter.',
      },
    ],
  },
  {
    name: 'AeroGlide Carbon Fiber Road Bike',
    description: 'High-performance carbon fiber frame road bike, equipped with Shimano 22-speed drivetrain, hydraulic disc brakes, and aerodynamic racing wheels.',
    price: 125000,
    category: 'Sports & Outdoors',
    image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&auto=format&fit=crop&q=60',
    stock: 3,
    seller: sellerId,
    averageRating: 5.0,
    numReviews: 1,
    reviews: [
      {
        name: 'RiderPro',
        rating: 5,
        comment: 'Amazingly light and stiff. Power transfer is immediate. Highly recommended for serious cyclists.',
      },
    ],
  },
];

const seedDB = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/shopez');
    console.log('MongoDB Connected for Seeding...');

    // Clear existing data
    await User.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();
    console.log('Database cleared.');

    // Create a mock seller
    const sellerUser = await User.create({
      name: 'ShopEZ Official Seller',
      email: 'seller@shopez.com',
      password: 'password123', // Will be hashed in pre-save hook
      role: 'seller',
    });

    // Create a mock customer
    const customerUser = await User.create({
      name: 'Default Customer',
      email: 'customer@shopez.com',
      password: 'password123', // Will be hashed in pre-save hook
      role: 'customer',
    });

    // Create a mock admin
    await User.create({
      name: 'System Admin',
      email: 'admin@shopez.com',
      password: 'password123', // Will be hashed in pre-save hook
      role: 'admin',
    });

    console.log('Mock Users created.');

    // Seed products with the seller's ID
    const productsData = mockProducts(sellerUser._id);
    productsData.forEach(p => {
      p.reviews.forEach(r => {
        r.user = customerUser._id;
      });
    });
    
    await Product.insertMany(productsData);

    console.log('Mock Products seeded.');
    console.log('Database Seeding Successful!');
    process.exit();
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedDB();
