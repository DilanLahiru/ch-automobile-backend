/**
 * Main Application Server
 * Initializes Express server, connects to database, and sets up routes
 */

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const connectDB = require("./config/db");
const logger = require("./utils/logger");
const { errorHandler } = require("./utils/errorHandler");

// Import routes
const customerRoute = require("./routes/customerRoute");
const appointmentRoute = require("./routes/appointmentRoute");
const userRoute = require("./routes/userRoute");
const employeeRoute = require("./routes/employeeRoute");
const productRoute = require("./routes/productRoute");
const categoryRoute = require("./routes/categoryRoute");
const supplierRoute = require("./routes/supplierRoute");
const serviceRecordRoute = require("./routes/serviceRecordRoute");
const serviceTypeRoute = require("./routes/serviceTypeRoute");

// Load environment variables
dotenv.config();

// Set default NODE_ENV if not provided
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Validate required environment variables
const requiredEnvVars = ['MongoDB_URL', 'JWT_SECRET_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  logger.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

const app = express();

// ✅ CONNECT DATABASE
logger.info('Connecting to database...');
connectDB();

// ✅ MIDDLEWARE
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

// Request logging middleware
app.use((req, res, next) => {
  logger.debug(`${req.method} ${req.path}`);
  next();
});

// ✅ ROUTES
app.use("/api/customer", customerRoute);
app.use("/api/appointment", appointmentRoute);
app.use("/api/user", userRoute);
app.use("/api/employee", employeeRoute);
app.use("/api/product", productRoute);
app.use("/api/category", categoryRoute);
app.use("/api/supplier", supplierRoute);
app.use("/api/service-record", serviceRecordRoute);
app.use("/api/service-type", serviceTypeRoute);

// ✅ HEALTH CHECK ENDPOINT
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

// ✅ 404 NOT FOUND HANDLER
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.path} not found`,
  });
});

// ✅ GLOBAL ERROR HANDLER (Must be last middleware)
app.use(errorHandler);

// ✅ START SERVER
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', err);
  process.exit(1);
});

module.exports = server;
