import { Router } from "express";
import {
  createUser,
  googleAuth,
  googleCallback,
  login,
  register,
} from "../controllers/auth.controller.js";
import { adminOnly, authRequired } from "../middlewares/auth.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/create-user", authRequired, adminOnly, createUser);

// Rutas para Google OAuth
router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);

export default router;
