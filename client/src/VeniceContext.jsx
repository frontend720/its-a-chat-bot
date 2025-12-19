import React, { createContext, useState, useEffect } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
const VeniceContext = createContext();
import { storage } from "./config";
import { get } from "mongoose";

function VeniceProvider({ children }) {
  const [response, setResponse] = useState({});
  const [video, setVideo] = useState("");
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [url, setUrl] = useState("");
  const [isImageLoading, setIsImageLoading] = useState(true);

  const imageRef = ref(storage, `images/${uuidv4()}`);

  function createImageRef() {
    uploadBytes(imageRef, imageUrl)
      .then((snapshot) => {
        return getDownloadURL(snapshot.ref);
      })
      .then((url) => {
        setUrl(url);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  useEffect(() => {
    createImageRef();
  }, [imageUrl]);
  function onImageChange(e) {
    setImageUrl(e.target.files[0]);
  }
  function createQue(e) {
    e.preventDefault();
    const options = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_VENICE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // model: "wan-2.5-preview-image-to-video", 0.83
        // model: "wan-2.6-image-to-video", 0.83
        // model: "kling-2.5-turbo-pro-image-to-video", 0.39
        model: "longcat-distilled-image-to-video",
        prompt: prompt,
        duration: "10s",
        image_url: url,
        negative_prompt:
          "low resolution, error, worst quality, low quality, defects",

        resolution: "720p",
      }),
    };

    fetch("https://api.venice.ai/api/v1/video/queue", options)
      .then((res) => res.json())
      .then((res) => setResponse(res))
      .catch((err) => console.error(err));
    setIsImageLoading(false);
  }

  async function retrieveVideo() {
    // if (!response?.queue_id) return;

    const options = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_VENICE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // model: "wan-2.5-preview-image-to-video",
        // model: "wan-2.6-image-to-video",
        // model: "kling-2.5-turbo-pro-image-to-video",
        model: "longcat-distilled-image-to-video",
        queue_id: response?.queue_id,
        delete_media_on_completion: false,
      }),
    };

    try {
      let res = await fetch(
        "https://api.venice.ai/api/v1/video/retrieve",
        options
      );

      // Check if the response is actually a video file
      const contentType = res.headers.get("content-type");

      if (contentType && contentType.includes("video")) {
        // It's a binary video! Create a URL for it.
        const videoBlob = await res.blob();
        const videoUrl = URL.createObjectURL(videoBlob);
        console.log("Video processed! Download/View URL:", videoUrl);
        setVideo(videoUrl);
        setIsImageLoading(true);
        return;
      }

      // Otherwise, assume it's JSON status info
      let data = await res.json();

      if (data.status === "PROCESSING") {
        console.log("Still processing... retrying in 5s");
        await new Promise((resolve) => setTimeout(resolve, 5000));
        return retrieveVideo(); // Use recursion or your loop
      }

      if (data.status === "COMPLETED") {
        if (data.video_url) {
          console.log("Video URL from JSON:", data.video_url);
        } else {
          // Re-fetch once more to get the blob if URL isn't provided
          console.log(
            "Status completed, but no URL. File might be in the body."
          );
        }
      }
    } catch (err) {
      console.error("Error retrieving video:", err);
    }
  }

  function onPromptChange(e) {
    setPrompt(e.target.value);
  }

  useEffect(() => {
    retrieveVideo();
  }, [response]);

  return (
    <VeniceContext.Provider
      value={{
        createQue,
        retrieveVideo,
        onPromptChange,
        video,
        prompt,
        imageUrl,
        onImageChange,
        createImageRef,
        url,
        isImageLoading
      }}
    >
      {children}
    </VeniceContext.Provider>
  );
}

export { VeniceContext, VeniceProvider };
