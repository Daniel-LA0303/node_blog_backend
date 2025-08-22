import jwt  from "jsonwebtoken";
import User from "../models/User.js";

//aqui se auntentica todo antes de mandar la info del perfil
const checkAuth = async (req, res, next) => {
    console.log("middleware checkAuth");
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        try {
            token = req.headers.authorization.split(' ')[1]; //se obtiene el token que se envio en autenticacion para mostrar informacion

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select("-password -confirmado -token -__v"); //quitamos ciertos campos
            if(user === null ){
                return res.status(404).json({msg: 'Invalid token'});
            }
            req.user = user;
            return next();
        } catch (error) {
            console.error("Error in checkAuth middleware:", error);
            return res.status(401).json({ msg: 'Invalid or expired token' });
            
        }
    }

    if(!token){
        const error = new Error('Invalid token');
        return res.status(401).json({msg: error.message});
    }

    next();
}

export default checkAuth;