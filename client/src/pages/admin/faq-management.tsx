import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertFaqSchema, type InsertFaq, type Faq } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch as Toggle } from "@/components/ui/switch";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/admin-layout";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import dynamic from "next/dynamic";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

// Add this wrapper component
const QuillEditor = React.forwardRef(function QuillEditor(props: any, ref: any) {
  // Forward all props and ref to ReactQuill
  return <ReactQuill {...props} ref={ref} />;
});

export default function FaqManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: faqs = [], isLoading } = useQuery<Faq[]>({
    queryKey: ["/api/admin/faqs"],
    queryFn: async () => {
      const res = await fetch("/api/admin/faqs", { credentials: "include" });
      if (!res.ok) {
        // Try to parse error as JSON, fallback to text
        let message = "";
        try {
          const err = await res.json();
          message = err.message || JSON.stringify(err);
        } catch {
          message = await res.text();
        }
        throw new Error(message || "Failed to fetch FAQs");
      }
      // Ensure we await the JSON and return an array
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });

  const form = useForm<InsertFaq>({
    resolver: zodResolver(insertFaqSchema),
    defaultValues: {
      question: "",
      answer: "",
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertFaq) => {
      // Use correct endpoint and payload
      const response = await apiRequest("POST", "/api/admin/faqs", data);
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const result = await response.json();
        // Add logging for debugging
        if (!response.ok) {
          throw new Error(result.message || "Failed to create FAQ");
        }
        return result;
      }
      if (response.status === 201 || response.status === 200) {
        return {};
      }
      throw new Error("Server error: invalid response");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/faqs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/faqs"] });
      setIsDialogOpen(false);
      setEditingFaq(null);
      form.reset();
      toast({ title: "FAQ created", description: "FAQ has been added." });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create FAQ", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: InsertFaq) => {
      // Use correct endpoint and payload
      const response = await apiRequest("PUT", `/api/admin/faqs/${editingFaq?.id}`, data);
      try {
        return await response.json();
      } catch {
        throw new Error("Server error: invalid response");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/faqs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/faqs"] });
      setIsDialogOpen(false);
      setEditingFaq(null);
      form.reset();
      toast({ title: "FAQ updated", description: "FAQ has been updated." });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update FAQ", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/faqs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/faqs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/faqs"] });
      toast({ title: "FAQ deleted", description: "FAQ has been removed." });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete FAQ", description: error.message, variant: "destructive" });
    },
  });

  const onSubmit = (data: InsertFaq) => {
    if (editingFaq) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (faq: Faq) => {
    setEditingFaq(faq);
    form.reset({
      question: faq.question,
      answer: faq.answer,
      isActive: faq.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (faq: Faq) => {
    if (confirm(`Delete FAQ "${faq.question}"?`)) {
      deleteMutation.mutate(faq.id);
    }
  };

  const filteredFaqs = faqs.filter(f =>
    f.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout
      title="FAQ Management"
      description="Create, edit, and manage Frequently Asked Questions"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Existing Dialog for Add/Edit FAQ */}
          <Dialog
            open={isDialogOpen}
            onOpenChange={open => {
              setIsDialogOpen(open);
              if (!open) {
                setEditingFaq(null);
                form.reset();
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-fast-blue hover:bg-fast-blue-dark">
                <Plus className="h-4 w-4 mr-2" />
                {editingFaq ? "Edit FAQ" : "Add FAQ"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingFaq ? "Edit FAQ" : "Add New FAQ"}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="question"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Question *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter FAQ question" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="answer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Answer *</FormLabel>
                        <FormControl>
                          {/* Use QuillEditor instead of ReactQuill directly */}
                          <QuillEditor
                            theme="snow"
                            value={field.value}
                            onChange={field.onChange}
                            style={{ minHeight: 120 }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Active</FormLabel>
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={!!field.value}
                            onChange={e => field.onChange(e.target.checked)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        setEditingFaq(null);
                        form.reset();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createMutation.isPending || updateMutation.isPending}
                      className="bg-fast-blue hover:bg-fast-blue-dark"
                    >
                      {(createMutation.isPending || updateMutation.isPending)
                        ? (editingFaq ? "Updating..." : "Creating...")
                        : (editingFaq ? "Update FAQ" : "Create FAQ")}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
        {/* FAQ Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              FAQ List ({filteredFaqs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : filteredFaqs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No FAQs found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Question</TableHead>
                      <TableHead>Answer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFaqs.map(faq => (
                      <TableRow key={faq.id}>
                        <TableCell>
                          <p className="font-medium">{faq.question}</p>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs text-gray-600" dangerouslySetInnerHTML={{ __html: faq.answer }} />
                        </TableCell>
                        <TableCell>
                          <Badge className={faq.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                            {faq.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(faq)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(faq)}
                              className="text-red-600 hover:text-red-700"
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
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}


