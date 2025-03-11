import axios from "axios";

export const fetchUser = async () => {
    try {
        const token = localStorage.getItem("token");

        if (!token) {
            console.error("🚨 No token found in localStorage!");
            return null;
        }

        console.log("🔹 Fetching User with Token:", token);

        const response = await axios.get("https://exhausted-dawgs.onrender.com/newschedule/me", {
            headers: {
                Authorization: `Bearer ${token}`, // ✅ Ensure token is included
            },
            withCredentials: true, // ✅ Allow cookies
        });

        console.log("✅ User Data Fetched:", response.data);
        return response.data;
    } catch (error) {
        console.error("🚨 Error fetching user:", error.response ? error.response.data : error.message);
        return null;
    }
};
