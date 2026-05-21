import User from '../models/User.js'
import generateID from '../helpers/generateID'
import { emailNewPassword } from '../helpers/email'
import usersServices from '../services/usersServices';
import { ApiResponse } from '../utils/ApiResponse';
import Conversation from '../models/Conversation';


// --- Auth Users start --//
const registerUser = async (req: any, res: any, next: any) => {

    try {
        const { email } = req.body;

        await usersServices.registerNewUser(email, req.body);

        res.status(201).json(
            new ApiResponse(
                201,
                "/api" + req.path,
                req.method,
                "User created correctly, check your email to confirm.",
                "User created",
                false
            )
        );

    } catch (error) {
        next(error);
    }
}

const authUser = async (req: any, res: any, next: any) => {
    try {

        const { email, password } = req.body;

        const userInfo = await usersServices.login(email, password);

        res.status(200).json(
            new ApiResponse(
                200,
                "/api" + req.path,
                req.method,
                "User login successfully",
                userInfo,
                false
            )
        );

    } catch (error) {
        next(error);
    }
}

const confirm = async (req: any, res: any, next: any) => {

    try {

        const { token } = req.params;

        // call service to confirm
        await usersServices.userConfirmed(token);
        res.status(200).json(
            new ApiResponse(
                200,
                "/api" + req.path,
                req.method,
                "User confirmed successfully",
                "User confirmed",
                false
            )
        );
    } catch (error) {
        next(error);
    }
}

const forgetPassword = async (req: any, res: any) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email: email });

        if (!user) {
            const error = new Error('This user does not exist');
            return res.status(400).json({ msg: error.message });
        }
        user.token = generateID();
        await user.save();
        emailNewPassword({
            email: user.email,
            name: user.name,
            token: user.token
        })
        res.json({ msg: "We have sent an email with instructions" });
    } catch (error: any) {
        console.log(error);
        res.status(500).json({ error: 'Error', msg: error.message });
    }
}

const checkToken = async (req: any, res: any) => {
    try {
        const { token } = req.params;

        const tokenValid = await User.findOne({ token });

        if (tokenValid) {
            res.json({ msg: "Token valido y el usuario existe" })
        } else {
            const error = new Error('Token no valido');
            return res.status(400).json({ msg: error.message });
        }
    } catch (error) {
        console.log(error);
    }
}

const newPassword = async (req: any, res: any) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const user = await User.findOne({ token });

        if (user) {
            user.password = password //se asigna el nuevo password
            user.token = '' //se reinicia el token
            try {
                await user.save();
                res.json({ msg: "Password Modified Correctly" })
            } catch (error) {
                console.log(error);
            }
        } else {
            const error = new Error('Invalid token');
            return res.status(400).json({ msg: error.message });
        }
    } catch (error: any) {
        console.log(error);
        res.status(500).json({ error: 'Error', msg: error.message });
    }
}

const profile = async (req: any, res: any) => {
    const { user } = req;
    res.json(user);
}

// -- Auth Users end --//

// -- Users CRUD actions start --//
const newInfoUser = async (req: any, res: any, next: any) => {
    try {
        const { id } = req.params;

        console.log(req.body);

        // 1. call service
        const response = await usersServices.updateProfileService(
            id,
            req.body.previousName,
            req.files,
            req.body.profilePicture,
            req.body
        );
        res.status(200).json(
            new ApiResponse(
                200,
                "/api" + req.path,
                req.method,
                "User updated successfully",
                response,
                false
            )
        );
    } catch (error) {
        next(error);
    }
}

