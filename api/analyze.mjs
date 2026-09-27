// Vercel serverless function: POST /api/analyze
// Body: { image: "data:image/jpeg;base64,..." }
// Sends the photo to Claude and returns the verdict as JSON. The API key
// never leaves the server.
import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { z } from 'zod';

const MODEL = process.env.CLAUDE_MODEL || 'claude-opus-5';
const MAX_IMAGE_BYTES = 3_500_000; // stays under Vercel's 4.5 MB request limit
const MEDIA_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const Verdict = z.object({
  touching_grass: z.boolean(),
  confidence: z.enum(['low', 'medium', 'high']),
  reason: z.string(),
  roast_or_praise: z.string(),
});

const SYSTEM_PROMPT = `You are the judge for "Touch Grass", a playful app where people prove they went outside by photographing themselves touching grass.

Decide whether the photo shows a real person physically touching real, living grass outdoors. A hand, foot, or body in contact with a lawn or field counts. Grass that is dry or brown still counts if it is real grass outside.

It does NOT count if the grass is on a screen or a printed photo, is artificial turf or a rug, is a houseplant or indoor plant, or if there is grass but no one is touching it. Be fair but hard to fool.

Fields:
- reason: one or two sentences describing what you actually see and why it passes or fails.
- roast_or_praise: one short, funny line aimed at the user. Praise them if they passed, playfully roast them if they failed. Keep it good-natured; no insults about appearance.`;

const client = new Anthropic();

// Vercel: allow time for Claude to look at the photo.
export const maxDuration = 60;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'Server is missing ANTHROPIC_API_KEY' });
  }

  const match = /^data:(image\/[a-z]+);base64,(.+)$/.exec(req.body?.image || '');
  if (!match || !MEDIA_TYPES.includes(match[1])) {
    return res.status(400).json({ error: 'Expected a JPEG, PNG, WebP, or GIF image' });
  }
  const [, mediaType, data] = match;
  if (data.length * 0.75 > MAX_IMAGE_BYTES) {
    return res.status(413).json({ error: 'Image is too large' });
  }

  try {
    const response = await client.beta.messages.parse({
      model: MODEL,
      max_tokens: 16000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: 'low', format: betaZodOutputFormat(Verdict) },
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data } },
          { type: 'text', text: 'Is this person touching grass?' },
        ],
      }],
    });

    if (response.stop_reason === 'refusal' || !response.parsed_output) {
      return res.status(422).json({ error: 'Could not analyze this photo' });
    }
    return res.status(200).json(response.parsed_output);
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return res.status(429).json({ error: 'Too many requests, try again in a minute' });
    }
    if (error instanceof Anthropic.APIError) {
      console.error('Claude API error', error.status, error.message);
      return res.status(502).json({ error: 'The grass judge is unavailable right now' });
    }
    if (error instanceof Anthropic.AnthropicError) {
      // e.g. the response could not be parsed into a verdict
      console.error('Claude response error', error.message);
      return res.status(502).json({ error: 'The grass judge got confused. Please try again.' });
    }
    console.error('Analyze failed', error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
}
