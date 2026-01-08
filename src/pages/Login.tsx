// src/pages/Login.tsx
// PRODUCTION-READY — FULLY RESPONSIVE (320px → 4K)
// Now uses useAuthValidation("login") for precise backend mirroring

import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, Lock, Eye, EyeOff } from "lucide-react";

import { useLogin } from "@/features/auth/hooks/useLogin";
import { useAuthValidation } from "@/features/auth/hooks/useAuthValidation";

export default function Login() {
  const loginMutation = useLogin();
  const { errors, validate, clearErrors } = useAuthValidation("login");

  const [showPassword, setShowPassword] = useState(false);
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");

  const isEmail = emailOrPhone.includes("@");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    const values = {
      email: isEmail ? emailOrPhone.trim().toLowerCase() : undefined,
      phone: !isEmail ? emailOrPhone.trim() : undefined,
      password,
    };

    const isValid = validate(values);

    if (!isValid) return;

    loginMutation.mutate({
      email: values.email,
      phone: values.phone,
      password,
    });
  };

  const handleEmailOrPhoneChange = (value: string) => {
    setEmailOrPhone(value);
    if (errors.email || errors.phone || errors.general) {
      clearErrors();
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center p-4 md:p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-orange-100/30 via-transparent to-green-100/30" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <header className="text-center mb-8 md:mb-10">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-orange-500 to-amber-600 shadow-2xl mb-6"
          >
            <span className="text-white text-4xl font-black">AM</span>
          </motion.div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900">
            Welcome Back
          </h1>
          <p className="mt-3 text-base md:text-lg text-muted-foreground">
            Login to your Al Tawakkalfoods account
          </p>
        </header>

        <Card className="shadow-2xl border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-600 text-white py-8">
            <CardTitle className="text-2xl md:text-3xl font-bold text-center">
              Sign In
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-8 pb-10 px-6 md:px-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email/Phone Field */}
              <div className="space-y-2">
                <Label htmlFor="emailOrPhone" className="text-base font-medium">
                  Email or Phone Number
                </Label>
                <div className="relative">
                  {isEmail ? (
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-600" />
                  ) : (
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-600" />
                  )}
                  <Input
                    id="emailOrPhone"
                    type="text"
                    placeholder="john@example.com or 03123456789"
                    className={`pl-12 h-12 md:h-14 text-base md:text-lg border-2 transition-all ${
                      errors.email || errors.phone || errors.general
                        ? "border-red-500 focus:border-red-600"
                        : "border-orange-200 focus:border-orange-500"
                    }`}
                    value={emailOrPhone}
                    onChange={(e) => handleEmailOrPhoneChange(e.target.value)}
                    disabled={loginMutation.isPending}
                  />
                </div>
                {(errors.email || errors.phone || errors.general) && (
                  <p className="text-sm text-red-600 font-medium">
                    {errors.email || errors.phone || errors.general}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-base font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-600" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`pl-12 pr-14 h-12 md:h-14 text-base md:text-lg border-2 transition-all ${
                      errors.password
                        ? "border-red-500 focus:border-red-600"
                        : "border-orange-200 focus:border-orange-500"
                    }`}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) clearErrors();
                    }}
                    disabled={loginMutation.isPending}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-600 hover:text-orange-700 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600 font-medium">{errors.password}</p>
                )}

                <div className="text-right">
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-orange-600 hover:text-orange-700 hover:underline transition-all"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-12 md:h-14 text-base md:text-lg font-bold bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-lg"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Logging in..." : "Login to Account"}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-base text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-bold text-orange-600 hover:text-orange-700 hover:underline transition-all"
                >
                  Register here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-8">
          © {new Date().getFullYear()} AM Enterprises Pakistan • Authentic Pakistani Cuisine Delivered
        </p>
      </motion.div>
    </main>
  );
}