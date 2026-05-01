"use client";

import { useEffect, useRef, useState } from "react";
import { createClientBrowser } from "@/lib/supabase/client";

export function useWebRTC({ sessionId, localStream, isInitiator }) {
  const supabase = createClientBrowser();

  const pcRef = useRef(null);
  const channelRef = useRef(null);

  const [remoteStream, setRemoteStream] = useState(null);
  const [connected, setConnected] = useState(false);
  const [peerReady, setPeerReady] = useState(false);

  // 1) Create RTCPeerConnection
  useEffect(() => {
    if (!sessionId) return;

    console.log("[WebRTC] Setting up RTCPeerConnection");

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pcRef.current = pc;

    // When remote video/audio arrives
    pc.ontrack = (event) => {
      console.log("[WebRTC] Received remote track");

      const inboundStream = event.streams[0];

      // Push the REAL remote stream into React state
      setRemoteStream(inboundStream);
    };

    pc.onconnectionstatechange = () => {
      console.log("[WebRTC] Connection state:", pc.connectionState);
      setConnected(pc.connectionState === "connected");
    };

    return () => {
      pc.close();
      pcRef.current = null;
      setConnected(false);
      setRemoteStream(null);
      setPeerReady(false);
    };
  }, [sessionId]);

  // 2) Add local tracks
  useEffect(() => {
    if (!localStream) return;
    if (!pcRef.current) return;

    console.log("[WebRTC] Adding local tracks (webcam ready)");

    const pc = pcRef.current;
    const senders = pc.getSenders();
    const existingTracks = senders.map((s) => s.track);

    localStream.getTracks().forEach((track) => {
      if (!existingTracks.includes(track)) {
        pc.addTrack(track, localStream);
      }
    });
  }, [localStream]);

  // 3) Signalling
  useEffect(() => {
    if (!sessionId) return;
    if (!pcRef.current) return;

    const pc = pcRef.current;

    console.log("[WebRTC] Creating signalling channel");

    const channel = supabase.channel(`webrtc-${sessionId}`);

    // SIGNAL LISTENER
    channel.on("broadcast", { event: "signal" }, async (msg) => {
      console.log("[WebRTC] Received signalling wrapper:", msg);

      const payload = msg.payload;
      if (!payload) return;

      const { type, sdp, candidate } = payload;

      console.log("[WebRTC] Parsed signalling:", payload);

      try {
        if (type === "offer") {
          console.log("[WebRTC] Handling offer");
          await pc.setRemoteDescription({ type: "offer", sdp });

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          console.log("[WebRTC] Sending answer");

          channel.send({
            type: "broadcast",
            event: "signal",
            payload: {
              type: "answer",
              sdp: answer.sdp,
            },
          });
        }

        if (type === "answer") {
          console.log("[WebRTC] Handling answer");
          await pc.setRemoteDescription({ type: "answer", sdp });
        }

        if (type === "ice" && candidate) {
          console.log("[WebRTC] Handling ICE candidate");
          await pc.addIceCandidate(candidate);
        }
      } catch (err) {
        console.error("WebRTC signalling error:", err);
      }
    });

    // READY HANDSHAKE
    channel.on("broadcast", { event: "ready" }, (msg) => {
      console.log("[WebRTC] Peer reported ready:", msg);
      setPeerReady(true);
    });

    channel.subscribe((status) => {
      console.log("[WebRTC] Channel status:", status);

      if (status === "SUBSCRIBED") {
        console.log("[WebRTC] Signalling channel ready");
        channelRef.current = channel;

        // Announce readiness
        channel.send({
          type: "broadcast",
          event: "ready",
          payload: { ready: true },
        });
      }
    });

    // ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && channelRef.current) {
        console.log("[WebRTC] Sending ICE candidate");

        channelRef.current.send({
          type: "broadcast",
          event: "signal",
          payload: {
            type: "ice",
            candidate: event.candidate,
          },
        });
      }
    };

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
      setPeerReady(false);
    };
  }, [sessionId]);

  // 4) Start call
  const startCall = async () => {
    if (!pcRef.current || !channelRef.current) {
      console.log("[WebRTC] Cannot start call — channel not ready");
      return;
    }
    if (!isInitiator) return;
    if (!peerReady) {
      console.log("[WebRTC] Peer not ready yet, delaying offer");
      return;
    }

    const pc = pcRef.current;
    const channel = channelRef.current;

    try {
      console.log("[WebRTC] Creating offer");

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      console.log("[WebRTC] Sending offer");

      channel.send({
        type: "broadcast",
        event: "signal",
        payload: {
          type: "offer",
          sdp: offer.sdp,
        },
      });
    } catch (err) {
      console.error("Error starting call:", err);
    }
  };

  return {
    remoteStream,
    connected,
    startCall,
    channelReady: !!channelRef.current,
    peerReady,
  };
}
