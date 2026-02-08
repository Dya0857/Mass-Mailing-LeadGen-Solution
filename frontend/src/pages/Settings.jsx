import { useState, useEffect } from "react";
import SESConnect from "../components/SESConnect";
import "../styles/Settings.css";

const Settings = () => {
    const [aiSettings, setAiSettings] = useState({
        defaultVariationCount: 7, // Optimized for 1000-2000 recipients
    });

    useEffect(() => {
        // Load AI settings from localStorage
        const savedAiSettings = JSON.parse(
            localStorage.getItem("aiSettings") || '{"defaultVariationCount": 7}'
        );
        setAiSettings(savedAiSettings);
    }, []);

    const handleAiSettingsChange = (key, value) => {
        const newSettings = { ...aiSettings, [key]: value };
        setAiSettings(newSettings);
        localStorage.setItem("aiSettings", JSON.stringify(newSettings));
    };

    return (
        <div className="settings-container">
            <div className="settings-header">
                <h1>⚙️ Settings</h1>
                <p className="settings-subtitle">Manage system and user preferences</p>
            </div>

            <div className="settings-content">
                <section>
                    <h2 style={{ marginBottom: "20px", color: "#00695c", borderBottom: "2px solid #eee", paddingBottom: "10px" }}>🖥️ System Settings</h2>

                    {/* SES Configuration Section */}
                    <SESConnect />

                    {/* AI Assistant Settings */}
                    <div className="settings-card">
                        <h3>🤖 AI Assistant Settings</h3>
                        <div className="settings-option">
                            <label className="setting-label">
                                <span className="label-text">Default Number of Variations</span>
                                <p className="label-description">
                                    Default number of email variations to generate. For 1000-2000 recipients,
                                    use 7-10 variations to avoid spam filters.
                                </p>
                            </label>
                            <div className="input-group">
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={aiSettings.defaultVariationCount}
                                    onChange={(e) =>
                                        handleAiSettingsChange(
                                            "defaultVariationCount",
                                            parseInt(e.target.value) || 7
                                        )
                                    }
                                    className="number-input"
                                />
                                <span className="input-hint">variations (recommended: 7-10 for large lists)</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section style={{ marginTop: "20px" }}>
                    <h2 style={{ marginBottom: "20px", color: "#00695c", borderBottom: "2px solid #eee", paddingBottom: "10px" }}>👤 User Settings</h2>

                    {/* Notifications */}
                    <div className="settings-card">
                        <h3>🔔 Notifications</h3>
                        <div className="settings-option">
                            <label className="toggle-label">
                                <input type="checkbox" defaultChecked />
                                <span>Email campaign notifications</span>
                            </label>
                        </div>
                        <div className="settings-option">
                            <label className="toggle-label">
                                <input type="checkbox" defaultChecked />
                                <span>Weekly performance reports</span>
                            </label>
                        </div>
                    </div>

                    {/* Security */}
                    <div className="settings-card">
                        <h3>🔒 Security</h3>
                        <button className="btn-secondary">Change Password</button>
                        <button className="btn-danger" style={{ marginLeft: "12px" }}>
                            Delete Account
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Settings;
