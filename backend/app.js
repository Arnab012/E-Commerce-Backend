const express = require("express");
const cookieParser = require("cookie-parser");

const app = express();
app.use(express.json());
app.use(cookieParser());

// route imports

const Product = require("./routes/productsRoute");
const user = require("./routes/userRoute");
const Order = require("./routes/orderRoute");
app.use("/api/v1", Product);

app.use("/api/v1", user);
app.use("/api/v1", Order);

module.exports = app;
