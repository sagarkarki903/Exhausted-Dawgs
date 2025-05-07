import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const backendUrl = import.meta.env.VITE_BACKEND;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirm) {
      return toast.error("Passwords must match");
    }
    try {
      
      await axios.post(
        `${backendUrl}/auth/reset-password`,
        { token, newPassword },
        { withCredentials: true }
      );
      toast.success("Your password has been reset!");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Reset Your Password</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block">
          <span className="text-gray-700">New Password</span>
          <input
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-1 block w-full border rounded p-2"
          />
        </label>
        <label className="block">
          <span className="text-gray-700">Confirm Password</span>
          <input
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="mt-1 block w-full border rounded p-2"
          />
        </label>
        <button
          type="submit"
          className="w-full bg-red-900 text-white py-2 rounded hover:bg-red-800"
        >
          Reset Password
        </button>
      </form>
      <Link to="/login" className="mt-4 block text-gray-600 hover:underline">
        ← Back to login
      </Link>
    </div>
  );
}
