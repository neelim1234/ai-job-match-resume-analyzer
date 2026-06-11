import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '../api/client';
import type { Resume, JobDescription } from '../types';

export default function AnalyzePage() {
  const navigate = useNavigate();
  const [resumeId, setResumeId] = useState('');
  const [jobId, setJobId] = useState('');
  const [error, setError] = useState('');

  const { data: resumes = [] } = useQuery<Resume[]>({
    queryKey: ['resumes'],
    queryFn: () => apiClient.get('/resumes').then((r) => r.data),
  });

  const { data: jobs = [] } = useQuery<JobDescription[]>({
    queryKey: ['jobs'],
    queryFn: () => apiClient.get('/jobs').then((r) => r.data),
  });

  const analyzeMutation = useMutation({
    mutationFn: () =>
      apiClient.post('/analyses', { resume_id: resumeId, job_description_id: jobId }),
    onSuccess: (res) => navigate(`/analyses/${res.data.id}`),
    onError: (err: any) =>
      setError(err?.response?.data?.detail || 'Analysis failed. Please try again.'),
  });

  const canAnalyze = resumeId && jobId && !analyzeMutation.isPending;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>⚡ AI Analysis</h1>
          <p className="page-subtitle">Select a resume and job description, then let Gemini AI do the work</p>
        </div>
      </div>

      <div className="analyze-layout">
        {/* Step 1 */}
        <div className="analyze-step">
          <div className="step-badge">1</div>
          <div className="step-content">
            <h2 className="step-title">Select Resume</h2>
            {resumes.length === 0 ? (
              <div className="empty-step">
                <p>No resumes yet.</p>
                <a href="/resumes" className="btn btn-ghost btn-sm">Upload Resume →</a>
              </div>
            ) : (
              <div className="select-cards">
                {resumes.map((r) => (
                  <button
                    key={r.id}
                    id={`resume-select-${r.id}`}
                    onClick={() => setResumeId(r.id)}
                    className={`select-card ${resumeId === r.id ? 'selected' : ''}`}
                  >
                    <span className="select-card-icon">📄</span>
                    <div className="select-card-body">
                      <div className="select-card-title">{r.label || r.file_name}</div>
                      <div className="select-card-meta">{new Date(r.created_at).toLocaleDateString()}</div>
                    </div>
                    {resumeId === r.id && <span className="check-icon">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Step 2 */}
        <div className="analyze-step">
          <div className="step-badge">2</div>
          <div className="step-content">
            <h2 className="step-title">Select Job Description</h2>
            {jobs.length === 0 ? (
              <div className="empty-step">
                <p>No job descriptions yet.</p>
                <a href="/jobs" className="btn btn-ghost btn-sm">Add Job →</a>
              </div>
            ) : (
              <div className="select-cards">
                {jobs.map((j) => (
                  <button
                    key={j.id}
                    id={`job-select-${j.id}`}
                    onClick={() => setJobId(j.id)}
                    className={`select-card ${jobId === j.id ? 'selected' : ''}`}
                  >
                    <span className="select-card-icon">💼</span>
                    <div className="select-card-body">
                      <div className="select-card-title">{j.title}</div>
                      <div className="select-card-meta">{j.company || 'No company'} · {new Date(j.created_at).toLocaleDateString()}</div>
                    </div>
                    {jobId === j.id && <span className="check-icon">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Step 3 — Analyze */}
        <div className="analyze-step">
          <div className="step-badge">3</div>
          <div className="step-content">
            <h2 className="step-title">Run Analysis</h2>
            {error && <div className="error-banner">{error}</div>}
            <button
              id="run-analysis-btn"
              onClick={() => { setError(''); analyzeMutation.mutate(); }}
              disabled={!canAnalyze}
              className="btn btn-primary btn-lg analyze-btn"
            >
              {analyzeMutation.isPending ? (
                <><span className="spinner-sm" /> Analyzing with Gemini AI...</>
              ) : (
                <>⚡ Analyze Resume</>
              )}
            </button>
            {!resumeId && <p className="hint-text">← Select a resume first</p>}
            {resumeId && !jobId && <p className="hint-text">← Select a job description</p>}
            {resumeId && jobId && !analyzeMutation.isPending && (
              <p className="hint-text ready-text">✓ Ready! This usually takes 3–6 seconds.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
