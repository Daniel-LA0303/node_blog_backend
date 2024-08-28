import express  from "express";
import connectDB from "./config/db.js";
import dotenv from "dotenv"; 
import cors from "cors"
import multer from "multer";
import path from "path"
import { fileURLToPath } from "url";

import usersRoutes from './routes/usersRoutes.js'
import postsRoutes from './routes/postsRoutes.js'
import categoriesRoutes from './routes/categoriesRoutes.js'
import pagesRoutes from './routes/pagesRoutes.js'
import commentsRoutes from './routes/commentRoutes.js'
import repliesRoutes from './routes/repliesRoutes.js'


const app = express();

connectDB();

app.use(cors());


dotenv.config();

//pat
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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

const PORT = process.env.PORT || 4000;


app.use(express.json());

//ROUNTING
app.use('/api/users', usersRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/pages', pagesRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/replies', repliesRoutes);


//1. server
const server = app.listen(PORT, () => {
    console.log("server on 4000");

})
