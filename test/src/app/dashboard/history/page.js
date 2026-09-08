"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/config";

const truncateHash = (hash = "", start = 10, end = 8) => {
  if (!hash) return "-";
  if (hash.length <= start + end) return hash;
  return `${hash.slice(0, start)}...${hash.slice(-end)}`;
};

const getRiskLevel = (prediction) => {
  const predictions = prediction?.predictions || [];
  const highest = Math.max(
    ...predictions.map((p) => Number(p?.probability || 0)),
    0
  );
  if (highest >= 70) return "High";
  if (highest >= 40) return "Medium";
  return "Low";
};

const riskClass = (risk) => {
  if (risk === "High") return "high";
  if (risk === "Medium") return "medium";
  return "low";
};

export default function PredictionHistoryPage() {
  const router = useRouter();

  const [reports, setReports] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [searchDisease, setSearchDisease] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [sortOrder, setSortOrder] = useState("latest");
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const fetchHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/prediction-history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch prediction history");
      const data = await response.json();
      setReports(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const getPredictionData = (report) => {
    try {
      return JSON.parse(report.predictionResult);
    } catch {
      return {};
    }
  };

  const filteredReports = useMemo(() => {
    let filtered = [...reports];

    if (searchName.trim()) {
      filtered = filtered.filter((report) =>
        (report.reportName || "").toLowerCase().includes(searchName.toLowerCase())
      );
    }

    if (searchDisease.trim()) {
      filtered = filtered.filter((report) => {
        const prediction = getPredictionData(report);
        return (prediction.predictions || []).some((item) =>
          (item.disease || "").toLowerCase().includes(searchDisease.toLowerCase())
        );
      });
    }

    if (filterDate) {
      filtered = filtered.filter((report) => {
        const reportDate = new Date(report.createdAt).toISOString().split("T")[0];
        return reportDate === filterDate;
      });
    }

    filtered.sort((a, b) => {
      const first = new Date(a.createdAt).getTime();
      const second = new Date(b.createdAt).getTime();
      return sortOrder === "latest" ? second - first : first - second;
    });

    return filtered;
  }, [reports, searchName, searchDisease, filterDate, sortOrder]);

  const stats = useMemo(() => {
    const totalReports = reports.length;
    const blockchainVerified = reports.filter(
      (report) => report.blockchainVerified || report.blockNumber
    ).length;
    const sorted = [...reports].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    return {
      totalReports,
      blockchainVerified,
      lastAnalysisDate: sorted[0]?.createdAt
        ? new Date(sorted[0].createdAt).toLocaleString()
        : "No data",
    };
  }, [reports]);


  const handleDownloadPdf = async (reportId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/download-report/${reportId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to download PDF");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `trustmedai-report-${reportId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    router.push("/login");
  };

  const selectedPrediction = selectedReport ? getPredictionData(selectedReport) : {};

  return (
    <main className="history-shell">
      {/* ───── SIDEBAR ───── */}
      <aside className="history-sidebar">
        <div>
          <div className="sidebar-brand">
            <div className="brand-icon">
              <span /><span />
            </div>
            <div>
              <p className="eyebrow">Healthcare Intelligence</p>
              <h2>TrustMedAI</h2>
            </div>
          </div>

          <nav className="sidebar-nav">
            <button type="button" className="sidebar-link" onClick={() => router.push("/dashboard#upload")}>
              ↑ Upload Report
            </button>
            <button type="button" className="sidebar-link" onClick={() => router.push("/dashboard#direct")}>
              ✎ Enter Details
            </button>
            <button type="button" className="sidebar-link" onClick={() => router.push("/dashboard#voice")}>
              ◉ Voice Recording
            </button>
            <button type="button" className="sidebar-link active">
              Prediction History
            </button>
          </nav>
        </div>

        <div>
          <div className="sidebar-note">
            <h3>🩺 Quick Tip</h3>
            <span>Use filters to narrow down reports by date, disease, or name for faster lookup.</span>
          </div>

          <button
            type="button"
            className="sidebar-link danger"
            onClick={handleLogout}
            style={{ marginTop: 12 }}
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* ───── MAIN ───── */}
      <section className="history-main">
        {/* Header */}
        <header className="history-top">
          <div className="history-title-wrap">
            <button type="button" className="back-btn" onClick={() => router.push("/dashboard")}>
              ← Back to Dashboard
            </button>
            <div>
              <p className="eyebrow">Prediction Archive</p>
              <h1>Prediction History</h1>
              <p className="history-subtitle">
                View, manage, and verify all your previously analyzed medical reports with blockchain traceability.
              </p>
            </div>
          </div>

          <div className="history-stats-grid">
            <div className="stat-card">
              <span>Total Reports</span>
              <strong>{stats.totalReports}</strong>
            </div>
            <div className="stat-card">
              <span>Verification Status
                <br />
                Blockchain Protected</span>
              <strong>{stats.blockchainVerified}</strong>
            </div>
            <div className="stat-card">
              <span>Last Analysis</span>
              <strong className="stat-date">{stats.lastAnalysisDate}</strong>
            </div>
          </div>
          <div className="mini-detail-card full">
            <span>Security Information</span>

            <strong>
              This report is secured using SHA-256 blockchain hashing.
              Scan the QR Code in the downloaded PDF to verify report authenticity.
            </strong>
          </div>
        </header>

        {/* Toolbar */}
        <section className="history-toolbar">
          <div className="toolbar-grid">
            <div className="field-block">
              <label>Search by Report Name</label>
              <input
                type="text"
                placeholder="Enter report name"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>
            <div className="field-block">
              <label>Search by Disease</label>
              <input
                type="text"
                placeholder="Enter disease name"
                value={searchDisease}
                onChange={(e) => setSearchDisease(e.target.value)}
              />
            </div>
            <div className="field-block">
              <label>Filter by Date</label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>
            <div className="field-block">
              <label>Sort Order</label>
              <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                <option value="latest">Latest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
            <div className="toolbar-action-wrap">
              <button type="button" className="refresh-btn" onClick={fetchHistory}>
                ↻ Refresh
              </button>
            </div>
          </div>
        </section>
        {/* Content */}
        <section className="history-content">
          {loading ? (
            <div className="history-loading">
              <p>Loading prediction history...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="empty-history">
              <div className="empty-icon">🩺</div>
              <h2>No prediction history available.</h2>
              <button type="button" className="analyze-btn" onClick={() => router.push("/dashboard")}>
                Analyze New Report
              </button>
            </div>
          ) : (
            <div className="history-card-grid">
              {filteredReports.map((report) => {
                const prediction = getPredictionData(report);
                const risk = getRiskLevel(prediction);
                return (
                  <article key={report.id} className="history-card">
                    <div className="history-card-head">
                      <div>
                        <span className="history-card-label">📄 Report Name</span>
                        <h3>{report.reportName || "Untitled Report"}</h3>
                      </div>
                      <span className={`risk-badge ${riskClass(risk)}`}>{risk} Risk</span>
                    </div>

                    <div className="history-meta-list">
                      <p><strong>👤 User Email:</strong> {report.userEmail || report.email || "-"}</p>
                      <p><strong>🕒 Date & Time:</strong> {new Date(report.createdAt).toLocaleString()}</p>
                      <p>
                        <strong>🩺 Diseases Detected:</strong>{" "}
                        {(prediction.predictions || []).map((item) => item.disease).join(", ") || "None"}
                      </p>
                      <p>
                        <strong>Verification:</strong>{" "}
                        <span
                          style={{
                            color: "#16a34a",
                            fontWeight: 700
                          }}
                        >
                          Ready for Verification
                        </span>
                      </p>
                      <p><strong>Block Number:</strong> {report.blockNumber ?? "-"}</p>
                      <p><strong>SHA-256 Hash:</strong> {truncateHash(report.currentHash || report.hash)}</p>
                      <p>
                        <strong>Verification ID:</strong>{" "}
                        BLK-{String(report.blockNumber).padStart(6, "0")}
                      </p>
                      <p><strong>Previous Hash:</strong> {truncateHash(report.previousHash)}</p>
                    </div>

                    <div className="history-actions">
                      <button type="button" className="secondary-btn" onClick={() => setSelectedReport(report)}>
                        View Details
                      </button>
                      <button type="button" className="secondary-btn" onClick={() => handleDownloadPdf(report.id)}>
                        Download PDF
                      </button>
                      <button
                        className="primary-btn"
                        onClick={() =>
                          window.open(
                            `/verify-report?hash=${report.currentHash}`,
                            "_blank"
                          )
                        }
                      >
                        Verify Report
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="history-footer">
          <p>TrustMedAI © 2026</p>
          <span>AI + Blockchain Powered Healthcare</span>
        </footer>
      </section>

      {/* ───── MODAL ───── */}
      {selectedReport && (
        <div className="history-modal-overlay" onClick={() => setSelectedReport(null)}>
          <div className="history-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <p className="eyebrow">Prediction Report Details</p>
                <h2>{selectedReport.reportName || "Medical Prediction Report"}</h2>
              </div>
              <button type="button" className="close-modal-btn" onClick={() => setSelectedReport(null)}>
                ✕
              </button>
            </div>

            <div className="modal-scroll-content">
              <section className="modal-section">
                <h3>Patient Information</h3>
                <div className="modal-card-grid">
                  <div className="mini-detail-card">
                    <span>Patient Name</span>
                    <strong>{selectedReport.patient?.patientName || selectedReport.patientName || "-"}</strong>
                  </div>
                  <div className="mini-detail-card">
                    <span>Age</span>
                    <strong>{selectedReport.patient?.age || selectedReport.age || "-"}</strong>
                  </div>
                  <div className="mini-detail-card">
                    <span>Gender</span>
                    <strong>{selectedReport.patient?.gender || selectedReport.gender || "-"}</strong>
                  </div>
                  <div className="mini-detail-card">
                    <span>User Email</span>
                    <strong>{selectedReport.userEmail || selectedReport.email || "-"}</strong>
                  </div>
                </div>
              </section>

              <section className="modal-section">
                <h3>Prediction Results</h3>
                <div className="prediction-detail-list">
                  {(selectedPrediction.predictions || []).map((item, index) => (
                    <div className="prediction-detail-card" key={index}>
                      <div className="prediction-top">
                        <strong>{item.disease}</strong>
                        <span>{Number(item.probability || 0).toFixed(1)}%</span>
                      </div>
                      <div className="probability-bar">
                        <div className="probability-fill" style={{ width: `${Number(item.probability || 0)}%` }} />
                      </div>
                      {item.topFactors?.length > 0 && (
                        <div className="top-factors">
                          <span>Top Risk Factors</span>
                          <div className="factor-pills">
                            {item.topFactors.slice(0, 4).map((factor, i) => (
                              <span key={i} className="factor-pill">{factor.feature}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              <section className="modal-section">
                <h3>Hospital Recommendations</h3>

                {selectedReport.hospitalRecommendations ? (
                  (() => {
                    const hospitals = JSON.parse(
                      selectedReport.hospitalRecommendations
                    );

                    return (
                      <div className="prediction-detail-list">
                        {hospitals.map((hospital, index) => (
                          <div
                            key={index}
                            className="prediction-detail-card"
                          >
                            <div className="prediction-top">
                              <strong>{hospital.name}</strong>

                              <span>
                                HSS: {hospital.hss}
                              </span>
                            </div>

                            <p>
                              {hospital.address}
                            </p>

                            <p>
                              {hospital.rating}
                            </p>
                          </div>
                        ))}
                      </div>
                    );
                  })()
                ) : (
                  <div className="mini-detail-card full">
                    No hospital recommendations available.
                  </div>
                )}
              </section>

              <section className="modal-section">
                <h3>Blockchain Information</h3>
                <div className="modal-card-grid">
                  <div className="mini-detail-card">
                    <span>Report Hash</span>
                    <strong>{truncateHash(selectedReport.hash || selectedReport.reportHash, 14, 10)}</strong>
                  </div>
                  <div className="mini-detail-card">
                    <span>Current Hash</span>
                    <strong>{truncateHash(selectedReport.currentHash, 14, 10)}</strong>
                  </div>
                  <div className="mini-detail-card">
                    <span>Previous Hash</span>
                    <strong>{truncateHash(selectedReport.previousHash, 14, 10)}</strong>
                  </div>
                  <div className="mini-detail-card">
                    <span>Created At</span>
                    <strong>{new Date(selectedReport.createdAt).toLocaleString()}</strong>
                  </div>
                  <div className="mini-detail-card">
                    <span>Block Number</span>
                    <strong>{selectedReport.blockNumber ?? "-"}</strong>
                  </div>
                  <div className="mini-detail-card">
                    <span>Status</span>
                    <strong>{selectedReport.blockchainVerified || selectedReport.blockNumber ? "Verified" : "Pending"}</strong>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
