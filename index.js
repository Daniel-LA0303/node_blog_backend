import express  from "express";
import connectDB from "./config/db.js";
import dotenv from "dotenv"; 

const app = express();
app.use(express.json());
dotenv.config();

//2.
connectDB();


const PORT = process.env.PORT || 4000;


//1. server
app.listen(PORT, () => {
    console.log("server on 4000");
})