import prisma from "../config/prisma.js";
import { errorResponse, successResponse } from "../utils/response.js";

export const createBooking = async (req, res) => {
  try {
    const { serviceId, date, time, notes } = req.body;
    const userId = req.user.id;

    // Validate service exists
    const service = await prisma.service.findUnique({
      where: { id: parseInt(serviceId) },
    });
    if (!service) {
      return errorResponse(res, "Service not found", 404);
    }

    const newBooking = await prisma.booking.create({
      data: {
        userId,
        serviceId: parseInt(serviceId),
        date: new Date(date),
        time,
        notes,
        status: "PENDING",
      },
    });

    return successResponse(
      res,
      newBooking,
      "Booking created successfully",
      201
    );
  } catch (error) {
    return errorResponse(res, "Failed to create booking", 500, error);
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: { service: true },
    });
    return successResponse(res, bookings, "My bookings retrieved successfully");
  } catch (error) {
    return errorResponse(res, "Failed to retrieve bookings", 500, error);
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: { user: true, service: true },
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
