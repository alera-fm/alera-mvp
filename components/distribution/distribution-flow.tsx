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
  primary_genre: string;
  secondary_genre?: string;
  language: string;
  explicit_lyrics: boolean;
  instrumental: boolean;
  version_info: string;
  version_other?: string;
  release_date: string;
  original_release_date?: string;
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
  tracks: Track[];
  status?: string;
}

interface DistributionFlowProps {
  existingRelease?: Release;
  onSave?: (release: Release) => void;
}

export function DistributionFlow({
  existingRelease,
  onSave,
}: DistributionFlowProps) {
  const { toast } = useToast();
  const { canAccessFeature, showUpgradeDialog } = useSubscription();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [coverUploadProgress, setCoverUploadProgress] = useState(0);
  const [audioUploadStates, setAudioUploadStates] = useState<{[key: number]: {uploading: boolean, progress: number}}>({});
  const [formData, setFormData] = useState<Release>({
    distribution_type: "",
    artist_name: "",
    release_title: "",
    record_label: "",
    primary_genre: "",
    secondary_genre: "",
    language: "English",
    explicit_lyrics: false,
    instrumental: false,
    version_info: "Normal",
    version_other: "",
    release_date: "",
    original_release_date: "",
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
    tracks: [],
  });

  useEffect(() => {
    if (existingRelease) {
      setFormData(existingRelease);
    }
  }, [existingRelease]);

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
            track.audio_file_url
        );
      case 3:
        const requiredAgreements = [
          formData.terms_agreed,
          formData.fake_streaming_agreement,
          formData.distribution_agreement,
          formData.artist_names_agreement,
          formData.youtube_music_agreement
        ];
        
        // Add snapchat terms if snapchat is selected
        if (formData.selected_stores.includes("Snapchat")) {
          requiredAgreements.push(formData.snapchat_terms);
        }
        
        return requiredAgreements.every(agreement => agreement === true);
      default:
        return true;
    }
  };

  const handleSaveDraft = async () => {
    // Check subscription limits for draft saves too
    const canCreate = await canAccessFeature('release_creation', { 
      releaseType: formData.distribution_type 
    });
    
    if (!canCreate) {
      const message = formData.distribution_type === 'Single' 
        ? 'Trial users can only have 1 pending release. Upgrade to create unlimited releases.'
        : 'Trial users can only create Single releases. Upgrade to Plus to create EPs and Albums.';
      showUpgradeDialog(message, 'plus');
      return;
    }

    setIsSubmitting(true);
    try {
      // Guard: ensure audio URLs captured for all tracks that have a file name
      const missingAudio = (formData.tracks || []).some((t: any) => (t.audio_file_name || t.audioFileName) && !(t.audio_file_url || t.audioFileUrl))
      if (missingAudio) {
        toast({ variant: "destructive", title: "Missing audio URL", description: "Please wait a moment after upload or reselect the file, then try again." })
        setIsSubmitting(false);
        return
      }

      const endpoint = existingRelease?.id
        ? `/api/distribution/releases/${existingRelease.id}`
        : "/api/distribution/releases";

      const method = existingRelease?.id ? "PUT" : "POST";

      // Normalize audio fields before submit
      const normalizedTracks = (formData.tracks || []).map((t: any) => ({
        ...t,
        audio_file_url: t.audio_file_url || t.audioFileUrl || '',
        audio_file_name: t.audio_file_name || t.audioFileName || '',
      }))

      try {
        console.log('[Submit Draft] tracks snapshot (normalized)', normalizedTracks.map((t:any) => ({
          title: t.track_title,
          audio_file_url: t.audio_file_url,
          audio_file_name: t.audio_file_name,
        })))
      } catch {}

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ ...formData, tracks: normalizedTracks, submit_for_review: false }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Success",
          description: "Draft saved successfully!",
        });
        if (onSave) onSave(data.release);
        // Redirect to music page after saving draft
        window.location.href = "/dashboard/my-music";
      } else {
        const errorData = await response.json();
        
        // Handle subscription-related errors with upgrade dialog
        if (response.status === 403 && errorData.subscriptionLimited) {
          const message = formData.distribution_type === 'Single' 
            ? 'Trial users can only have 1 pending release. Upgrade to create unlimited releases.'
            : 'Trial users can only create Single releases. Upgrade to Plus to create EPs and Albums.';
          showUpgradeDialog(message, 'plus');
          return;
        }
        
        throw new Error(errorData.error || "Failed to save draft");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save draft",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitForReview = async () => {
    // Check subscription limits first
    const canCreate = await canAccessFeature('release_creation', { 
      releaseType: formData.distribution_type 
    });
    
    if (!canCreate) {
      const message = formData.distribution_type === 'Single' 
        ? 'Trial users can only have 1 pending release. Upgrade to create unlimited releases.'
        : 'Trial users can only create Single releases. Upgrade to Plus to create EPs and Albums.';
      showUpgradeDialog(message, 'plus');
      return;
    }

    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please complete all required fields and agreements",
      });
      return;
    }

    // Guard: ensure audio URLs captured for all tracks
    const missingAudio = (formData.tracks || []).some((t: any) => !(t.audio_file_url || t.audioFileUrl))
    if (missingAudio) {
      toast({ variant: "destructive", title: "Audio missing", description: "Please upload/select an audio file for each track before submitting." })
      return
    }

    setIsSubmitting(true);
    try {
      const endpoint = existingRelease?.id
        ? `/api/distribution/releases/${existingRelease.id}`
        : "/api/distribution/releases";

      const method = existingRelease?.id ? "PUT" : "POST";

      // Normalize audio fields before submit
      const normalizedTracks2 = (formData.tracks || []).map((t: any) => ({
        ...t,
        audio_file_url: t.audio_file_url || t.audioFileUrl || '',
        audio_file_name: t.audio_file_name || t.audioFileName || '',
      }))

      try {
        console.log('[Submit Review] tracks snapshot (normalized)', normalizedTracks2.map((t:any) => ({
          title: t.track_title,
          audio_file_url: t.audio_file_url,
          audio_file_name: t.audio_file_name,
        })))
      } catch {}

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ ...formData, tracks: normalizedTracks2, submit_for_review: true }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Success",
          description: "Release submitted for review!",
        });
        if (onSave) onSave(data.release);
      } else {
        const errorData = await response.json();
        
        // Handle subscription-related errors with upgrade dialog
        if (response.status === 403 && errorData.subscriptionLimited) {
          const message = formData.distribution_type === 'Single' 
            ? 'Trial users can only have 1 pending release. Upgrade to create unlimited releases.'
            : 'Trial users can only create Single releases. Upgrade to Plus to create EPs and Albums.';
          showUpgradeDialog(message, 'plus');
          return;
        }
        
        throw new Error(errorData.error || "Failed to submit for review");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to submit for review",
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
                <SelectItem value="EP">EP (2-8 tracks)</SelectItem>
                <SelectItem value="Album">Album (8+ tracks)</SelectItem>
              </SelectContent>
            </Select>
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
            <Label htmlFor="record_label">Record Label</Label>
            <Input
              id="record_label"
              value={formData.record_label}
              onChange={(e) => updateFormData("record_label", e.target.value)}
              placeholder="Independent or your label name"
            />
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

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="release_date">Release Date *</Label>
              <Input
                id="release_date"
                type="date"
                value={formData.release_date}
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
                    updateFormData("original_release_date", "");
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
                  value={formData.original_release_date}
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
                Upload album cover (JPG, 3000x3000 recommended)
              </p>
              <Input
                type="file"
                accept="image/*"
                className="mt-2"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setIsUploading(true);
                    setCoverUploadProgress(0);
                    try {
                      const uploadData = new FormData();
                      uploadData.append("file", file);
                      uploadData.append("folder", "covers");

                      // Simulate progress for better UX (since we can't track real progress with fetch)
                      const progressInterval = setInterval(() => {
                        setCoverUploadProgress(prev => {
                          if (prev >= 90) {
                            clearInterval(progressInterval);
                            return 90;
                          }
                          return prev + 10;
                        });
                      }, 200);

                      const response = await fetch("/api/upload", {
                        method: "POST",
                        body: uploadData,
                        headers: {
                          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                        },
                      });

                      clearInterval(progressInterval);
                      setCoverUploadProgress(100);

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
                      setCoverUploadProgress(0);
                      toast({
                        variant: "destructive",
                        title: "Error",
                        description: "Failed to upload album cover",
                      });
                    } finally {
                      setTimeout(() => {
                        setIsUploading(false);
                        setCoverUploadProgress(0);
                      }, 1000);
                    }
                  }
                }}
                disabled={isUploading}
              />
              {isUploading && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 justify-center">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <p className="text-sm text-blue-600">
                      Uploading album cover... {coverUploadProgress}%
                    </p>
                  </div>
                  <Progress value={coverUploadProgress} className="w-full max-w-xs mx-auto" />
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
                            (_, i) => i !== artistIndex,
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
                              newFeaturedArtists,
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
                                (_, i) => i !== featuredIndex,
                              );
                            updateTrack(
                              index,
                              "featured_artists",
                              newFeaturedArtists,
                            );
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ),
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
                        newFeaturedArtists,
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
                      className="grid grid-cols-3 gap-2 items-center"
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
                        <SelectTrigger className="w-[140px]">
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
                            (_, i) => i !== writerIndex,
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
                          className="flex gap-2 items-center"
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
                                newPerformers,
                              );
                            }}
                          >
                            <SelectTrigger className="w-[180px]">
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
                                newPerformers,
                              );
                            }}
                            placeholder="Name"
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newPerformers =
                                track.performer_credits.filter(
                                  (_, i) => i !== performerIndex,
                                );
                              updateTrack(
                                index,
                                "performer_credits",
                                newPerformers,
                              );
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ),
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
                        className="flex gap-2 items-center"
                      >
                        <Select
                          value={producer.role}
                          onValueChange={(value) => {
                            const newProducers = [...track.producer_credits];
                            newProducers[producerIndex].role = value;
                            updateTrack(
                              index,
                              "producer_credits",
                              newProducers,
                            );
                          }}
                        >
                          <SelectTrigger className="w-[180px]">
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
                              newProducers,
                            );
                          }}
                          placeholder="Name"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newProducers = track.producer_credits.filter(
                              (_, i) => i !== producerIndex,
                            );
                            updateTrack(
                              index,
                              "producer_credits",
                              newProducers,
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
                        setAudioUploadStates(prev => ({
                          ...prev,
                          [index]: { uploading: true, progress: 0 }
                        }));
                        try {
                          console.log('[Audio Upload] starting', { name: file.name, size: file.size, type: file.type })
                          const uploadData = new FormData();
                          uploadData.append("file", file);
                          uploadData.append("folder", "audio");

                          // Simulate progress for better UX
                          const progressInterval = setInterval(() => {
                            setAudioUploadStates(prev => ({
                              ...prev,
                              [index]: {
                                uploading: true,
                                progress: prev[index]?.progress >= 90 ? 90 : (prev[index]?.progress || 0) + 10
                              }
                            }));
                          }, 300);

                          const response = await fetch("/api/upload", {
                            method: "POST",
                            body: uploadData,
                            headers: {
                              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                            },
                          });

                          clearInterval(progressInterval);
                          setAudioUploadStates(prev => ({
                            ...prev,
                            [index]: { uploading: true, progress: 100 }
                          }));

                          if (response.ok) {
                            const result = await response.json();
                            console.log('[Audio Upload] success', result)
                            // Store in both snake_case and camelCase to be robust
                            updateTrack(index, "audio_file_url", result.url);
                            updateTrack(index, "audio_file_name", file.name);
                            // @ts-ignore
                            updateTrack(index as any, "audioFileUrl" as any, result.url);
                            // @ts-ignore
                            updateTrack(index as any, "audioFileName" as any, file.name);
                            toast({
                              title: "Success",
                              description: "Audio file uploaded successfully",
                            });
                          } else {
                            console.error('[Audio Upload] failed status', response.status)
                            throw new Error("Upload failed");
                          }
                        } catch (error) {
                          console.error('[Audio Upload] error', error)
                          setAudioUploadStates(prev => ({
                            ...prev,
                            [index]: { uploading: false, progress: 0 }
                          }));
                          toast({
                            variant: "destructive",
                            title: "Error",
                            description: "Failed to upload audio file",
                          });
                        } finally {
                          setTimeout(() => {
                            setAudioUploadStates(prev => ({
                              ...prev,
                              [index]: { uploading: false, progress: 0 }
                            }));
                          }, 1000);
                        }
                      }
                    }}
                    disabled={audioUploadStates[index]?.uploading}
                  />
                  {audioUploadStates[index]?.uploading && (
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 justify-center">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                        <p className="text-sm text-blue-600">
                          Uploading audio file... {audioUploadStates[index]?.progress}%
                        </p>
                      </div>
                      <Progress value={audioUploadStates[index]?.progress} className="w-full max-w-xs mx-auto" />
                    </div>
                  )}
                  {track.audio_file_name && !audioUploadStates[index]?.uploading && (
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

  return (
    <div className="max-w-full mx-auto mt-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Create Your Release</h1>
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
                    <p className="font-medium mb-1">Complete all required fields to continue:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {currentStep === 1 && (
                        <>
                          {!formData.distribution_type && <li>Select distribution type</li>}
                          {!formData.artist_name && <li>Enter artist/band name</li>}
                          {!formData.release_title && <li>Enter release title</li>}
                          {!formData.primary_genre && <li>Select primary genre</li>}
                          {!formData.language && <li>Select language</li>}
                          {!formData.release_date && <li>Choose release date</li>}
                          {!formData.album_cover_url && <li>Upload album cover</li>}
                          {formData.selected_stores.length === 0 && <li>Select at least one store</li>}
                        </>
                      )}
                      {currentStep === 2 && (
                        <>
                          {formData.tracks.some(track => !track.track_title) && <li>Enter title for all tracks</li>}
                          {formData.tracks.some(track => !track.artist_names.length || !track.artist_names[0].trim()) && <li>Enter artist name for all tracks</li>}
                          {formData.tracks.some(track => !track.genre) && <li>Select genre for all tracks</li>}
                          {formData.tracks.some(track => !track.audio_file_url) && <li>Upload audio file for all tracks</li>}
                        </>
                      )}
                      {currentStep === 3 && (
                        <>
                          {!formData.terms_agreed && <li>Confirm original music rights</li>}
                          {!formData.fake_streaming_agreement && <li>Agree to no fake streaming</li>}
                          {!formData.distribution_agreement && <li>Accept distribution agreement</li>}
                          {!formData.artist_names_agreement && <li>Confirm artist names approval</li>}
                          {!formData.youtube_music_agreement && <li>Accept YouTube Music terms</li>}
                          {formData.selected_stores.includes("Snapchat") && !formData.snapchat_terms && <li>Accept Snapchat terms</li>}
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
                    onClick={() => setCurrentStep(currentStep - 1)}
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
                    onClick={() => setCurrentStep(currentStep + 1)}
                    disabled={!validateStep(currentStep) || isUploading || Object.values(audioUploadStates).some(state => state.uploading)}
                    className={`${
                      !validateStep(currentStep) || isUploading || Object.values(audioUploadStates).some(state => state.uploading)
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300" 
                        : "bg-[#BFFF00] text-black hover:bg-[#BFFF00]/90"
                    }`}
                  >
                    {isUploading || Object.values(audioUploadStates).some(state => state.uploading) ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Uploading...
                      </div>
                    ) : (
                      "Next"
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSubmitForReview}
                    disabled={!validateStep(3) || isSubmitting || isUploading || Object.values(audioUploadStates).some(state => state.uploading)}
                    className={`flex items-center gap-2 ${
                      !validateStep(3) || isSubmitting || isUploading || Object.values(audioUploadStates).some(state => state.uploading)
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300"
                        : "bg-[#BFFF00] text-black hover:bg-[#BFFF00]/90"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : isUploading || Object.values(audioUploadStates).some(state => state.uploading) ? (
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
