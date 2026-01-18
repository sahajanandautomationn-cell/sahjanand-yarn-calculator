"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const router = useRouter();

  // 🔒 One-time login check
  useEffect(() => {
    const loggedIn = localStorage.getItem("loggedIn");
    if (loggedIn === "true") {
      router.replace("/calculator");
    }
  }, [router]);

  const handleLogin = () => {
    if (password === "1234") {
      localStorage.setItem("loggedIn", "true");
      router.replace("/calculator");
    } else {
      alert("Wrong password");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2>🔐 Sahjanand Login</h2>

        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleLogin}>Login</button>
      </div>
    </div>
  );
}

