// src/features/auth/hooks/useRegister.ts
// FINAL PRODUCTION — DECEMBER 18, 2025

import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "../store/authStore"; // ← Correct path
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
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  return useMutation<RegisterResponse, Error, RegisterData>({
    mutationFn: async (data: RegisterData) => {
      // Explicitly type the response
      return await apiClient.post<RegisterResponse>("/auth/register", data);
    },
    onSuccess: (response) => {
      // Now TypeScript knows response has .user and .token
      setAuth(response.user, response.token);
      localStorage.setItem("token", response.token);
      toast.success(response.message || "Account created successfully!");
      navigate("/home");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Registration failed. Please try again.");
    },
  });
};