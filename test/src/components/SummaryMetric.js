"use client";

export default function SummaryMetric({ icon: Icon, label, value, hint }) {
    return (
        <div className="summary-metric-card">
            <div className="summary-metric-icon">
                <Icon size={18} />
            </div>
            <div className="summary-metric-content">
                <span>{label}</span>
                <strong>{value}</strong>
                {hint ? <small>{hint}</small> : null}
            </div>
        </div>
    );
}