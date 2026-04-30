import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
<div class="landing-container">
  <!-- Dynamic Background Orbs -->
  <div class="orb orb-1"></div>
  <div class="orb orb-2"></div>
  <div class="orb orb-3"></div>

  <header class="header slide-down fade-in">
    <div class="logo">
      <span class="logo-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2L2 22h20L12 2z"/>
          <path d="M12 12l4 8H8l4-8z"/>
        </svg>
      </span>
      <span class="logo-text">SuperFitness</span>
    </div>
    <nav class="nav-links">
      <a routerLink="/auth/login" class="nav-link">Log In</a>
      <a routerLink="/auth/register" class="btn btn-primary btn-glow">Get Started</a>
    </nav>
  </header>

  <main class="hero">
    <div class="hero-content slide-up fade-in" style="animation-delay: 0.2s;">
      <div class="badge">🔥 New Features Added</div>
      <h1 class="hero-title">
        Elevate Your <span class="highlight-gradient">Fitness Journey</span> to the Next Level
      </h1>
      <p class="hero-subtitle">
        AI-driven personalized workouts, real-time nutrition tracking, and dynamic progress insights. Stop guessing, start achieving.
      </p>
      <div class="hero-actions">
        <a routerLink="/auth/register" class="btn btn-large btn-primary btn-glow">
          Start Free Trial
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </a>
        <a routerLink="/auth/login" class="btn btn-large btn-outline glass-effect">
          Sign In
        </a>
      </div>
      
      <div class="stats-bar slide-up fade-in" style="animation-delay: 0.4s;">
        <div class="stat">
          <span class="stat-value">50k+</span>
          <span class="stat-label">Active Users</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat">
          <span class="stat-value">120+</span>
          <span class="stat-label">Workout Plans</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat">
          <span class="stat-value">4.9/5</span>
          <span class="stat-label">User Rating</span>
        </div>
      </div>
    </div>

    <div class="hero-features slide-up fade-in" style="animation-delay: 0.6s;">
      <div class="feature-card glass-effect">
        <div class="feature-icon-wrapper" style="background: rgba(255, 60, 100, 0.1); color: #ff3c64;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8h1a4 4 0 010 8h-1"/>
            <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/>
            <line x1="6" y1="1" x2="6" y2="4"/>
            <line x1="10" y1="1" x2="10" y2="4"/>
            <line x1="14" y1="1" x2="14" y2="4"/>
          </svg>
        </div>
        <h3>Smart Workouts</h3>
        <p>Adaptive algorithms that evolve your routine as you get stronger.</p>
      </div>

      <div class="feature-card glass-effect">
        <div class="feature-icon-wrapper" style="background: rgba(45, 200, 120, 0.1); color: #2dc878;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
            <line x1="7" y1="7" x2="7.01" y2="7"></line>
          </svg>
        </div>
        <h3>Macro Tracking</h3>
        <p>Precision nutrition logging mapped directly to your goals.</p>
      </div>

      <div class="feature-card glass-effect">
        <div class="feature-icon-wrapper" style="background: rgba(80, 140, 255, 0.1); color: #508cff;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
        </div>
        <h3>Analytics</h3>
        <p>Deep dive into your progress with beautiful, real-time charts.</p>
      </div>
    </div>
  </main>
