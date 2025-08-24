import { deleteImage, uploadImage } from "../config/cloudinary.js";
import User from "../models/User.js";
import { ServiceException } from "../utils/exception/ServiceException.js";
import fs from "fs-extra"


const updateProfileService = async (userId, previousName, files, profilePicture, body) => {

    // userId = id -- previousName = req.body.previousName
    // files = req.files -- profilePicture = req.body.profilePicture

    // 1. checks if user exists
    const user = await User.findById(userId);
    if (!user) {
        throw new ServiceException("User not found", 404);
    }

    // 2. when user inserts a new image, we need to delete 
    if (previousName) {
        console.log("******DELETE IMAGE*****");
        
        if (previousName !== "") {
            await deleteImage(previousName);
        }
    }

    // 3. add new image
    if (files?.image) {
        console.log("******NEW IMAGE*****");
        const result = await uploadImage(files.image.tempFilePath);
        user.profilePicture = {
            public_id: result.public_id,
            secure_url: result.secure_url
        }
        await fs.unlink(files.image.tempFilePath);
    }

    // 4. user doesn't decide to change image
    if (profilePicture) {
        console.log("******IMAGE NOT CHANGE*****");
        const profilePicture2 = JSON.parse(profilePicture)
        user.profilePicture = profilePicture2
    }

    // 5. assamble info and save
    user.info = {
        desc: body.desc,
        work: body.work,
        education: body.education,
        skills: body.skills
    }
    await user.save();
}

export default {
    updateProfileService,
}