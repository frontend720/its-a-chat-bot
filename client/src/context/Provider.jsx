import { createContext, useState } from "react";

const Provider = createContext();

function ProviderContext({ children }) {
  
  const [arrayState, setArrayState] = useState(0);
  const [isPremium, setIsPremium] = useState(false)
  const [isAvatarScreenVisible, setIsAvatarScreenVisible] = useState(false)

  function onIsAvatarScreenVisible(){
    setIsAvatarScreenVisible(prev => !prev)
  }



  function changeType(e) {
    e.preventDefault();
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


  const array = [
    {
      name: "Chat",
      icon: "fa-brands fa-x-twitter",
      placeholder: "What's on your mind?",
      model: isPremium ? "openai-gpt-oss-120b" : "venice-uncensored",
      model_name: isPremium ? "gpt-oss" : "grok",
      context_window: 2000000,
      welcome_text:
        "I can help you brainstorm complex ideas, write clean code, or summarize long documents in seconds.",
    },
    {
      name: "Image",
      icon: "fa-regular fa-image",
      placeholder: "Describe your image.",
      welcome_text:
        "I can help you design stunning visuals, from photorealistic portraits to abstract concepts, with a single prompt.",
        model_name: "Venice",
        context_window: 0,
    }
  ];
  return (
    <Provider.Provider
      value={{
        array,
        arrayState,
        textOption,
        imageOption,
        isAvatarScreenVisible,
        onIsAvatarScreenVisible,
        changeType
      }}
    >
      {children}
    </Provider.Provider>
  );
}

export { Provider, ProviderContext };
