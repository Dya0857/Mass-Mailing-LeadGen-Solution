import React from "react";

export default function CampaignCard({ campaign }) {
  return (
    <div className="card mb-3 shadow-sm">
      <div className="card-body">
        <h5 className="card-title">{campaign.name}</h5>
        <p className="card-text">{campaign.description}</p>
        <span className="badge bg-primary">{campaign.status}</span>
      </div>
    </div>
  );
}
