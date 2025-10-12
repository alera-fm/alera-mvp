"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Home, Music } from "lucide-react";

export default function ReleaseNotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-6">
      <div className="text-center max-w-md mx-auto">
        {/* Icon */}
        <div className="mb-8">
          <div className="text-8xl mb-4">🎵</div>
          <div className="w-24 h-1 bg-gradient-to-r from-[#A04EF7] to-[#C798F9] mx-auto rounded-full"></div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent">
            Release Not Found
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            Oops! This release doesn't exist.
          </p>
          <p className="text-gray-400 mb-6">
            The release you're looking for may have been removed, renamed, or
            doesn't exist yet.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => router.back()}
            className="w-full px-8 py-4 bg-[#A04EF7] text-white font-semibold rounded-xl hover:bg-[#C798F9] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-[#A04EF7] focus:ring-offset-2 focus:ring-offset-gray-900 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>

          <button
            onClick={() => router.push("/")}
            className="w-full px-8 py-4 bg-transparent border-2 border-gray-600 text-gray-300 font-semibold rounded-xl hover:bg-gray-700 hover:text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-gray-900 flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Go to Homepage
          </button>
        </div>

        {/* Help Section */}
        <div className="mt-8 p-4 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700">
          <h3 className="text-sm font-semibold text-white mb-2">
            Looking for a release?
          </h3>
          <p className="text-xs text-gray-300">
            Make sure you have the correct artist name and release title in the
            URL.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="flex items-center justify-center">
            <p className="text-xs text-gray-500 mr-2">Powered by</p>
            <a
              href="https://www.alera.fm"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity flex items-center"
            >
              <Image
                src="/images/alera-logo-white.png"
                alt="Alera"
                width={24}
                height={24}
                className="h-6 w-6"
              />
              <span className="text-white ml-1 font-medium text-sm">Alera</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
