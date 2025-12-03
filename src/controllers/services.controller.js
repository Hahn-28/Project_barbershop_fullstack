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
