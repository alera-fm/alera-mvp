"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Save, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Release {
  id: string
  trackTitle: string
  artistName: string
  releaseDate: string | null
  submissionDate: string
  status: string
  streams: number
  revenue: number
  platforms: string[]
  artwork: string | null
  genre: string
  secondaryGenre?: string
  label: string
  copyright: string
  upcEan?: string
  upc?: string
  explicitContent: boolean
  credits: {
    producers: string[]
    writers: string[]
    composers: string[]
    engineers?: string[]
    mixedBy?: string[]
    masteredBy?: string[]
    featuredArtists?: string[]
  }
  lyrics?: string
  isrcCode?: string
  trackCount?: number
  distributionType?: string
  language?: string
  instrumental?: boolean
  versionInfo?: string
  versionOther?: string
  originalReleaseDate?: string
  previouslyReleased?: boolean
  albumCoverUrl?: string
  selectedStores?: string[]
  trackPrice?: number
  termsAgreed?: boolean
  fakeStreamingAgreement?: boolean
  distributionAgreement?: boolean
  artistNamesAgreement?: boolean
  snapchatTerms?: boolean
  youtubeMusicAgreement?: boolean
}

interface PostSubmissionEditModalProps {
  release: Release | null
  isOpen: boolean
  onClose: () => void
  onSave: (release: Release) => void
}

