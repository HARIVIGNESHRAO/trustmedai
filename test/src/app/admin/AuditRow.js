"use client";

import React from "react";

const actionToneClass = {
    blue: "audit-action-badge tone-blue",
    purple: "audit-action-badge tone-purple",
    orange: "audit-action-badge tone-orange",
    cyan: "audit-action-badge tone-cyan",
    teal: "audit-action-badge tone-teal",
    green: "audit-action-badge tone-green",
    pink: "audit-action-badge tone-pink",
    indigo: "audit-action-badge tone-indigo",
};

export default function AuditRow({ row, actionMeta, formatAuditTime }) {
    const meta = actionMeta[row.action] || {};
    const Icon = meta.icon;
    const badgeClass = actionToneClass[meta.tone] || "audit-action-badge tone-cyan";

    return (
        <tr className="audit-table-row">
            <td>{formatAuditTime(row.time)}</td>
            <td>{row.user}</td>
            <td>
                <span className={badgeClass}>
                    {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
                    {row.action}
                </span>
            </td>
            <td className="audit-description-cell">{row.description}</td>
            <td>
                <span className={`audit-status-badge ${row.status === "SUCCESS" ? "success" : "failed"}`}>
                    {row.status}
                </span>
            </td>
            <td>{row.ipAddress}</td>
        </tr>
    );
}