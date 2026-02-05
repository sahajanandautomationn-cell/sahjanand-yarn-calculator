"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../lib/firebase";
import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "firebase/auth";
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    onSnapshot,
    serverTimestamp
} from "firebase/firestore";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribeDoc = null; // Store Firestore User Listener

        // Safety timeout: If Firebase takes >3s, assume not logged in and let app load
        const timeoutId = setTimeout(() => {
            console.warn("Firebase Auth timed out. Forcing app load.");
            setLoading(false);
        }, 3000);

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            clearTimeout(timeoutId); // Msg received, cancel timeout

            if (currentUser) {
                try {
                    const userRef = doc(db, "users", currentUser.uid);
                    let userDoc = await getDoc(userRef);

                    // 1. Auto-Create if missing
                    if (!userDoc.exists()) {
                        console.log("User doc missing. Creating default profile...");
                        const newProfile = {
                            email: currentUser.email,
                            role: "user",
                            active: true,
                            sessionId: Date.now().toString(), // Init Session
                            createdAt: serverTimestamp()
                        };
                        try {
                            await setDoc(userRef, newProfile);
                            localStorage.setItem("sessionId", newProfile.sessionId); // Set Logic

                            setUser(currentUser);
                            setUserData(newProfile);
                        } catch (createErr) {
                            console.error("Auto-creation failed:", createErr);
                            await signOut(auth);
                            throw new Error("Account setup failed. Contact Admin.");
                        }
                    } else {
                        // 2. Doc exists - check status & session
                        const data = userDoc.data();

                        // Check Active Status
                        if (data.active === false) {
                            await signOut(auth);
                            setUser(null);
                            setUserData(null);
                            setLoading(false);
                            return;
                        }

                        setUser(currentUser);
                        setUserData(data);

                        // 3. Start Real-time Session Listener
                        if (unsubscribeDoc) unsubscribeDoc(); // Cleanup old

                        unsubscribeDoc = onSnapshot(userRef, async (snapshot) => {
                            if (snapshot.exists()) {
                                const newData = snapshot.data();

                                // Check Active Status Dynamic
                                if (newData.active === false) {
                                    alert("Your account has been restricted.");
                                    await signOut(auth);
                                    window.location.href = "/login";
                                    return;
                                }

                                // Check Session ID Concurrent
                                const serverSession = newData.sessionId;
                                const localSession = localStorage.getItem("sessionId");

                                if (serverSession && localSession && serverSession !== localSession) {
                                    // Session Mismatch -> Logout
                                    console.warn("Session Mismatch - Logging out.");
                                    if (unsubscribeDoc) unsubscribeDoc(); // Stop listening
                                    await signOut(auth);
                                    alert("You have been logged in on another device. This session is closed.");
                                    window.location.href = "/login";
                                }

                                // Update local data
                                setUserData(newData);
                            }
                        });
                    }
                } catch (e) {
                    console.error("Auth Error:", e);
                    setUser(null);
                    setUserData(null);
                }
            } else {
                setUser(null);
                setUserData(null);
                if (unsubscribeDoc) unsubscribeDoc();
            }
            setLoading(false);
        }, (error) => {
            clearTimeout(timeoutId);
            console.error("Firebase Auth Error:", error);
            setLoading(false);
        });

        return () => {
            unsubscribe();
            if (unsubscribeDoc) unsubscribeDoc();
            clearTimeout(timeoutId);
        };
    }, []);

    const login = async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const uid = userCredential.user.uid;

            // Check basic access before setting session
            const userRef = doc(db, "users", uid);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
                const data = userDoc.data();
                if (data.active === false) {
                    await signOut(auth);
                    throw new Error("Your account has been disabled by Admin.");
                }
            }

            // Generate & Set New Session ID
            const newSessionId = Date.now().toString();
            // 1. Local
            localStorage.setItem("sessionId", newSessionId);
            // 2. Server (This invalidates other sessions)
            // Use setDoc with merge or updateDoc if exists. Since we just checked, we know it might exist, but if it's the VERY first time of auto-create, onAuthStateChanged handles it. 
            // Ideally we want to ensure we update it here if it exists.
            if (userDoc.exists()) {
                await updateDoc(userRef, { sessionId: newSessionId });
            }
            // (If it doesn't exist, onAuthStateChanged will create it with a new sessionId anyway, but we should probably wait?)
            // Actually, standard login flow: user exists.

            return true;
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        setUserData(null);
        setUser(null);
        return await signOut(auth);
    };

    return (
        <AuthContext.Provider value={{
            user,
            userData,
            loading,
            login,
            logout
        }}>
            {loading ? (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#0a192f", color: "var(--accent-cyan)" }}>
                    <div style={{ textAlign: "center" }}>
                        <h2>Loading Application...</h2>
                        <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Connecting to Firebase</p>
                    </div>
                </div>
            ) : children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
