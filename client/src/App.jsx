import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from './hooks/useSocket';
import UsernameModal from './components/UsernameModal';
import Sidebar from './components/Sidebar';
import ChatPanel from './components/ChatPanel';

function App() {
    const [username, setUsername] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [unreadCounts, setUnreadCounts] = useState({});
    const [notificationPermission, setNotificationPermission] = useState('default');

    const audioRef = useRef(null);

    const {
        connected,
        users,
        messages,
        typingUsers,
        sendMessage,
        loadHistory,
        sendTyping,
        sendStopTyping,
    } = useSocket(username);

    // Request notification permission on mount
    useEffect(() => {
        if ('Notification' in window) {
            if (Notification.permission === 'default') {
                Notification.requestPermission().then(permission => {
                    setNotificationPermission(permission);
                });
            } else {
                setNotificationPermission(Notification.permission);
            }
        }
    }, []);

    // Handle new messages - update unread counts and show notifications
    useEffect(() => {
        Object.keys(messages).forEach(user => {
            const userMessages = messages[user];
            if (userMessages.length === 0) return;

            const lastMessage = userMessages[userMessages.length - 1];

            // Only process messages from others
            if (lastMessage.from === username) return;

            // If chat is not active with this user, increment unread
            if (user !== selectedUser) {
                setUnreadCounts(prev => ({
                    ...prev,
                    [user]: (prev[user] || 0) + 1,
                }));

                // Show browser notification
                if (notificationPermission === 'granted') {
                    new Notification(`New message from ${lastMessage.from}`, {
                        body: lastMessage.text,
                        icon: '/vite.svg',
                        tag: lastMessage.from,
                    });
                }

                // Play sound
                if (audioRef.current) {
                    audioRef.current.play().catch(err => console.log('Audio play failed:', err));
                }
            }
        });
    }, [messages, username, selectedUser, notificationPermission]);

    // Load history when selecting a user
    useEffect(() => {
        if (selectedUser) {
            loadHistory(selectedUser);
        }
    }, [selectedUser, loadHistory]);

    // Mark messages as read
    const handleMessagesRead = useCallback((user) => {
        setUnreadCounts(prev => ({
            ...prev,
            [user]: 0,
        }));
    }, []);

    const handleSendMessage = useCallback((to, text) => {
        sendMessage(to, text);
    }, [sendMessage]);

    if (!username) {
        return <UsernameModal onSubmit={setUsername} />;
    }

    const currentMessages = selectedUser ? (messages[selectedUser] || []) : [];
    const isTyping = selectedUser ? typingUsers[selectedUser] : false;

    return (
        <div className="h-screen flex overflow-hidden">
            <Sidebar
                users={users}
                currentUser={username}
                selectedUser={selectedUser}
                onSelectUser={setSelectedUser}
                unreadCounts={unreadCounts}
                connected={connected}
            />

            <ChatPanel
                currentUser={username}
                selectedUser={selectedUser}
                messages={currentMessages}
                onSendMessage={handleSendMessage}
                onTyping={sendTyping}
                onStopTyping={sendStopTyping}
                isTyping={isTyping}
                onMessagesRead={handleMessagesRead}
            />

            {/* Hidden audio element for notifications */}
            <audio ref={audioRef} src="/notification.mp3" preload="auto" />
        </div>
    );
}

export default App;
