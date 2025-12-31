import { useContext } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import personas from "../persona.json";
import "./ChatScreen.css";
import { AvatarContext } from "../context/AvatarContext";
import { Provider } from "../context/Provider";
import {
  ChatSegment,
  Head,
  Table,
  TableData,
  TableHeader,
} from "../Styles/ChatComponentStyles";

export default function ChatScreen({
  key,
  role,
  content,
  reference,
  className,
  video,
  timestamp,
  avatar,
  roleStyle,
  timestampRole,
  avatarBorder,
  image_ref,
  image_url,
  avatar_url
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
            src={avatar_url}
            alt=""
            className={avatarBorder}
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div className="markdown-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ChatSegment,
                  table: Table,
                  th: TableHeader,
                  thead: Head
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
            <img
              style={{ borderRadius: 25 }}
              src={image_ref}
              width="100%"
              alt=""
            />
            {video && video.length > 0 && (
              <video controls src={video[0]} className="src-video">
                Your browser does not support the video tag.
              </video>
            )}
            <img
              style={{ borderRadius: 15 }}
              src={image_url}
              width="100%"
              alt=""
            />
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