</div>
  `,
  styles: [`
  .landing-container {
    --bg-color: #0b0f19;
    --text-primary: #ffffff;
    --text-secondary: #94a3b8;
    --accent-color: #ff3c64;
    --accent-hover: #ff5a7f;
    --glass-bg: rgba(30, 41, 59, 0.4);
    --glass-border: rgba(255, 255, 255, 0.08);

    min-height: 100vh;
    background-color: var(--bg-color);
    color: var(--text-primary);
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    overflow-x: hidden;
    position: relative;
    padding-bottom: 4rem;
  }

  /* Dynamic Background Orbs */
  .orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    z-index: 0;
    opacity: 0.5;
    animation: float 20s infinite ease-in-out alternate;
  }
  .orb-1 {
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(255,60,100,0.4) 0%, rgba(0,0,0,0) 70%);
    top: -100px;
    left: -100px;
  }
  .orb-2 {
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(80,140,255,0.3) 0%, rgba(0,0,0,0) 70%);
    top: 30%;
    right: -200px;
    animation-delay: -5s;
  }
  .orb-3 {
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(45,200,120,0.2) 0%, rgba(0,0,0,0) 70%);
    bottom: -50px;
    left: 20%;
    animation-delay: -10s;
  }

  /* Animations */
  @keyframes float {
    0% { transform: translate(0, 0) scale(1); }
    100% { transform: translate(30px, 50px) scale(1.1); }
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeInDown {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .slide-up { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .slide-down { animation: fadeInDown 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .fade-in { opacity: 0; animation-fill-mode: forwards; }

  /* Utilities */
  .glass-effect {
    background: var(--glass-bg);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid var(--glass-border);
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
  }

  /* Header */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 4rem;
    max-width: 1440px;
    margin: 0 auto;
    position: relative;
    z-index: 10;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1.5rem;
    font-weight: 800;
    letter-spacing: -0.5px;
  }

  .logo-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--accent-color);
    width: 32px;
    height: 32px;
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 2rem;
  }

  .nav-link {
    color: var(--text-secondary);
    text-decoration: none;
    font-weight: 500;
    font-size: 0.95rem;
    transition: color 0.3s ease;
  }

  .nav-link:hover { color: var(--text-primary); }

  /* Buttons */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border-radius: 9999px; /* Pill shape */
    text-decoration: none;
    font-weight: 600;
    font-size: 0.95rem;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    cursor: pointer;
  }

  .btn-large {
    padding: 1rem 2rem;
    font-size: 1.1rem;
  }

  .btn-primary {
    background: var(--accent-color);
    color: #fff;
    border: none;
  }

  .btn-primary:hover {
    background: var(--accent-hover);
    transform: translateY(-2px);
  }

  .btn-glow {
    box-shadow: 0 4px 20px rgba(255, 60, 100, 0.4);
  }
  .btn-glow:hover {
    box-shadow: 0 6px 25px rgba(255, 60, 100, 0.6);
  }

  .btn-outline {
    color: var(--text-primary);
    border-radius: 9999px;
  }

  .btn-outline:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
  }

  /* Hero Section */
  .hero {
    position: relative;
    z-index: 10;
    max-width: 1200px;
    margin: 4rem auto 0;
    padding: 0 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .badge {
    display: inline-block;
    padding: 0.5rem 1rem;
    background: rgba(255, 60, 100, 0.1);
    color: var(--accent-color);
    border-radius: 9999px;
    font-size: 0.85rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    border: 1px solid rgba(255, 60, 100, 0.2);
  }

  .hero-title {
    font-size: clamp(3rem, 6vw, 4.5rem);
    font-weight: 800;
    line-height: 1.1;
    letter-spacing: -1px;
    margin-bottom: 1.5rem;
    max-width: 900px;
  }

  .highlight-gradient {
    background: linear-gradient(135deg, #ff3c64 0%, #ff8a50 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hero-subtitle {
    font-size: clamp(1.1rem, 2vw, 1.25rem);
    color: var(--text-secondary);
    max-width: 650px;
    margin: 0 auto 2.5rem;
    line-height: 1.6;
  }

  .hero-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-bottom: 4rem;
  }

  /* Stats Bar */
  .stats-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2.5rem;
    padding: 1.5rem 3rem;
    border-radius: 24px;
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    backdrop-filter: blur(12px);
    margin-bottom: 5rem;
  }

  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
  }

  .stat-label {
    font-size: 0.85rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-top: 0.25rem;
  }

  .stat-divider {
    width: 1px;
    height: 40px;
    background: rgba(255, 255, 255, 0.1);
  }

  /* Features */
  .hero-features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    width: 100%;
  }

  .feature-card {
    border-radius: 24px;
    padding: 2.5rem 2rem;
    text-align: left;
    transition: transform 0.3s ease, border-color 0.3s ease;
  }

  .feature-card:hover {
    transform: translateY(-5px);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .feature-icon-wrapper {
    width: 64px;
    height: 64px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.5rem;
  }

  .feature-icon-wrapper svg {
    width: 32px;
    height: 32px;
  }

  .feature-card h3 {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.75rem;
    color: var(--text-primary);
  }

  .feature-card p {
    color: var(--text-secondary);
    font-size: 1rem;
    line-height: 1.6;
    margin: 0;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .header { padding: 1.5rem 2rem; }
    .hero-actions { flex-direction: column; width: 100%; max-width: 300px; }
    .btn-large { width: 100%; }
    .stats-bar { flex-direction: column; gap: 1.5rem; }
    .stat-divider { width: 100%; height: 1px; }
  }
  `]
})
export class LandingPageComponent implements OnInit {
  ngOnInit() {}
}