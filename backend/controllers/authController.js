// backend/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

exports.register = (req, res) => {
  const { name, email, password, role, phone, address, city, pincode } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  // Check if user already exists
  User.findByEmail(email, async (err, existingUser) => {
    if (err) return res.status(500).json({ message: 'DB error', error: err });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    try {
      const passwordHash = await bcrypt.hash(password, 10);

      const newUser = {
        name,
        email,
        passwordHash,
        role: role || 'seller',
        phone: phone || null,
        address: address || null,
        city: city || null,
        pincode: pincode || null
      };

      User.create(newUser, (err, createdUser) => {
        if (err) return res.status(500).json({ message: 'DB error', error: err });

        const token = generateToken({ id: createdUser.id, email, role: newUser.role });

        res.status(201).json({
          message: 'User registered successfully',
          user: {
            id: createdUser.id,
            name,
            email,
            role: newUser.role
          },
          token
        });
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  User.findByEmail(email, async (err, user) => {
    if (err) return res.status(500).json({ message: 'DB error', error: err });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

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
  });
};
