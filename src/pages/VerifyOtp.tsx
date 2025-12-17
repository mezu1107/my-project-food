// src/pages/VerifyOtp.tsx

import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";

interface VerifyOtpResponse {
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

export default function VerifyOtp() {
  const [searchParams] = useSearchParams();
  const identifier = searchParams.get("identifier") || "";
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!identifier) {
      toast.error("Invalid session. Please start again.");
      window.location.href = "/forgot-password";
    }
  }, [identifier]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const payload = identifier.includes("@")
        ? { email: identifier, otp }
        : { phone: identifier, otp };

      const res = await apiClient.post<VerifyOtpResponse>("/auth/verify-otp", payload);

      toast.success("OTP verified! Please set your new password.");

      // Save token temporarily
      localStorage.setItem("temp_reset_token", res.token);

      window.location.href = "/reset-password";
    } catch (err: any) {
      toast.error(err?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center">
            Enter OTP
          </CardTitle>
          <p className="text-center text-muted-foreground">
            Code sent to <strong>{identifier}</strong>
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="otp">6-Digit OTP</Label>
              <Input
                id="otp"
                type="text"
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="text-center text-3xl tracking-widest letter-spacing-4"
                disabled={loading}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Didn't receive the code?
            </p>
            <Link to="/forgot-password" className="text-sm text-primary hover:underline">
              Resend OTP
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}