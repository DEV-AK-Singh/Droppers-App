import React, { useState } from "react";
import { LoginForm } from "./LoginForm.tsx";
import { RegisterForm } from "./RegisterForm.tsx";
import { UserRole } from "../types/auth.ts";

export const AuthLanding: React.FC = () => {
  const [isLogin, setIsLogin] = useState<boolean>(true);

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
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center">
            🚚 Droppers
          </h1>
          <p className="text-gray-600 text-lg">
            Connect vendors with delivery partners for seamless local deliveries
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
          {/* Left Side - Features */}
          <div className="bg-white rounded-2xl shadow-md p-6 md:col-span-2 w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Why Choose Droppers?
            </h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 border-b border-gray-200 pb-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <span className="text-blue-600">🏪</span>
                    </div>
                    <h3 className="font-semibold text-gray-900">For Vendors</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Reach more customers with reliable delivery services. Focus
                    on your business while we handle the logistics.
                  </p>
                  <ul className="mt-2 space-y-1">
                    {roleDescriptions[UserRole.VENDOR].features.map(
                      (feature, index) => (
                        <li
                          key={index}
                          className="text-xs text-gray-500 flex items-center"
                        >
                          <svg
                            className="w-3 h-3 mr-1 text-green-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {feature}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>

              <div className="flex items-start space-x-3 border-b border-gray-200 pb-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <span className="text-green-600">🚗</span>
                    </div>
                    <h3 className="font-semibold text-gray-900">
                      For Delivery Partners
                    </h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Earn money by delivering local orders. Flexible schedule and
                    competitive pay.
                  </p>
                  <ul className="mt-2 space-y-1">
                    {roleDescriptions[UserRole.DELIVERY_PARTNER].features.map(
                      (feature, index) => (
                        <li
                          key={index}
                          className="text-xs text-gray-500 flex items-center"
                        >
                          <svg
                            className="w-3 h-3 mr-1 text-green-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {feature}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <span className="text-purple-600">⚡</span>
                    </div>
                    <h3 className="font-semibold text-gray-900">
                      Fast & Reliable
                    </h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Real-time order tracking and quick delivery times for the
                    best customer experience.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Auth Form */}
          <div className=" md:col-span-3 w-full">
            {isLogin ? (
              <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
            ) : (
              <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>
            © 2024 Droppers. Connecting local businesses with delivery partners.
          </p>
        </div>
      </div>
    </div>
  );
};
