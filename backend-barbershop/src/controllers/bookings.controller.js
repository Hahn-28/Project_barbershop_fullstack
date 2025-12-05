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

export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["PENDING", "CONFIRMED", "CANCELLED"].includes(status)) {
      return errorResponse(res, "Invalid status", 400);
    }

    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(id) },
      include: { worker: true },
    });

    if (!booking) {
      return errorResponse(res, "Booking not found", 404);
    }

    // Authorization: admin or the assigned worker
    const isAdmin = req.user?.role === "ADMIN";
    const isWorkerOwner = req.user?.role === "WORKER" && booking.workerId === req.user.id;
    if (!isAdmin && !isWorkerOwner) {
      return errorResponse(res, "Not authorized to update this booking", 403);
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: { status },
    });

    return successResponse(
      res,
      updatedBooking,
      "Booking status updated successfully"
    );
  } catch (error) {
    return errorResponse(res, "Failed to update booking status", 500, error);
  }
};
