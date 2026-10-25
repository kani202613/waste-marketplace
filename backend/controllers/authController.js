// backend/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'supersecretkey123',
    { expiresIn: '7d' }
  );
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone, address, city, pincode } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const trimmedName = String(name).trim();
    const trimmedEmail = String(email).trim().toLowerCase();
    const trimmedPassword = String(password);

    if (!trimmedName) {
      return res.status(400).json({ message: 'Name cannot be blank.' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    // Password length validation
    if (trimmedPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const validRoles = ['seller', 'collector', 'buyer'];
    const assignedRole = validRoles.includes(role) ? role : 'seller';

    const existingUser = await User.findByEmail(trimmedEmail);
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered. Please log in.' });
    }

    const passwordHash = await bcrypt.hash(trimmedPassword, 10);

    const createdUser = await User.create({
      name: trimmedName,
      email: trimmedEmail,
      password: passwordHash,
      role: assignedRole,
      phone: phone ? String(phone).trim() : null,
      address: address ? String(address).trim() : null,
      city: city ? String(city).trim() : null,
      pincode: pincode ? String(pincode).trim() : null
    });

    const token = generateToken(createdUser);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        role: createdUser.role
      },
      token
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const trimmedEmail = String(email).trim().toLowerCase();
    const trimmedPassword = String(password);

    const user = await User.findByEmail(trimmedEmail);
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(trimmedPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};
