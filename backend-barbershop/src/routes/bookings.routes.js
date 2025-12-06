import { Router } from "express";
import {
  createBooking,
  getAllBookings,
  getMyBookings,
  getWorkerBookings,
  getWorkerConfirmedBookings,
  updateBookingStatus,
  deleteBooking,
  updateBooking,
  getBookingStats,
} from "../controllers/bookings.controller.js";
import { adminOnly, authRequired, workerAllowed } from "../middlewares/auth.js";

const router = Router();

// Rutas de usuario autenticado
router.post("/", authRequired, createBooking);
router.get("/me", authRequired, getMyBookings);

// Rutas de trabajador
router.get("/worker", authRequired, workerAllowed, getWorkerBookings);
router.get("/worker/:workerId/confirmed", getWorkerConfirmedBookings); // Ruta pública

// Rutas de administrador
router.get("/stats", authRequired, adminOnly, getBookingStats);
router.get("/", authRequired, adminOnly, getAllBookings);
router.put("/:id/status", authRequired, updateBookingStatus);
router.put("/:id", authRequired, adminOnly, updateBooking);
router.delete("/:id", authRequired, adminOnly, deleteBooking);

export default router;

