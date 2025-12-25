import React, { useState, useEffect, useRef, useContext } from "react";
import { AvatarContext } from "../context/AvatarContext";
import { VeniceContext } from "../VeniceContext";
import personas from "../persona.json";

import "./Header.css";

function Header({ onNewChatClick, onMenuToggle, tokens }) {
  const { currentAvatar, isNSFWEnabled } = useContext(AvatarContext);
  const { totalTokens, chat } = useContext(VeniceContext);
  const [isHamburgerVisible, setIsHamburgerVisible] = useState(false);
  const tokenRef = useRef(null);

  function onHamburgerVisibleChange() {
    setIsHamburgerVisible(true);
  }

  //   const totalTokens = 21400;
  const el = tokenRef.current;

  useEffect(() => {
    if (el) {
      let statusColor;

      if (totalTokens < 15000) {
        statusColor = "#4ade80"; // Vibrant Green
      } else if (totalTokens < 22000) {
        statusColor = "#facc15"; // Warning Yellow
      } else if (totalTokens < 25001) {
        statusColor = "#ef4444"; // Danger Red
      }

      el.style.color = statusColor;
      el.style.transition = "color 0.5s ease-in-out"; // Smoothly morph between states
    }
  }, [totalTokens]);
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onHamburgerVisibleChange();
    }, 1500);
    return () => clearTimeout(timeoutId);
  }, [isHamburgerVisible]);

  console.log(chat)

  return (
    <header className="header">
      {/* Left Column (flex: 1) */}
      <div onClick={onMenuToggle} className="menu-button">
        <label
          className={`title ${isHamburgerVisible ? "fade-out" : "fade-in"}`}
        >
          MUSE
        </label>
        <i
          style={{ fontSize: 24 }}
          className={`fa-solid fa-bars hamburger-icon ${
            isHamburgerVisible ? "fade-in" : "fade-out"
          }`}
        ></i>
      </div>
      <label
        ref={tokenRef}
        className="token_counter"
        // style={totalTokens === 0 ? { display: "none" } : {}}
      >
        {isNSFWEnabled ? (
          <i style={{ marginRight: 10 , color: "orange"}} className="fa-solid fa-fire"></i>
        ) : (
          ""
        )}
        {personas.personas[currentAvatar].nickname}
      </label>

      {/* Right Column (flex: 1) */}
      <div className="new-chat-container" style={chat.length === 0 ? { opacity: 0, pointerEvents: "none" } : { opacity: 1 }} onClick={onNewChatClick}>
        <i
          style={{ fontSize: 16, marginRight: 8 }}
          className="fa-solid fa-pen-to-square"
        ></i>
        <label className="new-label">New</label>
      </div>
    </header>
  );
}

export default Header;
