import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AdminLayout from "@/components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Settings, Save, Globe, Search } from "lucide-react";
import { insertSeoSettingsSchema, type InsertSeoSettings, type SeoSettings } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

const pages = [
  { value: "home", label: "Home Page", description: "Main landing page" },
  { value: "about", label: "About Us", description: "Company information page" },
  { value: "services", label: "Services", description: "Services overview page" },
  { value: "blog", label: "Blog", description: "Blog listing page" },
  { value: "cargo-tracking", label: "Cargo Tracking", description: "Cargo tracking page" },
  { value: "branches", label: "Branches", description: "Branch locations page" },
  { value: "contact", label: "Contact Us", description: "Contact information page" },
  { value: "faq", label: "FAQ", description: "Frequently asked questions page" },
];

export default function SeoSettings() {
  const [selectedPage, setSelectedPage] = useState("home");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: seoSettings, isLoading } = useQuery({
    queryKey: ["/api/seo", selectedPage],
    queryFn: async () => {
      const response = await fetch(`/api/seo/${selectedPage}`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch SEO settings");
      }
      return response.json();
    },
  });

  const form = useForm<InsertSeoSettings>({
    resolver: zodResolver(insertSeoSettingsSchema),
    defaultValues: {
      page: selectedPage,
      title: "",
      description: "",
      keywords: "",
      ogImage: "",
    },
  });

  // Update form when SEO settings change
  useEffect(() => {
    if (seoSettings) {
      form.reset({
        page: seoSettings.page,
        title: seoSettings.title,
        description: seoSettings.description,
        keywords: seoSettings.keywords || "",
        ogImage: seoSettings.ogImage || "",
      });
    } else {
      form.reset({
        page: selectedPage,
        title: "",
        description: "",
        keywords: "",
        ogImage: "",
      });
    }
  }, [seoSettings, selectedPage, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: InsertSeoSettings) => {
      const response = await apiRequest("PUT", "/api/admin/seo", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/seo", selectedPage] });
      toast({
        title: "SEO settings updated",
        description: "The page SEO settings have been saved successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update SEO settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertSeoSettings) => {
    updateMutation.mutate({ ...data, page: selectedPage });
  };

  const handlePageChange = (page: string) => {
    setSelectedPage(page);
    form.setValue("page", page);
  };

  const selectedPageInfo = pages.find(p => p.value === selectedPage);

  return (
    <AdminLayout
      title="SEO Settings"
      description="Manage meta tags and SEO optimization for each page"
    >
      <div className="space-y-6">
        {/* Page Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="h-5 w-5 mr-2 text-fast-blue" />
              Select Page to Configure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {pages.map((page) => (
                <Button
                  key={page.value}
                  variant={selectedPage === page.value ? "default" : "outline"}
                  className={`p-4 h-auto flex flex-col items-start text-left ${
                    selectedPage === page.value 
                      ? "bg-fast-blue text-white" 
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => handlePageChange(page.value)}
                >
                  <span className="font-medium">{page.label}</span>
                  <span className={`text-xs mt-1 ${
                    selectedPage === page.value ? "text-blue-100" : "text-gray-500"
                  }`}>
                    {page.description}
                  </span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* SEO Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2 text-fast-blue" />
              SEO Settings for {selectedPageInfo?.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Title *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter page title (recommended: 50-60 characters)"
                            {...field}
                          />
                        </FormControl>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>This title appears in search results and browser tabs</span>
                          <span>{field.value?.length || 0}/60</span>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Description *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter page description (recommended: 150-160 characters)"
                            className="h-20"
                            {...field}
                          />
                        </FormControl>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>This description appears in search results</span>
                          <span>{field.value?.length || 0}/160</span>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="keywords"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Keywords</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter keywords separated by commas (e.g., logistics, shipping, freight)"
                            className="h-16"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <div className="text-xs text-gray-500">
                          Enter relevant keywords that describe this page's content
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ogImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Open Graph Image URL</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://example.com/image.jpg"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <div className="text-xs text-gray-500">
                          Image that appears when this page is shared on social media (recommended: 1200x630px)
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={updateMutation.isPending}
                      className="bg-fast-blue hover:bg-fast-blue-dark"
                    >
                      {updateMutation.isPending ? (
                        <>Saving...</>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save SEO Settings
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>

        {/* SEO Preview */}
        {form.watch("title") && form.watch("description") && (
          <Card>
            <CardHeader>
              <CardTitle>Search Engine Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="space-y-1">
                  <div className="text-blue-600 text-lg hover:underline cursor-pointer">
                    {form.watch("title")}
                  </div>
                  <div className="text-green-700 text-sm">
                    https://fastcfs.com/{selectedPage === "home" ? "" : selectedPage}
                  </div>
                  <div className="text-gray-700 text-sm">
                    {form.watch("description")}
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                This is how your page might appear in Google search results
              </div>
            </CardContent>
          </Card>
        )}

        {/* SEO Tips */}
        <Card>
          <CardHeader>
            <CardTitle>SEO Best Practices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Title Optimization</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Keep titles between 50-60 characters</li>
                  <li>• Include primary keywords near the beginning</li>
                  <li>• Make each page title unique</li>
                  <li>• Include your brand name</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Description Optimization</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Keep descriptions between 150-160 characters</li>
                  <li>• Write compelling, action-oriented copy</li>
                  <li>• Include relevant keywords naturally</li>
                  <li>• Accurately describe page content</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Keywords</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Focus on 3-5 primary keywords per page</li>
                  <li>• Use long-tail keywords for better targeting</li>
                  <li>• Research competitor keywords</li>
                  <li>• Include location-based keywords when relevant</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Social Media</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Use high-quality images (1200x630px)</li>
                  <li>• Ensure images are relevant to content</li>
                  <li>• Test social media previews</li>
                  <li>• Include your brand in the image</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