const getOneUser = async (req: any, res: any, next: any) => {
    try {
        const user = await User.findById(req.params.id).populate({
            path: "postsSaved",
            populate: {
                path: "posts",
                populate: {
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
        res.json({ msg: 'This post does not exist' });
        next();
    }
}

const getAllUsers = async (req: any, res: any) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json(error);
    }
}

// -- Users CRUD actions end --//

// -- Actions beetween Users start --/

const followTag = async (req: any, res: any, next: any) => {
    try {
        const { categoryId } = req.query; // ID de la categoría
        const userId = req.params.id; // ID del usuario

        await usersServices.userFollowATag(categoryId, userId);

        res.status(200).json(
            new ApiResponse(
                200,
                "/api" + req.path,
                req.method,
                "Follow tag updated successfully",
                "Follow success",
                false
            )
        );

    } catch (error) {
        next(error);
    }
};

const unFollowTag = async (req: any, res: any, next: any) => {
    try {
        const { categoryId } = req.query; // ID de la categoría
        const userId = req.params.id; // ID del usuario

        await usersServices.userUnfollowATag(categoryId, userId);

        res.status(200).json(
            new ApiResponse(
                200,
                "/api" + req.path,
                req.method,
                "Unfollow tag updated successfully",
                "Unfollow success",
                false
            )
        );

    } catch (error) {
        next(error);
    }
};

// follow user
const followUser = async (req: any, res: any, next: any) => {
    try {
        const { userFollow } = req.query;  // ID of the user to follow
        const userProfileId = req.params.id;    // ID of the current logged user

        await usersServices.followUserService(userFollow, userProfileId);

        res.status(200).json(
            new ApiResponse(
                200,
                "/api" + req.path,
                req.method,
                "User followed successfully",
                "Follow success",
                false
            )
        );
    } catch (error) {
        next(error);
    }
};

// Unfollow User
const unfollowUser = async (req: any, res: any, next: any) => {
    try {
        const { userUnfollow } = req.query;  // ID of the user to unfollow
        const userProfileId = req.params.id;    // ID of the current logged user
        
        await usersServices.unfollowUserService(userUnfollow, userProfileId);

        res.status(200).json(
            new ApiResponse(
                200,
                "/api" + req.path,
                req.method,
                "User unfollowed successfully",
                "Unfollow success",
                false
            )
        );
    } catch (error) {
        next(error);
    }
};

// -- Actions beetween Users end --/

const getPostsByUserPaginated = async (req: any, res: any, next: any) => {

    try {

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;
        const userId = req.params.id; 

        const result = await usersServices.getPostByUserPaginatedService(page, limit, userId);

        // mapping response
        res.status(200).json(
            new ApiResponse(200, "/api/users" + req.path, req.method, "Success get posts by user paginated", result, false)
        );

    } catch (error) {
        console.log(error);
        next(error);
    }

}

/**
 * Get user followers and followed for dashboard
 * @param {*} id 
 * @returns 
 */
const getOneUserFollow = async (id: any) => {
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
            followers: user?.followersUsers.followers,
            followed: user?.followedUsers.followed
        };
        return response;
    } catch (error) {

    }
}

/**
 * Get user info for dashboard
 * @param {*} id 
 * @returns 
 */

// DELETE
const getOneUserEditProfile = async (id: any) => {
    try {
        const user = await User.findById(id)
            .select('info profilePicture');
        return user;
    }
    catch (error) {

    }
}


const allUsers = async (req: any, res: any) => {
  try {

    console.log(req.user)
    const loggedInUser = req.user._id;
    // 1. Buscar todas las conversaciones donde participa el usuario
    const conversations = await Conversation.find({
     members: { $in: [loggedInUser] },
    })
      .populate("members", "name email profilePicture") // obtenemos info básica de los miembros
      .sort({ updatedAt: -1 }); // opcional: ordenarlas por última actividad

    // 2. Mapear para obtener solo los otros miembros de la conversación
    const users = conversations.map((conv) => {
      return conv.members.find(
        (member) => member._id.toString() !== loggedInUser.toString()
      );
    });

    // 3. Filtrar duplicados en caso de varias conversaciones con la misma persona
    const uniqueUsers = Array.from(
      new Map(users.map((user) => [user?._id.toString(), user])).values()
    );

    res.status(200).json(uniqueUsers);
  } catch (error) {
    console.log("Error in allUsers Controller: " + error);
  }
};


const searchUsers = async (req: any, res: any) => {
  try {
    const { q, currentUserId } = req.query; // q = texto de búsqueda

    if (!currentUserId) return res.status(400).json({ error: "currentUserId required" });

    const regex = new RegExp(q, "i"); // búsqueda insensible a mayúsculas

    // Buscar coincidencias en fullname o email, excluyendo al usuario logeado
    const users = await User.find({
      _id: { $ne: currentUserId },
      $or: [{ name: regex }, { email: regex }],
    }).select("name email profilePicture");

    res.status(200).json(users);
  } catch (error) {
    console.log("Error in searchUsers:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};



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
    //dashboard
    //-- actions user start --//
    followUser,
    unfollowUser,
    followTag,
    unFollowTag,
    // getOneUserShortInfo,
    getOneUserEditProfile,
    //-- actions user end --//
    getPostsByUserPaginated,
    allUsers,
    searchUsers
}