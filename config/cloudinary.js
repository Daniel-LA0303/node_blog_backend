import {v2 as cloudinary} from 'cloudinary'
// import {CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_SECRET, CLOUDINARY_API_KEY} from '../config.js'

cloudinary.config({
  cloud_name: 'daniela1234', 
  api_key: '644686763117898', 
  api_secret: 'mReHU-Z4oEKSr7ed0TAprgjgwfw',
  secure: true
})


export const uploadImage = async (filePath) => {
  return await cloudinary.uploader.upload(filePath, {
    folder: 'blog_profile'
  })
}

export const deleteImage = async (publicId) => {
  return await cloudinary.uploader.destroy(publicId)
}