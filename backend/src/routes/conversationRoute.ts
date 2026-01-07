import express from 'express';
import { createConversation, getConversations } from '../controllers/conversationController';

const router = express.Router();

// Create a new conversation
router.post('/', createConversation);

// Get all conversations for the authenticated user
router.get('/', getConversations);

export default router;