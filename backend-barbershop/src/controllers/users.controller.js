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

export const getMyProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return errorResponse(res, "User not authenticated", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatarUrl: true,
        bio: true,
        specialties: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    return successResponse(res, user, "Profile fetched successfully");
  } catch (error) {
    return errorResponse(res, "Failed to fetch profile", 500, error);
  }
};

export const updateMyProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return errorResponse(res, "User not authenticated", 401);
    }

    const { name, email, phone, bio, avatarUrl, specialties } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(bio && { bio }),
        ...(avatarUrl && { avatarUrl }),
        ...(specialties && { specialties }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatarUrl: true,
        bio: true,
        specialties: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return successResponse(
      res,
      updatedUser,
      "Profile updated successfully"
    );
  } catch (error) {
    return errorResponse(res, "Failed to update profile", 500, error);
  }
};

// Admin: Editar cualquier usuario
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, bio, avatarUrl, specialties, role } = req.body;

    // Validar que el usuario existe
    const userExists = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });

    if (!userExists) {
      return errorResponse(res, "User not found", 404);
    }

    // Si se cambia el email, verificar que no exista otro usuario con ese email
    if (email && email !== userExists.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });
      if (emailExists) {
        return errorResponse(res, "Email already in use", 400);
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(bio && { bio }),
        ...(avatarUrl && { avatarUrl }),
        ...(specialties && { specialties }),
        ...(role && { role }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatarUrl: true,
        bio: true,
        specialties: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return successResponse(
      res,
      updatedUser,
      "User updated successfully"
    );
  } catch (error) {
    return errorResponse(res, "Failed to update user", 500, error);
  }
};

// Admin: Eliminar usuario (soft delete)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el usuario existe
    const userExists = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });

    if (!userExists) {
      return errorResponse(res, "User not found", 404);
    }

    // Evitar que el admin se elimine a sí mismo
    if (req.user && req.user.id === parseInt(id)) {
      return errorResponse(res, "Cannot delete your own account", 400);
    }

    // Soft delete: marcar como inactivo
    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { isActive: false },
    });

    return successResponse(res, null, "User deleted successfully");
  } catch (error) {
    return errorResponse(res, "Failed to delete user", 500, error);
  }
};

// Admin: Obtener detalles de un usuario específico
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatarUrl: true,
        bio: true,
        specialties: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    return successResponse(res, user, "User fetched successfully");
  } catch (error) {
    return errorResponse(res, "Failed to fetch user", 500, error);
  }
};

// Admin: Obtener estadísticas del sistema
export const getSystemStats = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      adminCount,
      workerCount,
      clientCount,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      totalServices,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.user.count({ where: { role: "WORKER" } }),
      prisma.user.count({ where: { role: "CLIENT" } }),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: "PENDING" } }),
      prisma.booking.count({ where: { status: "CONFIRMED" } }),
      prisma.booking.count({ where: { status: "COMPLETE" } }),
      prisma.booking.count({ where: { status: "CANCELLED" } }),
      prisma.service.count(),
    ]);

    const stats = {
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
        admins: adminCount,
        workers: workerCount,
        clients: clientCount,
      },
      bookings: {
        total: totalBookings,
        pending: pendingBookings,
        confirmed: confirmedBookings,
        completed: completedBookings,
        cancelled: cancelledBookings,
      },
      services: {
        total: totalServices,
      },
    };

    return successResponse(res, stats, "System stats fetched successfully");
  } catch (error) {
    return errorResponse(res, "Failed to fetch system stats", 500, error);
  }
};

// Admin: Obtener historial de reservas de un usuario
export const getUserBookingHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const bookings = await prisma.booking.findMany({
      where: { userId: parseInt(id) },
      include: {
        service: true,
        worker: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return successResponse(
      res,
      bookings,
      "User booking history fetched successfully"
    );
  } catch (error) {
    return errorResponse(
      res,
      "Failed to fetch user booking history",
      500,
      error
    );
  }
};
