"use client"; // Because we're using React hooks

import { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import Link from "next/link";

export default function NewOrderPage() {
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    location: "",
    companyName: "",
    numberOrder: "",
    po: "",
    destination: "",
    palletNumber: "",
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return unsubscribe;
  }, []);

  if (!user) {
    return (
      <div
        style={{
          backgroundColor: "white",
          color: "black",
          padding: "2rem",
          borderRadius: "4px",
          minWidth: "300px",
        }}
      >
        <h1>Sign In Required</h1>
        <p>You need to sign in to create a new order.</p>

        {/* Add a button to navigate to your sign-in page */}
        <Link href="/signIn" style={{ textDecoration: "none" }}>
          <button
            style={{
              marginTop: "1rem",
              backgroundColor: "#0070f3",
              color: "#fff",
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Go to Sign In
          </button>
        </Link>
      </div>
    );
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Ask for confirmation before submitting the order
    const isConfirmed = window.confirm("Are you sure you want to submit the order?");
    if (!isConfirmed) return;
    
    try {
      const docRef = await addDoc(collection(db, "orders"), formData);
      console.log("Document written with ID:", docRef.id);
      setFormData({
        location: "",
        companyName: "",
        numberOrder: "",
        po: "",
        destination: "",
        palletNumber: "",
      });
      setMessage("Your order has been uploaded");
    } catch (error) {
      console.error("Error adding document:", error);
    }
  }

  return (
    <div
      style={{
        backgroundColor: "white",
        color: "black",
        padding: "2rem",
        borderRadius: "4px",
        minWidth: "300px",
      }}
    >
      <h1>Create a New Order</h1>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        <div>
          <label htmlFor="location">Location:</label>
          <input
            id="location"
            name="location"
            type="text"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g., z-30-c"
            style={{
              border: "1px solid #ccc",
              padding: "0.5rem",
              borderRadius: "4px",
              width: "100%",
            }}
          />
        </div>
        <div>
          <label htmlFor="companyName">Company Name:</label>
          <input
            id="companyName"
            name="companyName"
            type="text"
            value={formData.companyName}
            onChange={handleChange}
            style={{
              border: "1px solid #ccc",
              padding: "0.5rem",
              borderRadius: "4px",
              width: "100%",
            }}
          />
        </div>
        <div>
          <label htmlFor="numberOrder">Order Number:</label>
          <input
            id="numberOrder"
            name="numberOrder"
            type="text"
            value={formData.numberOrder}
            onChange={handleChange}
            style={{
              border: "1px solid #ccc",
              padding: "0.5rem",
              borderRadius: "4px",
              width: "100%",
            }}
          />
        </div>
        <div>
          <label htmlFor="po">PO:</label>
          <input
            id="po"
            name="po"
            type="text"
            value={formData.po}
            onChange={handleChange}
            style={{
              border: "1px solid #ccc",
              padding: "0.5rem",
              borderRadius: "4px",
              width: "100%",
            }}
          />
        </div>
        <div>
          <label htmlFor="destination">Destination:</label>
          <input
            id="destination"
            name="destination"
            type="text"
            value={formData.destination}
            onChange={handleChange}
            style={{
              border: "1px solid #ccc",
              padding: "0.5rem",
              borderRadius: "4px",
              width: "100%",
            }}
          />
        </div>
        <div>
          <label htmlFor="destination">Pallet number:</label>
          <input
            id="destination"
            name="destination"
            type="text"
            value={formData.destination}
            onChange={handleChange}
            style={{
              border: "1px solid #ccc",
              padding: "0.5rem",
              borderRadius: "4px",
              width: "100%",
            }}
          />
          </div>
        <button
          type="submit"
          className="border border-gray-300 px-4 py-2 rounded transition transform duration-300 hover:scale-105 mt-4"
        >
          Submit Order
        </button>
      </form>
      {message && (
        <p style={{ marginTop: "1rem", color: "green" }}>{message}</p>
      )}
    </div>
  );
}
