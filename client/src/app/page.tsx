"use client";
import React, { useEffect, useState } from "react";
import ImageSlider from "./components/dashboard/home/movieCarousel";
import MovieSlider from "./components/dashboard/home/recommendedMovies";
import TheaterNearBy from "./components/dashboard/home/theatersNearBy";
import useStore from "@/src/store";

export default function Home() {
  const store: any = useStore();
  const [location, setLocation] = useState<string | null>(null);

  useEffect(() => {
    const currentLocation = store.pincode;
    if (currentLocation) {
      setLocation(currentLocation);
    }
  }, [store]);

  const ChatBox: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [userMessage, setUserMessage] = useState("");
    const [chatHistory, setChatHistory] = useState<{ sender: string; message: string }[]>([]);

    const toggleChat = () => {
      setIsOpen(!isOpen);
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        sendMessage();
      }
    };

    const sendMessage = async () => {
      if (!userMessage.trim()) return;

      // Add user's message to chat history
      setChatHistory((prev) => [...prev, { sender: "You", message: userMessage }]);
      setUserMessage("");

      try {
        const response = await fetch("http://localhost:8080/rag/query", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: userMessage }),
        });

        const data = await response.json();

        if (response.ok && data.status === "success") {
          if (data.data && Array.isArray(data.data)) {
            // Iterate through the list of theaters and add them to the chat history
            const theaters = data.data
              .map(
                (theater: { name: string; address: string; contact_number: string }) =>
                  `Name: ${theater.name}, Address: ${theater.address}, Contact: ${theater.contact_number}`
              )
              .join("\n");
            setChatHistory((prev) => [...prev, { sender: "Bot", message: theaters }]);
          } else {
            // If no specific theater data is available
            setChatHistory((prev) => [...prev, { sender: "Bot", message: data.message }]);
          }
        } else {
          // Handle error responses
          setChatHistory((prev) => [...prev, { sender: "Bot", message: data.message || "An error occurred." }]);
        }
      } catch (error) {
        console.error("Error:", error);
        setChatHistory((prev) => [
          ...prev,
          { sender: "Bot", message: "Something went wrong. Please try again later." },
        ]);
      }
    };

    return (
      <>
        <button
          onClick={toggleChat}
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            backgroundColor: "#0078ff",
            color: "#fff",
            border: "none",
            borderRadius: "50px",
            padding: "15px 20px",
            cursor: "pointer",
            fontSize: "16px",
            fontFamily: "Arial, sans-serif",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            transition: "all 0.3s ease",
          }}
        >
          Chat With Us
        </button>

        {isOpen && (
          <div
            style={{
              position: "fixed",
              bottom: "10%",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "#ffffff",
              width: "400px",
              maxHeight: "300px",
              borderRadius: "10px",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                backgroundColor: "#0078ff",
                color: "#fff",
                padding: "15px",
                fontSize: "18px",
                fontFamily: "Segoe UI, sans-serif",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h2 style={{ margin: 0 }}>Chat Assistant</h2>
              <span
                onClick={toggleChat}
                style={{
                  cursor: "pointer",
                  fontSize: "24px",
                  fontWeight: "bold",
                }}
              >
                ×
              </span>
            </div>
            <div
              style={{
                flex: 1,
                padding: "15px",
                overflowY: "auto",
                fontFamily: "Segoe UI, sans-serif",
                fontSize: "14px",
              }}
            >
              {chatHistory.map((entry, index) => (
                <p key={index}>
                  <strong>{entry.sender}:</strong> {entry.message}
                </p>
              ))}
            </div>
            <div
              style={{
                padding: "15px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <input
                type="text"
                value={userMessage}
                placeholder="Type your question..."
                onChange={(e) => setUserMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                style={{
                  flex: 1,
                  padding: "10px",
                  fontSize: "14px",
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                }}
              />
              <button
                onClick={sendMessage}
                style={{
                  backgroundColor: "#0078ff",
                  color: "#fff",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontFamily: "Arial, sans-serif",
                }}
              >
                Send
              </button>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <>
      <ImageSlider />
      <MovieSlider />
      {location && <TheaterNearBy location={location} />}
      <ChatBox />
    </>
  );
}
