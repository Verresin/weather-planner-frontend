import React, { useState } from "react";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Hard-code lat/lon for demonstration
  const LAT = "37.7749";
  const LON = "-122.4194";

  const handleSend = async () => {
    if (!userInput.trim()) return;

    // Add user's message to the chat
    const newMessages = [...messages, { sender: "user", text: userInput }];
    setMessages(newMessages);
    setUserInput("");
    setLoading(true);

    try {
      // Call your Flask backend
      const url = `http://127.0.0.1:5000/get-ai-suggestion?query=${encodeURIComponent(
        userInput
      )}&lat=${LAT}&lon=${LON}`;
      const response = await fetch(url);
      const data = await response.json();

      // Check AI response
      if (data.choices && data.choices.length > 0) {
        const aiText = data.choices[0].message.content;
        setMessages([...newMessages, { sender: "bot", text: aiText }]);
      } else {
        // Fallback if no AI message
        setMessages([
          ...newMessages,
          { sender: "bot", text: "Sorry, I couldn't fetch an answer." },
        ]);
      }
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setMessages([
        ...newMessages,
        { sender: "bot", text: "Error contacting the server." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <h1 className="title">🌤️ Weather Chatbot</h1>
      <div className="chat-box">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`chat-message ${msg.sender === "user" ? "user" : "bot"}`}
          >
            <p>{msg.text}</p>
          </div>
        ))}
        {loading && (
          <div className="chat-message bot">
            <p>Thinking...</p>
          </div>
        )}
      </div>

      <div className="input-row">
        <input
          type="text"
          placeholder="Ask about the weather..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
        />
        <button onClick={handleSend} disabled={loading}>
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}

export default App;
