import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import anomalyRoutes from "./routes/anomalyRoutes";
import fileUploadRoutes from "./routes/fileUploadRoutes";

const app = express();
const PORT = process.env.PORT || 3000;

// Increase payload size limit
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use(cors());

app.use("/api/anomalies", anomalyRoutes);
app.use("/api/files", fileUploadRoutes);

// Serve model files and static images
app.use("/model", express.static(path.join(__dirname, "model")));
app.use("/static/images", express.static(path.join(__dirname, "images")));

app.use(express.static(path.join(__dirname, "../frontend/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
