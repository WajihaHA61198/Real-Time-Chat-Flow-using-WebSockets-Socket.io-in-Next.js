This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

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
