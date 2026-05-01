"use client";

import { useEffect, useRef, useState } from "react";

export function useWebcam(options = { video: true, audio: false }) {
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    let active = true;
    let localStream;

    async function startCamera() {
      try {
        const s = await navigator.mediaDevices.getUserMedia(options);
        if (!active) return;

        localStream = s;
        setStream(s);

        // Auto‑bind to video element if provided
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      } catch (err) {
        console.error("Webcam error:", err);
        setError(err);
      }
    }

    startCamera();

    return () => {
      active = false;

      // Stop all tracks on cleanup
      if (localStream) {
        localStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);


  return { stream, error, videoRef };
}
