"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/context/SubscriptionContext";
import {
  Music,
  Upload,
  Calendar,
  Globe,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  FileText,
  Users,
  Headphones,
  Plus,
  Trash2,
  Save,
  Send,
  Loader2,
  Zap,
} from "lucide-react";

const STORES = [
  "Spotify",
  "Apple Music",
  "iTunes",
  "Instagram & Facebook",
  "TikTok & other ByteDance stores",
  "YouTube Music",
  "Amazon",
  "Pandora",
  "Tidal",
  "iHeartRadio",
  "Claro Música",
  "Deezer",
  "Saavn",
  "Boomplay",
  "Anghami",
  "NetEase",
  "Tencent",
  "Qobuz (beta)",
  "Joox",
  "Kuack Media",
  "Adaptr",
  "Flo",
  "MediaNet",
  "Snapchat",
  "Roblox (beta)",
  "TikTok Commercial Music Library",
];

const GENRES = [
  "Afrobeat",
  "Afropop",
  "Alternative",
  "Big Band",
  "Blues",
  "Children's Music",
  "Christian/Gospel",
  "Comedy",
  "Country",
  "Dance",
  "Electronic",
  "Fitness & Workout",
  "Folk",
  "French Pop",
  "German Folk",
  "German Pop",
  "Hip Hop/Rap",
  "Holiday",
  "J-Pop",
  "Jazz",
  "K-Pop",
  "Latin",
  "Latin Urban",
  "Metal",
  "New Age",
  "Pop",
  "Punk",
  "R&B/Soul",
  "Reggae",
  "Rock",
  "Singer/Songwriter",
  "Spoken Word",
  "Vocal",
  "World",
];

const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Japanese",
  "Korean",
  "Chinese (Mandarin)",
  "Chinese (Cantonese)",
  "Arabic",
  "Hindi",
  "Russian",
  "Other",
];

const TRACK_PRICES = [
  { value: 0.69, label: "$0.69" },
  { value: 0.99, label: "$0.99" },
  { value: 1.29, label: "$1.29" },
];

const ADDITIONAL_DELIVERY_OPTIONS = [
  "YouTube Content ID",
  "Meta Rights Manager",
  "SoundCloud Monetization & Content Protection",
  "SoundExchange",
  "Tracklib",
  "Beatport (*Please note this is only for specific genres. If your selected genre doesn't apply we won't be able to send to Beatport)",
  "Juno Download",
  "Hook",
  "LyricFind (Requires lyrics to be provided)",
];

interface Songwriter {
  firstName: string;
  middleName: string;
  lastName: string;
  role: string;
}

interface Track {
  track_title: string;
  artist_names: string[];
  featured_artists: string[];
  songwriters: Songwriter[];
  producer_credits: Array<{ name: string; role: string }>;
  performer_credits: Array<{ name: string; role: string }>;
  genre: string;
  audio_file_url?: string;
  audio_file_name?: string;
  isrc?: string;
  lyrics_text?: string;
  has_lyrics: boolean;
  add_featured_to_title?: boolean;
}

interface Release {
  id?: string;
  distribution_type: string;
  artist_name: string;
  release_title: string;
  record_label?: string;
  c_line?: string; // C-Line (©) copyright field
  p_line?: string; // P-Line (℗) copyright field
  has_spotify_profile?: boolean; // Spotify for Artists profile question
  spotify_profile_url?: string; // Spotify profile URL if they have one
  has_apple_profile?: boolean; // Apple Music for Artists profile question
  apple_profile_url?: string; // Apple profile URL if they have one
  additional_delivery?: string[]; // Additional delivery options checklist
  primary_genre: string;
  secondary_genre?: string;
  language: string;
  explicit_lyrics: boolean;
  instrumental: boolean;
  version_info: string;
  version_other?: string;
  release_date: string | null;
  original_release_date?: string | null;
  previously_released: boolean;
  album_cover_url?: string;
  selected_stores: string[];
  track_price: number;
  terms_agreed: boolean;
  fake_streaming_agreement: boolean;
  distribution_agreement: boolean;
  artist_names_agreement: boolean;
  snapchat_terms: boolean;
  youtube_music_agreement: boolean;
  fraud_prevention_agreement: boolean;
  tracks: Track[];
  status?: string;
}

interface DistributionFlowProps {
  existingRelease?: Release;
  editId?: string;
  onSave?: (release: Release) => void;
}

