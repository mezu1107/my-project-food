import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Phone, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useRegister } from "@/features/auth/hooks/useRegister";

export default function Register() {
  const navigate = useNavigate();
  const registerMutation = useRegister();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) return toast.error("Full name is required");
    if (!formData.phone.trim()) return toast.error("Phone number is required");
    if (formData.password.length < 8) return toast.error("Password must be at least 8 characters");

    registerMutation.mutate(
      {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        password: formData.password,
      },
      {
        onSuccess: () => {
          toast.success("Account created successfully!");
          navigate("/");
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || "Registration failed");
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
            <span className="text-white text-5xl font-black tracking-tighter">AlTawakkalfoods</span>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900">Create Account</h1>
          <p className="mt-3 text-lg text-gray-600">Join AlTawakkalfoods today</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-orange-100 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-600 to-amber-700 text-white py-10">
            <h2 className="text-3xl font-bold text-center">Sign Up</h2>
          </div>

          <div className="p-8 sm:p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base font-medium text-gray-700">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-600" />
                  <Input
                    id="name"
                    placeholder="Ahmed Khan"
                    className="pl-12 h-12 bg-white border border-orange-200 text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-400/30 transition-all rounded-lg"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={registerMutation.isPending}
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-base font-medium text-gray-700">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-600" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="03123456789"
                    className="pl-12 h-12 bg-white border border-orange-200 text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-400/30 transition-all rounded-lg"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={registerMutation.isPending}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-medium text-gray-700">
                  Email Address <span className="text-gray-500 text-sm">(optional)</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-600" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    className="pl-12 h-12 bg-white border border-orange-200 text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-400/30 transition-all rounded-lg"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={registerMutation.isPending}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-base font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-600" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-12 pr-14 h-12 bg-white border border-orange-200 text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-400/30 transition-all rounded-lg"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    disabled={registerMutation.isPending}
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
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <p className="mt-8 text-center text-base text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-orange-700 hover:text-orange-800 hover:underline">
                Login here
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