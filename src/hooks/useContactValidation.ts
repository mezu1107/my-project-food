// src/hooks/useContactValidation.ts
import { useState } from "react";

type Errors = Record<string, string>;

export const useContactValidation = () => {
  const [errors, setErrors] = useState<Errors>({});

  const clearErrors = () => setErrors({});

  const validate = (values: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): boolean => {
    const newErrors: Errors = {};

    // Name
    const trimmedName = values.name.trim();
    if (!trimmedName) {
      newErrors.name = "Name is required";
    } else if (trimmedName.length < 2 || trimmedName.length > 50) {
      newErrors.name = "Name must be 2-50 characters";
    } else if (!/^[\p{L}\s]+$/u.test(trimmedName)) {
      newErrors.name = "Name can only contain letters and spaces";
    }

    // Email
    const trimmedEmail = values.email.trim();
    if (!trimmedEmail) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Subject
    const trimmedSubject = values.subject.trim();
    if (!trimmedSubject) {
      newErrors.subject = "Subject is required";
    } else if (trimmedSubject.length < 3 || trimmedSubject.length > 100) {
      newErrors.subject = "Subject must be 3-100 characters";
    }

    // Message
    const trimmedMessage = values.message.trim();
    if (!trimmedMessage) {
      newErrors.message = "Message is required";
    } else if (trimmedMessage.length < 10 || trimmedMessage.length > 2000) {
      newErrors.message = "Message must be 10-2000 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return { errors, validate, clearErrors };
};