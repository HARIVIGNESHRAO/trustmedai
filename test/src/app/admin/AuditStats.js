"use client";

import React from "react";
import { Activity, CheckCircle2, ShieldAlert, CalendarDays } from "lucide-react";

const statItems = [
    { key: "totalLogs", label: "Total Logs", icon: Activity, color: "cyan" },
    { key: "successfulActions", label: "Successful Actions", icon: CheckCircle2, color: "green" },
    { key: "failedActions", label: "Failed Actions", icon: ShieldAlert, color: "red" },
    { key: "todaysActivity", label: "Today's Activity", icon: CalendarDays, color: "purple" },
];

export default function AuditStats({ stats }) {
    return (
        <div className="audit-kpi-grid">
            {statItems.map(({ key, label, icon: Icon, color }) => (
                <article className={`audit-kpi-card tone-${color}`} key={key}>
                    <div className="audit-kpi-icon">
                        <Icon className="h-5 w-5" />
                    </div>
                    <div>
                        <span>{label}</span>
                        <strong>{stats?.[key] ?? 0}</strong>
                        <p>Live operational audit intelligence</p>
                    </div>
                </article>
            ))}
        </div>
    );
}