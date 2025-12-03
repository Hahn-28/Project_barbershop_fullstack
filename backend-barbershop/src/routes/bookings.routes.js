import { Router } from "express";
import {
  createBooking,
  getAllBookings,
  getMyBookings,
  updateBookingStatus,
} from "../controllers/bookings.controller.js";
import { adminOnly, authRequired } from "../middlewares/auth.js";

const router = Router();

router.post("/", authRequired, createBooking);
router.get("/me", authRequired, getMyBookings);
router.get("/", authRequired, adminOnly, getAllBookings);
router.put("/:id/status", authRequired, adminOnly, updateBookingStatus);

export default router;
