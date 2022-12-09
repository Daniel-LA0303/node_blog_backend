import express  from "express";
import connectDB from "./config/db.js";
import dotenv from "dotenv"; 
import cors from "cors"

import usersRoutes from './routes/usersRoutes.js'
import postsRoutes from './routes/postsRoutes.js'
import categoriesRoutes from './routes/categoriesRoutes.js'


const app = express();
app.use(express.json());
dotenv.config();

//2.
connectDB();

app.use(cors());


const PORT = process.env.PORT || 4000;


//ROUNTING
app.use('/api/users', usersRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/categories', categoriesRoutes);


//1. server
app.listen(PORT, () => {
    console.log("server on 4000");
})