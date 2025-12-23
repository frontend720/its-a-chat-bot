import React, { useContext, useState, useRef, useEffect } from "react";
import birds from "./assets/birds.mp4";
import { VeniceContext } from "./VeniceContext";
import { FaPlus } from "react-icons/fa6";
import { IoSend, IoAdd } from "react-icons/io5";
import { Provider } from "./context/Provider.jsx";
import "./Chat.css";
import WelcomeWidget from "./Components/WelcomeWidget.jsx";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ChatScreen from "./Components/ChatScreen.jsx";
import Header from "./Components/Header.jsx";
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime";
import calendar from "dayjs/plugin/calendar"
import { AvatarContext } from "./context/AvatarContext.jsx";

dayjs.extend(calendar)

export default function Chat() {
  const {
    createQue,
    video,
    onImageChange,
    url,
    prompt,
    onChatPromptChange,
    isImageLoading,
    isWidgetVisible,
    toggleImageVideo,
    onImageVisibleChage,
    chat_prompt,
    onPromptChange,
    chatCompletion,
    chat,
    isChatLoading,
    setChat,
    setTotalTokens,
    totalTokens,
    pushNewChat,
  } = useContext(VeniceContext);
  const {isNSFWEnabled} = useContext(AvatarContext)
  const { array, arrayState, changeType, onIsAvatarScreenVisible } =
    useContext(Provider);

  const [modelToggle, setModelToggle] = useState(false);

  function onModelChange(e) {
    e.preventDefault();
    setModelToggle((prev) => !prev);
    changeType();
  }

  // console.log(video);
  // console.log(chat_prompt);
  // console.log(typeof url);

  function newChat() {
    setTotalTokens(0);
    setChat([]);
    pushNewChat();
  }

  let tokenRef = useRef(null);
  let scrollRef = useRef(null);
  let containerRef = useRef(null);

  const [scrollButton, setScrollButton] = useState(false);

  function scrollToBottom() {
    scrollRef.current.scrollIntoView({ behavior: "smooth" });
    setScrollButton(false);
  }

  useEffect(() => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const isAtBottom = scrollHeight - scrollTop <= clientHeight + 100;
      if (isAtBottom) {
        scrollRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        setTimeout(() => {
          scrollToBottom();
        }, 0);
      } else if (chat.length > 0) {
        setTimeout(() => {
          setScrollButton(true);
        }, 0);
      }
    }
  }, [chat, isChatLoading]);

  const el = tokenRef.current;
  // console.log(url)

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
  }, [chat]);

  return (
    <div style={{ paddingTop: 25 }}>
      <Header onMenuToggle={onIsAvatarScreenVisible} onNewChatClick={newChat} />
      <div
        className={
          url === null ? "text-container" : "text-container-with-image"
        }
        ref={containerRef}
      >
        {scrollButton && <button onClick={scrollToBottom}>New Message</button>}
        <div style={isChatLoading ? { display: "none" } : { display: "" }}>
          {url !== null || (chat.length === 0 && <WelcomeWidget />)}
        </div>
        {chat?.map((msg, index) => (
          <ChatScreen
            key={index}
            className={`message-container ${
              msg.role === "user" ? "user-style" : "ai-style"
            } glass-card`}
            reference={index === chat.length - 1 ? scrollRef : null}
            role={msg.role === "user" ? "You:" : "AI:"}
            content={msg.content}
            timestamp={dayjs(msg.timestamp).calendar()}
            avatar={
              msg.role === "assistant"
                ? { width: 40, borderRadius: "50%" }
                : { display: "none" }
            }
            timestampRole={
              msg.role === "user" ? { display: "none" } : { display: "" }
            }
            roleStyle={
              msg.role === "user" ? { display: "" } : { display: "none" }
            }
            avatarBorder={isNSFWEnabled ? "nsfw-border" : "border"}
          />
        ))}
        <div />
        {isChatLoading && (
          <div className="message-container ai-style">
            <div className="message-bubble thinking-bubble">
              <div className="dot-flashing"></div>
            </div>
          </div>
        )}
      </div>
      <form action="">
        <input
          type="file"
          name="imageUrl"
          id="file-upload"
          style={{ display: "none" }}
          onChange={onImageChange}
        />
      </form>
      <div
        style={
          !toggleImageVideo
            ? {
                position: "relative",
                width: "90%",
                margin: "0 auto",
                paddingTop: 24,
              }
            : { display: "none" }
        }
      >
        <img className="src-image" src={url} width="100%" />

        <div
          style={isImageLoading ? { display: "none" } : { display: "block" }}
          className="screen"
        ></div>
      </div>
      <div>
        <video
          style={toggleImageVideo ? { display: "block" } : { display: "none" }}
          controls
          className={video === null ? "src-video-hidden" : "src-video"}
          width="100%"
          src={video}
        ></video>
        <button
          className="toggle-image-video-button"
          style={video !== null ? { marginLeft: "5%" } : { display: "none" }}
          onClick={onImageVisibleChage}
        >
          {toggleImageVideo ? "View Reference" : "View Video"}
        </button>
      </div>
      <form action="">
        <div className="textarea-container">
          <textarea
            placeholder={array[arrayState].placeholder}
            name="prompt"
            value={modelToggle ? prompt : chat_prompt}
            onChange={modelToggle ? onPromptChange : onChatPromptChange}
            id=""
          ></textarea>
          <div className="button-container">
            <div
              style={!modelToggle ? { opacity: 0 } : { opacity: 1 }}
              className="form-button"
            >
              <label htmlFor="file-upload">
                <IoAdd size="20px" />
              </label>
            </div>
            <div className="change-send-buttons">
              <label className="model_name" htmlFor="">
                {array[arrayState].model_name}
              </label>
              <button
                style={{
                  color: "#e8e8e8",
                  border: "none",
                }}
                className="toggle-type-button"
                onClick={onModelChange}
              >
                <i
                  style={{ fontSize: 20 }}
                  className={array[arrayState].icon}
                ></i>
              </button>
              <button
                // disabled={totalTokens >= 25000 ? true : false}
                style={
                  chat_prompt?.length === 0 && prompt?.length === 0
                    ? { display: "none" }
                    : { display: "block" }
                }
                onClick={modelToggle ? createQue : chatCompletion}
                className="form-button"
              >
                <IoSend size="20px" />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
