import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import "colors";
import { connectDB } from "./config/db.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import bodyParser from "body-parser";
import cloudinary from "cloudinary";
import swaggerUi from "swagger-ui-express";
import { userRoutes } from "./routes/userRoute.js";
import { adminRoutes } from "./routes/adminRoute.js";
import { courseRoutes } from "./routes/courseRoute.js";
import { contactRoutes } from "./routes/contactRoute.js";
import { questionRoutes } from "./routes/questionRoute.js";
import { zoomRoutes } from "./routes/zoomRoute.js";
import swaggerDocs from "./config/document.js";
import { bannerRoutes } from "./routes/bannerRoute.js";

dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
// Always show Swagger UI regardless of environment
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
connectDB();

app.use(errorHandler);
app.get("/", (req, res) => {
  res.send("Welcome to the MAKEUP server! Everything is set up and running.");
});

app.use("/api/v1", userRoutes);
app.use("/api/v1", adminRoutes);
app.use("/api/v1", courseRoutes);
app.use("/api/v1", contactRoutes);
app.use("/api/v1", questionRoutes);
app.use("/api/v1", bannerRoutes);
app.use("/api/v1", zoomRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  );
});
