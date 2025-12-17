// src/pages/Profile.tsx
// FINAL PRODUCTION — DECEMBER 18, 2025

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuthStore } from "@/features/auth/store/authStore";
import { apiClient } from "@/lib/api";

export default function Profile() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updates: { name?: string; email?: string } = {};
      if (name.trim() !== user?.name) updates.name = name.trim();
      if (email.trim().toLowerCase() !== (user?.email || "")) updates.email = email.trim().toLowerCase();

      if (Object.keys(updates).length === 0) {
        toast.info("No changes to save");
        setLoading(false);
        return;
      }

      await apiClient.patch("/auth/me", updates);

      toast.success("Profile updated successfully!");
      // Optionally refetch user or update store
      window.location.reload(); // Simple way to refresh user data
    } catch (err: any) {
      toast.error(err?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 p-4">
      <div className="max-w-2xl mx-auto mt-10">
        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">
              My Profile
            </CardTitle>
            <p className="text-center text-muted-foreground">
              Manage your account information
            </p>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Profile Info */}
            <div className="text-center space-y-2">
              <div className="w-24 h-24 mx-auto rounded-full bg-orange-200 flex items-center justify-center text-4xl font-bold text-orange-700">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="text-muted-foreground">{user.role.toUpperCase()}</p>
              <p className="text-sm">{user.city}</p>
            </div>

            {/* Update Form */}
            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={user.phone}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Phone number cannot be changed
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Optional"
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700"
                disabled={loading}
              >
                {loading ? "Saving..." : "Update Profile"}
              </Button>
            </form>

            {/* Actions */}
            <div className="space-y-4 pt-6 border-t">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/change-password")}
              >
                Change Password
              </Button>

              <Button
                variant="destructive"
                className="w-full"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}