

const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    let token;

    // Check web cookie
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // Check mobile Authorization header
   else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
) {
    token = req.headers.authorization.split(" ")[1];
}
    // No token found
    if (!token) {
      return res.status(401).json({
        message: "Authentication required"
      });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Attach user info to request
    req.user = decoded;

    next();

  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
};


module.exports = authMiddleware;