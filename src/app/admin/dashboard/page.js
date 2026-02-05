"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../AuthContext";
import { db, functions } from "../../../lib/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";

export default function AdminDashboard() {
    const { user, userData, loading, logout } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [fetching, setFetching] = useState(true);


    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.replace("/admin/login");
            } else if (userData?.role !== "admin") {
                router.replace("/calculator"); // Not admin
            } else {
                fetchUsers();
            }
        }
    }, [user, userData, loading, router]);

    const fetchUsers = async () => {
        setFetching(true);
        try {
            const querySnapshot = await getDocs(collection(db, "users"));
            const list = [];
            querySnapshot.forEach(doc => {
                list.push({ id: doc.id, ...doc.data() });
            });
            setUsers(list);
        } catch (err) {
            console.error("Error fetching users:", err);
        }
        setFetching(false);
    };


    const handleToggleAccess = async (uid, currentStatus) => {
        const toggleUserAccess = httpsCallable(functions, "toggleUserAccess");
        try {
            // Optimistic update
            setUsers(users.map(u => u.id === uid ? { ...u, active: !currentStatus } : u));

            await toggleUserAccess({ uid, active: !currentStatus });
        } catch (err) {
            console.error("Error toggling access:", err);
            fetchUsers(); // Revert on error
            alert("Failed to update access: " + err.message);
        }
    };

    if (loading || !userData || userData.role !== 'admin') return <div className="container" style={{ padding: "50px", textAlign: "center" }}>Loading Dashboard...</div>;

    return (
        <div className="container">
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
                <h1 className="text-gradient" style={{ fontSize: "24px" }}>Admin Dashboard</h1>
                <button onClick={() => { logout(); router.push("/admin/login"); }} className="btn-secondary" style={{ padding: "8px 16px", fontSize: "14px" }}>
                    Logout
                </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>


                {/* User List Panel */}
                <div className="glass-panel" style={{ padding: "24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                        <h2 style={{ fontSize: "18px", color: "white" }}>User Management</h2>
                        <button onClick={fetchUsers} style={{ background: "transparent", border: "none", color: "var(--accent-cyan)", cursor: "pointer" }}>↻ Refresh</button>
                    </div>

                    {fetching ? <p>Loading users...</p> : (
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                                <thead>
                                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", textAlign: "left" }}>
                                        <th style={{ padding: "10px", color: "var(--text-secondary)" }}>Email</th>
                                        <th style={{ padding: "10px", color: "var(--text-secondary)" }}>Role</th>
                                        <th style={{ padding: "10px", color: "var(--text-secondary)" }}>Status</th>
                                        <th style={{ padding: "10px", color: "var(--text-secondary)", textAlign: "right" }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                            <td style={{ padding: "10px" }}>{u.email}</td>
                                            <td style={{ padding: "10px" }}>
                                                <select
                                                    value={u.role}
                                                    onChange={async (e) => {
                                                        const newRole = e.target.value;
                                                        // Optimistic Update
                                                        setUsers(users.map(user => user.id === u.id ? { ...user, role: newRole } : user));
                                                        try {
                                                            await updateDoc(doc(db, "users", u.id), { role: newRole });
                                                        } catch (err) {
                                                            console.error("Failed to update role:", err);
                                                            alert("Update failed");
                                                            fetchUsers();
                                                        }
                                                    }}
                                                    style={{
                                                        background: u.role === 'admin' ? "rgba(255, 215, 0, 0.2)" : "rgba(100, 255, 218, 0.1)",
                                                        color: u.role === 'admin' ? "#ffd700" : "var(--accent-cyan)",
                                                        border: "none",
                                                        padding: "4px 8px", borderRadius: "10px", fontSize: "11px",
                                                        cursor: "pointer"
                                                    }}
                                                >
                                                    <option value="user" style={{ background: "#0a192f", color: "var(--accent-cyan)" }}>user</option>
                                                    <option value="admin" style={{ background: "#0a192f", color: "#ffd700" }}>admin</option>
                                                </select>
                                            </td>
                                            <td style={{ padding: "10px" }}>
                                                <span style={{ color: u.active ? "#2ecc71" : "#ff4d4d" }}>
                                                    {u.active ? "Active" : "Disabled"}
                                                </span>
                                            </td>
                                            <td style={{ padding: "10px", textAlign: "right" }}>
                                                {u.role !== 'admin' && (
                                                    <button
                                                        onClick={() => handleToggleAccess(u.id, u.active)}
                                                        style={{
                                                            background: u.active ? "rgba(255, 77, 77, 0.2)" : "rgba(46, 204, 113, 0.2)",
                                                            color: u.active ? "#ff4d4d" : "#2ecc71",
                                                            border: "none", padding: "6px 12px", borderRadius: "5px", cursor: "pointer"
                                                        }}
                                                    >
                                                        {u.active ? "Disable" : "Enable"}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {users.length === 0 && <p style={{ padding: "20px", textAlign: "center", color: "var(--text-secondary)" }}>No users found.</p>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
