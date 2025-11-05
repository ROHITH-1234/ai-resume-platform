const express = require('express');
const router = express.Router();
const { clerkClient } = require('@clerk/clerk-sdk-node');
const { requireAuth } = require('../middleware/auth.middleware');

// Sync user role with Clerk metadata
router.post('/sync-role', async (req, res) => {
  try {
    const { userId, role } = req.body;
    
    if (!userId || !role) {
      return res.status(400).json({ error: 'userId and role required' });
    }

    if (!['admin', 'recruiter', 'candidate'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: { role }
    });

    res.json({ success: true, message: 'Role updated' });
  } catch (error) {
    console.error('Role sync error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Secure variant: set role for the current authenticated user
router.post('/sync-role/me', requireAuth, async (req, res) => {
  try {
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ error: 'role is required' });
    }

    if (!['admin', 'recruiter', 'candidate'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const userId = req.user.id;

    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: { role }
    });

    res.json({ success: true, message: 'Role updated', role });
  } catch (error) {
    console.error('Role sync (me) error:', error);
    res.status(500).json({ error: error.message || 'Failed to update role' });
  }
});

// Get user info
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const session = await clerkClient.sessions.verifySession(token);
    const user = await clerkClient.users.getUser(session.userId);

    res.json({
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      name: `${user.firstName} ${user.lastName}`,
      role: user.publicMetadata?.role || 'candidate',
      metadata: user.publicMetadata
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
});

module.exports = router;
