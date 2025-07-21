import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert} from "@/components/ui/alert";
import { Package, AlertCircle, CheckCircle } from "lucide-react";
import { validateTrackingNumber } from "@/lib/utils";
import type { Cargo, CargoFlightSegment, CargoStatusHistory } from "@shared/schema";
import DOMPurify from "dompurify";
import { Helmet } from "react-helmet-async";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function CargoTrackingPage() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [submittedTrackingNumber, setSubmittedTrackingNumber] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);

  // Get tracking number from URL params if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
      setTrackingNumber(q);
      setSubmittedTrackingNumber(q);
    }
  }, []);

  const { data, isLoading, error, refetch } = useQuery<{
    cargo: Cargo;
    flightSegments: CargoFlightSegment[];
    statusHistory: CargoStatusHistory[];
  }>({
    queryKey: ["/api/cargo/track", submittedTrackingNumber],
    enabled: !!submittedTrackingNumber && validateTrackingNumber(submittedTrackingNumber),
    async queryFn() {
      const response = await fetch(`/api/cargo/track/${submittedTrackingNumber}`);
      if (!response.ok) {
        throw new Error("Cargo not found. Please check your tracking number and try again.");
      }
      return response.json();
    },
    refetchInterval: 10000, // Poll every 10s for real-time updates
  });
  const cargo = data?.cargo;
  const flightSegments = data?.flightSegments || [];
  const statusHistory = data?.statusHistory || [];

  const { data: seo } = useQuery({
    queryKey: ["/api/seo", "cargo-tracking"],
    queryFn: async () => {
      const res = await fetch("/api/seo/cargo-tracking");
      if (!res.ok) return null;
      return res.json();
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      setSubmittedTrackingNumber(trackingNumber.trim());
    }
  };

  const handleDownloadPdf = async () => {
    if (!cardRef.current) return;
    // Capture the card as an image
    const canvas = await html2canvas(cardRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });
    // Calculate image dimensions for A4
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth - 40;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 20, 20, imgWidth, imgHeight);
    pdf.save(`Tracking_${cargo?.trackingNumber || "shipment"}.pdf`);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'received':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_transit':
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'delayed':
      case 'issue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'delayed':
      case 'issue':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>{seo?.title || "Track Your Air Cargo | FAST CFS"}</title>
        <meta name="description" content={seo?.description || "Get real-time updates on your air shipment status and location"} />
        {seo?.keywords && <meta name="keywords" content={seo.keywords} />}
        {seo?.ogImage && <meta property="og:image" content={seo.ogImage} />}
        <meta property="og:title" content={seo?.title || "Track Your Air Cargo | FAST CFS"} />
        <meta property="og:description" content={seo?.description || "Get real-time updates on your air shipment status and location"} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://fastcfs.com/cargo-tracking" />
        <link rel="icon" type="image/x-icon" href="/src/assets/favicon.ico" />
      </Helmet>
      <Header />
      <div className="pt-16">
        {/* Hero Section */}
        <section className="bg-fastblue py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Track Your Air Cargo
            </h1>
            <p className="text-xl text-africangold mb-8">
              Get real-time updates on your air shipment status and location
            </p>
            <Card className="shadow-xl">
              <CardContent className="p-8">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                  <input
                    type="text"
                    className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-lg"
                    placeholder="Enter your Tracking Number (e.g., 21072508223122)"
                    value={trackingNumber}
                    onChange={e => setTrackingNumber(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="bg-fastblue text-white px-6 py-2 rounded-md font-semibold hover:bg-fastblue-dark"
                  >
                    Track
                  </button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
        {/* Results Section */}
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {submittedTrackingNumber && !validateTrackingNumber(submittedTrackingNumber) && (
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4 mt-1" />
                <p className="mt-0">Invalid tracking number format. Please check and try again.</p>
              </Alert>
            )}
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                {error.message}
              </Alert>
            )}
            {cargo && (
              <>
                {/* Download PDF Button */}
                {validateTrackingNumber(submittedTrackingNumber) && (
                  <div className="flex justify-end mb-4">
                    <button
                      className="bg-fastblue text-white px-4 py-2 rounded-md font-semibold hover:bg-fastblue-dark"
                      onClick={handleDownloadPdf}
                    >
                      Download PDF
                    </button>
                  </div>
                )}
                <div ref={cardRef}>
                  <Card className="shadow-lg">
                    <CardHeader>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <h2 className="text-2xl font-bold mb-1">Your shipment is {cargo.status}</h2>
                          {/* Add customer name and cargo description */}
                          <div className="text-gray-800 mb-2">
                            <span className="font-semibold">Customer:</span> {cargo.customerName}
                          </div>
                          <div className="text-gray-700 mb-2">
                            <span className="font-semibold">Description:</span>
                            <div
                              className="prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(cargo.cargoDescription || "") }}
                            />
                          </div>
                          <div className="flex flex-wrap gap-4 text-gray-600 text-sm">
                            <span><b>Origin:</b> {cargo.origin}</span>
                            <span><b>Destination:</b> {cargo.destination}</span>
                            <span><b>Dimension:</b> {cargo.dimensions || "-"}</span>
                            <span><b>Weight:</b> {cargo.weight || "-"}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-center">
                          <Package className="h-12 w-12 text-fastblue mb-2" />
                          <span className="text-xs text-gray-500">Tracking #: {cargo.trackingNumber}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Flight Segments */}
                      {flightSegments.length > 0 && (
                        <div className="mb-8">
                          {flightSegments.map((seg, idx) => (
                            <div
                              key={seg.id}
                              className="rounded-lg mb-4 bg-white border border-gray-200 shadow-sm px-4 py-3"
                            >
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-2 text-sm">
                                <div>
                                  <span className="font-bold text-fastblue">{seg.flightNumber}</span>
                                  <span className="ml-2 text-xs text-gray-500">{seg.airline}</span>
                                </div>
                                <div>
                                  <span className="font-semibold">Departure:</span> {seg.departureAirport}
                                  {seg.departureTime && (
                                    <span className="text-gray-500 ml-1">
                                      {new Date(seg.departureTime).toLocaleString()}
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <span className="font-semibold">Arrival:</span> {seg.arrivalAirport}
                                  {seg.arrivalTime && (
                                    <span className="text-gray-500 ml-1">
                                      {new Date(seg.arrivalTime).toLocaleString()}
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <span className="font-semibold">Status:</span> {seg.status}
                                </div>
                                <div>
                                  <span className="font-semibold">Weight:</span> {seg.weight || "-"}
                                </div>
                                <div>
                                  <span className="font-semibold">Volume:</span> {seg.volume || "-"}
                                </div>
                                <div className="md:col-span-3">
                                  <span className="font-semibold">Pieces:</span>
                                  <div className="bg-gray-50 border rounded p-2 mt-1 whitespace-pre-line text-xs">
                                    {seg.pieces || "-"}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Status History Timeline */}
                      {statusHistory.length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-2">History</h3>
                          <ol className="relative border-l border-gray-300">
                            {/* Show oldest first, latest last */}
                            {[...statusHistory].reverse().map((entry, idx) => (
                              <li key={entry.id} className="mb-6 ml-4">
                                <div className="absolute w-3 h-3 bg-fastblue rounded-full -left-1.5 border border-white"></div>
                                <div className="flex flex-col md:flex-row md:items-center md:gap-4">
                                  <span className="text-gray-700">{entry.status}</span>
                                  {entry.location && <span className="text-gray-500 text-xs">{entry.location}</span>}
                                  {entry.details && <span className="text-gray-500 text-xs">{entry.details}</span>}
                                </div>
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
            {/* Help Section */}
            <Card className="mt-8">
              <CardHeader>
                <h3 className="font-semibold">Need Help?</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-2">If you have questions about your shipment or need assistance, please <a href="/contact" className="text-fastblue underline">contact our support team</a>.</p>
                <p className="text-gray-500 text-xs">For the most accurate and up-to-date information, please check back regularly or enable notifications.</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}