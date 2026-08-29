import { Eye, EyeOff, LockKeyhole, Mail, User } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";
import Button from "../../components/ui/Button";
import { validateRegisterForm } from "../../utils/validation";
import { registerUser } from "../../services/auth.service";
import { useAuth } from "../../context/AuthContext";

const Register = () => {
      const navigate = useNavigate();
const { login } = useAuth();

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Register form data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Validation and API errors
  const [errors, setErrors] = useState({});

  // Handle input changes
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for the field being edited
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Handle registration
const handleSubmit = async (event) => {
  event.preventDefault();

  // Validate form before API request
  const validationErrors = validateRegisterForm(formData);

  setErrors(validationErrors);

  // Stop if validation fails
  if (Object.keys(validationErrors).length > 0) {
    return;
  }

  try {
    // Send registration request to backend
    const data = await registerUser({
      name: formData.name,
      email: formData.email,
      password: formData.password,
    });

    console.log("Registration successful:", data);

    // Store authenticated user
    login(data.user, data.token);

    // Redirect to dashboard
    navigate("/dashboard");

  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Registration failed. Please try again.";

    // Show backend error
    setErrors((prev) => ({
      ...prev,
      email: message,
    }));

    console.error("Registration failed:", message);
  }
};

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Open your secure Finova banking account in minutes."
    >
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium text-slate-200"
          >
            Full name
          </label>

          <div className="relative">
            <User
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              autoComplete="name"
              className={`w-full rounded-xl border bg-white/5 py-3.5 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600 transition focus:bg-white/[0.07] focus:ring-2 ${
                errors.name
                  ? "border-red-500/60 focus:border-red-500/60 focus:ring-red-500/10"
                  : "border-white/10 focus:border-blue-500/60 focus:ring-blue-500/10"
              }`}
            />
          </div>

          {errors.name && (
            <p className="mt-2 text-xs text-red-400">
              {errors.name}
            </p>
          )}
        </div>

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
              className={`w-full rounded-xl border bg-white/5 py-3.5 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600 transition focus:bg-white/[0.07] focus:ring-2 ${
                errors.email
                  ? "border-red-500/60 focus:border-red-500/60 focus:ring-red-500/10"
                  : "border-white/10 focus:border-blue-500/60 focus:ring-blue-500/10"
              }`}
            />
          </div>

          {/* Email error */}
          {errors.email && (
            <p className="mt-2 text-xs text-red-400">
              {errors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-slate-200"
          >
            Password
          </label>

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
              placeholder="Create a password"
              autoComplete="new-password"
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
              aria-label={
                showPassword ? "Hide password" : "Show password"
              }
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-300"
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

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-2 block text-sm font-medium text-slate-200"
          >
            Confirm password
          </label>

          <div className="relative">
            <LockKeyhole
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              autoComplete="new-password"
              className={`w-full rounded-xl border bg-white/5 py-3.5 pl-11 pr-12 text-sm text-white outline-none placeholder:text-slate-600 transition focus:bg-white/[0.07] focus:ring-2 ${
                errors.confirmPassword
                  ? "border-red-500/60 focus:border-red-500/60 focus:ring-red-500/10"
                  : "border-white/10 focus:border-blue-500/60 focus:ring-blue-500/10"
              }`}
            />

            {/* Confirm password visibility */}
            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword((prev) => !prev)
              }
              aria-label={
                showConfirmPassword
                  ? "Hide password"
                  : "Show password"
              }
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-300"
            >
              {showConfirmPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>

          {errors.confirmPassword && (
            <p className="mt-2 text-xs text-red-400">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        {/* General API error */}
        {errors.form && (
          <p className="text-center text-sm text-red-400">
            {errors.form}
          </p>
        )}

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          className="w-full"
        >
          Create account
        </Button>

        {/* Login */}
        <p className="text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-blue-400 transition-colors hover:text-blue-300"
          >
            Sign in
          </Link>
        </p>

      </form>
    </AuthLayout>
  );
};

export default Register;