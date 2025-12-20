import { useState, useContext } from "react";
import { VeniceContext } from "./VeniceContext";
import "./App.css";
import Chat from "./Chat";
import ChatScreen from "./Components/ChatScreen"

function App() {
  return (
    <div className="App">
      <Chat />
      {/* <ChatScreen /> */}
    </div>
  );
}

export default App;
