"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../AuthContext";

export default function UserLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { login } = useAuth();
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await login(email, password);
            router.push("/calculator");
        } catch (err) {
            setError(err.message || "Failed to login");
        }
    };

    return (
        <div className="container" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="glass-panel" style={{ padding: "40px", width: "100%", maxWidth: "400px" }}>
                <h1 className="text-gradient" style={{ textAlign: "center", marginBottom: "30px" }}>Login</h1>

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: "20px" }}>
                        <label style={{ display: "block", color: "var(--text-secondary)", marginBottom: "8px" }}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="abc@gmail.com"
                            style={{ width: "100%", padding: "12px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: "30px" }}>
                        <label style={{ display: "block", color: "var(--text-secondary)", marginBottom: "8px" }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            style={{ width: "100%", padding: "12px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary" style={{ width: "100%" }}>
                        Access Calculator
                    </button>
                </form>

                {error && (
                    <div style={{ marginTop: "20px", padding: "10px", background: "rgba(255, 77, 77, 0.1)", border: "1px solid #ff4d4d", borderRadius: "8px", color: "#ff4d4d", fontSize: "14px", textAlign: "center" }}>
                        {error}
                    </div>
                )}

                <div style={{ marginTop: "20px", textAlign: "center", fontSize: "12px", color: "var(--text-secondary)" }}>
                    <p>Don't have an account? Contact Admin.</p>
                </div>

                <div style={{ marginTop: "30px", textAlign: "center", fontSize: "12px", color: "#00d2ff", fontWeight: "600", letterSpacing: "1px", textShadow: "0 0 10px rgba(0, 210, 255, 0.6)" }}>
                    Powered by :- Sahjanand Automation
                </div>
            </div>
        </div>
    );
}
