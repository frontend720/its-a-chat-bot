import { useState, useContext } from "react";
import { VeniceContext } from "./VeniceContext";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import { storage } from "./config";
import "./App.css";
import Chat from "./Chat";

function App() {
  const [count, setCount] = useState(0);
  const { video } = useContext(VeniceContext);
  console.log(video);
  return (
    <div className="App">
    <Chat/>
    </div>
  );
}

export default App;
