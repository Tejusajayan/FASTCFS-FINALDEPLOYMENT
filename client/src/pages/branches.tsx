import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Phone, Mail, Clock, Search, Building } from "lucide-react";
import { useState } from "react";
import type { Branch } from "@shared/schema";
import { Helmet } from "react-helmet-async";
import branchQrPdf from "@/assets/BRANCH LOCATION.pdf";
import favi from "@/assets/favicon.ico";

export default function BranchesPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: branchesData = { branches: [], total: 0 }, isLoading } = useQuery<{ branches: Branch[], total: number }>({
    queryKey: ["/api/branches", { page: 1, limit: 50 }],
    queryFn: async (context) => {
        const [url, params] = context.queryKey as [string, { page: number; limit: number }];
        const response = await fetch(`${url}?page=${params.page}&limit=${params.limit}`);
        return response.json();
    },
  });
  const branches = branchesData?.branches || [];
  const totalBranches = branchesData?.total || 0;

  const filteredBranches = branches.filter(branch =>
    branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedBranches = filteredBranches.reduce((acc, branch) => {
    const country = branch.country;
    if (!acc[country]) {
      acc[country] = [];
    }
    acc[country].push(branch);
    return acc;
  }, {} as Record<string, Branch[]>);

  const countries = Object.keys(groupedBranches).sort();

  const { data: seo } = useQuery({
    queryKey: ["/api/seo", "branches"],
    queryFn: async () => {
      const res = await fetch("/api/seo/branches");
      if (!res.ok) return null;
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Helmet>
          <title>{seo?.title || "Our Branches | FAST CFS"}</title>
          <meta name="description" content={seo?.description || "Strategic locations across Dubai and Africa to serve your logistics needs"} />
          {seo?.keywords && <meta name="keywords" content={seo.keywords} />}
          {seo?.ogImage && <meta property="og:image" content={seo.ogImage} />}
          <meta property="og:title" content={seo?.title || "Our Branches | FAST CFS"} />
          <meta property="og:description" content={seo?.description || "Strategic locations across Dubai and Africa to serve your logistics needs"} />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://fastcfs.com/branches" />
          <link rel="icon" type="image/x-icon" href={favi} />
        </Helmet>
        <Header />
        <div className="pt-16">
          <section className="bg-gradient-to-r from-fast-blue to-fast-blue-dark py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Our Branches</h1>
              <p className="text-xl text-blue-100">Loading our global network...</p>
            </div>
          </section>
          <section className="py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-6 bg-gray-200 rounded mb-4"></div>
                      <div className="h-16 bg-gray-200 rounded mb-4"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                      </div>
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
        <title>{seo?.title || "Our Branches | FAST CFS"}</title>
        <meta name="description" content={seo?.description || "Strategic locations across Dubai and Africa to serve your logistics needs"} />
        {seo?.keywords && <meta name="keywords" content={seo.keywords} />}
        {seo?.ogImage && <meta property="og:image" content={seo.ogImage} />}
        <meta property="og:title" content={seo?.title || "Our Branches | FAST CFS"} />
        <meta property="og:description" content={seo?.description || "Strategic locations across Dubai and Africa to serve your logistics needs"} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://fastcfs.com/branches" />
      </Helmet>
      <Header />
      
      <div className="pt-16">
        {/* Hero Section */}
        <section className="bg-fastblue py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Our Global Network
            </h1>
            <p className="text-xl text-africangold max-w-3xl mx-auto">
              Strategic locations across Dubai and Africa to serve your logistics needs
            </p>
          </div>
        </section>

        {/* Search Section */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by city or country..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </section>

        {/* QR Code Download Button */}
        <section className="py-2 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
            <Button
              className="bg-fast-blue hover:bg-fast-blue-dark text-white"
              onClick={() => {
                // Create a temporary link and trigger download
                const link = document.createElement("a");
                link.href = branchQrPdf;
                link.download = "BRANCH LOCATION QR CODES.pdf";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
            >
              Get QR codes of our branch location
            </Button>
          </div>
        </section>

        {/* Branches Grid */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {filteredBranches.length === 0 ? (
              <div className="text-center py-16">
                <Building className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No branches found</h3>
                <p className="text-gray-600">
                  {searchTerm 
                    ? `No branches match your search for "${searchTerm}"`
                    : "No branches are available at the moment."
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
              <div className="space-y-12">
                {countries.map((country) => (
                  <div key={country}>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                      <MapPin className="h-6 w-6 text-fast-blue mr-2" />
                      {country}
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {groupedBranches[country].map((branch) => (
                        <Card key={branch.id} className="hover:shadow-lg transition-shadow">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">{branch.name}</CardTitle>
                              {branch.isMainOffice && (
                                <Badge className="bg-fast-blue text-white">Headquarters</Badge>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* Address */}
                            <div className="flex items-start space-x-3">
                              <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-medium text-gray-900">Address</p>
                                <p className="text-gray-600 text-sm">
                                  {branch.address}<br />
                                  {branch.city}, {branch.country}
                                </p>
                              </div>
                            </div>

                            {/* Incharge */}
                            <div className="flex items-start space-x-3">
                              <Building className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-medium text-gray-900">Incharge</p>
                                <p className="text-gray-600 text-sm">{branch.incharge}</p>
                              </div>
                            </div>

                            {/* Phone */}
                            <div className="flex items-start space-x-3">
                              <Phone className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-medium text-gray-900">Phone</p>
                                <a 
                                  href={`tel:${branch.phone}`}
                                  className="text-fast-blue hover:text-fast-blue-dark text-sm"
                                >
                                  {branch.phone}
                                </a>
                              </div>
                            </div>

                            {/* Email */}
                            <div className="flex items-start space-x-3">
                              <Mail className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-medium text-gray-900">Email</p>
                                <a 
                                  href={`mailto:${branch.email}`}
                                  className="text-fast-blue hover:text-fast-blue-dark text-sm break-all"
                                >
                                  {branch.email}
                                </a>
                              </div>
                            </div>

                            {/* Google Map Location */}
                            {branch.location && (
                              <div className="flex items-start space-x-3">
                                <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="font-medium text-gray-900">Google Map</p>
                                  <a
                                    href={branch.location}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-fast-blue hover:text-fast-blue-dark text-sm break-all"
                                  >
                                    View Location
                                  </a>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Our Reach Across Africa
              </h2>
              <p className="text-xl text-gray-600">
                Strategically positioned for optimal logistics coverage
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center">
                <CardContent className="p-8">
                  <div className="text-4xl font-bold text-fast-blue mb-2">
                    {countries.length}
                  </div>
                  <div className="text-gray-600">Countries</div>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-8">
                  <div className="text-4xl font-bold text-african-gold mb-2">
                    {branches.length}
                  </div>
                  <div className="text-gray-600">Total Branches</div>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-8">
                  <div className="text-4xl font-bold text-fast-blue mb-2">24/7</div>
                  <div className="text-gray-600">Support Available</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-20 bg-gradient-to-r from-fast-blue to-fast-blue-dark">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-fastblue mb-6">
              Can't Find Your Location?
            </h2>
            <p className="text-xl text-fastbluelight mb-8">
              We're constantly expanding our network. Contact us to discuss logistics solutions for your area.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-african-gold hover:bg-yellow-500 text-white">
                <Phone className="h-5 w-5 mr-2" />
                Call +971 4 3496244
              </Button>
              <Button size="lg" variant="outline" className="border-fastblue text-fastbluelight hover:bg-fastblue hover:text-white">
                <Mail className="h-5 w-5 mr-2" />
                Send Inquiry
              </Button>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
