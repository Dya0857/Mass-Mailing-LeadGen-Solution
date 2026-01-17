import React from "react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Mail,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Shield,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

export default function Dashboard() {
  // Sample data for charts
  const emailTrendsData = [
    { day: "Mon", sent: 3200, opened: 2100, clicked: 800 },
    { day: "Tue", sent: 3800, opened: 2500, clicked: 950 },
    { day: "Wed", sent: 4200, opened: 2800, clicked: 1100 },
    { day: "Thu", sent: 4500, opened: 3000, clicked: 1200 },
    { day: "Fri", sent: 4800, opened: 3200, clicked: 1300 },
    { day: "Sat", sent: 3500, opened: 2400, clicked: 900 },
    { day: "Sun", sent: 2800, opened: 1900, clicked: 700 },
  ];

  const deliverabilityData = [
    { month: "Jan", score: 92 },
    { month: "Feb", score: 93 },
    { month: "Mar", score: 94 },
    { month: "Apr", score: 95 },
    { month: "May", score: 96 },
    { month: "Jun", score: 98 },
  ];

  const campaignActivityData = [
    { day: "Mon", sent: 3200, opened: 2100, clicked: 800 },
    { day: "Tue", sent: 3800, opened: 2500, clicked: 950 },
    { day: "Wed", sent: 4200, opened: 2800, clicked: 1100 },
    { day: "Thu", sent: 4500, opened: 3000, clicked: 1200 },
    { day: "Fri", sent: 4800, opened: 3200, clicked: 1300 },
    { day: "Sat", sent: 3500, opened: 2400, clicked: 900 },
    { day: "Sun", sent: 2800, opened: 1900, clicked: 700 },
  ];

  const recentCampaigns = [
    {
      name: "Summer Sale Announcement",
      sent: 5240,
      openRate: 72,
      status: "completed",
    },
    {
      name: "Product Launch Newsletter",
      sent: 3820,
      openRate: 68,
      status: "completed",
    },
    {
      name: "Customer Feedback Survey",
      sent: 2150,
      openRate: 45,
      status: "active",
    },
    {
      name: "Weekly Tips & Updates",
      sent: 4680,
      openRate: 71,
      status: "completed",
    },
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back! Here's your campaign performance overview.</p>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon">
            <Mail size={24} />
          </div>
          <div className="kpi-content">
            <div className="kpi-value">28,450</div>
            <div className="kpi-label">This month</div>
            <div className="kpi-change positive">
              <ArrowUp size={14} />
              <span>12.5%</span>
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">
            <TrendingUp size={24} />
          </div>
          <div className="kpi-content">
            <div className="kpi-value">68.5%</div>
            <div className="kpi-label">Average</div>
            <div className="kpi-change positive">
              <ArrowUp size={14} />
              <span>8.2%</span>
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon warning">
            <AlertTriangle size={24} />
          </div>
          <div className="kpi-content">
            <div className="kpi-value">2.8%</div>
            <div className="kpi-label">Below threshold</div>
            <div className="kpi-change negative">
              <ArrowDown size={14} />
              <span>2.1%</span>
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon purple">
            <Shield size={24} />
          </div>
          <div className="kpi-content">
            <div className="kpi-value">98/100</div>
            <div className="kpi-label">Domain health score</div>
            <div className="kpi-badge excellent">Excellent</div>
          </div>
        </div>
      </div>

      {/* Campaign Activity Chart */}
      <div className="dashboard-section">
        <div className="section-header">
          <h3>Campaign Activity</h3>
          <div className="chart-legend">
            <div className="legend-item">
              <span className="legend-dot blue"></span>
              <span>Sent</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot green"></span>
              <span>Opened</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot purple"></span>
              <span>Clicked</span>
            </div>
          </div>
        </div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={campaignActivityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip />
              <Bar dataKey="sent" stackId="a" fill="#3b82f6" />
              <Bar dataKey="opened" stackId="a" fill="#10b981" />
              <Bar dataKey="clicked" stackId="a" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="charts-row">
        <div className="chart-card">
          <h3>Email Performance Trends</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={emailTrendsData}>
                <defs>
                  <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOpened" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="sent"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorSent)"
                />
                <Area
                  type="monotone"
                  dataKey="opened"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorOpened)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header-with-score">
            <h3>Deliverability Score</h3>
            <div className="current-score">
              <div className="score-value">98%</div>
              <div className="score-label">Current Score</div>
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={deliverabilityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis domain={[90, 100]} stroke="#666" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: "#10b981", r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="dashboard-bottom">
        <div className="dashboard-card">
          <h3>Recent Campaigns</h3>
          <div className="campaigns-list">
            {recentCampaigns.map((campaign, index) => (
              <div key={index} className="campaign-item">
                <div className="campaign-info">
                  <div className="campaign-name">{campaign.name}</div>
                  <div className="campaign-stats">
                    {campaign.sent.toLocaleString()} sent • {campaign.openRate}% opened
                  </div>
                </div>
                <div
                  className={`campaign-status ${
                    campaign.status === "completed" ? "completed" : "active"
                  }`}
                >
                  {campaign.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card">
          <h3>Domain Health Check</h3>
          <div className="health-list">
            <div className="health-item">
              <span className="health-label">SPF Record</span>
              <span className="health-status valid">Valid</span>
            </div>
            <div className="health-item">
              <span className="health-label">DKIM Signature</span>
              <span className="health-status valid">Valid</span>
            </div>
            <div className="health-item">
              <span className="health-label">DMARC Policy</span>
              <span className="health-status valid">Configured</span>
            </div>
            <div className="health-item">
              <span className="health-label">Sender Reputation</span>
              <span className="health-score">98/100</span>
            </div>
            <div className="health-item">
              <span className="health-label">Blacklist Status</span>
              <span className="health-status valid">Clean</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
