"use client";

import { motion } from "framer-motion";
import {
    Activity,
    AlertCircle,
    Brain,
    CalendarClock,
    CheckCircle2,
    ClipboardList,
    ShieldAlert,
    Sparkles,
    TrendingUp,
    UserRound,
} from "lucide-react";
import SummaryMetric from "./SummaryMetric";
import RecommendationCard from "./RecommendationCard";
import PriorityBadge from "./PriorityBadge";

export default function ClinicalSummaryCard({ data }) {
    if (!data) return null;

    const metricItems = [
        { label: "Patient Name", value: data.patientName, hint: "Patient profile", icon: UserRound },
        { label: "Highest Risk Disease", value: data.disease, hint: "Top predicted condition", icon: ShieldAlert },
        { label: "Risk Level", value: data.risk, hint: data.confidenceLabel, icon: AlertCircle },
        { label: "Confidence", value: `${data.probability.toFixed(2)}%`, hint: "Model probability", icon: Sparkles },
        { label: "Overall Health Score", value: `${data.overallHealthScore} / 100`, hint: "Aggregated across models", icon: Activity },
        { label: "Analysis Time", value: data.timestamp, hint: "Generated assessment time", icon: CalendarClock },
    ];

    return (
        <motion.section
            className="section-block clinical-summary-section"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
        >
            <div className="glass-card clinical-summary-card">
                <div className="clinical-summary-head">
                    <div>
                        <p className="eyebrow">🩺 AI Clinical Summary</p>
                        <h2>AI Clinical Summary</h2>
                        <span className="clinical-summary-subtitle">
                            AI-generated interpretation of the prediction results
                        </span>
                    </div>

                    <PriorityBadge level={data.priority} />
                </div>

                <div className="clinical-summary-grid">
                    <div className="summary-primary-panel">
                        <div className="summary-primary-top">
                            <div className="summary-hero-icon">
                                <Brain size={24} />
                            </div>

                            <div>
                                <span className="summary-kicker">Primary AI finding</span>
                                <h3>{data.disease}</h3>
                                <p>{data.summaryText}</p>
                            </div>
                        </div>

                        <div className="summary-metrics-grid">
                            {metricItems.map((item) => (
                                <SummaryMetric key={item.label} {...item} />
                            ))}
                        </div>
                    </div>

                    <div className="summary-side-panel">
                        <div className="summary-side-block">
                            <div className="summary-mini-head">
                                <CheckCircle2 size={18} />
                                <h3>Key Findings</h3>
                            </div>

                            <div className="key-findings-grid">
                                <article className="key-finding-card">
                                    <span>Highest Risk Disease</span>
                                    <strong>{data.disease}</strong>
                                </article>
                                <article className="key-finding-card">
                                    <span>Confidence</span>
                                    <strong>{data.probability.toFixed(2)}%</strong>
                                </article>
                                <article className="key-finding-card">
                                    <span>Overall Health Score</span>
                                    <strong>{data.overallHealthScore} / 100</strong>
                                </article>
                                <article className="key-finding-card">
                                    <span>Prediction Status</span>
                                    <strong>{data.status}</strong>
                                </article>
                            </div>
                        </div>

                        <div className="summary-side-block">
                            <div className="summary-mini-head">
                                <TrendingUp size={18} />
                                <h3>Top Contributing Factors</h3>
                            </div>

                            <div className="contributing-factor-list">
                                {data.topFactors.map((factor) => (
                                    <article className="factor-card" key={factor.feature}>
                                        <div className="factor-icon">
                                            <TrendingUp size={16} />
                                        </div>
                                        <div>
                                            <strong>{factor.feature}</strong>
                                            <span>{factor.contribution}</span>
                                            <p>{factor.narrative}</p>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="clinical-recommendations-block">
                    <div className="summary-mini-head">
                        <ClipboardList size={18} />
                        <h3>Clinical Recommendations</h3>
                    </div>

                    <div className="recommendation-grid">
                        {data.recommendations.map((item) => (
                            <RecommendationCard key={item.title} {...item} />
                        ))}
                    </div>
                </div>

                <div className="clinical-disclaimer">
                    <AlertCircle size={18} />
                    <p>
                        ⚠ This report is generated by TrustMedAI using Explainable Artificial Intelligence.
                        It is intended only as a clinical decision-support tool and must not be considered a
                        confirmed medical diagnosis. Please consult a qualified healthcare professional before
                        making medical decisions.
                    </p>
                </div>
            </div>
        </motion.section>
    );
}