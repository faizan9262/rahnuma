import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { Eye, EyeOff } from "lucide-react";
import { googleOauth, loginUser } from "@/libs/apis/auth";
import { useAuthStore } from "@/stores/authStore";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")

  const naviagte = useNavigate()

  const {login,user} = useAuthStore()

  const handleLogin = async ()=>{
    try {
      toast.loading("Loggin You In",{id:'login'})
      const res = await loginUser(email,password)
      login(res.user)
      naviagte('/')
      toast.success('Login In Successful',{id:'login'})
    } catch (error) {
      console.log(error);
      toast.error("Login Failed")
    }
  }

  const handleGoogleLogin = () => {
    // Redirect user to backend OAuth login route
    window.location.href = "http://localhost:8000/auth/google/login";
  };
  
  useEffect(()=>{
    user?.id && naviagte('/')
  },[user])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-4 sm:px-6">
      <div className="w-full max-w-md bg-primary/30 border-primary border-2 sm:max-w-lg p-6 sm:p-8 md:p-10 rounded-3xl card shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden">

        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center text-foreground font-display">
          Login to Rehnuma
        </h1>

        {/* Email Input */}
        <div className="flex flex-col mb-4 sm:mb-6">
          <label
            htmlFor="email"
            className="mb-1 sm:mb-2 text-foreground/80 font-semibold text-sm sm:text-base"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            onChange={(e)=>setEmail(e.target.value)}
            placeholder="you@example.com"
            className="p-2 sm:p-3 rounded-xl border border-foreground/20 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition text-sm sm:text-base"
          />
        </div>

        {/* Password Input */}
        <div className="flex flex-col mb-4 sm:mb-6 relative">
          <label
            htmlFor="password"
            className="mb-1 sm:mb-2 text-foreground/80 font-semibold text-sm sm:text-base"
          >
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              onChange={(e)=>setPassword(e.target.value)}
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

        <Button onClick={handleLogin} className="w-full bg-primary text-background mb-3 sm:mb-4 hover:bg-primary-hover shadow-md transition">
          Login
        </Button>

        <Button onClick={handleGoogleLogin} className="w-full border border-foreground/30 bg-background text-foreground hover:bg-foreground/5 flex items-center justify-center gap-2 mb-4 shadow-sm transition text-sm sm:text-base">
          <FcGoogle size={20} />
          Continue with Google
        </Button>

        {/* Sign Up Link */}
        <p className="text-center text-foreground/80 text-sm sm:text-base">
          Don't have an account?{" "}
          <a
            href="/signup"
            className="text-primary font-semibold hover:underline"
          >
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}
