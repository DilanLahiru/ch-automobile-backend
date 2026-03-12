const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const connectDB = require("./config/db");

const customerRoute = require("./routes/customerRoute");
const appointmentRoute = require("./routes/appointmentRoute");
const userRoute = require("./routes/userRoute");
const employeeRoute = require("./routes/employeeRoute");
const productRoute = require("./routes/productRoute");
const categoryRoute = require("./routes/categoryRoute");
const supplierRoute = require("./routes/supplierRoute");
const serviceRecordRoute = require("./routes/serviceRecordRoute");

dotenv.config();

const app = express();

// ✅ CONNECT DATABASE
connectDB();

// ✅ MIDDLEWARE
app.use(express.json());

app.use(cors());

// ✅ ROUTES
app.use("/api/customer", customerRoute);
app.use("/api/appointment", appointmentRoute);
app.use("/api/user", userRoute);
app.use("/api/employee", employeeRoute);
app.use("/api/product", productRoute);
app.use("/api/category", categoryRoute);
app.use("/api/supplier", supplierRoute);
app.use("/api/service-record", serviceRecordRoute);

// ✅ HEALTH CHECK (IMPORTANT)
app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

// ✅ FIXED PORT USAGE
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
