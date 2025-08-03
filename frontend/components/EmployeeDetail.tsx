import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Edit, Calendar, MapPin, Briefcase, User } from "lucide-react";
import backend from "~backend/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: employee, isLoading, error } = useQuery({
    queryKey: ["employee", id],
    queryFn: () => backend.employee.get({ id: parseInt(id!) }),
    enabled: Boolean(id)
  });

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
        <div className="text-lg">Loading employee details...</div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Employee not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate("/")} size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Employee Details</h1>
        </div>
        <Button asChild>
          <Link to={`/employees/${employee.id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Employee
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Personal Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">NIP</label>
                  <p className="text-lg font-mono">{employee.nip}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                  <p className="text-lg font-semibold">{employee.nama}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Religion</label>
                  <p className="text-lg">{employee.agama}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Work Information */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Briefcase className="h-5 w-5" />
                <span>Work Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Position</label>
                <Badge className={getPositionColor(employee.posisi)}>
                  {employee.posisi}
                </Badge>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Work Location</label>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <Badge variant="outline">{employee.lokasiKerja}</Badge>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Start Date</label>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>{formatDate(employee.mulaiBergabung)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <label className="block font-medium mb-1">Created At</label>
              <p>{formatDate(employee.createdAt)}</p>
            </div>
            <div>
              <label className="block font-medium mb-1">Last Updated</label>
              <p>{formatDate(employee.updatedAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
