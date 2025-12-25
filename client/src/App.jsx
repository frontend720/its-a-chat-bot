import { useState, useContext } from "react";
import { VeniceContext } from "./VeniceContext";
import { Provider } from "./context/Provider";
import "./App.css";
import Chat from "./Chat";
import ChatScreen from "./Components/ChatScreen";
import AvatarSelectionScreen from "./Components/AvatarSelectionScreen";
import OpenAI from "openai";

function App() {
  const { isAvatarScreenVisible } = useContext(Provider);

  return (
    <div className="App">
      {!isAvatarScreenVisible ? <Chat /> : <AvatarSelectionScreen />}
    </div>
  );
}

export default App;
