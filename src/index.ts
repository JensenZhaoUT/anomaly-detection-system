import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import anomalyRoutes from "./routes/anomalyRoutes";
import fileUploadRoutes from "./routes/fileUploadRoutes";

const app = express();
const PORT = process.env.PORT || 3000;

// Increase payload size limit
app.use(bodyParser.json({ limit: "500mb" }));
app.use(bodyParser.urlencoded({ limit: "500mb", extended: true }));

app.use(cors());

app.use("/api/anomalies", anomalyRoutes);
app.use("/api/files", fileUploadRoutes);

// Serve model files and static images
app.use("/model", express.static(path.join(__dirname, "model")));
app.use("/static/images", express.static(path.join(__dirname, "../images"))); // This line configures the static file serving

app.use(express.static(path.join(__dirname, "../frontend/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Serving images from: ${path.join(__dirname, "../images")}`);
});
