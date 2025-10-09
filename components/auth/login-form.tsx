"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { GoogleSignInButton } from "./google-signin-button";

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Login successful!",
        });

        // Use AuthContext login method
        await login(data.token);
        router.push("/dashboard");
      } else {
        toast({
          title: "Error",
          description: data.message || "Login failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-0 shadow-xl bg-white dark:bg-[#0f0f1a]">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-[#333] dark:text-white">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-[#666] dark:text-gray-400">
            Sign in to your ALERA account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-[#333] dark:text-white font-medium"
              >
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="pl-10 h-12 rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a2e] focus:border-purple-500 dark:focus:border-purple-400"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-[#333] dark:text-white font-medium"
              >
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className="pl-10 pr-10 h-12 rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a2e] focus:border-purple-500 dark:focus:border-purple-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-[#5d2c91] dark:text-purple-400 hover:underline"
              >
                Forgot your password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-[#5d2c91] to-[#2d1b69] hover:from-[#6b3aa0] hover:to-[#3d2b79] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing In...
                </div>
              ) : (
                "Sign In"
              )}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-[#0f0f1a] px-2 text-gray-500 dark:text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google Login Button */}
            <GoogleSignInButton variant="login" disabled={isLoading} />

            {/* Register Link */}
            <div className="text-center pt-4">
              <p className="text-[#666] dark:text-gray-400">
                Don't have an account?{" "}
                <Link
                  href="/auth/register"
                  className="text-[#5d2c91] dark:text-purple-400 font-medium hover:underline"
                >
                  Create one
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
