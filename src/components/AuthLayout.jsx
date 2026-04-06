// Shared two-column auth layout with brand panel on the left
const AuthLayout = ({ children, tagline, taglineHighlight, description }) => {
  return (
    <div className="auth-layout">
      {/* ── Brand Panel ── */}
      <div className="auth-brand-panel">
        <div className="brand-grid-overlay" />
        <div className="brand-decorative" />

        <div className="brand-top">
          <div className="brand-logo">
            <div className="brand-logo-icon">✦</div>
            <span className="brand-logo-text">LUXE</span>
          </div>
        </div>

        <div className="brand-center">
          <h1 className="brand-tagline">
            {tagline} <span>{taglineHighlight}</span>
          </h1>
          <p className="brand-description">{description}</p>
          <div className="brand-stats">
            <div className="stat-item">
              <span className="stat-number">50K+</span>
              <span className="stat-label">Clients</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">12K+</span>
              <span className="stat-label">Products</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">98%</span>
              <span className="stat-label">Satisfaction</span>
            </div>
          </div>
        </div>

        <div className="brand-bottom">
          <div className="brand-testimonial">
            <p className="testimonial-text">
              "LUXE redefines what premium shopping feels like. Every detail, every fabric, every experience is curated to perfection."
            </p>
            <div className="testimonial-author">
              <div className="testimonial-avatar">SL</div>
              <div>
                <span className="testimonial-name">Rezim</span>
                <span className="testimonial-role">Style Editor, Vogue</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Form Panel ── */}
      <div className="auth-form-panel">
        {children}
      </div>
    </div>
  )
}

export default AuthLayout
