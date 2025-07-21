import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from "lucide-react";
import { insertContactSubmissionSchema, type InsertContactSubmission } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertContactSubmission>({
    resolver: zodResolver(insertContactSubmissionSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: InsertContactSubmission) => {
      const response = await apiRequest("POST", "/api/contact", data);
      return response.json();
    },
    onSuccess: () => {
      setIsSubmitted(true);
      form.reset();
      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you within 24 hours.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertContactSubmission) => {
    submitMutation.mutate(data);
  };

  const { data: seo } = useQuery({
    queryKey: ["/api/seo", "contact"],
    queryFn: async () => {
      const res = await fetch("/api/seo/contact");
      if (!res.ok) return null;
      return res.json();
    },
  });

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white">
        <Helmet>
          <title>{seo?.title || "Contact Us | FAST CFS"}</title>
          <meta name="description" content={seo?.description || "Ready to streamline your logistics? Contact our expert team for personalized solutions"} />
          {seo?.keywords && <meta name="keywords" content={seo.keywords} />}
          {seo?.ogImage && <meta property="og:image" content={seo.ogImage} />}
          <meta property="og:title" content={seo?.title || "Contact Us | FAST CFS"} />
          <meta property="og:description" content={seo?.description || "Ready to streamline your logistics? Contact our expert team for personalized solutions"} />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://fastcfs.com/contact" />
          <link rel="icon" type="image/x-icon" href="/src/assets/favicon.ico" />
        </Helmet>
        <Header />
        <div className="pt-16">
          <section className="py-20">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Thank You for Contacting Us!
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Your message has been successfully submitted. Our team will review your inquiry 
                and get back to you within 24 hours.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => setIsSubmitted(false)}
                  className="bg-fast-blue hover:bg-fast-blue-dark"
                >
                  Send Another Message
                </Button>
                <Button variant="outline" onClick={() => window.history.back()}>
                  Go Back
                </Button>
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
        <title>{seo?.title || "Contact Us | FAST CFS"}</title>
        <meta name="description" content={seo?.description || "Ready to streamline your logistics? Contact our expert team for personalized solutions"} />
        {seo?.keywords && <meta name="keywords" content={seo.keywords} />}
        {seo?.ogImage && <meta property="og:image" content={seo.ogImage} />}
        <meta property="og:title" content={seo?.title || "Contact Us | FAST CFS"} />
        <meta property="og:description" content={seo?.description || "Ready to streamline your logistics? Contact our expert team for personalized solutions"} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://fastcfs.com/contact" />
      </Helmet>
      <Header />
      
      <div className="pt-16">
        {/* Hero Section */}
        <section className="bg-fastblue py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Get In Touch
            </h1>
            <p className="text-xl text-africangold max-w-3xl mx-auto">
              Ready to streamline your logistics? Contact our expert team for personalized solutions
            </p>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {/* Contact Form */}
              <div>
                <Card className="shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-2xl">Send us a Message</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Your full name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email *</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="your@email.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone</FormLabel>
                                <FormControl>
                                  <Input type="tel" placeholder="+971 50 123 4567" {...field} value={field.value ?? ""} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="subject"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Subject *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a subject" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="General Inquiry">General Inquiry</SelectItem>
                                    <SelectItem value="Ocean Freight Quote">Ocean Freight Quote</SelectItem>
                                    <SelectItem value="Air Freight Quote">Air Freight Quote</SelectItem>
                                    <SelectItem value="Cargo Tracking Issue">Cargo Tracking Issue</SelectItem>
                                    <SelectItem value="Partnership Opportunity">Partnership Opportunity</SelectItem>
                                    <SelectItem value="Customer Support">Customer Support</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Message *</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Tell us about your logistics needs..."
                                  className="min-h-[120px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full bg-fast-blue hover:bg-fast-blue-dark"
                          disabled={submitMutation.isPending}
                        >
                          {submitMutation.isPending ? (
                            <>Sending...</>
                          ) : (
                            <>
                              <Send className="h-5 w-5 mr-2" />
                              Send Message
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>
              
              {/* Contact Information */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
                  <div className="space-y-6">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-fast-blue/10 rounded-lg flex items-center justify-center">
                            <MapPin className="h-6 w-6 text-fast-blue" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">Dubai Headquarters</h3>
                            <p className="text-gray-600">6, 30st Street, Umm Ramool, Al-Rashidiya<br/>Dubai, United Arab Emirates<br/>Post Box: 624498</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-african-gold/10 rounded-lg flex items-center justify-center">
                            <Phone className="h-6 w-6 text-african-gold" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">Phone Numbers</h3>
                            <p className="text-gray-600">
                              <a href="tel:+97141234567" className="text-fast-blue hover:text-fast-blue-dark">
                                +971 43496244
                              </a> (Dubai)<br />
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-fast-blue/10 rounded-lg flex items-center justify-center">
                            <Mail className="h-6 w-6 text-fast-blue" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">Email Addresses</h3>
                            <p className="text-gray-600">
                              <a href="mailto:info@fastcfs.com" className="text-fast-blue hover:text-fast-blue-dark">
                                info@fastcfs.com
                              </a><br />
                              <a href="mailto:support@fastcfs.com" className="text-fast-blue hover:text-fast-blue-dark">
                                support@fastcfs.com
                              </a>
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-african-gold/10 rounded-lg flex items-center justify-center">
                            <Clock className="h-6 w-6 text-african-gold" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">Business Hours</h3>
                            <p className="text-gray-600">
                              Monday - Friday: 9:30 AM - 5:00 PM<br />
                              Saturday: 9:30 AM - 1:00 PM<br />
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                {/* Office Image */}
                <Card className="overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
                    alt="Modern office buildings in Dubai business district"
                    className="w-full h-64 object-cover"
                    loading="lazy"
                  />
                </Card>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}