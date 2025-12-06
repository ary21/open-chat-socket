import { useState, useEffect, useRef } from 'react';
import TypingIndicator from './TypingIndicator';

/**
 * Chat panel component - displays messages and input for selected user
 */
export default function ChatPanel({
    currentUser,
    selectedUser,
    messages,
    onSendMessage,
    onTyping,
    onStopTyping,
    isTyping,
    onMessagesRead,
}) {
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const inputRef = useRef(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Mark messages as read when chat panel is active
    useEffect(() => {
        if (selectedUser && messages.length > 0) {
            onMessagesRead(selectedUser);
        }
    }, [selectedUser, messages, onMessagesRead]);

    // Focus input when user is selected
    useEffect(() => {
        if (selectedUser) {
            inputRef.current?.focus();
        }
    }, [selectedUser]);

    const handleInputChange = (e) => {
        setInputText(e.target.value);

        // Send typing indicator
        if (e.target.value.trim()) {
            onTyping(selectedUser);

            // Clear existing timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            // Send stop typing after 2 seconds of inactivity
            typingTimeoutRef.current = setTimeout(() => {
                onStopTyping(selectedUser);
            }, 2000);
        } else {
            onStopTyping(selectedUser);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!inputText.trim()) return;

        onSendMessage(selectedUser, inputText);
        setInputText('');
        onStopTyping(selectedUser);

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
    };

    if (!selectedUser) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary-400/20 to-primary-600/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <svg className="w-12 h-12 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-300 mb-2">Select a conversation</h3>
                    <p className="text-slate-500">Choose a user from the sidebar to start chatting</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col">
            {/* Chat header */}
            <div className="glass border-b border-white/10 px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-sm font-bold">
                        {selectedUser.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="font-semibold">{selectedUser}</h3>
                        <p className="text-xs text-slate-400">
                            {isTyping ? 'typing...' : 'Click to chat'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-4">
                {messages.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                        <p className="text-sm">No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isSent = msg.from === currentUser;

                        return (
                            <div
                                key={msg.id}
                                className={`flex ${isSent ? 'justify-end' : 'justify-start'} animate-slide-in`}
                            >
                                <div className={`max-w-[70%] ${isSent ? 'order-2' : 'order-1'}`}>
                                    <div
                                        className={`rounded-2xl px-4 py-2 ${isSent
                                                ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-br-sm'
                                                : 'glass rounded-bl-sm'
                                            }`}
                                    >
                                        <p className="break-words">{msg.text}</p>
                                    </div>
                                    <p className={`text-xs text-slate-500 mt-1 ${isSent ? 'text-right' : 'text-left'}`}>
                                        {formatMessageTime(msg.timestamp)}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}

                {/* Typing indicator */}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="glass rounded-2xl rounded-bl-sm">
                            <TypingIndicator />
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <div className="glass border-t border-white/10 p-4">
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputText}
                        onChange={handleInputChange}
                        placeholder="Type a message..."
                        className="flex-1 glass rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all placeholder-slate-500"
                        maxLength={1000}
                    />
                    <button
                        type="submit"
                        disabled={!inputText.trim()}
                        className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white rounded-full px-6 py-3 font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg shadow-primary-500/50 disabled:shadow-none"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
}

// Helper function to format message timestamp
function formatMessageTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    // Show time for today
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }

    // Show date for older messages
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
