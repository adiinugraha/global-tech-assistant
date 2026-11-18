/**
 * AI Assistant Service for Global Tech Assistant
 * Powered by Google Gemini (gemini-3.1-flash-lite / gemini-3.8-flash) & OpenAI fallback
 */

const logger = require('../utils/logger');

// Cooldown map: userId -> lastQueryTimestamp
const userCooldowns = new Map();
const COOLDOWN_MS = 5 * 1000; // 5 seconds per user

// Priority list of active Google Gemini models
const GEMINI_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-3.8-flash',
  'gemini-3.5-flash'
];

async function askAI(prompt, userId) {
  // Check cooldown
  const now = Date.now();
  const lastCall = userCooldowns.get(userId) || 0;
  if (now - lastCall < COOLDOWN_MS) {
    const remaining = Math.ceil((COOLDOWN_MS - (now - lastCall)) / 1000);
    return {
      success: false,
      message: `⏳ Silakan tunggu ${remaining} detik sebelum bertanya ke AI lagi.`
    };
  }

  userCooldowns.set(userId, now);

  const geminiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.key || '').trim();
  const openaiKey = (process.env.OPENAI_API_KEY || '').trim();

  if (!geminiKey && !openaiKey) {
    return {
      success: false,
      message: '⚠️ Modul AI belum dikonfigurasi. Harap atur `GEMINI_API_KEY` pada file `.env`.'
    };
  }

  // 1. Try Gemini API
  if (geminiKey && geminiKey.length > 5) {
    for (const model of GEMINI_MODELS) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Anda adalah Global Tech Assistant (GTA), asisten komunitas teknologi dan jaringan Network Intelligence. Jawab pertanyaan berikut dengan ringkas, akurat, dan sopan dalam bahasa Indonesia:\n\n${prompt}`
              }]
            }],
            generationConfig: {
              maxOutputTokens: 1000,
              temperature: 0.7
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply && reply.trim().length > 0) {
            return {
              success: true,
              reply: reply.trim(),
              provider: `Google Gemini (${model})`
            };
          }
        } else {
          const errData = await response.json().catch(() => ({}));
          logger.warn(`Gemini model ${model} returned HTTP ${response.status}: ${errData.error?.message || 'Error'}`);
          // If 503 (high demand) or 404, loop will try next model in GEMINI_MODELS
        }
      } catch (err) {
        logger.warn(`Failed calling Gemini model ${model}:`, err.message);
      }
    }
  }

  // 2. Try OpenAI API if configured and Gemini failed
  if (openaiKey && openaiKey.length > 5) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Anda adalah Global Tech Assistant (GTA), asisten komunitas teknologi Network Intelligence. Jawab pertanyaan dengan ringkas dan akurat dalam bahasa Indonesia.'
            },
            { role: 'user', content: prompt }
          ],
          max_tokens: 1000
        })
      });

      if (response.ok) {
        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content;
        if (reply && reply.trim().length > 0) {
          return { success: true, reply: reply.trim(), provider: 'OpenAI GPT-4o-mini' };
        }
      }
    } catch (err) {
      logger.error('OpenAI connection error:', err.message);
    }
  }

  return {
    success: false,
    message: '❌ Layanan AI sedang mengalami gangguan sementara atau kapasitas penuh. Silakan coba kembali dalam beberapa saat.'
  };
}

module.exports = { askAI };
