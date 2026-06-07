import dotenv from "dotenv"; 
dotenv.config();

import express  from "express";
import connectDB from "./config/db";
import cors from "cors"
import multer from "multer";
import path from "path"
import { fileURLToPath } from "url";

import usersRoutes from './routes/usersRoutes'
import postsRoutes from './routes/postsRoutes'
import categoriesRoutes from './routes/categoriesRoutes'
import pagesRoutes from './routes/pagesRoutes'
import commentsRoutes from './routes/commentRoutes'
import repliesRoutes from './routes/repliesRoutes'
import messageRoutes from './routes/messageRoutes'
import paymentRoutes from './routes/paymentsRoutes'
import notificationsRoutes from './routes/notificationsRoutes'
import { errorHandler } from "./utils/exception/errorHandler";

import { app, server } from "./socketIO/server";

// const app = express();
connectDB();
app.use(cors());

// alow more mb
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));

//path
const __dirname = path.resolve();
app.use("/uploads-profile", express.static(path.join(__dirname,"/uploads-profile")))
app.use("/uploads-post", express.static(path.join(__dirname,"/uploads-post")))


//configuracion de imagenes
const storage = multer.diskStorage({
    destination:(req, file, cb) => {
        cb(null, "uploads-profile")
    }, filename:(req, file, cb) =>{
        cb(null, req.body.name)
    }  
});


const upload = multer({storage:storage});
app.post("/api/users/uploads-profile", upload.single("image"), (req, res) => {
    res.status(200).json("File has been uploaded")
})

const storage2 = multer.diskStorage({
    destination:(req, file, cb) => {
        cb(null, "uploads-post")
    }, filename:(req, file, cb) =>{
        cb(null, req.body.name)
    }  
});
const upload2 = multer({storage:storage2});
app.post("/api/post/uploads-post", upload2.single("image"), (req, res) => {
    res.status(200).json("File has been uploaded")
})

const PORT = Number(process.env.PORT) || 4000;



//ROUNTING
app.use('/api/users', usersRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/pages', pagesRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/replies', repliesRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/notifications', notificationsRoutes);

app.use(errorHandler);


//1. server
server.listen(PORT, "0.0.0.0", () => {
    console.log("server on 4000");
});
