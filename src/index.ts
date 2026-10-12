import "./config/env";
import connectDB from "./config/db";
import "./app";
import { initRedis, server } from "./socketIO/server";

console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("PRODUCTION:", process.env.PRODUCTION);
console.log("SMTP_HOST:", process.env.SMTP_HOST);
console.log("SMTP_PORT:", process.env.SMTP_PORT);
console.log("SMTP_USER:", process.env.SMTP_USER);
console.log("SMTP_PASS:", process.env.SMTP_PASS ? "(defined)" : "(empty)");
console.log("MAIL_FROM:", process.env.MAIL_FROM);
console.log("FRONTEND_URL:", process.env.FRONTEND_URL);
console.log("FRONTEND_URL_WEB:", process.env.FRONTEND_URL_WEB);

const PORT = Number(process.env.PORT) || 4000;

const start = async () => {
    await connectDB();
    await initRedis();
    server.listen(PORT, "0.0.0.0", () => {
        console.log(`server on ${PORT}`);
    });
};

start().catch((err) => {
    console.error("Startup error:", err);
    process.exit(1);
});