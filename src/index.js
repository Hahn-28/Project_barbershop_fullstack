import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import authRoutes from "./routes/auth.routes.js";
import bookingRoutes from "./routes/bookings.routes.js";
import serviceRoutes from "./routes/services.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/services", serviceRoutes);
app.use("/bookings", bookingRoutes);

app.get("/", (req, res) => {
  res.send("Booking System API is running");
});

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
