import { Link, useLocation } from "react-router-dom";
import { Users, Plus } from "lucide-react";
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
              variant={location.pathname === "/employees/new" ? "default" : "outline"}
              asChild
            >
              <Link to="/employees/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Employee
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
