import React, { useContext, useState } from "react";
import birds from "./assets/birds.mp4";
import { VeniceContext } from "./VeniceContext";
import { FaPlus } from "react-icons/fa6";
import { IoSend, IoAdd } from "react-icons/io5";
import { Provider } from "./context/Provider.jsx";
import "./Chat.css";
import WelcomeWidget from "./Components/WelcomeWidget.jsx";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
  } = useContext(VeniceContext);
  const { array, arrayState, changeType } = useContext(Provider);

  console.log(video);
  console.log(chat_prompt);
  console.log(typeof chat)
  return (
    <div>
      <div className="text-container">
        {url !== null || (chat.length === 0 && <WelcomeWidget />)}
        {/* <WelcomeWidget
          isVisible={
            isWidgetVisible ? { display: "none" } : { display: "block" }
          }
        /> */}
        {chat?.map((msg, index) => (
          <div
            key={index}
            className={`message-container ${
              msg.role === "user" ? "user-style" : "ai-style"
            } glass-card`}
          >
            <div style={{ color: "red !important" }} className="message-bubble">
              <span className="label">
                {msg.role === "user" ? "You:" : "AI:"}
              </span>
              <div className="markdown-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
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
        >
          <label htmlFor="">Creating your masterpiece!</label>
        </div>
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
            value={chat_prompt}
            onChange={onChatPromptChange}
            id=""
          ></textarea>
          <div className="button-container">
            <div className="form-button">
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
                onClick={changeType}
              >
                <i
                  style={{ fontSize: 20 }}
                  className={array[arrayState].icon}
                ></i>
              </button>
              <button
                style={
                  chat_prompt?.length === 0
                    ? { display: "none" }
                    : { display: "block" }
                }
                onClick={chatCompletion}
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
