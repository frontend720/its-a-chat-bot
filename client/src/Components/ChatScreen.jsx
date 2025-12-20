import { useContext, useEffect } from "react";
import { VeniceContext } from "../VeniceContext";

export default function ChatScreen() {
  const { chat } = useContext(VeniceContext);
  console.log(chat);
  return (
    <div>
      {chat?.map((msg, index) => (
        <div
          key={index}
        //   className={`message-container ${
        //     msg.role === "user" ? "user-style" : "ai-style"
        //   }`}
        >
          <div className="">
            <small className="label">
              {msg.role === "user" ? "You" : "AI"}
            </small>
            <p>{msg.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

//messsage-bubble
