import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import type { Analysis } from '../types';

function ScoreGauge({ score }: { score: number }) {
  const color = score >= 70 ? '#00e5a0' : score >= 45 ? '#f59e0b' : '#ff4d6d';
  const radius = 52;
  const circ = 2 * Math.PI * radius;
  const filled = (score / 100) * circ;

  return (
    <div className="score-gauge">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
        <circle
          cx="70" cy="70" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circ - filled}`}
          strokeDashoffset={circ / 4}
          style={{ filter: `drop-shadow(0 0 8px ${color})`, transition: 'stroke-dasharray 1s ease' }}
        />
        <text x="70" y="66" textAnchor="middle" fill={color} fontSize="26" fontWeight="800">
          {Math.round(score)}
        </text>
        <text x="70" y="84" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="11">
          out of 100
        </text>
      </svg>
      <div className="gauge-label" style={{ color }}>
        {score >= 70 ? 'Strong Match' : score >= 45 ? 'Partial Match' : 'Weak Match'}
      </div>
    </div>
  );
}

function Chip({ text, variant }: { text: string; variant: 'green' | 'red' | 'amber' | 'blue' }) {
  return <span className={`chip chip-${variant}`}>{text}</span>;
}

function Section({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="result-section">
      <h2 className="result-section-title"><span>{icon}</span> {title}</h2>
      {children}
    </div>
  );
}

export default function AnalysisDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: analysis, isLoading, error } = useQuery<Analysis>({
    queryKey: ['analysis', id],
    queryFn: () => apiClient.get(`/analyses/${id}`).then((r) => r.data),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="page">
        <div className="loading-state" style={{ flexDirection: 'column', gap: '16px', paddingTop: '80px' }}>
          <div className="spinner" />
          <p style={{ color: 'var(--text-2)' }}>Loading your analysis...</p>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="page">
        <div className="error-banner">Could not load this analysis.</div>
        <button onClick={() => navigate('/history')} className="btn btn-ghost" style={{ marginTop: '16px' }}>
          ← Back to History
        </button>
      </div>
    );
  }

  return (
    <div className="page">
      {/* Header */}
      <div className="detail-header">
        <button onClick={() => navigate('/history')} className="btn btn-ghost btn-sm back-btn">
          ← History
        </button>
        <h1>Analysis Result</h1>
        <p className="page-subtitle">
          Generated on {new Date(analysis.created_at).toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          })}
        </p>
      </div>

      {/* Score hero */}
      <div className="score-hero">
        <ScoreGauge score={analysis.match_score} />
        <div className="score-hero-text">
          <h2>Your Resume Match Score</h2>
          <p className="score-hero-sub">
            {analysis.match_score >= 70
              ? 'Great fit! Your resume aligns well with this role. Focus on the improvements below to maximize your chances.'
              : analysis.match_score >= 45
              ? 'Moderate fit. Some key skills are missing — use the suggestions below to close the gap.'
              : 'Low match. Consider tailoring your resume significantly for this role using the suggestions below.'}
          </p>
        </div>
      </div>

      {/* Results grid */}
      <div className="results-grid">
        {/* Strengths */}
        <Section icon="✅" title="Strengths">
          <ul className="result-list">
            {analysis.strengths.map((s, i) => (
              <li key={i} className="result-list-item result-list-green">
                <span className="result-bullet">▸</span> {s}
              </li>
            ))}
          </ul>
        </Section>

        {/* Weaknesses */}
        <Section icon="⚠️" title="Weaknesses">
          <ul className="result-list">
            {analysis.weaknesses.map((w, i) => (
              <li key={i} className="result-list-item result-list-red">
                <span className="result-bullet">▸</span> {w}
              </li>
            ))}
          </ul>
        </Section>

        {/* Missing Skills */}
        <Section icon="🎯" title="Missing Skills">
          <div className="chip-cloud">
            {analysis.missing_skills.map((s, i) => (
              <Chip key={i} text={s} variant="red" />
            ))}
          </div>
        </Section>

        {/* ATS Keywords */}
        <Section icon="🔍" title="ATS Keywords to Add">
          <div className="chip-cloud">
            {analysis.ats_keywords.map((k, i) => (
              <Chip key={i} text={k} variant="blue" />
            ))}
          </div>
        </Section>

        {/* Improvement Suggestions — full width */}
        <div className="result-section result-section-full">
          <h2 className="result-section-title"><span>💡</span> Improvement Suggestions</h2>
          <ol className="suggestions-list">
            {analysis.improvement_suggestions.map((s, i) => (
              <li key={i} className="suggestion-item">
                <span className="suggestion-num">{i + 1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Actions */}
      <div className="detail-actions">
        <button onClick={() => navigate('/analyze')} className="btn btn-primary">
          ⚡ Run Another Analysis
        </button>
        <button onClick={() => navigate('/history')} className="btn btn-ghost">
          View All History →
        </button>
      </div>
    </div>
  );
}
