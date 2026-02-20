import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import "./index.css";
import App from "./App.jsx";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in .env");
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      signInForceRedirectUrl="/dashboard"
      signUpForceRedirectUrl="/dashboard"
      appearance={{
        variables: {
          colorPrimary: "#10B981",
          colorBackground: "#0F0F0F",
          colorText: "#FFFFFF",
          colorTextSecondary: "#9CA3AF",
          colorInputBackground: "#000000",
          colorInputText: "#FFFFFF",
          borderRadius: "0.75rem",
        },
        elements: {
          card: "bg-[#0F0F0F] border border-white/10 shadow-[0_0_80px_rgba(16,185,129,0.08)]",
          formButtonPrimary:
            "bg-emerald-400 text-black hover:bg-emerald-300 font-semibold",
          footerActionLink: "text-emerald-400 hover:text-emerald-300",
        },
      }}
    >
      <App />
    </ClerkProvider>
  </StrictMode>
);
