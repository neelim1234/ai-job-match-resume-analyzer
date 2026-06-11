import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import { useToast } from '../context/ToastContext';
import { ConfirmModal, useConfirm } from '../components/common/ConfirmModal';

interface AnalysisItem {
  id: string;
  resume_id: string;
  job_description_id: string;
  match_score: number;
  created_at: string;
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 70 ? '#00e5a0' : score >= 45 ? '#f59e0b' : '#ff4d6d';
  const label = score >= 70 ? 'Strong' : score >= 45 ? 'Partial' : 'Weak';
  return (
    <div className="score-ring-sm" style={{ '--color': color } as React.CSSProperties}>
      <div>
        <div className="score-ring-num">{Math.round(score)}</div>
        <div className="score-ring-label">{label}</div>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const qc = useQueryClient();
  const toast = useToast();
  const { confirm, modalProps } = useConfirm();

  const { data: analyses = [], isLoading } = useQuery<AnalysisItem[]>({
    queryKey: ['analyses'],
    queryFn: () => apiClient.get('/analyses').then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/analyses/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['analyses'] });
      toast.success('Analysis deleted.');
    },
    onError: () => toast.error('Failed to delete analysis.'),
  });

  const handleDelete = async (id: string) => {
    const ok = await confirm('Delete Analysis', 'Delete this analysis result? This cannot be undone.');
    if (ok) deleteMutation.mutate(id);
  };

  return (
    <div className="page">
      <ConfirmModal {...modalProps} />

      <div className="page-header">
        <div>
          <h1>Analysis History</h1>
          <p className="page-subtitle">All your past AI resume analyses</p>
        </div>
        <Link to="/analyze" className="btn btn-primary">+ New Analysis</Link>
      </div>

      {isLoading ? (
        <div className="skeleton-list">
          {[1,2,3].map(i => <div key={i} className="skeleton-card" />)}
        </div>
      ) : analyses.length === 0 ? (
        <div className="empty-state" style={{ textAlign: 'center', padding: '80px 24px' }}>
          <div className="empty-state-icon">📊</div>
          <h3 style={{ marginBottom: '8px' }}>No analyses yet</h3>
          <p style={{ color: 'var(--text-2)', marginBottom: '24px' }}>
            Upload a resume and a job description, then run your first analysis.
          </p>
          <Link to="/analyze" className="btn btn-primary">Run First Analysis →</Link>
        </div>
      ) : (
        <div className="history-list">
          {analyses.map((a) => (
            <div key={a.id} className="history-card">
              <ScoreRing score={a.match_score} />
              <div className="history-card-body">
                <div className="history-card-date">
                  {new Date(a.created_at).toLocaleDateString('en-US', {
                    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
                  })}
                </div>
                <div className="history-card-score-label">
                  Match Score: <strong>{Math.round(a.match_score)}%</strong>
                </div>
              </div>
              <div className="history-card-actions">
                <Link to={`/analyses/${a.id}`} id={`view-analysis-${a.id}`} className="btn btn-ghost btn-sm">
                  View Details →
                </Link>
                <button
                  onClick={() => handleDelete(a.id)}
                  className="btn-icon btn-danger"
                  aria-label="Delete analysis"
                  title="Delete"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
