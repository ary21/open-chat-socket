/**
 * Typing indicator component
 * Shows animated dots when user is typing
 */
export default function TypingIndicator() {
    return (
        <div className="flex items-center gap-1 px-4 py-2">
            <div className="flex gap-1">
                <div className="w-2 h-2 bg-primary-400 rounded-full typing-dot"></div>
                <div className="w-2 h-2 bg-primary-400 rounded-full typing-dot"></div>
                <div className="w-2 h-2 bg-primary-400 rounded-full typing-dot"></div>
            </div>
            <span className="text-sm text-slate-400 ml-2">typing...</span>
        </div>
    );
}
