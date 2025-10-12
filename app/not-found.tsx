"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Home, ArrowLeft, Music } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-6">
      <div className="text-center max-w-lg mx-auto">
        {/* Icon */}
        <div className="mb-8">
          <div className="text-8xl mb-4">🎵</div>
          <div className="w-32 h-1 bg-gradient-to-r from-[#A04EF7] to-[#C798F9] mx-auto rounded-full"></div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-2xl font-semibold mb-4 text-white">
            Page Not Found
          </h2>
          <p className="text-lg text-gray-300 mb-2">
            Oops! The page you're looking for doesn't exist.
          </p>
          <p className="text-gray-400 mb-6">
            It might have been moved, deleted, or you entered the wrong URL.
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

          <a
            href="https://www.alera.fm"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full px-8 py-4 bg-transparent border-2 border-[#A04EF7] text-[#A04EF7] font-semibold rounded-xl hover:bg-[#A04EF7] hover:text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-[#A04EF7] focus:ring-offset-2 focus:ring-offset-gray-900 flex items-center justify-center gap-2"
          >
            <Music className="w-5 h-5" />
            Discover Music on Alera
          </a>
        </div>

        {/* Help Section */}
        <div className="mt-12 p-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-3">Need Help?</h3>
          <div className="space-y-2 text-sm text-gray-300">
            <p>• Check if the URL is spelled correctly</p>
            <p>• Try going back to the previous page</p>
            <p>• Visit our homepage to find what you're looking for</p>
          </div>
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
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="text-white ml-2 font-medium">Alera</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
