import User from '../models/User.js'
import generateID from '../helpers/generateID.js'
import generateJWT from '../helpers/generateJWT.js'
import { emailRegister, emailNewPassword } from '../helpers/email.js'
import { fileURLToPath } from "url";
import path from "path"
import fs from "fs-extra"
import Categories from '../models/Categories.js';
import { deleteImage, uploadImage } from '../config/cloudinary.js';


//registra un user
const registerUser = async (req, res) => {

    //evitar email o usuarios duplicados
    const {email} = req.body;
    const existUser = await User.findOne({email: email});
    
    if(existUser){
        const error = new Error('This email is already registered');
        return res.status(400).json({msg: error.message});
    }
    try {
        const user = new User(req.body);
        user.token = generateID();
        await user.save();

        emailRegister({
            email: user.email,
            name: user.name,
            token: user.token
        })

        res.json({ msg: "User created correctly, check your email to confirm."})
    } catch (error) {
        console.log(error);
    }
}

const authUser = async (req, res) => {

    const {email, password} = req.body;
    //comprobar si el user existe
    const user = await User.findOne({email : email});
    if(!user){
        const error = new Error("This user does not exist");
        return res.status(404).json({msg: error.message});
    }

    //comprobar si el user esta confirmado
    if(!user.confirm){
        const error = new Error("This account has not been confirmed");
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
    }else{
        const error = new Error("Your password is incorrect");
        return res.status(404).json({msg: error.message});
    }
}

const confirm = async (req, res) => {
    const {token} = req.params;
    //buscar user
    const userConfirm = await User.findOne({token: token});

    if(!userConfirm){
        const error = new Error("Invalid token");
        return res.status(403).json({msg: error.message});
    }
    try {
        userConfirm.confirm = true;
        userConfirm.token = '';
        await userConfirm.save();
        res.json({msg: "User confirmed correctly"});
    } catch (error) {
        console.log(error);
    }
}

const forgetPassword = async(req, res) => {
    const {email} = req.body;
    const user = await User.findOne({email: email});
    
    if(!user){
        const error = new Error('This user does not exist');
        return res.status(400).json({msg: error.message});
    }

    try {
        user.token = generateID();
        await user.save();
        emailNewPassword({
            email: user.email,
            name: user.name,
            token: user.token
        })
        res.json({msg: "We have sent an email with instructions"});
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
            res.json({msg: "Password Modified Correctly"}) 
        } catch (error) {
            console.log(error);
        }
    }else{
        const error = new Error('Invalid token');
        return res.status(400).json({msg: error.message});
    }
}

const newInfoUser = async (req, res) => {
    const{id} = req.params;
    // const user = await User.findById(id);
    console.log(id);
    console.log(req.body);
    console.log(req.files);
    // if(user){

        try {
            const user = await User.findById(id);
            //cuando inserta una nueva imagen tienen que eliminar la anterior
            if(req.body.previousName){
                if((req.body.previousName !== "")){
                    //el usuario inserto una nueva imagen, la pasada se elimina
                    await deleteImage(req.body.previousName) 
                    // const __filename = fileURLToPath(import.meta.url);
                    // const __dirname = path.dirname(__filename);
                    // console.log(__dirname);
                    // fs.unlinkSync(__dirname+`/../uploads-profile/${req.body.previousName}`);
                }
            }
            //agrega la nueva imagen
            if(req.files?.image){
                const result = await uploadImage(req.files.image.tempFilePath)
                user.profilePicture = {
                    public_id: result.public_id, //para eliminar el archivo cuando se requiera
                    secure_url: result.secure_url //para consultar el archivo
                } 
                await fs.unlink(req.files.image.tempFilePath)
            }
            //cuando el usuario decidio no cambiar la imagen
            if(req.body.profilePicture){
                const profilePicture = JSON.parse(req.body.profilePicture)
                user.profilePicture = profilePicture
            }
            
            user.info = {
                desc: req.body.desc,
                work: req.body.work,
                education: req.body.education,
                skills: req.body.skills
            }
            
            await user.save();
            res.json({msg: "User modified"}) 
        } catch (error) {
            console.log(error);
        }
    // }
    // else{
    //     const error = new Error('Invalid token');
    //     return res.status(400).json({msg: error.message});
    // }
    
}

