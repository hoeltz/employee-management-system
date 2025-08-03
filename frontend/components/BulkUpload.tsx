import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Upload, Download, FileSpreadsheet, AlertCircle } from "lucide-react";
import backend from "~backend/client";
import type { BulkUploadRequest } from "~backend/employee/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import * as XLSX from "xlsx";

export default function BulkUpload() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [uploadData, setUploadData] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>("");

  const uploadMutation = useMutation({
    mutationFn: (data: BulkUploadRequest) => backend.employee.bulkUpload(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast({
        title: "Upload Complete",
        description: `Successfully uploaded ${result.success} employees. ${result.failed} failed.`
      });
      
      if (result.errors.length > 0) {
        console.error("Upload errors:", result.errors);
      }
      
      setUploadData([]);
      setFileName("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    onError: (error) => {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description: "Failed to upload employees",
        variant: "destructive"
      });
    }
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Transform data to match our schema
        const transformedData = jsonData.map((row: any) => ({
          nip: String(row.NIP || row.nip || ""),
          nama: String(row.NAMA || row.nama || row.Name || ""),
          posisi: String(row.POSISI || row.posisi || row.Position || ""),
          agama: String(row.AGAMA || row.agama || row.Religion || ""),
          lokasiKerja: String(row.LOKASI_KERJA || row.lokasiKerja || row["Work Location"] || ""),
          mulaiBergabung: new Date(row.MULAI_BERGABUNG || row.mulaiBergabung || row["Start Date"] || new Date())
        }));

        setUploadData(transformedData);
      } catch (error) {
        console.error("File parsing error:", error);
        toast({
          title: "Error",
          description: "Failed to parse Excel file",
          variant: "destructive"
        });
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        NIP: "12345678",
        NAMA: "John Doe",
        POSISI: "Field Enggeneer",
        AGAMA: "Islam",
        LOKASI_KERJA: "PS",
        MULAI_BERGABUNG: "2024-01-01"
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employee Template");
    XLSX.writeFile(workbook, "employee_template.xlsx");
  };

  const handleUpload = () => {
    if (uploadData.length === 0) {
      toast({
        title: "Error",
        description: "Please select a file first",
        variant: "destructive"
      });
      return;
    }

    uploadMutation.mutate({ employees: uploadData });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate("/")} size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Bulk Upload Employees</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Upload Excel File</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please use the template format. Required columns: NIP, NAMA, POSISI, AGAMA, LOKASI_KERJA, MULAI_BERGABUNG
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <Button onClick={downloadTemplate} variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>

              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button asChild variant="outline" className="w-full cursor-pointer">
                    <span>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Select Excel File
                    </span>
                  </Button>
                </label>
              </div>

              {fileName && (
                <p className="text-sm text-gray-600">Selected: {fileName}</p>
              )}

              {uploadData.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    {uploadData.length} employees ready to upload
                  </p>
                  <Button 
                    onClick={handleUpload} 
                    disabled={uploadMutation.isPending}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadMutation.isPending ? "Uploading..." : "Upload Employees"}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Preview Section */}
        <Card>
          <CardHeader>
            <CardTitle>Data Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {uploadData.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Showing first 5 records:
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">NIP</th>
                        <th className="text-left py-2">Name</th>
                        <th className="text-left py-2">Position</th>
                        <th className="text-left py-2">Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {uploadData.slice(0, 5).map((employee, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2 font-mono text-xs">{employee.nip}</td>
                          <td className="py-2">{employee.nama}</td>
                          <td className="py-2">{employee.posisi}</td>
                          <td className="py-2">{employee.lokasiKerja}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {uploadData.length > 5 && (
                  <p className="text-xs text-gray-500">
                    ... and {uploadData.length - 5} more records
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No data to preview</p>
                <p className="text-sm">Upload an Excel file to see preview</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