export function DistributionFlow({
  existingRelease,
  editId,
  onSave,
}: DistributionFlowProps) {
  const { toast } = useToast();
  const { canAccessFeature, showUpgradeDialog, subscription } =
    useSubscription();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [audioUploadStates, setAudioUploadStates] = useState<{
    [key: number]: { uploading: boolean };
  }>({});
  const [canCreateRelease, setCanCreateRelease] = useState(true);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [formData, setFormData] = useState<Release>({
    distribution_type: "",
    artist_name: "",
    release_title: "",
    record_label: "",
    c_line: "",
    p_line: "",
    has_spotify_profile: false,
    spotify_profile_url: "",
    has_apple_profile: false,
    apple_profile_url: "",
    additional_delivery: [],
    primary_genre: "",
    secondary_genre: "",
    language: "English",
    explicit_lyrics: false,
    instrumental: false,
    version_info: "Normal",
    version_other: "",
    release_date: null,
    original_release_date: null,
    previously_released: false,
    album_cover_url: "",
    selected_stores: [...STORES],
    track_price: 0.99,
    terms_agreed: false,
    fake_streaming_agreement: false,
    distribution_agreement: false,
    artist_names_agreement: false,
    snapchat_terms: false,
    youtube_music_agreement: false,
    fraud_prevention_agreement: false,
    tracks: [],
  });

  useEffect(() => {
    if (existingRelease) {
      // Sanitize the data to ensure no null/undefined values for controlled inputs
      const sanitizedData = {
        ...existingRelease,
        distribution_type: existingRelease.distribution_type || "",
        artist_name: existingRelease.artist_name || "",
        release_title: existingRelease.release_title || "",
        record_label: existingRelease.record_label || "",
        c_line: existingRelease.c_line || "",
        p_line: existingRelease.p_line || "",
        spotify_profile_url: existingRelease.spotify_profile_url || "",
        apple_profile_url: existingRelease.apple_profile_url || "",
        primary_genre: existingRelease.primary_genre || "",
        secondary_genre: existingRelease.secondary_genre || "",
        language: existingRelease.language || "English",
        version_info: existingRelease.version_info || "Normal",
        version_other: existingRelease.version_other || "",
        release_date: existingRelease.release_date || null,
        original_release_date: existingRelease.original_release_date || null,
        album_cover_url: existingRelease.album_cover_url || "",
        track_price: existingRelease.track_price || 0.99,
        additional_delivery: existingRelease.additional_delivery || [],
        selected_stores: existingRelease.selected_stores || [...STORES],
        tracks: existingRelease.tracks || [],
        // Ensure boolean fields are properly set
        has_spotify_profile: Boolean(existingRelease.has_spotify_profile),
        has_apple_profile: Boolean(existingRelease.has_apple_profile),
        explicit_lyrics: Boolean(existingRelease.explicit_lyrics),
        instrumental: Boolean(existingRelease.instrumental),
        previously_released: Boolean(existingRelease.previously_released),
        terms_agreed: Boolean(existingRelease.terms_agreed),
        fake_streaming_agreement: Boolean(
          existingRelease.fake_streaming_agreement
        ),
        distribution_agreement: Boolean(existingRelease.distribution_agreement),
        artist_names_agreement: Boolean(existingRelease.artist_names_agreement),
        snapchat_terms: Boolean(existingRelease.snapchat_terms),
        youtube_music_agreement: Boolean(
          existingRelease.youtube_music_agreement
        ),
        fraud_prevention_agreement: Boolean(
          existingRelease.fraud_prevention_agreement
        ),
      };
      setFormData(sanitizedData);
    }
  }, [existingRelease]);

  // Load release data when editId is provided
  useEffect(() => {
    if (editId) {
      const loadReleaseData = async () => {
        try {
          const response = await fetch(`/api/distribution/releases/${editId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.release) {
              // Sanitize the data to ensure no null/undefined values for controlled inputs
              const sanitizedData = {
                ...data.release,
                distribution_type: data.release.distribution_type || "",
                artist_name: data.release.artist_name || "",
                release_title: data.release.release_title || "",
                record_label: data.release.record_label || "",
                c_line: data.release.c_line || "",
                p_line: data.release.p_line || "",
                spotify_profile_url: data.release.spotify_profile_url || "",
                apple_profile_url: data.release.apple_profile_url || "",
                primary_genre: data.release.primary_genre || "",
                secondary_genre: data.release.secondary_genre || "",
                language: data.release.language || "English",
                version_info: data.release.version_info || "Normal",
                version_other: data.release.version_other || "",
                release_date: data.release.release_date || null,
                original_release_date:
                  data.release.original_release_date || null,
                album_cover_url: data.release.album_cover_url || "",
                track_price: data.release.track_price || 0.99,
                additional_delivery: data.release.additional_delivery || [],
                selected_stores: data.release.selected_stores || [...STORES],
                tracks: data.release.tracks || [],
                // Ensure boolean fields are properly set
                has_spotify_profile: Boolean(data.release.has_spotify_profile),
                has_apple_profile: Boolean(data.release.has_apple_profile),
                explicit_lyrics: Boolean(data.release.explicit_lyrics),
                instrumental: Boolean(data.release.instrumental),
                previously_released: Boolean(data.release.previously_released),
                terms_agreed: Boolean(data.release.terms_agreed),
                fake_streaming_agreement: Boolean(
                  data.release.fake_streaming_agreement
                ),
                distribution_agreement: Boolean(
                  data.release.distribution_agreement
                ),
                artist_names_agreement: Boolean(
                  data.release.artist_names_agreement
                ),
                snapchat_terms: Boolean(data.release.snapchat_terms),
                youtube_music_agreement: Boolean(
                  data.release.youtube_music_agreement
                ),
                fraud_prevention_agreement: Boolean(
                  data.release.fraud_prevention_agreement
                ),
              };

              setFormData(sanitizedData);
              // Set current step based on release data
              if (data.release.current_step) {
                const stepMap: { [key: string]: number } = {
                  basic_info: 1,
                  tracks: 2,
                  terms: 3,
                };
                setCurrentStep(stepMap[data.release.current_step] || 1);
              }
            }
          }
        } catch (error) {
          console.error("Error loading release data:", error);
          toast({
            title: "Error",
            description: "Failed to load release data. Please try again.",
            variant: "destructive",
          });
        }
      };

      loadReleaseData();
    }
  }, [editId, toast]);

  // Check if user can create releases on component mount
  useEffect(() => {
    const checkReleaseAccess = async () => {
      if (!subscription) {
        setCheckingAccess(true);
        return;
      }

      try {
        // If editing existing release (either via existingRelease prop or editId), always allow access
        if (existingRelease || editId) {
          setCanCreateRelease(true);
          setCheckingAccess(false);
          return;
        }

        // Check if user can create new releases
        const canCreate = await canAccessFeature("release_creation");
        setCanCreateRelease(canCreate);

        // For trial users, automatically set distribution type to "Single"
        if (subscription.tier === "trial" && !formData.distribution_type) {
          updateFormData("distribution_type", "Single");
        }
      } catch (error) {
        console.error("Error checking release access:", error);
        setCanCreateRelease(false);
      } finally {
        setCheckingAccess(false);
      }
    };

    checkReleaseAccess();
  }, [subscription, existingRelease, canAccessFeature]);

  useEffect(() => {
    // Initialize tracks based on distribution type
    const { distribution_type } = formData;
    let trackCount = 1;

    if (distribution_type === "Single") trackCount = 1;
    else if (distribution_type === "EP")
      trackCount = Math.max(2, formData.tracks.length || 2);
    else if (distribution_type === "Album")
      trackCount = Math.max(8, formData.tracks.length || 8);

    if (formData.tracks.length !== trackCount) {
      const newTracks = [...formData.tracks];

      // Add tracks if needed
      while (newTracks.length < trackCount) {
        newTracks.push({
          track_title: "",
          artist_names: [formData.artist_name || ""],
          featured_artists: [],
          songwriters: [],
          producer_credits: [],
          performer_credits: [],
          genre: formData.primary_genre || "",
          has_lyrics: false,
          add_featured_to_title: false,
        });
      }

      // Remove tracks if needed
      while (newTracks.length > trackCount && trackCount > 0) {
        newTracks.pop();
      }

      setFormData((prev) => ({ ...prev, tracks: newTracks }));
    }
  }, [
    formData.distribution_type,
    formData.artist_name,
    formData.primary_genre,
  ]);

  const updateFormData = (field: keyof Release, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateTrack = (index: number, field: keyof Track, value: any) => {
    setFormData((prev) => {
      const newTracks = [...prev.tracks];
      newTracks[index] = { ...(newTracks[index] || {}), [field]: value } as any;
      return { ...prev, tracks: newTracks };
    });
  };

  const addTrack = () => {
    const newTrack: Track = {
      track_title: "",
      artist_names: [formData.artist_name || ""],
      featured_artists: [],
      songwriters: [],
      producer_credits: [],
      performer_credits: [],
      genre: formData.primary_genre || "",
      has_lyrics: false,
      add_featured_to_title: false,
    };
    setFormData((prev) => ({ ...prev, tracks: [...prev.tracks, newTrack] }));
  };

  const removeTrack = (index: number) => {
    if (formData.tracks.length > getMinTracks()) {
      const newTracks = formData.tracks.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, tracks: newTracks }));
    }
  };

  const getMinTracks = () => {
    switch (formData.distribution_type) {
      case "Single":
        return 1;
      case "EP":
        return 2;
      case "Album":
        return 8;
      default:
        return 1;
    }
  };

  const getMaxTracks = () => {
    switch (formData.distribution_type) {
      case "Single":
        return 1;
      case "EP":
        return 8;
      case "Album":
        return 50;
      default:
        return 1;
    }
  };

  const getMinReleaseDate = () => {
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 7);
    return minDate.toISOString().split("T")[0];
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(
          formData.distribution_type &&
          formData.artist_name &&
          formData.release_title &&
          formData.record_label &&
          formData.c_line &&
          formData.p_line &&
          formData.primary_genre &&
          formData.language &&
          formData.release_date &&
          formData.album_cover_url &&
          formData.selected_stores.length > 0
        );
      case 2:
        return formData.tracks.every(
          (track) =>
            track.track_title &&
            track.artist_names.length > 0 &&
            track.artist_names[0].trim() !== "" &&
            track.genre &&
            track.audio_file_url &&
            track.songwriters.length > 0 &&
            track.songwriters.every(
              (songwriter) =>
                songwriter.firstName.trim() !== "" &&
                songwriter.lastName.trim() !== "" &&
                songwriter.role.trim() !== ""
            )
        );
      case 3:
        const requiredAgreements = [
          formData.terms_agreed,
          formData.fake_streaming_agreement,
          formData.distribution_agreement,
          formData.artist_names_agreement,
          formData.youtube_music_agreement,
          formData.fraud_prevention_agreement,
        ];

        // Add snapchat terms if snapchat is selected
        if (formData.selected_stores.includes("Snapchat")) {
          requiredAgreements.push(formData.snapchat_terms);
        }

        return requiredAgreements.every((agreement) => agreement === true);
      default:
        return true;
    }
  };

  const handleNextStep = async () => {
    if (!editId && !existingRelease?.id) {
      toast({
        title: "Error",
        description: "No release ID found. Please refresh and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/distribution/releases/update-step", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          releaseId: editId || existingRelease?.id,
          step: currentStep,
          formData: formData,
          submitForReview: false,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Move to next step only if validation passes
        setCurrentStep(currentStep + 1);
        toast({
          title: "Step Saved",
          description: "Your progress has been saved.",
        });
      } else {
        // Handle validation errors
        if (data.errors && data.errors.length > 0) {
          toast({
            title: "Validation Error",
            description: data.errors.join(", "),
            variant: "destructive",
          });
        } else {
          throw new Error(data.error || "Failed to save step");
        }
      }
    } catch (error) {
      console.error("Error saving step:", error);
      toast({
        title: "Error",
        description: "Failed to save step. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    // Check subscription limits for draft saves too (but allow editing existing releases)
    if (!editId && !existingRelease) {
      const canCreate = await canAccessFeature("release_creation", {
        releaseType: formData.distribution_type,
      });

      if (!canCreate) {
        const message =
          formData.distribution_type === "Single"
            ? "You've used your free release. Upgrade to Plus or Pro to create unlimited releases."
            : "Trial users can only create Single releases. Upgrade to Plus or Pro to create EPs and Albums.";
        showUpgradeDialog(message, "plus");
        return;
      }
    }

    setIsSubmitting(true);
    if (!editId && !existingRelease?.id) {
      toast({
        title: "Error",
        description: "No release ID found. Please refresh and try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/distribution/releases/save-draft", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          releaseId: editId || existingRelease?.id,
          formData: formData,
          currentStep: `step_${currentStep}`, // This will be mapped to descriptive name in the API
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Draft Saved",
          description: "Your release has been saved as a draft.",
        });
      } else {
        throw new Error(data.error || "Failed to save draft");
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      toast({
        title: "Error",
        description: "Failed to save draft. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitForReview = async () => {
    // Check subscription limits first (but allow editing existing releases)
    if (!editId && !existingRelease) {
      const canCreate = await canAccessFeature("release_creation", {
        releaseType: formData.distribution_type,
      });

      if (!canCreate) {
        const message =
          formData.distribution_type === "Single"
            ? "You've used your free release. Upgrade to Plus or Pro to create unlimited releases."
            : "Trial users can only create Single releases. Upgrade to Plus or Pro to create EPs and Albums.";
        showUpgradeDialog(message, "plus");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/distribution/releases/update-step", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          releaseId: editId || existingRelease?.id,
          step: currentStep,
          formData: formData,
          submitForReview: true,
        }),
      });

      const data = await response.json();

      // Handle non-200 responses
      if (!response.ok) {
        if (data.requiresVerification) {
          toast({
            title: "Identity Verification Required",
            description:
              data.message ||
              "You must complete identity verification before submitting your release.",
            variant: "destructive",
            action: (
              <Button
                variant="default"
                className="text-white"
                size="sm"
                onClick={() =>
                  window.open(
                    "/dashboard/settings?tab=identity-check",
                    "_blank"
                  )
                }
              >
                Verify Identity
              </Button>
            ),
          });
          return;
        } else {
          toast({
            title: "Error",
            description:
              data.message || data.error || "Failed to submit for review",
            variant: "destructive",
          });
          return;
        }
      }

      if (data.success) {
        toast({
          title: "Success",
          description: "Release submitted for review successfully!",
        });
        if (onSave) onSave(data.release);
        // Redirect to music page after submission
        window.location.href = "/dashboard/my-music";
      } else {
        // Handle specific error cases
        if (data.requiresVerification) {
          toast({
            title: "Identity Verification Required",
            description:
              data.message ||
              "You must complete identity verification before submitting your release.",
            variant: "destructive",
            action: (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  window.open(
                    "/dashboard/settings?tab=identity-check",
                    "_blank"
                  )
                }
              >
                Verify Identity
              </Button>
            ),
          });
        } else if (data.errors && data.errors.length > 0) {
          toast({
            title: "Validation Error",
            description: data.errors.join(", "),
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description:
              data.message || data.error || "Failed to submit for review",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error submitting for review:", error);
      toast({
        title: "Error",
        description: "Failed to submit for review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAllStores = (selectAll: boolean) => {
    updateFormData("selected_stores", selectAll ? [...STORES] : []);
  };

  const toggleStore = (store: string) => {
    const currentStores = formData.selected_stores;
    const newStores = currentStores.includes(store)
      ? currentStores.filter((s) => s !== store)
      : [...currentStores, store];
    updateFormData("selected_stores", newStores);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Release Information</h3>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="distribution_type">Distribution Type *</Label>
            <Select
              value={formData.distribution_type}
              onValueChange={(value) =>
                updateFormData("distribution_type", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select distribution type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Single">Single (1 track)</SelectItem>
                {subscription?.tier !== "trial" &&
                  subscription?.status !== "pending_payment" &&
                  subscription?.status !== "payment_failed" && (
                    <>
                      <SelectItem value="EP">EP (2-8 tracks)</SelectItem>
                      <SelectItem value="Album">Album (8+ tracks)</SelectItem>
                    </>
                  )}
              </SelectContent>
            </Select>
            {subscription?.tier === "trial" && (
              <p className="text-sm text-muted-foreground">
                Trial users can only create Single releases. Upgrade to Plus or
                Pro to create EPs and Albums.
              </p>
            )}
            {(subscription?.status === "pending_payment" ||
              subscription?.status === "payment_failed") && (
              <p className="text-sm text-muted-foreground">
                Your payment is being processed. You can only create Single
                releases until your payment is confirmed.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="artist_name">Artist/Band Name *</Label>
              <Input
                id="artist_name"
                value={formData.artist_name}
                onChange={(e) => updateFormData("artist_name", e.target.value)}
                placeholder="Your artist name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="release_title">Release Title *</Label>
              <Input
                id="release_title"
                value={formData.release_title}
                onChange={(e) =>
                  updateFormData("release_title", e.target.value)
                }
                placeholder="Album/EP/Single title"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="record_label">Record Label *</Label>
            <Input
              id="record_label"
              value={formData.record_label}
              onChange={(e) => updateFormData("record_label", e.target.value)}
              placeholder="Independent or your label name"
              required
            />
          </div>

          {/* Copyright Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="c_line">C-Line (©) *</Label>
              <Input
                id="c_line"
                value={formData.c_line}
                onChange={(e) => updateFormData("c_line", e.target.value)}
                placeholder="© 2025 Your Name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="p_line">P-Line (℗) *</Label>
              <Input
                id="p_line"
                value={formData.p_line}
                onChange={(e) => updateFormData("p_line", e.target.value)}
                placeholder="℗ 2025 Your Name"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="primary_genre">Primary Genre *</Label>
              <Select
                value={formData.primary_genre}
                onValueChange={(value) =>
                  updateFormData("primary_genre", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select primary genre" />
                </SelectTrigger>
                <SelectContent>
                  {GENRES.map((genre) => (
                    <SelectItem key={genre} value={genre}>
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="secondary_genre">Secondary Genre</Label>
              <Select
                value={formData.secondary_genre}
                onValueChange={(value) =>
                  updateFormData("secondary_genre", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select secondary genre (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {GENRES.map((genre) => (
                    <SelectItem key={genre} value={genre}>
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="language">Language *</Label>
              <Select
                value={formData.language}
                onValueChange={(value) => updateFormData("language", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((language) => (
                    <SelectItem key={language} value={language}>
                      {language}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="track_price">Track Price</Label>
              <Select
                value={formData.track_price.toString()}
                onValueChange={(value) =>
                  updateFormData("track_price", parseFloat(value))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRACK_PRICES.map((price) => (
                    <SelectItem
                      key={price.value}
                      value={price.value.toString()}
                    >
                      {price.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="explicit_lyrics"
                checked={formData.explicit_lyrics}
                onCheckedChange={(checked) =>
                  updateFormData("explicit_lyrics", checked)
                }
              />
              <Label htmlFor="explicit_lyrics">Contains explicit lyrics</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="instrumental"
                checked={formData.instrumental}
                onCheckedChange={(checked) =>
                  updateFormData("instrumental", checked)
                }
              />
              <Label htmlFor="instrumental">Instrumental</Label>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Version Info</Label>
            <RadioGroup
              value={formData.version_info}
              onValueChange={(value) => updateFormData("version_info", value)}
              className="flex flex-wrap gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Normal" id="normal" />
                <Label htmlFor="normal">Normal</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Radio Edit" id="radio" />
                <Label htmlFor="radio">Radio Edit</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Other" id="other" />
                <Label htmlFor="other">Other</Label>
              </div>
            </RadioGroup>
            {formData.version_info === "Other" && (
              <Input
                value={formData.version_other}
                onChange={(e) =>
                  updateFormData("version_other", e.target.value)
                }
                placeholder="Specify version type"
                className="mt-2"
              />
            )}
          </div>

          {/* Existing Profile Links Section */}
          <div className="space-y-4">
            <h4 className="text-md font-medium">Existing Artist Profiles</h4>

            <div className="grid gap-4">
              <div className="space-y-3">
                <Label>
                  Do you already have a Spotify for Artists Profile?
                </Label>
                <div className="flex gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="has_spotify_profile"
                      checked={formData.has_spotify_profile === true}
                      onChange={() =>
                        updateFormData("has_spotify_profile", true)
                      }
                      className="rounded border-gray-300"
                    />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="has_spotify_profile"
                      checked={formData.has_spotify_profile === false}
                      onChange={() =>
                        updateFormData("has_spotify_profile", false)
                      }
                      className="rounded border-gray-300"
                    />
                    <span>No</span>
                  </label>
                </div>
                {formData.has_spotify_profile && (
                  <div className="grid gap-2">
                    <Label htmlFor="spotify_profile_url">
                      Spotify for Artists Profile URL
                    </Label>
                    <Input
                      id="spotify_profile_url"
                      value={formData.spotify_profile_url}
                      onChange={(e) =>
                        updateFormData("spotify_profile_url", e.target.value)
                      }
                      placeholder="https://artists.spotify.com/c/artist/..."
                    />
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label>
                  Do you already have an Apple Music for Artists Profile?
                </Label>
                <div className="flex gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="has_apple_profile"
                      checked={formData.has_apple_profile === true}
                      onChange={() => updateFormData("has_apple_profile", true)}
                      className="rounded border-gray-300"
                    />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="has_apple_profile"
                      checked={formData.has_apple_profile === false}
                      onChange={() =>
                        updateFormData("has_apple_profile", false)
                      }
                      className="rounded border-gray-300"
                    />
                    <span>No</span>
                  </label>
                </div>
                {formData.has_apple_profile && (
                  <div className="grid gap-2">
                    <Label htmlFor="apple_profile_url">
                      Apple Music for Artists Profile URL
                    </Label>
                    <Input
                      id="apple_profile_url"
                      value={formData.apple_profile_url}
                      onChange={(e) =>
                        updateFormData("apple_profile_url", e.target.value)
                      }
                      placeholder="https://artists.apple.com/artist/..."
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="release_date">Release Date *</Label>
              <Input
                id="release_date"
                type="date"
                value={formData.release_date || ""}
                min={getMinReleaseDate()}
                onChange={(e) => updateFormData("release_date", e.target.value)}
              />
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p>
                  Setting your release date to at least 1-week in the future
                  increases your chances of getting added to playlists.
                </p>
                <p>
                  If it's important that your album goes live in all stores on
                  the same day, select a release date at least 20 days in
                  advance.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="previously_released"
                checked={formData.previously_released}
                onCheckedChange={(checked) => {
                  updateFormData("previously_released", checked);
                  // Clear original_release_date if unchecked
                  if (!checked) {
                    updateFormData("original_release_date", null);
                  }
                }}
              />
              <Label htmlFor="previously_released">Previously released?</Label>
            </div>

            {formData.previously_released && (
              <div className="grid gap-2">
                <Label htmlFor="original_release_date">
                  Original Release Date *
                </Label>
                <Input
                  id="original_release_date"
                  type="date"
                  value={formData.original_release_date || ""}
                  onChange={(e) =>
                    updateFormData("original_release_date", e.target.value)
                  }
                />
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="album_cover">Album Cover *</Label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Upload album cover (Must be square, minimum 1500x1500px)
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Accepted formats: JPG, PNG, JPEG
              </p>
              <Input
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                className="mt-2"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // Validate file type
                    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
                    if (!validTypes.includes(file.type)) {
                      toast({
                        variant: "destructive",
                        title: "Invalid file type",
                        description: "Please upload a JPG or PNG image file",
                      });
                      return;
                    }

                    // Validate image dimensions
                    const img = new Image();
                    img.onload = async () => {
                      const { width, height } = img;

                      // Check if image is square
                      if (width !== height) {
                        toast({
                          variant: "destructive",
                          title: "Invalid image dimensions",
                          description:
                            "Album cover must be square (equal width and height)",
                        });
                        return;
                      }

                      // Check minimum dimensions
                      if (width < 1500 || height < 1500) {
                        toast({
                          variant: "destructive",
                          title: "Image too small",
                          description:
                            "Album cover must be at least 1500x1500 pixels",
                        });
                        return;
                      }

                      // If validation passes, proceed with upload
                      setIsUploading(true);
                      try {
                        const uploadData = new FormData();
                        uploadData.append("file", file);
                        uploadData.append("folder", "covers");

                        const response = await fetch("/api/upload", {
                          method: "POST",
                          body: uploadData,
                          headers: {
                            Authorization: `Bearer ${localStorage.getItem(
                              "authToken"
                            )}`,
                          },
                        });

                        if (response.ok) {
                          const result = await response.json();
                          updateFormData("album_cover_url", result.url);
                          toast({
                            title: "Success",
                            description: "Album cover uploaded successfully",
                          });
                        } else {
                          throw new Error("Upload failed");
                        }
                      } catch (error) {
                        toast({
                          variant: "destructive",
                          title: "Error",
                          description: "Failed to upload album cover",
                        });
                      } finally {
                        setIsUploading(false);
                      }
                    };

                    img.onerror = () => {
                      toast({
                        variant: "destructive",
                        title: "Invalid image",
                        description: "Please upload a valid image file",
                      });
                    };

                    img.src = URL.createObjectURL(file);
                  }
                }}
                disabled={isUploading}
              />
              {isUploading && (
                <div className="mt-4 flex items-center gap-2 justify-center">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <p className="text-sm text-blue-600">
                    Uploading album cover...
                  </p>
                </div>
              )}
              {formData.album_cover_url && !isUploading && (
                <div className="mt-4">
                  <img
                    src={formData.album_cover_url}
                    alt="Album cover preview"
                    className="w-24 h-24 object-cover rounded-lg mx-auto"
                  />
                  <p className="text-sm text-green-600 mt-2">
                    Album cover uploaded successfully
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label>Store Selection *</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => toggleAllStores(true)}
                >
                  Select All
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => toggleAllStores(false)}
                >
                  Deselect All
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto border rounded-lg p-4">
              {STORES.map((store) => (
                <div key={store} className="flex items-center space-x-2">
                  <Checkbox
                    id={store}
                    checked={formData.selected_stores.includes(store)}
                    onCheckedChange={() => toggleStore(store)}
                  />
                  <Label htmlFor={store} className="text-sm">
                    {store}
                  </Label>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {formData.selected_stores.length} of {STORES.length} stores
              selected
            </p>
          </div>

          {/* Additional Delivery Options - Moved after store selection */}
          <div className="space-y-4">
            <h4 className="text-md font-medium">Additional Delivery</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Select additional services for this release:
            </p>
            <div className="grid gap-3">
              {ADDITIONAL_DELIVERY_OPTIONS.map((option) => (
                <label key={option} className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={
                      formData.additional_delivery?.includes(option) || false
                    }
                    onChange={(e) => {
                      const currentOptions = formData.additional_delivery || [];
                      const newOptions = e.target.checked
                        ? [...currentOptions, option]
                        : currentOptions.filter((o) => o !== option);
                      updateFormData("additional_delivery", newOptions);
                    }}
                    className="mt-1 rounded border-gray-300"
                  />
                  <span className="text-sm leading-relaxed">{option}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Track Information</h3>
        {formData.tracks.length < getMaxTracks() && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addTrack}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Track
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {formData.tracks.map((track, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Track {index + 1}</h4>
              {formData.tracks.length > getMinTracks() && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTrack(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Track Title *</Label>
                  <Input
                    value={track.track_title}
                    onChange={(e) =>
                      updateTrack(index, "track_title", e.target.value)
                    }
                    placeholder="Song title"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Genre *</Label>
                  <Select
                    value={track.genre}
                    onValueChange={(value) =>
                      updateTrack(index, "genre", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent>
                      {GENRES.map((genre) => (
                        <SelectItem key={genre} value={genre}>
                          {genre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Artist Names *</Label>
                <div className="space-y-2">
                  {track.artist_names.map((artistName, artistIndex) => (
                    <div key={artistIndex} className="flex gap-2 items-center">
                      <Input
                        value={artistName}
                        onChange={(e) => {
                          const newArtistNames = [...track.artist_names];
                          newArtistNames[artistIndex] = e.target.value;
                          updateTrack(index, "artist_names", newArtistNames);
                        }}
                        placeholder="Artist name"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newArtistNames = track.artist_names.filter(
                            (_, i) => i !== artistIndex
                          );
                          updateTrack(index, "artist_names", newArtistNames);
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newArtistNames = [...track.artist_names, ""];
                      updateTrack(index, "artist_names", newArtistNames);
                    }}
                    className="flex items-center gap-2 w-fit"
                  >
                    <Plus className="h-4 w-4" />
                    Add Artist
                  </Button>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Featured Artists</Label>
                <div className="space-y-2">
                  {track.featured_artists.map(
                    (featuredArtist, featuredIndex) => (
                      <div
                        key={featuredIndex}
                        className="flex gap-2 items-center"
                      >
                        <Input
                          value={featuredArtist}
                          onChange={(e) => {
                            const newFeaturedArtists = [
                              ...track.featured_artists,
                            ];
                            newFeaturedArtists[featuredIndex] = e.target.value;
                            updateTrack(
                              index,
                              "featured_artists",
                              newFeaturedArtists
                            );
                          }}
                          placeholder="Featured artist name"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newFeaturedArtists =
                              track.featured_artists.filter(
                                (_, i) => i !== featuredIndex
                              );
                            updateTrack(
                              index,
                              "featured_artists",
                              newFeaturedArtists
                            );
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newFeaturedArtists = [
                        ...track.featured_artists,
                        "",
                      ];
                      updateTrack(
                        index,
                        "featured_artists",
                        newFeaturedArtists
                      );
                    }}
                    className="flex items-center gap-2 w-fit"
                  >
                    <Plus className="h-4 w-4" />
                    Add Featured Artist
                  </Button>
                </div>

                {track.featured_artists.length > 0 && (
                  <div className="flex items-center space-x-2 mt-2">
                    <Checkbox
                      checked={track.add_featured_to_title || false}
                      onCheckedChange={(checked) =>
                        updateTrack(index, "add_featured_to_title", checked)
                      }
                    />
                    <Label className="text-sm">
                      Would you like to add the featured artist to the title?
                    </Label>
                  </div>
                )}
              </div>

              <div className="grid gap-2">
                <Label>Songwriter Credits</Label>
                <div className="space-y-2">
                  {track.songwriters.map((songwriter, writerIndex) => (
                    <div
                      key={writerIndex}
                      className="grid grid-cols-1 md:grid-cols-3 gap-2 items-start md:items-center"
                    >
                      <div className="grid gap-1">
                        <Label>First Name</Label>
                        <Input
                          value={songwriter.firstName}
                          onChange={(e) => {
                            const newSongwriters = [...track.songwriters];
                            newSongwriters[writerIndex].firstName =
                              e.target.value;
                            updateTrack(index, "songwriters", newSongwriters);
                          }}
                          placeholder="First Name"
                          className="min-h-[44px] text-base"
                        />
                      </div>
                      <div className="grid gap-1">
                        <Label>Middle Name</Label>
                        <Input
                          value={songwriter.middleName}
                          onChange={(e) => {
                            const newSongwriters = [...track.songwriters];
                            newSongwriters[writerIndex].middleName =
                              e.target.value;
                            updateTrack(index, "songwriters", newSongwriters);
                          }}
                          placeholder="Middle Name"
                          className="min-h-[44px] text-base"
                        />
                      </div>
                      <div className="grid gap-1">
                        <Label>Last Name</Label>
                        <Input
                          value={songwriter.lastName}
                          onChange={(e) => {
                            const newSongwriters = [...track.songwriters];
                            newSongwriters[writerIndex].lastName =
                              e.target.value;
                            updateTrack(index, "songwriters", newSongwriters);
                          }}
                          placeholder="Last Name"
                          className="min-h-[44px] text-base"
                        />
                      </div>

                      <Select
                        value={songwriter.role}
                        onValueChange={(value) => {
                          const newSongwriters = [...track.songwriters];
                          newSongwriters[writerIndex].role = value;
                          updateTrack(index, "songwriters", newSongwriters);
                        }}
                      >
                        <SelectTrigger className="w-full md:w-[140px] min-h-[44px] text-base">
                          <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Music">Music</SelectItem>
                          <SelectItem value="Lyrics">Lyrics</SelectItem>
                          <SelectItem value="Music & Lyrics">
                            Music & Lyrics
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newSongwriters = track.songwriters.filter(
                            (_, i) => i !== writerIndex
                          );
                          updateTrack(index, "songwriters", newSongwriters);
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newSongwriters = [
                        ...track.songwriters,
                        {
                          firstName: "",
                          middleName: "",
                          lastName: "",
                          role: "Music & Lyrics",
                        },
                      ];
                      updateTrack(index, "songwriters", newSongwriters);
                    }}
                    className="flex items-center gap-2 w-fit"
                  >
                    <Plus className="h-4 w-4" />
                    Add Songwriter
                  </Button>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Performer</Label>
                  <div className="space-y-2">
                    {track.performer_credits.map(
                      (performer, performerIndex) => (
                        <div
                          key={performerIndex}
                          className="grid grid-cols-1 md:flex md:gap-2 md:items-center space-y-2 md:space-y-0"
                        >
                          <Select
                            value={performer.role}
                            onValueChange={(value) => {
                              const newPerformers = [
                                ...track.performer_credits,
                              ];
                              newPerformers[performerIndex].role = value;
                              updateTrack(
                                index,
                                "performer_credits",
                                newPerformers
                              );
                            }}
                          >
                            <SelectTrigger className="w-full md:w-[180px] min-h-[44px] text-base">
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Background vocals">
                                Background vocals
                              </SelectItem>
                              <SelectItem value="Banjo">Banjo</SelectItem>
                              <SelectItem value="Bass">Bass</SelectItem>
                              <SelectItem value="Bass drum (concert)">
                                Bass drum (concert)
                              </SelectItem>
                              <SelectItem value="Bass drum (kick)">
                                Bass drum (kick)
                              </SelectItem>
                              <SelectItem value="Bass guitar (all types)">
                                Bass guitar (all types)
                              </SelectItem>
                              <SelectItem value="Bass guitar (electric)">
                                Bass guitar (electric)
                              </SelectItem>
                              <SelectItem value="Basset horn">
                                Basset horn
                              </SelectItem>
                              <SelectItem value="Bassoon">Bassoon</SelectItem>
                              <SelectItem value="Bell tree">
                                Bell tree
                              </SelectItem>
                              <SelectItem value="Bongos">Bongos</SelectItem>
                              <SelectItem value="Brass instrument">
                                Brass instrument
                              </SelectItem>
                              <SelectItem value="Cello">Cello</SelectItem>
                              <SelectItem value="Clarinet">Clarinet</SelectItem>
                              <SelectItem value="Claves">Claves</SelectItem>
                              <SelectItem value="Clavinet">Clavinet</SelectItem>
                              <SelectItem value="Congas">Congas</SelectItem>
                              <SelectItem value="Contrabass">
                                Contrabass
                              </SelectItem>
                              <SelectItem value="Cowbell">Cowbell</SelectItem>
                              <SelectItem value="Cymbals">Cymbals</SelectItem>
                              <SelectItem value="Didgeridoo">
                                Didgeridoo
                              </SelectItem>
                              <SelectItem value="Djembe">Djembe</SelectItem>
                              <SelectItem value="Dobro guitar">
                                Dobro guitar
                              </SelectItem>
                              <SelectItem value="Double bass">
                                Double bass
                              </SelectItem>
                              <SelectItem value="Drum machine">
                                Drum machine
                              </SelectItem>
                              <SelectItem value="Drums">Drums</SelectItem>
                              <SelectItem value="Electric organ">
                                Electric organ
                              </SelectItem>
                              <SelectItem value="English horn">
                                English horn
                              </SelectItem>
                              <SelectItem value="Fiddle">Fiddle</SelectItem>
                              <SelectItem value="Flugelhorn">
                                Flugelhorn
                              </SelectItem>
                              <SelectItem value="Flute">Flute</SelectItem>
                              <SelectItem value="French horn">
                                French horn
                              </SelectItem>
                              <SelectItem value="Gong">Gong</SelectItem>
                              <SelectItem value="Guitar (acoustic)">
                                Guitar (acoustic)
                              </SelectItem>
                              <SelectItem value="Guitar (any type)">
                                Guitar (any type)
                              </SelectItem>
                              <SelectItem value="Guitar (electric)">
                                Guitar (electric)
                              </SelectItem>
                              <SelectItem value="Harmonica">
                                Harmonica
                              </SelectItem>
                              <SelectItem value="Harpsichord">
                                Harpsichord
                              </SelectItem>
                              <SelectItem value="Kazoo">Kazoo</SelectItem>
                              <SelectItem value="Keyboard">Keyboard</SelectItem>
                              <SelectItem value="Lute">Lute</SelectItem>
                              <SelectItem value="Mandolin">Mandolin</SelectItem>
                              <SelectItem value="Marimba">Marimba</SelectItem>
                              <SelectItem value="Melodica">Melodica</SelectItem>
                              <SelectItem value="Oboe">Oboe</SelectItem>
                              <SelectItem value="Ocarina">Ocarina</SelectItem>
                              <SelectItem value="Other instrument">
                                Other instrument
                              </SelectItem>
                              <SelectItem value="Pan flute">
                                Pan flute
                              </SelectItem>
                              <SelectItem value="Percussion instrument">
                                Percussion instrument
                              </SelectItem>
                              <SelectItem value="Piano">Piano</SelectItem>
                              <SelectItem value="Piccolo">Piccolo</SelectItem>
                              <SelectItem value="Pipe organ">
                                Pipe organ
                              </SelectItem>
                              <SelectItem value="Rapping">Rapping</SelectItem>
                              <SelectItem value="Reed instrument">
                                Reed instrument
                              </SelectItem>
                              <SelectItem value="Sampled artist">
                                Sampled artist
                              </SelectItem>
                              <SelectItem value="Sampler">Sampler</SelectItem>
                              <SelectItem value="Saxophone">
                                Saxophone
                              </SelectItem>
                              <SelectItem value="Shaker">Shaker</SelectItem>
                              <SelectItem value="Singing & vocals">
                                Singing & vocals
                              </SelectItem>
                              <SelectItem value="Sitar">Sitar</SelectItem>
                              <SelectItem value="Snare drum">
                                Snare drum
                              </SelectItem>
                              <SelectItem value="Special guest">
                                Special guest
                              </SelectItem>
                              <SelectItem value="Steel drums">
                                Steel drums
                              </SelectItem>
                              <SelectItem value="String instrument">
                                String instrument
                              </SelectItem>
                              <SelectItem value="Synthesizer">
                                Synthesizer
                              </SelectItem>
                              <SelectItem value="Tabla">Tabla</SelectItem>
                              <SelectItem value="Tambourine">
                                Tambourine
                              </SelectItem>
                              <SelectItem value="Theremin">Theremin</SelectItem>
                              <SelectItem value="Timpani">Timpani</SelectItem>
                              <SelectItem value="Triangle">Triangle</SelectItem>
                              <SelectItem value="Trombone">Trombone</SelectItem>
                              <SelectItem value="Trumpet">Trumpet</SelectItem>
                              <SelectItem value="Tuba">Tuba</SelectItem>
                              <SelectItem value="Turntable">
                                Turntable
                              </SelectItem>
                              <SelectItem value="Ukulele">Ukulele</SelectItem>
                              <SelectItem value="Unknown">Unknown</SelectItem>
                              <SelectItem value="Vibraphone">
                                Vibraphone
                              </SelectItem>
                              <SelectItem value="Viola">Viola</SelectItem>
                              <SelectItem value="Vocal accompaniment">
                                Vocal accompaniment
                              </SelectItem>
                              <SelectItem value="Washboard">
                                Washboard
                              </SelectItem>
                              <SelectItem value="Wind instrument">
                                Wind instrument
                              </SelectItem>
                              <SelectItem value="Xylophone">
                                Xylophone
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            value={performer.name}
                            onChange={(e) => {
                              const newPerformers = [
                                ...track.performer_credits,
                              ];
                              newPerformers[performerIndex].name =
                                e.target.value;
                              updateTrack(
                                index,
                                "performer_credits",
                                newPerformers
                              );
                            }}
                            placeholder="Name"
                            className="flex-1 min-h-[44px] text-base"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newPerformers =
                                track.performer_credits.filter(
                                  (_, i) => i !== performerIndex
                                );
                              updateTrack(
                                index,
                                "performer_credits",
                                newPerformers
                              );
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newPerformers = [
                          ...track.performer_credits,
                          { name: "", role: "" },
                        ];
                        updateTrack(index, "performer_credits", newPerformers);
                      }}
                      className="flex items-center gap-2 w-fit text-blue-600"
                    >
                      <Plus className="h-4 w-4" />
                      Add another performer
                    </Button>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Producer</Label>
                  <div className="space-y-2">
                    {track.producer_credits.map((producer, producerIndex) => (
                      <div
                        key={producerIndex}
                        className="grid grid-cols-1 md:flex md:gap-2 md:items-center space-y-2 md:space-y-0"
                      >
                        <Select
                          value={producer.role}
                          onValueChange={(value) => {
                            const newProducers = [...track.producer_credits];
                            newProducers[producerIndex].role = value;
                            updateTrack(
                              index,
                              "producer_credits",
                              newProducers
                            );
                          }}
                        >
                          <SelectTrigger className="w-full md:w-[180px] min-h-[44px] text-base">
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Additional engineer">
                              Additional engineer
                            </SelectItem>
                            <SelectItem value="Artist background vocal engineer">
                              Artist background vocal engineer
                            </SelectItem>
                            <SelectItem value="Artist vocal second engineer">
                              Artist vocal second engineer
                            </SelectItem>
                            <SelectItem value="Assistant producer">
                              Assistant producer
                            </SelectItem>
                            <SelectItem value="Beat maker">
                              Beat maker
                            </SelectItem>
                            <SelectItem value="Co-executive producer">
                              Co-executive producer
                            </SelectItem>
                            <SelectItem value="Co-producer">
                              Co-producer
                            </SelectItem>
                            <SelectItem value="Digital audio workstation engineer">
                              Digital audio workstation engineer
                            </SelectItem>
                            <SelectItem value="Digital editing engineer">
                              Digital editing engineer
                            </SelectItem>
                            <SelectItem value="Digital editing second engineer">
                              Digital editing second engineer
                            </SelectItem>
                            <SelectItem value="Direct stream digital engineer">
                              Direct stream digital engineer
                            </SelectItem>
                            <SelectItem value="Engineer">Engineer</SelectItem>
                            <SelectItem value="Executive producer">
                              Executive producer
                            </SelectItem>
                            <SelectItem value="Film sound engineer">
                              Film sound engineer
                            </SelectItem>
                            <SelectItem value="Immersive mix engineer">
                              Immersive mix engineer
                            </SelectItem>
                            <SelectItem value="Mastering engineer">
                              Mastering engineer
                            </SelectItem>
                            <SelectItem value="Mastering second engineer">
                              Mastering second engineer
                            </SelectItem>
                            <SelectItem value="Mixing engineer">
                              Mixing engineer
                            </SelectItem>
                            <SelectItem value="Overdub engineer">
                              Overdub engineer
                            </SelectItem>
                            <SelectItem value="Overdub second engineer">
                              Overdub second engineer
                            </SelectItem>
                            <SelectItem value="Post-producer">
                              Post-producer
                            </SelectItem>
                            <SelectItem value="Pre-production">
                              Pre-production
                            </SelectItem>
                            <SelectItem value="Pre-production engineer">
                              Pre-production engineer
                            </SelectItem>
                            <SelectItem value="Producer">Producer</SelectItem>
                            <SelectItem value="Production company">
                              Production company
                            </SelectItem>
                            <SelectItem value="Production manager">
                              Production manager
                            </SelectItem>
                            <SelectItem value="Programming engineer">
                              Programming engineer
                            </SelectItem>
                            <SelectItem value="Recording engineer">
                              Recording engineer
                            </SelectItem>
                            <SelectItem value="Recording second engineer">
                              Recording second engineer
                            </SelectItem>
                            <SelectItem value="Reissue producer">
                              Reissue producer
                            </SelectItem>
                            <SelectItem value="Remixing engineer">
                              Remixing engineer
                            </SelectItem>
                            <SelectItem value="Remixing second engineer">
                              Remixing second engineer
                            </SelectItem>
                            <SelectItem value="Second engineer">
                              Second engineer
                            </SelectItem>
                            <SelectItem value="String engineer">
                              String engineer
                            </SelectItem>
                            <SelectItem value="Tracking engineer">
                              Tracking engineer
                            </SelectItem>
                            <SelectItem value="Tracking second engineer">
                              Tracking second engineer
                            </SelectItem>
                            <SelectItem value="Transfers and safeties second engineer">
                              Transfers and safeties second engineer
                            </SelectItem>
                            <SelectItem value="Transfers and safeties engineer">
                              Transfers and safeties engineer
                            </SelectItem>
                            <SelectItem value="Vocal engineer">
                              Vocal engineer
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          value={producer.name}
                          onChange={(e) => {
                            const newProducers = [...track.producer_credits];
                            newProducers[producerIndex].name = e.target.value;
                            updateTrack(
                              index,
                              "producer_credits",
                              newProducers
                            );
                          }}
                          placeholder="Name"
                          className="flex-1 min-h-[44px] text-base"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newProducers = track.producer_credits.filter(
                              (_, i) => i !== producerIndex
                            );
                            updateTrack(
                              index,
                              "producer_credits",
                              newProducers
                            );
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newProducers = [
                          ...track.producer_credits,
                          { name: "", role: "" },
                        ];
                        updateTrack(index, "producer_credits", newProducers);
                      }}
                      className="flex items-center gap-2 w-fit text-blue-600"
                    >
                      <Plus className="h-4 w-4" />
                      Add another producer
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>ISRC</Label>
                <Input
                  value={track.isrc || ""}
                  onChange={(e) => updateTrack(index, "isrc", e.target.value)}
                  placeholder="International Standard Recording Code"
                />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  If you don't have an ISRC code, that's fine — we'll
                  automatically assign one for you.
                </p>
              </div>

              <div className="grid gap-2">
                <Label>Audio File *</Label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                  <Headphones className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Upload audio file (.WAV, .MP3, .M4A, .FLAC, .AIFF, .WMA)
                  </p>
                  <Input
                    type="file"
                    accept=".wav,.mp3,.m4a,.flac,.aiff,.wma"
                    className="mt-2"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setAudioUploadStates((prev) => ({
                          ...prev,
                          [index]: { uploading: true },
                        }));
                        try {
                          console.log("[Audio Upload] starting", {
                            name: file.name,
                            size: file.size,
                            type: file.type,
                          });
                          const uploadData = new FormData();
                          uploadData.append("file", file);
                          uploadData.append("folder", "audio");

                          const response = await fetch("/api/upload", {
                            method: "POST",
                            body: uploadData,
                            headers: {
                              Authorization: `Bearer ${localStorage.getItem(
                                "authToken"
                              )}`,
                            },
                          });

                          if (response.ok) {
                            const result = await response.json();
                            console.log("[Audio Upload] success", result);
                            // Store in both snake_case and camelCase to be robust
                            updateTrack(index, "audio_file_url", result.url);
                            updateTrack(index, "audio_file_name", file.name);
                            // @ts-ignore
                            updateTrack(
                              index as any,
                              "audioFileUrl" as any,
                              result.url
                            );
                            // @ts-ignore
                            updateTrack(
                              index as any,
                              "audioFileName" as any,
                              file.name
                            );
                            toast({
                              title: "Success",
                              description: "Audio file uploaded successfully",
                            });
                          } else {
                            console.error(
                              "[Audio Upload] failed status",
                              response.status
                            );
                            throw new Error("Upload failed");
                          }
                        } catch (error) {
                          console.error("[Audio Upload] error", error);
                          setAudioUploadStates((prev) => ({
                            ...prev,
                            [index]: { uploading: false },
                          }));
                          toast({
                            variant: "destructive",
                            title: "Error",
                            description: "Failed to upload audio file",
                          });
                        } finally {
                          setAudioUploadStates((prev) => ({
                            ...prev,
                            [index]: { uploading: false },
                          }));
                        }
                      }
                    }}
                    disabled={audioUploadStates[index]?.uploading}
                  />
                  {audioUploadStates[index]?.uploading && (
                    <div className="mt-4 flex items-center gap-2 justify-center">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      <p className="text-sm text-blue-600">
                        Uploading audio file...
                      </p>
                    </div>
                  )}
                  {track.audio_file_name &&
                    !audioUploadStates[index]?.uploading && (
                      <p className="text-sm text-green-600 mt-2">
                        Uploaded: {track.audio_file_name}
                      </p>
                    )}
                </div>
              </div>

              <div className="grid gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={track.has_lyrics}
                    onCheckedChange={(checked) =>
                      updateTrack(index, "has_lyrics", checked)
                    }
                  />
                  <Label>This track has lyrics</Label>
                </div>
                {track.has_lyrics && (
                  <Textarea
                    value={track.lyrics_text || ""}
                    onChange={(e) =>
                      updateTrack(index, "lyrics_text", e.target.value)
                    }
                    placeholder="Enter lyrics here..."
                    rows={6}
                  />
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Terms & Agreements</h3>

      <div className="space-y-4">
        <div className="flex items-start space-x-2">
          <Checkbox
            id="terms_agreed"
            checked={formData.terms_agreed}
            onCheckedChange={(checked) =>
              updateFormData("terms_agreed", checked)
            }
          />
          <Label htmlFor="terms_agreed" className="text-sm">
            I confirm this is original music or I have full rights to distribute
            it
          </Label>
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="fake_streaming_agreement"
            checked={formData.fake_streaming_agreement}
            onCheckedChange={(checked) =>
              updateFormData("fake_streaming_agreement", checked)
            }
          />
          <Label htmlFor="fake_streaming_agreement" className="text-sm">
            I won't use fake/promotional streaming services to artificially
            inflate streams
          </Label>
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="distribution_agreement"
            checked={formData.distribution_agreement}
            onCheckedChange={(checked) =>
              updateFormData("distribution_agreement", checked)
            }
          />
          <Label htmlFor="distribution_agreement" className="text-sm">
            I've read and agree to the Alera distribution agreement
          </Label>
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="artist_names_agreement"
            checked={formData.artist_names_agreement}
            onCheckedChange={(checked) =>
              updateFormData("artist_names_agreement", checked)
            }
          />
          <Label htmlFor="artist_names_agreement" className="text-sm">
            I confirm no other artist names are used without proper approval
          </Label>
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="youtube_music_agreement"
            checked={formData.youtube_music_agreement}
            onCheckedChange={(checked) =>
              updateFormData("youtube_music_agreement", checked)
            }
          />
          <Label htmlFor="youtube_music_agreement" className="text-sm">
            I agree to YouTube Music distribution conditions
          </Label>
        </div>

        {formData.selected_stores.includes("Snapchat") && (
          <div className="flex items-start space-x-2">
            <Checkbox
              id="snapchat_terms"
              checked={formData.snapchat_terms}
              onCheckedChange={(checked) =>
                updateFormData("snapchat_terms", checked)
              }
            />
            <Label htmlFor="snapchat_terms" className="text-sm">
              I opt-in to Snapchat distribution terms and conditions
            </Label>
          </div>
        )}

        <div className="flex items-start space-x-2">
          <Checkbox
            id="fraud_prevention_agreement"
            checked={formData.fraud_prevention_agreement}
            onCheckedChange={(checked) =>
              updateFormData("fraud_prevention_agreement", checked)
            }
          />
          <Label
            htmlFor="fraud_prevention_agreement"
            className="text-sm font-medium text-red-600 dark:text-red-400"
          >
            I understand that submitting fraudulent content will result in
            immediate account termination.
          </Label>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h4 className="font-medium">Release Summary</h4>
        <div className="grid gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Type:</span>
            <span>{formData.distribution_type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Artist:</span>
            <span>{formData.artist_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Title:</span>
            <span>{formData.release_title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Tracks:</span>
            <span>{formData.tracks.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Stores:</span>
            <span>{formData.selected_stores.length} selected</span>
          </div>
        </div>
      </div>
    </div>
  );

  const steps = [
    { number: 1, title: "Release Info", icon: Music },
    { number: 2, title: "Tracks", icon: Headphones },
    { number: 3, title: "Terms", icon: FileText },
  ];

  // Show loading state while checking access
  if (checkingAccess) {
    return (
      <div className="max-w-full mx-auto mt-6">
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading...</span>
        </div>
      </div>
    );
  }

  // Show upgrade prompt if user cannot create releases (but allow editing existing releases)
  if (!canCreateRelease && !existingRelease && !editId) {
    return (
      <div className="max-w-full mx-auto mt-6">
        <div className="text-center p-8">
          <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <Music className="h-12 w-12 text-gray-400" />
          </div>

          <h1 className="text-3xl font-bold mb-4">
            Release Creation Limit Reached
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            You've used your free release. Upgrade to Plus or Pro to create
            unlimited releases and unlock the full power of your music career.
          </p>

          <Button
            onClick={() =>
              showUpgradeDialog(
                "You've used your free release. Upgrade to Plus or Pro to create unlimited releases.",
                "plus"
              )
            }
            className="bg-gradient-to-r from-[#BFFF00] to-[#9AFF00] hover:from-[#BFFF00]/90 hover:to-[#9AFF00]/90 text-black font-semibold px-8 py-3 text-lg"
          >
            <Zap className="h-5 w-5 mr-2" />
            Upgrade Now →
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto mt-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Edit Your Release</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Submit your music for distribution across all major platforms
        </p>
      </div>

      {/* Mobile Steps - Vertical */}
      <div className="flex flex-col space-y-4 mb-8 md:hidden">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                currentStep >= step.number
                  ? "bg-[#BFFF00] border-[#BFFF00] text-black"
                  : "border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-400"
              }`}
            >
              {currentStep > step.number ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <step.icon className="h-4 w-4" />
              )}
            </div>
            <span
              className={`ml-3 font-medium text-sm ${
                currentStep >= step.number
                  ? "text-black dark:text-white"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              {step.title}
            </span>
            {currentStep === step.number && (
              <div className="ml-auto">
                <div className="w-2 h-2 bg-[#BFFF00] rounded-full"></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop Steps - Horizontal */}
      <div className="hidden md:flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= step.number
                  ? "bg-[#BFFF00] border-[#BFFF00] text-black"
                  : "border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-400"
              }`}
            >
              {currentStep > step.number ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <step.icon className="h-5 w-5" />
              )}
            </div>
            <span
              className={`ml-2 font-medium ${
                currentStep >= step.number
                  ? "text-black dark:text-white"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              {step.title}
            </span>
            {index < steps.length - 1 && (
              <div
                className={`h-0.5 w-20 mx-4 ${
                  currentStep > step.number
                    ? "bg-[#BFFF00]"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          <div className="mt-8">
            {/* Validation hints */}
            {!validateStep(currentStep) && (
              <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-800 dark:text-yellow-200">
                    <p className="font-medium mb-1">
                      Complete all required fields to continue:
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      {currentStep === 1 && (
                        <>
                          {!formData.distribution_type && (
                            <li>Select distribution type</li>
                          )}
                          {!formData.artist_name && (
                            <li>Enter artist/band name</li>
                          )}
                          {!formData.release_title && (
                            <li>Enter release title</li>
                          )}
                          {!formData.record_label && (
                            <li>Enter record label</li>
                          )}
                          {!formData.c_line && <li>Enter C-Line copyright</li>}
                          {!formData.p_line && <li>Enter P-Line copyright</li>}
                          {!formData.primary_genre && (
                            <li>Select primary genre</li>
                          )}
                          {!formData.language && <li>Select language</li>}
                          {!formData.release_date && (
                            <li>Choose release date</li>
                          )}
                          {!formData.album_cover_url && (
                            <li>Upload album cover</li>
                          )}
                          {formData.selected_stores.length === 0 && (
                            <li>Select at least one store</li>
                          )}
                        </>
                      )}
                      {currentStep === 2 && (
                        <>
                          {formData.tracks.some(
                            (track) => !track.track_title
                          ) && <li>Enter title for all tracks</li>}
                          {formData.tracks.some(
                            (track) =>
                              !track.artist_names.length ||
                              !track.artist_names[0].trim()
                          ) && <li>Enter artist name for all tracks</li>}
                          {formData.tracks.some((track) => !track.genre) && (
                            <li>Select genre for all tracks</li>
                          )}
                          {formData.tracks.some(
                            (track) => !track.audio_file_url
                          ) && <li>Upload audio file for all tracks</li>}
                          {formData.tracks.some(
                            (track) =>
                              !track.songwriters.length ||
                              track.songwriters.some(
                                (s) =>
                                  !s.firstName.trim() ||
                                  !s.lastName.trim() ||
                                  !s.role.trim()
                              )
                          ) && (
                            <li>
                              Complete songwriter information for all tracks
                              (first name, last name, and role required)
                            </li>
                          )}
                        </>
                      )}
                      {currentStep === 3 && (
                        <>
                          {!formData.terms_agreed && (
                            <li>Confirm original music rights</li>
                          )}
                          {!formData.fake_streaming_agreement && (
                            <li>Agree to no fake streaming</li>
                          )}
                          {!formData.distribution_agreement && (
                            <li>Accept distribution agreement</li>
                          )}
                          {!formData.artist_names_agreement && (
                            <li>Confirm artist names approval</li>
                          )}
                          {!formData.youtube_music_agreement && (
                            <li>Accept YouTube Music terms</li>
                          )}
                          {formData.selected_stores.includes("Snapchat") &&
                            !formData.snapchat_terms && (
                              <li>Accept Snapchat terms</li>
                            )}
                          {!formData.fraud_prevention_agreement && (
                            <li>Confirm fraud prevention agreement</li>
                          )}
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <div className="flex gap-2">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setCurrentStep(currentStep - 1);
                    }}
                  >
                    Previous
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Draft
                </Button>

                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    disabled={
                      !validateStep(currentStep) ||
                      isUploading ||
                      Object.values(audioUploadStates).some(
                        (state) => state.uploading
                      ) ||
                      isSubmitting
                    }
                    className={`${
                      !validateStep(currentStep) ||
                      isUploading ||
                      Object.values(audioUploadStates).some(
                        (state) => state.uploading
                      ) ||
                      isSubmitting
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300"
                        : "bg-[#BFFF00] text-black hover:bg-[#BFFF00]/90"
                    }`}
                  >
                    {isUploading ||
                    Object.values(audioUploadStates).some(
                      (state) => state.uploading
                    ) ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Uploading...
                      </div>
                    ) : isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </div>
                    ) : (
                      "Next"
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSubmitForReview}
                    disabled={
                      !validateStep(3) ||
                      isSubmitting ||
                      isUploading ||
                      Object.values(audioUploadStates).some(
                        (state) => state.uploading
                      )
                    }
                    className={`flex items-center gap-2 ${
                      !validateStep(3) ||
                      isSubmitting ||
                      isUploading ||
                      Object.values(audioUploadStates).some(
                        (state) => state.uploading
                      )
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300"
                        : "bg-[#BFFF00] text-black hover:bg-[#BFFF00]/90"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : isUploading ||
                      Object.values(audioUploadStates).some(
                        (state) => state.uploading
                      ) ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Submit for Review
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
