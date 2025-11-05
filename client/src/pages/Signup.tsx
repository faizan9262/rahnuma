import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { signupUser } from "@/libs/apis/auth";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const { singup, user } = useAuthStore();

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      toast.error("Password should match", { id: "signup" });
    }
    try {
      const res = await signupUser(username, email, password);

      console.log("Sign Up data: ", res.user);
      singup(res.user);
      toast.success("Registered Successful.", { id: "signup" });
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    user?.id && navigate("/");
  }, [user]);

  const handleGoogleLogin = () => {
    // Redirect user to backend OAuth login route
    window.location.href = "http://localhost:8000/auth/google/login";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-4 sm:px-6">
      <div className="w-full max-w-md bg-primary/30 border-2 border-primary sm:max-w-lg p-6 sm:p-8 md:p-10 rounded-3xl card shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-accent/10 to-primary/10 rounded-3xl -z-10"></div>

        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center text-foreground font-display">
          Sign Up to Rehnuma
        </h1>

        {/* Name */}
        <div className="flex flex-col mb-3 sm:mb-4">
          <label
            htmlFor="name"
            className="mb-1 sm:mb-2 text-foreground/80 font-semibold"
          >
            Username
          </label>
          <input
            type="text"
            id="name"
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your full name"
            className="p-2 sm:p-3 rounded-xl border border-foreground/20 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition text-sm sm:text-base"
          />
        </div>

        {/* Email */}
        <div className="flex flex-col mb-3 sm:mb-4">
          <label
            htmlFor="email"
            className="mb-1 sm:mb-2 text-foreground/80 font-semibold"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="p-2 sm:p-3 rounded-xl border border-foreground/20 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition text-sm sm:text-base"
          />
        </div>

        {/* Password */}
        <div className="flex flex-col mb-3 sm:mb-4 relative">
          <label
            htmlFor="password"
            className="mb-1 sm:mb-2 text-foreground/80 font-semibold"
          >
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full p-2 sm:p-3 pr-10 rounded-xl border border-foreground/20 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition text-sm sm:text-base"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-foreground/50 hover:text-foreground transition"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col mb-4 sm:mb-6 relative">
          <label
            htmlFor="confirm"
            className="mb-1 sm:mb-2 text-foreground/80 font-semibold"
          >
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              id="confirm"
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              className="w-full p-2 sm:p-3 pr-10 rounded-xl border border-foreground/20 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition text-sm sm:text-base"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-foreground/50 hover:text-foreground transition"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Signup Button */}
        <Button
          onClick={handleSignup}
          className="w-full bg-primary text-background mb-3 sm:mb-4 hover:bg-primary-hover shadow-md transition"
        >
          Sign Up
        </Button>

        {/* Continue with Google */}
        <Button
          onClick={handleGoogleLogin}
          className="w-full border border-foreground/30 bg-background text-foreground hover:bg-foreground/5 flex items-center justify-center gap-2 mb-4 shadow-sm transition text-sm sm:text-base"
        >
          <FcGoogle size={20} />
          Continue with Google
        </Button>

        {/* Login Link */}
        <p className="text-center text-foreground/80 text-sm sm:text-base">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-primary font-semibold hover:underline"
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
