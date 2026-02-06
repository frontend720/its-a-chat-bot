import { useContext, useEffect, useRef, useState } from "react";
import persona from "../persona.json";

import { AvatarContext } from "../context/AvatarContext";
import { VeniceContext } from "../VeniceContext";
import { Provider } from "../context/Provider";
import gsap from "gsap";
import "./AvatarSelectionScreen.css";
import personas from "../persona.json";

export default function App() {
  const {
    handleChange,
    preference,
    handleChatType,
    isNSFWEnabled,
    currentAvatar,
  } = useContext(AvatarContext);

 const { onIsAvatarScreenVisible, array, arrayState } = useContext(Provider);
  const { totalTokens } = useContext(VeniceContext);

  const widthRef = useRef(null);

  const currentModel = array && array[arrayState] ? array[arrayState] : { context_window: 1 };
  const contextWidth = (totalTokens / currentModel.context_window) * 100;

  useEffect(() => {
    if (widthRef.current) {
      if (contextWidth <= 50) {
        widthRef.current.style.background = `#17b978`;
      } else if (contextWidth > 50 && contextWidth <= 75) {
        widthRef.current.style.background = "#ff9f68";
      } else if (contextWidth > 75) {
        widthRef.current.style.background = "#f85959";
      }
    }
  }, [totalTokens, contextWidth]);

  useEffect(() => {
    if (widthRef.current) {
      gsap.to(widthRef.current, {
        padding: 3,
        borderRadius: 25,
        width: `${contextWidth}%`,
        duration: 2,
      });
    }
  }, [totalTokens, onIsAvatarScreenVisible, contextWidth]);

 
  if (!personas || !personas.personas || !personas.personas[currentAvatar]) {
      return <div className="avatar-card">Loading...</div>;
  }
  return (
    <div className="">
      <button onClick={onIsAvatarScreenVisible} className="close-screen">
        <i class="fa-solid fa-xmark"></i>
      </button>
      <div className="avatar-card">
        <img
          style={{ width: 100, borderRadius: "50%" }}
          // className={isNSFWEnabled && persona.personas[currentAvatar].nsfw_backstory.length > 0 ? "nsfw-border" : "water-ripple"}
          className={isNSFWEnabled ? "nsfw-border" : "water-ripple"}
          src={persona.personas[currentAvatar].avatar}
          width="100%"
          alt={persona.personas[currentAvatar]?.alt}
        />
        <label className="name" htmlFor="">
          {persona.personas[currentAvatar].name}
        </label>
        <small className="persona">
          {persona.personas[currentAvatar].backstory}
        </small>
        <button
          className="change-persona-button"
          onClick={(e) => {
            e.stopPropagation();
            handleChange();
          }}
        >
          Change Avatar
        </button>
      </div>
      <div className="button-wrapper">
        <button
          style={
            persona.personas[currentAvatar]?.nsfw_backstory
              ? { display: "block" }
              : { display: "none" }
          }
          onClick={handleChatType}
          className={
            isNSFWEnabled ? "chat-type-button-nsfw" : "chat-type-button"
          }
        >
          <i
            className={
              isNSFWEnabled ? "fa-solid fa-fire" : "fa-regular fa-face-smile"
            }
          ></i>
        </button>
      </div>
      <div style={{ width: "90%", margin: "35px auto" }}>
        <small className="memory-depth-label" htmlFor="">
          Memory Depth:{" "}
        </small>
        <small className="memory-depth-label" htmlFor="">
          {totalTokens === 0
            ? "Fresh"
            : `${(
                (totalTokens / array[arrayState].context_window) *
                100
              ).toFixed(2)}%`}
        </small>
        <div ref={widthRef} className="progress-bar" />
      </div>
    </div>
  );
}
