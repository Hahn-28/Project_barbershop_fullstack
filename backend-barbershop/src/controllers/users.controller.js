import prisma from "../config/prisma.js";
import { errorResponse, successResponse } from "../utils/response.js";

export const listUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
      orderBy: { id: "asc" },
    });
    return successResponse(res, users, "Users fetched successfully");
  } catch (error) {
    return errorResponse(res, "Failed to fetch users", 500, error);
  }
};

export const updateUserStatus = async (req, res) => {
  // NOTE: Schema lacks an 'active' field. Return guidance.
  try {
    const { id } = req.params;
    const { active } = req.body;
    if (typeof active !== "boolean") {
      return errorResponse(res, "'active' must be boolean", 400);
    }
    return errorResponse(
      res,
      "Not implemented: add boolean 'active' to User model in Prisma schema and migrate, then update controller to toggle it.",
      400
    );
  } catch (error) {
    return errorResponse(res, "Failed to update user status", 500, error);
  }
};