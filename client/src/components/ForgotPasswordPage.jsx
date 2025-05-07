import { useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import emailjs from "@emailjs/browser";

export default function ForgotPasswordPage() {
  // Initialize EmailJS
  const publicKey  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
  const serviceId  = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_RESET_TEMPLATE_ID;
  emailjs.init(publicKey);

  const backendUrl = import.meta.env.VITE_BACKEND;
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const hasSubmitted     = useRef(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (hasSubmitted.current) return;
    hasSubmitted.current = true;
    try {
      // 1) Ask your server for a reset URL
      const { data } = await axios.post(
        `${backendUrl}/auth/forgot-password`,
        { email },
        { withCredentials: true }
      );
      // 2) Send that link via EmailJS
      await emailjs.send(
        serviceId,
        templateId,
        {
          to_email:   email,
          reset_link: data.resetUrl
        },
        publicKey
      );
      toast.success("Reset link sent! Check your inbox.");
      setSent(true);
    } catch (err) {
     if (err.response?.status === 404) {
       // explicitly unregistered
       toast.error(err.response.data.message);
     } else {
        toast.error(
          err.response?.data?.message ||
          err.text ||
          "Something went wrong."
        );
     }
    }
  };

  if (sent) {
    return (
      <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Check Your Inbox</h2>
        <p>
          We’ve sent a password reset link to <strong>{email}</strong> if it’s
          registered. It expires in 1 hour.
        </p>
        <Link to="/login" className="mt-4 block text-red-900 hover:underline">
          ← Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Forgot Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="text-gray-700">Your Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full border rounded p-2"
          />
        </label>
        <button
          type="submit"
          className="w-full bg-red-900 text-white py-2 rounded hover:bg-red-800"
        >
          Send Reset Link
        </button>
      </form>
      <Link to="/login" className="mt-4 block text-gray-600 hover:underline">
        ← Back to login
      </Link>
    </div>
  );
}
