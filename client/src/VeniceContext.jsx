import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
} from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { Provider } from "./context/Provider";
import { storage } from "./config";
import technicalDirectives from "./technical_directives.json";
import personas from "./persona.json";
import moment from "moment";
import { AvatarContext } from "./context/AvatarContext";
const VeniceContext = createContext();
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime)

function VeniceProvider({ children }) {

  console.log(dayjs(Date()).fromNow())
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

  //State start
  const [response, setResponse] = useState({});
  const [video, setVideo] = useState(null);
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

  console.log(typeof chat);

  function pushNewChat(e) {
    e.preventDefault();
    setChats((prev) => [...prev, ...chat]);
  }

  // console.log(chats);

  const [isWidgetVisible, setIsWidgetVisible] = useState(false);

  const [toggleImageVideo, setToggleImageVideo] = useState(true);
  const [isChatLoading, setIsChatLoading] = useState(false);

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

  function onChatPromptChange(e) {
    setChat_prompt(e.target.value);
  }

  // console.log(prompt, url);
  // console.log(chat);,

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

  const system_instructions = `
  System Prompt: ${personas.personas[currentAvatar].system_prompt} 
   Nickname: ${personas.personas[currentAvatar].nickname} 
   Instructions: ${technicalDirectives.instructions} 
   Backstory: ${backstories} 
   Your character traits are as follow: ${traits.join(
     ", "
   )}. You speak with a ${personas.personas[currentAvatar].speech_style}`;

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
        // model: array[0].model,
        model: "grok-41-fast",
        frequency_penalty: 1.5,
        max_completion_tokens: 1000,
        max_temp: 1.0,
        min_temp: 0.75,
        reasoning_effort: "medium",
        top_k: 30,
        messages: [
          {
            role: "system",
            content: system_instructions,
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
          timestamp: Date(),
        };
        setChat((prev) => [...prev, userMessage, assistantMessage]);
        setChat_prompt(null);
        setTokenCount(res.usage.total_tokens);
        setIsChatLoading(false);
      })
      .catch((error) => console.log(error));
    setIsChatLoading(true);
    setChat_prompt("");
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
        isChatLoading,
        totalTokens,
        setChat,
        setTotalTokens,
      }}
    >
      {children}
    </VeniceContext.Provider>
  );
}

export { VeniceContext, VeniceProvider };
