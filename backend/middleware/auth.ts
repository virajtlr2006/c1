import { Request, Response, NextFunction } from 'express';

// Extend Express Request interface to include auth data
declare global {
  namespace Express {
    interface Request {
      userEmail?: string;
      userId?: string;
    }
  }
}

// Simple auth middleware that accepts requests from authenticated frontend
export const clerkAuth = (_req: Request, _res: Response, next: NextFunction): void => {
  // For now, just pass through - Clerk will handle auth on the frontend
  next();
};

// Helper function to decode JWT payload without verification (for development)
function decodeJWTPayload(token: string): any {
  try {
    // Split token and get payload (middle part)
    const parts = token.split('.');
    if (parts.length !== 3 || !parts[1]) {
      return null;
    }

    // Decode base64 payload (add padding if needed)
    let payload = parts[1];
    // Add padding if needed for proper base64 decoding
    while (payload.length % 4) {
      payload += '=';
    }

    const decoded = Buffer.from(payload, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

// Require authentication - check for authorization header
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  try {
    console.log('🔐 Auth check for:', req.method, req.path);

    // Check for authorization header (would be set by Clerk on frontend)
    const authHeader = req.headers.authorization;
    console.log('🔍 Auth header:', authHeader ? 'Present' : 'Missing');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No valid auth header found');
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    // Extract token
    const token = authHeader.substring(7); // Remove "Bearer "
    console.log('🎫 Token extracted, length:', token.length);

    // Decode JWT to get user info
    const payload = decodeJWTPayload(token);

    if (payload && payload.sub) {
      // Use the Clerk user ID (sub field) to create a consistent user identifier
      const userId = payload.sub;

      // For development: create email from user ID
      // In production, you'd validate the token with Clerk's API to get real email
      const userEmail = `${userId.replace('user_', '')}@clerk.dev`;

      req.userId = userId;
      req.userEmail = userEmail;

      console.log('✅ Authenticated user ID:', userId);
      console.log('✅ Using email:', userEmail);

      next();
    } else {
      console.error('❌ No user ID found in JWT payload');
      res.status(401).json({
        success: false,
        error: 'Invalid authentication token'
      });
      return;
    }
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication error'
    });
  }
};

// Optional auth - sets user info if available but doesn't require it
export const optionalAuth = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = decodeJWTPayload(token);

      if (payload && payload.sub) {
        const userId = payload.sub;
        const userEmail = `${userId.replace('user_', '')}@clerk.dev`;

        req.userId = userId;
        req.userEmail = userEmail;
      }
    }

    next();
  } catch (error) {
    // If auth fails, continue without auth
    next();
  }
};