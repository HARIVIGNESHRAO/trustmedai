"use client";

const toneMap = {
    Low: "low",
    Moderate: "moderate",
    High: "high",
};

export default function PriorityBadge({ level = "Low" }) {
    return (
        <span className={`priority-badge ${toneMap[level] || "low"}`}>
            <span className="priority-dot" />
            {level}
        </span>
    );
}