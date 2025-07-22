import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import HeroCarousel from "@/components/ui/hero-carousel";
import TestimonialCarousel from "@/components/ui/testimonial-carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Ship, 
  Plane, 
  Truck, 
  Warehouse, 
  FileText, 
  Shield,
  MapPin,
  Phone,
  Mail,
  Search,
  ArrowRight,
} from "lucide-react";
import type { Branch, BlogPost } from "@shared/schema";
import { useState } from "react";
import favi from "@assets/favicon.ico";

const services = [
  {
    id: 1,
    icon: Ship,
    title: "Ocean Freight",
    description: "Reliable sea freight services with competitive rates and comprehensive tracking for cargo shipments across African ports.",
    color: "bg-fast-blue"
  },
  {
    id: 2,
    icon: Plane,
    title: "Air Freight",
    description: "Fast and secure air cargo services for time-sensitive shipments with door-to-door delivery options.",
    color: "bg-african-gold"
  },
  {
    id: 3,
    icon: Truck,
    title: "Land Transport",
    description: "Efficient ground transportation and last-mile delivery services across African destinations.",
    color: "bg-fast-blue"
  },
  {
    id: 4,
    icon: Warehouse,
    title: "Warehousing",
    description: "Modern warehouse facilities with inventory management and distribution services.",
    color: "bg-african-gold"
  },
  {
    id: 5,
    icon: FileText,
    title: "Customs Clearance",
    description: "Expert customs brokerage services ensuring smooth clearance processes and compliance.",
    color: "bg-fast-blue"
  },
];

