// src/pages/ResetPassword.tsx
// Now uses useAuthValidation("resetPassword") + client-side confirm match

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useAuthValidation } from "@/features/auth/hooks/useAuthValidation";

interface ResetPasswordResponse {
  success: true;
  message: string;
  token: string;
  user: {
    id: string;
    name: string;
    phone: string;
    email?: string | null;
    role: string;
    city: string;
  };
}

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const { errors, validate, clearErrors } = useAuthValidation("resetPassword");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    if (password !== confirmPassword) {
      errors.confirm = "Passwords do not match";
      return;
    }

    const isValid = validate({ password });

    if (!isValid) return;

    const tempToken = localStorage.getItem("temp_reset_token");
    if (!tempToken) {
      navigate("/forgot-password");
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post<ResetPasswordResponse>(
        "/auth/reset-password",
        { password },
        { headers: { Authorization: `Bearer ${tempToken}` } }
      );

      setAuth(res.user, res.token);
      localStorage.setItem("authToken", res.token); // consistent key
      localStorage.removeItem("temp_reset_token");

      navigate("/home");
    } catch (err: any) {
      localStorage.removeItem("temp_reset_token");
      navigate("/forgot-password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 flex items-center justify-center p-4 py-12">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="space-y-3 text-center pb-8">
          <CardTitle className="text-3xl md:text-4xl font-black">
            Create New Password
          </CardTitle>
          <p className="text-base md:text-lg text-muted-foreground">
            Your new password must meet complexity requirements
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-base font-medium">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearErrors();
                  }}
                  placeholder="••••••••"
                  className={`h-12 md:h-14 text-base md:text-lg pr-12 border-2 transition-all ${
                    errors.password ? "border-red-500" : "border-orange-200 focus:border-orange-500"
                  }`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-600 hover:text-orange-700"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600 font-medium">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm" className="text-base font-medium">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirm"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirm) clearErrors();
                  }}
                  placeholder="••••••••"
                  className={`h-12 md:h-14 text-base md:text-lg pr-12 border-2 transition-all ${
                    errors.confirm ? "border-red-500" : "border-orange-200 focus:border-orange-500"
                  }`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-600 hover:text-orange-700"
                >
                  {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirm && (
                <p className="text-sm text-red-600 font-medium">{errors.confirm}</p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full h-12 md:h-14 text-base md:text-lg font-bold bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
            >
              {loading ? "Saving..." : "Set New Password"}
            </Button>
          </form>

          <div className="text-center pt-4">
            <Link to="/login" className="text-sm md:text-base font-medium text-orange-600 hover:underline">
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}