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

const tourSteps: TourStep[] = [
  {
    targetId: "welcome-hero",
    title: "Welcome to PeerLift",
    description: "Welcome to your personalized learning dashboard. PeerLift is a peer-to-peer barter platform where you teach your skills to others, earn credits, and spend them to learn new skills yourself.",
    position: "bottom"
  },
  {
    targetId: "credit-balance-widget",
    title: "Your Credit Economy",
    description: "Every user starts with a credits balance. When you complete a session learning a skill from a peer, you spend 10 credits. When you teach a skill to a peer, you earn 10 credits.",
    position: "left"
  },
  {
    targetId: "nav-explore-button",
    title: "Explore Peers and Skills",
    description: "Browse the global skill directory. Filter by categories, view peer bios, and discover matching skills that you want to learn or teach.",
    position: "bottom"
  },
  {
    targetId: "nav-requests-button",
    title: "Manage Trade Requests",
    description: "Track and manage your P2P barter requests. Approve incoming learning proposals from peers, review sent invitations, and establish mutual study connections.",
    position: "bottom"
  },
  {
    targetId: "nav-sessions-button",
    title: "Your Learning Sessions",
    description: "View details of scheduled and completed learning exchanges. Connect to integrated online meeting links, review learning history, and coordinate details with peers.",
    position: "bottom"
  },
  {
    targetId: "quick-actions-section",
    title: "Post and Discover",
    description: "Ready to get active? Post a skill you want to offer to the community, browse matches, or manage pending trade requests here to initiate a learning exchange.",
    position: "bottom"
  },
  {
    targetId: "schedule-calendar-section",
    title: "Manage Your Schedule",
    description: "Here is your integrated exchange schedule calendar. Select time slots, schedule meetings with your matches, and keep track of your upcoming lessons.",
    position: "top"
  },
  {
    targetId: "lifetime-impact-section",
    title: "Track Your Growth",
    description: "Visualize your lifelong teaching and learning milestones here. Set learning goals and track your progress to unlock premium achievements.",
    position: "bottom"
  },
  {
    targetId: "ai-tutor-sidebar-button",
    title: "Your AI Study Partner",
    description: "Stuck on a concept or need learning advice? Chat with Lumina, our advanced conversational AI tutor, to plan your studies and practice anytime.",
    position: "left"
  }
];

