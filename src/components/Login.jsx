import { useState } from "react";

export default function Login({ onLogin, onSwitchToSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Static demo credentials
  const DEMO_EMAIL = "test@test.com";
  const DEMO_PASSWORD = "test123";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      onLogin({ email, name: "Demo User" });
    } else {
      setError("Invalid email or password. Use test@test.com / test123");
    }
    
    setIsLoading(false);
  };

  return (
    <div className="max-w-md mx-auto space-y-6 bg-white p-4 rounded-xl">
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
        <p className="text-gray-600">Sign in to your account</p>
      </div>

      {/* Demo credentials hint */}
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
        <h3 className="font-semibold text-sky-800 mb-2">Demo Credentials</h3>
        <p className="text-sm text-sky-700">
          Email: <code className="bg-sky-100 px-1 rounded">test@test.com</code><br />
          Password: <code className="bg-sky-100 px-1 rounded">test123</code>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-colors"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-colors"
            placeholder="Enter your password"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white font-medium rounded-xl transition-colors disabled:cursor-not-allowed"
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="text-center">
        <p className="text-gray-600">
          Don't have an account?{" "}
          <button
            onClick={onSwitchToSignup}
            className="text-sky-600 hover:text-sky-700 font-medium"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
} 