import { Router } from "express";
import {
  createBooking,
  getAllBookings,
  getMyBookings,
  getWorkerBookings,
  updateBookingStatus,
} from "../controllers/bookings.controller.js";
import { adminOnly, authRequired, workerAllowed } from "../middlewares/auth.js";

const router = Router();

router.post("/", authRequired, createBooking);
router.get("/me", authRequired, getMyBookings);
router.get("/worker", authRequired, workerAllowed, getWorkerBookings);
router.get("/", authRequired, adminOnly, getAllBookings);
router.put("/:id/status", authRequired, updateBookingStatus);

export default router;
