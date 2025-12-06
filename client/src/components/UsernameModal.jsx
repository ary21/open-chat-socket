import { useState } from 'react';

/**
 * Username input modal component
 * Shown on first load to capture username
 */
export default function UsernameModal({ onSubmit }) {
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        const trimmed = username.trim();

        if (trimmed.length < 2 || trimmed.length > 32) {
            setError('Username must be 2-32 characters');
            return;
        }

        if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
            setError('Username can only contain letters, numbers, _ and -');
            return;
        }

        onSubmit(trimmed);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass rounded-2xl p-8 max-w-md w-full shadow-2xl animate-slide-in">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-300 to-primary-500 bg-clip-text text-transparent">
                        Welcome to Chat
                    </h1>
                    <p className="text-slate-400 mt-2">Enter your username to get started</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                                setError('');
                            }}
                            placeholder="Enter username"
                            className="w-full px-4 py-3 glass rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all placeholder-slate-500"
                            autoFocus
                            maxLength={32}
                        />
                        {error && (
                            <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {error}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary-500/50"
                    >
                        Join Chat
                    </button>
                </form>

                <p className="text-xs text-slate-500 text-center mt-4">
                    Username: 2-32 characters, letters, numbers, _ and - only
                </p>
            </div>
        </div>
    );
}
