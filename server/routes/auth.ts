// ==========================================
// AUTHENTICATION ROUTER (Register, Login, Profile, Logout)
// Urdu Comment: Is file mein tamam Authentication API endpoints mojood hain
// ==========================================

import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { executeQuery } from '../db';
import { verifyToken, AuthRequest } from '../middleware/authMiddleware';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'my_super_secret_jwt_key_login_system_2026';

// Email validation regex helper
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Strong password check helper (at least 6 characters)
function isStrongPassword(password: string): boolean {
  return password.length >= 6;
}

/**
 * 1. USER REGISTER ROUTE
 * POST /api/register
 * Urdu Comment: Naya user account banane ka API endpoint
 */
router.post('/register', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Urdu Comment: Check kar rahe hain ke koi field khali (empty) to nahi
    if (!name || !email || !password || !confirmPassword) {
      res.status(400).json({
        success: false,
        message: 'Baraye meherbani tamam fields (Name, Email, Password, Confirm Password) pur karein.'
      });
      return;
    }

    // Urdu Comment: Email format valid hai ya nahi
    if (!isValidEmail(email)) {
      res.status(400).json({
        success: false,
        message: 'Ghalat email address format hai. Baraye meherbani sahi email likhein.'
      });
      return;
    }

    // Urdu Comment: Password ki strength check kar rahe hain
    if (!isStrongPassword(password)) {
      res.status(400).json({
        success: false,
        message: 'Password kam se kam 6 characters ka hona chahiye.'
      });
      return;
    }

    // Urdu Comment: Check kar rahe hain ke Password aur Confirm Password match karte hain ya nahi
    if (password !== confirmPassword) {
      res.status(400).json({
        success: false,
        message: 'Password aur Confirm Password aapas mein match nahi karte!'
      });
      return;
    }

    // Urdu Comment: Database se check kar rahe hain ke yeh email pehle se registered to nahi
    const existingUsers = await executeQuery(
      'SELECT id FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1',
      [email]
    );

    if (existingUsers && existingUsers.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Yeh Email pehle se registered hai! Baraye meherbani kisi doosre email se register karein ya login karein.'
      });
      return;
    }

    // Urdu Comment: Password ko hash kar rahe hain security ke liye bcrypt se
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Urdu Comment: User ka data database mein save kar rahe hain (Parameterized Query se SQL Injection se bachao)
    const result = await executeQuery(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), hashedPassword]
    );

    res.status(201).json({
      success: true,
      message: 'Mubarak ho! Aap ka account kamyabi se register ho gaya hai. Ab aap login kar sakte hain.'
    });
  } catch (error: any) {
    console.error('Registration API Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server par ghalti hui hai. Baraye meherbani thori der baad koshish karein.'
    });
  }
});

/**
 * 2. USER LOGIN ROUTE
 * POST /api/login
 * Urdu Comment: Existing user ke login karne ka API endpoint
 */
router.post('/login', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Urdu Comment: Input fields validation check
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Baraye meherbani Email aur Password dono darj karein.'
      });
      return;
    }

    // Urdu Comment: User ko database mein talash kar rahe hain
    const users = await executeQuery(
      'SELECT id, name, email, password FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1',
      [email.trim()]
    );

    if (!users || users.length === 0) {
      res.status(401).json({
        success: false,
        message: 'Yeh email database mein nahi mila. Baraye meherbani pehle register karein.'
      });
      return;
    }

    const user = users[0];

    // Urdu Comment: User ka darj karda password hashed password se match kar rahe hain
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      res.status(401).json({
        success: false,
        message: 'Ghalat Password! Baraye meherbani sahi password likhein.'
      });
      return;
    }

    // Urdu Comment: JWT Token generate kar rahe hain (24 ghante ki validity ke sath)
    const tokenPayload = {
      id: user.id,
      name: user.name,
      email: user.email
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: '24h'
    });

    res.status(200).json({
      success: true,
      message: 'Login kamyab ho gaya! KhushAamdeed.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error: any) {
    console.error('Login API Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server par ghalti hui hai. Baraye meherbani baad mein koshish karein.'
    });
  }
});

/**
 * 3. GET USER PROFILE (Protected Route)
 * GET /api/profile
 * Urdu Comment: Logged-in user ki profile aur details mangwane ki API
 */
router.get('/profile', verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized Request!' });
      return;
    }

    // Urdu Comment: Database se user ka fresh record fetch kar rahe hain
    const users = await executeQuery(
      'SELECT id, name, email, created_at FROM users WHERE id = ? LIMIT 1',
      [userId]
    );

    if (!users || users.length === 0) {
      res.status(404).json({ success: false, message: 'User record nahi mila.' });
      return;
    }

    const userProfile = users[0];

    res.status(200).json({
      success: true,
      user: {
        id: userProfile.id,
        name: userProfile.name,
        email: userProfile.email,
        created_at: userProfile.created_at
      }
    });
  } catch (error: any) {
    console.error('Profile API Error:', error);
    res.status(500).json({
      success: false,
      message: 'Profile fetch karne mein ghalti hui.'
    });
  }
});

/**
 * 4. LOGOUT ROUTE
 * POST /api/logout
 * Urdu Comment: User ke logout karne ka response
 */
router.post('/logout', (req: AuthRequest, res: Response): void => {
  res.status(200).json({
    success: true,
    message: 'Aap kamyabi se system se logout ho gaye hain.'
  });
});

export default router;
