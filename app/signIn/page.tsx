"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Signed in user:", userCredential.user);
      // Redirect back to the previous page
      router.back();
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Sign In</h1>
      <form
        onSubmit={handleSignIn}
        style={{
          display: "flex",
          flexDirection: "column",
          maxWidth: "300px",
          backgroundColor: "white",
          color: "black",
          padding: "2rem",
          borderRadius: "4px",
          minWidth: "300px",
        }}
      >
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          required
          style={{ marginBottom: "1rem" }}
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          required
          style={{ marginBottom: "1rem" }}
        />

        <button type="submit">Sign In</button>
      </form>
    </div>
  );
}
