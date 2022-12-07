import User from '../models/User.js'
import generateID from '../helpers/generateID.js'
import generateJWT from '../helpers/generateJWT.js'


//registra un user
const registerUser = async (req, res) => {

    //evitar email o usuarios duplicados
    const {email} = req.body;
    const existUser = await User.findOne({email: email});
    
    if(existUser){
        const error = new Error('Este Email ya esta registrado');
        return res.status(400).json({msg: error.message});
    }
    try {
        const user = new User(req.body);
        user.token = generateID();
        await user.save();

        res.json({ msg: "Usuario creado correctamente, revisa tu email para confrimarlo."})
    } catch (error) {
        console.log(error);
    }
}

const authUser = async (req, res) => {

    const {email, password} = req.body;
    //comprobar si el user existe
    const user = await User.findOne({email : email});
    if(!user){
        const error = new Error("Este user no exite");
        return res.status(404).json({msg: error.message});
    }

    //comprobar si el user esta confirmado
    if(!user.confirm){
        const error = new Error("Esta cuanta no ha sido confirmada");
        return res.status(403).json({msg: error.message});
    }

    //comporbar su password
    if(await user.checkPassword(password)){
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            token: generateJWT(user._id) //<-- genera un JWT
        })
        console.log('xd');
    }else{
        const error = new Error("La contraseña es incorrecta");
        return res.status(404).json({msg: error.message});
    }
}

const confirm = async (req, res) => {
    const {token} = req.params;
    //buscar user
    const userConfirm = await User.findOne({token: token});

    if(!userConfirm){
        const error = new Error("Token no valido");
        return res.status(403).json({msg: error.message});
    }
    try {
        userConfirm.confirm = true;
        userConfirm.token = '';
        await   userConfirm.save();
        res.json({msg: "Usuario confirmado correctamente"});
    } catch (error) {
        console.log(error);
    }
}

const forgetPassword = async(req, res) => {
    const {email} = req.body;
    const user = await User.findOne({email: email});
    
    if(!user){
        const error = new Error('Este user no existe');
        return res.status(400).json({msg: error.message});
    }

    try {
        user.token = generateID();
        await user.save();
        res.json({msg: "Hemos enviado un email con las instruccioes"});
    } catch (error) {
        console.log(error);
    }
}

const checkToken = async (req, res) => {
    const {token} = req.params;

    const tokenValid = await User.findOne({token});

    if(tokenValid){
        res.json({msg: "Token valido y el usuario existe"})
    }else{
        const error = new Error('Token no valido');
        return res.status(400).json({msg: error.message});
    }
}

const newPassword = async (req, res) => {
    const {token} = req.params;
    const {password} = req.body;

    const user = await User.findOne({token});

    if(user){
        user.password = password //se asigna el nuevo password
        user.token = '' //se reinicia el token
        try {
            await user.save();
            res.json({msg: "Password Modificado Correctamente"}) 
        } catch (error) {
            console.log(error);
        }

    }else{
        const error = new Error('Token no valido');
        return res.status(400).json({msg: error.message});
    }
}

const profile = async (req, res) => {
    const {user} = req;
    res.json(user);
}


export {
    registerUser,
    authUser,
    confirm,        
    forgetPassword,
    checkToken,
    newPassword,
    profile
}