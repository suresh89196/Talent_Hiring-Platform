"use client";

import { useEffect } from "react";

export default function HomePage() {
  useEffect(() => {
    // Redirect to jobs page as the main entry point
    window.location.href = "/jobs";
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">TalentFlow</h1>
        <p className="text-gray-600">Redirecting to jobs...</p>
      </div>
    </div>
  );
}
