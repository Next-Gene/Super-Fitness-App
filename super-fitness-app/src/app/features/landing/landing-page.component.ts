import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
<div class="landing-container">
  <header class="header">
    <div class="logo">
      <span class="logo-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6.5 6.5h11v11h-11z"/>
          <path d="M6.5 6.5L17.5 17.5"/>
          <path d="M6.5 17.5L17.5 6.5"/>
        </svg>
      </span>
      <span class="logo-text">SuperFitness</span>
    </div>
    <nav class="nav-links">
      <a routerLink="/auth/login" class="nav-link">Login</a>
      <a routerLink="/auth/register" class="btn btn-primary">Get Started</a>
    </nav>
  </header>

  <main class="hero">
    <div class="hero-content">
      <h1 class="hero-title">
        Your Personal <span class="highlight">Fitness Journey</span> Starts Here
      </h1>
      <p class="hero-subtitle">
        Track your workouts, monitor nutrition, and achieve your fitness goals with AI-powered insights tailored just for you.
      </p>
      <div class="hero-actions">
        <a routerLink="/auth/register" class="btn btn-large btn-primary">Start Free Trial</a>
        <a routerLink="/auth/login" class="btn btn-large btn-outline">Sign In</a>
      </div>
    </div>

    <div class="hero-features">
      <div class="feature-card">
        <div class="feature-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <path d="M3 9h18M9 21V9"/>
          </svg>
        </div>
        <h3>Workouts</h3>
        <p>Custom workout plans tailored to your goals</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8h1a4 4 0 010 8h-1"/>
            <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/>
          </svg>
        </div>
        <h3>Nutrition</h3>
        <p>Meal plans and calorie tracking</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
        </div>
        <h3>Progress</h3>
        <p>Track your fitness journey</p>
      </div>
    </div>
  </main>

  <footer class="footer">
    <p>&copy; 2024 SuperFitness App. All rights reserved.</p>
  </footer>
</div>
  `,
  styles: [`
  .landing-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    color: #fff;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 3rem;
    max-width: 1400px;
    margin: 0 auto;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.5rem;
    font-weight: 700;
  }

  .logo-icon { font-size: 2rem; }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .nav-link {
    color: #fff;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
  }

  .nav-link:hover { color: #e94560; }

  .hero {
    max-width: 1400px;
    margin: 0 auto;
    padding: 4rem 3rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .hero-content { margin-bottom: 4rem; }

  .hero-title {
    font-size: 3.5rem;
    font-weight: 800;
    line-height: 1.2;
    margin-bottom: 1.5rem;
  }

  .highlight { color: #e94560; }

  .hero-subtitle {
    font-size: 1.25rem;
    color: #a0a0a0;
    max-width: 600px;
    margin: 0 auto 2rem;
    line-height: 1.6;
  }

  .hero-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  .btn {
    padding: 0.75rem 2rem;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.2s;
  }

  .btn-large {
    padding: 1rem 2.5rem;
    font-size: 1.1rem;
  }

  .btn-primary {
    background: #e94560;
    color: #fff;
  }

  .btn-primary:hover {
    background: #ff6b6b;
    transform: translateY(-2px);
  }

  .btn-outline {
    border: 2px solid #e94560;
    color: #e94560;
  }

  .btn-outline:hover {
    background: #e94560;
    color: #fff;
  }

  .hero-features {
    display: flex;
    gap: 2rem;
    flex-wrap: wrap;
    justify-content: center;
    width: 100%;
  }

  .feature-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 2rem;
    width: 280px;
    text-align: center;
  }

  .feature-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .feature-card h3 {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
  }

  .feature-card p {
    color: #a0a0a0;
    font-size: 0.9rem;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #666;
    font-size: 0.875rem;
  }

  @media (max-width: 768px) {
    .header { padding: 1rem 1.5rem; }
    .hero { padding: 2rem 1.5rem; }
    .hero-title { font-size: 2rem; }
    .hero-actions { flex-direction: column; }
    .hero-features {
      flex-direction: column;
      align-items: center;
    }
    .feature-card { width: 100%; }
  }
  `]
})
export class LandingPageComponent {}