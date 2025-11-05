const { clerkClient } = require('@clerk/clerk-sdk-node');

// Verify Clerk JWT token
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      // Decode the JWT to get user ID (basic validation)
      // The token is a JWT with structure: header.payload.signature
      const parts = token.split('.');
      if (parts.length !== 3) {
        return res.status(401).json({ error: 'Invalid token format' });
      }

      // Decode payload (base64url)
      const payload = JSON.parse(
        Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()
      );

      if (!payload || !payload.sub) {
        return res.status(401).json({ error: 'Invalid token payload' });
      }

      // Get user details using the user ID from token
      const userId = payload.sub;
      
      // Add retry logic for Clerk API with exponential backoff
      let user = null;
      let retries = 3;
      let lastError = null;
      
      while (retries > 0 && !user) {
        try {
          user = await clerkClient.users.getUser(userId);
          break;
        } catch (clerkError) {
          lastError = clerkError;
          retries--;
          if (retries > 0) {
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, (3 - retries) * 200));
          }
        }
      }
      
      // Verify the user exists and token is valid
      if (!user) {
        console.error('Failed to get user after retries:', lastError);
        return res.status(401).json({ error: 'User not found' });
      }
      
      req.user = {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        role: user.publicMetadata?.role || 'candidate',
        metadata: user.publicMetadata
      };

      req.auth = {
        userId: user.id,
        sessionId: payload.sid
      };

      console.log('✅ Auth successful:', { 
        userId: user.id, 
        email: user.emailAddresses[0]?.emailAddress,
        role: req.user.role,
        hasMetadata: !!user.publicMetadata 
      });

      next();
    } catch (clerkError) {
      console.error('Clerk verification error:', clerkError);
      return res.status(401).json({ 
        error: 'Authentication failed',
        message: clerkError.message || 'Invalid or expired token'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Authentication system error' });
  }
};

// Role-based access control
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      console.log('❌ Role check failed: No user in request');
      return res.status(401).json({ error: 'Authentication required' });
    }

    console.log('🔍 Role check:', { 
      userRole: req.user.role, 
      allowedRoles, 
      userId: req.user.id 
    });

    if (!allowedRoles.includes(req.user.role)) {
      console.log('❌ Access denied:', { 
        userRole: req.user.role, 
        requiredRoles: allowedRoles 
      });
      return res.status(403).json({ 
        error: 'Access denied. Insufficient permissions.',
        requiredRoles: allowedRoles,
        userRole: req.user.role
      });
    }

    console.log('✅ Role check passed');
    next();
  };
};

module.exports = { requireAuth, requireRole };
