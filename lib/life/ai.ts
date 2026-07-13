import Anthropic from '@anthropic-ai/sdk'
import type { Card, Ending, GameState } from './types'
import { pivotalMoments } from './engine'
import { parseClaudeJson } from '@/lib/tracker'

// AI is decoration only: it personalizes authored text and writes the epilogue.
// Every function returns null on any failure — callers always have an authored
// fallback and the game must never block on this file. Node-only.

const MODEL = 'claude-haiku-4-5-20251001'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const VOICE = `Voice rules, non-negotiable:
- Second person, present tense, warm but unsentimental. A wise senior talking, never a motivational poster.
- Specific Indian texture: LPA salaries, EMIs, festivals, trains, WhatsApp family groups, colony aunties.
- Never use an em dash anywhere. Use commas and full stops.
- Never describe anyone as "non-target" or their college as lesser.
- Money is always ₹ with LPA for salaries and lakhs for savings.`

function profileLine(state: GameState) {
  const stream = state.profile.stream === 'other' ? 'a non-BBA degree' : state.profile.stream.toUpperCase()
  const city = { metro: 'a metro city', tier2: 'a tier-2 city', tier3: 'a small town' }[state.profile.city]
  return `${stream} student from ${city}, primary drive: ${state.profile.ambition}`
}

function statsLine(state: GameState) {
  const s = state.stats
  return `salary ${s.salary > 0 ? `₹${s.salary.toFixed(1)} LPA` : 'zero (off payroll)'}, savings ₹${s.savings.toFixed(0)} lakhs, skills ${s.skills}/100, network ${s.network}/100, reputation ${s.reputation}/100, burnout ${s.burnout}/100, family ${s.family}/100`
}

// One call per chapter: rewrite each card's authored base text so it
// remembers who this player is and what they chose before.
export async function sceneNarrations(
  cards: Card[],
  state: GameState,
): Promise<Record<string, string> | null> {
  try {
    const moments = pivotalMoments(state)
    const cardBlocks = cards
      .map((c) => `- id: ${c.id}\n  title: ${c.title}\n  text: ${c.base}`)
      .join('\n')
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1400,
      system: `You personalize scenes in an Indian career life-simulation game. For each scene you receive authored base text. Rewrite it in 2-3 sentences so it feels continuous with this specific player's life so far. Preserve every concrete fact and number in the base text exactly (salaries, costs, offers). Do not add new choices or new facts, only continuity and texture. ${VOICE}
Return ONLY a JSON object mapping each scene id to its rewritten narration string. No other keys, no markdown.`,
      messages: [
        {
          role: 'user',
          content: `Player: ${profileLine(state)}. Age ${state.age}, year ${state.year}. Current position: ${statsLine(state)}.
Defining choices so far:
${moments.length ? moments.join('\n') : '(none yet, this is the beginning)'}

Scenes to personalize:
${cardBlocks}`,
        },
      ],
    })
    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const parsed = parseClaudeJson(text) as Record<string, unknown>
    const out: Record<string, string> = {}
    for (const card of cards) {
      const v = parsed[card.id]
      if (typeof v === 'string' && v.length > 40 && v.length < 900) out[card.id] = v
    }
    return out
  } catch {
    return null
  }
}

// One call at the end: the personalized epilogue and the share one-liner.
export async function writeEpilogue(
  state: GameState,
  ending: Ending,
): Promise<{ epilogue: string; oneLiner: string } | null> {
  try {
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1000,
      system: `You write the closing epilogue of an Indian career life-simulation game, addressed to the player who just lived ages 21 to 45. ${VOICE}
Return ONLY JSON: {"epilogue": "<220-280 words, exactly 4 paragraphs separated by \\n\\n>", "one_liner": "<a sharp shareable caption under 20 words, no hashtags>"}
The epilogue must: open inside a concrete scene from their final years, weave in 3-4 of their defining choices by name, be honest about what was lost as well as won, and end by turning to the real 21-year-old holding the phone, telling them which single habit from this run matters most right now. No generic advice.`,
      messages: [
        {
          role: 'user',
          content: `Player: ${profileLine(state)}.
Ending reached: "${ending.name}" (${ending.tone}). Ending essence: ${ending.blurb}
Final position at 45: ${statsLine(state)}.
Defining choices of this life:
${pivotalMoments(state).join('\n')}`,
        },
      ],
    })
    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const parsed = parseClaudeJson(text) as { epilogue?: unknown; one_liner?: unknown }
    if (typeof parsed.epilogue !== 'string' || parsed.epilogue.length < 200) return null
    const oneLiner =
      typeof parsed.one_liner === 'string' && parsed.one_liner.length > 0
        ? parsed.one_liner.slice(0, 160)
        : ending.blurb.split('. ')[0] + '.'
    return { epilogue: parsed.epilogue, oneLiner }
  } catch {
    return null
  }
}

// Authored fallback when the AI budget is spent or the call fails.
export function fallbackEpilogue(ending: Ending): { epilogue: string; oneLiner: string } {
  return {
    epilogue: `${ending.blurb}\n\nTwenty years, thirty-odd choices, one ledger. Some of it was luck, most of it was compounding: the skills you did or did not build at 22, the people you did or did not keep, the money you did or did not deploy early.\n\nThe simulation ends here. The real version starts wherever you are sitting right now, and it plays for keeps.\n\nThe difference is that the real one gives you time to prepare. Use it.`,
    oneLiner: ending.blurb.split('. ')[0] + '.',
  }
}
