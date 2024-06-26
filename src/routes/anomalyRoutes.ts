import { Router } from "express";
import {
  getAllAnomalies,
  createNewAnomaly,
  getAnomaly,
} from "../controllers/anomalyController";

import { saveUploadedAnomalies } from "../controllers/fileUploadController"; // Import the renamed function

const router = Router();

router.get("/", getAllAnomalies);
router.post("/", createNewAnomaly);
router.get("/:id", getAnomaly);
router.post("/save", saveUploadedAnomalies); // Use the renamed function

export default router;
