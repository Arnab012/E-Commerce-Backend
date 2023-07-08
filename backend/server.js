const app = require("./app");
const dotenv = require("dotenv");
const connecttoMongo = require("./config/db");

// Handeling  uncaught Error
process.on("uncaughtException", (err) => {
  console.log(`Error ${err.message}`);
  console.log("Server is Sutting down due to Uncaught Exception Error ");

  process.exit(1);
});



// config
dotenv.config({ path: "backend/config/config.env" });
connecttoMongo();

const server = app.listen(process.env.PORT, () => {
  console.log(`server is workung on http://localhost:${process.env.port}`);
});

// unhandeled promise rejectioon

process.on("unhandledRejection", (error) => {
  console.log(`Error ${error.message}`);
  console.log(
    "Server is Suttting Down Due to Some  Unhandled Promise Rejection"
  );

  server.close(() => {
    process.exit(1);
  });
});
