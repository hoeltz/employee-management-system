import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, Upload, X } from "lucide-react";
import backend from "~backend/client";
import type { CreateEmployeeRequest, UpdateEmployeeRequest } from "~backend/employee/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { handleFileUpload } from "../utils/fileUtils";

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
    mulaiBergabung: "",
    alamat: "",
    foto: "",
    fotocopyIdentitas: ""
  });

  const [uploading, setUploading] = useState({
    foto: false,
    fotocopyIdentitas: false
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
        mulaiBergabung: new Date(employee.mulaiBergabung).toISOString().split('T')[0],
        alamat: employee.alamat || "",
        foto: employee.foto || "",
        fotocopyIdentitas: employee.fotocopyIdentitas || ""
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
      mulaiBergabung: new Date(formData.mulaiBergabung),
      alamat: formData.alamat || undefined,
      foto: formData.foto || undefined,
      fotocopyIdentitas: formData.fotocopyIdentitas || undefined
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

  const handleFileChange = async (field: 'foto' | 'fotocopyIdentitas', file: File | null) => {
    if (!file) {
      setFormData(prev => ({ ...prev, [field]: "" }));
      return;
    }

    setUploading(prev => ({ ...prev, [field]: true }));
    
    try {
      const base64 = await handleFileUpload(file, 10);
      setFormData(prev => ({ ...prev, [field]: base64 }));
      toast({
        title: "Success",
        description: "File uploaded successfully"
      });
    } catch (error) {
      console.error("File upload error:", error);
      toast({
        title: "Error",
        description: "Failed to upload file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(prev => ({ ...prev, [field]: false }));
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const positions = [
    "FO Leader",
    "Field Enggeneer", 
    "Jointer",
    "General Administration",
    "Operational General Manager",
    "Sales Manager",
    "Sales",
    "IT Support",
    "Technical Leader",
    "Technical Supervisor",
    "Jr. Leader",
    "Sr. Leader"
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate("/")} size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Main
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEdit ? "Edit Employee" : "Add New Employee"}
        </h1>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Employee Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nip">NIP</Label>
                <Input
                  id="nip"
                  value={formData.nip}
                  onChange={(e) => handleChange("nip", e.target.value)}
                  required
                  disabled={isEdit}
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
                    {positions.map((position) => (
                      <SelectItem key={position} value={position}>
                        {position}
                      </SelectItem>
                    ))}
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

            {/* Address */}
            <div>
              <Label htmlFor="alamat">Address</Label>
              <Textarea
                id="alamat"
                value={formData.alamat}
                onChange={(e) => handleChange("alamat", e.target.value)}
                placeholder="Enter complete address"
                rows={3}
              />
            </div>

            {/* File Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Photo Upload */}
              <div className="space-y-2">
                <Label>Employee Photo</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {formData.foto ? (
                    <div className="space-y-2">
                      <img 
                        src={formData.foto} 
                        alt="Employee" 
                        className="w-32 h-32 object-cover rounded-lg mx-auto"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleFileChange('foto', null)}
                        className="w-full"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Remove Photo
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange('foto', e.target.files?.[0] || null)}
                        className="hidden"
                        id="foto-upload"
                        disabled={uploading.foto}
                      />
                      <label htmlFor="foto-upload">
                        <Button
                          type="button"
                          variant="outline"
                          asChild
                          disabled={uploading.foto}
                          className="cursor-pointer"
                        >
                          <span>
                            {uploading.foto ? "Uploading..." : "Upload Photo"}
                          </span>
                        </Button>
                      </label>
                      <p className="text-xs text-gray-500 mt-1">Max 10MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* ID Copy Upload */}
              <div className="space-y-2">
                <Label>ID Card Copy</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {formData.fotocopyIdentitas ? (
                    <div className="space-y-2">
                      <img 
                        src={formData.fotocopyIdentitas} 
                        alt="ID Copy" 
                        className="w-32 h-20 object-cover rounded-lg mx-auto"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleFileChange('fotocopyIdentitas', null)}
                        className="w-full"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Remove ID Copy
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => handleFileChange('fotocopyIdentitas', e.target.files?.[0] || null)}
                        className="hidden"
                        id="id-upload"
                        disabled={uploading.fotocopyIdentitas}
                      />
                      <label htmlFor="id-upload">
                        <Button
                          type="button"
                          variant="outline"
                          asChild
                          disabled={uploading.fotocopyIdentitas}
                          className="cursor-pointer"
                        >
                          <span>
                            {uploading.fotocopyIdentitas ? "Uploading..." : "Upload ID Copy"}
                          </span>
                        </Button>
                      </label>
                      <p className="text-xs text-gray-500 mt-1">Max 10MB</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4 pt-4">
              <Button type="submit" disabled={isPending || uploading.foto || uploading.fotocopyIdentitas}>
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
