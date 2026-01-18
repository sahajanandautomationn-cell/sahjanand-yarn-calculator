"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import "./login.css";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
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
