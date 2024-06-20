import mongoose from "mongoose";


//2. conexion a la db
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL_WEB, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // maxPoolSize: 10 // Configura el tamaño del pool de conexiones
        });
        console.log('db conectada');
    } catch (error) {
        console.log(`error: ${error.message}`);
        process.exit(1);
    }
}

export default connectDB;