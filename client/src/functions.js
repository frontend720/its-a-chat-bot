let =array

function createQue(e) {
    e.preventDefault();
    const options = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_VENICE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: array[1].model,
        prompt: prompt + ". " + technicalDirectives.directions,
        duration: "10s",
        image_url: url,
        negative_prompt:
          "low resolution, error, worst quality, low quality, defects",

        resolution: "720p",
      }),
    };

    fetch("https://api.venice.ai/api/v1/video/queue", options)
      .then((res) => res.json())
      .then((res) => setResponse(res))
      .catch((err) => console.error(err));
    setIsImageLoading(false);
  }

  function onChatPromptChange(e) {
    setChat_prompt(e.target.value);
  }

  useEffect(() => {
    setTotalTokens((prev) => prev + tokenCount);
  }, [tokenCount]);

  const [isVideoGenerating, setIsVideoGenerating] = useState(false);

  async function retrieveVideo() {
    const options = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_VENICE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: array[1].model,
        queue_id: response?.queue_id,
        delete_media_on_completion: false,
      }),
    };

    try {
      let res = await fetch(
        "https://api.venice.ai/api/v1/video/retrieve",
        options
      );

      // Check if the response is actually a video file
      const contentType = res.headers.get("content-type");

      if (contentType && contentType.includes("video")) {
        const videoBlob = await res.blob();
        const videoFilRef = ref(storage, `chat_videos/${uuidv4()}.mp4`);
        try {
          const snapshot = await uploadBytes(videoFilRef, videoBlob);
          const permanentUrl = await getDownloadURL(snapshot.ref);
          setVideo(permanentUrl);
          localStorage.setItem("video", JSON.stringify(permanentUrl));
          const assistantVideoResponse = {
            role: "assistant",
            timestamp: Date(),
            content: [
              {
                type: "video_clip",
                video_url: {
                  url: permanentUrl,
                },
              },
            ],
          };
          setChat((prev) => [...prev, assistantVideoResponse]);
          setIsVideoGenerating(false);
          setIsImageLoading(true);
          setToggleImageVideo(false);
        } catch (error) {
          console.log("Firebase vidoe upload failed" + error);
        }
        onImageVisibleChage();
        return;
      }

      let data = await res.json();

      if (data.status === "PROCESSING") {
        console.log("Still processing... retrying in 5s");
        setIsVideoGenerating(true);
        await new Promise((resolve) => setTimeout(resolve, 5000));
        return retrieveVideo();
      }

      if (data.status === "COMPLETED") {
        if (data.video_url) {
          console.log("Video URL from JSON:", data.video_url);
        } else {
          console.log(
            "Status completed, but no URL. File might be in the body."
          );
        }
      }
    } catch (err) {
      console.error("Error retrieving video:", err);
    }
  }

  useEffect(() => {
    if (video) {
      localStorage.setItem("video", JSON.stringify(video));
    }
  }, [video]);
