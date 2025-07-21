import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AdminLayout from "@/components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Plus, Edit, Trash2, Search, Building } from "lucide-react";
import { insertBranchSchema, type InsertBranch, type Branch } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { formatDate } from "@/lib/utils";

export default function BranchesManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: branchesData = { branches: [], total: 0 }, isLoading } = useQuery<{ branches: Branch[], total: number }>({
    queryKey: ["/api/admin/branches", { page: 1, limit: 50 }],
    queryFn: async (context) => {
        const [url, params] = context.queryKey as [string, { page: number; limit: number }];
        const response = await fetch(`${url}?page=${params.page}&limit=${params.limit}`);
        return response.json();
    },
});

  const branches = Array.isArray(branchesData?.branches) ? branchesData.branches : [];

  const form = useForm<InsertBranch>({
    resolver: zodResolver(insertBranchSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      country: "",
      phone: "",
      email: "",
      incharge: "",
      location: "",
      isMainOffice: false,
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertBranch) => {
      const response = await apiRequest("POST", "/api/admin/branches", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/branches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/branches"] });
      setIsCreateDialogOpen(false);
      setEditingBranch(null);
      form.reset();
      toast({
        title: "Branch created successfully",
        description: "New branch has been added to the network.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create branch",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: InsertBranch) => {
      const response = await apiRequest("PUT", `/api/admin/branches/${editingBranch?.id}`, data);
      return response.json();
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/branches"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/branches"] });
      // Find the updated branch from the latest query data
      const updatedBranchesData = queryClient.getQueryData<{ branches: Branch[], total: number }>(["/api/admin/branches", { page: 1, limit: 50 }]);
      const updatedBranch = updatedBranchesData?.branches.find(b => b.id === editingBranch?.id);
      if (isCreateDialogOpen && updatedBranch) {
        // Reset form with updated branch data if dialog is still open
        form.reset({
          name: updatedBranch.name,
          address: updatedBranch.address,
          city: updatedBranch.city,
          country: updatedBranch.country,
          phone: updatedBranch.phone,
          email: updatedBranch.email,
          incharge: updatedBranch.incharge,
          location: updatedBranch.location,
          isMainOffice: updatedBranch.isMainOffice,
          isActive: updatedBranch.isActive,
        });
      } else {
        setEditingBranch(null);
        form.reset();
        setIsCreateDialogOpen(false);
      }
      toast({
        title: "Branch updated successfully",
        description: "Branch information has been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update branch",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/branches/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/branches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/branches"] });
      toast({
        title: "Branch deleted",
        description: "The branch has been removed from the network.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete branch",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertBranch) => {
    if (editingBranch) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    form.reset({
      name: branch.name,
      address: branch.address,
      city: branch.city,
      country: branch.country,
      phone: branch.phone,
      email: branch.email,
      incharge: branch.incharge,
      location: branch.location, // <-- add this
      isMainOffice: branch.isMainOffice,
      isActive: branch.isActive,
    });
    setIsCreateDialogOpen(true);
  };

  const handleDelete = (branch: Branch) => {
    if (confirm(`Are you sure you want to delete "${branch.name}"?`)) {
      deleteMutation.mutate(branch.id);
    }
  };

  const filteredBranches = branches.filter(branch =>
    branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeBranches = filteredBranches.filter(b => b.isActive);
  const inactiveBranches = filteredBranches.filter(b => !b.isActive);

  return (
    <AdminLayout
      title="Branches Management"
      description="Manage company branches and locations"
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Branches</p>
                  <p className="text-2xl font-bold text-gray-900">{branches.length}</p>
                </div>
                <Building className="h-8 w-8 text-fast-blue" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Branches</p>
                  <p className="text-2xl font-bold text-green-600">{activeBranches.length}</p>
                </div>
                <MapPin className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Countries</p>
                  <p className="text-2xl font-bold text-african-gold">
                    {new Set(branches.map(b => b.country)).size}
                  </p>
                </div>
                <MapPin className="h-8 w-8 text-african-gold" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Dialog 
            open={isCreateDialogOpen} 
            onOpenChange={(open) => {
              setIsCreateDialogOpen(open);
              if (!open) {
                setEditingBranch(null);
                form.reset();
              } else if (!editingBranch) {
                // Reset to default values when adding a new branch
                form.reset({
                  name: "",
                  address: "",
                  city: "",
                  country: "",
                  phone: "",
                  email: "",
                  incharge: "",
                  location: "",
                  isMainOffice: false,
                  isActive: true,
                });
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-fast-blue hover:bg-fast-blue-dark">
                <Plus className="h-4 w-4 mr-2" />
                Add Branch
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingBranch ? "Edit Branch" : "Add New Branch"}
                </DialogTitle>
              </DialogHeader>
              <div style={{ maxHeight: 480, overflowY: "auto" }}>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Branch Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter branch name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter city" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter full address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter country" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone *</FormLabel>
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
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter email address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="incharge"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Incharge *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter incharge name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Google Map Location Link</FormLabel>
                        <FormControl>
                          <Input placeholder="Paste Google Map link (optional)" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="isMainOffice"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Main Office</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Mark this as the headquarters/main office
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value ?? false}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Active Branch</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Show this branch on the public website
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={!!field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsCreateDialogOpen(false);
                        setEditingBranch(null);
                        form.reset();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createMutation.isPending || updateMutation.isPending}
                      className="bg-fast-blue hover:bg-fast-blue-dark"
                    >
                      {(createMutation.isPending || updateMutation.isPending) 
                        ? (editingBranch ? "Updating..." : "Creating...")
                        : (editingBranch ? "Update Branch" : "Create Branch")
                      }
                    </Button>
                  </div>
                </form>
              </Form>
              </div>
            </DialogContent>
          </Dialog>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search branches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>

        {/* Branches Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-fast-blue" />
              Branches ({filteredBranches.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : filteredBranches.length === 0 ? (
              <div className="text-center py-8">
                <Building className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchTerm ? "No branches matching your search" : "No branches yet"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Branch Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBranches.map((branch) => (
                      <TableRow key={branch.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{branch.name}</p>
                            {branch.isMainOffice && (
                              <Badge className="bg-fast-blue text-white text-xs">
                                Headquarters
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{branch.city}, {branch.country}</p>
                            <p className="text-sm text-gray-500">{branch.address}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{branch.incharge}</p>
                            <p className="text-sm text-gray-500">{branch.phone}</p>
                            <p className="text-sm text-gray-500">{branch.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={branch.isActive 
                            ? "bg-green-100 text-green-800" 
                            : "bg-gray-100 text-gray-800"
                          }>
                            {branch.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(branch.createdAt ?? "")}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEdit(branch)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDelete(branch)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
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
      </div>
    </AdminLayout>
  );
}
