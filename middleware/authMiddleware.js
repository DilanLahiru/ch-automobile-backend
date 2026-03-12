const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // Get token from header (handle case sensitivity)
  const token = req.headers.authorization || req.headers.Authorization;

  console.log('====================================');
  console.log(token);
  console.log('====================================');

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  // Extract token from "Bearer <token>"
  const extractedToken = token.split(" ")[1];

  try {
    const decoded = jwt.verify(extractedToken, process.env.JWT_SECRET_KEY);
    req.userId = decoded._id;
    next();

    console.log('====================================');
    console.log(decoded);
    console.log('====================================');
  } catch (error) {
    console.log('====================================');
    console.log(error);
    console.log('====================================');
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = { authMiddleware };