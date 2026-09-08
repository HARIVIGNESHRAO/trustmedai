"use client";

export default function RecommendationCard({ icon: Icon, title, text }) {
    return (
        <article className="recommendation-card">
            <div className="recommendation-icon">
                <Icon size={18} />
            </div>
            <div>
                <h4>{title}</h4>
                <p>{text}</p>
            </div>
        </article>
    );
}