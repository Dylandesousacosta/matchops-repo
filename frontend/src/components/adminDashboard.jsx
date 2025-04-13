import { useEffect, useState } from "react";

export default function AdminDashboard({ handleLogout }) {
    const [stats, setStats] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return handleLogout();

        fetch("http://localhost:9000/api/admin/stats", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => {
                if (!res.ok) throw new Error("Access denied or unauthorized");
                return res.json();
            })
            .then(setStats)
            .catch((err) => setError(err.message));
    }, [handleLogout]);

    if (error) return <p style={{ color: "red" }}>{error}</p>;
    if (!stats) return <p>Loading stats...</p>;

    return (
        <div style={{ padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <h2>Admin Dashboard</h2>
                <button onClick={handleLogout}>Logout</button>
            </div>
            <ul>
                <li><strong>Total Users:</strong> {stats.total}</li>
                <li><strong>Active Users (7 days):</strong> {stats.active}</li>
                <li><strong>Paid Members:</strong> {stats.paid}</li>
                <li><strong>Free Members:</strong> {stats.free}</li>
            </ul>
        </div>
    );
}
