import React, { useState, useEffect, useRef, useContext } from "react";
import { AvatarContext } from "../context/AvatarContext";
import { VeniceContext } from "../VeniceContext";
import personas from "../persona.json";

import "./Header.css";

function Header({ onNewChatClick, onMenuToggle, tokens }) {
  const {
    currentAvatar,
    isNSFWEnabled,
    isHamburgerVisible,
    onHamburgerVisibleChange,
  } = useContext(AvatarContext);
  const { totalTokens, chat } = useContext(VeniceContext);

  const tokenRef = useRef(null);

  //   const totalTokens = 21400;
  const el = tokenRef.current;

  useEffect(() => {
    if (el) {
      let statusColor;

      const maxLimit = 2000000;

      if (totalTokens < maxLimit * 0.8) {
        statusColor = "#4ade80"; // Green
      } else if (totalTokens < maxLimit * 0.95) {
        statusColor = "#facc15"; // Yellow
      } else {
        statusColor = "#ef4444"; // Red
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

  return (
    <header className="header">
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
      <label ref={tokenRef} className="token_counter">
        {isNSFWEnabled ? (
          <i
            style={{ marginRight: 10, color: "orange" }}
            className="fa-solid fa-fire"
          ></i>
        ) : (
          ""
        )}
        {personas.personas[currentAvatar].nickname}
      </label>
      <div
        className="new-chat-container"
        style={
          chat.length === 0
            ? { opacity: 0, pointerEvents: "none" }
            : { opacity: 1 }
        }
        onClick={onNewChatClick}
      >
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
