import express  from "express";
import connectDB from "./config/db.js";
import dotenv from "dotenv"; 
import usersRoutes from './routes/usersRoutes.js'
import postsRoutes from './routes/postsRoutes.js'


const app = express();
app.use(express.json());
dotenv.config();

//2.
connectDB();


const PORT = process.env.PORT || 4000;


//ROUNTING
app.use('/api/users', usersRoutes);
app.use('/api/posts', postsRoutes);


//1. server
app.listen(PORT, () => {
    console.log("server on 4000");
})