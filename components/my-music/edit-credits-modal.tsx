"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Save } from "lucide-react"
import type { Release } from "@/lib/mock-music-data"
import { toast } from "sonner"

interface EditCreditsModalProps {
  release: Release | null
  isOpen: boolean
  onClose: () => void
  onSave: (credits: Release["credits"]) => void
}

const creditTypes = [
  { key: "producers", label: "Producers" },
  { key: "writers", label: "Writers" },
  { key: "composers", label: "Composers" },
  { key: "engineers", label: "Engineers" },
  { key: "mixedBy", label: "Mixed By" },
  { key: "masteredBy", label: "Mastered By" },
  { key: "featuredArtists", label: "Featured Artists" },
]

export function EditCreditsModal({ release, isOpen, onClose, onSave }: EditCreditsModalProps) {
  const [credits, setCredits] = useState<Release["credits"]>({})
  const [newCredit, setNewCredit] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    if (release?.credits) {
      setCredits(release.credits)
    } else {
      setCredits({})
    }
  }, [release])

  const addCredit = (type: string) => {
    if (!newCredit[type]?.trim()) return

    setCredits((prev) => ({
      ...prev,
      [type]: [...(prev?.[type as keyof typeof prev] || []), newCredit[type].trim()],
    }))

    setNewCredit((prev) => ({ ...prev, [type]: "" }))
  }

  const removeCredit = (type: string, index: number) => {
    setCredits((prev) => ({
      ...prev,
      [type]: prev?.[type as keyof typeof prev]?.filter((_, i) => i !== index) || [],
    }))
  }

  const handleSave = () => {
    onSave(credits)
    toast.success("Credits updated successfully!")
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto bg-white dark:bg-[#0f0f1a] border border-gray-200 dark:border-gray-800 rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-[#333] dark:text-white">
                Edit Credits - {release?.trackTitle}
              </DialogTitle>
            </DialogHeader>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 py-4"
            >
              {creditTypes.map(({ key, label }) => (
                <div key={key} className="space-y-3">
                  <Label className="text-sm font-medium text-[#333] dark:text-white">{label}</Label>

                  {/* Existing Credits */}
                  <div className="flex flex-wrap gap-2">
                    {credits?.[key as keyof typeof credits]?.map((credit, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                        {credit}
                        <button
                          onClick={() => removeCredit(key, index)}
                          className="ml-1 hover:text-red-500 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>

                  {/* Add New Credit */}
                  <div className="flex gap-2">
                    <Input
                      value={newCredit[key] || ""}
                      onChange={(e) => setNewCredit((prev) => ({ ...prev, [key]: e.target.value }))}
                      placeholder={`Add ${label.toLowerCase()}`}
                      className="rounded-xl border-gray-200 dark:border-gray-700"
                      onKeyPress={(e) => e.key === "Enter" && addCredit(key)}
                    />
                    <Button onClick={() => addCredit(key)} size="sm" variant="outline" className="rounded-xl">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
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
                Save Credits
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  )
}
