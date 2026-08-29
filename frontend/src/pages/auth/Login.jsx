import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";
import Button from "../../components/ui/Button";
import { loginUser } from "../../services/auth.service";
import { validateLoginForm } from "../../utils/validation";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Login form data
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Frontend validation errors
  const [errors, setErrors] = useState({});

  // Backend authentication error
  const [loginError, setLoginError] = useState("");

  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // Handle input changes
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field validation error
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Clear backend error
    if (loginError) {
      setLoginError("");
    }
  };

  // Handle login
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Prevent duplicate API requests
    if (isLoading) {
      return;
    }

    // Clear previous backend error
    setLoginError("");

    // Validate form
    const validationErrors = validateLoginForm(formData);

    setErrors(validationErrors);

    // Stop if validation fails
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      setIsLoading(true);

      // Call backend login API
      const data = await loginUser({
        email: formData.email,
        password: formData.password,
      });

      console.log("Login successful:", data);

      // Store authenticated user in AuthContext
      login(data.user, data.token);

      // Redirect to dashboard
      navigate("/dashboard");

    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Invalid email or password.";

      setLoginError(message);

      console.error("Login failed:", message);

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to securely access your Finova account."
    >
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-slate-200"
          >
            Email address
          </label>

          <div className="relative">
            <Mail
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
              disabled={isLoading}
              className={`w-full rounded-xl border bg-white/5 py-3.5 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600 transition focus:bg-white/[0.07] focus:ring-2 ${
                errors.email
                  ? "border-red-500/60 focus:border-red-500/60 focus:ring-red-500/10"
                  : "border-white/10 focus:border-blue-500/60 focus:ring-blue-500/10"
              }`}
            />
          </div>

          {errors.email && (
            <p className="mt-2 text-xs text-red-400">
              {errors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-200"
            >
              Password
            </label>

            <button
              type="button"
              disabled={isLoading}
              className="text-xs font-medium text-blue-400 transition-colors hover:text-blue-300 disabled:opacity-50"
            >
              Forgot password?
            </button>
          </div>

          <div className="relative">
            <LockKeyhole
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={isLoading}
              className={`w-full rounded-xl border bg-white/5 py-3.5 pl-11 pr-12 text-sm text-white outline-none placeholder:text-slate-600 transition focus:bg-white/[0.07] focus:ring-2 ${
                errors.password
                  ? "border-red-500/60 focus:border-red-500/60 focus:ring-red-500/10"
                  : "border-white/10 focus:border-blue-500/60 focus:ring-blue-500/10"
              }`}
            />

            {/* Password visibility */}
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              disabled={isLoading}
              aria-label={
                showPassword ? "Hide password" : "Show password"
              }
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-300 disabled:opacity-50"
            >
              {showPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>

          {errors.password && (
            <p className="mt-2 text-xs text-red-400">
              {errors.password}
            </p>
          )}
        </div>

        {/* Backend authentication error */}
        {loginError && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
            <p className="text-center text-sm text-red-400">
              {loginError}
            </p>
          </div>
        )}

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>

        {/* Register */}
        <p className="text-center text-sm text-slate-400">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-blue-400 transition-colors hover:text-blue-300"
          >
            Create one
          </Link>
        </p>

      </form>
    </AuthLayout>
  );
};

export default Login;