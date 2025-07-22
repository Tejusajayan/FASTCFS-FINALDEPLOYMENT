import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ship, Plane, Truck, Warehouse, FileText, Globe, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import seaservice from "@/assets/SERVICES_SEA.jpg";
import landservice from "@/assets/SERVICE_LAND1.jpg";
import airservice from "@/assets/SERVICES_AIR.jpg";
import favi from "@assets/favicon.ico";

const services = [
  {
    id: "ocean-freight",
    icon: Ship,
    title: "Ocean Freight",
    subtitle: "Reliable Sea Transportation",
    description: "Cost-effective ocean freight services with comprehensive tracking and support for full container loads (FCL) and less than container loads (LCL) across African ports.",
    features: [
      "Full Container Load (FCL) & Less than Container Load (LCL)",
      "Door-to-door, Port-to-port services, Door-to-port, Port-to-door",
      "Competitive freight rates and transit times",
      "Specialized handling for dangerous goods",
      "Temperature-controlled container options"
    ],
    image: seaservice,
    color: "fast-blue"
  },
  {
    id: "air-freight",
    icon: Plane,
    title: "Air Freight",
    subtitle: "Express Air Cargo Solutions",
    description: "Fast and secure air cargo services for time-sensitive shipments with comprehensive handling and express delivery options across African destinations.",
    features: [
      "Real-time flight tracking and updates",
      "Express and standard air freight options",
      "Fastest delivery times in the region",
      "Temperature-controlled cargo handling",
      "Dangerous goods certification and handling",
    ],
    image: airservice,
    color: "african-gold"
  },
  {
    id: "land-transport",
    icon: Truck,
    title: "Land Transport",
    subtitle: "Ground Transportation Services",
    description: "Efficient ground transportation and last-mile delivery services with reliable trucking solutions across African & UAE road networks and cross-border operations.",
    features: [
      "Cross-border trucking services",
      "Last-mile delivery solutions",
      "Project cargo and oversized freight",
      "Temperature-controlled transportation",
      "Multi-modal transportation coordination"
    ],
    image: landservice,
    color: "fast-blue"
  },
  {
    id: "warehousing",
    icon: Warehouse,
    title: "Warehousing & Distribution",
    subtitle: "Modern Storage Solutions",
    description: "State-of-the-art warehouse facilities with inventory management, order fulfillment, and distribution services to optimize your supply chain operations.",
    features: [
      "Cross-docking services",
      "Quality control and inspection",
      "Distribution center operations"
    ],
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
    color: "african-gold"
  },
  {
    id: "customs-clearance",
    icon: FileText,
    title: "Customs Clearance",
    subtitle: "Expert Customs Brokerage",
    description: "Professional customs brokerage services ensuring smooth clearance processes, compliance with regulations, and minimized delays at borders.",
    features: [
      "Import and export documentation",
      "Duty and tax optimization",
      "Pre-clearance services",
      "Trade agreement utilization"
    ],
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
    color: "fast-blue"
  },
];


