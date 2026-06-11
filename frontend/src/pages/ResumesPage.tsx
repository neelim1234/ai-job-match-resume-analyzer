import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import type { Resume } from '../types';
import { useToast } from '../context/ToastContext';
import { ConfirmModal, useConfirm } from '../components/common/ConfirmModal';

export default function ResumesPage() {
  const qc = useQueryClient();
  const toast = useToast();
  const { confirm, modalProps } = useConfirm();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [label, setLabel] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState('');

  const { data: resumes = [], isLoading } = useQuery<Resume[]>({
    queryKey: ['resumes'],
    queryFn: () => apiClient.get('/resumes').then((r) => r.data),
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile) throw new Error('No file selected');
      const form = new FormData();
      form.append('file', selectedFile);
      if (label) form.append('label', label);
      return apiClient.post('/resumes', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['resumes'] });
      setSelectedFile(null);
      setLabel('');
      setUploadError('');
      toast.success('Resume uploaded and parsed successfully!');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.detail || 'Upload failed.';
      setUploadError(msg);
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/resumes/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['resumes'] });
      toast.success('Resume deleted.');
    },
    onError: () => toast.error('Failed to delete resume.'),
  });

  const handleDelete = async (id: string, name: string) => {
    const ok = await confirm('Delete Resume', `Are you sure you want to delete "${name}"? This cannot be undone.`);
    if (ok) deleteMutation.mutate(id);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file?.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      toast.error('Only PDF files are accepted.');
    }
  };

  return (
    <div className="page">
      <ConfirmModal {...modalProps} />

      <div className="page-header">
        <h1>My Resumes</h1>
        <p className="page-subtitle">Upload and manage your PDF resumes</p>
      </div>

      {/* Upload Zone */}
      <div className="upload-section">
        <div
          className={`drop-zone ${dragOver ? 'drag-over' : ''} ${selectedFile ? 'has-file' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          id="resume-drop-zone"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setSelectedFile(f);
            }}
          />
          {selectedFile ? (
            <div className="file-selected">
              <span className="file-icon">📄</span>
              <span className="file-name">{selectedFile.name}</span>
              <span className="file-size">({(selectedFile.size / 1024).toFixed(0)} KB)</span>
            </div>
          ) : (
            <div className="drop-zone-content">
              <div className="drop-icon">📤</div>
              <p className="drop-title">Drop your PDF here</p>
              <p className="drop-subtitle">or click to browse — PDF only, max 10 MB</p>
            </div>
          )}
        </div>

        {selectedFile && (
          <div className="upload-controls">
            <input
              id="resume-label-input"
              type="text"
              placeholder='Label (e.g. "SWE Resume v2")'
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="text-input"
            />
            <button
              id="upload-resume-btn"
              onClick={() => uploadMutation.mutate()}
              disabled={uploadMutation.isPending}
              className="btn btn-primary"
            >
              {uploadMutation.isPending ? <><span className="spinner-sm" /> Parsing...</> : '⚡ Upload & Parse'}
            </button>
            <button onClick={() => { setSelectedFile(null); setUploadError(''); }} className="btn btn-ghost">
              Cancel
            </button>
          </div>
        )}
        {uploadError && <div className="error-banner">{uploadError}</div>}
      </div>

      {/* Resume List */}
      <div className="list-section">
        <h2 className="section-heading">Uploaded Resumes ({resumes.length})</h2>
        {isLoading ? (
          <div className="skeleton-list">
            {[1,2,3].map(i => <div key={i} className="skeleton-card" />)}
          </div>
        ) : resumes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📄</div>
            <p>No resumes yet. Upload your first PDF above.</p>
          </div>
        ) : (
          <div className="card-list">
            {resumes.map((r) => (
              <div key={r.id} className="list-card">
                <div className="list-card-icon">📄</div>
                <div className="list-card-body">
                  <div className="list-card-title">{r.label || r.file_name}</div>
                  <div className="list-card-meta">
                    {r.label && <span>{r.file_name} · </span>}
                    <span>{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(r.id, r.label || r.file_name)}
                  className="btn-icon btn-danger"
                  title="Delete resume"
                  aria-label={`Delete ${r.file_name}`}
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
