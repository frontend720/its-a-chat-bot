import React, { useContext, useState } from "react";
import { VeniceContext } from "./VeniceContext";
import { FaPlus } from "react-icons/fa6";
import { IoSend, IoAdd } from "react-icons/io5";
import "./Chat.css";

export default function Chat() {
  const {
    createQue,
    video,
    onImageChange,
    url,
    prompt,
    onPromptChange,
    isImageLoading,
  } = useContext(VeniceContext);

  const array = [
    {
      name: "Chat",
      icon: "fa-regular fa-comment-dots",
      placeholder: "What's on your mind?",
    },
    {
      name: "Video",
      icon: "fa-solid fa-video",
      placeholder: "Describe you video.",
    },
    {
      name: "Image",
      icon: "fa-regular fa-image",
      placeholder: "Describe your image.",
    },
  ];
  const [arrayState, setArrayState] = useState(0);

  console.log(array[arrayState].name, array[arrayState].icon);

  function changeType(e) {
    e.preventDefault();
    setArrayState((prev) => (prev + 1) % array.length);
  }

  console.log(video);
  return (
    <div>
      <form action="">
        <input
          type="file"
          name="imageUrl"
          id="file-upload"
          style={{ display: "none" }}
          onChange={onImageChange}
        />
        {/* <button onClick={createImageRef}>Upload Image</button> */}
      </form>
      <div
        style={{
          position: "relative",
          width: "90%",
          margin: "0 auto",
          paddingTop: 24,
        }}
      >
        <img
          style={
            video.length !== 0 ? { display: "none" } : { display: "block" }
          }
          className="src-image"
          src={url}
          width="100%"
          alt=""
        />
        <div
          style={isImageLoading ? { display: "none" } : { display: "block" }}
          className="screen"
        >
          <label htmlFor="">Creating your masterpiece!</label>
        </div>
      </div>
      <video
        style={
          video.length === 0
            ? { display: "none" }
            : { display: "block", paddingTop: 24 }
        }
        controls
        width="100%"
        src={video}
      ></video>
      <form action="">
        <div className="textarea-container">
          <textarea
            placeholder={array[arrayState].placeholder}
            name="prompt"
            value={prompt}
            onChange={onPromptChange}
            id=""
          ></textarea>
          <div className="button-container">
            <div className="form-button">
              <label htmlFor="file-upload">
                <IoAdd size="20px" />
              </label>
            </div>
            <div className="change-send-buttons">
              <button
                style={{
                  background: "transparent",
                  color: "#e8e8e8",
                  border: "none",
                }}
                onClick={changeType}
              >
                <i
                  style={{ fontSize: 20 }}
                  className={array[arrayState].icon}
                ></i>
              </button>
              <button
                style={
                  prompt.length === 0
                    ? { display: "none" }
                    : { display: "block" }
                }
                onClick={createQue}
                className="form-button"
              >
                <IoSend size="20px" />
              </button>
            </div>
          </div>
        </div>
        {/* <button onClick={createQue}>Generate Video</button> */}
      </form>
    </div>
  );
}
