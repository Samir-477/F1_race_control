/**
 * Gemini AI Integration
 * Used for generating realistic incident descriptions
 */

import dotenv from 'dotenv';
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

/**
 * Generate a realistic F1 incident description using Gemini AI
 * @param {Object} params - Incident parameters
 * @returns {Promise<string>} Generated description
 */
export async function generateIncidentDescription({ driverName, lap, incidentType, teamName }) {
  if (!GEMINI_API_KEY) {
    console.warn('Gemini API key not found, using fallback description');
    return generateFallbackDescription({ driverName, lap, incidentType, teamName });
  }

  try {
    const prompt = `Generate a brief, professional F1 race incident description (max 50 words):
    
Driver: ${driverName} (${teamName})
Lap: ${lap}
Incident Type: ${incidentType}

Requirements:
- Be specific about the turn/location
- Mention any other drivers involved (if collision)
- Use professional steward language
- Keep it factual and concise
- Do not include penalty recommendations

Example format: "Car ${driverName} made contact with Car [other driver] at Turn 4, causing both drivers to go off track. The incident occurred during an overtaking maneuver on the inside line."`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 150,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (generatedText) {
      return generatedText.trim();
    } else {
      throw new Error('No text generated from Gemini API');
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return generateFallbackDescription({ driverName, lap, incidentType, teamName });
  }
}

/**
 * Fallback description generator (if Gemini API fails)
 */
function generateFallbackDescription({ driverName, lap, incidentType, teamName }) {
  const turns = ['Turn 1', 'Turn 4', 'Turn 7', 'Turn 10', 'the chicane', 'the hairpin'];
  const randomTurn = turns[Math.floor(Math.random() * turns.length)];

  const templates = {
    'Collision': `Car #${driverName} (${teamName}) made contact with another car at ${randomTurn}, causing both drivers to lose positions. The incident occurred during an overtaking attempt.`,
    'Track Limits': `Car #${driverName} (${teamName}) exceeded track limits at ${randomTurn} multiple times, gaining an unfair advantage.`,
    'Unsafe Release': `Car #${driverName} (${teamName}) was released unsafely from the pit box, forcing another car to take evasive action.`,
    'Causing Collision': `Car #${driverName} (${teamName}) caused a collision at ${randomTurn} by moving under braking, resulting in contact with another competitor.`,
    'Blue Flags': `Car #${driverName} (${teamName}) ignored blue flags for multiple laps, impeding the leaders and affecting the race outcome.`,
    'Dangerous Driving': `Car #${driverName} (${teamName}) exhibited dangerous driving behavior at ${randomTurn}, forcing other drivers off the racing line.`,
  };

  return templates[incidentType] || `Car #${driverName} (${teamName}) was involved in an incident at ${randomTurn} on lap ${lap}.`;
}

/**
 * Generate multiple incident suggestions for a race
 * @param {Array} drivers - Array of driver objects
 * @param {number} totalLaps - Total laps in the race
 * @returns {Promise<Array>} Array of suggested incidents
 */
export async function generateRaceIncidentSuggestions(drivers, totalLaps) {
  const incidentTypes = ['Collision', 'Track Limits', 'Unsafe Release', 'Causing Collision', 'Blue Flags'];
  const numIncidents = Math.floor(Math.random() * 3) + 2; // 2-4 incidents
  const suggestions = [];

  for (let i = 0; i < numIncidents; i++) {
    const randomDriver = drivers[Math.floor(Math.random() * drivers.length)];
    const randomLap = Math.floor(Math.random() * totalLaps) + 1;
    const randomType = incidentTypes[Math.floor(Math.random() * incidentTypes.length)];

    const description = await generateIncidentDescription({
      driverName: randomDriver.name,
      lap: randomLap,
      incidentType: randomType,
      teamName: randomDriver.team.name,
    });

    suggestions.push({
      driverId: randomDriver.id,
      driverName: randomDriver.name,
      lap: randomLap,
      incidentType: randomType,
      description,
    });
  }

  return suggestions.sort((a, b) => a.lap - b.lap);
}
