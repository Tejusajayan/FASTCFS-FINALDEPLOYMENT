import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import type { Faq } from "@shared/schema";
import { Helmet } from "react-helmet-async";
import favi from "@assets/favicon.ico";

export default function FaqPage() {
  const { data: faqs = [], isLoading, isError, error } = useQuery<Faq[]>({
    queryKey: ["/api/faqs"],
    queryFn: async () => {
      const response = await fetch("/api/faqs");
      if (!response.ok) throw new Error("Failed to fetch FAQs");
      const result = await response.json();
      console.log("FAQ API result:", result); // Debug: see what the backend returns
      if (Array.isArray(result)) {
        return result.filter((faq) => faq.isActive !== false); // Only show active FAQs
      }
      if (Array.isArray(result.faqs)) {
        return result.faqs.filter((faq: Faq) => faq.isActive !== false);
      }
      return [];
    },
    // onError removed; handle errors via isError and error from useQuery
  });

  const { data: seo } = useQuery({
    queryKey: ["/api/seo", "faq"],
    queryFn: async () => {
      const res = await fetch("/api/seo/faq");
      if (!res.ok) return null;
      return res.json();
    },
  });

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>{seo?.title || "FAQs | FAST CFS"}</title>
        <meta name="description" content={seo?.description || "Quick answers to common logistics questions"} />
        {seo?.keywords && <meta name="keywords" content={seo.keywords} />}
        {seo?.ogImage && <meta property="og:image" content={seo.ogImage} />}
        <meta property="og:title" content={seo?.title || "FAQs | FAST CFS"} />
        <meta property="og:description" content={seo?.description || "Quick answers to common logistics questions"} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://fastcfs.com/faq" />
        <link rel="icon" type="image/x-icon" href={favi} />
      </Helmet>
      <Header />
      <div className="pt-16">
        <section className="bg-fastblue py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
            <div className="text-center mb-12 text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Frequently Asked Questions
              </h1>
              <p className="text-xl text-africangold max-w-3xl mx-auto">
                Quick answers to common logistics questions
              </p>
            </div>
          </div>
        </section>
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="">
              <div className="space-y-6">
              {isLoading ? (
                <div className="text-center text-gray-500">Loading...</div>
              ) : isError ? (
                <div className="text-center text-red-500">
                  Error loading FAQs:{" "}
                  {error instanceof Error ? error.message : "Unknown error"}
                </div>
              ) : faqs.length === 0 ? (
                <div className="text-center text-gray-500">
                  No FAQs available.
                </div>
              ) : (
                faqs.map((faq) => (
                  <Card key={faq.id} className="mx-auto w-full max-w-4xl">
                    <CardContent className="p-6 flex flex-col w-full">
                      <h3 className="font-semibold text-gray-900 mb-2 w-full">
                        {faq.question}
                      </h3>
                      <div
                        className="text-gray-600 w-full"
                        style={{
                          width: "100%",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "stretch",
                        }}
                        dangerouslySetInnerHTML={{ __html: faq.answer }}
                      />
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
