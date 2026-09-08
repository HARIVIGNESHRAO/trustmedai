"use client";

import React from "react";
import { Search } from "lucide-react";

export default function AuditFilters({
    search,
    setSearch,
    actionFilter,
    setActionFilter,
    statusFilter,
    setStatusFilter,
    actionOptions,
    statusOptions,
}) {
    return (
        <div className="audit-filters-wrap">
            <div className="audit-search-box">
                <Search className="h-4 w-4" />
                <input
                    type="text"
                    placeholder="Search by user email, action, or description..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <select className="dark-select" value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
                {actionOptions.map((option) => (
                    <option key={option} value={option}>
                        {option === "ALL" ? "All Actions" : option}
                    </option>
                ))}
            </select>

            <select className="dark-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                {statusOptions.map((option) => (
                    <option key={option} value={option}>
                        {option === "ALL" ? "All Status" : option}
                    </option>
                ))}
            </select>
        </div>
    );
}