export default function HomePage() {
  const [trackingNumber, setTrackingNumber] = useState("");

  const { data: branchesData = { branches: [] } } = useQuery<{ branches: Branch[], total: number }>({
    queryKey: ["/api/branches", { page: 1, limit: 4 }],
    queryFn: async (context) => {
        const [url, params] = context.queryKey as [string, { page: number; limit: number }];
        const response = await fetch(`${url}?page=${params.page}&limit=${params.limit}`);
        return response.json();
    },
  });
  const branches = branchesData?.branches || [];

  const { data: blogData } = useQuery<{ posts: BlogPost[], total: number }>({
    queryKey: ["/api/blog", { page: 1, limit: 3 }],
    queryFn: async ({ queryKey }) => {
        const [url, params] = queryKey as [string, { page: number; limit: number }];
        const response = await fetch(`${url}?page=${params.page}&limit=${params.limit}`);
        return response.json();
    },
  });
  const recentPosts = (blogData?.posts ?? []).slice(0, 3);

  // Select the first 4 branches as featured branches, or fewer if not enough
  const featuredBranches = branches.slice(0, 4);

  const handleTrackingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      window.location.href = `/cargo-tracking?q=${encodeURIComponent(trackingNumber)}`;
    }
  };

  const { data: seo } = useQuery({
    queryKey: ["/api/seo", "home"],
    queryFn: async () => {
      const res = await fetch("/api/seo/home");
      if (!res.ok) return null;
      return res.json();
    },
  });

  return (
    <>
      <Helmet>
        <title>{seo?.title || "FAST CFS"}</title>
        {seo?.description && (
          <meta name="description" content={seo.description} />
        )}
        {seo?.keywords && (
          <meta name="keywords" content={seo.keywords} />
        )}
        {seo?.ogImage && (
          <meta property="og:image" content={seo.ogImage} />
        )}
        <meta property="og:title" content={seo?.title || "Home | FAST CFS"} />
        <link rel="icon" type="image/x-icon" href={favi} />
        {/* Add more meta tags as needed */}
      </Helmet>
      <div className="min-h-screen bg-white">
        <Header />
        
        {/* Hero Section */}
        <HeroCarousel />

        {/* Quick Tracking Section */}
        <section className="bg-white py-12 -mt-8 relative z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="shadow-xl border border-gray-100">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Track Your Air Cargo</h2>
                  <p className="text-gray-600">Enter your tracking number to get real-time cargo status</p>
                </div>
                
                <form onSubmit={handleTrackingSubmit} className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      type="text"
                      placeholder="Enter tracking number (e.g., 21072508223122)"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="h-12"
                    />
                  </div>
                  <Button type="submit" size="lg" className="bg-fast-blue hover:bg-fast-blue-dark text-white font-semibold">
                    <Search className="h-5 w-5 mr-2" />
                    Track Cargo
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Comprehensive logistics solutions tailored for businesses connecting Dubai with African markets
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service) => {
                const Icon = service.icon;
                return (
                  <Card key={service.id} className="hover:shadow-xl transition-shadow border border-gray-100">
                    <CardContent className="p-8">
                      <div className={`w-16 h-16 ${service.color}/10 rounded-lg flex items-center justify-center mb-6`}>
                        <Icon className={`h-8 w-8 ${service.color.includes('fast-blue') ? 'text-fast-blue' : 'text-african-gold'}`} />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">{service.title}</h3>
                      <p className="text-gray-600 mb-6">{service.description}</p>
                      <Link href="/services" onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}>
                        <Button variant="ghost" className="text-fast-blue hover:text-fast-blue-dark p-0">
                          Learn More <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Leading Logistics Excellence{" "}
                  <span className="text-fast-blue">Since 2010</span>
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Based in Dubai, FAST CFS has established itself as a trusted partner for businesses 
                  seeking reliable logistics and freight forwarding services across Africa. Our commitment 
                  to excellence and innovative solutions has made us a leader in the industry.
                </p>
                <div className="grid grid-cols-2 gap-6">
                  <Card className="p-4 bg-fast-blue/5">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-fast-blue">25+</div>
                      <div className="text-gray-600">African Countries</div>
                    </div>
                  </Card>
                  <Card className="p-4 bg-african-gold/5">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-african-gold">50K+</div>
                      <div className="text-gray-600">Cargo Delivered</div>
                    </div>
                  </Card>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/about" onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}>
                    <Button className="bg-fast-blue hover:bg-fast-blue-dark">
                      Learn More About Us
                    </Button>
                  </Link>
                  <Button variant="outline" className="border-fast-blue text-fast-blue hover:bg-fast-blue hover:text-white">
                    Download Brochure
                  </Button>
                </div>
              </div>
              
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
                  alt="Professional African business team in modern office environment"
                  className="rounded-2xl shadow-2xl w-full h-auto"
                  loading="lazy"
                />
                
                {/* Floating certification card */}
                
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <TestimonialCarousel />

        {/* Branches Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Global Network</h2>
              <p className="text-xl text-gray-600">
                Strategic locations connecting Dubai with key African markets
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {featuredBranches.map((branch, index) => (
                <Card key={branch.id} className="hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 ${index % 2 === 0 ? 'bg-fast-blue' : 'bg-african-gold'}/10 rounded-lg flex items-center justify-center mb-4`}>
                      <MapPin className={`h-6 w-6 ${index % 2 === 0 ? 'text-fast-blue' : 'text-african-gold'}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{branch.name}</h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {branch.address}<br />
                      {branch.city}, {branch.country}
                    </p>
                    <p className="text-gray-600 text-sm mb-3">
                      <strong>Incharge:</strong> {branch.incharge}
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{branch.phone}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{branch.email}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="text-center">
              <Link href="/branches" onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}>
                <Button className="bg-fast-blue hover:bg-fast-blue-dark">
                  View All Branches
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Blog Preview Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Latest News & Insights</h2>
              <p className="text-xl text-gray-600">
                Stay updated with logistics trends and industry developments
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentPosts.length > 0 ? recentPosts.map((post) => (
                <Card key={post.id} className="bg-gray-50 hover:shadow-lg transition-shadow overflow-hidden">
                  {post.coverImage && (
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-48 object-cover"
                      loading="lazy"
                    />
                  )}
                  <CardContent className="p-6">
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <span>{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "Unknown date"}</span>
                      <span className="mx-2">•</span>
                      <span>{post.category}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{post.title}</h3>
                    {post.excerpt && (
                      <p className="text-gray-600 mb-4">{post.excerpt}</p>
                    )}
                    <Link href={`/blog/${post.slug}`}>
                      <Button variant="ghost" className="text-fast-blue hover:text-fast-blue-dark p-0">
                        Read More <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-600">No blog posts available at the moment.</p>
                </div>
              )}
            </div>
            
            {recentPosts.length > 0 && (
              <div className="text-center mt-12">
                <Link href="/blog" onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}>
                  <Button className="bg-fast-blue hover:bg-fast-blue-dark">
                    View All Posts
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
