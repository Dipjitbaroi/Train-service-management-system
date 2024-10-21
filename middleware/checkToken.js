import jwt from "jsonwebtoken";

// Middleware to check the token
export const checkToken = (req, res, next) => {
  // Get token from headers
  const token = req.headers["authorization"]?.split(" ")[1];

  // If there's no token, return 401 Unauthorized
  if (!token) {
    return res
      .status(401)
      .json({ message: "No token provided, authorization denied" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Use your JWT secret here
    req.user = decoded; // Attach user info to request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Token is not valid" });
  }
};
