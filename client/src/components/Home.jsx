import './Home.css';
import { useEffect } from 'react';

function Home() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate');
          }
        });
      },
      { threshold: 0.1 }
    );

    // Small delay to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      const elements = document.querySelectorAll('.feature-card, .tech-item, .developer-intro, .skill-category, .developer-links');
      elements.forEach((el) => observer.observe(el));
    }, 100);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Welcome to <span className="brand">CustomAI</span>
          </h1>
          <p className="hero-subtitle">
            Advanced AI Platform with Voice Recognition & Speech Capabilities
          </p>
          <div className="hero-buttons">
            <button
              className="btn-primary"
              onClick={() => window.location.href = '/chat'}
            >Get Started</button>
            <button
              className="btn-secondary"
              onClick={() => window.location.href = '/signup'}
            >Sign Up</button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="ai-orb"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Useful Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H11V21H5V3H13V9H21ZM18 11C16.34 11 15 12.34 15 14C15 15.66 16.34 17 18 17C19.66 17 21 15.66 21 14C21 12.34 19.66 11 18 11ZM18 19C15.79 19 14 20.79 14 23H22C22 20.79 20.21 19 18 19Z" fill="currentColor"/>
                </svg>
              </div>
              <h3>Large Language Model</h3>
              <p>Advanced LLM integration for intelligent conversations and content generation</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C13.11 2 14 2.9 14 4V10C14 11.11 13.11 12 12 12C10.89 12 10 11.11 10 10V4C10 2.9 10.89 2 12 2ZM19 10V12C19 15.87 15.87 19 12 19C8.13 19 5 15.87 5 12V10H7V12C7 14.76 9.24 17 12 17C14.76 17 17 14.76 17 12V10H19ZM12 21V23H8V21H12ZM16 21V23H12V21H16Z" fill="currentColor"/>
                </svg>
              </div>
              <h3>Voice Recognition</h3>
              <p>State-of-the-art speech-to-text technology for seamless voice interactions</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 9V15H7L12 20V4L7 9H3ZM16.5 12C16.5 10.23 15.48 8.71 14 7.97V16.02C15.48 15.29 16.5 13.77 16.5 12ZM14 3.23V5.29C16.89 6.15 19 8.83 19 12C19 15.17 16.89 17.85 14 18.71V20.77C18.01 19.86 21 16.28 21 12C21 7.72 18.01 4.14 14 3.23Z" fill="currentColor"/>
                </svg>
              </div>
              <h3>Speech Synthesis</h3>
              <p>Natural text-to-speech capabilities with multiple voice options</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM12 7C13.1 7 14 7.9 14 9C14 10.1 13.1 11 12 11C10.9 11 10 10.1 10 9C10 7.9 10.9 7 12 7ZM18 15C18 16.1 17.1 17 16 17H8C6.9 17 6 16.1 6 15V14C6 12.9 6.9 12 8 12H16C17.1 12 18 12.9 18 14V15Z" fill="currentColor"/>
                </svg>
              </div>
              <h3>JWT Authentication</h3>
              <p>Secure authentication system ensuring your data privacy and protection</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="tech-stack">
        <div className="container">
          <h2 className="section-title">Built with Modern Technology</h2>
          <div className="tech-grid">
            <div className="tech-item">
              <span className="tech-name">JavaScript</span>
              <span className="tech-desc">Core Language</span>
            </div>
            <div className="tech-item">
              <span className="tech-name">Express.js</span>
              <span className="tech-desc">Backend Server</span>
            </div>
            <div className="tech-item">
              <span className="tech-name">React</span>
              <span className="tech-desc">Frontend Framework</span>
            </div>
            <div className="tech-item">
              <span className="tech-name">JWT</span>
              <span className="tech-desc">Authentication</span>
            </div>
          </div>
        </div>
      </section>

      {/* About Developer Section */}
      <section className="about-developer">
        <div className="container">
          <h2 className="section-title">About the Developer</h2>
          <div className="developer-content">
            <div className="developer-intro">
              <h3>Nikhil Gajam</h3>
              <p className="developer-role">Full Stack Developer</p>
              <p className="developer-description">
                Computer Science Engineering graduate with expertise in Full Stack Development, AI and Machine Learning. 
                Passionate about creating innovative solutions and continuously learning new technologies.
              </p>
            </div>
            
            <div className="skills-container">
              <div className="skill-category">
                <h4>Technical Skills</h4>
                <div className="skill-tags">
                  <span className="skill-tag">Java</span>
                  <span className="skill-tag">Python</span>
                  <span className="skill-tag">JavaScript</span>
                  <span className="skill-tag">React JS</span>
                  <span className="skill-tag">Express.js</span>
                  <span className="skill-tag">Node.js</span>
                  <span className="skill-tag">HTML/CSS</span>
                  <span className="skill-tag">MongoDB</span>
                  <span className="skill-tag">SQL</span>
                  <span className="skill-tag">AWS</span>
                  <span className="skill-tag">Docker</span>
                  <span className="skill-tag">Kubernetes</span>
                  <span className="skill-tag">Machine Learning</span>
                  <span className="skill-tag">Natural Language Processing</span>
                  <span className="skill-tag">Scikit-Learn</span>
                  <span className="skill-tag">REST APIs</span>
                </div>
              </div>
            </div>
            
            <div className="developer-links">
              <button 
                className="dev-link-btn"
                onClick={() => window.open('https://github.com/nikhilgajam', '_blank')}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                GitHub
              </button>
              <button 
                className="dev-link-btn"
                onClick={() => window.open('https://youtube.com/NikhilTech', '_blank')}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                YouTube
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} CustomAI. Developed by <strong>Nikhil Gajam</strong></p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
