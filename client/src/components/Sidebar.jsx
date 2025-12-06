/**
 * Sidebar component - displays user list with online status and unread badges
 */
export default function Sidebar({
    users,
    currentUser,
    selectedUser,
    onSelectUser,
    unreadCounts,
    connected
}) {
    return (
        <div className="w-80 glass border-r border-white/10 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl font-bold">Messages</h2>
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
                        <span className="text-xs text-slate-400">
                            {connected ? 'Connected' : 'Disconnected'}
                        </span>
                    </div>
                </div>

                <div className="glass rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-sm font-bold">
                            {currentUser?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{currentUser}</p>
                            <p className="text-xs text-green-400">Online</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* User list */}
            <div className="flex-1 overflow-y-auto scrollbar-thin">
                <div className="p-2">
                    {users
                        .filter(user => user.username !== currentUser)
                        .map(user => {
                            const isSelected = selectedUser === user.username;
                            const unreadCount = unreadCounts[user.username] || 0;

                            return (
                                <button
                                    key={user.username}
                                    onClick={() => onSelectUser(user.username)}
                                    className={`w-full p-3 rounded-lg mb-1 transition-all duration-200 flex items-center gap-3 ${isSelected
                                            ? 'bg-primary-500/20 border border-primary-500/50'
                                            : 'glass-hover'
                                        }`}
                                >
                                    {/* Avatar */}
                                    <div className="relative">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${user.online
                                                ? 'bg-gradient-to-br from-primary-400 to-primary-600'
                                                : 'bg-slate-600'
                                            }`}>
                                            {user.username.charAt(0).toUpperCase()}
                                        </div>
                                        {/* Online indicator */}
                                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-800 ${user.online ? 'bg-green-400' : 'bg-slate-500'
                                            }`}></div>
                                    </div>

                                    {/* User info */}
                                    <div className="flex-1 min-w-0 text-left">
                                        <p className="font-semibold truncate">{user.username}</p>
                                        <p className="text-xs text-slate-400">
                                            {user.online ? (
                                                'Online'
                                            ) : user.lastSeen ? (
                                                `Last seen ${formatLastSeen(user.lastSeen)}`
                                            ) : (
                                                'Offline'
                                            )}
                                        </p>
                                    </div>

                                    {/* Unread badge */}
                                    {unreadCount > 0 && (
                                        <div className="bg-primary-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </div>
                                    )}
                                </button>
                            );
                        })}

                    {users.filter(u => u.username !== currentUser).length === 0 && (
                        <div className="text-center py-8 text-slate-500">
                            <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <p className="text-sm">No other users online</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Helper function to format last seen time
function formatLastSeen(lastSeen) {
    const date = new Date(lastSeen);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
}