export function PostSubmissionEditModal({ release, isOpen, onClose, onSave }: PostSubmissionEditModalProps) {
  const [credits, setCredits] = useState({
    producers: [] as string[],
    writers: [] as string[],
    composers: [] as string[],
    engineers: [] as string[],
    mixedBy: [] as string[],
    masteredBy: [] as string[],
    featuredArtists: [] as string[]
  })
  const [lyrics, setLyrics] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (release) {
      setCredits({
        producers: release.credits?.producers || [],
        writers: release.credits?.writers || [],
        composers: release.credits?.composers || [],
        engineers: release.credits?.engineers || [],
        mixedBy: release.credits?.mixedBy || [],
        masteredBy: release.credits?.masteredBy || [],
        featuredArtists: release.credits?.featuredArtists || []
      })
      setLyrics(release.lyrics || "")
    }
  }, [release])

  const addCredit = (type: keyof typeof credits) => {
    setCredits(prev => ({
      ...prev,
      [type]: [...prev[type], ""]
    }))
  }

  const removeCredit = (type: keyof typeof credits, index: number) => {
    setCredits(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }))
  }

  const updateCredit = (type: keyof typeof credits, index: number, value: string) => {
    setCredits(prev => ({
      ...prev,
      [type]: prev[type].map((item, i) => i === index ? value : item)
    }))
  }

  const handleSave = async () => {
    if (!release) return

    setIsSubmitting(true)
    try {
      console.log('Submitting post-submission edit:', { releaseId: release.id, credits, lyrics })
      
      const response = await fetch(`/api/distribution/releases/${release.id}/post-submission-edit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          credits,
          lyrics
        })
      })

      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)

      if (data.success) {
        toast({
          title: "Changes Submitted",
          description: "Your changes have been submitted for review. The release status will be updated once approved.",
        })
        
        // Update the release with the new data
        const updatedRelease = {
          ...release,
          credits,
          lyrics,
          updateStatus: "Changes Submitted"
        }
        
        onSave(updatedRelease)
        onClose()
      } else {
        throw new Error(data.error || 'Failed to save changes')
      }
    } catch (error) {
      console.error('Error saving post-submission changes:', error)
      toast({
        title: "Error",
        description: `Failed to save changes: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!release) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Edit Release - Credits & Lyrics</DialogTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            You can only edit credits and lyrics for releases that are already submitted.
          </p>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Release Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Release Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Title</Label>
                  <p className="text-sm font-medium">{release.trackTitle}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Artist</Label>
                  <p className="text-sm font-medium">{release.artistName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</Label>
                  <Badge className="ml-2">{release.status}</Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Genre</Label>
                  <p className="text-sm font-medium">{release.genre}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Editable Content */}
          <Tabs defaultValue="credits" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="credits">Credits</TabsTrigger>
              <TabsTrigger value="lyrics">Lyrics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="credits" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Release Credits</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Add or edit the credits for this release. These will be submitted for review.
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Producers */}
                  <div>
                    <Label className="text-sm font-medium">Producers</Label>
                    <div className="space-y-2 mt-2">
                      {credits.producers.map((producer, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={producer}
                            onChange={(e) => updateCredit('producers', index, e.target.value)}
                            placeholder="Producer name"
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeCredit('producers', index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addCredit('producers')}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Producer
                      </Button>
                    </div>
                  </div>

                  {/* Writers */}
                  <div>
                    <Label className="text-sm font-medium">Songwriters</Label>
                    <div className="space-y-2 mt-2">
                      {credits.writers.map((writer, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={writer}
                            onChange={(e) => updateCredit('writers', index, e.target.value)}
                            placeholder="Songwriter name"
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeCredit('writers', index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addCredit('writers')}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Songwriter
                      </Button>
                    </div>
                  </div>

                  {/* Composers */}
                  <div>
                    <Label className="text-sm font-medium">Composers</Label>
                    <div className="space-y-2 mt-2">
                      {credits.composers.map((composer, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={composer}
                            onChange={(e) => updateCredit('composers', index, e.target.value)}
                            placeholder="Composer name"
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeCredit('composers', index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addCredit('composers')}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Composer
                      </Button>
                    </div>
                  </div>

                  {/* Engineers */}
                  <div>
                    <Label className="text-sm font-medium">Engineers</Label>
                    <div className="space-y-2 mt-2">
                      {credits.engineers?.map((engineer, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={engineer}
                            onChange={(e) => updateCredit('engineers', index, e.target.value)}
                            placeholder="Engineer name"
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeCredit('engineers', index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )) || []}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addCredit('engineers')}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Engineer
                      </Button>
                    </div>
                  </div>

                  {/* Mixed By */}
                  <div>
                    <Label className="text-sm font-medium">Mixed By</Label>
                    <div className="space-y-2 mt-2">
                      {credits.mixedBy?.map((mixer, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={mixer}
                            onChange={(e) => updateCredit('mixedBy', index, e.target.value)}
                            placeholder="Mixer name"
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeCredit('mixedBy', index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )) || []}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addCredit('mixedBy')}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Mixer
                      </Button>
                    </div>
                  </div>

                  {/* Mastered By */}
                  <div>
                    <Label className="text-sm font-medium">Mastered By</Label>
                    <div className="space-y-2 mt-2">
                      {credits.masteredBy?.map((masterer, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={masterer}
                            onChange={(e) => updateCredit('masteredBy', index, e.target.value)}
                            placeholder="Mastering engineer name"
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeCredit('masteredBy', index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )) || []}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addCredit('masteredBy')}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Mastering Engineer
                      </Button>
                    </div>
                  </div>

                  {/* Featured Artists */}
                  <div>
                    <Label className="text-sm font-medium">Featured Artists</Label>
                    <div className="space-y-2 mt-2">
                      {credits.featuredArtists?.map((artist, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={artist}
                            onChange={(e) => updateCredit('featuredArtists', index, e.target.value)}
                            placeholder="Featured artist name"
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeCredit('featuredArtists', index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )) || []}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addCredit('featuredArtists')}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Featured Artist
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="lyrics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Lyrics</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Add or edit the lyrics for this release. These will be submitted for review.
                  </p>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="lyrics" className="text-sm font-medium">Lyrics</Label>
                    <Textarea
                      id="lyrics"
                      value={lyrics}
                      onChange={(e) => setLyrics(e.target.value)}
                      placeholder="Enter the lyrics for this release..."
                      className="mt-2 min-h-[300px]"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isSubmitting}
              className="bg-[#BFFF00] text-black hover:bg-[#BFFF00]/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Submit Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
