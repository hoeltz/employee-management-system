import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Calendar, Download, FileText, Users, Clock, DollarSign, ArrowLeft } from "lucide-react";
import backend from "~backend/client";
import type { ReportRequest } from "~backend/employee/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import * as XLSX from "xlsx";

export default function Reports() {
  const navigate = useNavigate();
  const [reportParams, setReportParams] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    employeeId: "",
    lokasiKerja: "",
    format: "json" as const
  });

  const { data: employees } = useQuery({
    queryKey: ["employees"],
    queryFn: () => backend.employee.list({ limit: 1000 })
  });

  const { data: attendanceReport, isLoading: attendanceLoading } = useQuery({
    queryKey: ["attendanceReport", reportParams],
    queryFn: () => backend.reports.attendanceReport({
      startDate: new Date(reportParams.startDate),
      endDate: new Date(reportParams.endDate),
      employeeId: reportParams.employeeId ? parseInt(reportParams.employeeId) : undefined,
      lokasiKerja: reportParams.lokasiKerja || undefined,
      format: "json"
    }),
    enabled: Boolean(reportParams.startDate && reportParams.endDate)
  });

  const { data: leaveReport, isLoading: leaveLoading } = useQuery({
    queryKey: ["leaveReport", reportParams],
    queryFn: () => backend.reports.leaveReport({
      startDate: new Date(reportParams.startDate),
      endDate: new Date(reportParams.endDate),
      employeeId: reportParams.employeeId ? parseInt(reportParams.employeeId) : undefined,
      lokasiKerja: reportParams.lokasiKerja || undefined,
      format: "json"
    }),
    enabled: Boolean(reportParams.startDate && reportParams.endDate)
  });

  const { data: invoiceReport, isLoading: invoiceLoading } = useQuery({
    queryKey: ["invoiceReport", reportParams],
    queryFn: () => backend.reports.invoiceReport({
      startDate: new Date(reportParams.startDate),
      endDate: new Date(reportParams.endDate),
      employeeId: reportParams.employeeId ? parseInt(reportParams.employeeId) : undefined,
      lokasiKerja: reportParams.lokasiKerja || undefined,
      format: "json"
    }),
    enabled: Boolean(reportParams.startDate && reportParams.endDate)
  });

  const handleParamChange = (field: string, value: string) => {
    setReportParams(prev => ({ ...prev, [field]: value }));
  };

  const exportToExcel = (data: any[], filename: string, sheetName: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate("/")} size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Main
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Report Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={reportParams.startDate}
                onChange={(e) => handleParamChange("startDate", e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={reportParams.endDate}
                onChange={(e) => handleParamChange("endDate", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="employee">Employee (Optional)</Label>
              <Select
                value={reportParams.employeeId}
                onValueChange={(value) => handleParamChange("employeeId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All employees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All employees</SelectItem>
                  {employees?.employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id.toString()}>
                      {emp.nama} ({emp.nip})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="location">Location (Optional)</Label>
              <Select
                value={reportParams.lokasiKerja}
                onValueChange={(value) => handleParamChange("lokasiKerja", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All locations</SelectItem>
                  <SelectItem value="PS">PS</SelectItem>
                  <SelectItem value="TGR">TGR</SelectItem>
                  <SelectItem value="MDN">MDN</SelectItem>
                  <SelectItem value="BKS">BKS</SelectItem>
                  <SelectItem value="JKT">JKT</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Tabs */}
      <Tabs defaultValue="attendance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="attendance">Attendance Report</TabsTrigger>
          <TabsTrigger value="leave">Leave Report</TabsTrigger>
          <TabsTrigger value="invoice">Invoice Report</TabsTrigger>
        </TabsList>

        {/* Attendance Report */}
        <TabsContent value="attendance" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Attendance Report</h2>
            <Button
              onClick={() => {
                if (attendanceReport?.reports) {
                  const exportData = attendanceReport.reports.flatMap(report =>
                    report.attendanceRecords.map(record => ({
                      NIP: report.employee.nip,
                      Name: report.employee.nama,
                      Position: report.employee.posisi,
                      Location: report.employee.lokasiKerja,
                      Date: formatDate(record.date),
                      CheckIn: record.checkIn || "",
                      CheckOut: record.checkOut || "",
                      Status: record.status,
                      Notes: record.notes || ""
                    }))
                  );
                  exportToExcel(exportData, "attendance_report", "Attendance");
                }
              }}
              disabled={attendanceLoading || !attendanceReport?.reports}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
          </div>

          {attendanceLoading ? (
            <div className="text-center py-8">Loading attendance report...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {attendanceReport?.reports.map((report) => (
                <Card key={report.employee.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{report.employee.nama}</CardTitle>
                    <p className="text-sm text-gray-600">{report.employee.nip} • {report.employee.lokasiKerja}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-green-600" />
                        <span>Present: {report.presentDays}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-red-600" />
                        <span>Absent: {report.absentDays}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-yellow-600" />
                        <span>Late: {report.lateDays}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span>Total: {report.totalDays}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500">Recent Records:</p>
                      {report.attendanceRecords.slice(0, 3).map((record) => (
                        <div key={record.id} className="flex justify-between text-xs">
                          <span>{formatDate(record.date)}</span>
                          <Badge variant={record.status === 'present' ? 'default' : 'destructive'}>
                            {record.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Leave Report */}
        <TabsContent value="leave" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Leave Report</h2>
            <Button
              onClick={() => {
                if (leaveReport?.reports) {
                  const exportData = leaveReport.reports.flatMap(report =>
                    report.leaveRecords.map(record => ({
                      NIP: report.employee.nip,
                      Name: report.employee.nama,
                      Position: report.employee.posisi,
                      Location: report.employee.lokasiKerja,
                      LeaveType: record.leaveType,
                      StartDate: formatDate(record.startDate),
                      EndDate: formatDate(record.endDate),
                      DaysRequested: record.daysRequested,
                      Status: record.status,
                      Reason: record.reason || ""
                    }))
                  );
                  exportToExcel(exportData, "leave_report", "Leave");
                }
              }}
              disabled={leaveLoading || !leaveReport?.reports}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
          </div>

          {leaveLoading ? (
            <div className="text-center py-8">Loading leave report...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {leaveReport?.reports.map((report) => (
                <Card key={report.employee.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{report.employee.nama}</CardTitle>
                    <p className="text-sm text-gray-600">{report.employee.nip} • {report.employee.lokasiKerja}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-green-600" />
                        <span>Approved: {report.approvedRequests}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-yellow-600" />
                        <span>Pending: {report.pendingRequests}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-red-600" />
                        <span>Rejected: {report.rejectedRequests}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span>Total: {report.totalRequests}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500">Recent Requests:</p>
                      {report.leaveRecords.slice(0, 3).map((record) => (
                        <div key={record.id} className="flex justify-between text-xs">
                          <span>{record.leaveType}</span>
                          <Badge variant={record.status === 'approved' ? 'default' : record.status === 'pending' ? 'secondary' : 'destructive'}>
                            {record.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Invoice Report */}
        <TabsContent value="invoice" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Invoice Report</h2>
            <Button
              onClick={() => {
                if (invoiceReport?.reports) {
                  const exportData = invoiceReport.reports.flatMap(report =>
                    report.invoiceRecords.map(record => ({
                      NIP: report.employee.nip,
                      Name: report.employee.nama,
                      Position: report.employee.posisi,
                      Location: report.employee.lokasiKerja,
                      InvoiceNumber: record.invoiceNumber,
                      Amount: record.amount,
                      Description: record.description || "",
                      IssueDate: formatDate(record.issueDate),
                      DueDate: formatDate(record.dueDate),
                      Status: record.status,
                      PaidAt: record.paidAt ? formatDate(record.paidAt) : ""
                    }))
                  );
                  exportToExcel(exportData, "invoice_report", "Invoices");
                }
              }}
              disabled={invoiceLoading || !invoiceReport?.reports}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
          </div>

          {invoiceLoading ? (
            <div className="text-center py-8">Loading invoice report...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {invoiceReport?.reports.map((report) => (
                <Card key={report.employee.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{report.employee.nama}</CardTitle>
                    <p className="text-sm text-gray-600">{report.employee.nip} • {report.employee.lokasiKerja}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span>Total Amount:</span>
                        </span>
                        <span className="font-medium">Rp {report.totalAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-blue-600" />
                          <span>Paid:</span>
                        </span>
                        <span className="font-medium">Rp {report.paidAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-yellow-600" />
                          <span>Pending:</span>
                        </span>
                        <span className="font-medium">Rp {report.pendingAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-gray-600" />
                          <span>Total Invoices:</span>
                        </span>
                        <span className="font-medium">{report.totalInvoices}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500">Recent Invoices:</p>
                      {report.invoiceRecords.slice(0, 3).map((record) => (
                        <div key={record.id} className="flex justify-between text-xs">
                          <span>{record.invoiceNumber}</span>
                          <Badge variant={record.status === 'paid' ? 'default' : 'secondary'}>
                            {record.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
