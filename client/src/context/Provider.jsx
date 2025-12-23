import { createContext, useState, useRef, useEffect } from "react";

const Provider = createContext();

function ProviderContext({ children }) {
  
  const [arrayState, setArrayState] = useState(0);
  const [isPremium, setIsPremium] = useState(false)
  const [isAvatarScreenVisible, setIsAvatarScreenVisible] = useState(false)

  function onIsAvatarScreenVisible(){
    setIsAvatarScreenVisible(prev => !prev)
  }

  function premiumToggle(){
    setIsPremium((prev) => !prev);
  }

  function changeType(e) {
    // e.preventDefault();
    setArrayState((prev) => (prev + 1) % array.length);
  }

  function textOption(e) {
    e.preventDefault();
    setArrayState(0);
  }

  function imageOption(e) {
    e.preventDefault();
    setArrayState(1);
  }

  function videoOption(e) {
    e.preventDefault();
    setArrayState(2);
  }
  const array = [
    {
      name: "Chat",
      icon: "fa-brands fa-x-twitter",
      placeholder: "What's on your mind?",
      model: isPremium ? "openai-gpt-oss-120b" : "venice-uncensored",
      model_name: isPremium ? "gpt-oss" : "grok",
      context_window: 232000,
      welcome_text:
        "I can help you brainstorm complex ideas, write clean code, or summarize long documents in seconds.",
    },
    {
      name: "Video",
      icon: "fa-solid fa-video",
      placeholder: "Describe you video.",
      model: isPremium
        ? "longcat-distilled-image-to-video"
        : "wan-2.6-image-to-video",
      model_name: isPremium ? "longcat" : "wan",
      welcome_text:
        "I can help you transform static ideas into cinematic motion—just describe a scene to begin.",
    }
    // {
    //   name: "Image",
    //   icon: "fa-regular fa-image",
    //   placeholder: "Describe your image.",
    //   model: isPremium ? "nano-banana-pro" : "lustify-sdxl",
    //   model_name: isPremium ? "nano-banana" : "lustify",
    //   welcome_text:
    //     "I can help you design stunning visuals, from photorealistic portraits to abstract concepts, with a single prompt.",
    // },
  ];
  return (
    <Provider.Provider
      value={{
        array,
        arrayState,
        changeType,
        textOption,
        imageOption,
        videoOption,
        isAvatarScreenVisible,
        onIsAvatarScreenVisible
      }}
    >
      {children}
    </Provider.Provider>
  );
}

export { Provider, ProviderContext };
