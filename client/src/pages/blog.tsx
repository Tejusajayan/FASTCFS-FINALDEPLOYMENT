import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, ArrowRight, BookOpen } from "lucide-react";
import { Link } from "wouter";
import { formatDate } from "@/lib/utils";
import type { BlogPost } from "@shared/schema";
import { Helmet } from "react-helmet-async";
import favi from "@assets/favicon.ico";

export default function BlogPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 9;

  const { data: blogData, isLoading } = useQuery<{ posts: BlogPost[], total: number }>({
    queryKey: ["/api/blog", { page: currentPage, limit: postsPerPage }],
    queryFn: async (context) => {
        const [url, params] = context.queryKey as [string, { page: number; limit: number }];
        const response = await fetch(`${url}?page=${params.page}&limit=${params.limit}`);
        return response.json();
    },
  });
  const posts = blogData?.posts || [];
  const totalPosts = blogData?.total || 0;
  const totalPages = Math.ceil(totalPosts / postsPerPage);

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = Array.from(new Set(posts.map(post => post.category)));

  const { data: seo } = useQuery({
    queryKey: ["/api/seo", "blog"],
    queryFn: async () => {
      const res = await fetch("/api/seo/blog");
      if (!res.ok) return null;
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Helmet>
          <title>{seo?.title || "Blog & Insights | FAST CFS"}</title>
          <meta name="description" content={seo?.description || "Stay updated with the latest trends, insights, and developments in logistics and freight forwarding"} />
          {seo?.keywords && <meta name="keywords" content={seo.keywords} />}
          {seo?.ogImage && <meta property="og:image" content={seo.ogImage} />}
          <meta property="og:title" content={seo?.title || "Blog & Insights | FAST CFS"} />
          <meta property="og:description" content={seo?.description || "Stay updated with the latest trends, insights, and developments in logistics and freight forwarding"} />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://fastcfs.com/blog" />
          <link rel="icon" type="image/x-icon" href={favi} />
        </Helmet>
        <Header />
        <div className="pt-16">
          <section className="bg-fastblue py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Blog & Insights</h1>
              <p className="text-xl text-blue-100">Loading latest posts...</p>
            </div>
          </section>
          <section className="py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-gray-200"></div>
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded mb-4"></div>
                      <div className="h-16 bg-gray-200 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>{seo?.title || "Blog & Insights | FAST CFS"}</title>
        <meta name="description" content={seo?.description || "Stay updated with the latest trends, insights, and developments in logistics and freight forwarding"} />
        {seo?.keywords && <meta name="keywords" content={seo.keywords} />}
        {seo?.ogImage && <meta property="og:image" content={seo.ogImage} />}
        <meta property="og:title" content={seo?.title || "Blog & Insights | FAST CFS"} />
        <meta property="og:description" content={seo?.description || "Stay updated with the latest trends, insights, and developments in logistics and freight forwarding"} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://fastcfs.com/blog" />
      </Helmet>
      <Header />
      
      <div className="pt-16">
        {/* Hero Section */}
        <section className="bg-fastblue py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Blog & Insights
            </h1>
            <p className="text-xl text-africangold max-w-3xl mx-auto">
              Stay updated with the latest trends, insights, and developments in logistics and freight forwarding
            </p>
          </div>
        </section>

        {/* Search and Filter Section */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search articles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={searchTerm === "" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSearchTerm("")}
                  className={searchTerm === "" ? "bg-fast-blue" : ""}
                >
                  All Posts
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchTerm(category)}
                    className={searchTerm === category ? "bg-fast-blue text-white" : ""}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts found</h3>
                <p className="text-gray-600">
                  {searchTerm 
                    ? `No articles match your search for "${searchTerm}"`
                    : "No blog posts are available at the moment."
                  }
                </p>
                {searchTerm && (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setSearchTerm("")}
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredPosts.map((post) => (
                    <Card key={post.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                      {post.coverImage && (
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-full h-48 object-cover"
                          loading="lazy"
                        />
                      )}
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant="outline" className="text-fast-blue border-fast-blue">
                            {post.category}
                          </Badge>
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            {post.createdAt ? formatDate(post.createdAt) : "Unknown date"}
                          </div>
                        </div>
                        
                        <h2 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                          {post.title}
                        </h2>
                        
                        {post.excerpt && (
                          <p className="text-gray-600 mb-4 line-clamp-3">
                            {post.excerpt}
                          </p>
                        )}
                        
                        <Link href={`/blog/${post.slug}`} onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}>
                          <Button variant="ghost" className="text-fast-blue hover:text-fast-blue-dark p-0 h-auto">
                            Read More <ArrowRight className="h-4 w-4 ml-1" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-12">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      
                      {[...Array(totalPages)].map((_, i) => {
                        const page = i + 1;
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            onClick={() => setCurrentPage(page)}
                            className={currentPage === page ? "bg-fast-blue" : ""}
                          >
                            {page}
                          </Button>
                        );
                      })}
                      
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Stay Updated
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Subscribe to our newsletter for the latest logistics insights and industry updates
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1"
              />
              <Button className="bg-fast-blue hover:bg-fast-blue-dark">
                Subscribe
              </Button>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}

