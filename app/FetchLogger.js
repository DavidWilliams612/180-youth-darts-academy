"use client";

import { useEffect } from "react";

export default function FetchLogger() {
  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      try {
        console.log("🔍 FETCH:", args[0]);
        const response = await originalFetch(...args);
        return response;
      } catch (err) {
        console.error("❌ FETCH ERROR:", err);
        throw err;
      }
    };
  }, []);

  return null;
}
