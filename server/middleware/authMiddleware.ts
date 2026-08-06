// ==========================================
// AUTHENTICATION MIDDLEWARE (JWT Verification)
// Urdu Comment: Yeh middleware har protected route se pehle JWT token verify karta hai
// ==========================================

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Custom Request interface for attached user data
export interface AuthRequest extends Request {
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

// JWT Secret Key (Environment variable se lay rahe hain)
const JWT_SECRET = process.env.JWT_SECRET || 'my_super_secret_jwt_key_login_system_2026';

/**
 * Middleware Function
 * Urdu Comment: User ka token verify karne ka function
 */
export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  // Authorization header se token nikal rahe hain
  // Urdu Comment: Header mein se Bearer token retrieve kar rahe hain
  const authHeader = req.headers.authorization || req.headers['authorization'];
  
  if (!authHeader) {
    res.status(401).json({
      success: false,
      message: 'Access denied! Authentication token nahi mila. Baraye meherbani login karein.' // Urdu Comment: Token Missing Error
    });
    return;
  }

  // "Bearer TOKEN_STRING" se token alag kar rahe hain
  const token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : (authHeader as string);

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Token format ghalat hai ya token missing hai.'
    });
    return;
  }

  try {
    // Token ko verify aur decode kar rahe hain
    // Urdu Comment: JWT secret key ke zariye token decode kar rahe hain
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; name: string; email: string };
    
    // Decoded data ko request object ke sath attach kar rahe hain
    // Urdu Comment: Decoded user info request mein add kar rahe hain takay aglay routes use kar sakein
    req.user = decoded;
    
    // Aglay route handler par chalne ka signal
    next();
  } catch (error: any) {
    console.error('JWT Verification Error:', error.message);
    res.status(401).json({
      success: false,
      message: 'Aap ka session khatam ho chuka hai ya token ghalat hai. Baraye meherbani dobara login karein.'
    });
    return;
  }
};

export default verifyToken;
