const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate JWT token and attach user payload to the request
 */
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    // Format is "Bearer <token>"
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey123');
        req.user = decoded; // Attach user payload (id, email, role)
        next();
    } catch (error) {
        console.error("Token verification error:", error);
        return res.status(401).json({ error: "Invalid or expired token." });
    }
};

/**
 * Middleware to restrict access to administrator role only
 */
const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: "Access denied. Administrator privileges required." });
    }
    next();
};

module.exports = {
    authenticateToken,
    isAdmin
};
