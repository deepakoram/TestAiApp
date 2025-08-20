import { useState } from "react";

export default function Signup({ onSignup, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // For demo purposes, we'll just call the onSignup callback
    onSignup({
      name: formData.name,
      email: formData.email
    });

    setIsLoading(false);
  };

  return (
    <div className="max-w-md mx-auto space-y-6 bg-white p-4 rounded-xl">
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
        <p className="text-gray-600">Join us and get started</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
            className={`w-full px-4 py-3 rounded-xl border transition-colors ${
              errors.name 
                ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200" 
                : "border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
            }`}
            placeholder="Enter your full name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            className={`w-full px-4 py-3 rounded-xl border transition-colors ${
              errors.email 
                ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200" 
                : "border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
            }`}
            placeholder="Enter your email"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            className={`w-full px-4 py-3 rounded-xl border transition-colors ${
              errors.password 
                ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200" 
                : "border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
            }`}
            placeholder="Create a password"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className={`w-full px-4 py-3 rounded-xl border transition-colors ${
              errors.confirmPassword 
                ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200" 
                : "border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
            }`}
            placeholder="Confirm your password"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white font-medium rounded-xl transition-colors disabled:cursor-not-allowed"
        >
          {isLoading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <div className="text-center">
        <p className="text-gray-600">
          Already have an account?{" "}
          <button
            onClick={onSwitchToLogin}
            className="text-sky-600 hover:text-sky-700 font-medium"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
} 