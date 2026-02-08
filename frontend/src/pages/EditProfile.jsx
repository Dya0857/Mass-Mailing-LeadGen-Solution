import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Settings.css";

const EditProfile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "", // Read-only
        avatar: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem("user") || "{}");
        setUser(userInfo);
        setFormData({
            name: userInfo.name || "",
            email: userInfo.email || "",
            avatar: userInfo.avatar || "",
            password: ""
        });
    }, []);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = user.token || localStorage.getItem("token");
            const formDataToSend = new FormData();
            formDataToSend.append("name", formData.name);
            if (formData.password) formDataToSend.append("password", formData.password);

            if (formData.avatarFile) {
                formDataToSend.append("avatar", formData.avatarFile);
            } else if (formData.avatar && typeof formData.avatar === 'string') {
                formDataToSend.append("avatar", formData.avatar);
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/users/profile`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formDataToSend
            });

            if (!response.ok) {
                throw new Error("Failed to update profile");
            }

            const updatedUser = await response.json();
            const newUserData = { ...user, ...updatedUser };

            setUser(newUserData);
            localStorage.setItem("user", JSON.stringify(newUserData));

            setFormData(prev => ({ ...prev, password: "", avatarFile: null }));
            alert("Profile updated successfully!");

        } catch (error) {
            console.error("Profile update error:", error);
            alert("Error updating profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="settings-container">
            <div className="settings-header">
                <h1>👤 Edit Profile</h1>
                <p className="settings-subtitle">Manage your personal information</p>
            </div>

            <div className="settings-content">
                <div className="settings-card">
                    <div className="profile-info">
                        <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
                            {user?.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt="Profile"
                                    style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover", marginRight: "15px", border: "2px solid #00695c" }}
                                />
                            ) : (
                                <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "#00695c", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", marginRight: "15px" }}>
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div>
                                <h2 style={{ margin: 0 }}>{user?.name}</h2>
                                <p style={{ margin: "5px 0", color: "#666" }}>{user?.email}</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleProfileUpdate} className="profile-edit-form">
                        <div className="input-group">
                            <label className="label-text" style={{ display: 'block', width: '100%', marginBottom: '8px' }}>Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="number-input"
                                style={{ width: '100%' }}
                            />
                        </div>

                        <div className="input-group" style={{ marginTop: '15px' }}>
                            <label className="label-text" style={{ display: 'block', width: '100%', marginBottom: '8px' }}>Email (Cannot be changed)</label>
                            <input
                                type="email"
                                value={formData.email}
                                disabled
                                style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed", width: '100%' }}
                                className="number-input"
                            />
                        </div>

                        <div className="input-group" style={{ marginTop: '15px' }}>
                            <label className="label-text" style={{ display: 'block', width: '100%', marginBottom: '8px' }}>Profile Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setFormData({ ...formData, avatarFile: e.target.files[0] })}
                                style={{ width: '100%' }}
                            />
                            <span className="input-hint">Upload a local image (JPG, PNG)</span>
                        </div>

                        <div className="input-group" style={{ marginTop: '15px' }}>
                            <label className="label-text" style={{ display: 'block', width: '100%', marginBottom: '8px' }}>New Password (leave blank to keep current)</label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                minLength="6"
                                className="number-input"
                                style={{ width: '100%' }}
                            />
                        </div>

                        <div style={{ marginTop: "25px", display: "flex", gap: "10px" }}>
                            <button type="submit" className="btn-primary" disabled={loading} style={{ background: '#00695c', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                                {loading ? "Saving..." : "Save Changes"}
                            </button>
                            <button type="button" className="btn-secondary" onClick={() => navigate("/settings")}>
                                Go to Settings
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditProfile;
