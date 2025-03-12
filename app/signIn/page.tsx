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
      router.back();
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  return (
    <div className="p-8 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">Sign In</h1>
      <form 
        onSubmit={handleSignIn} 
        className="flex flex-col bg-white text-black p-8 rounded shadow-md w-full max-w-xs"
      >
        <label htmlFor="email" className="mb-1">Email</label>
        <input
          id="email"
          type="email"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          required
          className="mb-4 p-2 border border-gray-300 rounded"
        />

        <label htmlFor="password" className="mb-1">Password</label>
        <input
          id="password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          required
          className="mb-4 p-2 border border-gray-300 rounded"
        />

        <button 
          type="submit" 
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition transform duration-300 hover:scale-105"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}
