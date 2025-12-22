// src/features/auth/hooks/useRegister.ts
// FINAL PRODUCTION — DECEMBER 22, 2025
// FIXED: Consistent token storage key ("authToken")

import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "../store/authStore";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface RegisterData {
  name: string;
  phone: string;
  email?: string;
  password: string;
}

// Define the exact shape of the backend response
interface RegisterResponse {
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
    currentLocation?: [number, number];
  };
}

export const useRegister = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  return useMutation<RegisterResponse, Error, RegisterData>({
    mutationFn: async (data: RegisterData) => {
      return await apiClient.post<RegisterResponse>("/auth/register", data);
    },
    onSuccess: (response) => {
      // Axios wraps the actual response body in .data
      const { token, user, message } = response;

      // Store token using the consistent key "authToken"
      localStorage.setItem("authToken", token);

      // Update Zustand store
      setAuth(user, token);

      toast.success(message || "Account created successfully!");

      // Redirect to home (or dashboard if preferred)
      navigate("/home");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Registration failed. Please try again.";
      toast.error(errorMessage);
    },
  });
};