import dotenv from "dotenv"; 
dotenv.config();
import connectDB from "./config/db";
import "./app"
import { server } from "./socketIO/server";

connectDB();
const PORT = Number(process.env.PORT) || 4000;
//1. server
server.listen(PORT, "0.0.0.0", () => {
    console.log("server on 4000");
});


/*import dotenv from "dotenv";
dotenv.config();

console.log("1 - inicio");

import connectDB from "./config/db";

console.log("2 - connectDB importado");

import "./app";

console.log("3 - app importada");

import { server } from "./socketIO/server";

console.log("4 - socket server importado");

connectDB();

console.log("5 - connectDB ejecutado");

const PORT = Number(process.env.PORT) || 4000;

server.listen(PORT, "0.0.0.0", () => {
    console.log("6 - server escuchando");
});*/