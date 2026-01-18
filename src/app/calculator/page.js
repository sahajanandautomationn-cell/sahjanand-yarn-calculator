"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Calculator from "./Calculator";

export default function CalculatorPage() {
  const router = useRouter();

  useEffect(() => {
    const loggedIn = localStorage.getItem("loggedIn");
    if (loggedIn !== "true") {
      router.replace("/");
    }
  }, [router]);

  return <Calculator />;
}

