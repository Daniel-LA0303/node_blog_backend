import dotenv from "dotenv"; 
dotenv.config();
import connectDB from "./config/db";
import "./app"

import { server } from "./socketIO/server";

// const app = express();
connectDB();

const PORT = Number(process.env.PORT) || 4000;
//1. server
server.listen(PORT, "0.0.0.0", () => {
    console.log("server on 4000");
});
