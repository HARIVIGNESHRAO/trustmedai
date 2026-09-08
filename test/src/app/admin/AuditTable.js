"use client";

import React from "react";
import AuditRow from "./AuditRow";

export default function AuditTable({ rows, actionMeta, formatAuditTime }) {
    return (
        <div className="audit-table-wrap">
            <table className="audit-table">
                <thead>
                    <tr>
                        <th>Time</th>
                        <th>User</th>
                        <th>Action</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>IP Address</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <AuditRow
                            key={row.id}
                            row={row}
                            actionMeta={actionMeta}
                            formatAuditTime={formatAuditTime}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}