import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, ArrowLeft, Share2, BookOpen } from "lucide-react";
import { Link } from "wouter";
import { formatDate } from "@/lib/utils";
import type { BlogPost } from "@shared/schema";
import { Helmet } from "react-helmet-async";

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading, error } = useQuery<BlogPost>({
    queryKey: ["/api/blog", slug],
    enabled: !!slug,
    queryFn: async ({ queryKey }) => {
      const [url, slug] = queryKey as [string, string];
      const response = await fetch(`${url}/${slug}`);
      if (!response.ok) {
        throw new Error("Failed to fetch blog post");
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Helmet>
          <link rel="icon" type="image/x-icon" href="/src/assets/favicon.ico" />
        </Helmet>
        <Header />
        <div className="pt-16">
          <section className="py-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded mb-4"></div>
                <div className="h-64 bg-gray-200 rounded mb-8"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </section>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="pt-16">
          <section className="py-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
              <p className="text-gray-600 mb-8">
                The blog post you're looking for doesn't exist or has been moved.
              </p>
              <Link href="/blog" onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}>
                <Button className="bg-fast-blue hover:bg-fast-blue-dark">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Blog
                </Button>
              </Link>
            </div>
          </section>
        </div>
        <Footer />
      </div>
    );
  }

  const shareUrl = `${window.location.origin}/blog/${post.slug}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt || post.title,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback to copying URL to clipboard
      navigator.clipboard.writeText(shareUrl);
      alert('URL copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="pt-16">
        {/* Article Header */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <Link href="/blog" onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}>
                <Button variant="ghost" className="text-fast-blue hover:text-fast-blue-dark p-0">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Blog
                </Button>
              </Link>
            </div>
            
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-4">
                <Badge variant="outline" className="text-fast-blue border-fast-blue">
                  {post.category}
                </Badge>
                <div className="flex items-center text-gray-500">
                  <Calendar className="h-4 w-4 mr-2" />
                  {formatDate(post.createdAt ?? "")}
                </div>
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                {post.title}
              </h1>
              
              {post.excerpt && (
                <p className="text-xl text-gray-600 leading-relaxed">
                  {post.excerpt}
                </p>
              )}
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Last updated: {formatDate(post.updatedAt ?? "")}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="text-fast-blue border-fast-blue hover:bg-fast-blue hover:text-white"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Cover Image */}
        {post.coverImage && (
          <section className="py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <Card className="overflow-hidden shadow-xl">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-64 md:h-96 object-cover"
                  loading="lazy"
                />
              </Card>
            </div>
          </section>
        )}

        {/* Article Content */}
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card>
              <CardContent className="p-8 md:p-12">
                <div 
                  className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-fast-blue prose-strong:text-gray-900"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Article Footer */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card>
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Need Logistics Support?
                    </h3>
                    <p className="text-gray-600">
                      Contact our team for personalized logistics solutions.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <Link href="/contact" onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}>
                      <Button className="bg-fast-blue hover:bg-fast-blue-dark">
                        Get in Touch
                      </Button>
                    </Link>
                    <Link href="/services" onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}>
                      <Button variant="outline" className="border-fast-blue text-fast-blue hover:bg-fast-blue hover:text-white">
                        Our Services
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Related Articles CTA */}
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Separator className="mb-8" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Explore More Insights
            </h3>
            <p className="text-gray-600 mb-6">
              Discover more articles about logistics, shipping, and supply chain management.
            </p>
            <Link href="/blog" onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}>
              <Button variant="outline" className="border-fast-blue text-fast-blue hover:bg-fast-blue hover:text-white">
                View All Articles
              </Button>
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
