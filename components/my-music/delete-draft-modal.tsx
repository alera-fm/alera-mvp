"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Release {
  id: string
  trackTitle: string
  artistName: string
  status: string
}

interface DeleteDraftModalProps {
  release: Release | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (releaseId: string) => Promise<void>
}

export function DeleteDraftModal({ 
  release, 
  isOpen, 
  onClose, 
  onConfirm 
}: DeleteDraftModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const handleConfirm = async () => {
    if (!release) return

    setIsDeleting(true)
    try {
      await onConfirm(release.id)
      toast({
        title: "Draft Deleted",
        description: "Your draft release has been permanently deleted.",
      })
      onClose()
    } catch (error) {
      console.error('Error deleting draft:', error)
      toast({
        title: "Error",
        description: `Failed to delete draft: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (!release) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-500" />
            Delete Draft Release
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to permanently delete this draft release?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Release Details:</h4>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <div><strong>Title:</strong> {release.trackTitle}</div>
              <div><strong>Status:</strong> {release.status}</div>
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <Trash2 className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-red-800 dark:text-red-200 mb-1">
                  Warning
                </p>
                <p className="text-red-700 dark:text-red-300">
                  This action cannot be undone. The draft release and all associated data will be permanently deleted.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Draft
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
