import prisma from "../config/prisma.js";
import { errorResponse, successResponse } from "../utils/response.js";

export const listUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        avatarUrl: true,
        bio: true,
        specialties: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { id: "asc" },
    });
    return successResponse(res, users, "Users fetched successfully");
  } catch (error) {
    return errorResponse(res, "Failed to fetch users", 500, error);
  }
};

export const listWorkers = async (req, res) => {
  try {
    const workers = await prisma.user.findMany({
      where: { role: "WORKER", isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatarUrl: true,
        bio: true,
        specialties: true,
      },
      orderBy: { id: "asc" },
    });
    return successResponse(res, workers, "Workers fetched successfully");
  } catch (error) {
    return errorResponse(res, "Failed to fetch workers", 500, error);
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return errorResponse(res, "'isActive' must be boolean", 400);
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { isActive },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    return successResponse(
      res,
      updatedUser,
      "User status updated successfully"
    );
  } catch (error) {
    return errorResponse(res, "Failed to update user status", 500, error);
  }
};
