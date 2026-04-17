import React from 'react';

const ProgressBar = ({ label, completed, goal, pacingPercent }) => {
  // Calculate completion percentage, capped at 100% for the UI bar width
  const completionPercent = (completed / goal) * 100;
  const displayPercent = Math.round(completionPercent);

  return (
    <div style={{ marginBottom: '25px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
        <span>{label}: {completed} / {goal} miles</span>
        <span style={{ color: completionPercent >= pacingPercent ? '#4CAF50' : '#FF5252' }}>
          {displayPercent}% {completionPercent >= pacingPercent ? '(On Track)' : '(Behind)'}
        </span>
      </div>
      
      {/* Container for the bar */}
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        height: '24px', 
        backgroundColor: '#e0e0e0', 
        borderRadius: '12px', 
        overflow: 'hidden' 
      }}>
        {/* Progress Fill */}
        <div style={{ 
          width: `${Math.min(completionPercent, 100)}%`, 
          height: '100%', 
          backgroundColor: completionPercent >= pacingPercent ? '#4CAF50' : '#FFC107', 
          transition: 'width 0.5s ease-in-out' 
        }} />

        {/* Pacing Line (The "Goal" Marker) */}
        <div style={{
          position: 'absolute',
          left: `${pacingPercent}%`,
          top: 0,
          width: '2px',
          height: '100%',
          backgroundColor: '#000',
          zIndex: 2,
          boxShadow: '0 0 4px rgba(255,255,255,0.8)'
        }} title="Pacing Goal" />
      </div>
      <div style={{ fontSize: '11px', color: '#666', marginTop: '4px', textAlign: 'right' }}>
        Target for today: {Math.round(pacingPercent)}%
      </div>
    </div>
  );
};

function App() {
  const now = new Date();
  
  // 1. Weekly Pacing (Assuming week starts on Monday)
  const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay(); // Adjust Sunday from 0 to 7
  const weeklyPacing = (dayOfWeek / 7) * 100;

  // 2. Monthly Pacing
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const monthlyPacing = (now.getDate() / daysInMonth) * 100;

  // 3. Yearly Pacing
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const diff = now - startOfYear;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay) + 1;
  const daysInYear = (now.getFullYear() % 4 === 0) ? 366 : 365;
  const yearlyPacing = (dayOfYear / daysInYear) * 100;

  const weeklyProgress = { completed: 15, goal: 20 };
  const monthlyProgress = { completed: 50, goal: 60 };
  const yearlyProgress = { completed: 120, goal: 600 };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '500px', margin: '40px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <header style={{ textAlign: 'center', marginBottom: '20px' }}>
        <img 
          src="https://dgalywyr863hv.cloudfront.net/pictures/athletes/8031060/4819529/6/large.jpg" 
          alt="Athlete" 
          style={{ borderRadius: '50%', width: '80px', height: '80px', marginBottom: '10px' }}
        />
        <h1 style={{ margin: 0, fontSize: '24px' }}>Training Dashboard</h1>
        <p style={{ color: '#666' }}>Pacing vs. Goal for {now.toLocaleDateString()}</p>
      </header>

      <ProgressBar label="Weekly" {...weeklyProgress} pacingPercent={weeklyPacing} />
      <ProgressBar label="Monthly" {...monthlyProgress} pacingPercent={monthlyPacing} />
      <ProgressBar label="Yearly" {...yearlyProgress} pacingPercent={yearlyPacing} />
      
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '8px', fontSize: '12px' }}>
        <strong>Note:</strong> The <span style={{ borderLeft: '2px solid black', paddingLeft: '5px' }}>black line</span> indicates where you should be today to finish your goal on time.
      </div>
    </div>
  );
}

export default App;