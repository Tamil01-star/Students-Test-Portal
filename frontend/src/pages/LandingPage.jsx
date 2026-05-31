import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const features = [
  { icon: '🔒', title: 'Secure Authentication', desc: 'JWT-based auth with role-based access control for Management, Staff, and Students.' },
  { icon: '🖥️', title: 'Anti-Cheat System', desc: 'Fullscreen enforcement, tab switch detection, and 3-warning auto-submit system.' },
  { icon: '📝', title: 'Exam Management', desc: 'Create, schedule, and manage MCQ exams with custom timers and question banks.' },
  { icon: '📊', title: 'Real-time Results', desc: 'Instant automated score calculation with detailed performance analytics.' },
  { icon: '👥', title: 'Role Management', desc: 'Hierarchical system: Management creates staff, staff creates students.' },
  { icon: '📱', title: 'Fully Responsive', desc: 'Works perfectly on desktop, tablet, and mobile devices.' },
]

const securityPoints = [
  'Fullscreen enforcement — exam cannot begin without fullscreen mode',
  'Tab/window switch detection with warning system',
  'Copy, paste, right-click, and keyboard shortcut prevention',
  'Automatic submission after 3 violations',
  'Secure session tracking and violation logging',
  'bcrypt password hashing — plain text never stored',
  'Rate limiting — protection against brute force attacks',
]

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

