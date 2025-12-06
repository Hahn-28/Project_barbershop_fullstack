import { Router } from "express";
import { listUsers, updateUserStatus, listWorkers, getMyProfile, updateMyProfile } from "../controllers/users.controller.js";
import { adminOnly, authRequired } from "../middlewares/auth.js";

const router = Router();

router.get("/me", authRequired, getMyProfile);
router.put("/me", authRequired, updateMyProfile);
router.get("/", authRequired, adminOnly, listUsers);
router.get("/workers", authRequired, listWorkers);
router.put("/:id/status", authRequired, adminOnly, updateUserStatus);

export default router;