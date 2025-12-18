import React, { useEffect, useState } from "react";

function Chat({ socket, username, room }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        room: room,
        author: username,
        message: currentMessage,
        time: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes(),
      };

      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]); // Add own message to UI
      setCurrentMessage(""); // Clear input box
    }
  };

  useEffect(() => {
    // Listen for history from MongoDB (Step 4 logic)
    socket.on("load_messages", (data) => {
      setMessageList(data);
    });

    // Listen for incoming messages
    socket.on("receive_message", (data) => {
      setMessageList((list) => [...list, data]);
    });

    // Clean up listeners when component closes
    return () => {
      socket.off("receive_message");
      socket.off("load_messages");
    };
  }, [socket]);

  return (
    <div className="chat-window">
      <div className="chat-header">
        <p>Live Chat - Room: {room}</p>
      </div>
      <div className="chat-body" style={{ height: "400px", overflowY: "auto", border: "1px solid #ddd", padding: "10px" }}>
        {messageList.map((messageContent, index) => {
          return (
            <div key={index} style={{ textAlign: username === messageContent.author ? "right" : "left" }}>
              <div style={{ 
                backgroundColor: username === messageContent.author ? "#007bff" : "#e9ecef", 
                color: username === messageContent.author ? "white" : "black",
                display: "inline-block", padding: "10px", borderRadius: "10px", margin: "5px" 
              }}>
                <p style={{ margin: 0 }}>{messageContent.message}</p>
                <span style={{ fontSize: "10px" }}>{messageContent.time} - {messageContent.author}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="chat-footer">
        <input
          type="text"
          value={currentMessage}
          placeholder="Hey..."
          onChange={(event) => setCurrentMessage(event.target.value)}
          onKeyPress={(event) => event.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>&#9658;</button>
      </div>
    </div>
  );
}

export default Chat;