import { createContext, useState, useEffect, useContext } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { Provider } from "./context/Provider";
import { storage } from "./config";
import technicalDirectives from "./technical_directives.json";
import personas from "./persona.json";
import { AvatarContext } from "./context/AvatarContext";
const VeniceContext = createContext();
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import OpenAI from "openai";
import axios from "axios";

dayjs.extend(relativeTime);

function VeniceProvider({ children }) {
  const VITE_API_KEY = import.meta.env.VITE_GROK_API_KEY;
  const client = new OpenAI({
    apiKey: VITE_API_KEY,
    dangerouslyAllowBrowser: true,
    baseURL: "https://api.x.ai/v1",
  });
  //Providers start
  const { array, arrayState } = useContext(Provider);
  const { currentAvatar, isNSFWEnabled } = useContext(AvatarContext);

  //Providers end
  const backstories = !isNSFWEnabled
    ? personas.personas[currentAvatar].backstory
    : personas.personas[currentAvatar].nsfw_backstory;
  const traits = !isNSFWEnabled
    ? personas.personas[currentAvatar].personality_traits.map((trait) => trait)
    : personas.personas[currentAvatar].nsfw_traits.map((trait) => trait);
  const systemPrompt = !isNSFWEnabled
    ? personas.personas[currentAvatar].system_prompt
    : personas.personas[currentAvatar].nsfw_system_prompt;

  //State start
  const [response, setResponse] = useState({});
  const [video, setVideo] = useState(() => {
    try {
      const savedVideoUrl = localStorage.getItem("video");
      return savedVideoUrl ? JSON.parse(savedVideoUrl) : null;
    } catch (error) {
      console.log("No video url saved", error);
      return null;
    }
  });
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [url, setUrl] = useState(null);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [tokenCount, setTokenCount] = useState(0);

  const [totalTokens, setTotalTokens] = useState(() => {
    try {
      const savedTokens = localStorage.getItem("token_count");
      return savedTokens ? JSON.parse(savedTokens) : 0;
    } catch (error) {
      console.log("No tokens have been used yet", error);
      return 0;
    }
  });

  useEffect(() => {
    localStorage.setItem("token_count", JSON.stringify(totalTokens));
  }, [totalTokens]);

  const [chat_prompt, setChat_prompt] = useState("");

  const [chat, setChat] = useState(() => {
    try {
      const savedChats = localStorage.getItem("chats");
      return savedChats && savedChats.length > 0 ? JSON.parse(savedChats) : [];
    } catch (error) {
      console.log("No chats to retrieve", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("chats", JSON.stringify(chat));
    } catch (error) {
      console.log(error);
    }
  }, [chat]);

  function pushNewChat(e) {
    e.preventDefault();
    setChats((prev) => [...prev, ...chat]);
  }

  const [isWidgetVisible, setIsWidgetVisible] = useState(false);
  const [toggleImageVideo, setToggleImageVideo] = useState(true);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [moderationError, setModerationError] = useState(null);
  const [imagePrompt, setImagePrompt] = useState(null);
  function onImageVisibleChage() {
    setToggleImageVideo((prev) => !prev);
  }
  //State end

  const imageRef = ref(storage, `images/${uuidv4()}`);

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
        const response = {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: url, // This must be the public download URL
              },
            },
          ],
        };
        setChat((prev) => [...prev, response]);
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

  function onChatPromptChange(e) {
    setChat_prompt(e.target.value);
  }

  useEffect(() => {
    setTotalTokens((prev) => prev + tokenCount);
  }, [tokenCount]);

  const [isVideoGenerating, setIsVideoGenerating] = useState(false);

  async function retrieveVideo() {
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
        const videoBlob = await res.blob();
        const videoFilRef = ref(storage, `chat_videos/${uuidv4()}.mp4`);
        try {
          const snapshot = await uploadBytes(videoFilRef, videoBlob);
          const permanentUrl = await getDownloadURL(snapshot.ref);
          setVideo(permanentUrl);
          localStorage.setItem("video", JSON.stringify(permanentUrl));
          const assistantVideoResponse = {
            role: "assistant",
            timestamp: Date(),
            content: [
              {
                type: "video_clip",
                video_url: {
                  url: permanentUrl,
                },
              },
            ],
          };
          setChat((prev) => [...prev, assistantVideoResponse]);
          setIsVideoGenerating(false);
          setIsImageLoading(true);
          setToggleImageVideo(false);
        } catch (error) {
          console.log("Firebase vidoe upload failed" + error);
        }
        onImageVisibleChage();
        return;
      }

      let data = await res.json();

      if (data.status === "PROCESSING") {
        console.log("Still processing... retrying in 5s");
        setIsVideoGenerating(true);
        await new Promise((resolve) => setTimeout(resolve, 5000));
        return retrieveVideo();
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

  useEffect(() => {
    if (video) {
      localStorage.setItem("video", JSON.stringify(video));
    }
  }, [video]);

  const system_instructions = `
  System Prompt: ${systemPrompt} 
   Nickname: ${personas.personas[currentAvatar].nickname}
   This characters sexual orientation is ${
     personas.personas[currentAvatar].sexual_orientation
   } 
   Instructions: ${technicalDirectives.instructions} 
   Backstory: ${backstories} 
   Your character traits are as follow: ${traits.join(
     ", "
   )}. You speak with a ${personas.personas[currentAvatar].speech_style}`;

  async function newRequest(e) {
    e.preventDefault();
    setIsChatLoading(true);
    setChat_prompt("");
    const userMessage = {
      role: "user",
      content: chat_prompt,
    };
   const sanitizedHistory = chat.map((msg) => {
    let content = msg.content;

    // Check if the content is a Base64 image string
    // We replace it with text so we don't send megabytes of data to Grok
    if (typeof content === "string" && content.startsWith("data:image")) {
      content = "[Assistant generated an image]";
    }

    return {
      role: msg.role,
      // The API requires content to be a non-empty string
      content: content || " ", 
    };
  });
    const request = await client.chat.completions.create({
      model: "grok-4-latest",

      messages: [
        {
          role: "system",
          content: system_instructions,
        },
        ...sanitizedHistory,
        userMessage,
      ],
    });
    try {
      if (!request.choices || !request.choices[0]) {
        console.error("API Error Response:", request);
        setIsChatLoading(false);
        return; // Stop the function from crashing
      }
      const assistantMessage = {
        role: "assistant",
        content: request.choices[0].message.content,
        timestamp: Date(),
      };
      setChat((prev) => [...prev, userMessage, assistantMessage]);
      setChat_prompt(null);
      setTokenCount(request.usage.total_tokens);
      setIsChatLoading(false);
    } catch (error) {
      console.log(error);
    }
  }

  const DEFAULT_NEGATIVE_PROMPT = "lowres, bad anatomy, bad hands, text, error, missing fingers, cropped, worst quality, low quality, watermark, blurry";


  async function generateImage(e) {
    e.preventDefault();
    setIsVideoGenerating(true)
    const userMessage = {
      role: "user",
      content: chat_prompt,
    };

    const data = {
      model: "lustify-sdxl",
      prompt: `${chat_prompt}, highly detailed, 8k, masterpiece, raw photo, f/1.8, 85mm, sharp focus`,
      cfg_scale: 6.25,
      embed_exif_metadata: false,
      format: "webp",
      height: 1024,
      hide_watermark: true,
      lora_strength: 50,
      negative_prompt: DEFAULT_NEGATIVE_PROMPT,
      return_binary: false,
      variants: 1,
      safe_mode: true,
      seed: 10,
      steps: 50,
      style_preset: "Analog Film",
      aspect_ratio: "1:1",
      resolution: "1K",
      enable_web_search: false,
      width: 1024
    };

    const config = {
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_VENICE_API_KEY}`,
        "Content-Type": "application/json",
      },
    };

    try {
      const response = await axios.post(
        "https://api.venice.ai/api/v1/image/generate",
        data,
        config
      );
      const assistantMessage = {
        role: "assistant",
        content: `data:image/webp;base64,${response.data.images[0]}`,
        isImage: true,
        timestamp: Date(),
      };
      setChat((prev) => [...prev, userMessage, assistantMessage]);
      console.log(response.data)
      setIsVideoGenerating(false)
    } catch (error) {
      console.error("Error details:", error.response?.data || error.message);
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
        chat_prompt,
        onChatPromptChange,
        chat,
        isChatLoading,
        totalTokens,
        setChat,
        setTotalTokens,
        isVideoGenerating,
        newRequest,
        generateImage,
      }}
    >
      {children}
    </VeniceContext.Provider>
  );
}

export { VeniceContext, VeniceProvider };
