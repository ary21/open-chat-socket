import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import validator from 'validator';
import {
    joinUser,
    leaveUser,
    getAllUsers,
    getUserSockets
} from './src/userService.js';
import {
    saveMessage,
    getMessageHistory
} from './src/messageService.js';

const app = express();
const httpServer = createServer(app);

// CORS configuration
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: CORS_ORIGIN }));

// Socket.IO setup with CORS
const io = new Server(httpServer, {
    cors: {
        origin: CORS_ORIGIN,
        methods: ['GET', 'POST'],
    },
});

const PORT = process.env.PORT || 3001;

// Validation helpers
function validateUsername(username) {
    if (!username || typeof username !== 'string') {
        return { valid: false, error: 'Username is required' };
    }

    const trimmed = username.trim();

    if (trimmed.length < 2 || trimmed.length > 32) {
        return { valid: false, error: 'Username must be 2-32 characters' };
    }

    if (!validator.isAlphanumeric(trimmed, 'en-US', { ignore: '_-' })) {
        return { valid: false, error: 'Username can only contain letters, numbers, _ and -' };
    }

    return { valid: true, username: trimmed };
}

function sanitizeText(text) {
    if (!text || typeof text !== 'string') return '';
    return validator.escape(text.trim());
}

// Socket.IO event handlers
io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    let currentUsername = null;

    // User join event
    socket.on('user:join', async ({ username }) => {
        try {
            const validation = validateUsername(username);

            if (!validation.valid) {
                socket.emit('error', { message: validation.error });
                return;
            }

            currentUsername = validation.username;

            // Add user to database
            await joinUser(currentUsername, socket.id);

            // Join a personal room for this user
            socket.join(currentUsername);

            // Send current user list to the joining user
            const users = await getAllUsers();
            socket.emit('user:list', { users });

            // Broadcast updated user list to all clients
            io.emit('user:list', { users });

            console.log(`User joined: ${currentUsername}`);
        } catch (error) {
            console.error('Error in user:join:', error);
            socket.emit('error', { message: 'Failed to join' });
        }
    });

    // Private message event
    socket.on('private:message', async ({ to, text }) => {
        try {
            if (!currentUsername) {
                socket.emit('error', { message: 'Not authenticated' });
                return;
            }

            if (!to || typeof to !== 'string') {
                socket.emit('error', { message: 'Recipient is required' });
                return;
            }

            const sanitizedText = sanitizeText(text);

            if (!sanitizedText) {
                socket.emit('error', { message: 'Message text is required' });
                return;
            }

            // Save message to database
            const savedMessage = await saveMessage(currentUsername, to, sanitizedText);

            // Format message for clients
            const messageData = {
                id: savedMessage.id,
                from: currentUsername,
                to,
                text: sanitizedText,
                timestamp: savedMessage.createdAt.toISOString(),
            };

            // Send to recipient (all their sockets/tabs)
            const recipientSockets = await getUserSockets(to);
            recipientSockets.forEach(socketId => {
                io.to(socketId).emit('private:message', messageData);
            });

            // Send back to sender (confirmation)
            socket.emit('private:message', messageData);

            console.log(`Message from ${currentUsername} to ${to}`);
        } catch (error) {
            console.error('Error in private:message:', error);
            socket.emit('error', { message: 'Failed to send message' });
        }
    });

    // Request message history
    socket.on('message:history', async ({ with: otherUser }) => {
        try {
            if (!currentUsername) {
                socket.emit('error', { message: 'Not authenticated' });
                return;
            }

            if (!otherUser || typeof otherUser !== 'string') {
                socket.emit('error', { message: 'Other user is required' });
                return;
            }

            const messages = await getMessageHistory(currentUsername, otherUser);

            socket.emit('message:history', {
                with: otherUser,
                messages
            });

            console.log(`History requested: ${currentUsername} <-> ${otherUser}`);
        } catch (error) {
            console.error('Error in message:history:', error);
            socket.emit('error', { message: 'Failed to load history' });
        }
    });

    // Typing indicator
    socket.on('typing', async ({ to }) => {
        try {
            if (!currentUsername || !to) return;

            // Send to recipient's sockets
            const recipientSockets = await getUserSockets(to);
            recipientSockets.forEach(socketId => {
                io.to(socketId).emit('typing', { from: currentUsername });
            });
        } catch (error) {
            console.error('Error in typing:', error);
        }
    });

    // Stop typing indicator
    socket.on('stopTyping', async ({ to }) => {
        try {
            if (!currentUsername || !to) return;

            // Send to recipient's sockets
            const recipientSockets = await getUserSockets(to);
            recipientSockets.forEach(socketId => {
                io.to(socketId).emit('stopTyping', { from: currentUsername });
            });
        } catch (error) {
            console.error('Error in stopTyping:', error);
        }
    });

    // Disconnect event
    socket.on('disconnect', async () => {
        try {
            if (currentUsername) {
                const username = await leaveUser(socket.id);

                if (username) {
                    // Broadcast updated user list
                    const users = await getAllUsers();
                    io.emit('user:list', { users });

                    console.log(`User disconnected: ${username}`);
                }
            }
        } catch (error) {
            console.error('Error in disconnect:', error);
        }
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
httpServer.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`✅ Socket.IO ready for connections`);
    console.log(`✅ CORS enabled for: ${CORS_ORIGIN}`);
});
