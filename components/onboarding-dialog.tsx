"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export interface OnboardingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  progress?: number; // percentage (0-100)
}

export function OnboardingDialog({
  isOpen,
  onClose,
  progress = 20,
}: OnboardingDialogProps) {
  const { markWelcomeDialogShown } = useAuth();
  const [loading, setLoading] = useState(false);

  // Steps content mirrors the screenshot copy and order
  const steps = useMemo(
    () => [
      { id: 1, title: "Create your Account", completed: true },
      { id: 2, title: "Set up your Artist Profile", completed: false },
      { id: 3, title: "Upload your first single", completed: false },
      {
        id: 4,
        title: "Complete your one-time identity check",
        completed: false,
      },
      { id: 5, title: "Submit your release to stores!", completed: false },
    ],
    []
  );

  const handleGetStarted = async () => {
    if (loading) return;

    setLoading(true);
    try {
      await markWelcomeDialogShown();
      onClose();
    } catch (error) {
      console.error("Failed to mark dialog as shown:", error);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Cap progress between 0 and 100 for layout safety
  const pct = Math.max(0, Math.min(100, progress));

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-dvh items-center justify-center px-4 py-10 md:py-12">
          {/* Backdrop kept fixed behind the scrollable container */}
          <div
            className="fixed inset-0 z-0 bg-black/90 backdrop-blur-sm"
            aria-hidden="true"
          />
          {/* logo */}
          <div className="absolute top-0 left-0">
            <img
              src="/alera-logo-white.png"
              alt="ALERA"
              width={100}
              height={100}
            />
          </div>
          {/* Dialog content raised above the backdrop */}
          <div className="relative z-10 w-full max-w-[980px] px-4 md:px-6">
            {/* Top Heading & Subheading */}
            <header className="text-center mb-6 md:mb-8">
              <h1 className="text-white text-4xl md:text-6xl font-bold tracking-tight text-balance">
                {"Welcome to ALERA!"}
              </h1>
              <p className="mt-3 md:mt-4 text-white/90 text-lg md:text-2xl">
                {"Let's get your first song released to the world."}
              </p>
            </header>

            {/* Blue gradient checklist card */}
            <section
              className={[
                "relative w-full mx-auto rounded-[28px] p-6 md:p-8",
                "ring-1 ring-white/10 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.8)]",
                // Deep → bright blue gradient like the screenshot
                "bg-[linear-gradient(180deg,#0b2a5b_0%,#1d46a6_45%,#3aa0ff_100%)]",
              ].join(" ")}
            >
              <h2 className="text-white font-extrabold text-2xl md:text-3xl mb-5 md:mb-6">
                {"Your Path to Your First Release!"}
              </h2>

              <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                {steps.map((s) => (
                  <li key={s.id} className="flex items-center">
                    <span className="font-mono text-white/90 w-8 md:w-10">
                      {s.completed ? "[✓]" : "[ ]"}
                    </span>
                    <span
                      className={s.completed ? "text-white" : "text-white/90"}
                    >
                      {s.title}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Progress with white pill label overlapping track */}
              <div className="relative">
                {/* Track */}
                <div className="h-6 w-full rounded-full bg-white/25 overflow-hidden">
                  {/* Fill */}
                  <div
                    className="h-full rounded-full bg-white"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {/* Progress pill positioned along the track */}
                <div
                  className="absolute top-[2px] left-4 w-auto"
                  aria-hidden="true"
                >
                  <div className=" rounded-2xl text-sm text-[#2b6df8] z-10 font-bold">
                    {pct}%
                  </div>
                </div>
              </div>
            </section>

            {/* CTA below the card (outside), centered & purple like screenshot */}
            <div className="flex justify-center mt-6 md:mt-8">
              <Button
                onClick={handleGetStarted}
                disabled={loading}
                className={[
                  "px-8 md:px-10 h-11 md:h-12 text-base md:text-lg font-semibold rounded-full",
                  "bg-[#2b6df8]",
                  "hover:bg-[#2b6df8] hover:brightness-110",
                  loading && "opacity-70 cursor-not-allowed",
                ].join(" ")}
              >
                {loading ? "Loading..." : "GET STARTED!"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
