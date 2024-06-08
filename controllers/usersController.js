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

const profile = async (req, res) => {
    const {user} = req;

    // console.log("------ \n",user,"\n------");
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

/**
 * This function get one user by id
 * 
 * @param req 
 * @param res 
 * @param next 
 */
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
        console.log(user);           
    } catch (error) {
        console.log(error);
        res.json({msg: 'This post does not exist'});
        next();
    }    
}

/**
 * Get one user whit short info
 * @param {*} req 
 * @param {*} res 
 */
const getOneUserShortInfo = async (id) => {

    /**
     * postPublishsos
     * followers
     * postlikes
     * postsaved
     * tags saved
     * follwed
     */
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
        console.log(error);
        // res.json({msg: 'This post does not exist'});
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
      res.status(500).json({ error: 'Internal server error' });
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
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
const followUser = async (req, res) => {
    try {
      const userFollowedId = req.params.id; 
      const userProfileId = req.body._id; 

      const userFollowed = await User.findById(userFollowedId);
      const existingNotification = userFollowed.notifications.find((notification) => (
        notification.type === 'follow' && String(notification.user) === String(userProfileId)
      ));
  
      if (existingNotification) {
        return res.status(400).json({ error: 'You follow this user yet!' });
      }
  
      const Ob = {
        user: userProfileId,
        notification: 'has begun to follow you',
        type: 'follow',
        date: new Date(),
      }

      await User.findByIdAndUpdate(
        userFollowedId,
        {
          $addToSet: { 'followersUsers.followers': userProfileId },
          $inc: { 'followersUsers.conutFollowers': 1 },
          $push: { notifications: Ob }
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
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };

  const unfollowUser = async (req, res) => {
    try {
      const userFollowedId = req.params.id; // ID del usuario a dejar de seguir
      const userProfileId = req.body._id; // ID del usuario que solicita dejar de seguir
  
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
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };
    //   path: "postsSaved",
    //   populate: {
    //       path: "posts",
    //       populate:{
    //           path: "user"
    //       }
    //   }
    // }).populate({
    //   path: "followsTags",
    //   populate: {
    //       path: "tags",

    //   }
    // }).populate({
    //   path: "likePost",
    //   populate: {
    //       path: "posts",

    //   }
    // })
  
  const getUserNotifications = async (req, res) => {
    try {
        const userId = req.params.id; 
        const user = await User.findById(userId)
        .populate({
            path: "notifications",
            populate: {
                path: "user",
                select: 'name email profilePicture _id',
            }
        })
        .populate({
            path: "notifications",
            populate: {
                path: "idPost",
                
            }
        });
        
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }

        const groupedNotifications = {
            comment: [],
            reply: [],
            like: [],
            follow: [],
          };
    
          user.notifications.forEach((notification) => {
            groupedNotifications[notification.type].push(notification);
          });

        res.json(groupedNotifications);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error to get this user' });
      }
  }

// -- Actions beetween Users end --/


//-- Dashboard start --//
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

const getUserPosts = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('posts')
        res.json(user.posts); 
    } catch (error) {
        res.status(500).json({error: 'Something went wrong'});
        next(); 
    }
}

const getUserLikePosts= async (id) => {
    console.log("id",id);
    try {
        const user = await User.findById(id).populate({
            path: "likePost",
            populate: {
                path: "posts",
                populate: {
                    path: "user",
                    select: 'name _id profilePicture'
                },
                select : 'title linkImage categoriesPost _id user likePost commenstOnPost date'

            }
        })
        
        return user.likePost.posts;
          
    } catch (error) {
       
    }    
}

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
                select : 'title linkImage categoriesPost _id user likePost postsSaved commenstOnPost date'
            },
        })
        return user.postsSaved.posts;
    } catch (error) {

    }
}


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
    getUserNotifications,
    //-- actions user end --//

    getOneUserShortInfo
}