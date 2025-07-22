import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, FileText, MessageSquare, Mail } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Cargo, ContactSubmission, Testimonial, BlogPost } from "@shared/schema";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [redirecting, setRedirecting] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      setRedirecting(true);
      setLocation("/afoxinfcfs");
    }
  }, [isLoading, user, setLocation]);

  // Prevent rendering dashboard while redirecting
  if (redirecting) {
    return null;
  }

  const { data: cargoData } = useQuery<{ cargo: Cargo[], total: number }>({
    queryKey: ["/api/admin/cargo", { page: 1, limit: 10 }],
    queryFn: async (context) => {
        const [url, params] = context.queryKey as [string, { page: number; limit: number }];
        const response = await fetch(`${url}?page=${params.page}&limit=${params.limit}`);
        return response.json();
    },
  });
  const { data: contactData } = useQuery<{ submissions: ContactSubmission[], total: number }>({
    queryKey: ["/api/admin/contact-submissions", { page: 1, limit: 5 }],
    queryFn: async (context) => {
        const [url, params] = context.queryKey as [string, { page: number; limit: number }];
        const response = await fetch(`${url}?page=${params.page}&limit=${params.limit}`);
        return response.json();
    },
  });
  const { data: testimonials } = useQuery<Testimonial[]>({
    queryKey: ["/api/admin/testimonials"],
  });
  const { data: blogData } = useQuery<{ posts: BlogPost[], total: number }>({
    queryKey: ["/api/admin/blog", 1, 5],
  });

  const recentCargo = cargoData?.cargo?.slice(0, 5) || [];
  const recentContacts = contactData?.submissions?.slice(0, 5) || [];
  const pendingTestimonials = testimonials?.filter(t => !t.isApproved) || [];
  const recentPosts = blogData?.posts?.slice(0, 5) || [];

  const stats = [
    {
      title: "Total Cargo",
      value: cargoData?.total || 0,
      icon: Package,
      color: "text-fast-blue",
      bgColor: "bg-fast-blue/10"
    },
    {
      title: "Contact Submissions",
      value: contactData?.total || 0,
      icon: Mail,
      color: "text-african-gold",
      bgColor: "bg-african-gold/10"
    },
    {
      title: "Pending Testimonials",
      value: pendingTestimonials.length,
      icon: MessageSquare,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Published Posts",
      value: recentPosts.filter(p => p.isPublished).length,
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    }
  ];

  return (
    <AdminLayout
      title="Dashboard"
      description="Overview of your logistics management system"
    >
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Cargo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2 text-fast-blue" />
                Recent Cargo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentCargo.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No cargo entries yet</p>
              ) : (
                <div className="space-y-4">
                  {recentCargo.map((cargo) => (
                    <div key={cargo.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{cargo.trackingNumber}</p>
                        <p className="text-sm text-gray-600">{cargo.customerName}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-xs">
                          {cargo.status.replace('_', ' ')}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {cargo.createdAt ? formatDate(cargo.createdAt) : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Contact Submissions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-african-gold" />
                Recent Contact Submissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentContacts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No contact submissions yet</p>
              ) : (
                <div className="space-y-4">
                  {recentContacts.map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{contact.name}</p>
                        <p className="text-sm text-gray-600">{contact.subject}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={contact.isRead ? "outline" : "default"} className="text-xs">
                          {contact.isRead ? "Read" : "New"}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {contact.createdAt ? formatDate(contact.createdAt) : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Testimonials */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-green-600" />
                Pending Testimonials
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingTestimonials.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No pending testimonials</p>
              ) : (
                <div className="space-y-4">
                  {pendingTestimonials.slice(0, 3).map((testimonial) => (
                    <div key={testimonial.id} className="p-3 border rounded-lg">
                      <p className="font-medium text-sm">{testimonial.customerName}</p>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                        {testimonial.content}
                      </p>
                      <Badge variant="outline" className="text-xs mt-2">
                        Pending Approval
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Blog Posts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-purple-600" />
                Recent Blog Posts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentPosts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No blog posts yet</p>
              ) : (
                <div className="space-y-4">
                  {recentPosts.map((post) => (
                    <div key={post.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm line-clamp-1">{post.title}</p>
                        <p className="text-sm text-gray-600">{post.category}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={post.isPublished ? "default" : "outline"} className="text-xs">
                          {post.isPublished ? "Published" : "Draft"}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(post.createdAt ?? "")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <a href="/admin/cargo" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <Package className="h-8 w-8 text-fast-blue mb-2" />
                <p className="font-medium">Add New Cargo</p>
                <p className="text-sm text-gray-600">Create cargo entry</p>
              </a>
              
              <a href="/admin/blog" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <FileText className="h-8 w-8 text-purple-600 mb-2" />
                <p className="font-medium">Create Blog Post</p>
                <p className="text-sm text-gray-600">Write new article</p>
              </a>
              
              <a href="/admin/contact-submissions" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <Mail className="h-8 w-8 text-african-gold mb-2" />
                <p className="font-medium">View Messages</p>
                <p className="text-sm text-gray-600">Check submissions</p>
              </a>
              
              <a href="/admin/testimonials" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <MessageSquare className="h-8 w-8 text-green-600 mb-2" />
                <p className="font-medium">Review Testimonials</p>
                <p className="text-sm text-gray-600">Approve reviews</p>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}