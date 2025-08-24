"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Plus, Search, Edit, Trash2, Filter } from "lucide-react";

interface Fan {
  id: string;
  name: string;
  email: string;
  phone_number?: string;
  country?: string;
  gender?: string;
  age?: number;
  birth_year?: number;
  subscribed_status: "free" | "paid";
  source: string;
  created_at: string;
}

interface FanListProps {
  onFanUpdate: () => void;
}

export function FanList({ onFanUpdate }: FanListProps) {
  const [fans, setFans] = useState<Fan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });
  const [editingFan, setEditingFan] = useState<Fan | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    country: "",
    gender: "",
    age: "",
    birth_year: "",
    subscribed_status: "free" as "free" | "paid",
    source: "manual",
  });
  const { toast } = useToast();

  const fetchFans = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        search,
        filter,
      });

      const response = await fetch(`/api/fanzone/fans?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFans(data.fans);
        setPagination(data.pagination);
      } else {
        throw new Error("Failed to fetch fans");
      }
    } catch (error) {
      console.error("Fetch fans error:", error);
      toast({
        title: "Error",
        description: "Failed to load fans",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem("authToken");
      const url = editingFan
        ? `/api/fanzone/fans/${editingFan.id}`
        : "/api/fanzone/fans";
      const method = editingFan ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          age: formData.age ? parseInt(formData.age) : null,
          birth_year: formData.birth_year
            ? parseInt(formData.birth_year)
            : null,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: editingFan
            ? "Fan updated successfully"
            : "Fan added successfully",
        });
        fetchFans();
        onFanUpdate();
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

  const handleDelete = async (fanId: string) => {
    if (!confirm("Are you sure you want to delete this fan?")) return;

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/fanzone/fans/${fanId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Fan deleted successfully",
        });
        fetchFans();
        onFanUpdate();
      } else {
        throw new Error("Failed to delete fan");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone_number: "",
      country: "",
      gender: "",
      age: "",
      birth_year: "",
      subscribed_status: "free",
      source: "manual",
    });
    setEditingFan(null);
    setShowAddDialog(false);
    setSubmitting(false);
  };

  const startEdit = (fan: Fan) => {
    setFormData({
      name: fan.name,
      email: fan.email,
      phone_number: fan.phone_number || "",
      country: fan.country || "",
      gender: fan.gender || "",
      age: fan.age?.toString() || "",
      birth_year: fan.birth_year?.toString() || "",
      subscribed_status: fan.subscribed_status,
      source: fan.source,
    });
    setEditingFan(fan);
    setShowAddDialog(true);
  };

  useEffect(() => {
    fetchFans();
  }, [page, search, filter]);

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search fans..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-32">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                resetForm();
                setShowAddDialog(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Fan
            </Button>
          </DialogTrigger>
          <DialogContent
            className="max-w-2xl"
            key={editingFan?.id || "add-fan"}
          >
            <DialogHeader>
              <DialogTitle>
                {editingFan ? "Edit Fan" : "Add New Fan"}
              </DialogTitle>
              <DialogDescription>
                {editingFan
                  ? "Update fan information below."
                  : "Fill in the details to add a new fan to your database."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    required
                    autoFocus
                    disabled={submitting}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    value={formData.phone_number}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        phone_number: e.target.value,
                      }))
                    }
                    disabled={submitting}
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        country: e.target.value,
                      }))
                    }
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={formData.gender || "not_specified"}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        gender: value === "not_specified" ? "" : value,
                      }))
                    }
                    disabled={submitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_specified">
                        Not specified
                      </SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer_not_to_say">
                        Prefer not to say
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, age: e.target.value }))
                    }
                    disabled={submitting}
                  />
                </div>
                <div>
                  <Label htmlFor="birth_year">Birth Year</Label>
                  <Input
                    id="birth_year"
                    type="number"
                    value={formData.birth_year}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        birth_year: e.target.value,
                      }))
                    }
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subscribed_status">Subscription Status</Label>
                  <Select
                    value={formData.subscribed_status}
                    onValueChange={(value: "free" | "paid") =>
                      setFormData((prev) => ({
                        ...prev,
                        subscribed_status: value,
                      }))
                    }
                    disabled={submitting}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="source">Source</Label>
                  <Select
                    value={formData.source}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, source: value }))
                    }
                    disabled={submitting}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="tip">Tip</SelectItem>
                      <SelectItem value="email_capture">
                        Email Capture
                      </SelectItem>
                      <SelectItem value="import">Import</SelectItem>
                    </SelectContent>
                  </Select>
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
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {editingFan ? "Updating..." : "Adding..."}
                    </>
                  ) : (
                    editingFan ? "Update Fan" : "Add Fan"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Fans Table */}
      <Card>
        <CardHeader>
          <CardTitle>Fans ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading fans...</div>
          ) : fans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No fans found
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block md:hidden space-y-3">
                {fans.map((fan) => (
                  <Card key={fan.id} className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium truncate">{fan.name}</div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEdit(fan)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(fan.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {fan.email}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          {fan.country || "No country"}
                        </div>
                        <Badge
                          variant={
                            fan.subscribed_status === "paid"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {fan.subscribed_status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span className="capitalize">{fan.source}</span>
                        <span>{new Date(fan.created_at).toLocaleDateString()}</span>
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
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fans.map((fan) => (
                      <TableRow key={fan.id}>
                        <TableCell className="font-medium">{fan.name}</TableCell>
                        <TableCell>{fan.email}</TableCell>
                        <TableCell>{fan.country || "-"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              fan.subscribed_status === "paid"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {fan.subscribed_status}
                          </Badge>
                        </TableCell>
                        <TableCell className="capitalize">{fan.source}</TableCell>
                        <TableCell>
                          {new Date(fan.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEdit(fan)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(fan.id)}
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

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() =>
                            setPage((prev) => Math.max(prev - 1, 1))
                          }
                          className={
                            page === 1
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                      {Array.from(
                        { length: Math.min(5, pagination.totalPages) },
                        (_, i) => {
                          const pageNum = i + 1;
                          return (
                            <PaginationItem key={pageNum}>
                              <PaginationLink
                                onClick={() => setPage(pageNum)}
                                isActive={page === pageNum}
                                className="cursor-pointer"
                              >
                                {pageNum}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        },
                      )}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            setPage((prev) =>
                              Math.min(prev + 1, pagination.totalPages),
                            )
                          }
                          className={
                            page === pagination.totalPages
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
