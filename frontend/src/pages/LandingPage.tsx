import { useNavigate } from 'react-router-dom';

const features = [
  { icon: '📄', title: 'Upload Your Resume', desc: 'Upload your PDF resume and we\'ll instantly extract and analyze all key information.' },
  { icon: '🎯', title: 'Match Score', desc: 'Get an AI-powered compatibility score showing how well your resume fits the job.' },
  { icon: '🔍', title: 'ATS Keywords', desc: 'Discover the exact keywords recruiters and ATS systems are scanning for.' },
  { icon: '💡', title: 'Smart Suggestions', desc: 'Receive personalized improvement tips to maximize your chances of getting hired.' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      {/* Hero */}
      <section className="hero">
        <div className="hero-badge">✨ Powered by Gemini AI</div>
        <h1 className="hero-title">
          Land Your Dream Job with <span className="gradient-text">AI-Powered</span> Resume Analysis
        </h1>
        <p className="hero-subtitle">
          Upload your resume, paste a job description, and get a detailed analysis in seconds.
          Know your match score, missing skills, and exactly what to fix.
        </p>
        <div className="hero-cta">
          <button id="get-started-btn" onClick={() => navigate('/register')} className="btn btn-primary btn-lg">
            Get Started Free →
          </button>
          <button onClick={() => navigate('/login')} className="btn btn-ghost btn-lg">
            Sign In
          </button>
        </div>
        <div className="hero-stats">
          <div className="stat"><span className="stat-num">98%</span><span className="stat-label">Accuracy</span></div>
          <div className="stat-divider" />
          <div className="stat"><span className="stat-num">&lt;5s</span><span className="stat-label">Analysis Time</span></div>
          <div className="stat-divider" />
          <div className="stat"><span className="stat-num">6</span><span className="stat-label">AI Insights</span></div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <h2 className="section-title">Everything You Need to Succeed</h2>
        <div className="features-grid">
          {features.map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2>Ready to Optimize Your Resume?</h2>
        <p>Join thousands of job seekers using AI to land their dream roles.</p>
        <button id="cta-register-btn" onClick={() => navigate('/register')} className="btn btn-primary btn-lg">
          Start Analyzing — It's Free
        </button>
      </section>
    </div>
  );
}
