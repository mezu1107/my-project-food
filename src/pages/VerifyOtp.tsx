// src/pages/VerifyOtp.tsx
// Now uses useAuthValidation("verifyOtp")

import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient } from "@/lib/api";
import { useAuthValidation } from "@/features/auth/hooks/useAuthValidation";

interface VerifyOtpResponse {
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

export default function VerifyOtp() {
  const [searchParams] = useSearchParams();
  const identifier = searchParams.get("identifier") || "";
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const { errors, validate, clearErrors } = useAuthValidation("verifyOtp");

  useEffect(() => {
    if (!identifier) {
      window.location.href = "/forgot-password";
    }
  }, [identifier]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    const payload = identifier.includes("@")
      ? { email: identifier, otp }
      : { phone: identifier, otp };

    const isValid = validate(payload);

    if (!isValid) return;

    setLoading(true);
    try {
      const res = await apiClient.post<VerifyOtpResponse>("/auth/verify-otp", payload);
      localStorage.setItem("temp_reset_token", res.token);
      window.location.href = "/reset-password";
    } catch (err: any) {
      // Server errors handled by backend message
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 flex items-center justify-center p-4 py-12">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center pb-8">
          <CardTitle className="text-3xl md:text-4xl font-black">
            Enter OTP
          </CardTitle>
          <p className="mt-3 text-base md:text-lg text-muted-foreground">
            Code sent to <strong className="break-all">{identifier}</strong>
          </p>
        </CardHeader>

        <CardContent className="space-y-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="otp" className="text-base md:text-lg font-medium">
                6-Digit OTP
              </Label>
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setOtp(value);
                  clearErrors();
                }}
                className={`h-16 md:h-20 text-center text-3xl md:text-4xl tracking-widest font-mono border-2 transition-all ${
                  errors.otp ? "border-red-500" : "border-orange-200 focus:border-orange-500"
                }`}
                disabled={loading}
                autoFocus
              />
              {errors.otp && (
                <p className="text-sm text-red-600 font-medium text-center">{errors.otp}</p>
              )}
              {(errors.email || errors.phone || errors.general) && (
                <p className="text-sm text-red-600 font-medium text-center">
                  {errors.email || errors.phone || errors.general}
                </p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full h-14 md:h-16 text-base md:text-lg font-bold bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </Button>
          </form>

          <div className="text-center space-y-3">
            <p className="text-sm md:text-base text-muted-foreground">
              Didn't receive the code?
            </p>
            <Link
              to="/forgot-password"
              className="text-sm md:text-base font-medium text-orange-600 hover:underline"
            >
              Resend OTP
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}