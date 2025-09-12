"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, ChevronDown, Upload } from "lucide-react"

export function NewReleaseForm() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    releaseType: "Single (1 song)",
    projectName: "",
    artistName: "",
    recordLabel: "",
    releaseDate: "12/12/2025",
    genre: "Hip-Hop",
    secondaryGenre: "",
    language: "English",
    featuredArtist: false,
    versionInfo: false,
    specialAudio: false,
  })

  const totalSteps = 6

  return (
    <div className="bg-white dark:bg-[#0f0f1a] rounded-3xl p-5 shadow-sm">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-[#333] dark:text-white">New Release</h2>
          <p className="text-[#666] dark:text-gray-400">
            {step === 1 ? "Step one (General informations)" : "Step two (Song Details)"}
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex gap-2">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded-full ${index < step ? "bg-purple-500" : "bg-gray-200 dark:bg-gray-700"}`}
            />
          ))}
        </div>

        {step === 1 ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="releaseType">Release Type</Label>
              <div className="relative">
                <select
                  id="releaseType"
                  value={formData.releaseType}
                  onChange={(e) => setFormData({ ...formData, releaseType: e.target.value })}
                  className="w-full h-14 px-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a2e] text-[#333] dark:text-white appearance-none"
                >
                  <option>Single (1 song)</option>
                  <option>EP (2-6 songs)</option>
                  <option>Album (7+ songs)</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                placeholder="Project Name"
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                className="h-14 px-4 rounded-2xl border border-gray-200 dark:border-gray-700"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="artistName">Artist/Band Name</Label>
              <Input
                id="artistName"
                placeholder="Artist/Band Name"
                value={formData.artistName}
                onChange={(e) => setFormData({ ...formData, artistName: e.target.value })}
                className="h-14 px-4 rounded-2xl border border-gray-200 dark:border-gray-700"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recordLabel">Record Label</Label>
              <Input
                id="recordLabel"
                placeholder="Record Label"
                value={formData.recordLabel}
                onChange={(e) => setFormData({ ...formData, recordLabel: e.target.value })}
                className="h-14 px-4 rounded-2xl border border-gray-200 dark:border-gray-700"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="releaseDate">Release Date</Label>
              <div className="relative">
                <Input
                  id="releaseDate"
                  placeholder="Release Date"
                  value={formData.releaseDate}
                  onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                  className="h-14 px-4 rounded-2xl border border-gray-200 dark:border-gray-700"
                />
                <Calendar className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Release date is when the project will be published
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="genre">Genre</Label>
              <div className="relative">
                <select
                  id="genre"
                  value={formData.genre}
                  onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                  className="w-full h-14 px-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a2e] text-[#333] dark:text-white appearance-none"
                >
                  <option>Hip-Hop</option>
                  <option>Pop</option>
                  <option>Rock</option>
                  <option>Electronic</option>
                  <option>R&B</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondaryGenre">Secondary Genre (optional)</Label>
              <div className="relative">
                <select
                  id="secondaryGenre"
                  value={formData.secondaryGenre}
                  onChange={(e) => setFormData({ ...formData, secondaryGenre: e.target.value })}
                  className="w-full h-14 px-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a2e] text-[#333] dark:text-white appearance-none"
                >
                  <option>Select</option>
                  <option>Hip-Hop</option>
                  <option>Pop</option>
                  <option>Rock</option>
                  <option>Electronic</option>
                  <option>R&B</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="albumCover">Album Cover</Label>
              <div className="relative">
                <button className="w-full h-14 px-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a2e] text-[#333] dark:text-white flex items-center justify-between">
                  <span className="text-gray-500">Upload Cover</span>
                  <Upload className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1 list-disc pl-5 mt-2">
                <li>Make sure artwork is 3000px by 3000px</li>
                <li>Make sure you own the artwork</li>
                <li>Do not link any link on the artwork</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <div className="relative">
                <Input
                  id="language"
                  value="English"
                  readOnly
                  className="w-full h-14 px-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a2e] text-[#333] dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Add featured artist to song title?</Label>
              <div className="flex items-center gap-2">
                <button className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-white dark:bg-gray-500"></div>
                </button>
                <span className="text-[#333] dark:text-white">No, Don't show any featured artist</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Add "Version" info to song title?</Label>
              <div className="flex items-center gap-2">
                <button className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-white dark:bg-gray-500"></div>
                </button>
                <span className="text-[#333] dark:text-white">No, Don't show any featured artist</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="audioFile">Audio File</Label>
              <div className="relative">
                <button className="w-full h-14 px-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a2e] text-[#333] dark:text-white flex items-center justify-between">
                  <span className="text-gray-500">Upload audio file</span>
                  <Upload className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1 list-disc pl-5 mt-2">
                <li>WAV, FLAC, AIFF, WMA</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label>Special Audio (Dolby Atmos mastering?)</Label>
              <div className="flex items-center gap-2">
                <button className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-white dark:bg-gray-500"></div>
                </button>
                <span className="text-[#333] dark:text-white">No</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4">
          {step > 1 ? (
            <Button
              onClick={() => setStep(step - 1)}
              className="bg-white dark:bg-[#1a1a2e] text-[#333] dark:text-white border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#2a2a3e] rounded-full h-12 px-8"
            >
              Back
            </Button>
          ) : (
            <div></div>
          )}

          <Button
            onClick={() => (step < 2 ? setStep(step + 1) : alert("Form submitted!"))}
            className="bg-[#BFFF00] text-black hover:bg-[#BFFF00]/90 rounded-full h-12 px-8 font-medium"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
