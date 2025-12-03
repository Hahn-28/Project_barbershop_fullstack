import { Router } from "express";
import {
  createService,
  deleteService,
  getAllServices,
  updateService,
} from "../controllers/services.controller.js";
import { adminOnly, authRequired } from "../middlewares/auth.js";

const router = Router();

router.get("/", getAllServices);
router.post("/", authRequired, adminOnly, createService);
router.put("/:id", authRequired, adminOnly, updateService);
router.delete("/:id", authRequired, adminOnly, deleteService);

export default router;
