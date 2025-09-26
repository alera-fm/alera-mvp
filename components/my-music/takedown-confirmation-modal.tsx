"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Release {
  id: string
  trackTitle: string
  artistName: string
  status: string
}

interface TakedownConfirmationModalProps {
  release: Release | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (releaseId: string) => Promise<void>
}

export function TakedownConfirmationModal({ 
  release, 
  isOpen, 
  onClose, 
  onConfirm 
}: TakedownConfirmationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleConfirm = async () => {
    if (!release) return

    setIsSubmitting(true)
    try {
      await onConfirm(release.id)
      toast({
        title: "Takedown Requested",
        description: "Your takedown request has been submitted and will be processed by our team.",
      })
      onClose()
    } catch (error) {
      console.error('Error requesting takedown:', error)
      toast({
        title: "Error",
        description: `Failed to request takedown: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!release) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Request Takedown
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to request a takedown for this release?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Release Details:</h4>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <div><strong>Title:</strong> {release.trackTitle}</div>
              <div><strong>Artist:</strong> {release.artistName}</div>
              <div><strong>Current Status:</strong> {release.status}</div>
            </div>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-orange-800 dark:text-orange-200 mb-1">
                  Important Notice
                </p>
                <p className="text-orange-700 dark:text-orange-300">
                  Once a takedown is requested, it cannot be undone. The release will be removed from all platforms and your account will be updated accordingly.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Requesting...
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Request Takedown
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
