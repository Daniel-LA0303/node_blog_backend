import express from "express";
import { getMemoryUsage, getMessages, getUnreadMessagesCount, sendMessage } from "../controllers/messageController.js";
import checkAuth from "../middleware/checkAuth.js";


const router = express.Router();

// send message
router.post("/send/:id", checkAuth, sendMessage);

// get messages in one conversation
router.get("/get/:id", checkAuth, getMessages);

// get unread messages count
router.get("/unread", checkAuth, getUnreadMessagesCount);

router.get("/memory", getMemoryUsage);

export default router;

