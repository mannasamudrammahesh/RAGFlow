import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import { LogOut, User, ChevronDown } from "lucide-react";
import Logo from "./Logo";
import { useAuth } from "@/context/AuthContext";

const Navbar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsCollapsed(window.scrollY > 150);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setShowUserMenu(false);
    await signOut();
    router.push("/");
  };

  const userInitials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || "U";

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      <motion.div
        animate={{
          width: isCollapsed ? 48 : "auto",
          paddingLeft: isCollapsed ? 0 : 24,
          paddingRight: isCollapsed ? 0 : 24,
          paddingTop: isCollapsed ? 0 : 12,
          paddingBottom: isCollapsed ? 0 : 12,
        }}
        transition={{
          type: "spring",
          stiffness: isCollapsed ? 300 : 120,
          damping: isCollapsed ? 25 : 20,
          mass: isCollapsed ? 0.8 : 1.2,
          duration: isCollapsed ? undefined : 0.8,
        }}
        className="h-12 flex items-center justify-center bg-foreground/5 backdrop-blur-xl border border-foreground/10 rounded-full"
        whileHover={isCollapsed ? { scale: 1.1 } : {}}
      >
        {/* Collapsed Logo Icon */}
        <motion.div
          animate={{
            opacity: isCollapsed ? 1 : 0,
            scale: isCollapsed ? 1 : 0.3,
          }}
          transition={{ duration: isCollapsed ? 0.2 : 0.4, ease: "easeOut" }}
          onClick={() => isCollapsed && setIsCollapsed(false)}
          className="absolute cursor-pointer text-foreground"
        >
          <Logo variant="icon" className="w-8 h-8" />
        </motion.div>

        {/* Expanded content */}
        <motion.div
          animate={{
            opacity: isCollapsed ? 0 : 1,
            scale: isCollapsed ? 0.8 : 1,
          }}
          transition={{
            duration: isCollapsed ? 0.15 : 0.5,
            ease: [0.25, 0.1, 0.25, 1],
            delay: isCollapsed ? 0 : 0.1,
          }}
          className="flex items-center gap-8"
          style={{ pointerEvents: isCollapsed ? "none" : "auto" }}
        >
          {/* Logo */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              router.push("/");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="text-foreground hover:text-foreground/80 transition-colors"
          >
            <Logo variant="full" className="h-8" />
          </a>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            <a
              href="/#features"
              onClick={(e) => {
                e.preventDefault();
                if (window.location.pathname !== "/") {
                  router.push("/");
                  setTimeout(() => {
                    document.getElementById("features")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 100);
                } else {
                  document.getElementById("features")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }}
              className="text-sm text-foreground/70 hover:text-foreground transition-colors duration-200 px-4 py-1.5 rounded-full hover:bg-foreground/10 whitespace-nowrap cursor-pointer"
            >
              Features
            </a>
            <a
              href="/#how-it-works"
              onClick={(e) => {
                e.preventDefault();
                if (window.location.pathname !== "/") {
                  router.push("/");
                  setTimeout(() => {
                    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 100);
                } else {
                  document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }}
              className="text-sm text-foreground/70 hover:text-foreground transition-colors duration-200 px-4 py-1.5 rounded-full hover:bg-foreground/10 whitespace-nowrap cursor-pointer"
            >
              How it Works
            </a>
            <a
              href="/api-docs"
              onClick={(e) => {
                e.preventDefault();
                router.push("/api-docs");
              }}
              className="text-sm text-foreground/70 hover:text-foreground transition-colors duration-200 px-4 py-1.5 rounded-full hover:bg-foreground/10 whitespace-nowrap cursor-pointer"
            >
              API
            </a>
          </nav>

          {/* Auth Section */}
          <div className="flex items-center gap-2">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-foreground/10 animate-pulse" />
            ) : user ? (
              /* Logged-in user menu */
              <div className="relative" ref={userMenuRef}>
                <button
                  id="user-menu-btn"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-foreground/10 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-semibold text-primary">
                    {userInitials}
                  </div>
                  <ChevronDown className={`h-3 w-3 text-foreground/60 transition-transform ${showUserMenu ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-52 bg-card/90 backdrop-blur-xl border border-border/60 rounded-xl shadow-xl overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-border/40">
                        <p className="text-sm font-medium truncate">
                          {user.user_metadata?.full_name || "User"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <div className="p-1">
                        <button
                          onClick={() => { setShowUserMenu(false); router.push("/app"); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-muted/50 transition-colors text-left font-medium text-foreground"
                        >
                          <User className="h-4 w-4 text-primary" />
                          Chat Workspace
                        </button>
                        <button
                          onClick={() => { setShowUserMenu(false); router.push("/dashboard"); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-muted/50 transition-colors text-left font-medium text-foreground"
                        >
                          <User className="h-4 w-4 text-blue-400" />
                          Dashboard
                        </button>
                        <button
                          id="logout-btn"
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-destructive/10 text-destructive transition-colors text-left mt-1 border-t border-border/30 pt-2"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* Logged-out buttons */
              <>
                <button
                  onClick={() => router.push("/login")}
                  className="px-4 py-1.5 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors duration-200 whitespace-nowrap"
                >
                  Login
                </button>
                <button
                  onClick={() => router.push("/signup")}
                  className="px-5 py-1.5 bg-foreground text-background text-sm font-medium rounded-full hover:bg-foreground/90 transition-colors duration-200 whitespace-nowrap"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </header>
  );
};

export default Navbar;
