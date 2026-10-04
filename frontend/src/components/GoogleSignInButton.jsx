import React, { useEffect, useRef } from "react";
import apiClient from "../api/client.js";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();

function loadGoogleIdentity() {
  if (window.google?.accounts?.id) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-logitrack-google="true"]');
    if (existing) {
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", reject, { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.dataset.logitrackGoogle = "true";
    script.onload = resolve;
    script.onerror = () => reject(new Error("Google Sign-In could not be loaded."));
    document.head.appendChild(script);
  });
}

export default function GoogleSignInButton({ onSuccess, onError }) {
  const hostRef = useRef(null);

  useEffect(() => {
    if (!clientId || !hostRef.current) return undefined;
    let active = true;
    loadGoogleIdentity()
      .then(() => {
        if (!active || !hostRef.current) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async ({ credential }) => {
            try {
              const result = await apiClient.googleAuth(credential);
              onSuccess(result.user);
            } catch (error) {
              onError(error.message);
            }
          },
          cancel_on_tap_outside: true,
        });
        hostRef.current.replaceChildren();
        window.google.accounts.id.renderButton(hostRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          shape: "pill",
          text: "continue_with",
          width: Math.min(360, hostRef.current.clientWidth || 360),
        });
      })
      .catch((error) => onError(error.message));
    return () => { active = false; };
  }, [onError, onSuccess]);

  if (!clientId) {
    return null;
  }

  return <div ref={hostRef} className="flex min-h-10 w-full justify-center" aria-label="Sign in with Google" />;
}
