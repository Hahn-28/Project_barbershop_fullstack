import { Router } from "express";
import { listUsers, updateUserStatus } from "../controllers/users.controller.js";
import { adminOnly, authRequired } from "../middlewares/auth.js";

const router = Router();

router.get("/", authRequired, adminOnly, listUsers);
router.put("/:id/status", authRequired, adminOnly, updateUserStatus);

export default router;