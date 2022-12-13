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


const app = express();
dotenv.config();

//pat
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads-profile", express.static(path.join(__dirname,"/uploads-profile")))
app.use("/uploads-post", express.static(path.join(__dirname,"/uploads-post")))
// uploads-post
// const {pathname: root} = new URL('../src', import.meta.url)

//2.
connectDB();

app.use(cors());

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


//1. server
app.listen(PORT, () => {
    console.log("server on 4000");
})