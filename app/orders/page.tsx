"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, getDocs, deleteDoc, doc, addDoc } from "firebase/firestore";
import Link from "next/link";

interface OrderData {
  id: string;
  location: string;
  companyName: string;
  numberOrder: string;
  po: string;
  destination: string;
  palletNumber: string;
}

export default function OrdersListPage() {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Listen for auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return unsubscribe;
  }, []);

  // Fetch orders if user is signed in
  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        const colRef = collection(db, "orders");
        const snapshot = await getDocs(colRef);

        const fetchedData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as OrderData[];

        setOrders(fetchedData);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, [user]);

  // Delete pallet handler
  const handleDeletePallet = async (order: OrderData) => {
    try {
      // Save a record of the order in the "deletedOrders" collection with a timestamp
      await addDoc(collection(db, "deletedOrders"), {
        ...order,
        deletedAt: new Date().toISOString(),
      });

      // Delete the order from the "orders" collection
      await deleteDoc(doc(db, "orders", order.id));

      // Remove the order from local state
      setOrders((prevOrders) => prevOrders.filter((o) => o.id !== order.id));
    } catch (error) {
      console.error("Error deleting pallet:", error);
    }
  };

  // If not signed in, show a message and link to sign in
  if (!user) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "white",
          color: "black",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <h1>Please sign in to view orders.</h1>
        <Link href="/signIn">Go to Sign In</Link>
      </div>
    );
  }

  // Filter orders based on searchTerm
  const filteredOrders = orders.filter((order) => {
    const term = searchTerm.toLowerCase();
    return (
      order.location?.toLowerCase().includes(term) ||
      order.companyName?.toLowerCase().includes(term) ||
      order.numberOrder?.toLowerCase().includes(term) ||
      order.po?.toLowerCase().includes(term) ||
      order.destination?.toLowerCase().includes(term)
    );
  });

  // Render the full-screen container for orders
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100vh",
        width: "100vw",
        backgroundColor: "white",
        color: "black",
        padding: "2rem",
        boxSizing: "border-box",
      }}
    >
      <h1>All Orders</h1>

      <input
        type="text"
        placeholder="Search by location, company name, order number, PO, or destination"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          marginBottom: "1rem",
          border: "1px solid #ccc",
          padding: "0.5rem",
          borderRadius: "4px",
          width: "100%",
          maxWidth: "600px",
        }}
      />

      {filteredOrders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            width: "100%",
            maxWidth: "600px",
          }}
        >
          {filteredOrders.map((order) => (
            <li
              key={order.id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "4px",
                padding: "1rem",
                marginBottom: "1rem",
              }}
            >
              <p>
                <strong>Location:</strong> {order.location}
              </p>
              <p>
                <strong>Company:</strong> {order.companyName}
              </p>
              <p>
                <strong>Order #:</strong> {order.numberOrder}
              </p>
              <p>
                <strong>PO:</strong> {order.po}
              </p>
              <p>
                <strong>Destination:</strong> {order.destination}
              </p>
              <p>
                <strong>Pallet:</strong> {order.palletNumber}
              </p>
              <button
                onClick={() => handleDeletePallet(order)}
                className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition transform duration-300 hover:scale-105"
              >
                Delete Pallet
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
