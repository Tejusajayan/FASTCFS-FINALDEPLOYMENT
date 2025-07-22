import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Check, X, Eye, Star } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { formatDate } from "@/lib/utils";
import type { Testimonial } from "@shared/schema";
import { useState } from "react";

export default function TestimonialsManagement() {
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: testimonials = [], isLoading } = useQuery<Testimonial[]>({
    queryKey: ["/api/admin/testimonials"],
    queryFn: async () => {
      const response = await fetch("/api/admin/testimonials", {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to fetch testimonials");
      return response.json();
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("PUT", `/api/admin/testimonials/${id}/approve`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["/api/testimonials"] });
      toast({
        title: "Testimonial approved",
        description: "The testimonial is now visible on the website.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to approve testimonial",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/testimonials/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/testimonials"] });
      toast({
        title: "Testimonial rejected",
        description: "The testimonial has been removed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to reject testimonial",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleApprove = (testimonial: Testimonial) => {
    approveMutation.mutate(testimonial.id);
  };

  const handleReject = (testimonial: Testimonial) => {
    if (confirm(`Are you sure you want to reject the testimonial from ${testimonial.customerName}?`)) {
      rejectMutation.mutate(testimonial.id);
    }
  };

  const pendingTestimonials = testimonials.filter(t => !t.isApproved);
  const approvedTestimonials = testimonials.filter(t => t.isApproved);

  return (
    <AdminLayout
      title="Testimonials Management"
      description="Review and manage customer testimonials"
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Testimonials</p>
                  <p className="text-2xl font-bold text-gray-900">{testimonials.length}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-fast-blue" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingTestimonials.length}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{approvedTestimonials.length}</p>
                </div>
                <Check className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Testimonials */}
        {pendingTestimonials.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-yellow-600" />
                Pending Approval ({pendingTestimonials.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingTestimonials.map((testimonial) => (
                  <div key={testimonial.id} className="border rounded-lg p-4 bg-yellow-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{testimonial.customerName}</h3>
                          {testimonial.rating && (
                            <div className="flex items-center">
                              {[...Array(testimonial.rating)].map((_, i) => (
                                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          {testimonial.customerLocation && (
                            <span> • {testimonial.customerLocation}</span>
                          )}
                        </div>
                        <p className="text-gray-700 mb-3">{testimonial.content}</p>
                        <p className="text-xs text-gray-500">
                          Submitted: {testimonial.createdAt ? formatDate(testimonial.createdAt) : "Unknown"}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedTestimonial(testimonial)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Testimonial Preview</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="text-center">
                                <h3 className="font-semibold text-lg">{testimonial.customerName}</h3>
                                {testimonial.customerLocation && (
                                  <p className="text-sm text-gray-500">{testimonial.customerLocation}</p>
                                )}
                                {testimonial.rating && (
                                  <div className="flex justify-center mt-2">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                    ))}
                                  </div>
                                )}
                              </div>
                              <blockquote className="text-center text-gray-700 italic">
                                "{testimonial.content}"
                              </blockquote>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleApprove(testimonial)}
                          disabled={approveMutation.isPending}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleReject(testimonial)}
                          disabled={rejectMutation.isPending}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Approved Testimonials */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Check className="h-5 w-5 mr-2 text-green-600" />
              Approved Testimonials ({approvedTestimonials.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : approvedTestimonials.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No approved testimonials yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Approved Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvedTestimonials.map((testimonial) => (
                      <TableRow key={testimonial.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{testimonial.customerName}</p>
                            <div className="text-sm text-gray-500">
                            </div>
                            {testimonial.customerLocation && (
                              <p className="text-xs text-gray-400">{testimonial.customerLocation}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="line-clamp-2">{testimonial.content}</p>
                        </TableCell>
                        <TableCell>
                          {testimonial.rating && (
                            <div className="flex items-center">
                              {[...Array(testimonial.rating)].map((_, i) => (
                                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800">
                            Approved
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(testimonial.createdAt ?? "")}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => setSelectedTestimonial(testimonial)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Testimonial Preview</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="text-center">
                                    <h3 className="font-semibold text-lg">{testimonial.customerName}</h3>
                                    {testimonial.customerLocation && (
                                      <p className="text-sm text-gray-500">{testimonial.customerLocation}</p>
                                    )}
                                    {testimonial.rating && (
                                      <div className="flex justify-center mt-2">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                          <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <blockquote className="text-center text-gray-700 italic">
                                    "{testimonial.content}"
                                  </blockquote>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleReject(testimonial)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
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