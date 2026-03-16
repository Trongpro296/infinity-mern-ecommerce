import jwt from 'jsonwebtoken'

// Optional auth: sets userId if token provided, otherwise continues without it
const authUserOptional = async (req, res, next) => {
  const { token } = req.headers;

  if (!req.body) req.body = {};

  if (token) {
    try {
      const token_decode = jwt.verify(token, process.env.JWT_SECRET);
      req.body.userId = token_decode.id;
    } catch {
      // Invalid token - just skip silently
    }
  }

  next();
};

export default authUserOptional;
