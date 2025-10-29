import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

export function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Missing Authorization header' });
  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'Invalid Authorization format' });
  const token = parts[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function optionalAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return next();
  try {
    const parts = auth.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      const payload = jwt.verify(parts[1], process.env.JWT_SECRET || 'dev-secret');
      req.user = payload;
    }
  } catch (err) {
    // ignore token errors for optional auth
  }
  next();
}
