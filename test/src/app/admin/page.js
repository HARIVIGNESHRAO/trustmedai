"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from "recharts";
import {
  Activity,
  AlertCircle,
  BadgeCheck,
  CalendarDays,
  ClipboardCheck,
  Copy,
  Eye,
  FileSearch,
  FlaskConical,
  Mail,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Trash2,
  UserRound,
  X,
  Download,
  Sparkles,
  HeartPulse,
  TrendingUp,
  Database,
  Hash,
} from "lucide-react";
import AuditLogs from "./AuditLogs";
import { API_URL, GRAFANA_URL } from "@/lib/config";
const API_BASE = `${API_URL}/admin`;
const CHART_COLORS = ["#18d9ff", "#00e0c6", "#5d78ff", "#ff8ca0", "#75f3b9", "#ffd166"];
const RISK_STYLES = {
  HIGH: "bg-red-50 text-red-700 border-red-200",
  "HIGH RISK": "bg-red-50 text-red-700 border-red-200",
  MEDIUM: "bg-orange-50 text-orange-700 border-orange-200",
  "MEDIUM RISK": "bg-orange-50 text-orange-700 border-orange-200",
  LOW: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "LOW RISK": "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const PREDICTION_STYLES = {
  POSITIVE: "bg-rose-50 text-rose-700 border-rose-200",
  NEGATIVE: "bg-slate-50 text-slate-700 border-slate-200",
  NORMAL: "bg-emerald-50 text-emerald-700 border-emerald-200",
};
function SectionTitle({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 rounded-2xl bg-cyan-500/10 p-2 text-cyan-400">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {subtitle ? <p className="mt-1 text-sm text-slate-400">{subtitle}</p> : null}
      </div>
    </div>
  );
}

function RiskBadge({ risk }) {
  const normalized = String(risk || "Unknown").toUpperCase();
  const className =
    RISK_STYLES[normalized] || "bg-slate-50 text-slate-700 border-slate-200";

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${className}`}>
      {normalized.includes("HIGH") ? (
        <ShieldAlert className="mr-1.5 h-3.5 w-3.5" />
      ) : normalized.includes("MEDIUM") ? (
        <AlertCircle className="mr-1.5 h-3.5 w-3.5" />
      ) : (
        <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
      )}
      {risk || "Unknown"}
    </span>
  );
}

function PredictionBadge({ value }) {
  const normalized = String(value || "Unknown").toUpperCase();
  const className =
    PREDICTION_STYLES[normalized] || "bg-sky-50 text-sky-700 border-sky-200";

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${className}`}>
      <BadgeCheck className="mr-1.5 h-3.5 w-3.5" />
      {value || "Unknown"}
    </span>
  );
}

