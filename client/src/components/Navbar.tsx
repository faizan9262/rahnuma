import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu as MenuIcon, X, LogOut } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { toast } from "sonner";
import { logoutUser } from "@/libs/apis/auth";
import ConfirmAlert from "./ConfirmAlert";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore(); // assuming you have logout in store

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Features", path: "/features" },
    { label: "Files", path: "/files" },
    { label: "Contact", path: "/contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    try {
      toast.loading("Loggin You Out", { id: "logout" });
      const res = await logoutUser();
      console.log("Response: ", res);
      logout();
      navigate("/");
      toast.success("Log Out Sucessful", { id: "logout" });
    } catch (error) {
      console.log(error);
      toast.error("Logout Failed", { id: "logout" });
    }
  };

  
  if (user === undefined) return null;
  // console.log("User: ", user);

  return (
    <nav className="sticky top-0 z-50 w-full bg-secondary shadow-lg backdrop-blur-md transition-colors border-b-2 border-secondary">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        <button
          onClick={() => navigate("/")}
          className="font-bold text-xl text-primary bg-secondary py-2 rounded-full px-8 border-2 border-primary"
        >
          راہنما
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6 text-foreground">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`hover:text-primary transition-colors ${
                isActive(item.path) ? "text-primary font-semibold" : ""
              }`}
            >
              {item.label}
            </button>
          ))}

          {user ? (
            <div className="flex items-center gap-4 ">
              {user?.profile_picture ? (
                <img
                  src={user?.profile_picture}
                  alt="Profile"
                  className="w-12 h-12 rounded-full object-cover border-2 border-primary"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-white border-2 border-primary">
                  {user?.username?.[0] || "U"}
                </div>
              )}

              <ConfirmAlert
                trigger={
                  <Button size="sm" variant="default">
                    <LogOut className="h-4 w-4" />
                  </Button>
                }
                message={`You want to logout?`}
                onConfirm={handleLogout}
              />
            </div>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate("/login")}>
                Login
              </Button>
              <Button onClick={() => navigate("/signup")}>Sign Up</Button>
            </>
          )}
        </div>

        {/* Mobile Menu / Profile Menubar */}
        <div className="md:hidden flex items-center gap-2">
          {user ? (
            <Menubar className="border-0">
              <MenubarMenu>
                <MenubarTrigger className="p-0 m-0 border-0 bg-transparent rounded-full">
                  <img
                    src={user?.profile_picture}
                    alt="Profile"
                    className="w-10 h-10 border-2 border-primary rounded-full object-cover"
                  />
                </MenubarTrigger>

                <MenubarContent className="bg-background border border-secondary">
                  {navItems.map((item) => (
                    <MenubarItem
                      key={item.label}
                      onClick={() => navigate(item.path)}
                      className={
                        isActive(item.path) ? "text-primary font-semibold" : ""
                      }
                    >
                      {item.label}
                    </MenubarItem>
                  ))}
                  <MenubarItem
                    onClick={handleLogout}
                    className="text-destructive flex items-center gap-1"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
          ) : (
            <button
              className="p-2 rounded-md hover:bg-accent transition-colors"
              onClick={() => setOpen(!open)}
            >
              {open ? (
                <X className="h-6 w-6 text-foreground" />
              ) : (
                <MenuIcon className="h-6 w-6 text-foreground" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu for non-logged users */}
      {open && (!user || !user.profile_picture) && (
        <div className="md:hidden bg-background border-t border-secondary">
          <div className="flex flex-col items-center gap-4 py-6 text-foreground">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  navigate(item.path);
                  setOpen(false);
                }}
                className={
                  isActive(item.path) ? "text-primary font-semibold" : ""
                }
              >
                {item.label}
              </button>
            ))}

            <Button
              variant="ghost"
              className="w-32"
              onClick={() => {
                navigate("/login");
                setOpen(false);
              }}
            >
              Login
            </Button>
            <Button
              className="w-32"
              onClick={() => {
                navigate("/signup");
                setOpen(false);
              }}
            >
              Sign Up
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
