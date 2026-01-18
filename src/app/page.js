"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const router = useRouter();

  // ✅ CHECK LOGIN ON PAGE LOAD
  useEffect(() => {
    const loggedIn = localStorage.getItem("loggedIn");
    if (loggedIn === "true") {
      router.replace("/calculator");
    }
  }, [router]);

  const handleLogin = async () => {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      localStorage.setItem("loggedIn", "true"); // ✅ SAVE ONCE
      router.replace("/calculator");
    } else {
      alert("Wrong password");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2>🔐 Login</h2>
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

