import React from 'react';

const SESConnect = () => {
    return (
        <div className="settings-card">
            <h3>✉️ Sender Configuration</h3>
            <div className="settings-option">
                <p className="label-description" style={{ marginBottom: '15px' }}>
                    Nodemailer is used for reliable mail sending using SMTP.
                    Configurations are managed via server-side environment variables.
                </p>

                <div style={{
                    padding: '15px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: '#28a745',
                        boxShadow: '0 0 0 3px rgba(40, 167, 69, 0.2)'
                    }}></div>
                    <div>
                        <span style={{ fontWeight: '600', fontSize: '14px', color: '#333' }}>Status: Active (Nodemailer)</span>
                        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666' }}>
                            Infrastructure is ready for bulk campaigns.
                        </p>
                    </div>
                </div>

                <div style={{ marginTop: '20px' }}>
                    <h4 style={{ fontSize: '14px', marginBottom: '10px' }}>To update credentials:</h4>
                    <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                        Modify EMAIL_USER and EMAIL_PASS in the backend /.env file.
                    </p>
                    <code style={{
                        display: 'block',
                        padding: '10px',
                        backgroundColor: '#2d2d2d',
                        color: '#f8f8f2',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontFamily: 'monospace'
                    }}>
                        Edit backend/.env file
                    </code>
                </div>
            </div>
        </div>
    );
};

export default SESConnect;

