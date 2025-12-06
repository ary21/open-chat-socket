import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Generate a consistent room ID for two users
 * Format: "userA#userB" where userA < userB alphabetically
 */
export function generateRoomId(user1, user2) {
  const sorted = [user1, user2].sort();
  return `${sorted[0]}#${sorted[1]}`;
}

/**
 * Join a user - create or update user record
 * @param {string} username - Username to join
 * @param {string} socketId - Socket ID to add
 * @returns {Promise<User>} User object
 */
export async function joinUser(username, socketId) {
  const user = await prisma.user.upsert({
    where: { username },
    update: {
      online: true,
      sockets: JSON.stringify(
        [...new Set([...JSON.parse((await prisma.user.findUnique({ where: { username } }))?.sockets || '[]'), socketId])]
      ),
    },
    create: {
      username,
      online: true,
      sockets: JSON.stringify([socketId]),
    },
  });
  
  return user;
}

/**
 * Remove a socket from user's socket list
 * If no sockets remain, mark user as offline
 * @param {string} socketId - Socket ID to remove
 */
export async function leaveUser(socketId) {
  // Find user with this socket
  const users = await prisma.user.findMany();
  
  for (const user of users) {
    const sockets = JSON.parse(user.sockets || '[]');
    if (sockets.includes(socketId)) {
      const newSockets = sockets.filter(s => s !== socketId);
      
      await prisma.user.update({
        where: { id: user.id },
        data: {
          sockets: JSON.stringify(newSockets),
          online: newSockets.length > 0,
          lastSeen: newSockets.length === 0 ? new Date() : user.lastSeen,
        },
      });
      
      return user.username;
    }
  }
  
  return null;
}

/**
 * Get all users with their online status
 * @returns {Promise<Array>} List of users
 */
export async function getAllUsers() {
  const users = await prisma.user.findMany({
    select: {
      username: true,
      online: true,
      lastSeen: true,
    },
    orderBy: {
      username: 'asc',
    },
  });
  
  return users;
}

/**
 * Get user by username
 * @param {string} username
 * @returns {Promise<User|null>}
 */
export async function getUserByUsername(username) {
  return await prisma.user.findUnique({
    where: { username },
  });
}

/**
 * Get all socket IDs for a user (for multi-tab support)
 * @param {string} username
 * @returns {Promise<Array<string>>}
 */
export async function getUserSockets(username) {
  const user = await prisma.user.findUnique({
    where: { username },
    select: { sockets: true },
  });
  
  return user ? JSON.parse(user.sockets || '[]') : [];
}

export default prisma;
