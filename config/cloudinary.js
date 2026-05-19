import dotenv from "dotenv"; 
dotenv.config();
import {v2 as cloudinary} from 'cloudinary'
// import { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME } from './config.js'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
})


export const uploadImage = async (filePath) => {
  return await cloudinary.uploader.upload(filePath, {
    folder: 'blog_profile'
  })
}

export const uploadImagePost = async (filePath) => {
  return await cloudinary.uploader.upload(filePath, {
    folder: 'blog_post'
  })
}

export const deleteImage = async (publicId) => {
  return await cloudinary.uploader.destroy(publicId)
}