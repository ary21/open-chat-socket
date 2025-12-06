# 🚀 Real-time Chat Application

A modern, real-time private messaging application built with React, Socket.IO, Express, and Prisma. Features include instant messaging, online presence, typing indicators, browser notifications, and persistent message history.

## ✨ Features

- **Real-time Private Messaging** - Instant 1-on-1 chat via Socket.IO
- **No Authentication** - Simple username-only access (demo/dev mode)
- **Online Presence** - See who's online with live status indicators
- **Typing Indicators** - Know when someone is typing
- **Unread Badges** - Track unread messages per conversation
- **Browser Notifications** - Get notified even when the tab isn't active
- **Sound Alerts** - Audio notification for new messages
- **Message History** - All messages persisted in SQLite database
- **Multi-tab Support** - Use multiple tabs with the same username
- **Responsive UI** - Modern glassmorphism design with Tailwind CSS

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Express, Socket.IO |
| Database | Prisma ORM + SQLite |
| Real-time | Socket.IO (WebSocket) |
| Package Manager | pnpm |

## 📁 Project Structure

```
chat-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks (useSocket)
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   └── package.json
├── server/                 # Express backend
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   ├── src/
│   │   ├── userService.js    # User management
│   │   └── messageService.js # Message handling
│   ├── index.js           # Server entry point
│   └── package.json
└── package.json           # Root workspace config
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (install with `npm install -g pnpm`)

### Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd chat-app
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Setup environment variables**
   ```bash
   # Copy the example env file
   cp server/.env.example server/.env
   ```

4. **Run Prisma migrations**
   ```bash
   pnpm migrate
   ```
   
   This will create the SQLite database and tables.

5. **Start the development servers**
   ```bash
   pnpm dev
   ```
   
   This runs both client (port 5173) and server (port 3001) concurrently.

### Individual Commands

```bash
# Run only frontend
pnpm dev:client

# Run only backend
pnpm dev:server

# Run Prisma Studio (database GUI)
cd server && pnpm studio

# Reset database
pnpm migrate:reset
```

## 🧪 Manual Testing

1. **Start the application**
   ```bash
   pnpm dev
   ```

2. **Open two browser windows**
   - Window 1: http://localhost:5173
   - Window 2: http://localhost:5173 (incognito/private mode recommended)

3. **Test scenarios**:
   
   ✅ **User Join**
   - Enter different usernames in each window
   - Verify both users appear in each other's sidebar
   - Check online status indicators (green dot)
   
   ✅ **Real-time Messaging**
   - Select a user and send messages
   - Verify instant delivery in both windows
   - Check message timestamps
   
   ✅ **Unread Badges**
   - In Window 1, chat with User B
   - In Window 2 (as User B), chat with User C
   - Send message from Window 1
   - Verify unread badge appears in Window 2 sidebar
   
   ✅ **Browser Notifications**
   - Grant notification permission when prompted
   - Send message while other user's chat is not active
   - Verify browser notification appears
   - Verify sound plays
   
   ✅ **Typing Indicators**
   - Start typing in one window
   - Verify "typing..." indicator in other window
   - Stop typing and verify indicator disappears
   
   ✅ **Presence & Last Seen**
   - Close one browser window
   - Verify user goes offline in other window
   - Check "Last seen" timestamp appears
   
   ✅ **Message Persistence**
   - Send several messages
   - Refresh the page
   - Verify messages are still there

## 🔔 Browser Notifications

The app will request notification permission on first load. To enable:

1. **Chrome/Edge**: Click the lock icon → Site settings → Notifications → Allow
2. **Firefox**: Click the shield icon → Permissions → Notifications → Allow
3. **Safari**: Safari → Settings → Websites → Notifications → Allow

If you denied permission, you'll need to reset it in browser settings.

## 🔒 Security Considerations

⚠️ **Important**: This application uses **username-only authentication** without passwords. This is suitable for:
- Development and testing
- Internal demos
- Proof of concept

**NOT suitable for production** without implementing:
- Proper authentication (JWT, OAuth, etc.)
- Password hashing
- Session management
- Rate limiting
- Input sanitization (basic sanitization is included)
- HTTPS/WSS in production

## 🗄️ Database Migration (SQLite → PostgreSQL)

To switch from SQLite to PostgreSQL:

1. **Update `server/.env`**:
   ```env
   # From:
   DATABASE_URL="file:./dev.db"
   
   # To:
   DATABASE_URL="postgresql://user:password@localhost:5432/chatdb?schema=public"
   ```

2. **Update `server/prisma/schema.prisma`**:
   ```prisma
   datasource db {
     provider = "postgresql"  // Changed from "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

3. **Run migrations**:
   ```bash
   pnpm migrate
   ```

## 🎨 UI Design

The application features a modern design with:
- **Glassmorphism effects** - Frosted glass aesthetic
- **Gradient accents** - Vibrant primary colors
- **Smooth animations** - Slide-in effects and transitions
- **Custom scrollbars** - Minimal, themed scrollbars
- **Responsive layout** - Works on desktop and mobile

## 📡 Socket.IO Events

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `user:join` | C → S | `{ username }` | User joins the chat |
| `user:list` | S → C | `{ users: [...] }` | Updated user list |
| `private:message` | C ↔ S | `{ to, text }` / `{ id, from, to, text, timestamp }` | Send/receive message |
| `message:history` | C → S | `{ with: username }` | Request chat history |
| `message:history` | S → C | `{ with, messages: [...] }` | Chat history response |
| `typing` | C ↔ S | `{ to }` / `{ from }` | Typing indicator |
| `stopTyping` | C ↔ S | `{ to }` / `{ from }` | Stop typing |
| `disconnect` | Auto | - | User disconnects |

### Room ID Format

Private chat rooms use a consistent ID format:
```javascript
roomId = [min(userA, userB)] + '#' + [max(userA, userB)]
// Example: "alice#bob"
```

This ensures the same room ID regardless of who initiates the chat.

## 🐛 Troubleshooting

**Port already in use**
```bash
# Kill process on port 3001 (server)
lsof -ti:3001 | xargs kill -9

# Kill process on port 5173 (client)
lsof -ti:5173 | xargs kill -9
```

**Prisma errors**
```bash
# Regenerate Prisma client
cd server && npx prisma generate

# Reset database
pnpm migrate:reset
```

**Socket connection issues**
- Check that server is running on port 3001
- Verify CORS_ORIGIN in server/.env matches client URL
- Check browser console for errors

## 📝 License

MIT

## 🤝 Contributing

This is a demo project. Feel free to fork and modify for your needs!

---

Built with ❤️ using React, Socket.IO, Express, and Prisma