export default function LandingPage() {
  return (
    <div style={{ fontFamily: 'Poppins, Inter, sans-serif', background: '#f8f9fa' }}>
      {/* ── Sticky Navbar ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(13,27,42,0.96)', backdropFilter: 'blur(12px)',
        padding: '0 40px', height: 68,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 28 }}>🎓</span>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>Classic Exam Portal</span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <a href="#features" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 500 }}>Features</a>
          <a href="#security" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 500, margin: '0 8px' }}>Security</a>
          <Link to="/login" style={{
            padding: '9px 22px', borderRadius: 8, background: '#c9a84c',
            color: '#0d1b2a', fontWeight: 600, fontSize: 14,
          }}>Login →</Link>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section style={{
        minHeight: '92vh', background: 'linear-gradient(135deg, #0d1b2a 0%, #1e3a5f 60%, #2d5a9e 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '80px 40px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', width: 500, height: 500, borderRadius: '50%',
          border: '1px solid rgba(201,168,76,0.1)', top: -100, right: -100, pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', width: 300, height: 300, borderRadius: '50%',
          border: '1px solid rgba(201,168,76,0.08)', bottom: 50, left: -80, pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 1100, width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
          {/* Left: Text */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)',
              borderRadius: 20, padding: '6px 16px', marginBottom: 24,
            }}>
              <span style={{ color: '#c9a84c', fontSize: 13, fontWeight: 500 }}>🏛️ Academic Examination System</span>
            </div>
            <h1 style={{ color: '#fff', fontSize: 48, fontWeight: 800, lineHeight: 1.15, marginBottom: 20 }}>
              Classic<br />
              <span style={{ color: '#c9a84c' }}>Examination</span><br />
              Portal
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 17, lineHeight: 1.7, marginBottom: 36, maxWidth: 460 }}>
              A secure, professional online examination platform designed for colleges.
              Conduct exams with confidence — anti-cheat, real-time monitoring, and instant results.
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <Link to="/login" style={{
                padding: '14px 32px', borderRadius: 10, background: '#c9a84c',
                color: '#0d1b2a', fontWeight: 700, fontSize: 16, display: 'inline-flex', alignItems: 'center', gap: 8,
              }}>Get Started →</Link>
              <a href="#features" style={{
                padding: '14px 28px', borderRadius: 10, background: 'rgba(255,255,255,0.08)',
                border: '1.5px solid rgba(255,255,255,0.2)', color: '#fff', fontWeight: 500, fontSize: 15,
              }}>Learn More</a>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 32, marginTop: 48 }}>
              {[['3', 'User Roles'], ['100%', 'Secure'], ['Real-time', 'Results']].map(([n, l]) => (
                <div key={l}>
                  <div style={{ color: '#c9a84c', fontSize: 24, fontWeight: 700 }}>{n}</div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{l}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Illustration */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0, transition: { duration: 0.8, delay: 0.2 } }}
            style={{ display: 'flex', justifyContent: 'center' }}
          >
            <div style={{
              background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.12)', borderRadius: 24,
              padding: 36, maxWidth: 360, width: '100%',
            }}>
              <svg viewBox="0 0 320 280" style={{ width: '100%' }}>
                {/* Book */}
                <rect x="60" y="80" width="120" height="160" rx="8" fill="#1e3a5f" stroke="#c9a84c" strokeWidth="2"/>
                <rect x="70" y="90" width="100" height="4" rx="2" fill="rgba(201,168,76,0.6)"/>
                <rect x="70" y="104" width="80" height="3" rx="2" fill="rgba(255,255,255,0.2)"/>
                <rect x="70" y="115" width="90" height="3" rx="2" fill="rgba(255,255,255,0.2)"/>
                <rect x="70" y="126" width="70" height="3" rx="2" fill="rgba(255,255,255,0.2)"/>
                {/* Pencil */}
                <rect x="190" y="70" width="12" height="90" rx="4" fill="#c9a84c" transform="rotate(15, 196, 115)"/>
                <polygon points="190,155 202,155 196,172" fill="#e8c96d" transform="rotate(15, 196, 115)"/>
                {/* Check marks */}
                <circle cx="240" cy="160" r="20" fill="rgba(16,185,129,0.2)" stroke="#10b981" strokeWidth="2"/>
                <path d="M232 160 L238 168 L250 152" stroke="#10b981" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                {/* Timer */}
                <circle cx="260" cy="90" r="24" fill="rgba(201,168,76,0.15)" stroke="#c9a84c" strokeWidth="2"/>
                <line x1="260" y1="90" x2="260" y2="74" stroke="#c9a84c" strokeWidth="2" strokeLinecap="round"/>
                <line x1="260" y1="90" x2="272" y2="96" stroke="#c9a84c" strokeWidth="2" strokeLinecap="round"/>
                {/* Stars */}
                <text x="50" y="60" fill="#c9a84c" fontSize="16" opacity="0.6">★</text>
                <text x="270" y="140" fill="#e8c96d" fontSize="12" opacity="0.4">✦</text>
                <text x="30" y="200" fill="#2d5a9e" fontSize="20" opacity="0.3">◆</text>
                {/* Label */}
                <text x="160" y="258" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="11" fontFamily="Inter">
                  Secure • Academic • Professional
                </text>
              </svg>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" style={{ padding: '90px 40px', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            style={{ textAlign: 'center', marginBottom: 60 }}
          >
            <span style={{ color: '#c9a84c', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Platform Features
            </span>
            <h2 style={{ fontSize: 36, fontWeight: 700, color: '#1e3a5f', marginTop: 8 }}>
              Everything You Need for Online Exams
            </h2>
            <p style={{ color: '#6b7280', marginTop: 12, fontSize: 16, maxWidth: 560, margin: '12px auto 0' }}>
              A complete examination management system built for academic institutions.
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }}
                viewport={{ once: true }}
                style={{
                  background: '#f8f9fa', borderRadius: 16, padding: 28,
                  border: '1.5px solid #e5e7eb', transition: 'all 0.3s',
                }}
                whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(30,58,95,0.12)', borderColor: '#c9a84c' }}
              >
                <div style={{ fontSize: 36, marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ color: '#1e3a5f', fontSize: 17, fontWeight: 600, marginBottom: 10 }}>{f.title}</h3>
                <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.7 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Security Section ── */}
      <section id="security" style={{
        padding: '90px 40px',
        background: 'linear-gradient(135deg, #0d1b2a 0%, #1e3a5f 100%)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <span style={{ color: '#c9a84c', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Exam Security
            </span>
            <h2 style={{ fontSize: 36, fontWeight: 700, color: '#fff', margin: '12px 0 20px' }}>
              Anti-Cheat Technology Built In
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, lineHeight: 1.8, marginBottom: 32 }}>
              Our advanced proctoring system ensures exam integrity without requiring external software.
            </p>
            <Link to="/login" style={{
              padding: '12px 28px', borderRadius: 10, background: '#c9a84c',
              color: '#0d1b2a', fontWeight: 700, fontSize: 15, display: 'inline-block',
            }}>Start Securing Exams →</Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {securityPoints.map((pt, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 14, alignItems: 'flex-start',
                  background: 'rgba(255,255,255,0.06)', borderRadius: 12,
                  padding: '14px 18px', border: '1px solid rgba(255,255,255,0.08)',
                }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: 'rgba(16,185,129,0.2)', border: '1.5px solid #10b981',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#10b981', fontSize: 12, flexShrink: 0, marginTop: 1,
                  }}>✓</span>
                  <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 1.5 }}>{pt}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: '#0d1b2a', padding: '48px 40px 32px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, marginBottom: 40 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 24 }}>🎓</span>
                <span style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>Classic Exam Portal</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 1.7 }}>
                A secure and professional online examination system for colleges and universities.
              </p>
            </div>
            <div>
              <h4 style={{ color: '#c9a84c', fontWeight: 600, marginBottom: 16, fontSize: 14 }}>Quick Links</h4>
              {['Login', 'Features', 'Security'].map(l => (
                <div key={l} style={{ marginBottom: 8 }}>
                  <a href={l === 'Login' ? '/login' : `#${l.toLowerCase()}`}
                    style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, transition: 'color 0.2s' }}>
                    {l}
                  </a>
                </div>
              ))}
            </div>
            <div>
              <h4 style={{ color: '#c9a84c', fontWeight: 600, marginBottom: 16, fontSize: 14 }}>Contact</h4>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 1.8 }}>
                📧 admin@college.edu<br />
                📞 +91 000 000 0000<br />
                🏛️ College Campus, City
              </p>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24, textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
            © 2024 Classic Examination Portal. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
