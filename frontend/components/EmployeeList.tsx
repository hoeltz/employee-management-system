import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Eye, Edit, Trash2, Search, Filter, Upload } from "lucide-react";
import backend from "~backend/client";
import type { Employee } from "~backend/employee/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function EmployeeList() {
  const [filters, setFilters] = useState({
    lokasiKerja: "",
    posisi: "",
    limit: 50,
    offset: 0
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["employees", filters],
    queryFn: () => backend.employee.list(filters)
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => backend.employee.deleteEmployee({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast({
        title: "Success",
        description: "Employee deleted successfully"
      });
    },
    onError: (error) => {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: "Failed to delete employee",
        variant: "destructive"
      });
    }
  });

  const seedMutation = useMutation({
    mutationFn: () => backend.employee.seed(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast({
        title: "Success",
        description: `${data.count} employees seeded successfully`
      });
    },
    onError: (error) => {
      console.error("Seed error:", error);
      toast({
        title: "Error",
        description: "Failed to seed database",
        variant: "destructive"
      });
    }
  });

  const handleDelete = (id: number, nama: string) => {
    if (window.confirm(`Are you sure you want to delete ${nama}?`)) {
      deleteMutation.mutate(id);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const getPositionColor = (posisi: string) => {
    switch (posisi) {
      case "FO Leader":
        return "bg-blue-100 text-blue-800";
      case "Field Enggeneer":
        return "bg-green-100 text-green-800";
      case "Jointer":
        return "bg-yellow-100 text-yellow-800";
      case "General Administration":
        return "bg-purple-100 text-purple-800";
      case "Operational General Manager":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading employees...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Error loading employees</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
        <div className="flex items-center space-x-2">
          <Button 
            onClick={() => seedMutation.mutate()}
            disabled={seedMutation.isPending}
            variant="outline"
          >
            {seedMutation.isPending ? "Seeding..." : "Seed Database"}
          </Button>
          <Button asChild variant="outline">
            <Link to="/employees/bulk-upload">
              <Upload className="h-4 w-4 mr-2" />
              Bulk Upload
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Work Location</label>
              <Select
                value={filters.lokasiKerja}
                onValueChange={(value) => setFilters(prev => ({ ...prev, lokasiKerja: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All locations</SelectItem>
                  <SelectItem value="PS">PS</SelectItem>
                  <SelectItem value="TGR">TGR</SelectItem>
                  <SelectItem value="MDN">MDN</SelectItem>
                  <SelectItem value="BKS">BKS</SelectItem>
                  <SelectItem value="JKT">JKT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Position</label>
              <Select
                value={filters.posisi}
                onValueChange={(value) => setFilters(prev => ({ ...prev, posisi: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All positions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All positions</SelectItem>
                  <SelectItem value="FO Leader">FO Leader</SelectItem>
                  <SelectItem value="Field Enggeneer">Field Engineer</SelectItem>
                  <SelectItem value="Jointer">Jointer</SelectItem>
                  <SelectItem value="General Administration">General Administration</SelectItem>
                  <SelectItem value="Operational General Manager">Operational General Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Employees ({data?.total || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data?.employees.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No employees found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">NIP</th>
                    <th className="text-left py-3 px-4 font-medium">Name</th>
                    <th className="text-left py-3 px-4 font-medium">Position</th>
                    <th className="text-left py-3 px-4 font-medium">Religion</th>
                    <th className="text-left py-3 px-4 font-medium">Location</th>
                    <th className="text-left py-3 px-4 font-medium">Start Date</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.employees.map((employee: Employee) => (
                    <tr key={employee.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-sm">{employee.nip}</td>
                      <td className="py-3 px-4 font-medium">{employee.nama}</td>
                      <td className="py-3 px-4">
                        <Badge className={getPositionColor(employee.posisi)}>
                          {employee.posisi}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">{employee.agama}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{employee.lokasiKerja}</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm">{formatDate(employee.mulaiBergabung)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="ghost" asChild>
                            <Link to={`/employees/${employee.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button size="sm" variant="ghost" asChild>
                            <Link to={`/employees/${employee.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(employee.id, employee.nama)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
