"use client";

import { useEffect, useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
    ReferenceLine
} from "recharts";
import {
    Activity,
    TrendingUp,
    AlertTriangle,
    Gauge,
    HeartPulse,
    BarChart3,
    Ruler,
    Sparkles
} from "lucide-react";
import { API_URL } from '@/lib/config'
export default function HealthTrends() {

    const [trends, setTrends] = useState({});
    const [selected, setSelected] = useState("");

    useEffect(() => {

        const token = localStorage.getItem("token");

        fetch(`${API_URL}/health-trends`, {
            headers: {
                Authorization: "Bearer " + token
            }
        })
            .then(res => res.json())
            .then(data => {

                setTrends(data);

                const keys = Object.keys(data);

                if (keys.length > 0)
                    setSelected(keys[0]);

            });

    }, []);

    const selectedTrend = trends[selected];

    const chartData = selectedTrend?.history || [];

    const current = selectedTrend?.current ?? "-";

    const highest = selectedTrend?.highest ?? "-";

    const lowest = selectedTrend?.lowest ?? "-";

    const trend = selectedTrend?.trend ?? "-";

    const risk = selectedTrend?.riskLevel ?? "-";

    const change = selectedTrend?.percentageChange ?? "-";

    const summary = selectedTrend?.aiSummary ?? "";

    const normalMin = selectedTrend?.normalMin ?? "-";

    const normalMax = selectedTrend?.normalMax ?? "-";

    return (

        <main className="health-container">
            <header className="health-header">
                <div>
                    <span className="health-kicker"><Activity size={15} /> Longitudinal intelligence</span>
                    <h1>Health Trends Dashboard</h1>
                    <span className="health-subtitle">Track biomarker movement, normal ranges, and AI-assisted clinical context.</span>
                </div>

                <label className="health-select-wrap">
                    <span>Health parameter</span>
                    <select
                        value={selected}
                        onChange={(e) => setSelected(e.target.value)}
                    >

                {
                    Object.keys(trends).map(param => (
                        <option
                            key={param}
                            value={param}
                        >
                            {param}
                        </option>
                    ))
                }

                    </select>
                </label>
            </header>

            <div className="chart-card">
                <div className="chart-title-row">
                    <div>
                        <span className="health-kicker"><Sparkles size={14} /> Trend analysis</span>
                        <h2>{selected || "Health parameter"} over time</h2>
                    </div>
                    <span className="chart-badge"><span className="health-live-dot" /> Live history</span>
                </div>

                <ResponsiveContainer
                    width="100%"
                    height={350}
                >

                    <LineChart data={chartData}>

                        <CartesianGrid strokeDasharray="3 3" />

                        <XAxis
                            dataKey="date"
                        />

                        <YAxis />

                        <Tooltip />
                        <Line
                            animationDuration={1200}
                            animationEasing="ease-in-out"
                            type="monotone"
                            dataKey="value"
                            stroke="#18d9ff"
                            strokeWidth={3}
                            dot={{ r: 4, fill: "#18d9ff", stroke: "#07111d", strokeWidth: 2 }}
                            activeDot={{ r: 6, fill: "#75f3b9", stroke: "#07111d", strokeWidth: 2 }}
                        />
                        <ReferenceLine
                            y={normalMax}
                            stroke="red"
                            strokeDasharray="5 5"
                        />

                        <ReferenceLine
                            y={normalMin}
                            stroke="green"
                            strokeDasharray="5 5"
                        />

                    </LineChart>

                </ResponsiveContainer>

            </div>

            <div className="stats">

                <div className="card current">

                    <h3> <Activity size={28} color="#2563eb" /> Current</h3>

                    <h2>{current}</h2>

                </div>

                <div className="card highest">

                    <h3>     <TrendingUp size={28} color="#2563eb" />  Highest</h3>

                    <h2>{highest}</h2>

                </div>

                <div className="card lowest">

                    <h3>  <BarChart3 size={28} color="#2563eb" />  Lowest</h3>

                    <h2>{lowest}</h2>

                </div>

                <div className="card trend">

                    <h3><BarChart3 size={28} color="#2563eb" />  Trend</h3>

                    <h2>{trend}</h2>

                </div>
                <div className="card">

                    <h3>    <AlertTriangle size={28} color="#2563eb" />  Risk Level</h3>

                    <h2
                        style={{
                            color:
                                risk === "High"
                                    ? "#ef4444"
                                    : risk === "Moderate"
                                        ? "#f59e0b"
                                        : "#10b981"
                        }}
                    >
                        {risk}
                    </h2>

                </div>

                <div className="card">

                    <h3><Gauge size={28} color="#2563eb" /> Change %</h3>

                    <h2>{change}%</h2>

                </div>
            </div>
            <div className="card">
                <h3><Ruler size={28} color="#2563eb" /> Normal Range</h3>
                <h2>{normalMin} - {normalMax}</h2>
            </div>
            <div className="summary">

                <h2>🩺 AI Clinical Summary</h2>

                <p><strong>Parameter:</strong> {selected}</p>

                <p><strong>  Current Value:</strong> {current}</p>

                <p><strong>Risk Level:</strong> {risk}</p>

                <p><strong>Trend:</strong> {trend}</p>

                <p>{summary}</p>

            </div>


        </main>

    );

}
