"use client";

import { useState, useEffect, useRef } from "react";
import { socket } from "@/lib/socket";
import { Send, LogOut, MessageCircle, User } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  // All msgs store here
  // Example: [{text: "Hello", user: "wajiha"}, {text: "Hi", user: "ali"}]
  const [newMessage, setNewMessage] = useState("");
  // User abhi jo type kar raha hai
  // Example: "Hello everyone!"
  const [onlineUsers, setOnlineUsers] = useState([]);
  // Kaun kaun online hai
  // Example: [{username: "wajiha"}, {username: "ali"}]
  const [currentUser, setCurrentUser] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  // Socket connected hai ya nahi?
  const messagesEndRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    // Get user from localStorage
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/");
      return;
    }

    const user = JSON.parse(userStr);
    setCurrentUser(user);

    // Connect socket
    socket.connect();

    socket.on("connect", () => {
      console.log("✅ Connected to server");
      setIsConnected(true);
      // Backend ko batao: "Main join kar raha hoon"
      socket.emit("join", { username: user.username, userId: user._id });
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from server");
      setIsConnected(false);
    });

    // Listen for previous messages
    socket.on("previous-messages", (msgs) => {
      // console.log("📥 Received previous messages:", msgs.length);
      setMessages(msgs);
    });

    // Listen for new messages
    socket.on("receive-message", (message) => {
      // console.log("📩 New message:", message);
      setMessages((prev) => [...prev, message]);
    });

    // Listen for online users
    socket.on("online-users", (users) => {
      // console.log("👥 Online users:", users.length);
      setOnlineUsers(users);
    });

    // Listen for user joined
    socket.on("user-joined", (data) => {
      // console.log("✅ User joined:", data.username);
      setMessages((prev) => [
        ...prev,
        {
          _id: Date.now().toString(),
          type: "system",
          text: data.message,
        },
      ]);
    });

    // Listen for user left
    socket.on("user-left", (data) => {
      // console.log("❌ User left:", data.username);
      setMessages((prev) => [
        ...prev,
        {
          _id: Date.now().toString(),
          type: "system",
          text: data.message,
        },
      ]);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("previous-messages");
      socket.off("receive-message");
      socket.off("online-users");
      socket.off("user-joined");
      socket.off("user-left");
      socket.disconnect();
    };
  }, [router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() && currentUser && isConnected) {
      // console.log("📤 Sending message:", newMessage);
      socket.emit("send-message", {
        userId: currentUser._id,
        username: currentUser.username,
        text: newMessage.trim(),
      });
      setNewMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    socket.disconnect();
    router.push("/");
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-8 h-8 text-emerald-600" />
            <h1 className="text-2xl font-bold text-gray-800">ChatFlow</h1>
            {!isConnected && (
              <span className="text-sm text-red-500 flex items-center gap-1">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                Disconnected
              </span>
            )}
            {isConnected && (
              <span className="text-sm text-green-500 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Connected
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full">
              <User className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-purple-900">
                {currentUser.username}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex gap-4 p-4 overflow-hidden">
        {/* Sidebar - Online Users */}
        <aside className="hidden md:block w-64 bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            Online ({onlineUsers.length})
          </h2>
          <div className="space-y-2">
            {onlineUsers.map((user) => (
              <div
                key={user._id}
                className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold">
                  {user.username[0].toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {user.username}
                  {user._id === currentUser._id && " (You)"}
                </span>
              </div>
            ))}
          </div>
        </aside>

        {/* Messages Area */}
        <main className="flex-1 flex flex-col bg-white rounded-lg shadow-md overflow-hidden">
          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">
                  No messages yet. Start the conversation!
                </p>
              </div>
            )}
            {messages.map((msg) => {
              if (msg.type === "system") {
                return (
                  <div key={msg._id} className="text-center">
                    <span className="inline-block px-4 py-1 bg-gray-200 text-gray-600 rounded-full text-sm">
                      {msg.text}
                    </span>
                  </div>
                );
              }

              const isOwnMessage = msg.userId === currentUser._id;
              return (
                <div
                  key={msg._id}
                  className={`flex ${
                    isOwnMessage ? "justify-end" : "justify-start"
                  }`}
                >
                  <div className={`max-w-xs lg:max-w-md`}>
                    {!isOwnMessage && (
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {msg.username[0].toUpperCase()}
                        </div>
                        <span className="text-xs font-medium text-gray-600">
                          {msg.username}
                        </span>
                      </div>
                    )}
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        isOwnMessage
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-none"
                          : "bg-gray-200 text-gray-800 rounded-bl-none"
                      }`}
                    >
                      <p className="break-words">{msg.text}</p>
                    </div>
                    <span className="text-xs text-gray-500 mt-1 block">
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 bg-gray-50 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-900 focus:outline-none transition"
                placeholder="Type a message..."
                maxLength={500}
                disabled={!isConnected}
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || !isConnected}
                className="px-6 py-3 bg-gradient-to-r from-emerald-800 to-green-900 text-white rounded-lg font-semibold hover:from-emerald-800 hover:to-green-900 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-5 h-5" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
