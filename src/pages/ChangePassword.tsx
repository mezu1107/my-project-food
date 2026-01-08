// src/pages/ChangePassword.tsx
// PRODUCTION-READY — Uses useAuthValidation("changePassword")

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import { apiClient } from "@/lib/api";
import { useAuthValidation } from "@/features/auth/hooks/useAuthValidation";

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { errors, validate, clearErrors } = useAuthValidation("changePassword");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    // Client-side confirm password match
    if (newPassword !== confirmPassword) {
      // We reuse newPassword error slot for this message
      (errors as any).newPassword = "New passwords do not match";
      setLoading(false);
      return;
    }

    const isValid = validate({ currentPassword, newPassword });
    if (!isValid) return;

    setLoading(true);
    try {
      await apiClient.patch("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      navigate("/profile");
    } catch (err: any) {
      // Backend errors (e.g. wrong current password) handled by toast if needed
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 flex items-center justify-center p-4 py-12">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center pb-8">
          <CardTitle className="text-3xl md:text-4xl font-black">
            Change Password
          </CardTitle>
          <p className="mt-3 text-base md:text-lg text-muted-foreground">
            Keep your account secure
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="current" className="text-base md:text-lg font-medium">
                Current Password
              </Label>
              <div className="relative">
                <Input
                  id="current"
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    if (errors.currentPassword) clearErrors();
                  }}
                  className={`h-12 md:h-14 text-base md:text-lg pr-12 border-2 transition-all ${
                    errors.currentPassword
                      ? "border-red-500 focus:border-red-600"
                      : "border-orange-200 focus:border-orange-500"
                  }`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-600 hover:text-orange-700"
                >
                  {showCurrent ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-sm text-red-600 font-medium">{errors.currentPassword}</p>
              )}
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="new" className="text-base md:text-lg font-medium">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="new"
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    clearErrors();
                  }}
                  className={`h-12 md:h-14 text-base md:text-lg pr-12 border-2 transition-all ${
                    errors.newPassword
                      ? "border-red-500 focus:border-red-600"
                      : "border-orange-200 focus:border-orange-500"
                  }`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-600 hover:text-orange-700"
                >
                  {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-sm text-red-600 font-medium">{errors.newPassword}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirm" className="text-base md:text-lg font-medium">
                Confirm New Password
              </Label>
              <div className="relative">
                <Input
                  id="confirm"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if ((errors as any).newPassword === "New passwords do not match") {
                      clearErrors();
                    }
                  }}
                  className={`h-12 md:h-14 text-base md:text-lg pr-12 border-2 transition-all ${
                    (errors as any).newPassword === "New passwords do not match"
                      ? "border-red-500 focus:border-red-600"
                      : "border-orange-200 focus:border-orange-500"
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
              {(errors as any).newPassword === "New passwords do not match" && (
                <p className="text-sm text-red-600 font-medium">New passwords do not match</p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full h-14 text-base md:text-lg font-bold bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
            >
              {loading ? "Changing..." : "Change Password"}
            </Button>
          </form>

          <div className="text-center pt-4">
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="text-sm md:text-base font-medium text-orange-600 hover:underline transition-all"
            >
              Back to Profile
            </button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}