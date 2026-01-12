import express from 'express';
import { 
  sendMessage, 
  markMessageAsDelivered, 
  markMessageAsSeen,
  markConversationAsSeen 
} from '../controllers/messageController';

const router = express.Router();

// Send a message
router.post('/', sendMessage);

// Mark message as delivered
router.post('/delivered', markMessageAsDelivered);

// Mark message as seen
router.post('/seen', markMessageAsSeen);

// Mark entire conversation as seen
router.post('/conversation/:conversationId/seen', markConversationAsSeen);

export default router;
