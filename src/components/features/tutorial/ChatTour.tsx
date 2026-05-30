"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Lightbulb } from "lucide-react";

interface TourStep {
  targetId: string;
  title: string;
  description: string;
  position: "bottom" | "top" | "left" | "right" | "center";
}

interface ChatTourProps {
  isAI: boolean;
  activeSessionId: string;
}

export function ChatTour({ isAI, activeSessionId }: ChatTourProps) {
  const [currentStep, setCurrentStep] = useState(-1); // -1 means inactive
  const [stepPosition, setStepPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });

  const tourSteps = React.useMemo(() => {
    const steps: TourStep[] = [
      {
        targetId: "chat-sidebar",
        title: "Welcome to PeerLift Chat",
        description: "This is your hub for direct peer conversations and personal AI learning tutors. Let's take a quick tour!",
        position: "center"
      },
      {
        targetId: "chat-sidebar",
        title: "Active Chats & AI Sessions",
        description: "Manage your active conversations here. You can click on any student or AI tutor session in this stack to view history.",
        position: "right"
      },
      {
        targetId: "chat-create-session-button",
        title: "Start a New AI Tutor Session",
        description: "Click the plus button to spawn a new AI tutor. The previous session slides down into your history stack, so you never lose past chats.",
        position: "right"
      }
    ];

    if (isAI) {
      if (!activeSessionId) {
        steps.push({
          targetId: "chat-onboarding-card",
          title: "Configure Your Tutor",
          description: "Customize your tutor's name, choose a voice gender, outline what topic you want to master, and pick your target difficulty level.",
          position: "bottom"
        });
      } else {
        steps.push({
          targetId: "chat-voice-mode-button",
          title: "Real-Time Voice Call Mode",
          description: "Click the phone icon to start a natural voice call! Your tutor will respond in their custom male or female voice, and you can interrupt them anytime by speaking.",
          position: "bottom"
        });
        steps.push({
          targetId: "chat-tutor-settings-button",
          title: "Tutor Settings",
          description: "Open tutor settings to modify your learning goals, change skill level, or adjust configured assistant settings.",
          position: "bottom"
        });
      }
    }

    steps.push({
      targetId: "chat-input-bar",
      title: "Input & Smart Study Tools",
      description: "Write messages, use ASR voice input, or click the paperclip to upload files and textbook notes for immediate AI summary/synthesis.",
      position: "top"
    });

    if (isAI && activeSessionId) {
      steps.push({
        targetId: "chat-reasoning-mode-button",
        title: "Deep Reasoning Mode",
        description: "Toggle thinking mode to see step-by-step logical reasoning behind complex questions, equations, or code.",
        position: "top"
      });
    }

    return steps;
  }, [isAI, activeSessionId]);

  // Auto-launch if the user hasn't completed the chat tour
  useEffect(() => {
    const hasCompleted = localStorage.getItem("peerlift_chat_tour_completed");
    if (!hasCompleted) {
      const timer = setTimeout(() => setCurrentStep(0), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Smoothly scroll targeted element into view when step changes
  useEffect(() => {
    if (currentStep < 0 || currentStep >= tourSteps.length) return;
    const step = tourSteps[currentStep];
    const element = document.getElementById(step.targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentStep, tourSteps]);

  // Recalculate target element positions
  useEffect(() => {
    if (currentStep < 0 || currentStep >= tourSteps.length) return;

    const calculatePosition = () => {
      const step = tourSteps[currentStep];
      const element = document.getElementById(step.targetId);

      if (element && element.offsetParent !== null) {
        const rect = element.getBoundingClientRect();
        setStepPosition({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        });
      } else {
        setStepPosition({ top: 0, left: 0, width: 0, height: 0 });
      }
    };

    calculatePosition();
    window.addEventListener("resize", calculatePosition);
    window.addEventListener("scroll", calculatePosition);

    const interval = setInterval(calculatePosition, 250);

    return () => {
      window.removeEventListener("resize", calculatePosition);
      window.removeEventListener("scroll", calculatePosition);
      clearInterval(interval);
    };
  }, [currentStep, tourSteps]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleClose = () => {
    setCurrentStep(-1);
    localStorage.setItem("peerlift_chat_tour_completed", "true");
  };

  const handleForceRestart = () => {
    localStorage.removeItem("peerlift_chat_tour_completed");
    setCurrentStep(0);
  };

  // Expose restart event globally for the header icon
  useEffect(() => {
    (window as any).restartChatTour = handleForceRestart;
    return () => {
      delete (window as any).restartChatTour;
    };
  }, []);

  if (currentStep < 0 || currentStep >= tourSteps.length) {
    return null; // Don't show anything when inactive
  }

  const step = tourSteps[currentStep];
  const isTargetVisible = stepPosition.width > 0;

  // Position styles
  let modalStyle: React.CSSProperties = {
    position: "fixed",
    zIndex: 9999
  };

  if (isTargetVisible && step.position !== "center") {
    const spacing = 18;
    if (step.position === "bottom") {
      modalStyle = {
        ...modalStyle,
        top: `${stepPosition.top + stepPosition.height + spacing}px`,
        left: `${stepPosition.left + stepPosition.width / 2 - 180}px`
      };
    } else if (step.position === "top") {
      modalStyle = {
        ...modalStyle,
        top: `${stepPosition.top - 200 - spacing}px`,
        left: `${stepPosition.left + stepPosition.width / 2 - 180}px`
      };
    } else if (step.position === "left") {
      modalStyle = {
        ...modalStyle,
        top: `${stepPosition.top + stepPosition.height / 2 - 90}px`,
        left: `${stepPosition.left - 380 - spacing}px`
      };
    } else if (step.position === "right") {
      modalStyle = {
        ...modalStyle,
        top: `${stepPosition.top + stepPosition.height / 2 - 90}px`,
        left: `${stepPosition.left + stepPosition.width + spacing}px`
      };
    }
  } else {
    modalStyle = {
      ...modalStyle,
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)"
    };
  }

  // Prevent popover clipping outside viewport
  if (isTargetVisible && step.position !== "center" && typeof window !== "undefined") {
    const parsedLeft = parseFloat(String(modalStyle.left));
    if (parsedLeft < 16) {
      modalStyle.left = "16px";
    } else if (parsedLeft + 360 > window.innerWidth - 16) {
      modalStyle.left = `${window.innerWidth - 376}px`;
    }

    const parsedTop = parseFloat(String(modalStyle.top));
    if (parsedTop < 16) {
      modalStyle.top = "16px";
    } else if (parsedTop + 200 > window.innerHeight - 16) {
      modalStyle.top = `${window.innerHeight - 216}px`;
    }
  }

  // Clip path mask for highlighting target
  const overlayStyle: React.CSSProperties = {
    zIndex: 9997,
  };

  if (isTargetVisible && step.position !== "center") {
    const t = stepPosition.top - 6;
    const l = stepPosition.left - 6;
    const w = stepPosition.width + 12;
    const h = stepPosition.height + 12;

    overlayStyle.clipPath = `polygon(
      0% 0%, 
      100% 0%, 
      100% 100%, 
      0% 100%, 
      0% 0%, 
      ${l}px ${t}px, 
      ${l}px ${t + h}px, 
      ${l + w}px ${t + h}px, 
      ${l + w}px ${t}px, 
      ${l}px ${t}px
    )`;
  }

  return (
    <div className="fixed inset-0 z-[9995] pointer-events-none">
      <div 
        className="fixed inset-0 bg-black/60 pointer-events-auto backdrop-blur-[4px] transition-all duration-300" 
        style={overlayStyle}
      />

      {isTargetVisible && step.position !== "center" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            position: "fixed",
            top: `${stepPosition.top - 6}px`,
            left: `${stepPosition.left - 6}px`,
            width: `${stepPosition.width + 12}px`,
            height: `${stepPosition.height + 12}px`,
            pointerEvents: "none",
            zIndex: 9998,
          }}
          className="rounded-2xl border-2 border-primary-500 shadow-[0_0_25px_rgba(245,158,11,0.6)] animate-pulse transition-all duration-300"
        />
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.18 }}
          style={modalStyle}
          className="bg-bg-elevated border border-border shadow-2xl rounded-3xl p-5 pointer-events-auto select-none w-[360px] max-w-[calc(100vw-32px)]"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-1 text-[10px] font-bold text-primary-500 uppercase tracking-widest bg-primary-500/10 px-2 py-0.5 rounded-full">
              <Lightbulb size={10} />
              Chat Tour {currentStep + 1} of {tourSteps.length}
            </span>
            <button
              onClick={handleClose}
              className="text-text-muted hover:text-text-primary p-1 hover:bg-bg-secondary rounded-full transition-colors outline-none"
            >
              <X size={14} />
            </button>
          </div>

          <h4 className="text-base font-display font-bold text-text-primary mb-1.5">
            {step.title}
          </h4>
          <p className="text-xs text-text-secondary leading-relaxed mb-4">
            {step.description}
          </p>

          <div className="flex items-center justify-between border-t border-border pt-3">
            <button
              onClick={handleClose}
              className="text-[10px] font-semibold text-text-muted hover:text-text-primary transition-colors hover:underline outline-none"
            >
              Skip tour
            </button>
            <div className="flex items-center gap-1.5">
              {currentStep > 0 && (
                <button
                  onClick={handleBack}
                  className="px-3 py-1.5 border border-border text-text-primary hover:bg-bg-secondary transition active:scale-95 text-[10px] font-bold rounded-lg flex items-center gap-0.5 outline-none"
                >
                  <ChevronLeft size={12} /> Back
                </button>
              )}
              <button
                onClick={handleNext}
                className="px-3 py-1.5 bg-text-primary text-bg-primary hover:bg-primary-500 hover:text-white transition active:scale-95 text-[10px] font-bold rounded-lg flex items-center gap-0.5 shadow-md hover:shadow-lg outline-none"
              >
                {currentStep === tourSteps.length - 1 ? "Finish" : "Next"} <ChevronRight size={12} />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
