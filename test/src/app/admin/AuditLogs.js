"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    AlertCircle,
    Brain,
    CalendarDays,
    Download,
    LogIn,
    RefreshCcw,
    Search,
    ShieldCheck,
    UserPlus,
    Upload,
    FileDown,
    Shield,
    Activity,
} from "lucide-react";
import AuditStats from "./AuditStats";
import AuditFilters from "./AuditFilters";
import AuditTable from "./AuditTable";

const ACTION_OPTIONS = [
    "ALL",
    "LOGIN",
    "REGISTER",
    "UPLOAD_REPORT",
    "AI_PREDICTION",
    "HOSPITAL_RECOMMENDATION",
    "BLOCKCHAIN_VERIFY",
    "PDF_DOWNLOAD",
    "OAUTH_LOGIN",
];

const STATUS_OPTIONS = ["ALL", "SUCCESS", "FAILED"];

const ACTION_META = {
    LOGIN: { icon: LogIn, tone: "blue" },
    REGISTER: { icon: UserPlus, tone: "purple" },
    UPLOAD_REPORT: { icon: Upload, tone: "orange" },
    AI_PREDICTION: { icon: Brain, tone: "cyan" },
    HOSPITAL_RECOMMENDATION: { icon: Activity, tone: "teal" },
    BLOCKCHAIN_VERIFY: { icon: ShieldCheck, tone: "green" },
    PDF_DOWNLOAD: { icon: FileDown, tone: "pink" },
    OAUTH_LOGIN: { icon: Shield, tone: "indigo" },
};

const PAGE_SIZE = 20;

const formatAuditTime = (value) => {
    if (!value) return "N/A";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const normalizeAuditLog = (item, index) => ({
    id: item?.id || `${item?.timestamp || item?.createdAt || "audit"}-${index}`,
    time: item?.timestamp || item?.createdAt || item?.time || "",
    user: item?.userEmail || item?.email || item?.user || "Unknown User",
    action: item?.action || "UNKNOWN",
    description: item?.description || item?.details || "No description available.",
    status: String(item?.status || "UNKNOWN").toUpperCase(),
    ipAddress: item?.ipAddress || item?.ip || "N/A",
});

const exportVisibleCsv = (rows) => {
    const headers = ["Time", "User", "Action", "Description", "Status", "IP Address"];
    const csvRows = rows.map((row) =>
        [row.time, row.user, row.action, row.description, row.status, row.ipAddress]
            .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
            .join(",")
    );

    const csv = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "trustmedai-audit-logs.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};

export default function AuditLogs({ fetchWithAuth, apiBase }) {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [actionFilter, setActionFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [page, setPage] = useState(1);

    const fetchAuditLogs = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const data = await fetchWithAuth(`${apiBase}/audit-logs`);
            const normalized = (Array.isArray(data) ? data : [])
                .map(normalizeAuditLog)
                .sort((a, b) => new Date(b.time) - new Date(a.time));
            setLogs(normalized);
        } catch (err) {
            setError(err.message || "Unable to load Audit Logs");
        } finally {
            setLoading(false);
        }
    }, [fetchWithAuth, apiBase]);

    useEffect(() => {
        fetchAuditLogs();
    }, [fetchAuditLogs]);

    const filteredLogs = useMemo(() => {
        const query = search.trim().toLowerCase();

        return logs.filter((log) => {
            const matchesSearch =
                !query ||
                String(log.user).toLowerCase().includes(query) ||
                String(log.action).toLowerCase().includes(query) ||
                String(log.description).toLowerCase().includes(query);

            const matchesAction = actionFilter === "ALL" || log.action === actionFilter;
            const matchesStatus = statusFilter === "ALL" || log.status === statusFilter;

            return matchesSearch && matchesAction && matchesStatus;
        });
    }, [logs, search, actionFilter, statusFilter]);

    const stats = useMemo(() => {
        const today = new Date().toDateString();
        return {
            totalLogs: logs.length,
            successfulActions: logs.filter((log) => log.status === "SUCCESS").length,
            failedActions: logs.filter((log) => log.status === "FAILED").length,
            todaysActivity: logs.filter((log) => {
                const dt = new Date(log.time);
                return !Number.isNaN(dt.getTime()) && dt.toDateString() === today;
            }).length,
        };
    }, [logs]);

    const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));

    const paginatedLogs = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return filteredLogs.slice(start, start + PAGE_SIZE);
    }, [filteredLogs, page]);

    useEffect(() => {
        setPage(1);
    }, [search, actionFilter, statusFilter]);

    useEffect(() => {
        if (page > totalPages) setPage(totalPages);
    }, [page, totalPages]);

    return (
        <section className="content-card audit-logs-module">
            <div className="card-header audit-logs-header">
                <div>
                    <p className="eyebrow">Security Intelligence</p>
                    <h2>Audit Logs</h2>
                    <p className="audit-subtitle">
                        Enterprise-grade visibility into authentication, predictions, report uploads, and verification workflows.
                    </p>
                </div>

                <div className="audit-header-actions">
                    <button className="secondary-btn audit-action-btn" onClick={fetchAuditLogs} disabled={loading}>
                        <RefreshCcw className="h-4 w-4" />
                        Refresh Logs
                    </button>
                    <button
                        className="parameter-action-btn audit-export-btn"
                        onClick={() => exportVisibleCsv(filteredLogs)}
                        disabled={!filteredLogs.length}
                    >
                        <Download className="h-4 w-4" />
                        Export CSV
                    </button>
                </div>
            </div>

            <AuditStats stats={stats} />

            <AuditFilters
                search={search}
                setSearch={setSearch}
                actionFilter={actionFilter}
                setActionFilter={setActionFilter}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                actionOptions={ACTION_OPTIONS}
                statusOptions={STATUS_OPTIONS}
            />

            {loading ? (
                <div className="audit-skeleton-grid">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div className="audit-skeleton-card" key={index}>
                            <div className="audit-skeleton-line lg" />
                            <div className="audit-skeleton-line md" />
                            <div className="audit-skeleton-line sm" />
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="status-banner error" style={{ display: "block" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                        <AlertCircle className="h-4 w-4" />
                        <strong>Unable to load Audit Logs</strong>
                    </div>
                    <div style={{ marginBottom: 12 }}>{error}</div>
                    <button className="secondary-btn" onClick={fetchAuditLogs}>
                        Retry
                    </button>
                </div>
            ) : !filteredLogs.length ? (
                <div className="empty-state audit-empty-state">
                    <div>
                        <div className="audit-empty-icon">📋</div>
                        <p>No Audit Logs Available</p>
                        <span className="mini-help">
                            Activity will appear here once users start using the system.
                        </span>
                    </div>
                </div>
            ) : (
                <>
                    <AuditTable rows={paginatedLogs} actionMeta={ACTION_META} formatAuditTime={formatAuditTime} />

                    <div className="audit-pagination">
                        <button
                            className="secondary-btn"
                            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                            disabled={page === 1}
                        >
                            Previous
                        </button>
                        <span className="audit-pagination-text">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            className="secondary-btn"
                            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                            disabled={page === totalPages}
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </section>
    );
}