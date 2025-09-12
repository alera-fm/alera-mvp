"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Mail, Send, Eye, Trash2 } from "lucide-react";

interface Campaign {
  id: string;
  subject: string;
  body: string;
  link?: string;
  audience_filter: any;
  status: "draft" | "sent" | "scheduled";
  sent_at?: string;
  created_at: string;
  emails_sent?: number;
}

export function EmailCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [viewingCampaign, setViewingCampaign] = useState<Campaign | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    subject: "",
    body: "",
    link: "",
    audience_filter: {
      subscribed_status: "all",
      country: "all",
      gender: "all",
    },
  });
  const { toast } = useToast();

  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/fanzone/campaigns", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.campaigns);
      } else {
        throw new Error("Failed to fetch campaigns");
      }
    } catch (error) {
      console.error("Fetch campaigns error:", error);
      toast({
        title: "Error",
        description: "Failed to load campaigns",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent, sendImmediately = false) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem("authToken");

      const response = await fetch("/api/fanzone/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          send_immediately: sendImmediately,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Success",
          description: sendImmediately
            ? `Campaign sent successfully!`
            : "Campaign saved as draft",
        });
        fetchCampaigns();
        resetForm();
      } else {
        const error = await response.json();
        throw new Error(error.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendCampaign = async (campaignId: string) => {
    if (!confirm("Are you sure you want to send this campaign?")) return;

    setSending(campaignId);
    try {
      const token = localStorage.getItem("authToken");

      const response = await fetch(
        `/api/fanzone/campaigns/${campaignId}/send`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Success",
          description: `Campaign sent to ${data.emails_sent} fans!`,
        });
        fetchCampaigns();
      } else {
        const error = await response.json();
        throw new Error(error.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSending(null);
    }
  };

  const resetForm = () => {
    setFormData({
      subject: "",
      body: "",
      link: "",
      audience_filter: {
        subscribed_status: "all",
        country: "all",
        gender: "all",
      },
    });
    setShowCreateDialog(false);
    setSubmitting(false);
  };

  const handleViewCampaign = (campaign: Campaign) => {
    setViewingCampaign(campaign);
    setShowViewDialog(true);
  };

  const handleDelete = async (campaignId: string) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/fanzone/campaigns/${campaignId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Campaign deleted successfully",
        });
        fetchCampaigns();
      } else {
        const error = await response.json();
        throw new Error(error.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Email Campaigns</h2>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Email Campaign</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <Label htmlFor="subject">Email Subject *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      subject: e.target.value,
                    }))
                  }
                  placeholder="Enter email subject"
                  required
                  autoFocus
                />
              </div>

              <div>
                <Label htmlFor="body">Email Body *</Label>
                <Textarea
                  id="body"
                  value={formData.body}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, body: e.target.value }))
                  }
                  placeholder="Write your email message..."
                  rows={8}
                  required
                />
              </div>

              <div>
                <Label htmlFor="link">Call-to-Action Link (optional)</Label>
                <Input
                  id="link"
                  type="url"
                  value={formData.link}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, link: e.target.value }))
                  }
                  placeholder="https://your-link.com"
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Audience Filter</h3>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Subscription Status</Label>
                    <Select
                      value={formData.audience_filter.subscribed_status}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          audience_filter: {
                            ...prev.audience_filter,
                            subscribed_status: value,
                          },
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Fans</SelectItem>
                        <SelectItem value="free">Free Fans Only</SelectItem>
                        <SelectItem value="paid">Paid Fans Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Country</Label>
                    <Select
                      value={formData.audience_filter.country}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          audience_filter: {
                            ...prev.audience_filter,
                            country: value,
                          },
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Countries</SelectItem>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="UK">United Kingdom</SelectItem>
                        <SelectItem value="CA">Canada</SelectItem>
                        <SelectItem value="AU">Australia</SelectItem>
                        <SelectItem value="DE">Germany</SelectItem>
                        <SelectItem value="FR">France</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Gender</Label>
                    <Select
                      value={formData.audience_filter.gender}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          audience_filter: {
                            ...prev.audience_filter,
                            gender: value,
                          },
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Genders</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => handleSubmit(e, false)}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    "Save as Draft"
                  )}
                </Button>
                <Button 
                  type="button" 
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Now
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Your Campaigns
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading campaigns...</div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No campaigns created yet
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block md:hidden space-y-3">
                {campaigns.map((campaign) => (
                  <Card key={campaign.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{campaign.subject}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(campaign.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <Badge
                          variant={
                            campaign.status === "sent"
                              ? "default"
                              : campaign.status === "draft"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {campaign.status}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {campaign.audience_filter?.subscribed_status || "all"} fans
                        </span>
                        <span className="text-muted-foreground">
                          {campaign.emails_sent || 0} emails sent
                        </span>
                      </div>

                      <div className="flex gap-2">
                        {campaign.status === "draft" && (
                          <Button
                            size="sm"
                            onClick={() => handleSendCampaign(campaign.id)}
                            disabled={sending === campaign.id}
                          >
                            {sending === campaign.id ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                Sending...
                              </>
                            ) : (
                              <>
                                <Send className="h-4 w-4 mr-1" />
                                Send
                              </>
                            )}
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewCampaign(campaign)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(campaign.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Audience</TableHead>
                      <TableHead>Emails Sent</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell className="font-medium">
                          {campaign.subject}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              campaign.status === "sent"
                                ? "default"
                                : campaign.status === "draft"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {campaign.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {campaign.audience_filter?.subscribed_status || "all"}{" "}
                          fans
                        </TableCell>
                        <TableCell>{campaign.emails_sent || 0}</TableCell>
                        <TableCell>
                          {new Date(campaign.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {campaign.status === "draft" && (
                              <Button
                                size="sm"
                                onClick={() => handleSendCampaign(campaign.id)}
                                disabled={sending === campaign.id}
                              >
                                {sending === campaign.id ? (
                                  <>
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                    Sending...
                                  </>
                                ) : (
                                  <>
                                    <Send className="h-4 w-4 mr-1" />
                                    Send
                                  </>
                                )}
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleViewCampaign(campaign)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(campaign.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* View Campaign Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Campaign Details</DialogTitle>
          </DialogHeader>
          {viewingCampaign && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Subject</Label>
                <p className="mt-1 font-medium">{viewingCampaign.subject}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                <div className="mt-1">
                  <Badge
                    variant={
                      viewingCampaign.status === "sent"
                        ? "default"
                        : viewingCampaign.status === "draft"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {viewingCampaign.status}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Email Body</Label>
                <div className="mt-1 p-3 bg-muted rounded-md">
                  <p className="whitespace-pre-wrap">{viewingCampaign.body}</p>
                </div>
              </div>

              {viewingCampaign.link && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Call-to-Action Link</Label>
                  <p className="mt-1 text-blue-600 hover:underline">
                    <a href={viewingCampaign.link} target="_blank" rel="noopener noreferrer">
                      {viewingCampaign.link}
                    </a>
                  </p>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Audience Filter</Label>
                <div className="mt-1 grid grid-cols-3 gap-2">
                  <div className="text-sm">
                    <span className="font-medium">Status:</span> {viewingCampaign.audience_filter?.subscribed_status || "all"}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Country:</span> {viewingCampaign.audience_filter?.country || "all"}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Gender:</span> {viewingCampaign.audience_filter?.gender || "all"}
                  </div>
                </div>
              </div>

              {viewingCampaign.emails_sent && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Emails Sent</Label>
                  <p className="mt-1 font-medium">{viewingCampaign.emails_sent} fans</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                  <p className="mt-1">{new Date(viewingCampaign.created_at).toLocaleString()}</p>
                </div>
                {viewingCampaign.sent_at && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Sent</Label>
                    <p className="mt-1">{new Date(viewingCampaign.sent_at).toLocaleString()}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowViewDialog(false)}
                >
                  Close
                </Button>
                {viewingCampaign.status === "draft" && (
                  <Button
                    onClick={() => {
                      setShowViewDialog(false);
                      handleSendCampaign(viewingCampaign.id);
                    }}
                    disabled={sending === viewingCampaign.id}
                  >
                    {sending === viewingCampaign.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Now
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}