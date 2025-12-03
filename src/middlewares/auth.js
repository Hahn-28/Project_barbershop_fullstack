import jwt from "jsonwebtoken";
import { errorResponse } from "../utils/response.js";

export const authRequired = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return errorResponse(res, "Authorization header missing or invalid", 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return errorResponse(res, "Invalid or expired token", 401, error);
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user.role !== "ADMIN") {
    return errorResponse(res, "Access denied. Admin role required.", 403);
  }
  next();
};

export const workerAllowed = (req, res, next) => {
  if (req.user.role !== "WORKER" && req.user.role !== "ADMIN") {
    return errorResponse(
      res,
      "Access denied. Worker or Admin role required.",
      403
    );
  }
  next();
};
