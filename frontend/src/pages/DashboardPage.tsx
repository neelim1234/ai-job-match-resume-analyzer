import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { Resume, JobDescriptionDetail, Analysis } from '../types';

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: resumes = [] } = useQuery<Resume[]>({
    queryKey: ['resumes'],
    queryFn: () => apiClient.get('/resumes').then((r) => r.data),
  });

  const { data: jobs = [] } = useQuery<JobDescriptionDetail[]>({
    queryKey: ['jobs'],
    queryFn: () => apiClient.get('/jobs').then((r) => r.data),
  });

  const { data: analyses = [] } = useQuery<Analysis[]>({
    queryKey: ['analyses'],
    queryFn: () => apiClient.get('/analyses').then((r) => r.data).catch(() => []),
  });

  const avgScore = analyses.length
    ? Math.round(analyses.reduce((s, a) => s + a.match_score, 0) / analyses.length)
    : null;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Welcome back, {user?.full_name.split(' ')[0]} 👋</h1>
        <p className="page-subtitle">Here's your resume analysis overview</p>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon">📄</div>
          <div className="stat-card-body">
            <div className="stat-card-num">{resumes.length}</div>
            <div className="stat-card-label">Saved Resumes</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">💼</div>
          <div className="stat-card-body">
            <div className="stat-card-num">{jobs.length}</div>
            <div className="stat-card-label">Job Descriptions</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">🔍</div>
          <div className="stat-card-body">
            <div className="stat-card-num">{analyses.length}</div>
            <div className="stat-card-label">Analyses Run</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">🎯</div>
          <div className="stat-card-body">
            <div className="stat-card-num">{avgScore !== null ? `${avgScore}%` : '—'}</div>
            <div className="stat-card-label">Avg Match Score</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2 className="section-heading">Quick Actions</h2>
        <div className="action-cards">
          <Link to="/resumes" className="action-card">
            <span className="action-icon">📤</span>
            <div>
              <div className="action-title">Upload Resume</div>
              <div className="action-desc">Add a new PDF resume</div>
            </div>
          </Link>
          <Link to="/jobs" className="action-card">
            <span className="action-icon">📋</span>
            <div>
              <div className="action-title">Add Job Description</div>
              <div className="action-desc">Paste a job posting</div>
            </div>
          </Link>
          <Link to="/analyze" className="action-card action-card-primary">
            <span className="action-icon">⚡</span>
            <div>
              <div className="action-title">Run AI Analysis</div>
              <div className="action-desc">Get your match score</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Analyses */}
      {analyses.length > 0 && (
        <div className="recent-section">
          <div className="section-header-row">
            <h2 className="section-heading">Recent Analyses</h2>
            <Link to="/history" className="view-all-link">View all →</Link>
          </div>
          <div className="analyses-list">
            {analyses.slice(0, 5).map((a) => (
              <Link to={`/analyses/${a.id}`} key={a.id} className="analysis-row">
                <div className="score-badge" style={{ '--score': a.match_score } as React.CSSProperties}>
                  {Math.round(a.match_score)}%
                </div>
                <div className="analysis-row-info">
                  <span className="analysis-row-date">
                    {new Date(a.created_at).toLocaleDateString()}
                  </span>
                </div>
                <span className="analysis-row-arrow">→</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {analyses.length === 0 && (
        <div className="empty-dashboard">
          <div className="empty-icon">🚀</div>
          <h3>Ready to get started?</h3>
          <p>Upload a resume and add a job description, then run your first AI analysis.</p>
          <Link to="/analyze" className="btn btn-primary">Run First Analysis</Link>
        </div>
      )}
    </div>
  );
}
