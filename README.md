## ✨ Features

🔐 User Authentication - Secure registration and login with encrypted passwords
💬 Real-time Messaging - Instant message delivery using WebSocket technology
👥 Online Users - See who's currently online in the chat
📱 Responsive Design - Beautiful UI that works on all devices
🎨 Modern Interface - Gradient designs and smooth animations
🔔 System Notifications - Join/leave notifications for better user experience
⚡ Fast & Efficient - Optimized performance with Next.js 13 App Router
💾 Message Persistence - All messages saved in MongoDB database


## 🛠️ Tech Stack
Frontend

Next.js 13 (App Router)
React 18
Tailwind CSS
Socket.io Client
Lucide React (Icons)

Backend

Express.js
Socket.io
MongoDB with Mongoose
bcryptjs (Password encryption)
CORS

Database

MongoDB Atlas (Cloud)
Collections: users, messages

## Step 1: Registration

// Frontend (page.js):
User fills: {username: "wajiha", email: "w@mail.com", password: "12345"}
↓
fetch('http://localhost:4000/api/register', {data})
↓
// Backend (server.js):
Receives data → Encrypts password → Saves to MongoDB
↓
// MongoDB:
users collection mein save:
{
\_id: "abc123",
username: "wajiha",
email: "w@mail.com",
password: "encrypted_hash",
online: false
}
↓
// Backend Response:
{user: {\_id: "abc123", username: "wajiha"}}
↓
// Frontend:
localStorage.setItem('user', userData)
router.push('/chat')

## Step 2: Opening Chat

// Frontend (chat/page.js):
Page loads
↓
useEffect runs
↓
socket.connect() // Connect to backend
↓
// Backend (server.js):
io.on('connection') triggers
console.log('User connected:', socket.id)
↓
// Frontend:
socket.emit('join', {username: "wajiha", userId: "abc123"})
↓
// Backend:
Updates: User.findByIdAndUpdate("abc123", {online: true})
Fetches: Message.find() // Last 50 messages
Sends: socket.emit('previous-messages', messages)
Broadcasts: io.emit('user-joined', "wajiha joined")
↓
// Frontend:
socket.on('previous-messages') → setMessages(msgs)
Screen par messages dikhai dete hain

## Step 3: Sending Message

// Frontend:
User types: "Hello everyone!"
Clicks Send button
↓
handleSendMessage() runs
↓
socket.emit('send-message', {
userId: "abc123",
username: "wajiha",
text: "Hello everyone!"
})
↓
// Backend:
socket.on('send-message') receives data
↓
Saves to MongoDB:
Message.create({
user: "abc123",
username: "wajiha",
text: "Hello everyone!",
room: "general"
})
↓
Broadcasts to ALL users:
io.to('general').emit('receive-message', messageData)
↓
// Frontend (All Users):
socket.on('receive-message') → setMessages([...prev, newMsg])
↓
Screen par INSTANTLY dikhai deta hai!

## Socket

1- socket.connect(); // to connect
2- socket.emit('send-message', data); // Message sending, on backend, socket.on()
So emit() from frontend → triggers the corresponding on() handler on the server.
3- socket.on('receive-message', callback); // Message suno
4- socket.off("receive-message");

## 💡 Summary Table

| Method                                | Purpose                                              |
| ------------------------------------- | ---------------------------------------------------- |
| `socket.disconnect()`                 | Close the connection manually                        |
| `socket.connected`                    | Boolean — whether socket is connected                |
| `socket.id`                           | The unique ID for this socket (changes on reconnect) |
| `socket.reconnect()`                  | Try to reconnect manually if disconnected            |
| `socket.on("connect_error", handler)` | Listen for connection errors                         |

## 🧠 Real Chat Example Flow (Frontend ↔ Backend)

| Direction          | Function | Event               | Example               |
| ------------------ | -------- | ------------------- | --------------------- |
| 🧑‍💻 Client → Server | `emit()` | `"join"`            | User joins a room     |
| 🧑‍💻 Client → Server | `emit()` | `"send-message"`    | User sends message    |
| 🖥️ Server → Client | `on()`   | `"receive-message"` | Everyone gets message |
| 🖥️ Server → Client | `on()`   | `"online-users"`    | Updates online list   |
