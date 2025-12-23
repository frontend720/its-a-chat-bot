import { useContext } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import personas from "../persona.json";
import "./Chatscreen.css";
import { AvatarContext } from "../context/AvatarContext";
import { Provider } from "../context/Provider";

export default function ChatScreen({
  key,
  role,
  content,
  reference,
  className,
  image_url,
  toggleImageVideo,
  video,
  isVisibleChange,
  video_url,
  video_style,
  toggle_image_video_style,
  toggle_video_image_style,
  toggle_video,
  screen,
  timestamp,
  avatar,
  roleStyle,
  timestampRole,
  avatarBorder
}) {
  const { currentAvatar } = useContext(AvatarContext);

  return (
    <>
      <div key={key} className={className} ref={reference}>
        <div style={{ color: "red !important" }} className="message-bubble">
          <span className="label" style={roleStyle}>
            {role}
          </span>
          <img
            style={avatar}
            src={personas.personas[currentAvatar].avatar}
            alt=""
            className={avatarBorder}
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div className="markdown-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </div>
            <small style={timestampRole} className="timestamp">
              {timestamp}
            </small>
          </div>
        </div>
      </div>
    </>
  );
}

//messsage-bubble
