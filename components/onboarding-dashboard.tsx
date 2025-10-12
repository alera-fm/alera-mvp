"use client";

import { useState, useEffect } from "react";
import { useSubscription } from "@/context/SubscriptionContext";
import { Check, Shield } from "lucide-react";

interface OnboardingStep {
  id: string;
  name: string;
  completed: boolean;
  url?: string;
}

export function OnboardingDashboard() {
  const { subscription } = useSubscription();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [steps, setSteps] = useState<OnboardingStep[]>([]);

  useEffect(() => {
    // Only show onboarding for trial users who haven't used their free release
    if (subscription?.tier === "trial" && !subscription?.freeReleaseUsed) {
      setShowOnboarding(true);

      fetchOnboardingProgress();
    } else {
      setShowOnboarding(false);
    }
  }, [subscription]);

  // Default steps if API fails
  const getDefaultSteps = (): OnboardingStep[] => {
    return [
      {
        id: "create_account",
        name: "Create your Account",
        completed: true,
        url: "/dashboard/settings",
      },
      {
        id: "set_up_artist_profile",
        name: "Set up your Artist Profile",
        completed: false,
        url: "/dashboard/settings",
      },
      {
        id: "upload_first_single",
        name: "Upload your first single",
        completed: false,
        url: "/dashboard/new-release",
      },
      {
        id: "complete_identity_check",
        name: "Complete your one-time identity check",
        completed: false,
        url: "/dashboard/settings?tab=identity-check",
      },
      {
        id: "submit_release_to_stores",
        name: "Submit your release to stores!",
        completed: false,
        url: "/dashboard/my-music",
      },
    ];
  };

  const handleStepClick = (step: OnboardingStep) => {
    if (step.id === "complete_identity_check" && !step.completed) {
      // Redirect to settings with identity check tab
      window.location.href = "/dashboard/settings?tab=identity-check";
    } else if (step.url) {
      window.location.href = step.url;
    }
  };

  const fetchOnboardingProgress = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await fetch("/api/subscription/onboarding-progress", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();

        // Map API data to our steps format
        const mappedSteps: OnboardingStep[] = [
          {
            id: "create_account",
            name: "Create your Account",
            completed:
              data.progress.find((p: any) => p.step_name === "create_account")
                ?.completed || false,
            url: "/dashboard/settings",
          },
          {
            id: "set_up_artist_profile",
            name: "Set up your Artist Profile",
            completed:
              data.progress.find(
                (p: any) => p.step_name === "set_up_artist_profile"
              )?.completed || false,
            url: "/dashboard/settings",
          },
          {
            id: "upload_first_single",
            name: "Upload your first single",
            completed:
              data.progress.find(
                (p: any) => p.step_name === "upload_first_single"
              )?.completed || false,
            url: "/dashboard/new-release",
          },
          {
            id: "complete_identity_check",
            name: "Complete your one-time identity check",
            completed:
              data.progress.find(
                (p: any) => p.step_name === "complete_identity_check"
              )?.completed || false,
            url: "/dashboard/settings?tab=identity-check",
          },
          {
            id: "submit_release_to_stores",
            name: "Submit your release to stores!",
            completed:
              data.progress.find(
                (p: any) => p.step_name === "submit_release_to_stores"
              )?.completed || false,
            url: "/dashboard/my-music",
          },
        ];

        setSteps(mappedSteps);
      } else {
        // If API fails, show default steps
        setSteps(getDefaultSteps());
      }
    } catch (error) {
      console.error("Error fetching onboarding progress:", error);
      setSteps(getDefaultSteps());
    }
  };

  // If not a trial user or already used free release, don't show onboarding
  if (!showOnboarding) {
    return null;
  }

  const completedSteps = steps.filter((step) => step.completed).length;
  const progressPercentage = Math.round((completedSteps / steps.length) * 100);

  return (
    <div className="space-y-6">
      {/* Unified Onboarding Card with Welcome Message */}
      <div className="bg-gradient-to-b from-blue-900 via-blue-800 to-purple-700 rounded-2xl p-8 text-white shadow-2xl">
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-3">Welcome to ALERA!</h2>
          <p className="text-purple-100 text-lg">
            You're on the free trial. Complete your first release to get
            started!
          </p>
        </div>

        {/* Checklist Title */}
        <h3 className="text-2xl font-bold mb-6 text-center border-t border-white/20 pt-6">
          Your Path to Your First Release!
        </h3>

        {/* Steps List */}
        <div className="space-y-4 mb-8">
          {steps.map((step) => (
            <div key={step.id} className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                {step.completed ? (
                  <div className="w-6 h-6 bg-white rounded border-2 border-white flex items-center justify-center">
                    <Check className="h-4 w-4 text-blue-900" />
                  </div>
                ) : (
                  <div className="w-6 h-6 bg-transparent rounded border-2 border-white"></div>
                )}
              </div>
              <button
                onClick={() => handleStepClick(step)}
                className={`text-lg font-medium text-left hover:text-blue-200 transition-colors flex items-center gap-2 ${
                  step.completed ? "line-through opacity-70" : ""
                }`}
              >
                {step.id === "complete_identity_check" && !step.completed && (
                  <Shield className="h-4 w-4" />
                )}
                {step.name}
              </button>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="flex items-center space-x-4">
          <span className="text-2xl font-bold">{progressPercentage}%</span>
          <div className="flex-1 bg-white/20 rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${progressPercentage}%`,
              }}
            />
          </div>
        </div>

        {/* Upgrade Button for Trial Users */}
        {subscription?.tier === "trial" && (
          <div className="mt-8 text-center">
            <button
              onClick={() => (window.location.href = "/subscription")}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-3 rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              Upgrade to Create Unlimited Releases
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
