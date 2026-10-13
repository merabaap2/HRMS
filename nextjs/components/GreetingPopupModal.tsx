'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';

interface PopupItem {
  id: string;
  kind: 'festival' | 'birthday' | 'achievement';
  empId?: string;
  title: string;
  from: string;
  to: string;
  yearly?: boolean;
}

export default function GreetingPopupModal() {
  const { user } = useAuth();
  const [activePopup, setActivePopup] = useState<PopupItem | null>(null);
  const [autoSecondsRemaining, setAutoSecondsRemaining] = useState<number>(30);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const checkPopups = async () => {
      try {
        const res = await fetch('/api/settings');
        if (!res.ok) return;
        const data = await res.json();
        const popups: PopupItem[] = Array.isArray(data.popups) ? data.popups : [];
        const autoSecs = Number(data.popupCfg?.autoSecs) || 30;

        const todayStr = new Date().toISOString().split('T')[0];
        const todayMMDD = todayStr.slice(5);

        // Find active matching popup
        const matched = popups.find(p => {
          if (!p.title || !p.from) return false;

          // Check if already acknowledged in this session
          if (typeof window !== 'undefined' && sessionStorage.getItem(`hrms_pop_seen_${p.id}`)) {
            return false;
          }

          // If employee-specific
          if (p.empId && user?.empId && p.empId !== user.empId) {
            return false;
          }

          if (p.yearly) {
            const fromMMDD = p.from.slice(5);
            const toMMDD = (p.to || p.from).slice(5);
            return todayMMDD >= fromMMDD && todayMMDD <= toMMDD;
          } else {
            const toDate = p.to || p.from;
            return todayStr >= p.from && todayStr <= toDate;
          }
        });

        if (matched) {
          setActivePopup(matched);
          setAutoSecondsRemaining(autoSecs);
          setIsVisible(true);
        }
      } catch {
        // Ignore background fetch errors
      }
    };

    checkPopups();

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [user]);

  // Handle auto-close countdown
  useEffect(() => {
    if (!isVisible || !activePopup) return;

    if (autoSecondsRemaining <= 0) {
      handleDismiss();
      return;
    }

    const interval = setInterval(() => {
      setAutoSecondsRemaining(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible, autoSecondsRemaining, activePopup]);

  const handleDismiss = () => {
    if (activePopup && typeof window !== 'undefined') {
      sessionStorage.setItem(`hrms_pop_seen_${activePopup.id}`, 'true');
    }
    setIsVisible(false);
  };

  if (!isVisible || !activePopup) return null;

  const isFestival = activePopup.kind === 'festival';
  const isBirthday = activePopup.kind === 'birthday';
  const isAchievement = activePopup.kind === 'achievement';

  const badgeIcon = isFestival ? '🪔' : isBirthday ? '🎂' : '🏆';
  const badgeTitle = isFestival ? 'Festival Greeting' : isBirthday ? 'Happy Birthday!' : 'Achievement Recognition';
  const badgeColor = isFestival ? '#f59e0b' : isBirthday ? '#ec4899' : '#8b5cf6';
  const gradientBg = isFestival
    ? 'linear-gradient(135deg, #fef3c7 0%, #fef9c3 50%, #fed7aa 100%)'
    : isBirthday
    ? 'linear-gradient(135deg, #fce7f3 0%, #fae8ff 50%, #fbcfe8 100%)'
    : 'linear-gradient(135deg, #ede9fe 0%, #f3e8ff 50%, #e0e7ff 100%)';

  return (
    <div className="modal-overlay" style={{ zIndex: 9999, backdropFilter: 'blur(4px)' }}>
      <div
        className="modal-dialog"
        style={{
          maxWidth: '460px',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          border: '1px solid #e2e8f0'
        }}
      >
        {/* Decorative Festive Header */}
        <div
          style={{
            background: gradientBg,
            padding: '2rem 1.5rem',
            textAlign: 'center',
            position: 'relative'
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '0.25rem', animation: 'bounce 1s infinite' }}>
            {badgeIcon}
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
            {badgeTitle}
          </h2>
          <span
            style={{
              display: 'inline-block',
              background: 'rgba(255, 255, 255, 0.85)',
              color: badgeColor,
              fontWeight: 700,
              fontSize: '0.75rem',
              padding: '0.2rem 0.65rem',
              borderRadius: '9999px',
              border: `1px solid ${badgeColor}40`
            }}
          >
            HRMS Official Announcement
          </span>
        </div>

        {/* Message Body */}
        <div style={{ padding: '1.5rem', textAlign: 'center' }}>
          <p
            style={{
              fontSize: '1.05rem',
              fontWeight: 600,
              color: '#1e293b',
              lineHeight: 1.5,
              margin: '0 0 1rem 0'
            }}
          >
            &ldquo;{activePopup.title}&rdquo;
          </p>

          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
            Active celebration window: {activePopup.from} {activePopup.to && activePopup.to !== activePopup.from ? `to ${activePopup.to}` : ''}
          </div>
        </div>

        {/* Action Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            background: '#f8fafc',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            Auto-closing in {autoSecondsRemaining}s
          </span>

          <button
            onClick={handleDismiss}
            style={{
              padding: '0.5rem 1.25rem',
              background: badgeColor,
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          >
            Celebrate & Close
          </button>
        </div>
      </div>
    </div>
  );
}
