// src/pages/ResetPassword.tsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/features/auth/store/authStore";

interface ResetPasswordResponse {
  success: true;
  message: string;
  token: string;
  user: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    role: string;
    city: string;
  };
}

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

// src/pages/ResetPassword.tsx

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (password.length < 8) {
    toast.error("Password must be at least 8 characters");
    return;
  }
  if (password !== confirmPassword) {
    toast.error("Passwords do not match");
    return;
  }

  const tempToken = localStorage.getItem("temp_reset_token");
  if (!tempToken) {
    toast.error("Session expired. Please start again.");
    navigate("/forgot-password");
    return;
  }

  setLoading(true);
  try {
    const res = await apiClient.post<ResetPasswordResponse>(
      "/auth/reset-password",
      { password },
      {
        headers: {
          Authorization: `Bearer ${tempToken}`
        }
      }
    );

    toast.success("Password reset successfully!");

    setAuth(res.user, res.token);
    localStorage.setItem("token", res.token);
    localStorage.removeItem("temp_reset_token");

    navigate("/home");
  } catch (err: any) {
    toast.error(err?.message || "Failed to reset password");
    localStorage.removeItem("temp_reset_token");
    navigate("/forgot-password");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center">
            Create New Password
          </CardTitle>
          <p className="text-center text-muted-foreground">
            Your new password must be different from previous ones
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm Password</Label>
              <Input
                id="confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700"
              disabled={loading}
            >
              {loading ? "Saving..." : "Set New Password"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-primary hover:underline">
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}