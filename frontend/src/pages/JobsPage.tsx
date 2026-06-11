import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import type { JobDescription } from '../types';
import { useToast } from '../context/ToastContext';
import { ConfirmModal, useConfirm } from '../components/common/ConfirmModal';

export default function JobsPage() {
  const qc = useQueryClient();
  const toast = useToast();
  const { confirm, modalProps } = useConfirm();
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [rawText, setRawText] = useState('');
  const [formError, setFormError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const { data: jobs = [], isLoading } = useQuery<JobDescription[]>({
    queryKey: ['jobs'],
    queryFn: () => apiClient.get('/jobs').then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: () => apiClient.post('/jobs', { title, company: company || null, raw_text: rawText }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['jobs'] });
      setTitle(''); setCompany(''); setRawText('');
      setShowForm(false); setFormError('');
      toast.success('Job description saved!');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.detail || 'Failed to save.';
      setFormError(msg);
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/jobs/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job description deleted.');
    },
    onError: () => toast.error('Failed to delete.'),
  });

  const handleDelete = async (id: string, name: string) => {
    const ok = await confirm('Delete Job', `Delete "${name}"? This cannot be undone.`);
    if (ok) deleteMutation.mutate(id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setFormError('Job title is required.'); return; }
    if (!rawText.trim()) { setFormError('Job description text is required.'); return; }
    if (rawText.trim().length < 50) { setFormError('Job description seems too short — paste the full posting.'); return; }
    createMutation.mutate();
  };

  return (
    <div className="page">
      <ConfirmModal {...modalProps} />

      <div className="page-header">
        <div>
          <h1>Job Descriptions</h1>
          <p className="page-subtitle">Save job postings to analyze against your resumes</p>
        </div>
        <button id="add-job-btn" onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          {showForm ? '✕ Cancel' : '+ Add Job'}
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="form-card">
          <h2>New Job Description</h2>
          {formError && <div className="error-banner">{formError}</div>}
          <form id="job-form" onSubmit={handleSubmit} className="stacked-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="job-title">Job Title *</label>
                <input id="job-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Backend Intern @ Google" required />
              </div>
              <div className="form-group">
                <label htmlFor="job-company">Company (optional)</label>
                <input id="job-company" type="text" value={company} onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Google" />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="job-text">Job Description Text * <span className="char-count">({rawText.length} chars)</span></label>
              <textarea
                id="job-text"
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste the full job description here..."
                rows={12}
                required
              />
            </div>
            <button id="save-job-btn" type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? <><span className="spinner-sm" /> Saving...</> : 'Save Job Description'}
            </button>
          </form>
        </div>
      )}

      {/* Job List */}
      <div className="list-section">
        <h2 className="section-heading">Saved Jobs ({jobs.length})</h2>
        {isLoading ? (
          <div className="skeleton-list">
            {[1,2,3].map(i => <div key={i} className="skeleton-card" />)}
          </div>
        ) : jobs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💼</div>
            <p>No job descriptions yet. Click "+ Add Job" to paste one.</p>
          </div>
        ) : (
          <div className="card-list">
            {jobs.map((j) => (
              <div key={j.id} className="list-card">
                <div className="list-card-icon">💼</div>
                <div className="list-card-body">
                  <div className="list-card-title">{j.title}</div>
                  <div className="list-card-meta">
                    {j.company && <span className="tag">{j.company}</span>}
                    <span>{new Date(j.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(j.id, j.title)}
                  className="btn-icon btn-danger"
                  title="Delete job"
                  aria-label={`Delete ${j.title}`}
                >
                  🗑
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
