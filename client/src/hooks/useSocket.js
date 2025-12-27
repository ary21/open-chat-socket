import { useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';

// const SOCKET_URL = 'http://localhost:3001';
const SOCKET_URL = 'https://server-production-73da.up.railway.app/';

/**
 * Custom hook for Socket.IO connection and event handling
 * @param {string} username - Current user's username
 * @returns {Object} Socket state and methods
 */
export function useSocket(username) {
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);
    const [users, setUsers] = useState([]);
    const [messages, setMessages] = useState({});
    const [typingUsers, setTypingUsers] = useState({});

    const typingTimeoutRef = useRef({});

    // Initialize socket connection
    useEffect(() => {
        if (!username) return;

        const newSocket = io(SOCKET_URL, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        setSocket(newSocket);

        // Connection events
        newSocket.on('connect', () => {
            console.log('Socket connected');
            setConnected(true);

            // Join with username
            newSocket.emit('user:join', { username });
        });

        newSocket.on('disconnect', () => {
            console.log('Socket disconnected');
            setConnected(false);
        });

        newSocket.on('error', (error) => {
            console.error('Socket error:', error);
        });

        // Cleanup on unmount
        return () => {
            newSocket.close();
        };
    }, [username]);

    // User list updates
    useEffect(() => {
        if (!socket) return;

        const handleUserList = ({ users }) => {
            setUsers(users);
        };

        socket.on('user:list', handleUserList);

        return () => {
            socket.off('user:list', handleUserList);
        };
    }, [socket]);

    // Private messages
    useEffect(() => {
        if (!socket) return;

        const handlePrivateMessage = (message) => {
            const otherUser = message.from === username ? message.to : message.from;

            setMessages(prev => ({
                ...prev,
                [otherUser]: [...(prev[otherUser] || []), message],
            }));
        };

        socket.on('private:message', handlePrivateMessage);

        return () => {
            socket.off('private:message', handlePrivateMessage);
        };
    }, [socket, username]);

    // Message history
    useEffect(() => {
        if (!socket) return;

        const handleMessageHistory = ({ with: otherUser, messages: historyMessages }) => {
            setMessages(prev => ({
                ...prev,
                [otherUser]: historyMessages,
            }));
        };

        socket.on('message:history', handleMessageHistory);

        return () => {
            socket.off('message:history', handleMessageHistory);
        };
    }, [socket]);

    // Typing indicators
    useEffect(() => {
        if (!socket) return;

        const handleTyping = ({ from }) => {
            setTypingUsers(prev => ({ ...prev, [from]: true }));

            // Clear existing timeout
            if (typingTimeoutRef.current[from]) {
                clearTimeout(typingTimeoutRef.current[from]);
            }

            // Auto-clear after 3 seconds
            typingTimeoutRef.current[from] = setTimeout(() => {
                setTypingUsers(prev => {
                    const next = { ...prev };
                    delete next[from];
                    return next;
                });
            }, 3000);
        };

        const handleStopTyping = ({ from }) => {
            setTypingUsers(prev => {
                const next = { ...prev };
                delete next[from];
                return next;
            });

            if (typingTimeoutRef.current[from]) {
                clearTimeout(typingTimeoutRef.current[from]);
            }
        };

        socket.on('typing', handleTyping);
        socket.on('stopTyping', handleStopTyping);

        return () => {
            socket.off('typing', handleTyping);
            socket.off('stopTyping', handleStopTyping);

            // Clear all timeouts
            Object.values(typingTimeoutRef.current).forEach(clearTimeout);
        };
    }, [socket]);

    // Send message
    const sendMessage = useCallback((to, text) => {
        if (!socket || !text.trim()) return;

        socket.emit('private:message', { to, text: text.trim() });
    }, [socket]);

    // Load message history
    const loadHistory = useCallback((otherUser) => {
        if (!socket) return;

        socket.emit('message:history', { with: otherUser });
    }, [socket]);

    // Send typing indicator
    const sendTyping = useCallback((to) => {
        if (!socket) return;
        socket.emit('typing', { to });
    }, [socket]);

    // Send stop typing indicator
    const sendStopTyping = useCallback((to) => {
        if (!socket) return;
        socket.emit('stopTyping', { to });
    }, [socket]);

    return {
        connected,
        users,
        messages,
        typingUsers,
        sendMessage,
        loadHistory,
        sendTyping,
        sendStopTyping,
    };
}
