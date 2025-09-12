"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Save, X, FileText } from "lucide-react"
import type { Release } from "@/lib/mock-music-data"
import { toast } from "sonner"

interface EditLyricsModalProps {
  release: Release | null
  isOpen: boolean
  onClose: () => void
  onSave: (lyrics: string) => void
}

export function EditLyricsModal({ release, isOpen, onClose, onSave }: EditLyricsModalProps) {
  const [lyrics, setLyrics] = useState("")

  useEffect(() => {
    if (release?.lyrics) {
      setLyrics(release.lyrics)
    } else {
      setLyrics("")
    }
  }, [release])

  const handleSave = () => {
    onSave(lyrics)
    toast.success("Lyrics updated successfully!")
    onClose()
  }

  const wordCount = lyrics
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] bg-white dark:bg-[#0f0f1a] border border-gray-200 dark:border-gray-800 rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-[#333] dark:text-white flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Edit Lyrics - {release?.trackTitle}
              </DialogTitle>
            </DialogHeader>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 py-4"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-medium text-[#333] dark:text-white">Lyrics</Label>
                  <span className="text-xs text-[#666] dark:text-gray-400">{wordCount} words</span>
                </div>
                <Textarea
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  placeholder="Enter your lyrics here...

Example:
Verse 1:
Your lyrics here...

Chorus:
Your chorus here...

Verse 2:
More lyrics..."
                  className="min-h-[300px] rounded-xl border-gray-200 dark:border-gray-700 resize-none"
                />
              </div>

              <div className="text-xs text-[#666] dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl">
                <p className="font-medium mb-1">Tips for formatting lyrics:</p>
                <ul className="space-y-1">
                  <li>• Use line breaks to separate verses and choruses</li>
                  <li>• Label sections like "Verse 1:", "Chorus:", "Bridge:"</li>
                  <li>• Leave blank lines between sections for better readability</li>
                  <li>• For instrumental tracks, you can write "Instrumental" or leave blank</li>
                </ul>
              </div>
            </motion.div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={onClose} className="flex-1 rounded-full h-11 bg-transparent">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1 bg-[#BFFF00] text-black hover:bg-[#BFFF00]/90 rounded-full h-11"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Lyrics
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  )
}
