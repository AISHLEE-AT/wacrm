"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * AutoSessionSync Component
 * Automatically captures `access_token` and `refresh_token` from URL query parameters
 * (passed from the FAGO Flutter mobile app's WebView), signs in the client Supabase
 * instance, sets session cookies, and cleans up the URL bar.
 */
export function AutoSessionSync() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get("access_token");
    const refreshToken = urlParams.get("refresh_token");

    if (accessToken && refreshToken) {
      const supabase = createClient();
      
      const cleanUrl = () => {
        // Clean up tokens from browser URL bar after successful session sync or if already logged in
        urlParams.delete("access_token");
        urlParams.delete("refresh_token");
        const newSearch = urlParams.toString();
        const newUrl =
          window.location.pathname +
          (newSearch ? `?${newSearch}` : "") +
          window.location.hash;
        window.history.replaceState(null, "", newUrl);
      };

      // Check if we already have a valid session via cookies
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) {
          // Already have a valid session, just clean the URL
          cleanUrl();
        } else {
          // No valid session, use the URL tokens
          supabase.auth
            .setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            })
            .then(({ error }) => {
              if (!error) {
                cleanUrl();
              } else {
                console.error("AutoSessionSync setSession error:", error);
              }
            });
        }
      });
    }
  }, []);

  return null;
}
