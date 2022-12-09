import express from "express";
import checkAuth from "../middleware/checkAuth.js"
import { 
    registerUser, 
    authUser, 
    confirm,
    forgetPassword,
    checkToken,
    newPassword,
    newInfoUser,
    profile
} from "../controllers/usersController.js";

const router = express.Router();


//add new user
router.post('/', registerUser); 
// // auth user
router.post('/login', authUser);
// //confirm user
router.get('/confirm/:token', confirm);
//forget password
router.post('/new-password', forgetPassword);

router.route('/new-password/:token')
    .get(checkToken) //comprueba el token que se manda cuando se ejecuta olvidePassword
    .post(newPassword) //redirije a una pestaña para nuevo password

router.post('/new-info/:id', newInfoUser);

router.get('/profile', checkAuth, profile);

export default router