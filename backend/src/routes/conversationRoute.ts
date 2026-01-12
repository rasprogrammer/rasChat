import express from 'express';
import { createConversation, getConversations, loadChat } from '../controllers/conversationController';

const router = express.Router();

// Create a new conversation
router.post('/', createConversation);

// Get all conversations for the authenticated user
router.get('/', getConversations);

// Load chat messages for a conversation
router.get('/:id/messages', loadChat);

export default router;