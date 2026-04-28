const fs = require('fs');

// Helper: Calculate standard ISO week number reliably
function getWeekNumber(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
}

// Simple CSV parser that handles quoted fields
function parseCSV(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote inside quoted field
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

function parseActivities(filePath) {
  const activityDateIdx = 1;
  const elapsedIdx = 5;
  const distanceIdx = 6;

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.trim().split('\n');
    const parsed = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = parseCSV(line);

      // Ensure line has enough columns
      if (values.length > distanceIdx) {
        const activityDate = new Date(values[activityDateIdx]);
        const elapsedTime = parseFloat(values[elapsedIdx]) || 0;
        const distanceKm = parseFloat(values[distanceIdx]) || 0;
        const distanceMiles = distanceKm * 0.621371;

        parsed.push({
          ActivityDate: activityDate,
          ElapsedTimeSeconds: elapsedTime,
          DistanceMiles: distanceMiles
        });
      }
    }

    return parsed;
  } catch (error) {
    console.error('Error:', error.message);
    return null;
  }
}

// Make sure to point this to your actual file path
const result = parseActivities('/Users/tdembows/Documents/GitHub/runstats.io/activities.csv');

// Using Objects {} instead of Arrays [] prevents sparse/null data in the JSON
const stats = {
  WeeklyMiles: {},
  MonthlyMiles: {},
  YearlyMiles: {},
  TotalWeeklyMiles: 0,
  TotalMonthlyMiles: 0,
  TotalYearlyMiles: 0
};

const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth() + 1;
const currentWeek = getWeekNumber(today);

if (result && result.length > 0) {
  for (const activity of result) {
    const date = activity.ActivityDate;
    const distance = activity.DistanceMiles;

    const activityYear = date.getFullYear();
    const activityMonth = date.getMonth() + 1;
    const activityWeek = getWeekNumber(date);

    // 1. Grouped Historical Stats (All-time)
    // Formatted cleanly like "2026-04" and "2026-W16" to avoid crossover between years
    const yearKey = activityYear;
    const monthKey = `${activityYear}-${String(activityMonth).padStart(2, '0')}`;
    const weekKey = `${activityYear}-W${String(activityWeek).padStart(2, '0')}`;

    stats.YearlyMiles[yearKey] = (stats.YearlyMiles[yearKey] || 0) + distance;
    stats.MonthlyMiles[monthKey] = (stats.MonthlyMiles[monthKey] || 0) + distance;
    stats.WeeklyMiles[weekKey] = (stats.WeeklyMiles[weekKey] || 0) + distance;

    // 2. Current Period Totals (The primary bug fix)
    if (activityYear === currentYear) {
      stats.TotalYearlyMiles += distance;

      if (activityMonth === currentMonth) {
        stats.TotalMonthlyMiles += distance;
      }

      if (activityWeek === currentWeek) {
        stats.TotalWeeklyMiles += distance;
      }
    }
  }
}

// Output stats as JSON object
console.log(JSON.stringify(stats, null, 2));