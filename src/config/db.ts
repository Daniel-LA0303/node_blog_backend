import dotenv from "dotenv"; 
dotenv.config();
import mongoose from "mongoose";

// db connection to mongo atlas
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL_WEB as string);
        console.log('db conected');
    } catch (error: any) {
        console.log(`error: ${error.message}`);
        process.exit(1);
    }
}

export default connectDB;