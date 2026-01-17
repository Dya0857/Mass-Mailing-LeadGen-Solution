import React from "react";
import CampaignCard from "../components/CampaignCard";

export default function CampaignList() {
  const dummyCampaigns = [
    { name: "Diwali Offers", status: "sent" },
    { name: "Product Launch", status: "scheduled" },
  ];

  return (
    <div className="container mt-4">
      <h4 className="fw-bold mb-3">Campaigns</h4>

      <div className="row">
        {dummyCampaigns.map((c, i) => (
          <CampaignCard key={i} campaign={c} />
        ))}
      </div>
    </div>
  );
}
