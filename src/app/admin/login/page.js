"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase"; // Check path: src/app/admin/login -> ../../../lib/firebase

export default function AdminLoginPage() {
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
            // Check role directly for immediate feedback or rely on AuthContext effect
            // But verify here to be safe before redirecting
            // Actually login() already verifies active status. We need to check ROLE.
            // Need user.uid. `login` calls signIn which updates auth state.
            // But `login` returns void (or true).
            // We can fetch doc here or wait.
            // Simplest: Redirect to dashboard, let Dashboard protector handle it.
            router.push("/admin/dashboard");
        } catch (err) {
            setError(err.message || "Failed to login");
        }
    };

    return (
        <div className="container" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="glass-panel" style={{ padding: "40px", width: "100%", maxWidth: "400px", border: "1px solid var(--accent-cyan)" }}>
                <h1 className="text-gradient" style={{ textAlign: "center", marginBottom: "8px" }}>Admin Panel</h1>
                <p style={{ textAlign: "center", color: "var(--text-secondary)", marginBottom: "30px", fontSize: "14px" }}>Authorized Personnel Only</p>

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: "20px" }}>
                        <label style={{ display: "block", color: "var(--text-secondary)", marginBottom: "8px" }}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="admin@sahjanand.com"
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
                        Login to Dashboard
                    </button>
                </form>

                {error && (
                    <div style={{ marginTop: "20px", padding: "10px", background: "rgba(255, 77, 77, 0.1)", border: "1px solid #ff4d4d", borderRadius: "8px", color: "#ff4d4d", fontSize: "14px", textAlign: "center" }}>
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}
