const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    console.log('Auth middleware - Verifying token');
    
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified:', {
      userId: verified.userId,
      headers: req.headers,
      token: token.substring(0, 10) + '...' // Log only first 10 chars for security
    });
    
    req.user = verified;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(401).json({ message: 'Token verification failed' });
  }
};

module.exports = auth; 