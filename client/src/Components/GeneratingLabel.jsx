import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { GiFairyWand } from "react-icons/gi";

export default function GeneratingLabel({ isVisible }) {
  let animationRef = useRef(null);
  function animate() {
    gsap.to(animationRef.current, {
      rotation: 360,
      duration: 3,
      repeat: Infinity,
      opacity: 1,
    });
  }

  const progressBarRef = useRef(null);

  function progressBarAnimation() {
    gsap.to(progressBarRef.current, {
      width: "100%",
      duration: 3,
      repeat: Infinity,
      display: "block",
      background: "#a7ff83",
    });
  }

  const labelRef = useRef(null);

  function progressBarLabel() {
    gsap.to(labelRef.current, {
      opacity: 0.5,
      ease: "strong.inOut",
      duration: 1.5,
      repeat: Infinity,
    });
  }

  useEffect(() => {
    animate();
    progressBarAnimation();
    progressBarLabel();
  }, []);
  return (
    <div
      style={isVisible ? { display: "block" } : { display: "none" }}
      className="progress-container"
    >
      <label ref={labelRef} className="progress-bar-label" htmlFor="">
        Creating your masterpiece!
      </label>
      <div className="animation-container">
        <div ref={progressBarRef} className="video-generation-progress-bar" />
        <h1 ref={animationRef}>
          <GiFairyWand color="#e8e8e8" />
        </h1>
      </div>
    </div>
  );
}
