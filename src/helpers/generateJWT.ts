import dotenv from "dotenv"; 
dotenv.config();
import jwt from "jsonwebtoken";

// generate a new jwt
const generateJWT = (id: any) => {
    return jwt.sign({
        id
    }, process.env.JWT_SECRET as string,
    {
        expiresIn: "30d"
    })
}

export default generateJWT