export function DashboardTour() {
  const [currentStep, setCurrentStep] = useState(-1); // -1 means inactive
  const [stepPosition, setStepPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });

  // Auto-launch if the user is new and hasn't completed the tour
  useEffect(() => {
    const hasCompleted = localStorage.getItem("peerlift_dashboard_tour_completed");
    if (!hasCompleted) {
      const timer = setTimeout(() => setCurrentStep(0), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  // Smoothly scroll targeted element into view when the active step changes
  useEffect(() => {
    if (currentStep < 0 || currentStep >= tourSteps.length) return;
    const step = tourSteps[currentStep];
    const element = document.getElementById(step.targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentStep]);

  // Recalculate target element dimensions and position dynamically using fixed coordinate space
  useEffect(() => {
    if (currentStep < 0 || currentStep >= tourSteps.length) return;

    const calculatePosition = () => {
      const step = tourSteps[currentStep];
      const element = document.getElementById(step.targetId);

      if (element) {
        const rect = element.getBoundingClientRect();
        // Since overlay coordinates are fixed inside viewport, map bounding rect dimensions directly
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

    // Short-interval polling prevents visual shifts during dynamic rendering
    const interval = setInterval(calculatePosition, 100);

    return () => {
      window.removeEventListener("resize", calculatePosition);
      window.removeEventListener("scroll", calculatePosition);
      clearInterval(interval);
    };
  }, [currentStep]);

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
    localStorage.setItem("peerlift_dashboard_tour_completed", "true");
  };

  const handleForceRestart = () => {
    localStorage.removeItem("peerlift_dashboard_tour_completed");
    setCurrentStep(0);
  };

  // Expose restart button event globally so dashboard header can access it
  useEffect(() => {
    (window as any).restartDashboardTour = handleForceRestart;
    return () => {
      delete (window as any).restartDashboardTour;
    };
  }, []);

  if (currentStep < 0 || currentStep >= tourSteps.length) {
    return (
      <div className="fixed bottom-6 right-6 z-[997] pointer-events-auto">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleForceRestart}
          className="w-12 h-12 rounded-full bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all cursor-pointer border border-primary-400/20 shadow-primary-500/20"
          title="Start Dashboard Tour"
        >
          <Lightbulb size={22} className="text-amber-200" />
        </motion.button>
      </div>
    );
  }

  const step = tourSteps[currentStep];
  const isTargetVisible = stepPosition.width > 0;

  // Determine modal alignment styles based on fixed screen position
  let modalStyle: React.CSSProperties = {
    position: "fixed",
    zIndex: 999
  };

  if (isTargetVisible) {
    const spacing = 18;
    if (step.position === "bottom") {
      modalStyle = {
        ...modalStyle,
        top: `${stepPosition.top + stepPosition.height + spacing}px`,
        left: `${stepPosition.left + stepPosition.width / 2 - 200}px`
      };
    } else if (step.position === "top") {
      modalStyle = {
        ...modalStyle,
        top: `${stepPosition.top - 240 - spacing}px`,
        left: `${stepPosition.left + stepPosition.width / 2 - 200}px`
      };
    } else if (step.position === "left") {
      modalStyle = {
        ...modalStyle,
        top: `${stepPosition.top + stepPosition.height / 2 - 100}px`,
        left: `${stepPosition.left - 400 - spacing}px`
      };
    } else if (step.position === "right") {
      modalStyle = {
        ...modalStyle,
        top: `${stepPosition.top + stepPosition.height / 2 - 100}px`,
        left: `${stepPosition.left + stepPosition.width + spacing}px`
      };
    }
  } else {
    // Center of screen fallback
    modalStyle = {
      ...modalStyle,
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)"
    };
  }

  // Viewport bounds checks to prevent popover clipping
  if (isTargetVisible && typeof window !== "undefined") {
    const parsedLeft = parseFloat(String(modalStyle.left));
    if (parsedLeft < 16) {
      modalStyle.left = "16px";
    } else if (parsedLeft + 400 > window.innerWidth - 16) {
      modalStyle.left = `${window.innerWidth - 416}px`;
    }

    const parsedTop = parseFloat(String(modalStyle.top));
    if (parsedTop < 16) {
      modalStyle.top = "16px";
    } else if (parsedTop + 240 > window.innerHeight - 16) {
      modalStyle.top = `${window.innerHeight - 256}px`;
    }
  }

  // Generate a CSS clip-path winding polygon to make a transparent cut-out window over the target
  const overlayStyle: React.CSSProperties = {
    zIndex: 998,
  };

  if (isTargetVisible) {
    const t = stepPosition.top - 8;
    const l = stepPosition.left - 8;
    const w = stepPosition.width + 16;
    const h = stepPosition.height + 16;

    // Standard subtraction winding path: Outer boundary polygon clockwise, then inner cutout counter-clockwise
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
    <div className="fixed inset-0 z-[1000] pointer-events-none">
      {/* SVG Overlay Highlight Mask with Backdrop Blur */}
      <div 
        className="fixed inset-0 bg-black/60 pointer-events-auto backdrop-blur-[6px] transition-all duration-300" 
        style={overlayStyle}
      />

      {/* Target Pulsing Neon Glow Border */}
      {isTargetVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            position: "fixed",
            top: `${stepPosition.top - 8}px`,
            left: `${stepPosition.left - 8}px`,
            width: `${stepPosition.width + 16}px`,
            height: `${stepPosition.height + 16}px`,
            pointerEvents: "none",
            zIndex: 999,
          }}
          className="rounded-2xl border-2 border-primary-500 shadow-[0_0_30px_rgba(245,158,11,0.75)] animate-pulse transition-all duration-300"
        />
      )}

      {/* Popover Step Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          style={modalStyle}
          className="bg-bg-elevated border border-border shadow-2xl rounded-3xl p-6 pointer-events-auto select-none w-[400px] max-w-[calc(100vw-32px)]"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <span className="flex items-center gap-1.5 text-xs font-bold text-primary-500 uppercase tracking-widest bg-primary-500/10 px-2.5 py-1 rounded-full">
              <Lightbulb size={12} />
              Tour Step {currentStep + 1} of {tourSteps.length}
            </span>
            <button
              onClick={handleClose}
              className="text-text-muted hover:text-text-primary p-1.5 hover:bg-bg-secondary rounded-full transition-colors outline-none"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <h4 className="text-xl font-display font-bold text-text-primary mb-2.5">
            {step.title}
          </h4>
          <p className="text-sm text-text-secondary leading-relaxed mb-6">
            {step.description}
          </p>

          {/* Footer Controls */}
          <div className="flex items-center justify-between border-t border-border pt-4">
            <button
              onClick={handleClose}
              className="text-xs font-semibold text-text-muted hover:text-text-primary transition-colors hover:underline outline-none"
            >
              Skip tour
            </button>
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  onClick={handleBack}
                  className="px-4 py-2 border border-border-strong text-text-primary hover:bg-bg-secondary transition active:scale-95 text-xs font-bold rounded-xl flex items-center gap-1 outline-none"
                >
                  <ChevronLeft size={14} /> Back
                </button>
              )}
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-text-primary text-bg-primary hover:bg-primary-500 hover:text-white transition active:scale-95 text-xs font-bold rounded-xl flex items-center gap-1 shadow-md hover:shadow-lg outline-none"
              >
                {currentStep === tourSteps.length - 1 ? "Finish" : "Next"} <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
