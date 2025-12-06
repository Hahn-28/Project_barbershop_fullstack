import { Router } from "express";
import { 
  listUsers, 
  updateUserStatus, 
  listWorkers, 
  getMyProfile, 
  updateMyProfile,
  updateUser,
  deleteUser,
  getUserById,
  getSystemStats,
  getUserBookingHistory
} from "../controllers/users.controller.js";
import { adminOnly, authRequired } from "../middlewares/auth.js";

const router = Router();

// Rutas del perfil del usuario autenticado
router.get("/me", authRequired, getMyProfile);
router.put("/me", authRequired, updateMyProfile);

// Rutas públicas/autenticadas
router.get("/workers", authRequired, listWorkers);

// Rutas solo para administradores
router.get("/stats", authRequired, adminOnly, getSystemStats);
router.get("/", authRequired, adminOnly, listUsers);
router.get("/:id", authRequired, adminOnly, getUserById);
router.get("/:id/bookings", authRequired, adminOnly, getUserBookingHistory);
router.put("/:id/status", authRequired, adminOnly, updateUserStatus);
router.put("/:id", authRequired, adminOnly, updateUser);
router.delete("/:id", authRequired, adminOnly, deleteUser);

export default router;