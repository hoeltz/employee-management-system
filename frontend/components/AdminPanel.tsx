import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Settings, Users, Image, Save, Plus, Edit, Trash2, ArrowLeft, RefreshCw } from "lucide-react";
import backend from "~backend/client";
import type { CreateUserRequest, UpdateUserRequest, UpdateSettingRequest } from "~backend/employee/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function AdminPanel() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [userForm, setUserForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "user",
    employeeId: ""
  });
  
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [settingValues, setSettingValues] = useState<Record<string, string>>({});

  // Queries
  const { data: users, refetch: refetchUsers } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => backend.admin.listUsers()
  });

  const { data: settings, refetch: refetchSettings } = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: () => backend.admin.listSettings()
  });

  const { data: employees } = useQuery({
    queryKey: ["employees"],
    queryFn: () => backend.employee.list({ limit: 1000 })
  });

  // Initialize setting values when settings are loaded
  useState(() => {
    if (settings?.settings) {
      const values: Record<string, string> = {};
      settings.settings.forEach(setting => {
        values[setting.key] = setting.value || "";
      });
      setSettingValues(values);
    }
  });

  // Mutations
  const createUserMutation = useMutation({
    mutationFn: (data: CreateUserRequest) => backend.admin.createUser(data),
    onSuccess: () => {
      refetchUsers();
      toast({ title: "Success", description: "User created successfully" });
      setUserForm({ username: "", email: "", password: "", role: "user", employeeId: "" });
      setIsUserDialogOpen(false);
    },
    onError: (error) => {
      console.error("Create user error:", error);
      toast({ title: "Error", description: "Failed to create user", variant: "destructive" });
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: (data: UpdateUserRequest) => backend.admin.updateUser(data),
    onSuccess: () => {
      refetchUsers();
      toast({ title: "Success", description: "User updated successfully" });
      setEditingUser(null);
      setIsUserDialogOpen(false);
    },
    onError: (error) => {
      console.error("Update user error:", error);
      toast({ title: "Error", description: "Failed to update user", variant: "destructive" });
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: number) => backend.admin.deleteUser({ id }),
    onSuccess: () => {
      refetchUsers();
      toast({ title: "Success", description: "User deleted successfully" });
    },
    onError: (error) => {
      console.error("Delete user error:", error);
      toast({ title: "Error", description: "Failed to delete user", variant: "destructive" });
    }
  });

  const updateSettingMutation = useMutation({
    mutationFn: (data: UpdateSettingRequest) => backend.admin.updateSetting(data),
    onSuccess: () => {
      refetchSettings();
      toast({ title: "Success", description: "Setting updated successfully" });
    },
    onError: (error) => {
      console.error("Update setting error:", error);
      toast({ title: "Error", description: "Failed to update setting", variant: "destructive" });
    }
  });

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUser) {
      updateUserMutation.mutate({
        id: editingUser.id,
        username: userForm.username,
        email: userForm.email,
        role: userForm.role,
        employeeId: userForm.employeeId && userForm.employeeId !== "none" ? parseInt(userForm.employeeId) : undefined
      });
    } else {
      createUserMutation.mutate({
        username: userForm.username,
        email: userForm.email,
        password: userForm.password,
        role: userForm.role,
        employeeId: userForm.employeeId && userForm.employeeId !== "none" ? parseInt(userForm.employeeId) : undefined
      });
    }
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setUserForm({
      username: user.username,
      email: user.email,
      password: "",
      role: user.role,
      employeeId: user.employeeId?.toString() || "none"
    });
    setIsUserDialogOpen(true);
  };

  const handleDeleteUser = (id: number, username: string) => {
    if (window.confirm(`Are you sure you want to delete user ${username}?`)) {
      deleteUserMutation.mutate(id);
    }
  };

  const handleSettingUpdate = (key: string, value: string) => {
    updateSettingMutation.mutate({ key, value });
  };

  const handleSettingValueChange = (key: string, value: string) => {
    setSettingValues(prev => ({ ...prev, [key]: value }));
  };

  const handleFileUpload = (key: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      handleSettingUpdate(key, base64);
    };
    reader.readAsDataURL(file);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "manager":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate("/")} size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Main
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetchUsers();
              refetchSettings();
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="settings">System Settings</TabsTrigger>
        </TabsList>

        {/* User Management */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">User Management</h2>
            <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingUser(null);
                  setUserForm({ username: "", email: "", password: "", role: "user", employeeId: "none" });
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingUser ? "Edit User" : "Create New User"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUserSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={userForm.username}
                      onChange={(e) => setUserForm(prev => ({ ...prev, username: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userForm.email}
                      onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  
                  {!editingUser && (
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={userForm.password}
                        onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                        required
                      />
                    </div>
                  )}
                  
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={userForm.role}
                      onValueChange={(value) => setUserForm(prev => ({ ...prev, role: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="employee">Linked Employee (Optional)</Label>
                    <Select
                      value={userForm.employeeId}
                      onValueChange={(value) => setUserForm(prev => ({ ...prev, employeeId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No employee linked</SelectItem>
                        {employees?.employees.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id.toString()}>
                            {emp.nama} ({emp.nip})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button type="submit" disabled={createUserMutation.isPending || updateUserMutation.isPending}>
                      <Save className="h-4 w-4 mr-2" />
                      {editingUser ? "Update" : "Create"} User
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsUserDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Username</th>
                      <th className="text-left py-3 px-4 font-medium">Email</th>
                      <th className="text-left py-3 px-4 font-medium">Role</th>
                      <th className="text-left py-3 px-4 font-medium">Employee</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-left py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users?.users.map((user) => {
                      const linkedEmployee = employees?.employees.find(emp => emp.id === user.employeeId);
                      return (
                        <tr key={user.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{user.username}</td>
                          <td className="py-3 px-4">{user.email}</td>
                          <td className="py-3 px-4">
                            <Badge className={getRoleBadgeColor(user.role)}>
                              {user.role}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            {linkedEmployee ? `${linkedEmployee.nama} (${linkedEmployee.nip})` : "None"}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={user.isActive ? "default" : "secondary"}>
                              {user.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="ghost" onClick={() => handleEditUser(user)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteUser(user.id, user.username)}
                                disabled={deleteUserMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="settings" className="space-y-4">
          <h2 className="text-xl font-semibold">System Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {settings?.settings.map((setting) => (
              <Card key={setting.id}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {setting.key === 'company_logo' ? (
                      <Image className="h-5 w-5" />
                    ) : (
                      <Settings className="h-5 w-5" />
                    )}
                    <span className="capitalize">{setting.key.replace(/_/g, ' ')}</span>
                  </CardTitle>
                  {setting.description && (
                    <p className="text-sm text-gray-600">{setting.description}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {setting.key === 'company_logo' ? (
                      <div className="space-y-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleFileUpload(setting.key, file);
                            }
                          }}
                        />
                        {setting.value && (
                          <div className="mt-2">
                            <img 
                              src={setting.value} 
                              alt="Company Logo" 
                              className="max-w-32 max-h-32 object-contain border rounded"
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <Input
                          value={settingValues[setting.key] || setting.value || ""}
                          onChange={(e) => handleSettingValueChange(setting.key, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSettingUpdate(setting.key, settingValues[setting.key] || "");
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          onClick={() => handleSettingUpdate(setting.key, settingValues[setting.key] || "")}
                          disabled={updateSettingMutation.isPending}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
