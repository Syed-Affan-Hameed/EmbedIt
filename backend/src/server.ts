import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import embeditRouter from "./routes/embedit.routes.js";

dotenv.config();
const app = express();

const PORT = process.env.PORT || 5009;
//middleware to use json throughout our application
app.use(express.json());
// Define allowed origins
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5009", 
  ];
  
  // CORS Middleware
  app.use(
    cors({
      origin: function (origin, callback) {
        if (!origin) return callback(null, true);
  
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        } else {
          return callback(new Error("Not allowed by CORS")); 
        }
      },
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], 
      credentials: true, 
      allowedHeaders: ["Content-Type", "Authorization"], 
    })
  );

  app.use("/api/v1/embedit",embeditRouter);

  app.listen(PORT,()=>{
    console.log("Server is running in the port "+ PORT);
  });

  app.get("/",(req,res)=>{
    res.send("Welcome to the server");
  });