function ProgressBar({ value }) {
  const numeric = Math.max(0, Math.min(Number(value || 0), 100));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-400">Confidence</span>
        <span className="font-semibold text-white">{numeric.toFixed(2)}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full ${numeric >= 70
            ? "bg-gradient-to-r from-red-500 to-rose-400"
            : numeric >= 40
              ? "bg-gradient-to-r from-orange-500 to-amber-400"
              : "bg-gradient-to-r from-emerald-500 to-teal-400"
            }`}
          style={{ width: `${numeric}%` }}
        />
      </div>
    </div>
  );
}

function ParameterCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-base font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function FactorCard({ factor }) {
  const name =
    factor?.feature || factor?.name || factor?.factor || "Unknown Factor";
  const impact = factor?.impact ?? factor?.value ?? factor?.score ?? 0;

  return (
    <div className="rounded-2xl border border-cyan-100 bg-cyan-50/80 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-cyan-500/10 p-2 text-cyan-700">
          <TrendingUp className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">{name}</p>
          <p className="mt-1 text-sm text-slate-600">Impact : {Number(impact).toFixed(4)}</p>
        </div>
      </div>
    </div>
  );
}

function OCRModal({ open, onClose, text }) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ocr-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 id="ocr-modal-title" className="text-lg font-semibold text-slate-900">
              OCR Report
            </h2>
            <p className="text-sm text-slate-500">
              Extracted text from the uploaded medical document
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto px-6 py-5">
          <div className="rounded-2xl bg-slate-50 p-5 text-sm leading-7 text-slate-700 whitespace-pre-wrap">
            {text || "No OCR report available."}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
function normalizePrediction(item) {
  // Parse the predictionResult string (your backend stores it as a JSON string)
  let parsed = {};
  if (typeof item?.predictionResult === 'string') {
    try {
      parsed = JSON.parse(item.predictionResult);
    } catch {
      parsed = {};
    }
  } else if (typeof item?.predictionResult === 'object' && item.predictionResult !== null) {
    parsed = item.predictionResult;
  }

  // The nested prediction array inside parsed result
  const pred = Array.isArray(parsed?.predictions) && parsed.predictions.length > 0
    ? parsed.predictions[0]
    : {};

  // Parameters from parsed result
  const parametersSource =
    parsed?.parameters && typeof parsed.parameters === 'object' && !Array.isArray(parsed.parameters)
      ? parsed.parameters
      : {};

  // Top factors from nested pred
  const factorsSource = Array.isArray(pred?.topFactors) ? pred.topFactors : [];

  // Blockchain fields are at the root of item (stored separately in DB)
  const blockchainSource = {
    blockNumber: item?.blockNumber,
    reportHash: item?.reportHash,
    currentHash: item?.currentHash,
    previousHash: item?.previousHash,
    status: 'Verified',
  };

  // Core prediction fields
  const disease = pred?.disease || 'Unknown';

  const predictionRaw = pred?.prediction;
  const prediction =
    predictionRaw === 1 || predictionRaw === true ? 'Positive' :
      predictionRaw === 0 || predictionRaw === false ? 'Negative' :
        typeof predictionRaw === 'string' ? predictionRaw :
          'Unknown';

  const riskLevel = pred?.risk || pred?.riskLevel || 'Unknown';

  // probability is already 0-100 in your backend
  const rawConfidence = pred?.probability ?? pred?.confidence ?? 0;
  const confidence = Number(rawConfidence) > 1
    ? Number(rawConfidence)
    : Number(rawConfidence) * 100;

  // Build parameter display list
  const params = Object.entries(parametersSource)
    .filter(([, val]) => val !== null && val !== undefined && String(val).trim() !== '')
    .map(([key, val]) => ({
      label: key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim(),
      value: String(val),
    }));

  return {
    id: item?.id,
    email: item?.userEmail || item?.patientEmail || item?.email || 'N/A',
    createdAt: item?.createdAt || item?.createdDate || item?.timestamp,
    disease,
    prediction,
    riskLevel,
    confidence,
    parameters: params,
    topFactors: factorsSource,
    ocrText: parsed?.rawText || item?.ocrText || '',
    blockchain: blockchainSource,
    raw: item,
  };
}

function PredictionCard({
  prediction,
  onDelete,
  onDownloadPdf,
  onViewOcr,
  deleting,
  onCopyHash,
}) {
  const normalized = normalizePrediction(prediction);
  const blockchain = normalized.blockchain || {};
  const showBlockchain =
    blockchain?.blockNumber ||
    blockchain?.reportHash ||
    blockchain?.currentHash ||
    blockchain?.previousHash;

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-slate-200/60">
      <div className="border-b border-slate-200 bg-gradient-to-r from-sky-50 via-white to-cyan-50 px-6 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <SectionTitle
              icon={HeartPulse}
              title="Patient Information"
              subtitle="Clinical summary generated from uploaded report"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">
                <Mail className="mt-0.5 h-4 w-4 text-sky-600" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Email</p>
                  <a href={`mailto:${normalized.email}`} className="text-sm font-medium text-sky-700 hover:underline">
                    {normalized.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">
                <CalendarDays className="mt-0.5 h-4 w-4 text-sky-600" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Created</p>
                  <p className="text-sm font-medium text-slate-900">{formatDate(normalized.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900 px-4 py-3 text-white shadow-lg">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Prediction ID</p>
            <p className="mt-2 text-sm font-semibold">{normalized.id || "N/A"}</p>
          </div>
        </div>
      </div>

      <div className="space-y-8 px-6 py-6">
        <section className="space-y-4">
          <SectionTitle icon={Sparkles} title="AI Disease Prediction" subtitle="Model-generated outcome and confidence profile" />

          <div className="grid gap-4 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-wide text-slate-500">Disease</p>
              <div className="mt-3 flex items-center gap-2">
                <Activity className="h-5 w-5 text-rose-500" />
                <p className="text-lg font-semibold text-slate-900">{normalized.disease}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-wide text-slate-500">Risk Level</p>
              <div className="mt-3">
                <RiskBadge risk={normalized.riskLevel} />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-wide text-slate-500">Prediction</p>
              <div className="mt-3">
                <PredictionBadge value={normalized.prediction} />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <ProgressBar value={normalized.confidence} />
            </div>
          </div>
        </section>

        {normalized.parameters.length > 0 && (
          <section className="space-y-4">
            <SectionTitle
              icon={FlaskConical}
              title="Extracted Laboratory Parameters"
              subtitle="Only available clinical parameters are shown"
            />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {normalized.parameters.map((param) => (
                <ParameterCard key={param.label} label={param.label} value={param.value} />
              ))}
            </div>
          </section>
        )}

        {normalized.topFactors.length > 0 && (
          <section className="space-y-4">
            <SectionTitle
              icon={TrendingUp}
              title="Top Factors"
              subtitle="Most influential features behind the prediction"
            />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {normalized.topFactors.map((factor, index) => (
                <FactorCard key={index} factor={factor} />
              ))}
            </div>
          </section>
        )}

        {showBlockchain && (
          <section className="space-y-4">
            <SectionTitle
              icon={Database}
              title="Blockchain"
              subtitle="On-chain verification metadata for this report"
            />

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
              <div className="flex items-center gap-2 text-emerald-700">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-sm font-semibold">
                  {blockchain?.status || "Verified"}
                </span>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {blockchain?.blockNumber ? (
                <ParameterCard label="Block Number" value={blockchain.blockNumber} />
              ) : null}

              {blockchain?.reportHash ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Report Hash</p>
                  <p className="mt-2 break-all text-sm font-semibold text-slate-900">{blockchain.reportHash}</p>
                  <button
                    onClick={() => onCopyHash(blockchain.reportHash)}
                    className="mt-3 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <Copy className="h-4 w-4" />
                    Copy Hash
                  </button>
                </div>
              ) : null}

              {blockchain?.currentHash ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Current Hash</p>
                  <p className="mt-2 break-all text-sm font-semibold text-slate-900">{blockchain.currentHash}</p>
                </div>
              ) : null}

              {blockchain?.previousHash ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Previous Hash</p>
                  <p className="mt-2 break-all text-sm font-semibold text-slate-900">{blockchain.previousHash}</p>
                </div>
              ) : null}
            </div>
          </section>
        )}

        <section className="space-y-4">
          <SectionTitle icon={ClipboardCheck} title="Actions" subtitle="Prediction report tools and record controls" />
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onDownloadPdf(prediction)}
              className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </button>

            <button
              onClick={() => onDelete(prediction.id)}
              disabled={deleting}
              className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" />
              {deleting ? "Deleting..." : "Delete"}
            </button>

            <button
              onClick={() => onViewOcr(normalized.ocrText)}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Eye className="h-4 w-4" />
              View OCR Report
            </button>

            <button
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <FileSearch className="h-4 w-4" />
              View Full Report
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalReports: 0,
    totalPredictions: 0,
    totalBlockchainBlocks: 0,
    serverStatus: "Unknown",
  });

  const [users, setUsers] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [blockchain, setBlockchain] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalPredictions: 0,
    totalReports: 0,
    diabetes: 0, heart: 0, kidney: 0, liver: 0, thyroid: 0,
    diseaseDistribution: [],
    predictionTrends: [],
    reportsPerDay: [],
    hospitalRecommendationCount: [],
    userRegistrations: [],
  })
  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("token");
    router.push("/");
  };
  const [searchUser, setSearchUser] = useState("");
  const [predictionSearchUser, setPredictionSearchUser] = useState("");
  const [predictionSearchDisease, setPredictionSearchDisease] = useState("");
  const [searchBlock, setSearchBlock] = useState("");
  const [copiedHash, setCopiedHash] = useState("");
  const [ocrModalOpen, setOcrModalOpen] = useState(false);
  const [selectedOcrText, setSelectedOcrText] = useState("");

  const [loading, setLoading] = useState({
    dashboard: false,
    users: false,
    predictions: false,
    blockchain: false,
    analytics: false,
    deletingUserId: null,
    deletingPredictionId: null,
    updatingUserId: null,
    verifyingBlockId: null,
  });

  const [errors, setErrors] = useState({
    dashboard: "",
    users: "",
    predictions: "",
    blockchain: "",
    analytics: "",
  });

  const getToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  };

  const getHeaders = () => {
    const token = getToken();
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token || ""}`,
    };
  };

  const parseResponse = async (response) => {
    if (!response.ok) {
      let message = `Request failed with status ${response.status}`;
      try {
        const err = await response.json();
        message = err?.message || err?.error || message;
      } catch {
        try {
          const text = await response.text();
          if (text) message = text;
        } catch { }
      }
      throw new Error(message);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : null;
  };

  const fetchWithAuth = useCallback(async (url, options = {}) => {
    const token = getToken();
    if (!token) throw new Error("JWT token not found. Please login again.");

    const response = await fetch(url, {
      ...options,
      headers: {
        ...getHeaders(),
        ...(options.headers || {}),
      },
    });

    return parseResponse(response);
  }, []);

  const setSectionLoading = (key, value) => {
    setLoading((prev) => ({ ...prev, [key]: value }));
  };

  const setSectionError = (key, value) => {
    setErrors((prev) => ({ ...prev, [key]: value }));
  };

  const fetchDashboard = useCallback(async () => {
    setSectionLoading("dashboard", true);
    setSectionError("dashboard", "");
    try {
      const data = await fetchWithAuth(`${API_BASE}/dashboard`);
      setDashboardData({
        totalUsers: data?.totalUsers ?? 0,
        totalReports: data?.totalReports ?? 0,
        totalPredictions: data?.totalPredictions ?? 0,
        totalBlockchainBlocks: data?.totalBlockchainBlocks ?? 0,
        serverStatus: data?.serverStatus ?? "Unknown",
      });
    } catch (error) {
      setSectionError("dashboard", error.message || "Unable to load dashboard.");
    } finally {
      setSectionLoading("dashboard", false);
    }
  }, [fetchWithAuth]);

  const fetchUsers = useCallback(async () => {
    setSectionLoading("users", true);
    setSectionError("users", "");
    try {
      const data = await fetchWithAuth(`${API_BASE}/users`);
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      setSectionError("users", error.message || "Unable to load users.");
    } finally {
      setSectionLoading("users", false);
    }
  }, [fetchWithAuth]);

  const fetchPredictions = useCallback(async () => {
    setSectionLoading("predictions", true);
    setSectionError("predictions", "");
    try {
      const data = await fetchWithAuth(`${API_BASE}/predictions`);
      setPredictions(Array.isArray(data) ? data : []);
    } catch (error) {
      setSectionError("predictions", error.message || "Unable to load predictions.");
    } finally {
      setSectionLoading("predictions", false);
    }
  }, [fetchWithAuth]);

  const fetchBlockchain = useCallback(async () => {
    setSectionLoading("blockchain", true);
    setSectionError("blockchain", "");
    try {
      const data = await fetchWithAuth(`${API_BASE}/blockchain`);
      setBlockchain(Array.isArray(data) ? data : []);
    } catch (error) {
      setSectionError("blockchain", error.message || "Unable to load blockchain.");
    } finally {
      setSectionLoading("blockchain", false);
    }
  }, [fetchWithAuth]);

  const fetchAnalytics = useCallback(async () => {
    setSectionLoading("analytics", true);
    setSectionError("analytics", "");
    try {
      const data = await fetchWithAuth(`${API_BASE}/analytics`);
      setAnalytics({
        totalUsers: data?.totalUsers ?? 0,
        totalPredictions: data?.totalPredictions ?? 0,
        totalReports: data?.totalReports ?? 0,
        diabetes: data?.diabetes ?? 0,
        heart: data?.heart ?? 0,
        kidney: data?.kidney ?? 0,
        liver: data?.liver ?? 0,
        thyroid: data?.thyroid ?? 0,
        diseaseDistribution: Array.isArray(data?.diseaseDistribution) ? data.diseaseDistribution : [],
        predictionTrends: Array.isArray(data?.predictionTrends) ? data.predictionTrends : [],
        reportsPerDay: Array.isArray(data?.reportsPerDay) ? data.reportsPerDay : [],
        hospitalRecommendationCount: Array.isArray(data?.hospitalRecommendationCount) ? data.hospitalRecommendationCount : [],
        userRegistrations: Array.isArray(data?.userRegistrations) ? data.userRegistrations : [],
      });
    } catch (error) {
      setSectionError("analytics", error.message || "Unable to load analytics.");
    } finally {
      setSectionLoading("analytics", false);
    }
  }, [fetchWithAuth]);

  useEffect(() => {
    fetchDashboard();
    fetchUsers();
    fetchPredictions();
    fetchBlockchain();
    fetchAnalytics();
  }, [fetchDashboard, fetchUsers, fetchPredictions, fetchBlockchain, fetchAnalytics]);

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    setLoading((prev) => ({ ...prev, deletingUserId: id }));
    try {
      await fetchWithAuth(`${API_BASE}/users/${id}`, { method: "DELETE" });
      await fetchUsers();
      await fetchDashboard();
      await fetchAnalytics();
    } catch (error) {
      setSectionError("users", error.message || "Failed to delete user.");
    } finally {
      setLoading((prev) => ({ ...prev, deletingUserId: null }));
    }
  };

  const handleDeletePrediction = async (id) => {
    if (!window.confirm("Delete this prediction?")) return;
    setLoading((prev) => ({ ...prev, deletingPredictionId: id }));
    try {
      await fetchWithAuth(`${API_BASE}/predictions/${id}`, { method: "DELETE" });
      await fetchPredictions();
      await fetchDashboard();
      await fetchAnalytics();
    } catch (error) {
      setSectionError("predictions", error.message || "Failed to delete prediction.");
    } finally {
      setLoading((prev) => ({ ...prev, deletingPredictionId: null }));
    }
  };

  const handleRoleChange = async (userId, nextRole) => {
    setLoading((prev) => ({ ...prev, updatingUserId: userId }));
    try {
      await fetchWithAuth(`${API_BASE}/users/${userId}/role`, {
        method: "PUT",
        body: JSON.stringify({ role: nextRole }),
      });
      await fetchUsers();
    } catch (error) {
      setSectionError("users", error.message || "Failed to update role.");
    } finally {
      setLoading((prev) => ({ ...prev, updatingUserId: null }));
    }
  };

  const handleToggleUserStatus = async (user) => {
    setLoading((prev) => ({ ...prev, updatingUserId: user.id }));
    try {
      await fetchWithAuth(`${API_BASE}/users/${user.id}/status`, {
        method: "PUT",
        body: JSON.stringify({
          enabled: !(String(user.status).toLowerCase() === "active" || user.enabled === true),
        }),
      });
      await fetchUsers();
    } catch (error) {
      setSectionError("users", error.message || "Failed to update user status.");
    } finally {
      setLoading((prev) => ({ ...prev, updatingUserId: null }));
    }
  };

  const handleVerifyBlock = async (block) => {
    setLoading((prev) => ({ ...prev, verifyingBlockId: block.id || block.blockNumber }));
    try {
      await fetchWithAuth(`${API_BASE}/blockchain/verify/${block.id || block.blockNumber}`, {
        method: "POST",
      });
      await fetchBlockchain();
    } catch (error) {
      setSectionError("blockchain", error.message || "Failed to verify block.");
    } finally {
      setLoading((prev) => ({ ...prev, verifyingBlockId: null }));
    }
  };

  const handleCopyHash = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedHash(value);
      setTimeout(() => setCopiedHash(""), 1500);
    } catch {
      setSectionError("blockchain", "Unable to copy hash to clipboard.");
    }
  };

  const handleDownloadPdf = async (prediction) => {
    try {
      const response = await fetch(`${API_BASE}/predictions/${prediction.id}/pdf`, {
        headers: {
          Authorization: `Bearer ${getToken() || ""}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to download prediction PDF.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `prediction-${prediction.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setSectionError("predictions", error.message || "Unable to download PDF.");
    }
  };

  const openOcrModal = (text) => {
    setSelectedOcrText(text || "No OCR report available.");
    setOcrModalOpen(true);
  };

  const filteredUsers = useMemo(() => {
    const q = searchUser.toLowerCase();
    return users.filter((user) => {
      const username = String(user.username || user.name || "").toLowerCase();
      const email = String(user.email || "").toLowerCase();
      const role = String(user.role || "").toLowerCase();
      const status = String(user.status || "").toLowerCase();
      return (
        username.includes(q) ||
        email.includes(q) ||
        role.includes(q) ||
        status.includes(q)
      );
    });
  }, [users, searchUser]);

  const filteredPredictions = useMemo(() => {
    return predictions.filter((item) => {
      const normalized = normalizePrediction(item);
      const email = String(normalized.email || "").toLowerCase();
      const disease = String(normalized.disease || "").toLowerCase();
      return (
        email.includes(predictionSearchUser.toLowerCase()) &&
        disease.includes(predictionSearchDisease.toLowerCase())
      );
    });
  }, [predictions, predictionSearchUser, predictionSearchDisease]);

  const filteredBlocks = useMemo(() => {
    const q = searchBlock.toLowerCase();
    return blockchain.filter((block) => {
      return (
        String(block.blockNumber || block.number || "").toLowerCase().includes(q) ||
        String(block.reportName || "").toLowerCase().includes(q) ||
        String(block.userEmail || "").toLowerCase().includes(q) ||
        String(block.reportHash || "").toLowerCase().includes(q) ||
        String(block.previousHash || "").toLowerCase().includes(q) ||
        String(block.currentHash || "").toLowerCase().includes(q) ||
        String(block.status || "").toLowerCase().includes(q)
      );
    });
  }, [blockchain, searchBlock]);

  const menuItems = [
    { key: "dashboard", label: "Dashboard", icon: "◈" },
    { key: "users", label: "Users", icon: "👤" },
    { key: "predictions", label: "Predictions", icon: "🧠" },
    { key: "blockchain", label: "Blockchain", icon: "⛓" },
    { key: "analytics", label: "Analytics", icon: "📊" },
    { key: "auditLogs", label: "Audit Logs", icon: "📋" },
    { key: "monitoring", label: "System Monitoring", icon: "⚡" },
    { key: "settings", label: "Settings", icon: "⚙" },
  ];

  const statCards = [
    { title: "Total Users", value: dashboardData.totalUsers, sub: "Registered accounts" },
    { title: "Reports Uploaded", value: dashboardData.totalReports, sub: "Medical reports stored" },
    { title: "AI Predictions", value: dashboardData.totalPredictions, sub: "Prediction records" },
    { title: "Blockchain Blocks", value: dashboardData.totalBlockchainBlocks, sub: "Ledger blocks" },
    { title: "Server Status", value: dashboardData.serverStatus, sub: "Backend health" },
  ];

  const renderLoader = (label) => (
    <div className="content-card">
      <div className="empty-state">
        <div>
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: "50%",
              margin: "0 auto 14px",
              border: "4px solid rgba(255,255,255,0.08)",
              borderTop: "4px solid #18d9ff",
              animation: "spin 1s linear infinite",
            }}
          />
          <p>{label}</p>
          <span className="mini-help">Fetching live admin data from the backend.</span>
        </div>
      </div>
    </div>
  );

  const renderError = (title, message, retryFn) => (
    <div className="status-banner error" style={{ display: "block" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <span className="status-dot"></span>
        <strong>{title}</strong>
      </div>
      <div style={{ marginBottom: 12 }}>{message}</div>
      <button className="secondary-btn" onClick={retryFn}>Retry</button>
    </div>
  );

  const renderDashboard = () => {
    if (loading.dashboard) return renderLoader("Loading dashboard...");
    if (errors.dashboard) return renderError("Dashboard unavailable", errors.dashboard, fetchDashboard);

    return (
      <>
        <section className="hero-card">
          <div className="hero-copy">
            <p className="eyebrow">TRUSTMEDAI ADMIN</p>
            <h2>Secure intelligence for medical reports, predictions, and ledger trust.</h2>
            <p>
              Manage users, AI predictions, blockchain traceability, analytics, and live system monitoring
              from one controlled admin workspace.
            </p>
          </div>
          <div className="hero-badges">
            <span>{dashboardData.serverStatus}</span>
            <span>{dashboardData.totalUsers} Users</span>
            <span>{dashboardData.totalReports} Reports</span>
          </div>
        </section>

        <div className={`status-banner ${dashboardData.serverStatus === "Running" ? "success" : "info"}`}>
          <span className="status-dot"></span>
          <span>Live backend status: {dashboardData.serverStatus}</span>
        </div>

        <section className="option-grid">
          {statCards.map((item, index) => (
            <article className="option-card active" key={item.title}>
              <div>
                <span className="option-number">0{index + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.sub}</p>
              </div>
              <h2 style={{ margin: 0, fontSize: "2rem", color: "#ffffff" }}>{item.value}</h2>
            </article>
          ))}
        </section>
      </>
    );
  };

  const renderUsers = () => {
    if (loading.users) return renderLoader("Loading users...");
    if (errors.users) return renderError("Users unavailable", errors.users, fetchUsers);

    return (
      <section className="content-card">
        <div className="card-header">
          <div>
            <p className="eyebrow">User Management</p>
            <h2>All Users</h2>
          </div>
          <div style={{ width: "320px", maxWidth: "100%" }}>
            <input
              type="text"
              placeholder="Search users..."
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
            />
          </div>
        </div>

        <div className="parameter-list">
          {filteredUsers.map((user) => (
            <div className="parameter-card" key={user.id}>
              <div className="parameter-card-head">
                <div>
                  <strong>{user.username || user.name || "Unknown User"}</strong>
                  <span>{user.email || "No email"}</span>
                </div>
                <span className="history-tag">{user.status || (user.enabled ? "Active" : "Disabled")}</span>
              </div>

              <div className="parameter-value-row">
                <p>Role: {user.role || "N/A"}</p>
              </div>

              <div className="parameter-card-actions" style={{ marginTop: "14px" }}>
                <select
                  className="dark-select"
                  value={user.role || "USER"}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  disabled={loading.updatingUserId === user.id}
                  style={{ minWidth: "160px" }}
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="DOCTOR">DOCTOR</option>
                  <option value="ANALYST">ANALYST</option>
                </select>

                <button
                  className="parameter-action-btn"
                  onClick={() => handleToggleUserStatus(user)}
                  disabled={loading.updatingUserId === user.id}
                >
                  {String(user.status).toLowerCase() === "active" || user.enabled === true ? "Disable" : "Enable"}
                </button>

                <button
                  className="parameter-action-btn delete"
                  onClick={() => handleDeleteUser(user.id)}
                  disabled={loading.deletingUserId === user.id}
                >
                  {loading.deletingUserId === user.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}

          {!filteredUsers.length && (
            <div className="empty-state">
              <div>
                <p>No users found.</p>
                <span className="mini-help">Try another search term.</span>
              </div>
            </div>
          )}
        </div>
      </section>
    );
  };

  const renderPredictions = () => {
    if (loading.predictions) return renderLoader('Loading predictions...')
    if (errors.predictions) return renderError('Predictions unavailable', errors.predictions, fetchPredictions)

    return (
      <section className="content-card">
        <div className="card-header">
          <div>
            <p className="eyebrow">Prediction History</p>
            <h2>Clinical AI Reports</h2>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search by patient email..."
              value={predictionSearchUser}
              onChange={e => setPredictionSearchUser(e.target.value)}
              style={{ width: 240, maxWidth: '100%' }}
            />
            <input
              type="text"
              placeholder="Search by disease..."
              value={predictionSearchDisease}
              onChange={e => setPredictionSearchDisease(e.target.value)}
              style={{ width: 200, maxWidth: '100%' }}
            />
          </div>
        </div>

        <div className="parameter-list">
          {filteredPredictions.length > 0 ? filteredPredictions.map(item => {
            const normalized = normalizePrediction(item)
            return (
              <div className="parameter-card" key={item.id}>
                <div className="parameter-card-head">
                  <div>
                    <strong>{normalized.disease || 'Unknown Disease'}</strong>
                    <span>{normalized.email}</span>
                  </div>
                  <span className="history-tag">{normalized.riskLevel}</span>
                </div>

                <div className="result-grid" style={{ marginTop: 12 }}>
                  <div className="result-box">
                    <span>Prediction</span>
                    <strong>{normalized.prediction}</strong>
                  </div>
                  <div className="result-box">
                    <span>Confidence</span>
                    <strong>{Number(normalized.confidence).toFixed(2)}%</strong>
                  </div>
                  <div className="result-box">
                    <span>Risk Level</span>
                    <strong>{normalized.riskLevel}</strong>
                  </div>
                  <div className="result-box">
                    <span>Date</span>
                    <strong>{formatDate(normalized.createdAt)}</strong>
                  </div>
                  <div className="result-box">
                    <span>ID</span>
                    <strong style={{ fontSize: 12, wordBreak: 'break-all' }}>{normalized.id || 'N/A'}</strong>
                  </div>
                </div>

                {normalized.parameters.length > 0 && (
                  <div style={{ marginTop: 14 }}>
                    <p className="eyebrow" style={{ marginBottom: 8 }}>Lab Parameters</p>
                    <div className="result-grid">
                      {normalized.parameters.map(p => (
                        <div className="result-box" key={p.label}>
                          <span>{p.label}</span>
                          <strong>{p.value}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {normalized.topFactors.length > 0 && (
                  <div style={{ marginTop: 14 }}>
                    <p className="eyebrow" style={{ marginBottom: 8 }}>Top Factors</p>
                    <div className="result-grid">
                      {normalized.topFactors.map((factor, idx) => {
                        const name = factor?.feature || factor?.name || factor?.factor || 'Unknown'
                        const impact = factor?.impact ?? factor?.value ?? factor?.score ?? 0
                        return (
                          <div className="result-box" key={idx}>
                            <span>{name}</span>
                            <strong>{Number(impact).toFixed(4)}</strong>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div className="parameter-card-actions" style={{ marginTop: 14 }}>
                  <button
                    className="parameter-action-btn"
                    onClick={() => onDownloadPdf && handleDownloadPdf(item)}
                  >
                    Download PDF
                  </button>
                  <button
                    className="parameter-action-btn"
                    onClick={() => openOcrModal(normalized.ocrText)}
                  >
                    View OCR Report
                  </button>
                  <button
                    className="parameter-action-btn delete"
                    onClick={() => handleDeletePrediction(item.id)}
                    disabled={loading.deletingPredictionId === item.id}
                  >
                    {loading.deletingPredictionId === item.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            )
          }) : (
            <div className="empty-state">
              <div />
              <p>No prediction history found.</p>
              <span className="mini-help">Try a different patient email or disease filter.</span>
            </div>
          )}
        </div>

        <OCRModal
          open={ocrModalOpen}
          onClose={() => setOcrModalOpen(false)}
          text={selectedOcrText}
        />
      </section>
    )
  }

  const renderBlockchain = () => {
    if (loading.blockchain) return renderLoader("Loading blockchain explorer...");
    if (errors.blockchain) return renderError("Blockchain unavailable", errors.blockchain, fetchBlockchain);

    return (
      <section className="content-card">
        <div className="card-header">
          <div>
            <p className="eyebrow">Blockchain Explorer</p>
            <h2>Verified Medical Report Ledger</h2>
          </div>
          <div style={{ width: "320px", maxWidth: "100%" }}>
            <input
              type="text"
              placeholder="Search block, email, report, or hash..."
              value={searchBlock}
              onChange={(e) => setSearchBlock(e.target.value)}
            />
          </div>
        </div>

        <div className="parameter-list">
          {filteredBlocks.map((block, index) => {
            const blockKey = block.id || block.blockNumber || index;
            const reportHash = block.reportHash || "N/A";
            const currentHash = block.currentHash || "N/A";
            const previousHash = block.previousHash || "N/A";

            return (
              <div className="parameter-card" key={blockKey}>
                <div className="parameter-card-head">
                  <div>
                    <strong>Block #{block.blockNumber || block.number || "N/A"}</strong>
                    <span>{block.reportName || "Unnamed Report"}</span>
                  </div>
                  <span className="history-tag">{block.status || "✔ Verified"}</span>
                </div>

                <div className="result-grid" style={{ marginTop: 14 }}>
                  <div className="result-box">
                    <span>User Email</span>
                    <strong>{block.userEmail || "N/A"}</strong>
                  </div>
                  <div className="result-box">
                    <span>Created Time</span>
                    <strong>{block.createdTime || block.createdAt || "N/A"}</strong>
                  </div>
                  <div className="result-box">
                    <span>Report Hash</span>
                    <strong>{reportHash}</strong>
                  </div>
                  <div className="result-box">
                    <span>Previous Hash</span>
                    <strong>{previousHash}</strong>
                  </div>
                  <div className="result-box">
                    <span>Current Hash</span>
                    <strong>{currentHash}</strong>
                  </div>
                  <div className="result-box">
                    <span>Status</span>
                    <strong>{block.status || "✔ Verified"}</strong>
                  </div>
                </div>

                <div className="parameter-card-actions" style={{ marginTop: 14 }}>
                  <button className="parameter-action-btn" onClick={() => handleCopyHash(reportHash)}>
                    {copiedHash === reportHash ? "Copied!" : "Copy Report Hash"}
                  </button>
                  <button className="parameter-action-btn" onClick={() => handleCopyHash(currentHash)}>
                    {copiedHash === currentHash ? "Copied!" : "Copy Current Hash"}
                  </button>
                  <button
                    className="parameter-action-btn"
                    onClick={() => handleVerifyBlock(block)}
                    disabled={loading.verifyingBlockId === (block.id || block.blockNumber)}
                  >
                    {loading.verifyingBlockId === (block.id || block.blockNumber) ? "Verifying..." : "Verify Block"}
                  </button>
                </div>
              </div>
            );
          })}

          {!filteredBlocks.length && (
            <div className="empty-state">
              <div>
                <p>No blockchain records found.</p>
                <span className="mini-help">Search by block number, report name, email, or hash.</span>
              </div>
            </div>
          )}
        </div>
      </section>
    );
  };

  const renderAnalytics = () => {
    if (loading.analytics) return renderLoader('Loading analytics...')
    if (errors.analytics) return renderError('Analytics unavailable', errors.analytics, fetchAnalytics)

    const tooltipStyle = {
      backgroundColor: '#0b1422',
      border: '1px solid rgba(24,217,255,0.2)',
      borderRadius: 12,
      color: '#edf7ff',
    }
    const axisStyle = { fill: '#94a7c0', fontSize: 12 }

    return (
      <section className="content-card">
        <div className="card-header">
          <div>
            <p className="eyebrow">Analytics</p>
            <h2>Operational Intelligence</h2>
          </div>
          <button className="secondary-btn" onClick={fetchAnalytics}>↻ Refresh Analytics</button>
        </div>

        {/* KPI Row */}
        <div className="result-grid" style={{ marginTop: 18 }}>
          <div className="result-box">
            <span>Total Users</span>
            <strong style={{ color: '#18d9ff', fontSize: '1.5rem' }}>{analytics.totalUsers}</strong>
          </div>
          <div className="result-box">
            <span>Total Predictions</span>
            <strong style={{ color: '#00e0c6', fontSize: '1.5rem' }}>{analytics.totalPredictions}</strong>
          </div>
          <div className="result-box">
            <span>Total Reports</span>
            <strong style={{ color: '#5d78ff', fontSize: '1.5rem' }}>{analytics.totalReports}</strong>
          </div>
          <div className="result-box">
            <span>Charts</span>
            <strong style={{ color: '#75f3b9' }}>Powered by Recharts</strong>
          </div>
        </div>

        {/* Disease KPI Row */}
        <div className="result-grid" style={{ marginTop: 12 }}>
          {[
            { label: 'Diabetes Cases', value: analytics.diabetes, color: '#18d9ff' },
            { label: 'Heart Cases', value: analytics.heart, color: '#ff8ca0' },
            { label: 'Kidney Cases', value: analytics.kidney, color: '#ffd166' },
            { label: 'Liver Cases', value: analytics.liver, color: '#75f3b9' },
            { label: 'Thyroid Cases', value: analytics.thyroid, color: '#5d78ff' },
          ].map(d => (
            <div className="result-box" key={d.label}>
              <span>{d.label}</span>
              <strong style={{ color: d.color, fontSize: '1.4rem' }}>{d.value ?? 0}</strong>
            </div>
          ))}
        </div>

        <div className="parameter-list" style={{ marginTop: 18 }}>

          {/* Disease Distribution Pie */}
          <div className="parameter-card">
            <strong style={{ display: 'block', marginBottom: 16 }}>Disease Distribution</strong>
            {analytics.diseaseDistribution.length > 0 ? (
              <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={analytics.diseaseDistribution}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={110}
                      innerRadius={45}
                      paddingAngle={3}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {analytics.diseaseDistribution.map((_, index) => (
                        <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ color: '#94a7c0' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="empty-state" style={{ minHeight: 160 }}>
                <div><p>No disease data yet.</p><span className="mini-help">Upload reports to see disease distribution.</span></div>
              </div>
            )}
          </div>

          {/* Prediction Trends Line */}
          <div className="parameter-card">
            <strong style={{ display: 'block', marginBottom: 16 }}>Prediction Trends</strong>
            {analytics.predictionTrends.length > 0 ? (
              <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer>
                  <LineChart data={analytics.predictionTrends}>
                    <CartesianGrid stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="name" tick={axisStyle} />
                    <YAxis tick={axisStyle} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ color: '#94a7c0' }} />
                    <Line type="monotone" dataKey="value" name="Predictions" stroke="#18d9ff" strokeWidth={3} dot={{ fill: '#18d9ff', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="empty-state" style={{ minHeight: 160 }}>
                <div><p>No trend data yet.</p><span className="mini-help">Data appears once reports are uploaded.</span></div>
              </div>
            )}
          </div>

          {/* Reports Per Day Bar */}
          <div className="parameter-card">
            <strong style={{ display: 'block', marginBottom: 16 }}>Reports Per Day</strong>
            {analytics.reportsPerDay.length > 0 ? (
              <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer>
                  <BarChart data={analytics.reportsPerDay}>
                    <CartesianGrid stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="name" tick={axisStyle} />
                    <YAxis tick={axisStyle} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ color: '#94a7c0' }} />
                    <Bar dataKey="value" name="Reports" fill="#00e0c6" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="empty-state" style={{ minHeight: 160 }}>
                <div><p>No report data yet.</p><span className="mini-help">Upload reports to see daily activity.</span></div>
              </div>
            )}
          </div>

          {/* User Registrations Bar */}
          <div className="parameter-card">
            <strong style={{ display: 'block', marginBottom: 16 }}>User Registrations</strong>
            {analytics.userRegistrations.length > 0 ? (
              <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer>
                  <BarChart data={analytics.userRegistrations}>
                    <CartesianGrid stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="name" tick={axisStyle} />
                    <YAxis tick={axisStyle} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ color: '#94a7c0' }} />
                    <Bar dataKey="value" name="Registrations" fill="#ff8ca0" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="empty-state" style={{ minHeight: 160 }}>
                <div><p>No registration data yet.</p><span className="mini-help">User createdAt not tracked.</span></div>
              </div>
            )}
          </div>

        </div>
      </section>
    )
  };
  const renderMonitoring = () => (
    <section className="content-card">
      <div className="card-header">
        <div>
          <p className="eyebrow">Grafana Monitoring</p>
          <h2>Live Infrastructure Dashboard</h2>
        </div>
      </div>

      <div className="status-banner info" style={{ marginTop: 18 }}>
        <span className="status-dot"></span>
        <span>Embedded Grafana view for CPU, RAM, JVM, database, and API activity.</span>
      </div>

      <div style={{ marginTop: 18, borderRadius: "24px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
        <iframe
          src={GRAFANA_URL}
          width="100%"
          height="850"
          frameBorder="0"
          title="Grafana Dashboard"
        />
      </div>
    </section>
  );

  const renderSettings = () => (
    <section className="content-card">
      <div className="card-header">
        <div>
          <p className="eyebrow">Settings</p>
          <h2>Platform Configuration</h2>
        </div>
      </div>

      <form className="details-form">
        <div className="form-grid">
          <label>
            Platform Name
            <input type="text" defaultValue="TrustMedAI Admin" />
          </label>
          <label>
            Token Status
            <input type="text" value={getToken() ? "JWT Available" : "JWT Missing"} readOnly />
          </label>
        </div>
      </form>
    </section>
  );

  const pageContent = {
    dashboard: renderDashboard(),
    users: renderUsers(),
    predictions: renderPredictions(),
    blockchain: renderBlockchain(),
    analytics: renderAnalytics(),
    auditLogs: (
      <AuditLogs
        fetchWithAuth={fetchWithAuth}
        getToken={getToken}
        apiBase={API_BASE}
      />
    ),
    monitoring: renderMonitoring(),
    settings: renderSettings(),
  };

  return (
    <>
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <div className="dashboard-layout admin-layout">
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <div>
            <div className="sidebar-brand">
              <div className="brand-icon">
                <span></span>
                <span></span>
              </div>
              <div>
                <p className="eyebrow">Admin Dashboard</p>
                <h2>TRUSTMEDAI</h2>
              </div>
            </div>

            <div className="sidebar-menu">
              {menuItems.map((item) => (
                <button
                  key={item.key}
                  className={`sidebar-link ${activePage === item.key ? "active" : ""}`}
                  onClick={() => {
                    setActivePage(item.key);
                    setSidebarOpen(false);
                  }}
                >
                  <span className="sidebar-link-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="sidebar-note">
            <h3>Admin APIs</h3>
            <span>JWT secured endpoints, analytics charts, blockchain explorer, and Grafana monitoring.</span>
          </div>
        </aside>

        <main className="main-panel">
          <header className="top-header">
            <div className="header-left">
              <button className="menu-toggle" onClick={() => setSidebarOpen((prev) => !prev)}>
                <span></span>
                <span></span>
                <span></span>
              </button>
              <div>
                <p className="eyebrow">Healthcare AI Administration</p>
                <h1>{menuItems.find((item) => item.key === activePage)?.label}</h1>
              </div>
            </div>

            <div className="header-actions">
              <div className="profile-box">
                <div className="profile-image-wrap">
                  <img
                    className="profile-image"
                    src="./images/doctor.jpg"
                    alt="Admin profile"
                  />
                </div>
                <div>
                  <h3>Admin Control</h3>
                  <span>Secure superuser access</span>
                </div>
              </div>

              <button
                className="logout-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </header>

          {pageContent[activePage]}
        </main>
      </div>
    </>
  );
}
