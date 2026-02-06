import { createContext, useState, useEffect, useContext } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { Provider } from "./context/Provider";
import { storage } from "./config";
import technicalDirectives from "./technical_directives.json";
import personas from "./persona.json";
import { AvatarContext } from "./context/AvatarContext";
const VeniceContext = createContext();
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import OpenAI from "openai";
import axios from "axios";

dayjs.extend(relativeTime);

function VeniceProvider({ children }) {
  const VITE_API_KEY = import.meta.env.VITE_GROK_API_KEY;
  const client = new OpenAI({
    apiKey: VITE_API_KEY,
    dangerouslyAllowBrowser: true,
    baseURL: "https://api.x.ai/v1",
  });
  //Providers start
  const { currentAvatar, isNSFWEnabled } = useContext(AvatarContext);

  //Providers end
  const backstories = !isNSFWEnabled
    ? personas.personas[currentAvatar].backstory
    : personas.personas[currentAvatar].nsfw_backstory;
  const traits = !isNSFWEnabled
    ? personas.personas[currentAvatar].personality_traits.map((trait) => trait)
    : personas.personas[currentAvatar].nsfw_traits.map((trait) => trait);
  const systemPrompt = !isNSFWEnabled
    ? personas.personas[currentAvatar].system_prompt
    : personas.personas[currentAvatar].nsfw_system_prompt;

  //State start
  const [video] = useState(() => {
    try {
      const savedVideoUrl = localStorage.getItem("video");
      return savedVideoUrl ? JSON.parse(savedVideoUrl) : null;
    } catch (error) {
      console.log("No video url saved", error);
      return null;
    }
  });
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [url, setUrl] = useState(null);
  const [isImageLoading] = useState(true);
  const [tokenCount, setTokenCount] = useState(0);
  const [isWidgetVisible, setIsWidgetVisible] = useState(false);
  const [toggleImageVideo, setToggleImageVideo] = useState(true);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isVideoGenerating, setIsVideoGenerating] = useState(false);
  const [chat_prompt, setChat_prompt] = useState("");

  // Localstorage state
  const [totalTokens, setTotalTokens] = useState(() => {
    try {
      const savedTokens = localStorage.getItem("token_count");
      return savedTokens ? JSON.parse(savedTokens) : 0;
    } catch (error) {
      console.log("No tokens have been used yet", error);
      return 0;
    }
  });

  useEffect(() => {
    localStorage.setItem("token_count", JSON.stringify(totalTokens));
  }, [totalTokens]);

  console.log(totalTokens);

  const [chat, setChat] = useState(() => {
    try {
      const savedChats = localStorage.getItem("chats");
      return savedChats && savedChats.length > 0 ? JSON.parse(savedChats) : [];
    } catch (error) {
      console.log("No chats to retrieve", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("chats", JSON.stringify(chat));
    } catch (error) {
      console.log(error);
    }
  }, [chat]);
  // End localstorage state

  //State end

  const imageRef = ref(storage, `images/${uuidv4()}`);

  // Create reference image in firebase storage


  // Requests

  function createImageRef() {
    if (!imageUrl) return;
    uploadBytes(imageRef, imageUrl)
      .then((snapshot) => {
        return getDownloadURL(snapshot.ref);
      })
      .then((url) => {
        setUrl(url);
        setIsWidgetVisible(true);
        setToggleImageVideo(false);
        const response = {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: url,
              },
            },
          ],
        };
        setChat((prev) => [...prev, response]);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  useEffect(() => {
    createImageRef();
  }, [imageUrl]);

  // function tokenCounter(){

  // }
  useEffect(() => {
    
    setTotalTokens((prev) => prev + tokenCount);
  }, [tokenCount]);

  useEffect(() => {
    if (video) {
      localStorage.setItem("video", JSON.stringify(video));
    }
  }, [video]);

  // const system_instructions = `
// System Prompt: ${systemPrompt} 
// Before EVERY response, **internally verify** the CURRENT ACTIVE PERSONA from the latest provided JSON (id, name, nickname, traits, speech_style, backstory, etc.). User may **SWITCH PERSONAS mid-conversation**—**immediately adapt** to the new one **seamlessly** (no OOC comments). Stay **100% immersed**: use exact speech_style, traits, quirks; reference SFW backstory only. If unclear, default to last JSON.
// Nickname: ${personas.personas[currentAvatar].nickname}
// This characters sexual orientation is ${
//     personas.personas[currentAvatar].sexual_orientation
//   } 
// Instructions: ${technicalDirectives.instructions} 
// Backstory: ${backstories} 
// **QUIRKS** (MANDATORY: Weave 1or 2 imto the chat to blend SFW backstory/job/hobbies with NSFW traits organically): ${
//     personas.personas[currentAvatar].quirks
//   }
// Your character traits are as follow: ${traits.join(
//     ", "
//   )}. You speak with a natural ${
//     personas.personas[currentAvatar].speech_style
//   }. use slang sparingly, don't lean into stereotypes. You are currently in ${
//     isNSFWEnabled
//       ? "SFW Mode. Strictly no sexual innuendo or sexually suggestive responses allowed unless initiated by user, keep it PG-13"
//       : "NSFW mode"
//   }`;

// const system_instructions = `System Prompt: ${systemPrompt}
// Before EVERY response, **internally verify** the CURRENT ACTIVE PERSONA from the latest provided JSON (id, name, nickname, traits, speech_style, backstory, etc.). User may **SWITCH PERSONAS mid-conversation**—**immediately adapt** to the new one **seamlessly** (no OOC comments). Stay **100% immersed**: use exact speech_style, traits, quirks; reference SFW backstory only. If unclear, default to last JSON.

// Nickname: ${personas.personas[currentAvatar].nickname}
// This character's sexual orientation is ${personas.personas[currentAvatar].sexual_orientation}

// **CORE RESPONSE RULES** (MANDATORY - Apply to EVERY output):
// - Write in **complete sentences** with **proper grammar, punctuation, and spelling**. Avoid run-on sentences, fragments, or abbreviations that obscure meaning (e.g., use "throbbing" not "throbbin'" unless it fits natural urban flow).
// - Ensure **coherent flow**: Structure responses logically—start with scene/setting, build actions/dialogue sequentially, end with a natural hook or transition. Make every response **easy to read and follow** like a vivid story.
// - **Urban style**: Speak with a natural ${personas.personas[currentAvatar].speech_style}—infuse urban street vibe (slang like "king," "stack it up," "boss") **sparingly and naturally** for flavor. Prioritize **clarity and rhythm** over excess slang/chaos. No stereotypes.
// - **Emojis**: Use **1-3 max per response**, only for emphasis (e.g., 🔥 for heat, 💦 for intensity). No spam.
// - **Length & Pacing**: 100-200 words. Vivid, sensory details (sights, sounds, feels) but concise. Build tension progressively.

// Instructions: ${technicalDirectives.instructions}

// Backstory: ${backstories}

// **QUIRKS** (MANDATORY: Weave **exactly 1-2** into each response organically, blending SFW backstory/job/hobbies with NSFW traits):
// ${personas.personas[currentAvatar].quirks}

// Your character traits are as follows: ${traits.join(", ")}

// You are currently in ${!isNSFWEnabled ? "SFW Mode. Strictly no sexual innuendo or sexually suggestive responses allowed unless initiated by user; keep it PG-13." : "NSFW Mode. Deliver vivid, explicit, consensual descriptions with urban edge—focus on sensations, power dynamics, and immersion."}`

const system_instructions = `System Prompt: ${systemPrompt}

PERSONA SELECTION (MANDATORY)
- Before every response, internally load the CURRENT ACTIVE PERSONA from the latest provided JSON (id, name, nickname, traits, speech_style, backstory, quirks).
- The user may switch personas mid-conversation; switch immediately and seamlessly (no OOC, no meta commentary).
- Stay fully in character: apply the persona’s speech_style, traits, and vibe consistently.
- Only reference backstory elements that are SFW (job, hobbies, habits, goals). Do not invent contradictory backstory.

IDENTITY CONTEXT
- Nickname: ${personas.personas[currentAvatar].nickname}
- Sexual orientation: ${personas.personas[currentAvatar].sexual_orientation}
- Traits: ${traits.join(", ")}
- Speech style: ${personas.personas[currentAvatar].speech_style}
- Backstory: ${backstories}

QUIRKS (MANDATORY)
- Weave EXACTLY 1–2 quirks into each response organically (not as a list, not forced):
${personas.personas[currentAvatar].quirks}

MODE GATING (MANDATORY)
- Current mode: ${isNSFWEnabled ? "NSFW Mode" : "SFW Mode"}
- If SFW Mode: keep it PG-13; no sexual content or innuendo.
- If NSFW Mode: explicit sexual content is allowed; keep it coherent, consensual, and readable.

POV + “REAL TEXTING” RULE (MANDATORY)  ✅ tweak #1
- Write in FIRST PERSON, PRESENT TENSE (“I…”, “I’m…”, “I want…”), like a real person texting.
- Address the user in SECOND PERSON (“you…”) only to speak to them, not to puppeteer them.
- Do NOT narrate the user’s actions as facts unless the user explicitly stated them.
  - Instead: ask, invite, or confirm (“You want me to…?” “Tell me what you do next.” “Are you doing that?”).

NSFW BLEND RULE (MANDATORY WHEN NSFW MODE IS ACTIVE)  ✅ tweak #2
- Blend cinematic scene + dirty talk (text-thread style).
- Default balance: ~40% scene/action beats, ~60% dialogue/thought.
- Cadence rule: after every 1–2 action/scene sentences, include 1 short line of dialogue.
- Adaptive shift:
  - If the user asks to “set the scene / describe / paint the vibe,” shift to ~60% scene.
  - If the user sends short horny texts, shift to 70–80% dialogue (short, reactive lines).
- Always include at least 1 grounding detail per message (where I am / what I’m doing / what I want next).

OUTPUT SPEC (MANDATORY — APPLY EVERY RESPONSE)
- Clarity first: complete sentences, correct punctuation, no run-on walls of text.
- Structure: 2–5 short paragraphs OR 4–10 text-like lines (match the user’s pacing).
- Dialogue formatting: use quotes for spoken lines; keep each quoted line under ~12 words unless the user asks for longer.
- Length target: 300-550 words unless the user requests otherwise.
- Urban tone: “street-smooth,” not caricature.
  - Slang budget: max 6 slang terms per 150 words.
  - Stylized spellings (e.g., “poppin’”, “throbbin’”): max 3 per response.
- Metaphors: max 2 per response. No stacking random comparisons.
- Emojis: max 0–2 per response. No chains.

QUALITY CHECK (SILENT, BEFORE SENDING)
- Does it read like a believable text from one person?
- Are positions/actions physically consistent (no jump cuts)?
- Did I avoid narrating the user’s actions as facts?
- Did I include EXACTLY 1–2 quirks?
- Did I obey the current mode rules?

TECHNICAL DIRECTIVES
${technicalDirectives.instructions}`
  async function newRequest(e) {
    e.preventDefault();
    setIsChatLoading(true);
    setChat_prompt("");
    const userMessage = {
      role: "user",
      content: chat_prompt,
    };
    const sanitizedHistory = chat.map((msg) => {
      let content = msg.content;

      // I need to check to see if the content is a Base64 image string
      if (typeof content === "string" && content.startsWith("data:image")) {
        content = "[Assistant generated an image]";
      }

      return {
        role: msg.role,
        content: content || " ",
      };
    });
    const request = await client.chat.completions.create({
      model: "grok-4-1-fast-reasoning",
      messages: [
        {
          role: "system",
          content: system_instructions,
        },
        ...sanitizedHistory,
        userMessage,
      ],
    });
    try {
      if (!request.choices || !request.choices[0]) {
        console.error("API Error Response:", request);
        setIsChatLoading(false);
        return;
      }
      const assistantMessage = {
        role: "assistant",
        content: request.choices[0].message.content,
        timestamp: Date(),
        avatar: personas.personas[currentAvatar].avatar
      };
      setChat((prev) => [...prev, userMessage, assistantMessage]);
      setChat_prompt(null);
      setTokenCount(request.usage.total_tokens);
      setIsChatLoading(false);
    } catch (error) {
      console.log(error);
    }
  }

  const DEFAULT_NEGATIVE_PROMPT =
    "lowres, bad anatomy, bad hands, text, error, missing fingers, cropped, worst quality, low quality, watermark, blurry";

  // Generate an image

  async function generateImage(e) {
    setChat_prompt("");
    e.preventDefault();
    setIsVideoGenerating(true);
    const userMessage = {
      role: "user",
      content: chat_prompt,
    };

    const data = {
      model: "lustify-sdxl",
      prompt: `${chat_prompt}, highly detailed, 8k, masterpiece, raw photo, f/1.8, 85mm, sharp focus`,
      cfg_scale: 6.25,
      embed_exif_metadata: false,
      format: "webp",
      height: 1024,
      hide_watermark: true,
      lora_strength: 50,
      negative_prompt: DEFAULT_NEGATIVE_PROMPT,
      return_binary: false,
      variants: 1,
      safe_mode: false,
      seed: 10,
      steps: 50,
      style_preset: "Analog Film",
      aspect_ratio: "1:1",
      resolution: "1K",
      enable_web_search: false,
      width: 1024,
    };

    const config = {
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_VENICE_API_KEY}`,
        "Content-Type": "application/json",
      },
    };

    try {
      const response = await axios.post(
        "https://api.venice.ai/api/v1/image/generate",
        data,
        config
      );
      const assistantMessage = {
        role: "assistant",
        content: `data:image/webp;base64,${response.data.images[0]}`,
        isImage: true,
        timestamp: Date(),
        avatar: personas.personas[currentAvatar].avatar
      };
      setChat((prev) => [...prev, userMessage, assistantMessage]);
      console.log(response.data);
      setIsVideoGenerating(false);
      setTotalTokens((prev) => prev + 1);
      setTokenCount((prev) => prev + 1);
    } catch (error) {
      console.error("Error details:", error.response?.data || error.message);
    }
  }

  // End requests

  // Handle Changes start
  function onPromptChange(e) {
    setPrompt(e.target.value);
  }

  function onImageChange(e) {
    setImageUrl(e.target.files[0]);
  }

  function onImageVisibleChage() {
    setToggleImageVideo((prev) => !prev);
  }

  function onChatPromptChange(e) {
    setChat_prompt(e.target.value);
  }
  // Handle Changes end

  return (
    <VeniceContext.Provider
      value={{
        onChatPromptChange,
        onPromptChange,
        createImageRef,
        onImageChange,
        onImageVisibleChage,
        video,
        prompt,
        imageUrl,
        url,
        isImageLoading,
        isWidgetVisible,
        toggleImageVideo,
        chat_prompt,
        chat,
        isChatLoading,
        totalTokens,
        isVideoGenerating,
        setChat,
        setTotalTokens,
        newRequest,
        generateImage,
      }}
    >
      {children}
    </VeniceContext.Provider>
  );
}

export { VeniceContext, VeniceProvider };
