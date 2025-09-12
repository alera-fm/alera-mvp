"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Loader2, Save, X, Users, FileText } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Release } from "@/lib/mock-music-data";
import { genreOptions } from "@/lib/mock-music-data";
import { EditCreditsModal } from "./edit-credits-modal";
import { EditLyricsModal } from "./edit-lyrics-modal";
import { toast } from "sonner";

interface EditReleaseModalProps {
  release: Release | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (release: Release) => void;
}

export function EditReleaseModal({
  release,
  isOpen,
  onClose,
  onSave,
}: EditReleaseModalProps) {
  const [formData, setFormData] = useState<Partial<Release>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<Date>();
  const [isCreditsModalOpen, setIsCreditsModalOpen] = useState(false);
  const [isLyricsModalOpen, setIsLyricsModalOpen] = useState(false);

  useEffect(() => {
    if (release) {
      setFormData(release);
      setDate(new Date(release.releaseDate));
    }
  }, [release]);

  const handleSave = async () => {
    if (!release || !formData.trackTitle || !formData.artistName || !date) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const updatedRelease: Release = {
      ...release,
      ...formData,
      releaseDate: date.toISOString(),
      status: "Under Review", // Automatically set status to Under Review
    };

    onSave(updatedRelease);
    setIsLoading(false);
    toast.success("Your changes have been submitted and are now under review.");
    onClose();
  };

  const handleClose = () => {
    setFormData({});
    setDate(undefined);
    onClose();
  };

  const handleCreditsUpdate = (credits: Release["credits"]) => {
    setFormData((prev) => ({ ...prev, credits }));
  };

  const handleLyricsUpdate = (lyrics: string) => {
    setFormData((prev) => ({ ...prev, lyrics }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white dark:bg-[#0f0f1a] border border-gray-200 dark:border-gray-800 rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-[#333] dark:text-white">
                  Edit Release
                </DialogTitle>
              </DialogHeader>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 py-4"
              >
                {/* Track Title */}
                <div className="space-y-2">
                  <Label
                    htmlFor="trackTitle"
                    className="text-sm font-medium text-[#333] dark:text-white"
                  >
                    Track Title *
                  </Label>
                  <Input
                    id="trackTitle"
                    value={formData.trackTitle || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        trackTitle: e.target.value,
                      }))
                    }
                    className="rounded-xl border-gray-200 dark:border-gray-700"
                    placeholder="Enter track title"
                  />
                </div>

                {/* Artist Name */}
                <div className="space-y-2">
                  <Label
                    htmlFor="artistName"
                    className="text-sm font-medium text-[#333] dark:text-white"
                  >
                    Artist Name *
                  </Label>
                  <Input
                    id="artistName"
                    value={formData.artistName || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        artistName: e.target.value,
                      }))
                    }
                    className="rounded-xl border-gray-200 dark:border-gray-700"
                    placeholder="Enter artist name"
                  />
                </div>

                {/* Release Date */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#333] dark:text-white">
                    Release Date *
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal rounded-xl border-gray-200 dark:border-gray-700",
                          !date && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="!w-full h-auto p-0"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="!w-full h-auto md:w-[250px]"
                        captionLayout="dropdown"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Genre & Secondary Genre */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#333] dark:text-white">
                      Primary Genre *
                    </Label>
                    <Select
                      value={formData.genre || ""}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, genre: value }))
                      }
                    >
                      <SelectTrigger className="rounded-xl border-gray-200 dark:border-gray-700">
                        <SelectValue placeholder="Select primary genre" />
                      </SelectTrigger>
                      <SelectContent>
                        {genreOptions.map((genre) => (
                          <SelectItem key={genre} value={genre}>
                            {genre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#333] dark:text-white">
                      Secondary Genre
                    </Label>
                    <Select
                      value={formData.secondaryGenre || ""}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          secondaryGenre: value,
                        }))
                      }
                    >
                      <SelectTrigger className="rounded-xl border-gray-200 dark:border-gray-700">
                        <SelectValue placeholder="Select secondary genre" />
                      </SelectTrigger>
                      <SelectContent>
                        {genreOptions.map((genre) => (
                          <SelectItem key={genre} value={genre}>
                            {genre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Label & Copyright */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="label"
                      className="text-sm font-medium text-[#333] dark:text-white"
                    >
                      Label *
                    </Label>
                    <Input
                      id="label"
                      value={formData.label || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          label: e.target.value,
                        }))
                      }
                      className="rounded-xl border-gray-200 dark:border-gray-700"
                      placeholder="e.g. Independent"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="copyright"
                      className="text-sm font-medium text-[#333] dark:text-white"
                    >
                      Copyright *
                    </Label>
                    <Input
                      id="copyright"
                      value={formData.copyright || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          copyright: e.target.value,
                        }))
                      }
                      className="rounded-xl border-gray-200 dark:border-gray-700"
                      placeholder="e.g. (c) Artist Name 2025"
                    />
                  </div>
                </div>

                {/* UPC/EAN */}
                <div className="space-y-2">
                  <Label
                    htmlFor="upcEan"
                    className="text-sm font-medium text-[#333] dark:text-white"
                  >
                    UPC/EAN
                  </Label>
                  <Input
                    id="upcEan"
                    value={formData.upcEan || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        upcEan: e.target.value,
                      }))
                    }
                    className="rounded-xl border-gray-200 dark:border-gray-700"
                    placeholder="e.g. 5054960352322"
                  />
                </div>

                {/* Explicit Content */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium text-[#333] dark:text-white">
                      Explicit Content
                    </Label>
                    <p className="text-xs text-[#666] dark:text-gray-400">
                      Mark if this track contains explicit content
                    </p>
                  </div>
                  <Switch
                    checked={formData.explicitContent || false}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        explicitContent: checked,
                      }))
                    }
                  />
                </div>

                {/* Credits & Lyrics Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreditsModalOpen(true)}
                    className="rounded-xl h-12 border-gray-200 dark:border-gray-700"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Edit Credits
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsLyricsModalOpen(true)}
                    className="rounded-xl h-12 border-gray-200 dark:border-gray-700"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Add/Edit Lyrics
                  </Button>
                </div>
              </motion.div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 rounded-full h-11 bg-transparent"
                  disabled={isLoading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="flex-1 bg-[#BFFF00] text-black hover:bg-[#BFFF00]/90 rounded-full h-11"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Credits Modal */}
          <EditCreditsModal
            release={release}
            isOpen={isCreditsModalOpen}
            onClose={() => setIsCreditsModalOpen(false)}
            onSave={handleCreditsUpdate}
          />

          {/* Lyrics Modal */}
          <EditLyricsModal
            release={release}
            isOpen={isLyricsModalOpen}
            onClose={() => setIsLyricsModalOpen(false)}
            onSave={handleLyricsUpdate}
          />
        </>
      )}
    </AnimatePresence>
  );
}
