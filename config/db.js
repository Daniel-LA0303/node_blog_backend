import mongoose from "mongoose";


//2. conexion a la db
const connectDB = async () => {
    try {
            await mongoose.connect(process.env.MONGO_URI, 
            {useNewUrlParser: true,
                useUnifiedTopology: true}
        );
        console.log('db conectada');
    } catch (error) {
        console.log(`error: ${error.message}`);
        process.exit(1);
    }
}

export default connectDB;