import React from 'react';

const COLORS = {
  onTrack: 'linear-gradient(90deg, #2D9CDB, #47C7BF)', // Teal-blue gradient
  behind: 'linear-gradient(90deg, #F2994A, #F2C94C)',  // Gold-orange gradient
  statusGreen: '#E6F4EA',
  statusGreenText: '#1E7E34',
  statusRed: '#FCE8E8',
  statusRedText: '#D93025',
  track: '#F0F0F0',
};

const StatCard = ({ label, completed, goal, pacingPercent }) => {
  const completionPercent = (completed / goal) * 100;
  const isOnTrack = completionPercent >= pacingPercent;
  const displayPercent = Math.round(completionPercent);

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      borderRadius: '20px',
      padding: '20px',
      marginBottom: '16px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
      border: '1px solid #F0F0F0'
    }}>
      {/* Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span style={{ fontSize: '17px', fontWeight: '600', color: '#1C1C1E' }}>
          {label} Total: <span style={{ fontWeight: '800' }}>{completed} / {goal} miles</span>
        </span>
        
        {/* Status Pill */}
        <div style={{
          backgroundColor: isOnTrack ? COLORS.statusGreen : COLORS.statusRed,
          color: isOnTrack ? COLORS.statusGreenText : COLORS.statusRedText,
          padding: '6px 14px',
          borderRadius: '20px',
          fontSize: '13px',
          fontWeight: '700',
        }}>
          {displayPercent}% {isOnTrack ? '(On Track)' : '(Behind)'}
        </div>
      </div>
      
      {/* Progress Bar Container */}
      <div style={{ position: 'relative', marginBottom: '8px' }}>
        <div style={{ 
          width: '100%', 
          height: '22px', 
          backgroundColor: COLORS.track, 
          borderRadius: '11px', 
          overflow: 'hidden' 
        }}>
          {/* Progress Fill */}
          <div style={{ 
            width: `${Math.min(completionPercent, 100)}%`, 
            height: '100%', 
            background: isOnTrack ? COLORS.onTrack : COLORS.behind, 
            borderRadius: '11px',
            transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)' 
          }} />
        </div>

        {/* Modern Target Marker */}
        <div style={{
          position: 'absolute',
          left: `${pacingPercent}%`,
          top: '-4px',
          bottom: '-4px',
          width: '2px',
          backgroundColor: '#3A3A3C',
          zIndex: 2,
          opacity: 0.8
        }}>
           <div style={{
             position: 'absolute',
             bottom: '-6px',
             left: '-3px',
             width: '8px',
             height: '8px',
             borderRadius: '50%',
             backgroundColor: '#3A3A3C'
           }} />
        </div>
      </div>

      {/* Footer Info */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <span style={{ fontSize: '12px', color: '#8E8E93', fontWeight: '500' }}>
          Target for today: {Math.round(pacingPercent)}%
        </span>
      </div>
    </div>
  );
};

function App() {
  const now = new Date();
  
  // Pacing Calculations
  const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay();
  const weeklyPacing = (dayOfWeek / 7) * 100;

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const monthlyPacing = (now.getDate() / daysInMonth) * 100;

  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((now - startOfYear) / (1000 * 60 * 60 * 24)) + 1;
  const daysInYear = (now.getFullYear() % 4 === 0) ? 366 : 365;
  const yearlyPacing = (dayOfYear / daysInYear) * 100;

  return (
    <div style={{ 
      backgroundColor: '#F2F2F7', 
      minHeight: '100vh', 
      padding: '40px 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    }}>
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '800', color: '#1C1C1E', letterSpacing: '-0.5px' }}>
            Training Dashboard
          </h1>
          <div style={{ 
            display: 'inline-block',
            padding: '4px 12px', 
            backgroundColor: '#FFFFFF', 
            borderRadius: '8px', 
            fontSize: '13px', 
            color: '#8E8E93',
            fontWeight: '600',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            Pacing: {now.toLocaleDateString()}
          </div>
        </header>

        <StatCard label="Weekly" completed={15} goal={20} pacingPercent={weeklyPacing} />
        <StatCard label="Monthly" completed={50} goal={60} pacingPercent={monthlyPacing} />
        <StatCard label="Yearly" completed={120} goal={600} pacingPercent={yearlyPacing} />
      </div>
    </div>
  );
}

export default App;