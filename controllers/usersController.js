import User from '../models/User.js'
import generateID from '../helpers/generateID.js'
import generateJWT from '../helpers/generateJWT.js'
import { emailRegister, emailNewPassword } from '../helpers/email.js'
import { fileURLToPath } from "url";
import path from "path"
import fs from "fs-extra"
import Categories from '../models/Categories.js';
import { deleteImage, uploadImage } from '../config/cloudinary.js';
import { log } from 'console';


// --- Auth Users start --//
const registerUser = async (req, res) => {

    try {
        // throw new Error("Simulated error in getUserPosts");
        const {email} = req.body;
        const existUser = await User.findOne({email: email});
        
        if(existUser){
            const error = new Error('This email is already registered');
            return res.status(400).json({msg: error.message});
        }
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
        res.status(500).json({ error: 'Error', msg: error.message});
    }
}

const authUser = async (req, res) => {
    try {
        
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
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error', msg: error.message});
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
    try {
        // throw new Error("Simulated error in getUserPosts");
        const {email} = req.body;
        const user = await User.findOne({email: email});
        
        if(!user){
            const error = new Error('This user does not exist');
            return res.status(400).json({msg: error.message});
        }
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
        res.status(500).json({ error: 'Error', msg: error.message});
    }
}

const checkToken = async (req, res) => {
    try {
        const {token} = req.params;

        const tokenValid = await User.findOne({token});

        if(tokenValid){
            res.json({msg: "Token valido y el usuario existe"})
        }else{
            const error = new Error('Token no valido');
            return res.status(400).json({msg: error.message});
        }
    } catch (error) {
        console.log(error);   
    }
}

const newPassword = async (req, res) => {
    try {
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
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error', msg: error.message });
    }
}

const profile = async (req, res) => {
    const {user} = req;
    res.json(user);
}

// -- Auth Users end --//

// -- Users CRUD actions start --//
const newInfoUser = async (req, res) => {
    const{id} = req.params;
    // const user = await User.findById(id);
    console.log(id);
    console.log(req.body);
    console.log(req.files);
    // if(user){

        try {
            // throw new Error("Simulated error in getUserPosts");
            const user = await User.findById(id);
            if(req.params.id !== req.query.user){
                return res.status(401).json({ error: 'Error', msg: "Unauthorized" });
            }
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
            res.status(500).json({ error: 'Error', msg: error.message });
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

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json(error);
    }
}

// -- Users CRUD actions end --//

// -- Actions beetween Users start --/

  const followTag = async (req, res) => {
    try {
      const categoryId = req.body._id; // ID de la categoría
      const userId = req.params.id; // ID del usuario
  
      await Categories.findByIdAndUpdate(
        categoryId,
        {
          $addToSet: { 'follows.users': userId },
          $inc: { 'follows.countFollows': 1 },
        },
        { new: true }
      );
  
      await User.findByIdAndUpdate(
        userId,
        {
          $addToSet: { 'followsTags.tags': categoryId },
          $inc: { 'followsTags.countTags': 1 },
        },
        { new: true }
      );
  
      res.status(200).json({ message: 'Follow tag updated successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error', msg: error.message});
    }
  };

  const unFollowTag = async (req, res) => {
    try {
      const categoryId = req.body._id; // ID de la categoría
      const userId = req.params.id; // ID del usuario
  
      await Categories.findByIdAndUpdate(
        categoryId,
        {
          $pull: { 'follows.users': userId },
          $inc: { 'follows.countFollows': -1 },
        },
        { new: true }
      );
  
      await User.findByIdAndUpdate(
        userId,
        {
          $pull: { 'followsTags.tags': categoryId },
          $inc: { 'followsTags.countTags': -1 },
        },
        { new: true }
      );
  
      res.status(200).json({ message: 'Unfollow tag updated successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error', msg: error.message});
    }
  };
  
const followUser = async (req, res) => {
    try {
      const userFollowedId = req.params.id; // ID del usuario a seguir
      const userProfileId = req.body._id; // ID del usuario que solicita seguir

    //   throw new Error("Simulated error in getUserPosts");
  
      const userFollowed = await User.findByIdAndUpdate(
        userFollowedId,
        {
          $addToSet: { 'followersUsers.followers': userProfileId },
          $inc: { 'followersUsers.conutFollowers': 1 },
        },
        { new: true }
      );
  
      const userProfile = await User.findByIdAndUpdate(
        userProfileId,
        {
          $addToSet: { 'followedUsers.followed': userFollowedId },
          $inc: { 'followedUsers.conutFollowed': 1 },
        },
        { new: true }
      );
  
      res.status(200).json({ message: 'Usuario seguido con éxito' });
    } catch (error) {
      res.status(500).json({ error: 'Error interno del servidor', msg: error.message });
    }
  };

  const unfollowUser = async (req, res) => {
    try {
      const userFollowedId = req.params.id; // ID del usuario a dejar de seguir
      const userProfileId = req.body._id; // ID del usuario que solicita dejar de seguir
        // throw new Error("Simulated error in getUserPosts");
      const userFollowed = await User.findByIdAndUpdate(
        userFollowedId,
        {
          $pull: { 'followersUsers.followers': userProfileId },
          $inc: { 'followersUsers.conutFollowers': -1 },
        },
        { new: true }
      );
  
      const userProfile = await User.findByIdAndUpdate(
        userProfileId,
        {
          $pull: { 'followedUsers.followed': userFollowedId },
          $inc: { 'followedUsers.conutFollowed': -1 },
        },
        { new: true }
      );
  
      res.status(200).json({ message: 'Dejaste de seguir al usuario' });
    } catch (error) {
      res.status(500).json({ error: 'Error interno del servidor', msg: error.message });
    }
  };
  
// -- Actions beetween Users end --/

/**
 * Get user info for dashboard
 */
const getOneUserShortInfo = async (id) => {
    try {
        const userData = await User.findById(id)
            .select('posts followersUsers likePost postsSaved followsTags followedUsers')
            .populate('posts')
            .populate('followersUsers.followers')
            .populate('likePost.posts')
            .populate('postsSaved.posts')
            .populate('followsTags.tags')
            .populate('followedUsers.followed');

        const responseData = {
            postsCount: userData.posts.length,
            followersCount: userData.followersUsers.followers.length,
            likePostsCount: userData.likePost.posts.length,
            savedPostsCount: userData.postsSaved.posts.length,
            tagsCount: userData.followsTags.tags.length,
            followedUsersCount: userData.followedUsers.followed.length,
        };
        return responseData;
                
    } catch (error) {

    }   
}

/**
 * Get user posts for dashboard
 * @param {*} id 
 * @returns 
 */
const getUserPosts = async (id) => {
    try {
        const user = await User.findById(id)
            .populate({
                path: "posts",
                populate: {
                    path: "user",
                    select: 'name _id profilePicture'
                },
                select: 'title linkImage categoriesPost _id user likePost commenstOnPost date comments'
            })
        return user.posts;
    } catch (error) {
        console.error("Error in getUserPosts:", error);
        throw new Error('Error to find users posts');
    }
}

/**
 * Get user followers and followed for dashboard
 * @param {*} id 
 * @returns 
 */
const getOneUserFollow = async (id) =>{
    try {
        const user = await User.findById(id).populate({
            path: "followersUsers",
            populate: {
                path: "followers",
                select: 'name email profilePicture followersUsers followedUsers'
            },
            select: 'followers followed'
        })
        .populate({
            path: "followedUsers",
            populate: {
                path: "followed",
                select: 'name email profilePicture followedUsers followersUsers'
            },
            select: 'followers followed'
        })
        const response = {
            followers: user.followersUsers.followers,
            followed: user.followedUsers.followed
        };
        return response;          
    } catch (error) {

    }    
}

/**
 * Get user like posts for dashboard
 * @param {*} id 
 * @returns 
 */
const getUserLikePosts= async (id) => {
    try {
        const user = await User.findById(id).populate({
            path: "likePost",
            populate: {
                path: "posts",
                populate: {
                    path: "user",
                    select: 'name _id profilePicture'
                },
                select : 'title linkImage categoriesPost _id user likePost commenstOnPost date comments'
            }
        })
        return user.likePost.posts;
    } catch (error) {
       
    }    
}

/**
 * Get user save posts for dashboard
 * @param {*} id 
 * @returns 
 */
const getUserSavePosts = async (id) => {
    try {
        const user = await User.findById(id).populate({
            path: "postsSaved",
            populate: {
                path: "posts",
                populate: {
                    path: "user",
                    select: 'name _id profilePicture'
                },
                select : 'title linkImage categoriesPost _id user likePost postsSaved commenstOnPost date comments'
            },
        })
        return user.postsSaved.posts;
    } catch (error) {

    }
}

/**
 * Get user tags for dashboard
 * @param {*} id 
 * @returns 
 */
const getUserTags = async (id) => {
    try {
        const user = await User.findById(id).populate({
            path: "followsTags",
            populate: {
                path: "tags",
            }
        })
        return user.followsTags.tags;
    } catch (error) {

    }    
}

/**
 * Get user info for dashboard
 * @param {*} id 
 * @returns 
 */
const getOneUserProfile = async (id) =>{
    try {
        const user = await User.findById(id).populate({
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

        if (!user) { //-> no entra a esta excepcion, se va directamente a el catch
            throw new Error('User not found');
        }
        return user;         
    } catch (error) {
        console.error("Error in getOneUserProfile:", error);
        throw new Error('Error to find user');
    }    
}

/**
 * Get user info for dashboard
 * @param {*} id 
 * @returns 
 */
const getOneUserEditProfile = async (id) => {
    try {
        const user = await User.findById(id)
            .select('info profilePicture');
        return user;
    }
    catch (error) {
        
    }
}


//-- Dashboard end --//

export {
    //-- auth user start --//
    registerUser,
    authUser,
    confirm,        
    forgetPassword,
    checkToken,
    newPassword,
    profile,
    //-- auth user end --//
    //-- crud user start --//
    newInfoUser,
    getOneUser,
    getAllUsers,
    //-- crud user end --//
    //dashboard
    getOneUserFollow,
    getUserTags,
    getUserPosts,
    getUserLikePosts,
    getUserSavePosts,
    //dashboard
    //-- actions user start --//
    followUser,
    unfollowUser,
    followTag, 
    unFollowTag,
    getOneUserShortInfo,
    getOneUserProfile,
    getOneUserEditProfile
    //-- actions user end --//
}