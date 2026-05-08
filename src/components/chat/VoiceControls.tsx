"use client";

import { useState, useEffect, useCallback } from "react";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VoiceControlsProps {
  onTranscript: (text: string) => void;
  lastAssistantMessage?: string;
  autoSpeak?: boolean;
}

export default function VoiceControls({ onTranscript, lastAssistantMessage, autoSpeak = true }: VoiceControlsProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    // Initialize Speech Recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recog = new SpeechRecognition();
        recog.continuous = false;
        recog.interimResults = false;
        recog.lang = 'en-US';

        recog.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          onTranscript(transcript);
          setIsListening(false);
        };

        recog.onerror = () => setIsListening(false);
        recog.onend = () => setIsListening(false);

        setRecognition(recog);
      }
    }
  }, [onTranscript]);

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop();
    } else {
      recognition?.start();
      setIsListening(true);
    }
  };

  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined' || isMuted) return;

    // Cancel existing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    // Find a nice voice (optional refinement)
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Female')) || voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;
    
    utterance.pitch = 1.2; // Slightly higher for child-like feel
    utterance.rate = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [isMuted]);

  useEffect(() => {
    if (autoSpeak && lastAssistantMessage && !isMuted) {
      speak(lastAssistantMessage);
    }
  }, [lastAssistantMessage, autoSpeak, speak, isMuted]);

  return (
    <div className="flex items-center gap-2">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleListening}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
          isListening ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-surface/40 hover:bg-surface/60 border border-surface-glow'
        }`}
      >
        {isListening ? (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <MicOff className="w-4 h-4 text-white" />
          </motion.div>
        ) : (
          <Mic className="w-4 h-4 text-text-muted" />
        )}
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
            if (isMuted) {
                setIsMuted(false);
                if (lastAssistantMessage) speak(lastAssistantMessage);
            } else {
                setIsMuted(true);
                window.speechSynthesis.cancel();
            }
        }}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
          isSpeaking && !isMuted ? 'bg-accent-synapse shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'bg-surface/40 hover:bg-surface/60 border border-surface-glow'
        }`}
      >
        {isMuted ? (
          <VolumeX className="w-4 h-4 text-red-400" />
        ) : (
          <div className="relative">
             <Volume2 className={`w-4 h-4 ${isSpeaking ? 'text-white' : 'text-text-muted'}`} />
             {isSpeaking && (
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-synapse opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-synapse"></span>
                </span>
             )}
          </div>
        )}
      </motion.button>
    </div>
  );
}
