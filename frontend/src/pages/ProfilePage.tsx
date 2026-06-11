import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import apiClient from '../api/client';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const toast = useToast();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [savingName, setSavingName] = useState(false);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPwd, setSavingPwd] = useState(false);

  const handleNameSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) { toast.error('Name cannot be empty.'); return; }
    setSavingName(true);
    try {
      await apiClient.patch('/auth/me', { full_name: fullName });
      toast.success('Name updated! Re-login to see changes in navbar.');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to update name.');
    } finally {
      setSavingName(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) { toast.error('New password must be at least 6 characters.'); return; }
    setSavingPwd(true);
    try {
      await apiClient.patch('/auth/me', { old_password: oldPassword, new_password: newPassword });
      toast.success('Password updated successfully!');
      setOldPassword(''); setNewPassword('');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to update password.');
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Profile & Settings</h1>
          <p className="page-subtitle">Manage your account details</p>
        </div>
      </div>

      {/* Avatar card */}
      <div className="profile-hero">
        <div className="profile-avatar">{user?.full_name.charAt(0).toUpperCase()}</div>
        <div>
          <div className="profile-name">{user?.full_name}</div>
          <div className="profile-email">{user?.email}</div>
          <div className="profile-since">Member since {new Date(user?.created_at || '').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
        </div>
      </div>

      <div className="settings-grid">
        {/* Update Name */}
        <div className="settings-card">
          <h2 className="settings-title">Update Display Name</h2>
          <form onSubmit={handleNameSave} className="stacked-form">
            <div className="form-group">
              <label htmlFor="profile-name">Full Name</label>
              <input
                id="profile-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Smith"
                required
              />
            </div>
            <button id="save-name-btn" type="submit" className="btn btn-primary" disabled={savingName}>
              {savingName ? <><span className="spinner-sm" /> Saving...</> : 'Save Name'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="settings-card">
          <h2 className="settings-title">Change Password</h2>
          <form onSubmit={handlePasswordSave} className="stacked-form">
            <div className="form-group">
              <label htmlFor="old-password">Current Password</label>
              <input
                id="old-password"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="new-password">New Password</label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 6 characters"
                required
              />
            </div>
            <button id="save-password-btn" type="submit" className="btn btn-primary" disabled={savingPwd}>
              {savingPwd ? <><span className="spinner-sm" /> Updating...</> : 'Change Password'}
            </button>
          </form>
        </div>
      </div>

      {/* Danger zone */}
      <div className="danger-zone">
        <h2 className="settings-title danger-title">Sign Out</h2>
        <p style={{ color: 'var(--text-2)', marginBottom: '16px', fontSize: '0.875rem' }}>
          You'll need to log in again after signing out.
        </p>
        <button id="signout-btn" onClick={logout} className="btn btn-ghost">
          Sign Out of Account
        </button>
      </div>
    </div>
  );
}
