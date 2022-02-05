import express from "express";
import cors from "cors";

import setUpRoutes from "./routes";
//from env variable
const PORT = process.env.PORT;
//initiating express
const app = express();
//necessary middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
//all routes are in one file for now
setUpRoutes(app);
//landing route
app.use("/", (req, res) => {
  res.send("Welcome to Fynd Movies API");
});
//error middleware
app.use((err, req, res, next) => {
  return res.status(500).json({
    status: "FAILURE",
    message: err.message,
  });
});
//starting server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on port ${PORT}`);
});
