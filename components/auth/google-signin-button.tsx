"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    google: any;
  }
}

interface GoogleSignInButtonProps {
  variant?: "login" | "register";
  disabled?: boolean;
  className?: string;
}

export function GoogleSignInButton({
  variant = "login",
  disabled = false,
  className = "",
}: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // Load Google Sign-In script
    const loadGoogleScript = () => {
      if (window.google) {
        setIsGoogleLoaded(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google) {
          setIsGoogleLoaded(true);
        }
      };
      script.onerror = () => {
        console.error("Failed to load Google Sign-In script");
        toast({
          title: "Error",
          description: "Failed to load Google Sign-In",
          variant: "destructive",
        });
      };
      document.head.appendChild(script);
    };

    loadGoogleScript();
  }, [toast]);

  const handleCredentialResponse = async (tokenResponse: any) => {
    if (!tokenResponse || !tokenResponse.access_token) {
      toast({
        title: "Error",
        description: "No access token received from Google",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Get user info from Google
      const userInfoResponse = await fetch(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        }
      );

      if (!userInfoResponse.ok) {
        throw new Error("Failed to fetch user info from Google");
      }

      const userInfo = await userInfoResponse.json();

      if (!userInfo || !userInfo.email) {
        throw new Error("Failed to get user information from Google");
      }

      console.log("Google user info:", userInfo);

      // Send to our backend for authentication
      const response = await fetch("/api/auth/google/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          access_token: tokenResponse.access_token,
          user_info: userInfo,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast({
          title: "Success!",
          description: result.message || "Successfully signed in with Google",
        });

        // Login with JWT token
        if (result.token) {
          await login(result.token);
          router.push("/dashboard");
        }
      } else {
        throw new Error(result.error || "Google authentication failed");
      }
    } catch (error: any) {
      console.error("Google authentication error:", error);
      toast({
        title: "Authentication Failed",
        description: error?.message || "Failed to sign in with Google",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isGoogleLoaded) {
      toast({
        title: "Please wait",
        description: "Google Sign-In is loading. Please try again.",
      });
      return;
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!clientId) {
      toast({
        title: "Configuration Error",
        description: "Google Client ID not configured",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Initializing Google OAuth...");

      // Create token client for OAuth 2.0
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: "email profile",
        callback: handleCredentialResponse,
      });

      console.log("Requesting access token...");

      // Open Google popup
      tokenClient.requestAccessToken();
    } catch (error) {
      console.error("Google Sign-In error:", error);
      toast({
        title: "Error",
        description: "Failed to initialize Google Sign-In. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!isGoogleLoaded) {
    return (
      <Button
        type="button"
        variant="outline"
        disabled={true}
        className="w-full h-12 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a2e] rounded-xl opacity-50"
      >
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Loading Google Sign-In...
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleGoogleSignIn}
      disabled={disabled || isLoading}
      className="w-full h-12 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-[#1a1a2e] rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          Signing in...
        </>
      ) : (
        <>
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {variant === "login" ? "Continue with Google" : "Sign up with Google"}
        </>
      )}
    </Button>
  );
}
