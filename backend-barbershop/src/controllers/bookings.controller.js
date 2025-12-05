import prisma from "../config/prisma.js";
import { errorResponse, successResponse } from "../utils/response.js";

export const createBooking = async (req, res) => {
  try {
    const { serviceId, date, time, notes } = req.body;
    
    if (!req.user || !req.user.id) {
      console.error("createBooking - Missing user or user.id");
      return errorResponse(res, "User not authenticated", 401);
    }
    
    const userId = req.user.id;
    console.log("createBooking - userId:", userId, "serviceId:", serviceId, "date:", date, "time:", time);

    if (!serviceId || !date || !time) {
      return errorResponse(res, "Missing required fields: serviceId, date, time", 400);
    }

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
        notes: notes || "",
        status: "PENDING",
      },
      include: {
        service: true,
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
    console.log("getMyBookings - req.user:", req.user);
    
    if (!req.user || !req.user.id) {
      console.error("getMyBookings - Missing user or user.id");
      return errorResponse(res, "User not authenticated", 401);
    }
    
    const userId = req.user.id;
    console.log("getMyBookings - Fetching bookings for userId:", userId);
    
    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: { service: true },
    });
    
    console.log("getMyBookings - Found bookings:", bookings.length);
    return successResponse(res, bookings, "My bookings retrieved successfully");
  } catch (error) {
    console.error("getMyBookings - Error:", error);
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
