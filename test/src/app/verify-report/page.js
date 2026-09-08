"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { API_URL } from "@/lib/config";

export default function VerifyReportPage() {
    return (
        <Suspense fallback={<VerifyReportLoading />}>
            <VerifyReportContent />
        </Suspense>
    );
}

function VerifyReportContent() {
    const searchParams = useSearchParams();
    const hash = searchParams.get("hash");
    const [data, setData] = useState(null);
    const [copied, setCopied] = useState(false);

    const dottedHash = (value) => {
        if (!value) return "—";
        if (value.length <= 20) return value;
        return `${value.slice(0, 10)}............`;
    };

    const formatDate = (value) => {
        if (!value) return { date: "—", time: "" };
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return { date: value, time: "" };

        return {
            date: d.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }),
            time: d.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
            }),
        };
    };

    const copyHash = async () => {
        try {
            const value = data?.currentHash || hash || "";
            if (!value) return;
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (!hash) return;

        async function verify() {
            try {
                const response = await fetch(
                    `${API_URL}/verify-report/${hash}`
                );

                const text = await response.text();
                const json = JSON.parse(text);
                setData(json);
            } catch (error) {
                console.error(error);
            }
        }

        verify();
    }, [hash]);

    if (!data) {
        return (
            <div
                className="verify-page verify-loading-page"
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                        "radial-gradient(circle at 12% 14%, rgba(24, 217, 255, 0.14), transparent 18%), radial-gradient(circle at 82% 18%, rgba(93, 120, 255, 0.14), transparent 18%), radial-gradient(circle at 55% 100%, rgba(0, 224, 198, 0.08), transparent 20%), linear-gradient(135deg, #040916 0%, #08101d 50%, #050913 100%)",
                    padding: "20px",
                    fontFamily: "Inter, Arial, sans-serif",
                    color: "#edf7ff",
                }}
            >
                <div
                    className="verify-card verify-loading-card"
                    style={{
                        width: "100%",
                        maxWidth: "520px",
                        borderRadius: "28px",
                        padding: "40px 32px",
                        textAlign: "center",
                        background:
                            "linear-gradient(180deg, rgba(255,255,255,0.055), rgba(255,255,255,0.02), rgba(10,18,32,0.72))",
                        border: "1px solid rgba(91, 160, 255, 0.12)",
                        boxShadow:
                            "0 28px 80px rgba(0, 0, 0, 0.36), 0 12px 36px rgba(9, 18, 33, 0.32), inset 0 1px 0 rgba(255, 255, 255, 0.09)",
                        backdropFilter: "blur(24px) saturate(160%)",
                    }}
                >
                    <div style={{ fontSize: 42, marginBottom: 14 }}>🩺</div>
                    <h2 style={{ margin: 0, color: "#edf7ff" }}>Verifying Report...</h2>
                    <p style={{ margin: "10px 0 0", color: "#94a7c0", lineHeight: 1.7 }}>
                        Checking blockchain integrity and report authenticity.
                    </p>
                </div>
            </div>
        );
    }

    const verified = !!data.verified;
    const dateParts = formatDate(data.createdAt);
    const verificationId = data.blockNumber
        ? `BLK-${String(data.blockNumber).padStart(6, "0")}`
        : "—";

    return (
        <div
            className="verify-page"
            style={{
                minHeight: "100vh",
                background:
                    "radial-gradient(circle at 12% 14%, rgba(24, 217, 255, 0.14), transparent 18%), radial-gradient(circle at 82% 18%, rgba(93, 120, 255, 0.14), transparent 18%), radial-gradient(circle at 55% 100%, rgba(0, 224, 198, 0.08), transparent 20%), linear-gradient(135deg, #040916 0%, #08101d 50%, #050913 100%)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "32px 16px",
                fontFamily: "Inter, Arial, sans-serif",
            }}
        >
            <div
                className="verify-card"
                style={{
                    width: "100%",
                    maxWidth: "900px",
                    borderRadius: "30px",
                    padding: "30px 24px",
                    background:
                        "linear-gradient(180deg, rgba(255,255,255,0.055), rgba(255,255,255,0.02), rgba(10,18,32,0.72))",
                    border: "1px solid rgba(91, 160, 255, 0.12)",
                    boxShadow:
                        "0 28px 80px rgba(0, 0, 0, 0.36), 0 12px 36px rgba(9, 18, 33, 0.32), inset 0 1px 0 rgba(255, 255, 255, 0.09)",
                    backdropFilter: "blur(24px) saturate(160%)",
                    WebkitBackdropFilter: "blur(24px) saturate(160%)",
                    color: "#edf7ff",
                }}
            >
                <SectionLine />

                <section
                    style={{
                        textAlign: "center",
                        padding: "10px 8px 22px",
                    }}
                >
                    <div
                        style={{
                            fontSize: "2rem",
                            marginBottom: 8,
                        }}
                    >
                        🩺 TrustMedAI
                    </div>

                    <h1
                        style={{
                            margin: "0 0 10px",
                            fontSize: "2rem",
                            lineHeight: 1.2,
                            letterSpacing: "-0.03em",
                            color: "#edf7ff",
                        }}
                    >
                        Blockchain Medical Report Verification
                    </h1>

                    <p
                        style={{
                            margin: 0,
                            color: "#94a7c0",
                            fontSize: "1rem",
                            lineHeight: 1.8,
                        }}
                    >
                        AI + Blockchain Enabled Healthcare
                    </p>
                </section>

                <SectionLine />

                <section
                    style={{
                        textAlign: "center",
                        padding: "26px 12px",
                    }}
                >
                    <div
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            minWidth: "150px",
                            minHeight: "52px",
                            padding: "0 22px",
                            borderRadius: "999px",
                            background: verified
                                ? "rgba(117, 243, 185, 0.12)"
                                : "rgba(255, 140, 160, 0.12)",
                            border: verified
                                ? "1px solid rgba(117, 243, 185, 0.18)"
                                : "1px solid rgba(255, 140, 160, 0.18)",
                            color: verified ? "#75f3b9" : "#ff8ca0",
                            fontSize: "1rem",
                            fontWeight: 800,
                            letterSpacing: "0.08em",
                            marginBottom: 18,
                        }}
                    >
                        {verified ? "VERIFIED" : "FAILED"}
                    </div>

                    <h2
                        style={{
                            margin: "0 0 10px",
                            fontSize: "1.5rem",
                            color: verified ? "#edf7ff" : "#ffccd4",
                        }}
                    >
                        {verified
                            ? "Blockchain Integrity Confirmed"
                            : "Blockchain Verification Failed"}
                    </h2>

                    <p
                        style={{
                            margin: 0,
                            color: "#94a7c0",
                            fontSize: "1rem",
                            lineHeight: 1.8,
                        }}
                    >
                        {verified
                            ? "SHA-256 Hash Successfully Verified"
                            : data.message || "The report could not be verified."}
                    </p>
                </section>

                <SectionLine />

                <section
                    style={{
                        display: "grid",
                        gap: 14,
                        padding: "24px 4px",
                    }}
                >
                    <DetailRow label="Medical Report" value={data.reportName || "—"} />
                    <DetailRow
                        label="Verification Date"
                        value={
                            <>
                                <div>{dateParts.date}</div>
                                <div style={{ color: "#94a7c0", fontSize: "0.95rem", marginTop: 4 }}>
                                    {dateParts.time}
                                </div>
                            </>
                        }
                    />
                    <DetailRow
                        label="Blockchain Block"
                        value={data.blockNumber ?? "—"}
                    />
                    <DetailRow label="Verification ID" value={verificationId} />
                </section>

                <SectionLine />

                <section
                    style={{
                        padding: "24px 4px",
                    }}
                >
                    <div
                        style={{
                            color: "#94a7c0",
                            fontSize: "0.9rem",
                            marginBottom: 16,
                            fontWeight: 700,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                        }}
                    >
                        Verification Status
                    </div>

                    <StatusItem
                        ok={verified}
                        text={verified ? "Blockchain Record Found" : "Blockchain Record Not Found"}
                    />
                    <StatusItem
                        ok={verified}
                        text={verified ? "SHA-256 Hash Matched" : "SHA-256 Hash Mismatch"}
                    />
                    <StatusItem
                        ok={verified}
                        text={verified ? "No Tampering Detected" : "Tampering Check Failed"}
                    />
                    <StatusItem
                        ok={verified}
                        text={verified ? "Report Successfully Verified" : "Report Verification Failed"}
                    />
                </section>

                <SectionLine />

                <section
                    style={{
                        padding: "24px 4px",
                    }}
                >
                    <div
                        style={{
                            color: "#94a7c0",
                            fontSize: "0.9rem",
                            marginBottom: 16,
                            fontWeight: 700,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                        }}
                    >
                        SHA-256 Blockchain Hash
                    </div>

                    <div
                        title={data.currentHash || hash}
                        style={{
                            background: "rgba(6, 16, 28, 0.56)",
                            border: "1px solid rgba(91, 160, 255, 0.12)",
                            borderRadius: "18px",
                            padding: "18px 18px",
                            color: "#edf7ff",
                            fontFamily: "monospace",
                            fontSize: "1rem",
                            lineHeight: 1.6,
                            marginBottom: 14,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                    >
                        {dottedHash(data.currentHash || hash)}
                    </div>
                </section>

                <SectionLine />

                <section
                    style={{
                        padding: "26px 8px",
                        textAlign: "center",
                    }}
                >
                    <p
                        style={{
                            margin: 0,
                            color: "#edf7ff",
                            lineHeight: 1.9,
                            fontSize: "1rem",
                        }}
                    >
                        This report has not been modified
                        <br />
                        after generation.
                    </p>

                    <p
                        style={{
                            margin: "18px 0 0",
                            color: "#94a7c0",
                            lineHeight: 1.9,
                            fontSize: "1rem",
                        }}
                    >
                        Any alteration will invalidate
                        <br />
                        blockchain verification.
                    </p>
                </section>

                <SectionLine />

                <section
                    style={{
                        padding: "26px 8px 10px",
                        textAlign: "center",
                    }}
                >
                    <div
                        style={{
                            color: "#edf7ff",
                            fontWeight: 800,
                            fontSize: "1.1rem",
                            marginBottom: 14,
                        }}
                    >
                        Powered by TrustMedAI
                    </div>

                    <div
                        style={{
                            color: "#94a7c0",
                            lineHeight: 1.9,
                            fontSize: "1rem",
                        }}
                    >
                        Artificial Intelligence
                        <br />
                        +
                        <br />
                        Blockchain Technology
                        <br />
                        <br />
                        Medical Decision Support System
                    </div>
                </section>

                <SectionLine />
            </div>
        </div>
    );
}

function VerifyReportLoading() {
    return (
        <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#050b18", color: "#edf7ff" }}>
            Loading verification…
        </div>
    );
}

function SectionLine() {
    return (
        <div
            style={{
                height: 1,
                background:
                    "linear-gradient(90deg, transparent, rgba(24, 217, 255, 0.28), transparent)",
            }}
        />
    );
}

function DetailRow({ label, value }) {
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "220px 1fr",
                gap: "16px",
                alignItems: "start",
                padding: "14px 0",
            }}
        >
            <div
                style={{
                    color: "#94a7c0",
                    fontSize: "0.92rem",
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                }}
            >
                {label}
            </div>

            <div
                style={{
                    color: "#edf7ff",
                    fontSize: "1rem",
                    fontWeight: 600,
                    lineHeight: 1.7,
                    wordBreak: "break-word",
                }}
            >
                {value}
            </div>
        </div>
    );
}

function StatusItem({ ok, text }) {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 0",
                color: ok ? "#75f3b9" : "#ff8ca0",
                fontSize: "1rem",
                fontWeight: 600,
            }}
        >
            <span style={{ fontSize: "1.05rem" }}>{ok ? "✔" : "✖"}</span>
            <span>{text}</span>
        </div>
    );
}
