import React, { useContext } from "react";
import { Provider } from "../context/Provider";
import "./Welcome.css";

export default function WelcomeWidget({isVisible}) {
  const username = "Jah";
  const { array, arrayState, textOption, imageOption, videoOption } =
    useContext(Provider);

  return (
    <div style={isVisible}>
      <form className="widget-form" action="">
        <h1 className="header-text">Hi {username},</h1>
        <p className="subtext">
          I'm now powered by {array[arrayState].model_name}.{" "}
          {array[arrayState].welcome_text}
        </p>
        <button onClick={textOption} className="widget-buttons">
          <i style={{ fontSize: 20 }} className={array[0].icon}></i>
          <label htmlFor="create a chat" className="widget-start-type-buttons">
            Let's {array[0].name}!
          </label>
        </button>
        <button onClick={videoOption} className="widget-buttons">
          <i style={{ fontSize: 20 }} className={array[1].icon}></i>
          <label className="widget-start-type-buttons" htmlFor="create a video">
            Create a {array[2].name}
          </label>
        </button>
        <button onClick={imageOption} className="widget-buttons">
          <i style={{ fontSize: 20 }} className={array[2].icon}></i>
          <label
            className="widget-start-type-buttons"
            htmlFor="create an image"
          >
            Create a {array[1].name}
          </label>
        </button>
      </form>
    </div>
  );
}
