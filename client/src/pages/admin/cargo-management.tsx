import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AdminLayout from "@/components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Package, Plus, Download, Edit, Search, Plane, MapPin, Calendar, Truck } from "lucide-react";
import { insertCargoSchema, type InsertCargo, type Cargo, type CargoStatusHistory, type CargoFlightSegment } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { formatDate } from "@/lib/utils";
import * as XLSX from "xlsx";
import dynamic from "next/dynamic";
import DOMPurify from "dompurify";
import { Helmet } from "react-helmet-async";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const statusOptions = [
  { value: "received", label: "Received" },
  { value: "in_transit", label: "In Transit" },
  { value: "delivered", label: "Delivered" },
  { value: "delayed", label: "Delayed" },
];

export default function CargoManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingCargo, setEditingCargo] = useState<Cargo | null>(null);
  const [openCargoId, setOpenCargoId] = useState<number | null>(null);
  const [statusHistory, setStatusHistory] = useState<CargoStatusHistory[]>([]);
  const [flightSegments, setFlightSegments] = useState<CargoFlightSegment[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isSegmentsLoading, setIsSegmentsLoading] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [newDetails, setNewDetails] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newFlight, setNewFlight] = useState({
    flightNumber: "",
    airline: "",
    departureAirport: "",
    arrivalAirport: "",
    departureTime: "",
    arrivalTime: "",
    pieces: "",
    weight: "",
    volume: "",
    status: "Planned"
  });
  const [editingSegmentId, setEditingSegmentId] = useState<number | null>(null);
  const [cargoDescHtml, setCargoDescHtml] = useState("");
  const [editFormData, setEditFormData] = useState<InsertCargo | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cargoToDelete, setCargoToDelete] = useState<Cargo | null>(null);
  const [localCargo, setLocalCargo] = useState<Cargo[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const importInputRef = useRef<HTMLInputElement>(null);

  const { data: cargoData, isLoading } = useQuery<any, Error>({
    queryKey: ["/api/admin/cargo"],
    queryFn: async () => {
      const response = await fetch("/api/admin/cargo", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch cargo data");
      }
      return response.json();
    }
  });

  // Sync localCargo when cargoData changes
  useEffect(() => {
    setLocalCargo(cargoData?.cargo || []);
  }, [cargoData]);

  const form = useForm<InsertCargo>({
    resolver: zodResolver(insertCargoSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      salesRepName: "",
      cargoDescription: "",
      status: "received",
      origin: "",
      destination: "",
      weight: "",
      dimensions: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertCargo) => {
      const response = await apiRequest("POST", "/api/admin/cargo", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cargo"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Cargo created successfully",
        description: "New cargo entry has been added to the system.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create cargo",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      const response = await apiRequest("PUT", `/api/admin/cargo/${id}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cargo"] });
      toast({
        title: "Status updated",
        description: "Cargo status has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update status",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });

  const updateCargoMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<InsertCargo> }) => {
      const response = await apiRequest("PUT", `/api/admin/cargo/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cargo"] });
      setEditDialogOpen(false);
      setEditingCargo(null);
      toast({
        title: "Cargo updated successfully",
        description: "Cargo details have been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update cargo",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });

  const deleteCargoMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/cargo/${id}`);
      if (!response.ok) {
        let message = "Failed to delete cargo";
        try {
          const data = await response.json();
          message = data?.message || message;
        } catch {
          message = response.statusText || message;
        }
        throw new Error(message);
      }
      return id;
    },
    onSuccess: (deletedId: number) => {
      // Remove from local state immediately
      setLocalCargo(prev => prev.filter(c => c.id !== deletedId));
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cargo"] });
      setDeleteDialogOpen(false);
      setCargoToDelete(null);
      toast({
        title: "Cargo deleted",
        description: "Cargo and related records have been deleted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Utility to strip HTML tags
  function stripHtmlTags(html: string): string {
    if (!html) return "";
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  }

  const handleExportExcel = async () => {
    try {
      // Fetch the latest cargo data
      const response = await fetch("/api/admin/cargo", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Export failed");
      }
      const data = await response.json();
      const cargoList = data?.cargo || [];

      // Only include required fields and strip HTML from cargoDescription
      const exportData = cargoList.map((cargo: any) => ({
        trackingNumber: cargo.trackingNumber,
        customerName: cargo.customerName,
        customerPhone: cargo.customerPhone,
        salesRepName: cargo.salesRepName,
        cargoDescription: stripHtmlTags(cargo.cargoDescription),
        status: cargo.status,
        origin: cargo.origin,
        destination: cargo.destination,
        weight: cargo.weight,
        dimensions: cargo.dimensions,
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Cargo");
      XLSX.writeFile(workbook, `cargo-export-${new Date().toISOString().split('T')[0]}.xlsx`);

      toast({
        title: "Export successful",
        description: "Cargo data has been exported to Excel (.xlsx).",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export cargo data.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = (data: InsertCargo) => {
    createMutation.mutate(data);
  };

  const handleStatusChange = (cargoId: number, newStatus: string) => {
    updateStatusMutation.mutate({ id: cargoId, status: newStatus });
  };

  const handleImportButtonClick = () => {
    if (importInputRef.current) {
      importInputRef.current.value = ""; // reset input so same file can be selected again
      importInputRef.current.click();
    }
  };

  const handleImport = async (file: File) => {
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        // Send the parsed data to the backend
        const response = await apiRequest("POST", "/api/admin/cargo/import", jsonData);
        if (response.ok) {
          toast({
            title: "Import successful",
            description: "Cargo data has been imported successfully.",
          });
          queryClient.invalidateQueries({ queryKey: ["/api/admin/cargo"] });
        } else {
          throw new Error("Failed to import cargo data");
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      toast({
        title: "Import failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const cargo = localCargo;
  const filteredCargo = cargo.filter((item: Cargo) =>
    item.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.cargoDescription.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received': return 'bg-yellow-100 text-yellow-800';
      case 'in_transit': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'delayed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Fetch status history and flight segments for a cargo
  const fetchCargoDetails = async (cargoId: number) => {
    setIsHistoryLoading(true);
    setIsSegmentsLoading(true);
    try {
      const [historyRes, segmentsRes] = await Promise.all([
        fetch(`/api/admin/cargo/${cargoId}/status-history`, { credentials: "include" }),
        fetch(`/api/admin/cargo/${cargoId}/flight-segments`, { credentials: "include" })
      ]);
      let history: CargoStatusHistory[] = [];
      let segments: CargoFlightSegment[] = [];
      try {
        history = historyRes.ok ? await historyRes.json() : [];
      } catch {
        history = [];
      }
      try {
        segments = segmentsRes.ok ? await segmentsRes.json() : [];
      } catch {
        segments = [];
      }
      setStatusHistory(history);
      setFlightSegments(segments);
    } catch (error) {
      setStatusHistory([]);
      setFlightSegments([]);
    }
    setIsHistoryLoading(false);
    setIsSegmentsLoading(false);
  };

  // Add status history entry
  const addStatusHistory = async (cargoId: number) => {
    const res = await fetch(`/api/admin/cargo/${cargoId}/status-history`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status: newStatus, details: newDetails, location: newLocation })
    });
    if (res.ok) {
      setNewStatus(""); setNewDetails(""); setNewLocation("");
      fetchCargoDetails(cargoId);
      toast({ title: "Status updated" });
    }
  };
  // Add flight segment
  const addFlightSegment = async (cargoId: number) => {
    // Only check for empty values
    if (!newFlight.departureTime || !newFlight.arrivalTime) {
      toast({
        title: "Invalid input",
        description: "Please select Departure and Arrival Time.",
        variant: "destructive",
      });
      return;
    }
    const body = {
      ...newFlight,
      cargoId,
      // No need to fix format, backend will handle it
    };
    const res = await fetch(`/api/admin/cargo/${cargoId}/flight-segments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body)
    });
    if (res.ok) {
      setNewFlight({
        flightNumber: "",
        airline: "",
        departureAirport: "",
        arrivalAirport: "",
        departureTime: "",
        arrivalTime: "",
        pieces: "",
        weight: "",
        volume: "",
        status: "Planned"
      });
      fetchCargoDetails(cargoId);
      toast({ title: "Flight segment added" });
    } else {
      const error = await res.json().catch(() => ({}));
      toast({
        title: "Failed to add flight segment",
        description: error.message || "Invalid input. Please check your data.",
        variant: "destructive",
      });
    }
  };

  // Populate form for editing
  const handleEditSegment = (segment: CargoFlightSegment) => {
    setEditingSegmentId(segment.id);
    setNewFlight({
      flightNumber: segment.flightNumber || "",
      airline: segment.airline || "",
      departureAirport: segment.departureAirport || "",
      arrivalAirport: segment.arrivalAirport || "",
      departureTime: segment.departureTime ? new Date(segment.departureTime).toISOString().slice(0,16) : "",
      arrivalTime: segment.arrivalTime ? new Date(segment.arrivalTime).toISOString().slice(0,16) : "",
      pieces: segment.pieces || "",
      weight: segment.weight || "",
      volume: segment.volume || "",
      status: segment.status || "Planned"
    });
  };

  // Update flight segment
  const updateFlightSegment = async (cargoId: number, segmentId: number) => {
    if (!newFlight.departureTime || !newFlight.arrivalTime) {
      toast({
        title: "Invalid input",
        description: "Please select Departure and Arrival Time.",
        variant: "destructive",
      });
      return;
    }
    const body = {
      ...newFlight,
      cargoId,
    };
    const res = await fetch(`/api/admin/cargo/${cargoId}/flight-segments/${segmentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body)
    });
    if (res.ok) {
      setNewFlight({
        flightNumber: "",
        airline: "",
        departureAirport: "",
        arrivalAirport: "",
        departureTime: "",
        arrivalTime: "",
        pieces: "",
        weight: "",
        volume: "",
        status: "Planned"
      });
      setEditingSegmentId(null);
      fetchCargoDetails(cargoId);
      toast({ title: "Flight segment updated" });
    } else {
      const error = await res.json().catch(() => ({}));
      toast({
        title: "Failed to update flight segment",
        description: error.message || "Invalid input. Please check your data.",
        variant: "destructive",
      });
    }
  };

  // Open edit dialog and populate form data
  const handleEditCargo = (cargo: Cargo) => {
    setEditingCargo(cargo);
    setEditFormData({
      customerName: cargo.customerName,
      customerPhone: cargo.customerPhone,
      salesRepName: cargo.salesRepName,
      cargoDescription: cargo.cargoDescription,
      status: cargo.status,
      origin: cargo.origin || "",
      destination: cargo.destination || "",
      weight: cargo.weight || "",
      dimensions: cargo.dimensions || "",
    });
    setEditDialogOpen(true);
  };

  return (
    <>
      <Helmet>
        <link rel="icon" type="image/x-icon" href="/src/assets/favicon.ico" />
      </Helmet>
      <AdminLayout
        title="Cargo Management"
        description="Manage cargo entries and track shipments"
      >
        <div className="space-y-6">
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-fast-blue hover:bg-fast-blue-dark">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Cargo
                  </Button>
                </DialogTrigger>
                {/* Reduce height and make scrollable */}
                <DialogContent className="max-w-2xl max-h-[70vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Cargo Entry</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="customerName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Customer Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter customer name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="customerPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Customer Phone *</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter phone number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="salesRepName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sales Representative *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter sales rep name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="cargoDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cargo Description *</FormLabel>
                            <FormControl>
                              {/* Rich text editor for cargo description */}
                              <ReactQuill
                                value={cargoDescHtml}
                                onChange={value => {
                                  setCargoDescHtml(value);
                                  field.onChange(value);
                                }}
                                theme="snow"
                                style={{ minHeight: 120 }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="origin"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Origin</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter origin location" {...field} value={field.value ?? ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="destination"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Destination</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter destination" {...field} value={field.value ?? ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="weight"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Weight</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., 100 kg" {...field} value={field.value ?? ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="dimensions"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Dimensions</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., 2m x 1m x 1m" {...field} value={field.value ?? ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsCreateDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={createMutation.isPending}
                          className="bg-fast-blue hover:bg-fast-blue-dark"
                        >
                          {createMutation.isPending ? "Creating..." : "Create Cargo"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>

              <Button variant="outline" onClick={handleExportExcel}>
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </Button>

              <Button variant="outline" onClick={handleImportButtonClick}>
                <Plus className="h-4 w-4 mr-2" />
                Import
              </Button>
              <input
                ref={importInputRef}
                type="file"
                accept=".xlsx"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImport(file);
                  }
                }}
              />
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search cargo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>

          {/* Cargo Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2 text-fast-blue" />
                Cargo Entries ({filteredCargo.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : filteredCargo.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {searchTerm ? "No cargo matching your search" : "No cargo entries yet"}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tracking Number</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCargo.map((cargo: Cargo) => (
                        <TableRow key={cargo.id}>
                          <TableCell className="font-mono text-sm">
                            {cargo.trackingNumber}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{cargo.customerName}</p>
                              <p className="text-sm text-gray-500">{cargo.customerPhone}</p>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-48">
                            {/* Render description as HTML */}
                            <div
                              className="line-clamp-2 prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(cargo.cargoDescription || "") }}
                            />
                          </TableCell>
                          <TableCell>
                            <Select
                              value={cargo.status}
                              onValueChange={(value) => handleStatusChange(cargo.id, value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue>
                                  <Badge className={getStatusColor(cargo.status)}>
                                    {cargo.status.replace('_', ' ')}
                                  </Badge>
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {statusOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>{formatDate(cargo.createdAt ?? "")}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => {
                                setOpenCargoId(cargo.id);
                                fetchCargoDetails(cargo.id);
                              }}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              {/* Edit customer/cargo details button */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditCargo(cargo)}
                              >
                                Edit Details
                              </Button>
                              {/* Delete Button */}
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  setCargoToDelete(cargo);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status/Flight Dialog */}
          <Dialog open={!!openCargoId} onOpenChange={v => { if (!v) setOpenCargoId(null); }}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Cargo Tracking Details</DialogTitle>
              </DialogHeader>
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Status History</h3>
                {isHistoryLoading ? <div>Loading...</div> : (
                  <ol className="relative border-l border-gray-300">
                    {statusHistory.map(entry => (
                      <li key={entry.id} className="mb-4 ml-4">
                        <div className="absolute w-3 h-3 bg-fastblue rounded-full -left-1.5 border border-white"></div>
                        <div className="flex flex-col md:flex-row md:items-center md:gap-4">
                          <span className="font-medium text-fastblue">{entry.timestamp ? new Date(entry.timestamp).toLocaleString() : "-"}</span>
                          <span className="text-gray-700">{entry.status}</span>
                          {entry.location && <span className="text-gray-500 text-xs">{entry.location}</span>}
                          {entry.details && <span className="text-gray-500 text-xs">{entry.details}</span>}
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
                <div className="flex flex-col gap-2 mt-4">
                  <div className="flex gap-2">
                    <Input placeholder="Status" value={newStatus} onChange={e => setNewStatus(e.target.value)} />
                    <Input placeholder="Location" value={newLocation} onChange={e => setNewLocation(e.target.value)} />
                    <Input placeholder="Details" value={newDetails} onChange={e => setNewDetails(e.target.value)} />
                  </div>
                  <div className="flex justify-center mt-2">
                    <Button onClick={() => openCargoId && addStatusHistory(openCargoId)} size="sm" className="px-6">
                      Add
                    </Button>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Flight Segments</h3>
                {isSegmentsLoading ? <div>Loading...</div> : (
                  <ol className="flex flex-col gap-3 mb-4">
                    {flightSegments.map(seg => (
                      <li
                        key={seg.id}
                        className="w-full bg-white border border-gray-200 rounded-lg p-3 shadow-sm"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-2 text-sm">
                          <div>
                            <span className="font-semibold text-fastblue">{seg.flightNumber}</span>
                            <span className="ml-2 text-xs text-gray-500">{seg.airline}</span>
                          </div>
                          <div>
                            <b>From:</b> {seg.departureAirport}
                            <span className="text-xs text-gray-500 ml-2">{new Date(seg.departureTime).toLocaleString()}</span>
                          </div>
                          <div>
                            <b>To:</b> {seg.arrivalAirport}
                            <span className="text-xs text-gray-500 ml-2">{new Date(seg.arrivalTime).toLocaleString()}</span>
                          </div>
                          <div>
                            <b>Status:</b> {seg.status}
                          </div>
                          <div>
                            <b>Weight:</b> {seg.weight || "-"}
                          </div>
                          <div>
                            <b>Volume:</b> {seg.volume || "-"}
                          </div>
                          <div className="md:col-span-3">
                            <b>Pieces:</b>
                            <div className="bg-gray-50 border rounded p-2 mt-1 whitespace-pre-line text-xs">
                              {seg.pieces || "-"}
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditSegment(seg)}
                          >
                            Edit
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
                {/* Flight Segment Input Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mt-2">
                  <Input
                    placeholder="Flight Number"
                    value={newFlight.flightNumber}
                    onChange={e => setNewFlight(f => ({ ...f, flightNumber: e.target.value }))}
                    className="text-sm py-1 px-2"
                  />
                  <Input
                    placeholder="Airline"
                    value={newFlight.airline}
                    onChange={e => setNewFlight(f => ({ ...f, airline: e.target.value }))}
                    className="text-sm py-1 px-2"
                  />
                  <Input
                    placeholder="Departure Airport"
                    value={newFlight.departureAirport}
                    onChange={e => setNewFlight(f => ({ ...f, departureAirport: e.target.value }))}
                    className="text-sm py-1 px-2"
                  />
                  <Input
                    type="datetime-local"
                    value={newFlight.departureTime}
                    onChange={e => setNewFlight(f => ({ ...f, departureTime: e.target.value }))}
                    className="min-w-[120px] text-sm py-1 px-2"
                    title="Departure Time"
                  />
                  <Input
                    placeholder="Arrival Airport"
                    value={newFlight.arrivalAirport}
                    onChange={e => setNewFlight(f => ({ ...f, arrivalAirport: e.target.value }))}
                    className="text-sm py-1 px-2"
                  />
                  <Input
                    type="datetime-local"
                    value={newFlight.arrivalTime}
                    onChange={e => setNewFlight(f => ({ ...f, arrivalTime: e.target.value }))}
                    className="min-w-[120px] text-sm py-1 px-2"
                    title="Arrival Time"
                  />
                  <Input
                    placeholder="Weight"
                    value={newFlight.weight}
                    onChange={e => setNewFlight(f => ({ ...f, weight: e.target.value }))}
                    className="text-sm py-1 px-2"
                  />
                  <Input
                    placeholder="Volume"
                    value={newFlight.volume}
                    onChange={e => setNewFlight(f => ({ ...f, volume: e.target.value }))}
                    className="text-sm py-1 px-2"
                  />
                  <Input
                    placeholder="Status"
                    value={newFlight.status}
                    onChange={e => setNewFlight(f => ({ ...f, status: e.target.value }))}
                    className="text-sm py-1 px-2"
                  />
                  <div className="md:col-span-4">
                    <Textarea
                      placeholder="Pieces (detailed cargo report)"
                      value={newFlight.pieces}
                      onChange={e => setNewFlight(f => ({ ...f, pieces: e.target.value }))}
                      rows={2}
                      className="text-sm py-1 px-2 mt-2"
                    />
                  </div>
                  <div className="md:col-span-4 flex justify-center mt-2">
                    <Button
                      onClick={() =>
                        openCargoId &&
                        (editingSegmentId
                          ? updateFlightSegment(openCargoId, editingSegmentId)
                          : addFlightSegment(openCargoId))
                      }
                      size="sm"
                      className="px-6"
                    >
                      {editingSegmentId ? "Update Flight Segment" : "Add Flight Segment"}
                    </Button>
                    {editingSegmentId && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingSegmentId(null);
                          setNewFlight({
                            flightNumber: "",
                            airline: "",
                            departureAirport: "",
                            arrivalAirport: "",
                            departureTime: "",
                            arrivalTime: "",
                            pieces: "",
                            weight: "",
                            volume: "",
                            status: "Planned"
                          });
                        }}
                        className="ml-2"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Cargo/Customer Details Dialog */}
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="max-w-xl max-h-[95vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Cargo & Customer Details</DialogTitle>
              </DialogHeader>
              {editFormData && editingCargo && (
                <form
                  className="space-y-4"
                  onSubmit={e => {
                    e.preventDefault();
                    updateCargoMutation.mutate({ id: editingCargo.id, data: editFormData });
                  }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Customer Name</label>
                      <Input
                        value={editFormData.customerName}
                        onChange={e => setEditFormData(f => f ? { ...f, customerName: e.target.value } : f)}
                        placeholder="Customer Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Customer Phone</label>
                      <Input
                        value={editFormData.customerPhone}
                        onChange={e => setEditFormData(f => f ? { ...f, customerPhone: e.target.value } : f)}
                        placeholder="Customer Phone"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Sales Rep Name</label>
                    <Input
                      value={editFormData.salesRepName}
                      onChange={e => setEditFormData(f => f ? { ...f, salesRepName: e.target.value } : f)}
                      placeholder="Sales Rep Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Cargo Description</label>
                    {/* Use ReactQuill for editing cargo description */}
                    <ReactQuill
                      value={editFormData.cargoDescription}
                      onChange={value => setEditFormData(f => f ? { ...f, cargoDescription: value } : f)}
                      theme="snow"
                      style={{ minHeight: 120 }}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Origin</label>
                      <Input
                        value={editFormData.origin ?? ""}
                        onChange={e => setEditFormData(f => f ? { ...f, origin: e.target.value } : f)}
                        placeholder="Origin"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Destination</label>
                      <Input
                        value={editFormData.destination ?? ""}
                        onChange={e => setEditFormData(f => f ? { ...f, destination: e.target.value } : f)}
                        placeholder="Destination"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Weight</label>
                      <Input
                        value={editFormData.weight ?? ""}
                        onChange={e => setEditFormData(f => f ? { ...f, weight: e.target.value } : f)}
                        placeholder="Weight"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Dimensions</label>
                      <Input
                        value={editFormData.dimensions ?? ""}
                        onChange={e => setEditFormData(f => f ? { ...f, dimensions: e.target.value } : f)}
                        placeholder="Dimensions"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-fast-blue hover:bg-fast-blue-dark" disabled={updateCargoMutation.isPending}>
                      {updateCargoMutation.isPending ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </form>
              )}
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Cargo</DialogTitle>
              </DialogHeader>
              <div>
                Are you sure you want to delete cargo record <b>{cargoToDelete?.trackingNumber}</b>?<br />
                This will also delete all related records.
              </div>
              <div className="flex justify-end mt-4 gap-2">
                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (cargoToDelete) {
                      deleteCargoMutation.mutate(cargoToDelete.id);
                    }
                  }}
                  disabled={deleteCargoMutation.isPending}
                >
                  {deleteCargoMutation.isPending ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </AdminLayout>
    </>
  );
}