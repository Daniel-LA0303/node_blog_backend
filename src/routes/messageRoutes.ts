import express from "express";
import { 
    getConversationsController, 
    getMemoryUsage, 
    getMessagesController, 
    getUnreadMessagesCountController, 
    markAsReadController, 
    sendMessageController
} from "../controllers/messageController.js";
import checkAuth from "../middleware/checkAuth.js";


const router = express.Router();

// send message
router.post("/send/:id", 
    checkAuth, 
    // rate limit here not spam in messages
    //sendMessageRateLimiter
    sendMessageController);

// get messages in one conversation
router.get("/get/:id", checkAuth, getMessagesController);

// get unread messages count
router.get("/unread", checkAuth, getUnreadMessagesCountController);

router.put('/mark-read/:conversationId', checkAuth, markAsReadController)

// get conversations by user
router.get("/get-conversations/:id", checkAuth, getConversationsController);

router.get("/memory", getMemoryUsage);

export default router;

