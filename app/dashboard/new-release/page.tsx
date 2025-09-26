"use client";

import { HeaderSection } from "@/components/header-section";
import { MobileNavigation } from "@/components/mobile-navigation";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Music, Plus, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function NewReleasePage() {
  const router = useRouter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [releaseTitle, setReleaseTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateRelease = async () => {
    if (!releaseTitle.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a release title to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/distribution/releases/create-draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ title: releaseTitle.trim() })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Release Created",
          description: "Your draft release has been created. Let's add the details!",
        });
        setIsCreateDialogOpen(false);
        setReleaseTitle("");
        router.push(`/dashboard/new-release/edit/${data.release.id}`);
      } else {
        throw new Error(data.error || 'Failed to create release');
      }
    } catch (error) {
      console.error('Error creating release:', error);
      toast({
        title: "Error",
        description: "Failed to create release. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#f8f8f8] dark:bg-[#0a0a13] p-6">
        <HeaderSection />
        
        {/* Main Content */}
        <div className="max-w-4xl mx-auto mt-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-6">
              <Music className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Create Your Release
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Start your music distribution journey with ALERA
            </p>
          </div>

          {/* Create Release Card */}
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">New Release</CardTitle>
              <p className="text-gray-600 dark:text-gray-400">
                Begin by giving your release a title
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-4 text-lg"
                >
                  <Plus className="w-6 h-6 mr-2" />
                  Create New Release
                </Button>
              </div>
              
              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                <p>Your release will be saved as a draft</p>
                <p>You can continue editing anytime</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create Release Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Release</DialogTitle>
              <DialogDescription>
                Enter a title for your release to get started.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="release-title">Release Title *</Label>
                <Input
                  id="release-title"
                  placeholder="Enter your release title..."
                  value={releaseTitle}
                  onChange={(e) => setReleaseTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateRelease();
                    }
                  }}
                  className="mt-1"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleCreateRelease}
                  disabled={isCreating || !releaseTitle.trim()}
                  className="flex-1"
                >
                  {isCreating ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  {isCreating ? 'Creating...' : 'Create Release'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setReleaseTitle("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <MobileNavigation />
      </div>
    </ProtectedRoute>
  );
}
