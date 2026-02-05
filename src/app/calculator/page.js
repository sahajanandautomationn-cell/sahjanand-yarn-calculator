"use client";

import { useAuth } from "../AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Calculator from "./Calculator";

export default function CalculatorPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) return <div className="container" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "var(--text-secondary)" }}>Loading Calculator...</div>;

  return <Calculator />;
}
