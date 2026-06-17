/**
 * groqService.js
 * ---------------------------------------------------------------------------
 * Thin wrapper around Groq's chat completions API (OpenAI-compatible,
 * served over Groq's LPU inference — very low latency). Takes the
 * deterministic output of utils/recommendationEngine.js — plus a compact
 * summary of the user's recent footprint — and asks the model to turn it
 * into a short, encouraging, personalized message with concrete next steps.
 *
 * Design choice: the rule-based engine is the source of truth for *what*
 * matters; the LLM's job is purely to phrase it well for this specific
 * person. If the API key is missing, the quota is exhausted, or the
 * request fails for any reason, we fall back to a deterministic message
 * built from the rule engine's own output — the feature degrades
 * gracefully instead of breaking the app.
 * ---------------------------------------------------------------------------
 */

const Groq = require('groq-sdk');

// Fast, capable, and inexpensive on Groq — good fit for short coaching
// messages where latency matters more than maximum reasoning depth.
const MODEL = 'llama-3.3-70b-versatile';

let client = null;
function getClient() {
  if (!process.env.GROQ_API_KEY) return null;
  if (!client) {
    client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return client;
}

function buildPrompt({ name, totalKg, periodLabel, breakdown, recommendations, budgetComparison }) {
  const breakdownText = breakdown
    .filter((b) => b.co2eKg > 0)
    .map((b) => `- ${b.label}: ${b.co2eKg} kg CO2e (${b.percent}%)`)
    .join('\n');

  const tipsText = recommendations.map((r) => `- ${r.title}: ${r.tip}`).join('\n');

  return `You are a friendly, encouraging sustainability coach inside a carbon footprint tracking app.
Write a short, personalized message (max 120 words) for ${name || 'the user'} based on this data.
Be specific, warm, and practical. Do not lecture or use guilt. End with one clear, doable next action.

Period: ${periodLabel}
Total footprint: ${totalKg} kg CO2e
Budget status: ${budgetComparison?.status || 'unknown'}

Category breakdown:
${breakdownText || 'No activity logged yet.'}

System-identified focus areas:
${tipsText || 'None yet — not enough data.'}

Respond with plain text only, no markdown formatting, no headings.`;
}

function buildFallbackMessage({ name, totalKg, recommendations }) {
  const top = recommendations[0];
  if (totalKg === 0) {
    return `Hi ${name || 'there'}! You haven't logged any activity yet — add your first entry to start seeing personalized insights here.`;
  }
  if (!top) {
    return `Hi ${name || 'there'}, your footprint looks balanced across categories right now. Keep logging consistently to spot trends early.`;
  }
  return `Hi ${name || 'there'}, your biggest focus area right now is "${top.title}". ${top.tip}`;
}

/**
 * @param {Object} context - same shape consumed by buildPrompt
 * @returns {Promise<{ message: string, source: 'ai' | 'fallback' }>}
 */
async function generateAIInsight(context) {
  const groq = getClient();

  if (!groq) {
    return { message: buildFallbackMessage(context), source: 'fallback' };
  }

  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: buildPrompt(context) }],
      temperature: 0.7,
      max_tokens: 200,
    });

    const text = completion?.choices?.[0]?.message?.content?.trim();

    if (!text) {
      return { message: buildFallbackMessage(context), source: 'fallback' };
    }
    return { message: text, source: 'ai' };
  } catch (err) {
    console.error('Groq request failed, using fallback:', err.message);
    return { message: buildFallbackMessage(context), source: 'fallback' };
  }
}

module.exports = { generateAIInsight, buildPrompt, buildFallbackMessage };
