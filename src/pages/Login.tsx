import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useLogin } from "@/features/auth/hooks/useLogin";

export default function Login() {
  const navigate = useNavigate();
  const loginMutation = useLogin();

  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({
    emailOrPhone: "",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!credentials.emailOrPhone.trim()) return toast.error("Please enter your email or phone");
    if (!credentials.password) return toast.error("Password is required");

    const email = credentials.emailOrPhone.includes("@")
      ? credentials.emailOrPhone.trim().toLowerCase()
      : undefined;
    const phone = !credentials.emailOrPhone.includes("@")
      ? credentials.emailOrPhone.trim()
      : undefined;

    loginMutation.mutate(
      { email, phone, password: credentials.password },
      {
        onSuccess: () => {
          toast.success("Login successful!");
          navigate("/");
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || "Login failed");
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-orange-600 to-amber-700 shadow-lg mb-6 mx-auto">
            <span className="text-white text-5xl font-black tracking-tighter">AM</span>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900">Welcome Back</h1>
          <p className="mt-3 text-lg text-gray-600">Login to your AM Foods account</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-orange-100 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-600 to-amber-700 text-white py-10">
            <h2 className="text-3xl font-bold text-center">Sign In</h2>
          </div>

          <div className="p-8 sm:p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email / Phone */}
              <div className="space-y-2">
                <Label htmlFor="emailOrPhone" className="text-base font-medium text-gray-700">
                  Email or Phone Number
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-600" />
                  <Input
                    id="emailOrPhone"
                    type="text"
                    placeholder="example@email.com or 03123456789"
                    className="pl-12 h-12 bg-white border border-orange-200 text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-400/30 transition-all rounded-lg"
                    value={credentials.emailOrPhone}
                    onChange={(e) => setCredentials({ ...credentials, emailOrPhone: e.target.value })}
                    disabled={loginMutation.isPending}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-base font-medium text-gray-700">
                    Password
                  </Label>
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-orange-700 hover:text-orange-800 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-600" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-12 pr-14 h-12 bg-white border border-orange-200 text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-400/30 transition-all rounded-lg"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    disabled={loginMutation.isPending}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-orange-600 to-amber-700 hover:from-orange-700 hover:to-amber-800 transition-all shadow-md"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Logging in..." : "Login"}
              </Button>
            </form>

            <p className="mt-8 text-center text-base text-gray-600">
              Don't have an account?{" "}
              <Link to="/register" className="font-semibold text-orange-700 hover:text-orange-800 hover:underline">
                Register here
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-10">
          © {new Date().getFullYear()} AM Foods Pakistan
        </p>
      </motion.div>
    </div>
  );
}