"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  Clock,
  Loader2,
  ChevronRight,
  Lock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/context/SubscriptionContext";
import { useRouter } from "next/navigation";

export type OnboardingStep = {
  id: string;
  name: string;
  completed: boolean;
  completedAt?: string;
  url?: string;
  locked?: boolean;
};

interface OnboardingChecklistProps {
  steps: OnboardingStep[];
  title?: string;
  showUpgradeButton?: boolean;
}

export function OnboardingChecklist({
  steps,
  title = "Get Your First Release Out",
  showUpgradeButton = true,
}: OnboardingChecklistProps) {
  const router = useRouter();
  const { subscription, upgradeToTier } = useSubscription();
  const [allCompleted, setAllCompleted] = useState(false);

  useEffect(() => {
    // Check if all steps are completed
    const completed = steps.every((step) => step.completed);
    setAllCompleted(completed);
  }, [steps]);

  const getStatusIcon = (step: OnboardingStep) => {
    if (step.locked) {
      return <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />;
    } else if (step.completed) {
      return (
        <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-400" />
      );
    } else {
      return <Circle className="h-5 w-5 text-gray-300 dark:text-gray-600" />;
    }
  };

  const getStatusText = (step: OnboardingStep) => {
    if (step.locked) {
      return "Locked";
    } else if (step.completed) {
      return "Done";
    } else {
      return "To Do";
    }
  };

  const getStatusClass = (step: OnboardingStep) => {
    if (step.locked) {
      return "text-gray-700 bg-gray-50 dark:text-gray-300 dark:bg-[#2d2d44]";
    } else if (step.completed) {
      return "text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-900/20";
    } else {
      return "text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20";
    }
  };

  const handleUpgrade = async () => {
    const checkoutUrl = await upgradeToTier("plus");
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <Card className="bg-white dark:bg-[#1a1a2e] border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl text-[#333] dark:text-white">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <motion.ul
          className="space-y-3"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {steps.map((step) => (
            <motion.li
              key={step.id}
              className={`flex items-start gap-3 rounded-lg border ${
                step.locked
                  ? "border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50"
                  : step.completed
                  ? "border-green-100 dark:border-green-900/30 bg-white dark:bg-[#1a1a2e]"
                  : "border-amber-100 dark:border-amber-900/30 bg-white dark:bg-[#1a1a2e]"
              } p-3 hover:shadow-sm transition-shadow duration-200 relative`}
              variants={item}
              onClick={() => {
                if (step.url && !step.locked && !step.completed) {
                  router.push(step.url);
                }
              }}
              style={{
                cursor:
                  step.url && !step.locked && !step.completed
                    ? "pointer"
                    : "default",
              }}
            >
              <div className="mt-0.5">{getStatusIcon(step)}</div>
              <div className="flex-1">
                <p
                  className={`font-medium ${
                    step.locked
                      ? "text-gray-500 dark:text-gray-400"
                      : "text-gray-900 dark:text-white"
                  }`}
                >
                  {step.name}
                </p>
                {step.locked && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Upgrade to unlock this feature
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusClass(
                    step
                  )}`}
                >
                  {getStatusText(step)}
                </span>
                {step.url && !step.locked && !step.completed && (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </motion.li>
          ))}
        </motion.ul>

        {allCompleted && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 rounded-lg p-3 text-sm text-green-800 dark:text-green-300">
            <p className="font-medium">Congratulations! 🎉</p>
            <p className="mt-1">
              You've completed all the steps to release your first single.
            </p>
          </div>
        )}

        {showUpgradeButton && subscription?.tier === "trial" && (
          <Button
            onClick={handleUpgrade}
            className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
          >
            Upgrade to Release More Music
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
