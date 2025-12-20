import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
} from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
const VeniceContext = createContext();
import { Provider } from "./context/Provider";
import { storage } from "./config";
import technicalDirectives from "./technical_directives.json";

function VeniceProvider({ children }) {
  //Providers start
  const { array, arrayState } = useContext(Provider);
  //Providers end

  console.log(array[0].model);

  //State start
  const [response, setResponse] = useState({});
  const [video, setVideo] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [url, setUrl] = useState(null);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [tokenCount, setTokenCount] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);

  const [chat_prompt, setChat_prompt] = useState("");
  const [chat, setChat] = useState([]);

  const [isWidgetVisible, setIsWidgetVisible] = useState(false);

  const [toggleImageVideo, setToggleImageVideo] = useState(true);

  function onImageVisibleChage() {
    setToggleImageVideo((prev) => !prev);
  }
  //State end

  function widgetVisibilityToggle() {
    setIsWidgetVisible((prev) => !prev);
  }
  const imageRef = ref(storage, `images/${uuidv4()}`);

  function refinePrompt() {}

  // Create reference image in firebase storage
  function createImageRef() {
    if (!imageUrl) return;
    uploadBytes(imageRef, imageUrl)
      .then((snapshot) => {
        return getDownloadURL(snapshot.ref);
      })
      .then((url) => {
        setUrl(url);
        setIsWidgetVisible(true);
        setToggleImageVideo(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  useEffect(() => {
    createImageRef();
  }, [imageUrl]);

  function createQue(e) {
    e.preventDefault();
    const options = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_VENICE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // model: "kling-2.5-turbo-pro-image-to-video",
        model: array[1].model,
        prompt: prompt + ". " + technicalDirectives.directions,
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

  function chatCompletion(e) {
    e.preventDefault();
    const userMessage = {
      role: "user",
      content: chat_prompt,
    };
    const options = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_VENICE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: array[0].model,
        frequency_penalty: 1.5,
        max_completion_tokens: 500,
        max_temp: 1.25,
        min_temp: 0.75,
        reasoning_effort: "medium",
        top_k: 30,
        messages: [
          {
            role: "system",
            content: technicalDirectives.venice_prompt_engineering,
          },
          ...chat,
          userMessage,
        ],
      }),
    };
    fetch("https://api.venice.ai/api/v1/chat/completions", options)
      .then((res) => res.json())
      .then((res) => {
        const assistantMessage = {
          role: "assistant",
          content: res.choices[0].message.content,
        };
        setChat((prev) => [...prev, userMessage, assistantMessage]);
        setChat_prompt(null);
        setTokenCount(res.usage.total_tokens);
      })
      .catch((error) => console.log(error));
  }

  function onChatPromptChange(e) {
    setChat_prompt(e.target.value);
  }

  // console.log(prompt, url);
  console.log(chat);

  useEffect(() => {
    setTotalTokens((prev) => prev + tokenCount);
  }, [tokenCount]);

  console.log(totalTokens);

  async function retrieveVideo() {
    // if (!response?.queue_id) return;

    const options = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_VENICE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: array[1].model,
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
        setToggleImageVideo(false);
        onImageVisibleChage();
        return;
      }

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
          console.log(
            "Status completed, but no URL. File might be in the body."
          );
        }
      }
    } catch (err) {
      console.error("Error retrieving video:", err);
    }
  }

  // Handle Changes start
  function onPromptChange(e) {
    setPrompt(e.target.value);
  }

  function onImageChange(e) {
    setImageUrl(e.target.files[0]);
  }
  // Handle Changes end

  const newRequests = async (model) => {
    if (model === "longcat-distilled-image-to-video") {
      return "longcat-distilled-image-to-video";
    }
    if (model === "nano-banana-pro") {
      return "nano-banana-pro";
    }
    if (model === "openai-gpt-oss-120b") {
      return "openai-gpt-oss-120b";
    }
  };

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
        isImageLoading,
        isWidgetVisible,
        toggleImageVideo,
        onImageVisibleChage,
        chatCompletion,
        chat_prompt,
        onChatPromptChange,
        chat,
      }}
    >
      {children}
    </VeniceContext.Provider>
  );
}

export { VeniceContext, VeniceProvider };
