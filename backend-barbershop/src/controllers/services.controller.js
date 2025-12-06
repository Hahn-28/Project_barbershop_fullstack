import prisma from "../config/prisma.js";
import { errorResponse, successResponse } from "../utils/response.js";

export const getAllServices = async (req, res) => {
  try {
    const services = await prisma.service.findMany();
    return successResponse(res, services, "Services retrieved successfully");
  } catch (error) {
    return errorResponse(res, "Failed to retrieve services", 500, error);
  }
};

export const createService = async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const newService = await prisma.service.create({
      data: { name, description, price: parseFloat(price) },
    });
    return successResponse(
      res,
      newService,
      "Service created successfully",
      201
    );
  } catch (error) {
    return errorResponse(res, "Failed to create service", 500, error);
  }
};

export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price } = req.body;
    const updatedService = await prisma.service.update({
      where: { id: parseInt(id) },
      data: { name, description, price: parseFloat(price) },
    });
    return successResponse(res, updatedService, "Service updated successfully");
  } catch (error) {
    return errorResponse(res, "Failed to update service", 500, error);
  }
};

export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.service.delete({ where: { id: parseInt(id) } });
    return successResponse(res, null, "Service deleted successfully");
  } catch (error) {
    return errorResponse(res, "Failed to delete service", 500, error);
  }
};

// Admin: Obtener detalles de un servicio específico
export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await prisma.service.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    });

    if (!service) {
      return errorResponse(res, "Service not found", 404);
    }

    return successResponse(res, service, "Service fetched successfully");
  } catch (error) {
    return errorResponse(res, "Failed to fetch service", 500, error);
  }
};

// Admin: Obtener estadísticas de servicios
export const getServiceStats = async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    });

    const totalServices = services.length;
    const totalBookings = services.reduce((sum, s) => sum + s._count.bookings, 0);
    const mostPopular = services.sort((a, b) => b._count.bookings - a._count.bookings)[0];

    const stats = {
      totalServices,
      totalBookings,
      mostPopular: mostPopular ? {
        id: mostPopular.id,
        name: mostPopular.name,
        bookingsCount: mostPopular._count.bookings,
      } : null,
      services: services.map(s => ({
        id: s.id,
        name: s.name,
        price: s.price,
        bookingsCount: s._count.bookings,
      })),
    };

    return successResponse(res, stats, "Service stats fetched successfully");
  } catch (error) {
    return errorResponse(res, "Failed to fetch service stats", 500, error);
  }
};
