import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AdminLayout from "@/components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { FileText, Plus, Edit, Trash2, Search, Eye } from "lucide-react";
import { insertBlogPostSchema, type InsertBlogPost, type BlogPost } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { formatDate, generateSlug } from "@/lib/utils";
import dynamic from "next/dynamic";

// Import ReactQuill dynamically to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

const categories = [
  "Industry News",
  "Technology",
  "Air Freight",
  "Ocean Freight",
  "Logistics",
  "Supply Chain",
  "General"
];

export default function BlogManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: blogData, isLoading } = useQuery({
    queryKey: ["/api/admin/blog"],
    queryFn: async () => {
      const response = await fetch("/api/admin/blog", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch blog posts");
      }
      return response.json();
    },
  });
  const posts = blogData?.posts || [];

  const form = useForm<InsertBlogPost>({
    resolver: zodResolver(insertBlogPostSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      coverImage: "",
      category: "General",
      isPublished: false,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertBlogPost) => {
      const response = await apiRequest("POST", "/api/admin/blog", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      setIsCreateDialogOpen(false);
      setEditingPost(null);
      form.reset();
      toast({
        title: "Blog post created successfully",
        description: "Your new blog post has been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create blog post",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: InsertBlogPost) => {
      const response = await apiRequest("PUT", `/api/admin/blog/${editingPost?.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      setEditingPost(null);
      form.reset();
      toast({
        title: "Blog post updated successfully",
        description: "Your changes have been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update blog post",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/blog/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      toast({
        title: "Blog post deleted",
        description: "The blog post has been removed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete blog post",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertBlogPost) => {
    if (editingPost) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    form.reset({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      content: post.content,
      coverImage: post.coverImage || "",
      category: post.category,
      isPublished: post.isPublished,
    });
    setIsCreateDialogOpen(true);
  };

  const handleDelete = (post: BlogPost) => {
    if (confirm(`Are you sure you want to delete "${post.title}"?`)) {
      deleteMutation.mutate(post.id);
    }
  };

  const handleTitleChange = (title: string) => {
    form.setValue("title", title);
    if (!editingPost) {
      const slug = generateSlug(title);
      form.setValue("slug", slug);
    }
  };

  const filteredPosts = posts.filter((post: BlogPost) =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add a custom toolbar with tooltips
  const quillToolbar = (
    <div id="quill-toolbar">
      <span className="ql-formats">
        <select className="ql-header" defaultValue="" title="Heading">
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
          <option value="">Normal</option>
        </select>
      </span>
      <span className="ql-formats">
        <button className="ql-bold" title="Bold"></button>
        <button className="ql-italic" title="Italic"></button>
        <button className="ql-underline" title="Underline"></button>
        <button className="ql-strike" title="Strikethrough"></button>
      </span>
      <span className="ql-formats">
        <button className="ql-list" value="ordered" title="Ordered List"></button>
        <button className="ql-list" value="bullet" title="Bullet List"></button>
        <button className="ql-indent" value="-1" title="Decrease Indent"></button>
        <button className="ql-indent" value="+1" title="Increase Indent"></button>
      </span>
      <span className="ql-formats">
        <select className="ql-align" title="Align"></select>
      </span>
      <span className="ql-formats">
        <button className="ql-blockquote" title="Blockquote"></button>
        <button className="ql-code-block" title="Code Block"></button>
      </span>
      <span className="ql-formats">
        <button className="ql-link" title="Insert Link"></button>
        <button className="ql-image" title="Insert Image"></button>
      </span>
      <span className="ql-formats">
        <button className="ql-clean" title="Remove Formatting"></button>
      </span>
    </div>
  );

  // Add this useEffect to patch Quill's link handling
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).Quill) {
      const Quill = (window as any).Quill;
      // Patch the tooltip's save handler for links
      const LinkTooltip = Quill.import("ui/tooltip");
      if (LinkTooltip && LinkTooltip.prototype && LinkTooltip.prototype.save) {
        const originalSave = LinkTooltip.prototype.save;
        LinkTooltip.prototype.save = function () {
          let value = this.textbox.value.trim();
          if (
            value &&
            !/^https?:\/\//i.test(value) &&
            !/^mailto:/i.test(value) &&
            !/^tel:/i.test(value)
          ) {
            value = "https://" + value;
            this.textbox.value = value;
          }
          originalSave.call(this);
        };
      }
    }
  }, [isCreateDialogOpen]);

  return (
    <AdminLayout
      title="Blog Management"
      description="Create, edit, and manage blog posts"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Dialog 
            open={isCreateDialogOpen} 
            onOpenChange={(open) => {
              setIsCreateDialogOpen(open);
              if (!open) {
                setEditingPost(null);
                form.reset();
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-fast-blue hover:bg-fast-blue-dark">
                <Plus className="h-4 w-4 mr-2" />
                Create Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingPost ? "Edit Blog Post" : "Create New Blog Post"}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter post title" 
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                handleTitleChange(e.target.value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Slug *</FormLabel>
                          <FormControl>
                            <Input placeholder="post-url-slug" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="coverImage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cover Image URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/image.jpg" {...field} value={field.value ?? ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="excerpt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Excerpt</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Brief description of the post"
                            className="h-20"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content *</FormLabel>
                        {/* Render toolbar BEFORE ReactQuill */}
                        {quillToolbar}
                        <FormControl>
                          {/* Rich Text Editor with custom toolbar */}
                          <ReactQuill
                            theme="snow"
                            value={field.value}
                            onChange={field.onChange}
                            modules={{
                              toolbar: {
                                container: "#quill-toolbar"
                              }
                            }}
                            formats={[
                              'header', 'bold', 'italic', 'underline', 'strike',
                              'list', 'bullet', 'indent', 'align',
                              'blockquote', 'code-block', 'link', 'image'
                            ]}
                            style={{ minHeight: 200 }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isPublished"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Publish Post</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Make this post visible to the public
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={!!field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsCreateDialogOpen(false);
                        setEditingPost(null);
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
                        ? (editingPost ? "Updating..." : "Creating...")
                        : (editingPost ? "Update Post" : "Create Post")
                      }
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>

        {/* Blog Posts Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-fast-blue" />
              Blog Posts ({filteredPosts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchTerm ? "No posts matching your search" : "No blog posts yet"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPosts.map((post: BlogPost) => (
                      <TableRow key={post.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium line-clamp-1">{post.title}</p>
                            <p className="text-sm text-gray-500 line-clamp-1">
                              {post.excerpt || "No excerpt"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{post.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={post.isPublished 
                            ? "bg-green-100 text-green-800" 
                            : "bg-yellow-100 text-yellow-800"
                          }>
                            {post.isPublished ? "Published" : "Draft"}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(post.createdAt ?? "")}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {post.isPublished && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  window.open(`/blog/${post.slug}`, '_blank');
                                  window.scrollTo({ top: 0, behavior: "instant" });
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEdit(post)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDelete(post)}
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
