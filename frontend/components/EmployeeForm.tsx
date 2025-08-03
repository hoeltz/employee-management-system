import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save } from "lucide-react";
import backend from "~backend/client";
import type { CreateEmployeeRequest, UpdateEmployeeRequest } from "~backend/employee/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export default function EmployeeForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    nip: "",
    nama: "",
    posisi: "",
    agama: "",
    lokasiKerja: "",
    mulaiBergabung: ""
  });

  const { data: employee } = useQuery({
    queryKey: ["employee", id],
    queryFn: () => backend.employee.get({ id: parseInt(id!) }),
    enabled: isEdit
  });

  useEffect(() => {
    if (employee) {
      setFormData({
        nip: employee.nip,
        nama: employee.nama,
        posisi: employee.posisi,
        agama: employee.agama,
        lokasiKerja: employee.lokasiKerja,
        mulaiBergabung: new Date(employee.mulaiBergabung).toISOString().split('T')[0]
      });
    }
  }, [employee]);

  const createMutation = useMutation({
    mutationFn: (data: CreateEmployeeRequest) => backend.employee.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast({
        title: "Success",
        description: "Employee created successfully"
      });
      navigate("/");
    },
    onError: (error) => {
      console.error("Create error:", error);
      toast({
        title: "Error",
        description: "Failed to create employee",
        variant: "destructive"
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateEmployeeRequest) => backend.employee.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["employee", id] });
      toast({
        title: "Success",
        description: "Employee updated successfully"
      });
      navigate("/");
    },
    onError: (error) => {
      console.error("Update error:", error);
      toast({
        title: "Error",
        description: "Failed to update employee",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      mulaiBergabung: new Date(formData.mulaiBergabung)
    };

    if (isEdit) {
      updateMutation.mutate({
        id: parseInt(id!),
        ...submitData
      });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate("/")} size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEdit ? "Edit Employee" : "Add New Employee"}
        </h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Employee Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nip">NIP</Label>
                <Input
                  id="nip"
                  value={formData.nip}
                  onChange={(e) => handleChange("nip", e.target.value)}
                  required
                  disabled={isEdit} // NIP should not be editable
                />
              </div>

              <div>
                <Label htmlFor="nama">Full Name</Label>
                <Input
                  id="nama"
                  value={formData.nama}
                  onChange={(e) => handleChange("nama", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="posisi">Position</Label>
                <Select
                  value={formData.posisi}
                  onValueChange={(value) => handleChange("posisi", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FO Leader">FO Leader</SelectItem>
                    <SelectItem value="Field Enggeneer">Field Engineer</SelectItem>
                    <SelectItem value="Jointer">Jointer</SelectItem>
                    <SelectItem value="General Administration">General Administration</SelectItem>
                    <SelectItem value="Operational General Manager">Operational General Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="agama">Religion</Label>
                <Select
                  value={formData.agama}
                  onValueChange={(value) => handleChange("agama", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select religion" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Islam">Islam</SelectItem>
                    <SelectItem value="Kristen">Kristen</SelectItem>
                    <SelectItem value="Buddha">Buddha</SelectItem>
                    <SelectItem value="Hindu">Hindu</SelectItem>
                    <SelectItem value="Katolik">Katolik</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="lokasiKerja">Work Location</Label>
                <Select
                  value={formData.lokasiKerja}
                  onValueChange={(value) => handleChange("lokasiKerja", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PS">PS</SelectItem>
                    <SelectItem value="TGR">TGR</SelectItem>
                    <SelectItem value="MDN">MDN</SelectItem>
                    <SelectItem value="BKS">BKS</SelectItem>
                    <SelectItem value="JKT">JKT</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="mulaiBergabung">Start Date</Label>
                <Input
                  id="mulaiBergabung"
                  type="date"
                  value={formData.mulaiBergabung}
                  onChange={(e) => handleChange("mulaiBergabung", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-4 pt-4">
              <Button type="submit" disabled={isPending}>
                <Save className="h-4 w-4 mr-2" />
                {isPending ? "Saving..." : isEdit ? "Update Employee" : "Create Employee"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/")}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
