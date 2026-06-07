import express from "express";
import { getConversations, getMemoryUsage, getMessages, getUnreadMessagesCount, markAsRead, sendMessage } from "../controllers/messageController.js";
import checkAuth from "../middleware/checkAuth.js";


const router = express.Router();

// send message
router.post("/send/:id", checkAuth, sendMessage);

// get messages in one conversation
router.get("/get/:id", checkAuth, getMessages);

// get unread messages count
router.get("/unread", checkAuth, getUnreadMessagesCount);

router.put('/mark-read/:conversationId', checkAuth, markAsRead)

// get conversations by user
router.get("/get-conversations/:id", checkAuth, getConversations);

router.get("/memory", getMemoryUsage);

export default router;

