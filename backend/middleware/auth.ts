import { Request, Response, NextFunction } from 'express';

// Extend Express Request interface to include auth data
declare global {
  namespace Express {
    interface Request {
      userEmail?: string;
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

    // Decode base64 payload
    const payload = Buffer.from(parts[1], 'base64').toString('utf-8');
    return JSON.parse(payload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

// Require authentication - check for authorization header
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Check for authorization header (would be set by Clerk on frontend)
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    // Extract token
    const token = authHeader.substring(7); // Remove "Bearer "

    // Decode JWT to get user email
    const payload = decodeJWTPayload(token);

    if (payload && payload.email) {
      req.userEmail = payload.email;
    } else if (payload && payload.primaryEmailAddress) {
      // Clerk sometimes puts email in primaryEmailAddress
      req.userEmail = payload.primaryEmailAddress;
    } else if (payload && payload.email_addresses && payload.email_addresses.length > 0) {
      // Sometimes email is in an array
      req.userEmail = payload.email_addresses[0].email_address || payload.email_addresses[0];
    } else {
      // Fallback to mock email if no email found in token
      req.userEmail = `user-${token.substring(0, 8)}@clerk.com`;
    }

    next();
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

      // Decode JWT to get user email
      const payload = decodeJWTPayload(token);

      if (payload && payload.email) {
        req.userEmail = payload.email;
      } else if (payload && payload.primaryEmailAddress) {
        req.userEmail = payload.primaryEmailAddress;
      } else if (payload && payload.email_addresses && payload.email_addresses.length > 0) {
        req.userEmail = payload.email_addresses[0].email_address || payload.email_addresses[0];
      }
    }

    next();
  } catch (error) {
    // If auth fails, continue without auth
    next();
  }
};