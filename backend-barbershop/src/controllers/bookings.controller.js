import prisma from "../config/prisma.js";
import { errorResponse, successResponse } from "../utils/response.js";

export const createBooking = async (req, res) => {
  try {
    const { serviceId, date, time, notes, workerId } = req.body;
    
    if (!req.user || !req.user.id) {
      console.error("createBooking - Missing user or user.id");
      return errorResponse(res, "User not authenticated", 401);
    }
    
    const userId = req.user.id;
    console.log("createBooking - userId:", userId, "serviceId:", serviceId, "workerId:", workerId, "date:", date, "time:", time);

    if (!serviceId || !date || !time || !workerId) {
      return errorResponse(res, "Missing required fields: serviceId, workerId, date, time", 400);
    }

    // Validate service exists
    const service = await prisma.service.findUnique({
      where: { id: parseInt(serviceId) },
    });
    if (!service) {
      return errorResponse(res, "Service not found", 404);
    }

    // Validate worker exists and is active
    const worker = await prisma.user.findUnique({
      where: { id: parseInt(workerId) },
    });
    if (!worker || worker.role !== "WORKER" || worker.isActive === false) {
      return errorResponse(res, "Worker not found or inactive", 404);
    }

    // La fecha viene en formato ISO UTC desde el frontend
    const bookingDate = new Date(date);
    console.log("Saving booking with date:", { 
      received: date, 
      parsed: bookingDate.toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone 
    });
    
    const newBooking = await prisma.booking.create({
      data: {
        userId,
        workerId: parseInt(workerId),
        serviceId: parseInt(serviceId),
        date: bookingDate,
        time,
        notes: notes || worker.name,
        status: "PENDING",
      },
      include: {
        service: true,
        worker: true,
      },
    });

    console.log("createBooking - Success, booking ID:", newBooking.id);
    return successResponse(
      res,
      newBooking,
      "Booking created successfully",
      201
    );
  } catch (error) {
    console.error("createBooking - Error:", error);
    return errorResponse(res, "Failed to create booking", 500, error);
  }
};

export const getMyBookings = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return errorResponse(res, "User not authenticated", 401);
    }
    const userId = req.user.id;

    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: { service: true, worker: { select: { id: true, name: true, email: true, phone: true } } },
      orderBy: { date: "asc" },
    });

    return successResponse(res, bookings, "My bookings retrieved successfully");
  } catch (error) {
    console.error("getMyBookings - Error:", error);
    return errorResponse(res, "Failed to retrieve bookings", 500, error);
  }
};

export const getWorkerBookings = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return errorResponse(res, "User not authenticated", 401);
    }

    const workerId = req.user.id;
    const bookings = await prisma.booking.findMany({
      where: { workerId },
      include: {
        service: true,
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
      orderBy: { date: "asc" },
    });

    return successResponse(res, bookings, "Worker bookings retrieved successfully");
  } catch (error) {
    console.error("getWorkerBookings - Error:", error);
    return errorResponse(res, "Failed to retrieve worker bookings", 500, error);
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: { user: true, worker: true, service: true },
    });
    return successResponse(
      res,
      bookings,
      "All bookings retrieved successfully"
    );
  } catch (error) {
    return errorResponse(res, "Failed to retrieve all bookings", 500, error);
  }
};

