import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [lat, setLat] = useState(null);
  const [lon, setLon] = useState(null);
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Get user's current location on component mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude);
          setLon(position.coords.longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Location access is needed for weather suggestions.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  }, []);

  const handleSend = async () => {
    if (!userInput.trim()) return;
    if (lat === null || lon === null) {
      alert("Location not available yet!");
      return;
    }

    setLoading(true);
    const newMessages = [...messages, { sender: "user", text: userInput }];
    setMessages(newMessages);
    setUserInput("");

    try {
      // Replace the URL below with your live backend URL if deployed.
      const url = `http://127.0.0.1:5000/get-ai-suggestion?query=${encodeURIComponent(
        userInput
      )}&lat=${lat}&lon=${lon}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.choices && data.choices.length > 0) {
        const aiText = data.choices[0].message.content;
        setMessages([...newMessages, { sender: "bot", text: aiText }]);
      } else {
        setMessages([
          ...newMessages,
          { sender: "bot", text: "Sorry, no AI response received." },
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
          <div key={idx} className={`chat-message ${msg.sender === "user" ? "user" : "bot"}`}>
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
