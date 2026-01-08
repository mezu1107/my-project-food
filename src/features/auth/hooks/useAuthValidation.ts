// src/hooks/useAuthValidation.ts
import { useState } from "react";

type Errors = Record<string, string>;

type AuthType =
  | "register"
  | "login"
  | "changePassword"
  | "forgotPassword"
  | "verifyOtp"
  | "resetPassword"
  | "updateProfile";

interface UseAuthValidationReturn {
  errors: Errors;
  validate: (values: Record<string, any>) => boolean;
  clearErrors: () => void;
}

export const useAuthValidation = (type: AuthType): UseAuthValidationReturn => {
  const [errors, setErrors] = useState<Errors>({});

  const clearErrors = () => setErrors({});

  const validate = (values: Record<string, any>): boolean => {
    const newErrors: Errors = {};

    // Helper to add error only if field has a value or is required
    const addError = (field: string, message: string) => {
      newErrors[field] = message;
    };

    switch (type) {
      // ======================
      // REGISTER
      // ======================
      case "register": {
        const { name, phone, email, password } = values;

        // Name
        if (!name || name.toString().trim() === "") {
          addError("name", "Name is required");
        } else {
          const trimmedName = name.toString().trim();
          if (trimmedName.length < 2 || trimmedName.length > 50) {
            addError("name", "Name must be 2-50 characters");
          } else if (!/^[\p{L}\s]+$/u.test(trimmedName)) {
            addError("name", "Name can only contain letters and spaces");
          }
        }

        // Phone
        if (!phone || phone.toString().trim() === "") {
          addError("phone", "Phone number is required");
        } else if (!/^03[0-9]{9}$/.test(phone.toString().trim())) {
          addError("phone", "Valid Pakistani phone number required");
        }

        // Email (optional)
        if (email && email.toString().trim() !== "") {
          const normalized = email.toString().toLowerCase().trim();
          if (!/^\S+@\S+\.\S+$/.test(normalized)) {
            addError("email", "Invalid email");
          }
        }

        // Password
        if (!password || password.toString().trim() === "") {
          addError("password", "Password is required");
        } else {
          const pwd = password.toString();
          if (pwd.length < 8) {
            addError("password", "Password must be 8+ characters");
          }
          if (!/[A-Z]/.test(pwd)) {
            addError("password", "Must contain uppercase letter");
          }
          if (!/[a-z]/.test(pwd)) {
            addError("password", "Must contain lowercase letter");
          }
          if (!/[0-9]/.test(pwd)) {
            addError("password", "Must contain number");
          }
          if (!/[!@#$%^&*]/.test(pwd)) {
            addError("password", "Must contain special char (!@#$%^&*)");
          }
        }
        break;
      }

      // ======================
      // LOGIN
      // ======================
      case "login": {
        const { email, phone, password } = values;

        if (!password || password.toString().trim() === "") {
          addError("password", "Password is required");
        }

        if (!email && !phone) {
          addError("general", "Email or phone number is required");
        }

        if (email && email.toString().trim() !== "") {
          const normalized = email.toString().toLowerCase().trim();
          if (!/^\S+@\S+\.\S+$/.test(normalized)) {
            addError("email", "Invalid email");
          }
        }

        if (phone && phone.toString().trim() !== "") {
          if (!/^03[0-9]{9}$/.test(phone.toString().trim())) {
            addError("phone", "Valid Pakistani phone number required");
          }
        }
        break;
      }

      // ======================
      // CHANGE PASSWORD
      // ======================
      case "changePassword": {
        const { currentPassword, newPassword } = values;

        if (!currentPassword || currentPassword.toString().trim() === "") {
          addError("currentPassword", "Current password is required");
        }

        if (!newPassword || newPassword.toString().trim() === "") {
          addError("newPassword", "New password is required");
        } else {
          const pwd = newPassword.toString();
          if (pwd.length < 8) {
            addError("newPassword", "New password must be 8+ characters");
          }
          if (!/[A-Z]/.test(pwd)) {
            addError("newPassword", "Must contain uppercase letter");
          }
          if (!/[a-z]/.test(pwd)) {
            addError("newPassword", "Must contain lowercase letter");
          }
          if (!/[0-9]/.test(pwd)) {
            addError("newPassword", "Must contain number");
          }
          if (!/[!@#$%^&*]/.test(pwd)) {
            addError("newPassword", "Must contain special char (!@#$%^&*)");
          }
          if (pwd === currentPassword?.toString()) {
            addError("newPassword", "New password must be different from current password");
          }
        }
        break;
      }

      // ======================
      // FORGOT PASSWORD
      // ======================
      case "forgotPassword": {
        const { email, phone } = values;

        if (!email && !phone) {
          addError("general", "Email or phone number is required");
        }

        if (email && email.toString().trim() !== "") {
          const normalized = email.toString().toLowerCase().trim();
          if (!/^\S+@\S+\.\S+$/.test(normalized)) {
            addError("email", "Invalid email");
          }
        }

        if (phone && phone.toString().trim() !== "") {
          if (!/^03[0-9]{9}$/.test(phone.toString().trim())) {
            addError("phone", "Valid Pakistani phone number required");
          }
        }
        break;
      }

      // ======================
      // VERIFY OTP
      // ======================
      case "verifyOtp": {
        const { email, phone, otp } = values;

        if (!email && !phone) {
          addError("general", "Email or phone number is required");
        }

        if (email && email.toString().trim() !== "") {
          const normalized = email.toString().toLowerCase().trim();
          if (!/^\S+@\S+\.\S+$/.test(normalized)) {
            addError("email", "Invalid email");
          }
        }

        if (phone && phone.toString().trim() !== "") {
          if (!/^03[0-9]{9}$/.test(phone.toString().trim())) {
            addError("phone", "Valid Pakistani phone number required");
          }
        }

        if (!otp || otp.toString().trim() === "") {
          addError("otp", "OTP is required");
        } else {
          const trimmedOtp = otp.toString().trim();
          if (trimmedOtp.length !== 6) {
            addError("otp", "OTP must be 6 digits");
          } else if (!/^\d{6}$/.test(trimmedOtp)) {
            addError("otp", "OTP must contain only numbers");
          }
        }
        break;
      }

      // ======================
      // RESET PASSWORD
      // ======================
      case "resetPassword": {
        const { password } = values;

        if (!password || password.toString().trim() === "") {
          addError("password", "Password is required");
        } else {
          const pwd = password.toString();
          if (pwd.length < 8) {
            addError("password", "Password must be 8+ characters");
          }
          if (!/[A-Z]/.test(pwd)) {
            addError("password", "Must contain uppercase letter");
          }
          if (!/[a-z]/.test(pwd)) {
            addError("password", "Must contain lowercase letter");
          }
          if (!/[0-9]/.test(pwd)) {
            addError("password", "Must contain number");
          }
          if (!/[!@#$%^&*]/.test(pwd)) {
            addError("password", "Must contain special char (!@#$%^&*)");
          }
        }
        break;
      }

      // ======================
      // UPDATE PROFILE
      // ======================
      case "updateProfile": {
        const { name, email } = values;

        // Name is optional, but if provided → validate
        if (name !== undefined && name.toString().trim() !== "") {
          const trimmedName = name.toString().trim();
          if (trimmedName.length < 2 || trimmedName.length > 50) {
            addError("name", "Name must be 2-50 characters");
          } else if (!/^[\p{L}\s]+$/u.test(trimmedName)) {
            addError("name", "Name can only contain letters and spaces");
          }
        }

        // Email is optional, but if provided → validate
        if (email !== undefined && email !== null && email.toString().trim() !== "") {
          const normalized = email.toString().toLowerCase().trim();
          if (!/^\S+@\S+\.\S+$/.test(normalized)) {
            addError("email", "Invalid email address");
          }
        }
        break;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return { errors, validate, clearErrors };
};