import { createContext, useState, useEffect } from "react";
import personas from "../persona.json";
const AvatarContext = createContext();

function AvatarContextProvider({ children }) {
  const [prefError, setPrefError] = useState(null);
  const [settingsError, setSettingsError] = useState(null);
  const [currentAvatar, setCurrentAvatar] = useState(() => {
    try {
      const savedPreference = localStorage.getItem("avatar");
      return savedPreference ? JSON.parse(savedPreference) : 0;
    } catch (error) {
      () =>
        setPrefError(
          "Unable to retrieve preference, reset preference in settings tab.",
          error
        );
      return 0;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("avatar", JSON.stringify(currentAvatar));
    } catch (error) {
      () =>
        setPrefError("Unable to save your chat preference, try again.", error);
    }
  }, [currentAvatar]);

  const [isNSFWEnabled, setIsNSFWEnabled] = useState(() => {
    try {
      const savedSetting = localStorage.getItem("isNSFW");
      return savedSetting ? JSON.parse(savedSetting) : false;
    } catch (error) {
      setSettingsError("Unable to save your chat setting, try again.", error);
      return false;
    }
  });

//   console.log(isNSFWEnabled);

  useEffect(() => {
    try {
      localStorage.setItem("isNSFW", JSON.stringify(isNSFWEnabled));
    } catch (error) {
      () => setSettingsError("Unable to saved chat mode.", error);
    }
  }, [isNSFWEnabled]);

  function handleChatType() {
    setIsNSFWEnabled((prev) => !prev);
  }

  function handleChange() {
    setCurrentAvatar((prev) => (prev + 1) % personas?.personas.length);
  }

  const personalities = isNSFWEnabled
    ? personas?.personas[currentAvatar]?.nsfw_backstory
    : personas?.personas[currentAvatar]?.backstory;

  return (
    <AvatarContext.Provider
      value={{
        handleChange,
        handleChatType,
        isNSFWEnabled,
        personalities,
        currentAvatar,
        settingsError,
        prefError,
      }}
    >
      {children}
    </AvatarContext.Provider>
  );
}

export { AvatarContext, AvatarContextProvider };
