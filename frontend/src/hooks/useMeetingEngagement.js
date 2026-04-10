import { useState, useEffect, useRef, useCallback } from 'react';

// The ID's are static for demo purposes. In a real app, these come from auth/routing.
const MEETING_ID = "DEMO_MEETING_123";
const USER_ID = "60d0fe4f5311236168a109ca"; 
const API_BASE = "http://localhost:5000/api/engagement";

export default function useMeetingEngagement() {
  const [engagementData, setEngagementData] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isConsentGiven, setIsConsentGiven] = useState(false);
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  
  // Audio state manually verified
  const audioContextRef = useRef(null);
  const speakingAccumulatorRef = useRef(0);
  const lastSpeakingLogTimeRef = useRef(Date.now());
  const isCurrentlySpeakingRef = useRef(false);
  const speakingStartThresholdRef = useRef(0);
  
  const pollingIntervalRef = useRef(null);
  const trackingIntervalRef = useRef(null);

  const startTracking = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
      streamRef.current = stream;
      setIsCameraActive(true);
      setIsConsentGiven(true);
      
      initAudioTracking(stream);
      startIntervals();
    } catch (err) {
      console.error("Error accessing media devices.", err);
      alert("Please allow camera and microphone access to join the meeting.");
    }
  };

  const stopTracking = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) audioContextRef.current.close();
    clearInterval(pollingIntervalRef.current);
    clearInterval(trackingIntervalRef.current);
    setIsCameraActive(false);
    setIsConsentGiven(false);
  }, []);

  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  const initAudioTracking = (stream) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioContextRef.current = audioContext;
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);
    microphone.connect(analyser);
    analyser.fftSize = 512;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const checkVolume = () => {
      if (!audioContextRef.current) return;
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;

      const IS_SPEAKING_THRESHOLD = 30; 
      
      if (average > IS_SPEAKING_THRESHOLD) {
        if (speakingStartThresholdRef.current === 0) {
           speakingStartThresholdRef.current = Date.now();
        } else {
           // check if > 2 seconds anti-fake sustained burst
           const duration = (Date.now() - speakingStartThresholdRef.current) / 1000;
           if (duration >= 2) {
             isCurrentlySpeakingRef.current = true;
           }
        }
      } else {
        if (isCurrentlySpeakingRef.current) {
          // Stopped speaking after a valid duration
          const duration = (Date.now() - speakingStartThresholdRef.current) / 1000;
          speakingAccumulatorRef.current += duration;
        }
        isCurrentlySpeakingRef.current = false;
        speakingStartThresholdRef.current = 0;
      }
      requestAnimationFrame(checkVolume);
    };
    checkVolume();
  };

  const sendSpeakingBatch = async () => {
    // Also include whatever active duration is currently happening bounds it
    let totalBatch = speakingAccumulatorRef.current;
    if (isCurrentlySpeakingRef.current) {
        const dur = (Date.now() - speakingStartThresholdRef.current) / 1000;
        totalBatch += dur;
        speakingStartThresholdRef.current = Date.now(); // reset moving threshold relative chunk
    }
    
    if (totalBatch > 0) {
        try {
            await fetch(`${API_BASE}/track-speaking`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ meetingId: MEETING_ID, userId: USER_ID, duration: totalBatch })
            });
            speakingAccumulatorRef.current = 0; // reset
        } catch(e) {
            console.error("Failed to track speaking.", e);
        }
    }
  };

  const captureAndSendEmotion = async () => {
    if (!videoRef.current || !isCameraActive) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if(!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.5); // base64

    try {
      await fetch(`${API_BASE}/analyze-emotion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingId: MEETING_ID, userId: USER_ID, imageBuffer: dataUrl })
      });
    } catch(e) {
      console.error("Failed to analyze emotion.", e);
    }
  };

  const pollEngagementScore = async () => {
    try {
      const response = await fetch(`${API_BASE}/${MEETING_ID}/${USER_ID}`);
      const data = await response.json();
      if(data.success) {
        setEngagementData(data);
      }
    } catch(e) {
      console.error("Failed to poll engagement.", e);
    }
  };

  const startIntervals = () => {
    // Every 5s: capture emotion, send speaking batch, poll score
    trackingIntervalRef.current = setInterval(() => {
        captureAndSendEmotion();
        sendSpeakingBatch();
    }, 5000);

    pollingIntervalRef.current = setInterval(() => {
        pollEngagementScore();
    }, 5000);
  };

  // Exposed chat tracker
  const trackChat = async () => {
    try {
      await fetch(`${API_BASE}/track-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingId: MEETING_ID, userId: USER_ID })
      });
      pollEngagementScore(); // fetch instant update
    } catch(e) {
      console.error("Failed to track chat.", e);
    }
  };

  return {
    videoRef,
    isConsentGiven,
    isCameraActive,
    startTracking,
    stopTracking,
    engagementData,
    trackChat
  };
}