export default function ServicesPage() {
  // Fetch SEO meta for this page
  const { data: seo } = useQuery({
    queryKey: ["/api/seo", "services"],
    queryFn: async () => {
      const res = await fetch("/api/seo/services");
      if (!res.ok) return null;
      return res.json();
    },
  });

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>{seo?.title || "Our Services | FAST CFS"}</title>
        <meta name="description" content={seo?.description || "Comprehensive logistics solutions designed to meet your unique shipping and supply chain requirements"} />
        {seo?.keywords && <meta name="keywords" content={seo.keywords} />}
        {seo?.ogImage && <meta property="og:image" content={seo.ogImage} />}
        <meta property="og:title" content={seo?.title || "Our Services | FAST CFS"} />
        <meta property="og:description" content={seo?.description || "Comprehensive logistics solutions designed to meet your unique shipping and supply chain requirements"} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://fastcfs.com/services" />
        <link rel="icon" type="image/x-icon" href={favi} />
      </Helmet>
      <Header />
      
      <div className="pt-16">
        {/* Hero Section */}
        <section className="bg-fastblue py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Our Services
            </h1>
            <p className="text-xl text-africangold max-w-3xl mx-auto">
              Comprehensive logistics solutions designed to meet your unique shipping and supply chain requirements
            </p>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-20">
              {services.map((service, index) => {
                const Icon = service.icon;
                const isEven = index % 2 === 0;
                
                return (
                  <div
                    key={service.id}
                    id={service.id}
                    className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${!isEven ? 'lg:grid-flow-col-dense' : ''}`}
                  >
                    <div className={`space-y-6 ${!isEven ? 'lg:col-start-2' : ''}`}>
                      <div className="flex items-center space-x-4">
                        <div className={`w-16 h-16 bg-${service.color}/10 rounded-xl flex items-center justify-center`}>
                          <Icon className={`h-8 w-8 text-${service.color}`} />
                        </div>
                        <div>
                          <Badge variant="outline" className={`text-${service.color} border-${service.color}`}>
                            {service.subtitle}
                          </Badge>
                        </div>
                      </div>
                      
                      <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                          {service.title}
                        </h2>
                        <p className="text-lg text-gray-600 leading-relaxed">
                          {service.description}
                        </p>
                      </div>

                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900">Key Features:</h3>
                        <ul className="space-y-2">
                          {service.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start space-x-3">
                              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-600">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4">
                        <Link href="/contact" onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}>
                          <Button className={`bg-${service.color} hover:bg-${service.color === 'fast-blue' ? 'fast-blue-dark' : 'yellow-500'}`}>
                            Get Quote
                          </Button>
                        </Link>
                        <Button variant="outline" className={`border-${service.color} text-${service.color} hover:bg-${service.color} hover:text-white`}>
                          Learn More
                        </Button>
                      </div>
                    </div>

                    <div className={!isEven ? 'lg:col-start-1 lg:row-start-1' : ''}>
                      <Card className="overflow-hidden shadow-xl">
                        <img
                          src={service.image}
                          alt={service.title}
                          className="w-full h-64 object-cover"
                          loading="lazy"
                        />
                      </Card>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>


        {/* Coverage Map Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Our Coverage Network
              </h2>
              <p className="text-xl text-gray-600">
                Serving major trade routes between Dubai and Africa
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-gray-900">Key Destinations</h3>
                
                {/* Groupage & LCL Shipments Section */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xl font-bold text-fast-blue mb-2">FCL Shipments</h4>
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-1">West Africa</h5>
                        <p className="text-gray-600">Niger, Mauritania, Mali, Liberia, Guinea-Bissau, Guinea, Gambia, Cape Verde, Burkina Faso, Benin, Ghana, Nigeria, Côte d'Ivoire, Senegal, Gabon</p>
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-1">East Africa</h5>
                        <p className="text-gray-600">South Sudan, Somalia, Seychelles, Mozambique, Mauritius, Malawi, Madagascar, Eritrea, Djibouti, Comoros, Kenya, Uganda, Tanzania, Ethiopia, Rwanda, Burundi</p>
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-1">Southern Africa</h5>
                        <p className="text-gray-600">South Africa, Mozambique, Namibia, Lesotho, Eswatini, Botswana, Zimbabwe, Zambia</p>
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-1">North Africa</h5>
                        <p className="text-gray-600">Egypt, Morocco, Tunisia, Algeria, Sudan, Libya</p>
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-1">Central Africa</h5>
                        <p className="text-gray-600">Cameroon, Angola, Central African Republic, Chad, Republic of the Congo, Democratic Republic of the Congo, Equatorial Guinea, Gabon, São Tomé and Príncipe</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* LCL Only Section */}
                <div className="space-y-6 mt-8">
                  <div>
                    <h4 className="text-xl font-bold text-african-gold mb-2">GROUPAGE</h4>
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-1">Countries</h5>
                        <p className="text-gray-600">Rwanda, Burundi, Zambia, Malawi, Democratic Congo, Uganda</p>
                      </div>
                      {/* Add more countries/regions here if needed */}
                    </div>
                  </div>
                </div>
              </div>
              
              <Card className="p-8 bg-gradient-to-br from-fast-blue/5 to-african-gold/5">
                <div className="text-center space-y-6">
                  <Globe className="h-24 w-24 text-fast-blue mx-auto" />
                  <div>
                    <div className="text-4xl font-bold text-fast-blue mb-2">25+</div>
                    <div className="text-gray-600">African Countries</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-african-gold mb-2">100+</div>
                    <div className="text-gray-600">Major Ports & Airports</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-fast-blue to-fast-blue-dark">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-fastblue mb-6">
              Ready to Optimize Your Logistics?
            </h2>
            <p className="text-xl text-fastbluelight mb-8">
              Get a customized quote for your shipping and logistics requirements today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}>
                <Button size="lg" className="bg-african-gold hover:bg-yellow-500 text-white">
                  Request Quote
                </Button>
              </Link>
              <Link href="/cargo-tracking" onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}>
                <Button size="lg" variant="outline" className="border-fastblue text-fastblue hover:bg-fastblue hover:text-white">
                  Track Your Cargo
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
