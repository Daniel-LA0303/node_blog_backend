import jwt  from "jsonwebtoken";
import User from "../models/User.js";

//aqui se auntentica todo antes de mandar la info del perfil
const checkAuth = async (req, res, next) => {

    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        try {
            token = req.headers.authorization.split(' ')[1]; //se obtiene el token que se envio en autenticacion para mostrar informacion
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select("-password -confirmado -token -__v"); //quitamos ciertos campos
            return next();
        } catch (error) {
            return res.status(404).json({msg: 'Hubo un Error'});
        }
    }

    if(!token){
        const error = new Error('Token no valido');
        return res.status(401).json({msg: error.message});
    }

    next();
}

export default checkAuth;