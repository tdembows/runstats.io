import React, { useMemo } from 'react';

// --- Constants & Configuration ---
const THEME = {
  colors: {
    onTrack: 'linear-gradient(90deg, #2D9CDB, #47C7BF)',
    behind: 'linear-gradient(90deg, #F2994A, #F2C94C)',
    statusGreen: '#E6F4EA',
    statusGreenText: '#1E7E34',
    statusRed: '#FCE8E8',
    statusRedText: '#D93025',
    track: '#F0F0F0',
    textPrimary: '#1C1C1E',
    textSecondary: '#8E8E93',
    border: '#F0F0F0',
    background: '#FFFFFF',
    marker: '#3A3A3C',
  },
  spacing: {
    sm: '8px',
    md: '16px',
    lg: '20px',
  },
  borderRadius: {
    pill: '20px',
    card: '20px',
    bar: '11px',
  }
};

// --- Mock Data ---
// Extracted out so you can easily swap this object out in your parent components or tests.
export const defaultMockStats = {
  weekly: { completed: 22.4, goal: 20 },
  monthly: { completed: 57, goal: 62 },
  yearly: { completed: 285, goal: 622 },
};

// --- Utilities ---
const getPacingMetrics = (date = new Date()) => {
  const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay();
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((date - startOfYear) / (1000 * 60 * 60 * 24)) + 1;
  const daysInYear = (date.getFullYear() % 4 === 0) ? 366 : 365;

  return {
    weekly: (dayOfWeek / 7) * 100,
    monthly: (date.getDate() / daysInMonth) * 100,
    yearly: (dayOfYear / daysInYear) * 100,
    formattedDate: date.toLocaleDateString(),
  };
};

// --- Sub-components ---
const StatusPill = ({ percent, isOnTrack }) => (
  <div style={{
    backgroundColor: isOnTrack ? THEME.colors.statusGreen : THEME.colors.statusRed,
    color: isOnTrack ? THEME.colors.statusGreenText : THEME.colors.statusRedText,
    padding: '6px 14px',
    borderRadius: THEME.borderRadius.pill,
    fontSize: '13px',
    fontWeight: '700',
  }}>
    {percent}% {isOnTrack ? 'Done' : 'Behind'}
  </div>
);

const ProgressBar = ({ completionPercent, pacingPercent, isOnTrack }) => (
  <div style={styles.progressContainer}>
    <div style={styles.progressTrack}>
      <div style={{ 
        ...styles.progressFill, 
        width: `${Math.min(completionPercent, 100)}%`,
        background: isOnTrack ? THEME.colors.onTrack : THEME.colors.behind,
      }} />
    </div>

    <div style={{ ...styles.targetMarker, left: `${pacingPercent}%` }}>
       <div style={styles.targetDot} />
    </div>
  </div>
);

const StatCard = ({ label, completed, goal, pacingPercent }) => {
  const completionPercent = (completed / goal) * 100;
  
  const targetMiles = (goal * pacingPercent) / 100;
  const milesDiff = completed - targetMiles;
  const isOnTrack = completed >= targetMiles;
  
  const displayPercent = Math.round(completionPercent);
  const diffAbs = Math.abs(milesDiff).toFixed(1);
  const diffColor = isOnTrack ? THEME.colors.statusGreenText : THEME.colors.statusRedText;

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <span style={styles.cardTitle}>
          {label} Total: <span style={{ fontWeight: '800' }}>{completed} / {goal} miles</span>
        </span>
        <StatusPill percent={displayPercent} isOnTrack={isOnTrack} />
      </div>
      
      <ProgressBar 
        completionPercent={completionPercent} 
        pacingPercent={pacingPercent} 
        isOnTrack={isOnTrack} 
      />

      <div style={styles.cardFooter}>
        <span>
          Target for today: <strong>{targetMiles.toFixed(1)} miles</strong>
          {' '}
          <span style={{ color: diffColor, fontWeight: '700' }}>
            ({diffAbs} miles {isOnTrack ? 'ahead' : 'behind'})
          </span>
        </span>
      </div>
    </div>
  );
};

// --- Main Application ---
// Refactored to accept `currentDate` and `stats` as props for easy mocking.
export default function TrainingDashboard({ 
  currentDate = new Date(), 
  stats = defaultMockStats 
}) {
  const metrics = useMemo(() => getPacingMetrics(currentDate), [currentDate]);

  return (
    <div style={styles.appShell}>
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.headline}>Training Dashboard</h1>
          <div style={styles.dateBadge}>
            Current Pacing: {metrics.formattedDate}
          </div>
        </header>

        <StatCard 
          label="Weekly" 
          completed={stats.weekly.completed} 
          goal={stats.weekly.goal} 
          pacingPercent={metrics.weekly} 
        />
        <StatCard 
          label="Monthly" 
          completed={stats.monthly.completed} 
          goal={stats.monthly.goal} 
          pacingPercent={metrics.monthly} 
        />
        <StatCard 
          label="Yearly" 
          completed={stats.yearly.completed} 
          goal={stats.yearly.goal} 
          pacingPercent={metrics.yearly} 
        />
      </div>
    </div>
  );
}

// --- Styles ---
const styles = {
  appShell: {
    backgroundColor: '#F2F2F7',
    minHeight: '100vh',
    padding: '40px 20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  container: {
    maxWidth: '480px',
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  headline: {
    margin: '0 0 8px 0',
    fontSize: '28px',
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    letterSpacing: '-0.5px',
  },
  dateBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: THEME.colors.background,
    borderRadius: '8px',
    fontSize: '13px',
    color: THEME.colors.textSecondary,
    fontWeight: '600',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  card: {
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.borderRadius.card,
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
    boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
    border: `1px solid ${THEME.colors.border}`,
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  cardTitle: {
    fontSize: '17px',
    fontWeight: '600',
    color: THEME.colors.textPrimary,
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    fontSize: '13px',
    color: THEME.colors.textSecondary,
    fontWeight: '500',
    marginTop: '12px',
  },
  progressContainer: {
    position: 'relative',
    marginBottom: '4px',
  },
  progressTrack: {
    width: '100%',
    height: '22px',
    backgroundColor: THEME.colors.track,
    borderRadius: THEME.borderRadius.bar,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: THEME.borderRadius.bar,
    transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  targetMarker: {
    position: 'absolute',
    top: '-4px',
    bottom: '-4px',
    width: '2px',
    backgroundColor: THEME.colors.marker,
    zIndex: 2,
    opacity: 0.8,
  },
  targetDot: {
    position: 'absolute',
    bottom: '-6px',
    left: '-3px',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: THEME.colors.marker,
  },
};