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
app.use('/api/pages', pagesRoutes);


//1. server
const server = app.listen(PORT, () => {
    console.log("server on 4000");

})


// Socket.io
// import { Server } from "socket.io";

// const io = new Server(server, {
//     pingTimeout: 60000,
//     cors: {
//       origin: 'http://127.0.0.1:5173',
//     },
// });

// io.on("connection", (socket) => {
//     console.log("a user connected"); 

//     socket.on('newComment', (data) => {
//         console.log("newComment", data);
//         const userID = data.userID;
//         socket.emit('newNotification', data);
//         console.log('envio');
//     });

// });