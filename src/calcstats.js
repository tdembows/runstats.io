const fs = require('fs');

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

      if (values.length > 0) {
        const activityDate = new Date(values[activityDateIdx]);
        const elapsedTime = parseFloat(values[elapsedIdx]);
        const distanceKm = parseFloat(values[distanceIdx]);
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

const result = parseActivities('/Users/tdembows/Documents/GitHub/runstats.io/activities.csv');

if (result && result.length > 0) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log('No data found');
}
