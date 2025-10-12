"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Disc3,
  Music,
  Headphones,
  Music2,
  PlayCircle,
  Radio,
  Loader2,
  ChevronRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import Image from "next/image";
// Type definitions
interface StreamingService {
  name: string;
  url: string;
}

interface SongData {
  status: string;
  artistName: string;
  releaseTitle: string;
  artworkUrl: string;
  streamingServices: StreamingService[];
  artistPublicLink: string; // Empty string if no landing page
}

export default function PublicReleasePage() {
  const params = useParams();
  const artistname = params.artistname as string;
  const releasetitle = params.releasetitle as string;

  const [releaseData, setReleaseData] = useState<SongData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    country: "",
    gender: "",
    age: "",
    subscribed_status: "free",
  });
  // Email signup state
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!artistname || !releasetitle) return;

    const fetchReleaseData = async () => {
      try {
        setLoading(true);
        // Encode the parameters to handle spaces and special characters
        const encodedArtist = encodeURIComponent(artistname);
        const encodedRelease = encodeURIComponent(releasetitle);
        const response = await fetch(
          `/api/public/release/${encodedArtist}/${encodedRelease}`
        );

        if (!response.ok) {
          if (response.status === 404) {
            setError("Release not found");
          } else {
            setError("Failed to load release data");
          }
          return;
        }

        const data = await response.json();
        setReleaseData(data.release);
      } catch (err) {
        console.error("Error fetching release data:", err);
        setError("Failed to load release data");
      } finally {
        setLoading(false);
      }
    };

    fetchReleaseData();
  }, [artistname, releasetitle]);

  // Update page title when release data is loaded
  useEffect(() => {
    // if (releaseData) {
    //   document.title = `${releaseData.releaseTitle} by ${releaseData.artistName} | Alera`;
    // } else {
    // Set default title while loading or if no data
    const decodedArtist = decodeURIComponent(artistname || "");
    const decodedRelease = decodeURIComponent(releasetitle || "");
    document.title = `${decodedRelease} by ${decodedArtist} | Alera`;
    // }
  }, [releaseData, artistname, releasetitle]);

  // Service Icon Component - Uses actual platform images with fallback to lucide icons
  const ServiceIcon = ({ serviceName }: { serviceName: string }) => {
    const imageClass = "w-6 h-6 flex-shrink-0 object-contain";
    const fallbackIconClass = "w-6 h-6 flex-shrink-0";

    // Map service names to image files (only for platforms we have images for)
    const getImagePath = (name: string) => {
      const normalizedName = name.toLowerCase();

      if (normalizedName.includes("spotify")) return "/platforms/spotify.png";
      if (normalizedName.includes("apple")) return "/platforms/apple-music.png";
      if (normalizedName.includes("youtube")) return "/platforms/youtube.png";
      if (normalizedName.includes("tidal")) return "/platforms/tidal.png";
      if (normalizedName.includes("deezer")) return "/platforms/deezer.png";
      if (normalizedName.includes("pandora")) return "/platforms/pandora.png";
      if (normalizedName.includes("itunes"))
        return "/platforms/apple-music.png";

      return null;
    };

    // Get fallback lucide icon for platforms without images
    const getFallbackIcon = (name: string) => {
      const normalizedName = name.toLowerCase();

      if (normalizedName.includes("amazon"))
        return <Radio className={fallbackIconClass} />;
      if (normalizedName.includes("soundcloud"))
        return <Music2 className={fallbackIconClass} />;
      if (normalizedName.includes("bandcamp"))
        return <Disc3 className={fallbackIconClass} />;

      // Default fallback icon
      return <Music className={fallbackIconClass} />;
    };

    const imagePath = getImagePath(serviceName);

    // If we have an image for this platform, use it
    if (imagePath) {
      return (
        <img
          src={imagePath}
          alt={`${serviceName} logo`}
          className={imageClass}
          onError={(e) => {
            // Fallback to lucide icon if image fails to load
            const parent = e.currentTarget.parentElement;
            if (parent) {
              e.currentTarget.remove();
              const icon = getFallbackIcon(serviceName);
              const wrapper = document.createElement("div");
              wrapper.innerHTML = icon.props.children || "";
              parent.appendChild(wrapper.firstChild as Node);
            }
          }}
        />
      );
    }

    // Fallback to lucide icons for platforms without images
    return getFallbackIcon(serviceName);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-gray-400 text-xl">Loading release...</div>
      </div>
    );
  }

  if (error || !releaseData) {
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
              onClick={() => window.history.back()}
              className="w-full px-8 py-4 bg-[#A04EF7] text-white font-semibold rounded-xl hover:bg-[#C798F9] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-[#A04EF7] focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              Go Back
            </button>

            <a
              href="https://www.alera.fm"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full px-8 py-4 bg-transparent border-2 border-gray-600 text-gray-300 font-semibold rounded-xl hover:bg-gray-700 hover:text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              Discover More Music
            </a>
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
                <span className="text-white ml-1 font-medium text-sm">
                  Alera
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if release is live
  if (releaseData.status !== "live") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white px-8 max-w-md mx-auto">
          <div className="mb-8">
            <div className="text-8xl mb-4">🎵</div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Coming Soon
            </h1>
            <p className="text-xl text-gray-300 mb-6">
              {releaseData.releaseTitle}
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                <span className="text-yellow-400 font-semibold">
                  Release Status
                </span>
              </div>
              <p className="text-gray-300 capitalize">
                {releaseData.status.replace("_", " ")}
              </p>
            </div>

            <div className="text-gray-400 text-sm">
              <p>This release is not yet available for streaming.</p>
              <p className="mt-2">Check back later or follow us for updates!</p>
            </div>

            <div className="pt-4">
              <button
                onClick={() => window.history.back()}
                className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 backdrop-blur-sm border border-white/30"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleStreamingServiceClick = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setFormError("Please enter a valid email address");
      return;
    }

    // Pre-fill the email in the dialog form and open it
    setFormData((prev) => ({ ...prev, email: email }));
    setEmail("");
    setFormError(null);
    setOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans antialiased">
      <div className="max-w-[480px] mx-auto px-6 py-6 min-h-screen flex flex-col sm:px-8 md:max-w-[600px] md:px-12">
        {/* Header Section */}
        <header className="text-center mb-12">
          {/* Artwork */}
          <div className="mb-6">
            <img
              src={releaseData.artworkUrl}
              alt={`${releaseData.releaseTitle} by ${releaseData.artistName}`}
              className="w-[280px] h-[280px] mx-auto rounded-2xl object-cover shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl sm:w-[320px] sm:h-[320px] md:w-[400px] md:h-[400px]"
            />
          </div>

          {/* Release Info */}
          <div className="mt-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">
              {releaseData.artistName}
            </h1>
            <h2 className="text-xl sm:text-2xl font-medium text-zinc-400 tracking-tight">
              {releaseData.releaseTitle}
            </h2>
          </div>
        </header>

        {/* Streaming Services Section */}
        <section className="mb-12">
          <h3 className="text-lg font-semibold text-white mb-6 text-center">
            Listen Now
          </h3>

          <div className="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-4">
            {releaseData.streamingServices.map((service) => (
              <a
                key={service.name}
                href={service.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleStreamingServiceClick(service.url)}
                className="flex items-center justify-start px-6 py-4 bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl text-white font-medium transition-all duration-200 hover:bg-[#1a1a1a] hover:border-[#A04EF7] hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-[#A04EF7] focus:ring-offset-2 focus:ring-offset-[#0a0a0a] min-h-[56px]"
              >
                <div className="mr-4 text-white">
                  <ServiceIcon serviceName={service.name} />
                </div>
                <span className="flex-1 text-left">{service.name}</span>
              </a>
            ))}
          </div>
        </section>

        {/* Fan Engagement Section */}
        <section className="mb-12">
          {/* Email Signup */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-6 text-center">
              Stay Connected
            </h3>
            <p className="text-sm text-zinc-400 text-center mb-6">
              Join the mailing list for exclusive updates
            </p>

            <form onSubmit={handleEmailSubmit} className="mb-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="flex-1 px-4 py-3 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#A04EF7] focus:ring-2 focus:ring-[#A04EF7]/10 transition-all min-h-[48px]"
                />
                <button
                  type="submit"
                  className="px-8 py-3 bg-[#A04EF7] text-white font-semibold rounded-lg hover:bg-[#C798F9] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-[#A04EF7] focus:ring-offset-2 focus:ring-offset-[#0a0a0a] min-h-[48px] flex items-center justify-center gap-2"
                >
                  Join Now
                </button>
              </div>
              {formError && (
                <p className="mt-3 text-sm text-red-400 text-center">
                  {formError}
                </p>
              )}
            </form>
          </div>

          {/* Artist Page CTA */}
          {releaseData.artistPublicLink && (
            <div>
              <a
                href={releaseData.artistPublicLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-8 py-4 bg-transparent border-2 border-[#A04EF7] text-[#A04EF7] font-semibold rounded-xl hover:bg-[#A04EF7] hover:text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-[#A04EF7] focus:ring-offset-2 focus:ring-offset-[#0a0a0a] min-h-[56px]"
              >
                <span>View My Page</span>
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="mt-auto pt-12 text-center">
          <div className="mt-4 flex items-center justify-center">
            <p className="text-xs text-white/40 mr-2">Powered by</p>
            <a
              href="https://www.alera.fm"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity flex items-center"
            >
              <Image
                src="/images/alera-logo-white.png"
                alt="Alera"
                width={40}
                height={40}
                className="h-12 w-12"
              />
              <span className="text-white mt-[1px] -ml-1 font-medium">
                Alera
              </span>
            </a>
          </div>
        </footer>
      </div>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) {
            setSuccessMessage(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl dark text-white">
          <DialogHeader className="text-white dark ">
            <DialogTitle>Become a Fan</DialogTitle>
            <DialogDescription>
              Enter your details to connect and show your support.
            </DialogDescription>
          </DialogHeader>
          {successMessage ? (
            <div className="py-4 text-white dark  dark:text-white">
              <p
                className="text-sm leading-relaxed dark text-white"
                style={{ color: "inherit" }}
              >
                {successMessage}
              </p>
              <div className="mt-6 flex justify-end text-white dark  dark:text-white">
                <button
                  className="px-5 py-2 rounded-full font-medium"
                  style={{ backgroundColor: "#A04EF7", color: "white" }}
                  onClick={() => {
                    setOpen(false);
                    setSuccessMessage(null);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form
              className="space-y-4 text-white dark  dark:text-white"
              onSubmit={async (e) => {
                e.preventDefault();
                setSubmitting(true);
                setFormError(null);

                try {
                  const payload = { ...formData };
                  const res = await fetch("/api/public/fans/add", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      slug: releaseData.artistPublicLink.split("/p/")[1],
                      ...payload,
                    }),
                  });

                  if (!res.ok) {
                    const errorData = await res.json().catch(() => ({}));
                    throw new Error(errorData.error || "Failed to add fan");
                  }

                  setSubmitting(false);
                  setFormData({
                    name: "",
                    email: "",
                    phone_number: "",
                    country: "",
                    gender: "",
                    age: "",
                    subscribed_status: "free",
                  });

                  const artistName = releaseData?.artistName || "the artist";
                  setSuccessMessage(
                    `Thanks for joining ${artistName}! We're so glad to have you a part of their journey. They'll be in touch shortly with updates, exclusives and more via email.`
                  );
                } catch (err: any) {
                  setSubmitting(false);
                  setFormError(
                    err.message || "Could not add fan. Please try again."
                  );
                }
              }}
            >
              <div className="grid grid-cols-2 gap-4 text-white dark  dark:text-white">
                <div>
                  <Label htmlFor="name" className=" text-white">
                    Name *
                  </Label>
                  <Input
                    id="name"
                    className=" text-white dark  dark:text-white"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, name: e.target.value }))
                    }
                    required
                    disabled={submitting}
                  />
                </div>
                <div>
                  <Label htmlFor="email" className=" text-white">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    className=" text-white dark dark:text-white"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, email: e.target.value }))
                    }
                    required
                    disabled={submitting}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-white dark  dark:text-white">
                <div>
                  <Label htmlFor="phone_number" className=" text-white">
                    Phone Number
                  </Label>
                  <Input
                    id="phone_number"
                    value={formData.phone_number}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        phone_number: e.target.value,
                      }))
                    }
                    disabled={submitting}
                    className=" text-white dark  dark:text-white"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="country"
                    className=" text-white dark  dark:text-white"
                  >
                    Country
                  </Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, country: e.target.value }))
                    }
                    disabled={submitting}
                    className=" text-white dark  dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4  dark text-white dark:text-white">
                <div>
                  <Label
                    htmlFor="gender"
                    className=" text-white dark  dark:text-white    "
                  >
                    Gender
                  </Label>
                  <Select
                    value={formData.gender || "not_specified"}
                    onValueChange={(value) =>
                      setFormData((p) => ({
                        ...p,
                        gender: value === "not_specified" ? "" : value,
                      }))
                    }
                    disabled={submitting}
                  >
                    <SelectTrigger className=" text-white dark  dark:text-white">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent className=" text-white dark  dark:text-white">
                      <SelectItem value="not_specified">
                        Not specified
                      </SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer_not_to_say">
                        Prefer not to say
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label
                    htmlFor="age"
                    className=" text-white dark  dark:text-white"
                  >
                    Age
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, age: e.target.value }))
                    }
                    disabled={submitting}
                    className=" text-white dark  dark:text-white"
                  />
                </div>
                <div />
              </div>
              <div className="grid grid-cols-2 gap-4 text-white dark  dark:text-white">
                <div>
                  <Label className=" text-white">Subscription Status</Label>
                  <Select
                    value={formData.subscribed_status}
                    onValueChange={(value) =>
                      setFormData((p) => ({ ...p, subscribed_status: value }))
                    }
                    disabled={submitting}
                  >
                    <SelectTrigger className="  dark text-white dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="  dark text-white dark:text-white">
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm  dark  dark:text-white">
                  {formError}
                </div>
              )}

              <div className="flex justify-end gap-2 text-white dark dark:text-white">
                <button
                  type="button"
                  className="px-4 py-2 rounded-full border border-white/20 hover:bg-white/5 transition-colors  dark text-white dark:text-white"
                  onClick={() => {
                    setOpen(false);
                    setFormError(null);
                  }}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all text-white"
                  style={{ backgroundColor: "#A04EF7", color: "white" }}
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Join Now"}
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
