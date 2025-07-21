import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Quote, Star, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Testimonial, InsertTestimonial } from "@shared/schema";
import { z } from "zod";

const testimonialSchema = z.object({
  customerName: z.string().min(2).max(50).regex(/^[a-zA-Z0-9 .,'-]+$/, "Invalid name"),
  customerLocation: z.string().max(50).optional(),
  content: z.string().min(10).max(500).refine(val => !/<|script|onerror|onload|iframe|img|svg|object|embed|javascript:/i.test(val), "Invalid content"),
  rating: z.number().min(1).max(5),
});

export default function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const queryClient = useQueryClient();

  const { data: testimonials = [], isLoading } = useQuery<Testimonial[]>({
    queryKey: ["/api/testimonials"],
    queryFn: async () => {
      const response = await fetch("/api/testimonials");
      if (!response.ok) throw new Error("Failed to fetch testimonials");
      return response.json();
    },
  });

  // Only show approved testimonials in the carousel
  const approvedTestimonials = testimonials.filter(t => t.isApproved);

  useEffect(() => {
    if (approvedTestimonials.length > 0) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % approvedTestimonials.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [approvedTestimonials.length]);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % approvedTestimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + approvedTestimonials.length) % approvedTestimonials.length);
  };

  // Form setup
  const form = useForm<InsertTestimonial>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      customerName: "",
      customerLocation: "",
      content: "",
      rating: 5,
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: InsertTestimonial) => {
      // Basic sanitization
      const sanitized = {
        ...data,
        customerName: data.customerName.replace(/[^a-zA-Z0-9 .,'-]/g, ""),
        customerLocation: data.customerLocation?.replace(/[^a-zA-Z0-9 .,'-]/g, ""),
        content: data.content.replace(/<[^>]*>?/gm, ""),
        rating: Math.max(1, Math.min(5, data.rating ?? 5)),
      };
      const response = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sanitized),
      });
      if (!response.ok) throw new Error("Failed to submit review");
      return response.json();
    },
    onSuccess: () => {
      setIsSubmitted(true);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/testimonials"] });
    },
  });

  const onSubmit = (data: InsertTestimonial) => {
    submitMutation.mutate(data);
  };

  // --- Loading state ---
  if (isLoading) {
    return (
      <section className="py-20 bg-gradient-to-r from-fast-blue to-fast-blue-dark">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-fastblue mb-4">What Our Clients Say</h2>
            <p className="text-xl text-fastbluelight">Trusted by businesses across Dubai and Africa</p>
          </div>
          <div className="flex justify-center">
            <div className="animate-pulse bg-fastblue rounded-2xl h-64 w-full max-w-4xl"></div>
          </div>
        </div>
        {/* Write Review Button and Modal will be rendered below */}
        <WriteReviewDialog
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
          isSubmitted={isSubmitted}
          setIsSubmitted={setIsSubmitted}
          form={form}
          submitMutation={submitMutation}
          onSubmit={onSubmit}
        />
      </section>
    );
  }

  // --- Empty state ---
  if (approvedTestimonials.length === 0) {
    return (
      <section className="py-20 bg-gradient-to-r from-fast-blue to-fast-blue-dark">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-fastblue mb-4">What Our Clients Say</h2>
            <p className="text-xl text-fastbluelight">Trusted by businesses across Dubai and Africa</p>
          </div>
          <Card className="max-w-4xl mx-auto w-full">
            <CardContent className="p-8 text-center">
              <p className="text-gray-600">No testimonials available at the moment.</p>
            </CardContent>
          </Card>
        </div>
        {/* Write Review Button and Modal will be rendered below */}
        <div className="flex justify-center mt-12">
          <WriteReviewDialog
            isDialogOpen={isDialogOpen}
            setIsDialogOpen={setIsDialogOpen}
            isSubmitted={isSubmitted}
            setIsSubmitted={setIsSubmitted}
            form={form}
            submitMutation={submitMutation}
            onSubmit={onSubmit}
          />
        </div>
      </section>
    );
  }

  // --- Main carousel state ---
  const currentTestimonial = approvedTestimonials[currentIndex];

  return (
    <section className="py-20 bg-gradient-to-r from-fast-blue to-fast-blue-dark">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-fastblue mb-4">What Our Clients Say</h2>
          <p className="text-xl text-fastbluelight">Trusted by businesses across Dubai and Africa</p>
        </div>
        <div className="relative">
          {/* Only render the testimonial card if currentTestimonial exists */}
          {currentTestimonial ? (
            <Card className="max-w-4xl mx-auto">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <Quote className="h-12 w-12 text-fast-blue/20 mx-auto" />
                </div>
                
                <blockquote className="text-lg text-gray-700 mb-8 leading-relaxed">
                  {`"${currentTestimonial.content}"`}
                </blockquote>
                
                <div className="flex items-center justify-center space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={``} />
                    <AvatarFallback className="bg-fast-blue text-white">
                      {currentTestimonial.customerName
                        ? currentTestimonial.customerName.split(' ').map(n => n[0]).join('')
                        : ''}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">{currentTestimonial.customerName}</div>
                    {currentTestimonial.customerLocation && (
                      <div className="text-sm text-gray-500">{currentTestimonial.customerLocation}</div>
                    )}
                    {currentTestimonial.rating && (
                      <div className="flex items-center mt-1">
                        {[...Array(currentTestimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {approvedTestimonials.length > 1 && (
            <>
              {/* Navigation buttons */}
              <Button
                variant="ghost"
                size="icon"
                onClick={prevTestimonial}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white text-fast-blue shadow-lg"
              >
                <ChevronLeft className="h-6 w-6 text-black" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={nextTestimonial}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white text-fast-blue shadow-lg"
              >
                <ChevronRight className="h-6 w-6 text-black" />
              </Button>

              {/* Indicators */}
              <div className="flex justify-center mt-8 space-x-2">
                {approvedTestimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentIndex ? 'bg-white' : 'bg-white/50 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
        <div className="flex justify-center mt-12">
          <WriteReviewDialog
            isDialogOpen={isDialogOpen}
            setIsDialogOpen={setIsDialogOpen}
            isSubmitted={isSubmitted}
            setIsSubmitted={setIsSubmitted}
            form={form}
            submitMutation={submitMutation}
            onSubmit={onSubmit}
          />
        </div>
      </div>
    </section>
  );
}

// --- Helper component for Write Review Dialog ---
function WriteReviewDialog({
  isDialogOpen,
  setIsDialogOpen,
  isSubmitted,
  setIsSubmitted,
  form,
  submitMutation,
  onSubmit,
}: any) {
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-fast-blue hover:bg-fast-blue-dark px-8 py-3 text-lg font-semibold rounded-lg shadow-lg">
          Write A Review About Us
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md w-full max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Share Your Experience</DialogTitle>
        </DialogHeader>
        {isSubmitted ? (
          <div className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-16 w-16 text-green-600 mb-4" />
            <h2 className="text-xl font-bold mb-2 text-gray-900">Thank you for your review!</h2>
            <p className="text-gray-600 mb-4 text-center">
              Your testimonial has been submitted and will be visible once approved by our team.
            </p>
            <Button onClick={() => { setIsSubmitted(false); setIsDialogOpen(false); }}>
              Close
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Full Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="customerLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="City, Country" {...field} value={field.value ?? ""} />
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
                    <FormLabel>Your Review *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Share your experience with us..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating *</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        {[1,2,3,4,5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            className={`focus:outline-none bg-transparent border-none ${(field.value ?? 0) >= star ? "text-yellow-400" : "text-gray-300"} hover:scale-110 transition-transform`}
                            onClick={() => form.setValue("rating", star)}
                            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                          >
                            <Star className="h-6 w-6" />
                          </button>
                        ))}
                      </div>
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
                  <>Submitting...</>
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    Submit Review
                  </>
                )}
              </Button>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}

