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

  const VITE_API_KEY = import.meta.env.VITE_GROK_API_KEY;
  const client = new OpenAI({
    apiKey: VITE_API_KEY,
    dangerouslyAllowBrowser: true,
    baseURL: "https://api.x.ai/v1"
  });

  async function newRequest(){
   const chat = await client.chat.completions.create({
      model: "grok-4-latest",
      messages: [
        {role: "system", content: "You are a helpful assistant"},
        {role: "user", content: "What are your capabilities"}
      ]
    })
    try {
      console.log(chat.choices[0].message.content)
    } catch (error) {
     console.log(error) 
    }
  }

  return (
    <div className="App">
      {!isAvatarScreenVisible ? <Chat /> : <AvatarSelectionScreen />}
    </div>
  );
}

export default App;
