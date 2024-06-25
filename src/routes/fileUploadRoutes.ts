import { Router } from "express";
import { uploadFile, handleFileUpload } from "../controllers/fileUploadController";

const router = Router();

router.post("/upload", uploadFile, handleFileUpload);

export default router;
