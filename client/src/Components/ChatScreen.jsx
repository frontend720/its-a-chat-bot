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
  video_display,
  timestamp,
  avatar,
  roleStyle,
  timestampRole,
  avatarBorder,
  image_ref,
  isVisible,
  // video
}) {
  const { currentAvatar } = useContext(AvatarContext);
  console.log(typeof video_display);
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
            <img src={image_ref} width="100%" alt="" />
            {video && video.length > 0 && (
              <video controls src={video[0]} className="src-video">
                Your browser does not support the video tag.
              </video>
            )}
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
