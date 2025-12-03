import { Router } from "express";
import { createUser, login, register } from "../controllers/auth.controller.js";
import { adminOnly, authRequired } from "../middlewares/auth.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/create-user", authRequired, adminOnly, createUser);

export default router;
