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
  const contextWidth = (totalTokens / array[arrayState].context_window) * 100;

  useEffect(() => {
    if (contextWidth <= 50) {
      widthRef.current.style.background = `#17b978`;
    } else if (contextWidth > 50 && contextWidth <= 75) {
      widthRef.current.style.background = "#ff9f68";
    } else if (contextWidth > 75) {
      widthRef.current.style.background = "#f85959";
    }
  }, [totalTokens]);

  const [permissionStatus, setPermissionStatus] = useState(
    Notification.permission
  );

  // 1. Request Permission (Must be a button click)
  function askPermission() {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notifications");
      return;
    }

    Notification.requestPermission().then((permission) => {
      setPermissionStatus(permission);
      if (permission === "granted") {
        console.log("Permission granted!");
      } else {
        console.log("Permission denied :(");
      }
    });
  }

  const [permissionStatuses, setPermissionStatuses] = useState("denied")

  useEffect(() => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notifications");
      return;
    }

    Notification.requestPermission().then((permission) => {
      setPermissionStatus(permission);
      if (permission === "granted") {
        setPermissionStatuses("Permission granted!");
      } else {
        console.log("Permission denied :(");
      }
    });
  }, []);

  // 2. Fire Notification (Must be granted first)
  function sendNotification(txt) {
    if (permissionStatus === "granted") {
      const notification = new Notification(
        "New message from " + personas.personas[currentAvatar].nickname,
        {
          body: txt,
          icon: personas.personas[currentAvatar].avatar,
        }
      );

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } else {
      return
    }
    console.log("run");
  }

  useEffect(() => {
    sendNotification("Your'e in!")
  }, [permissionStatuses])

  useEffect(() => {
    gsap.to(widthRef.current, {
      padding: 3,
      borderRadius: 25,
      width: `${contextWidth}%`,
      duration: 2,
    });
  }, [totalTokens, onIsAvatarScreenVisible]);
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