// Endpoint público para obtener reservas confirmadas de un trabajador específico
export const getWorkerConfirmedBookings = async (req, res) => {
  try {
    const { workerId } = req.params;

    if (!workerId) {
      return errorResponse(res, "Worker ID is required", 400);
    }

    // Verificar que el trabajador existe
    const worker = await prisma.user.findUnique({
      where: { id: parseInt(workerId) },
    });

    if (!worker || worker.role !== "WORKER") {
      return errorResponse(res, "Worker not found", 404);
    }

    // Obtener solo las reservas confirmadas y pendientes (no canceladas) del trabajador
    const bookings = await prisma.booking.findMany({
      where: {
        workerId: parseInt(workerId),
        status: {
          in: ["CONFIRMED", "PENDING"],
        },
      },
      select: {
        id: true,
        date: true,
        time: true,
        status: true,
      },
      orderBy: { date: "asc" },
    });

    return successResponse(res, bookings, "Worker confirmed bookings retrieved successfully");
  } catch (error) {
    console.error("getWorkerConfirmedBookings - Error:", error);
    return errorResponse(res, "Failed to retrieve worker bookings", 500, error);
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log("updateBookingStatus - Received:", { id, status, user: req.user });

    if (!["PENDING", "CONFIRMED", "COMPLETE", "CANCELLED"].includes(status)) {
      console.log("updateBookingStatus - Invalid status:", status);
      return errorResponse(res, "Invalid status", 400);
    }

    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(id) },
      include: { worker: true, user: true },
    });

    console.log("updateBookingStatus - Found booking:", booking);

    if (!booking) {
      return errorResponse(res, "Booking not found", 404);
    }

    // Authorization checks
    const isAdmin = req.user?.role === "ADMIN";
    const isWorkerOwner = req.user?.role === "WORKER" && booking.workerId === req.user.id;
    const isClientOwner = req.user?.role === "CLIENT" && booking.userId === req.user.id;
    
    console.log("updateBookingStatus - Auth checks:", { isAdmin, isWorkerOwner, isClientOwner });

    if (!isAdmin && !isWorkerOwner && !isClientOwner) {
      return errorResponse(res, "Not authorized to update this booking", 403);
    }

    // Clients can only cancel bookings, not confirm or complete them
    if (isClientOwner && !["CANCELLED"].includes(status)) {
      return errorResponse(res, "Clients can only cancel bookings", 403);
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: { status },
    });

    console.log("updateBookingStatus - Success:", updatedBooking);

    return successResponse(
      res,
      updatedBooking,
      "Booking status updated successfully"
    );
  } catch (error) {
    console.error("updateBookingStatus - Error:", error);
    return errorResponse(res, "Failed to update booking status", 500, error);
  }
};

// Admin: Eliminar una reserva completamente
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(id) },
    });

    if (!booking) {
      return errorResponse(res, "Booking not found", 404);
    }

    await prisma.booking.delete({
      where: { id: parseInt(id) },
    });

    return successResponse(res, null, "Booking deleted successfully");
  } catch (error) {
    return errorResponse(res, "Failed to delete booking", 500, error);
  }
};

// Admin: Actualizar cualquier campo de una reserva
export const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { serviceId, workerId, date, time, notes, status } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(id) },
    });

    if (!booking) {
      return errorResponse(res, "Booking not found", 404);
    }

    // Validar servicio si se proporciona
    if (serviceId) {
      const service = await prisma.service.findUnique({
        where: { id: parseInt(serviceId) },
      });
      if (!service) {
        return errorResponse(res, "Service not found", 404);
      }
    }

    // Validar trabajador si se proporciona
    if (workerId) {
      const worker = await prisma.user.findUnique({
        where: { id: parseInt(workerId) },
      });
      if (!worker || worker.role !== "WORKER") {
        return errorResponse(res, "Worker not found", 404);
      }
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: {
        ...(serviceId && { serviceId: parseInt(serviceId) }),
        ...(workerId && { workerId: parseInt(workerId) }),
        ...(date && { date: new Date(date) }),
        ...(time && { time }),
        ...(notes && { notes }),
        ...(status && { status }),
      },
      include: {
        service: true,
        worker: true,
        user: true,
      },
    });

    return successResponse(
      res,
      updatedBooking,
      "Booking updated successfully"
    );
  } catch (error) {
    return errorResponse(res, "Failed to update booking", 500, error);
  }
};

// Admin: Obtener estadísticas de reservas
export const getBookingStats = async (req, res) => {
  try {
    const [
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      todayBookings,
      thisWeekBookings,
      thisMonthBookings,
    ] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({ where: { status: "PENDING" } }),
      prisma.booking.count({ where: { status: "CONFIRMED" } }),
      prisma.booking.count({ where: { status: "COMPLETE" } }),
      prisma.booking.count({ where: { status: "CANCELLED" } }),
      prisma.booking.count({
        where: {
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),
      prisma.booking.count({
        where: {
          date: {
            gte: new Date(new Date().setDate(new Date().getDate() - 7)),
          },
        },
      }),
      prisma.booking.count({
        where: {
          date: {
            gte: new Date(new Date().setDate(1)),
          },
        },
      }),
    ]);

    const stats = {
      total: totalBookings,
      byStatus: {
        pending: pendingBookings,
        confirmed: confirmedBookings,
        completed: completedBookings,
        cancelled: cancelledBookings,
      },
      byPeriod: {
        today: todayBookings,
        thisWeek: thisWeekBookings,
        thisMonth: thisMonthBookings,
      },
    };

    return successResponse(res, stats, "Booking stats fetched successfully");
  } catch (error) {
    return errorResponse(res, "Failed to fetch booking stats", 500, error);
  }
};
