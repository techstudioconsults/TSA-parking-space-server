const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const colors = require("colors");
const cors = require("cors");

const connectDB = require("./src/db/connect");

// Middlewares
const notFound = require("./src/middlewares/notFound");
const error = require("./src/middlewares/error");

// Load env variables
dotenv.config({ path: ".env" });

const app = express();

let corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "https://tsa-car-park.vercel.app",
  ],
};

//Routers Imports
const slotRouter = require("./src/routes/slotRouter");

// Body parser
app.use(express.json());

// middlewares
app.use(cors(corsOptions));

// Routes
app.use("/slot", slotRouter);
app.use(notFound);
app.use(error);

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    console.log(`DB Connected!`);
    app.listen(
      PORT,
      console.log(
        `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
      )
    );
  } catch (error) {
    console.log(`Error Connecting to DB due to ${error.message}`);
  }
};

startServer();
