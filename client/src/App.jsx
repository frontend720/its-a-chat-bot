import { useState, useContext } from "react";
import { Provider } from "./context/Provider";
import "./App.css";
import Chat from "./Chat";
import AvatarSelectionScreen from "./Components/AvatarSelectionScreen";


function App() {
  const { isAvatarScreenVisible } = useContext(Provider);

  return (
    <div className="App">
      {!isAvatarScreenVisible ? <Chat /> : <AvatarSelectionScreen />}
    </div>
  );
}

export default App;
