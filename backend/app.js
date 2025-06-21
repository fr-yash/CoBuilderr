import express from "express";
import morgan from "morgan";
import connect from "./db/db.js";
import userRouter from "./routes/user.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import projectRouter from "./routes/project.routes.js";
import aiRouter from "./routes/ai.routes.js";

connect();

const app = express();

// Parse CORS origins from environment variable
const corsOrigins = process.env.FRONTEND_URLS 
  ? process.env.FRONTEND_URLS.split(',').map(url => url.trim())
  : process.env.NODE_ENV === 'production' 
    ? [] // No fallback in production - must be explicitly set
    : ["http://localhost:5173", "http://localhost:5174"]; // Development fallback

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(cors({
    origin: corsOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.get("/",(req,res)=>{
    res.send("Hello World");
})

app.use("/users",userRouter);
app.use("/projects",projectRouter);
app.use("/ai",aiRouter);

export default app;