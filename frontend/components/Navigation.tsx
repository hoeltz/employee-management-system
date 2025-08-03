import { Link, useLocation } from "react-router-dom";
import { Users, Plus, Upload, FileText, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navigation() {
  const location = useLocation();

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2 text-xl font-semibold text-gray-900">
            <Users className="h-6 w-6" />
            <span>Employee Management</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Button
              variant={location.pathname === "/" ? "default" : "ghost"}
              asChild
            >
              <Link to="/">
                <Users className="h-4 w-4 mr-2" />
                Employees
              </Link>
            </Button>
            
            <Button
              variant={location.pathname === "/employees/new" ? "default" : "ghost"}
              asChild
            >
              <Link to="/employees/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Employee
              </Link>
            </Button>

            <Button
              variant={location.pathname === "/employees/bulk-upload" ? "default" : "ghost"}
              asChild
            >
              <Link to="/employees/bulk-upload">
                <Upload className="h-4 w-4 mr-2" />
                Bulk Upload
              </Link>
            </Button>

            <Button
              variant={location.pathname === "/reports" ? "default" : "ghost"}
              asChild
            >
              <Link to="/reports">
                <FileText className="h-4 w-4 mr-2" />
                Reports
              </Link>
            </Button>

            <Button
              variant={location.pathname === "/admin" ? "default" : "ghost"}
              asChild
            >
              <Link to="/admin">
                <Settings className="h-4 w-4 mr-2" />
                Admin
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