const getOneUser = async (req, res, next) =>{
    try {
        const user = await User.findById(req.params.id).populate({
            path: "postsSaved",
            populate: {
                path: "posts",
                populate:{
                    path: "user"
                }
            }
        }).populate({
            path: "followsTags",
            populate: {
                path: "tags",

            }
        }).populate({
            path: "likePost",
            populate: {
                path: "posts",

            }
        })
        res.json(user);            
    } catch (error) {
        console.log(error);
        res.json({msg: 'This post does not exist'});
        next();
    }    
}

const getOneUserFollow = async (req, res, next) =>{
    try {
        const user = await User.findById(req.params.id).populate({
            path: "followersUsers",
            populate: {
                path: "followers",
            }
        }).populate({
            path: "followedUsers",
            populate: {
                path: "followed",
            }
        })
        res.json(user);            
    } catch (error) {
        console.log(error);
        res.json({msg: 'This post does not exist'});
        next();
    }    
}


const saveFollowTag = async  (req, res) => {
    const category = await Categories.findById(req.body._id)
    const user = await User.findById(req.params.id)


    const userFound = category.follows.users.includes(user._id);
    const categoryFound = user.followsTags.tags.includes(category._id);
    if(userFound && categoryFound){

        const arrayC = category.follows.users;
        const indexCat = arrayC.indexOf(user._id);
        arrayC.splice(indexCat, 1);
        category.follows.users = arrayC;
        category.follows.countFollows = category.follows.countFollows -1
        
        const arrayU = user.followsTags.tags;
        const indexU = arrayU.indexOf(category._id);
        arrayU.splice(indexU, 1);
        user.followsTags.tags = arrayU;
        user.followsTags.countTags = user.followsTags.countTags -1

        await user.save();
        await category.save();
    }else{
        const newUserOnCategory = [...category.follows.users, user._id]
        category.follows.users = newUserOnCategory;
        category.follows.countFollows = category.follows.countFollows + 1;

        const newCategoryOnUser = [...user.followsTags.tags, category._id];
        user.followsTags.tags = newCategoryOnUser;
        user.followsTags.countTags = user.followsTags.countTags +1

        await user.save();
        await category.save();

    }
}

const followAndFollowed = async (req, res) => {

    const userFollowed =  await User.findById(req.params.id); //usuario para seguir
    const userProfile =  await User.findById(req.body._id); //usuario que solicita seguir

    const userFollowedFound = userFollowed.followersUsers.followers.includes(userProfile._id);
    const userProfileFound = userProfile.followedUsers.followed.includes(userFollowed._id);

    if(userFollowedFound && userProfileFound){
        const arrayUF = userFollowed.followersUsers.followers;
        const indexUP = arrayUF.indexOf(userProfile._id);
        arrayUF.splice(indexUP, 1);
        userFollowed.followersUsers.followers = arrayUF;
        userFollowed.followersUsers.conutFollowers = userFollowed.followersUsers.conutFollowers - 1;

        const arrayUP = userProfile.followedUsers.followed;
        const indexUF = arrayUP.indexOf(userFollowed._id);
        arrayUP.splice(indexUF, 1);
        userProfile.followedUsers.followed = arrayUP;
        userProfile.followedUsers.conutFollowed =  userProfile.followedUsers.conutFollowed - 1

        await userFollowed.save();
        await userProfile.save();
    }else{

        const newUserFollowed = [...userFollowed.followersUsers.followers, userProfile._id]
        userFollowed.followersUsers.followers = newUserFollowed;
        userFollowed.followersUsers.conutFollowers = userFollowed.followersUsers.conutFollowers + 1

        const newUserProfile = [...userProfile.followedUsers.followed, userFollowed._id]
        userProfile.followedUsers.followed = newUserProfile;
        userProfile.followedUsers.conutFollowed =  userProfile.followedUsers.conutFollowed + 1

        await userFollowed.save();
        await userProfile.save();
    }

}

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json(error);
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
    newInfoUser,
    getOneUser,
    getOneUserFollow,
    saveFollowTag,
    followAndFollowed,
    getAllUsers,
    // getOneUserWPS,
    profile
}