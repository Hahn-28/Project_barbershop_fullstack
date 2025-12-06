import { Router } from "express";
import {
  createService,
  deleteService,
  getAllServices,
  updateService,
  getServiceById,
  getServiceStats,
} from "../controllers/services.controller.js";
import { adminOnly, authRequired } from "../middlewares/auth.js";

const router = Router();

// Rutas públicas
router.get("/", getAllServices);

// Rutas de administrador
router.get("/stats", authRequired, adminOnly, getServiceStats);
router.get("/:id", authRequired, adminOnly, getServiceById);
router.post("/", authRequired, adminOnly, createService);
router.put("/:id", authRequired, adminOnly, updateService);
router.delete("/:id", authRequired, adminOnly, deleteService);

export default router;
