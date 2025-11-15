import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { type RegisterData, UserRole } from "../types/auth.ts";

interface RegisterFormProps {
  onSwitchToLogin?: () => void;
  onSuccess?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSwitchToLogin,
  onSuccess,
}) => {
  const { register, error, clearError, loading } = useAuth();
  const [formData, setFormData] = useState<RegisterData>({
    email: "",
    password: "",
    name: "",
    phone: "",
    role: UserRole.VENDOR,
  });
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [localError, setLocalError] = useState<string>("");
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    phone: false,
    password: false,
    confirmPassword: false,
    role: false,
  });

  // Clear errors when component mounts or when auth error changes
  useEffect(() => {
    clearError();
    setLocalError("");
  }, [clearError]);

  // Handle form validation
  const validateForm = (): boolean => {
    const { name, email, phone, password, role } = formData;

    if (!name.trim()) {
      setLocalError("Full name is required");
      return false;
    }

    if (name.trim().length < 2) {
      setLocalError("Full name must be at least 2 characters long");
      return false;
    }

    if (!email.trim()) {
      setLocalError("Email is required");
      return false;
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setLocalError("Please enter a valid email address");
      return false;
    }

    if (!phone.trim()) {
      setLocalError("Phone number is required");
      return false;
    }

    if (!phone.match(/^\+?[\d\s-()]{10,}$/)) {
      setLocalError("Please enter a valid phone number");
      return false;
    }

    if (!password) {
      setLocalError("Password is required");
      return false;
    }

    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters long");
      return false;
    }

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match");
      return false;
    }

    if (!role) {
      setLocalError("Please select your role");
      return false;
    }

    setLocalError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await register(formData);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      // Error is already handled in the auth context
      console.error("Registration error:", err);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "confirmPassword") {
      setConfirmPassword(value);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === "role" ? (value as UserRole) : value,
      }));
    }

    // Clear error when user starts typing
    if (localError || error) {
      setLocalError("");
      clearError();
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));
  };

  // Field-specific validation
  const getFieldError = (field: string): string => {
    if (!touched[field as keyof typeof touched]) return "";

    switch (field) {
      case "name":
        if (!formData.name.trim()) return "Full name is required";
        if (formData.name.trim().length < 2)
          return "Name must be at least 2 characters";
        return "";

      case "email":
        if (!formData.email) return "Email is required";
        if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
          return "Please enter a valid email";
        return "";

      case "phone":
        if (!formData.phone) return "Phone number is required";
        if (!formData.phone.match(/^\+?[\d\s-()]{10,}$/))
          return "Please enter a valid phone number";
        return "";

      case "password":
        if (!formData.password) return "Password is required";
        if (formData.password.length < 6)
          return "Password must be at least 6 characters";
        return "";

      case "confirmPassword":
        if (!confirmPassword) return "Please confirm your password";
        if (formData.password !== confirmPassword)
          return "Passwords do not match";
        return "";

      case "role":
        if (!formData.role) return "Please select your role";
        return "";

      default:
        return "";
    }
  };

  const displayError = localError || error;

  // Role descriptions for better UX
  const roleDescriptions = {
    [UserRole.VENDOR]: {
      title: "Vendor",
      description: "I want to use delivery services and grow my business",
      icon: "🏪",
      features: [
        "Create delivery orders",
        "Track order status",
        "Manage your store",
      ],
    },
    [UserRole.DELIVERY_PARTNER]: {
      title: "Delivery Partner",
      description: "I want to deliver orders and earn money",
      icon: "🚗",
      features: [
        "Accept delivery requests",
        "Flexible schedule",
        "Earn per delivery",
      ],
    },
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-green-600 to-green-700 px-6 py-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Join Droppers</h1>
          <p className="text-green-100 text-lg">
            Create your account and start delivering happiness
          </p>
        </div>

        {/* Form */}
        <div className="px-6 py-8">
          {displayError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center">
                <div className="shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {displayError}
                  </h3>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={() => handleBlur("name")}
                  required
                  className={`block w-full px-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 ${
                    getFieldError("name")
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  placeholder="Enter your full name"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg
                    className={`h-5 w-5 ${
                      getFieldError("name") ? "text-red-400" : "text-gray-400"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              {getFieldError("name") && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {getFieldError("name")}
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={() => handleBlur("email")}
                    required
                    className={`block w-full px-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 ${
                      getFieldError("email")
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    placeholder="Enter your email address"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <svg
                      className={`h-5 w-5 ${
                        getFieldError("email")
                          ? "text-red-400"
                          : "text-gray-400"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                </div>
                {getFieldError("email") && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {getFieldError("email")}
                  </p>
                )}
              </div>

              {/* Phone Field */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={() => handleBlur("phone")}
                    required
                    className={`block w-full px-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 ${
                      getFieldError("phone")
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    placeholder="Enter your phone number"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <svg
                      className={`h-5 w-5 ${
                        getFieldError("phone")
                          ? "text-red-400"
                          : "text-gray-400"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                </div>
                {getFieldError("phone") && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {getFieldError("phone")}
                  </p>
                )}
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                I want to join as
              </label>
              <div className="grid md:grid-cols-2 gap-6">
                {Object.values(UserRole)
                  .filter((role) => role !== UserRole.ADMIN)
                  .map((role) => (
                    <div key={role}>
                      <input
                        type="radio"
                        id={role}
                        name="role"
                        value={role}
                        checked={formData.role === role}
                        onChange={handleChange}
                        onBlur={() => handleBlur("role")}
                        className="hidden"
                      />
                      <label
                        htmlFor={role}
                        className={`block cursor-pointer p-4 border-2 rounded-xl transition-all duration-200 ${
                          formData.role === role
                            ? "border-green-500 bg-green-50 shadow-md transform scale-[1.02]"
                            : "border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50"
                        } ${getFieldError("role") ? "border-red-300" : ""}`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <div
                                className={`p-2 rounded-lg ${
                                  formData.role === role
                                    ? "bg-green-100"
                                    : "bg-gray-100"
                                }`}
                              >
                                <span className="text-lg">
                                  {roleDescriptions[role].icon}
                                </span>
                              </div>
                              <h3
                                className={`font-semibold ${
                                  formData.role === role
                                    ? "text-green-900"
                                    : "text-gray-900"
                                }`}
                              >
                                {roleDescriptions[role].title}
                              </h3>
                            </div>
                            <p
                              className={`text-sm mt-2 ${
                                formData.role === role
                                  ? "text-green-700"
                                  : "text-gray-600"
                              }`}
                            >
                              {roleDescriptions[role].description}
                            </p>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              formData.role === role
                                ? "border-green-500 bg-green-500"
                                : "border-gray-400"
                            }`}
                          >
                            {formData.role === role && (
                              <svg
                                className="w-3 h-3 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                        </div>
                      </label>
                    </div>
                  ))}
              </div>
              {getFieldError("role") && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {getFieldError("role")}
                </p>
              )}
            </div>

            {/* Password Fields */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={() => handleBlur("password")}
                    required
                    className={`block w-full px-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 ${
                      getFieldError("password")
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    placeholder="Create password"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <svg
                      className={`h-5 w-5 ${
                        getFieldError("password")
                          ? "text-red-400"
                          : "text-gray-400"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                {getFieldError("password") && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {getFieldError("password")}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={handleChange}
                    onBlur={() => handleBlur("confirmPassword")}
                    required
                    className={`block w-full px-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 ${
                      getFieldError("confirmPassword")
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    placeholder="Confirm your password"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <svg
                      className={`h-5 w-5 ${
                        getFieldError("confirmPassword")
                          ? "text-red-400"
                          : "text-gray-400"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                {getFieldError("confirmPassword") && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {getFieldError("confirmPassword")}
                  </p>
                )}
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Password Requirements:
              </h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li
                  className={`flex items-center ${
                    formData.password.length >= 6 ? "text-green-600" : ""
                  }`}
                >
                  <svg
                    className={`w-3 h-3 mr-2 ${
                      formData.password.length >= 6
                        ? "text-green-500"
                        : "text-gray-400"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    {formData.password.length >= 6 ? (
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    ) : (
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    )}
                  </svg>
                  At least 6 characters long
                </li>
                <li
                  className={`flex items-center ${
                    formData.password === confirmPassword && confirmPassword
                      ? "text-green-600"
                      : ""
                  }`}
                >
                  <svg
                    className={`w-3 h-3 mr-2 ${
                      formData.password === confirmPassword && confirmPassword
                        ? "text-green-500"
                        : "text-gray-400"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    {formData.password === confirmPassword &&
                    confirmPassword ? (
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    ) : (
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    )}
                  </svg>
                  Passwords must match
                </li>
              </ul>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating Account...
                </div>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Switch to Login */}
          {onSwitchToLogin && (
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="font-semibold text-green-600 hover:text-green-500 focus:outline-none focus:underline transition-colors duration-200"
                >
                  Sign in here
                </button>
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            By creating an account, you agree to our{" "}
            <button className="text-green-600 hover:text-green-500">
              Terms of Service
            </button>{" "}
            and{" "}
            <button className="text-green-600 hover:text-green-500">
              Privacy Policy
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
