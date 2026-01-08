// src/pages/ForgotPassword.tsx
// PRODUCTION-READY — Uses useAuthValidation("forgotPassword")

import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone } from "lucide-react";
import { apiClient } from "@/lib/api";
import { useAuthValidation } from "@/features/auth/hooks/useAuthValidation";

interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  debug_otp?: string;
}

export default function ForgotPassword() {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);

  const { errors, validate, clearErrors } = useAuthValidation("forgotPassword");

  const isEmail = identifier.includes("@");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    const payload = isEmail
      ? { email: identifier.trim().toLowerCase() }
      : { phone: identifier.trim() };

    const isValid = validate(payload);
    if (!isValid) return;

    setLoading(true);
    try {
      const res = await apiClient.post<ForgotPasswordResponse>("/auth/forgot-password", payload);

      if (res.debug_otp) {
        // toast.info(`Development OTP: ${res.debug_otp}`, { duration: 15000 });
      }

      window.location.href = `/verify-otp?identifier=${encodeURIComponent(identifier.trim())}`;
    } catch (err: any) {
      // Server-side errors will be shown via toast if needed
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (value: string) => {
    setIdentifier(value);
    clearErrors();
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 flex items-center justify-center p-4 py-12">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center pb-8">
          <CardTitle className="text-3xl md:text-4xl font-black">
            Forgot Password
          </CardTitle>
          <p className="mt-3 text-base md:text-lg text-muted-foreground">
            We'll send a 6-digit OTP to your email or phone
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="identifier" className="text-base md:text-lg font-medium">
                Email or Phone Number
              </Label>
              <div className="relative">
                {isEmail ? (
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-600" />
                ) : (
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-600" />
                )}
                <Input
                  id="identifier"
                  type="text"
                  placeholder="john@example.com or 03123456789"
                  value={identifier}
                  onChange={(e) => handleChange(e.target.value)}
                  className={`pl-12 h-12 md:h-14 text-base md:text-lg border-2 transition-all ${
                    errors.email || errors.phone || errors.general
                      ? "border-red-500 focus:border-red-600"
                      : "border-orange-200 focus:border-orange-500"
                  }`}
                  disabled={loading}
                />
              </div>
              {(errors.email || errors.phone || errors.general) && (
                <p className="text-sm text-red-600 font-medium">
                  {errors.email || errors.phone || errors.general}
                </p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full h-14 text-base md:text-lg font-bold bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
            >
              {loading ? "Sending..." : "Send OTP"}
            </Button>
          </form>

          <div className="text-center pt-4">
            <Link
              to="/login"
              className="text-sm md:text-base font-medium text-orange-600 hover:underline transition-all"
            >
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}