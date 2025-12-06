import { PrismaClient } from '@prisma/client';
import { generateRoomId } from './userService.js';

const prisma = new PrismaClient();

/**
 * Save a message to the database
 * @param {string} fromUsername - Sender username
 * @param {string} toUsername - Recipient username
 * @param {string} text - Message text
 * @returns {Promise<Message>} Saved message
 */
export async function saveMessage(fromUsername, toUsername, text) {
    // Get sender user ID
    const fromUser = await prisma.user.findUnique({
        where: { username: fromUsername },
    });

    if (!fromUser) {
        throw new Error(`User ${fromUsername} not found`);
    }

    const roomId = generateRoomId(fromUsername, toUsername);

    const message = await prisma.message.create({
        data: {
            fromUserId: fromUser.id,
            toUserId: toUsername,
            text,
            roomId,
        },
    });

    return message;
}

/**
 * Get message history for a room
 * @param {string} user1 - First username
 * @param {string} user2 - Second username
 * @param {number} limit - Maximum number of messages to retrieve
 * @returns {Promise<Array>} List of messages
 */
export async function getMessageHistory(user1, user2, limit = 100) {
    const roomId = generateRoomId(user1, user2);

    const messages = await prisma.message.findMany({
        where: { roomId },
        orderBy: { createdAt: 'asc' },
        take: limit,
        include: {
            fromUser: {
                select: {
                    username: true,
                },
            },
        },
    });

    // Format messages for client
    return messages.map(msg => ({
        id: msg.id,
        from: msg.fromUser.username,
        to: msg.toUserId,
        text: msg.text,
        timestamp: msg.createdAt.toISOString(),
    }));
}

/**
 * Get unread message count for a user from each other user
 * @param {string} username - Username to check
 * @param {Date} since - Get messages since this timestamp
 * @returns {Promise<Object>} Map of username -> unread count
 */
export async function getUnreadCounts(username, since) {
    const messages = await prisma.message.findMany({
        where: {
            toUserId: username,
            createdAt: {
                gte: since,
            },
        },
        include: {
            fromUser: {
                select: {
                    username: true,
                },
            },
        },
    });

    // Count messages by sender
    const counts = {};
    messages.forEach(msg => {
        const from = msg.fromUser.username;
        counts[from] = (counts[from] || 0) + 1;
    });

    return counts;
}

export default prisma;
