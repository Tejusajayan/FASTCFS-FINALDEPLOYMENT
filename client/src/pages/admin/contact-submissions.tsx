import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Mail, Search, Eye, Bookmark, Download } from "lucide-react";
import * as XLSX from "xlsx";
import { apiRequest } from "@/lib/queryClient";
import { formatDate } from "@/lib/utils";
import type { ContactSubmission } from "@shared/schema";

export default function ContactSubmissions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: contactData, isLoading } = useQuery({
    queryKey: ["/api/admin/contact-submissions"],
    queryFn: async () => {
      const response = await fetch("/api/admin/contact-submissions", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch contact submissions");
      }
      return response.json();
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("PUT", `/api/admin/contact-submissions/${id}/read`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contact-submissions"] });
      toast({
        title: "Marked as read",
        description: "The submission has been marked as read.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update submission",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleMarkAsRead = (submission: ContactSubmission) => {
    if (!submission.isRead) {
      markAsReadMutation.mutate(submission.id);
    }
  };

  // Excel export handler
  const handleExportExcel = () => {
    const submissions = contactData?.submissions || [];
    // Prepare data: only Name and Phone columns
    const data = submissions.map((sub: ContactSubmission) => ({
      Name: sub.name,
      Phone: sub.phone || "",
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Contact Submissions");
    XLSX.writeFile(workbook, `contact-submissions-${new Date().toISOString().split('T')[0]}.xlsx`);
    toast({
      title: "Export successful",
      description: "Excel file has been downloaded.",
    });
  };

  const submissions = contactData?.submissions || [];
  const filteredSubmissions = submissions.filter((sub: ContactSubmission) =>
    sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unreadSubmissions = filteredSubmissions.filter((s: ContactSubmission) => !s.isRead);
  const readSubmissions = filteredSubmissions.filter((s: ContactSubmission) => s.isRead);

  return (
    <AdminLayout
      title="Contact Submissions"
      description="View and manage customer contact form submissions"
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                  <p className="text-2xl font-bold text-gray-900">{submissions.length}</p>
                </div>
                <Mail className="h-8 w-8 text-fast-blue" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Unread</p>
                  <p className="text-2xl font-bold text-red-600">{unreadSubmissions.length}</p>
                </div>
                <Mail className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Read</p>
                  <p className="text-2xl font-bold text-green-600">{readSubmissions.length}</p>
                </div>
                <Mail className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportExcel}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search submissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>

        {/* Unread Submissions */}
        {unreadSubmissions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-red-600" />
                Unread Submissions ({unreadSubmissions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {unreadSubmissions.map((submission: ContactSubmission) => (
                  <div key={submission.id} className="border rounded-lg p-4 bg-red-50 border-red-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{submission.name}</h3>
                          <Badge variant="destructive" className="text-xs">New</Badge>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600 mb-3">
                          <p><span className="font-medium">Email:</span> {submission.email}</p>
                          {submission.phone && (
                            <p><span className="font-medium">Phone:</span> {submission.phone}</p>
                          )}
                          <p><span className="font-medium">Subject:</span> {submission.subject}</p>
                        </div>
                        <p className="text-gray-700 line-clamp-2 mb-2">{submission.message}</p>
                        <p className="text-xs text-gray-500">
                          Submitted: {formatDate(submission.createdAt ?? "")}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedSubmission(submission)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Contact Submission Details</DialogTitle>
                            </DialogHeader>
                            {selectedSubmission && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <p className="font-medium text-gray-900">Name</p>
                                    <p className="text-gray-600">{selectedSubmission.name}</p>
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">Email</p>
                                    <p className="text-gray-600">{selectedSubmission.email}</p>
                                  </div>
                                  {selectedSubmission.phone && (
                                    <div>
                                      <p className="font-medium text-gray-900">Phone</p>
                                      <p className="text-gray-600">{selectedSubmission.phone}</p>
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-medium text-gray-900">Subject</p>
                                    <p className="text-gray-600">{selectedSubmission.subject}</p>
                                  </div>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 mb-2">Message</p>
                                  <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-gray-700 whitespace-pre-wrap">{selectedSubmission.message}</p>
                                  </div>
                                </div>
                                <div className="text-sm text-gray-500">
                                  Submitted on {formatDate(selectedSubmission.createdAt ?? "")}
                                </div>
                                <div className="flex justify-end space-x-2">
                                  <Button 
                                    variant="outline"
                                    onClick={() => window.open(`mailto:${selectedSubmission.email}?subject=Re: ${selectedSubmission.subject}`)}
                                  >
                                    Reply via Email
                                  </Button>
                                  {!selectedSubmission.isRead && (
                                    <Button 
                                      onClick={() => handleMarkAsRead(selectedSubmission)}
                                      className="bg-fast-blue hover:bg-fast-blue-dark"
                                    >
                                      Mark as Read
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button 
                          size="sm" 
                          onClick={() => handleMarkAsRead(submission)}
                          className="bg-fast-blue hover:bg-fast-blue-dark"
                        >
                          <Bookmark className="h-4 w-4 mr-1" />
                          Mark Read
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Submissions Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2 text-fast-blue" />
              All Submissions ({filteredSubmissions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchTerm ? "No submissions matching your search" : "No contact submissions yet"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name & Contact</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubmissions.map((submission: ContactSubmission) => (
                      <TableRow key={submission.id} className={!submission.isRead ? "bg-blue-50" : ""}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{submission.name}</p>
                            <p className="text-sm text-gray-500">{submission.email}</p>
                            {submission.phone && (
                              <p className="text-sm text-gray-500">{submission.phone}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-48">
                            <p className="line-clamp-1">{submission.subject}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-64">
                            <p className="line-clamp-2">{submission.message}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={submission.isRead 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                          }>
                            {submission.isRead ? "Read" : "Unread"}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(submission.createdAt ?? "")}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => setSelectedSubmission(submission)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Contact Submission Details</DialogTitle>
                                </DialogHeader>
                                {selectedSubmission && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <p className="font-medium text-gray-900">Name</p>
                                        <p className="text-gray-600">{selectedSubmission.name}</p>
                                      </div>
                                      <div>
                                        <p className="font-medium text-gray-900">Email</p>
                                        <p className="text-gray-600">{selectedSubmission.email}</p>
                                      </div>
                                      {selectedSubmission.phone && (
                                        <div>
                                          <p className="font-medium text-gray-900">Phone</p>
                                          <p className="text-gray-600">{selectedSubmission.phone}</p>
                                        </div>
                                      )}
                                      <div>
                                        <p className="font-medium text-gray-900">Subject</p>
                                        <p className="text-gray-600">{selectedSubmission.subject}</p>
                                      </div>
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-900 mb-2">Message</p>
                                      <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-gray-700 whitespace-pre-wrap">{selectedSubmission.message}</p>
                                      </div>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      Submitted on {formatDate(selectedSubmission.createdAt ?? "")}
                                    </div>
                                    <div className="flex justify-end space-x-2">
                                      <Button 
                                        variant="outline"
                                        onClick={() => window.open(`mailto:${selectedSubmission.email}?subject=Re: ${selectedSubmission.subject}`)}
                                      >
                                        Reply via Email
                                      </Button>
                                      {!selectedSubmission.isRead && (
                                        <Button 
                                          onClick={() => handleMarkAsRead(selectedSubmission)}
                                        >
                                          Mark as Read
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            {!submission.isRead && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleMarkAsRead(submission)}
                                className="text-fast-blue hover:text-fast-blue-dark"
                              >
                                <Bookmark className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
