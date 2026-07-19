import type { GameState } from './types'

// The identity strip: your life, in words, derived from flags. This is what
// makes the sim feel like a life instead of five bars — the state you are
// carrying is always visible. Display-only, deterministic, ordered by how
// much each fact defines a life.

const CITY_HOME: Record<string, string> = {
  metro: 'Metro',
  tier2: 'Tier-2 city',
  tier3: 'Small town',
}

export function deriveIdentityFacts(state: GameState): string[] {
  const f = state.flags
  const facts: string[] = []

  // Where you are
  if (f['went_abroad'] && !f['returned_home']) facts.push('Gulf')
  else if (f['hometown_builder'] || f['moved_back'] || f['returned_home'] || f['remote_roots'])
    facts.push('Back home')
  else if (f['moved_metro']) facts.push('Bangalore-ish')
  else if (f['stayed_rooted']) facts.push('Home city')
  else facts.push(CITY_HOME[state.profile.city] ?? '')

  // What you are
  if (f['sold_company']) facts.push('Exited founder')
  else if (f['own_business']) facts.push('Founder')
  else if (f['govt_settled']) facts.push('Bank officer')
  else if (f['second_innings']) facts.push('Professor of practice')
  else if (f['cxo_push']) facts.push('CXO track')
  else if (f['people_leader']) facts.push('People manager')
  else if (f['deep_expert']) facts.push('Senior IC')
  else if (f['mbb_research_track']) facts.push('Knowledge team')
  else if (f['startup_leap']) facts.push('Startup crew')
  else if (f['mission_track'] || f['mission_year']) facts.push('Impact lane')

  if (f['mba_done']) facts.push('MBA')
  else if (f['second_degree']) facts.push('Evening LLB')

  // Who is home
  if (f['kid']) facts.push('One kid')
  else if (f['engaged']) facts.push('Married')
  else if (f['career_first']) facts.push('Married to the work')

  // What you carry
  if (f['bought_flat_peak']) facts.push('EMI life')
  else if (f['invested_early']) facts.push('SIP running')
  if (f['moonlighted'] && !f['career_scar']) facts.push('Second laptop')
  if (f['sold_shop']) facts.push('Sold the shop network')
  else if (f['shop_empire']) facts.push('Three-district shop')
  else if (f['side_biz']) facts.push('Shop partner')
  if (f['creator_track'] || f['one_person_channel']) facts.push('Posts weekly')
  if (f['gives_back']) facts.push('Saturday classroom')

  // The hand you were dealt
  if (f['origin_legacy_cushion']) facts.push('The safety net')
  if (f['origin_legacy_rebuild']) facts.push('The rebuild')
  if (f['origin_legacy_echo']) facts.push('The echo')
  if (f['origin_first_gen']) facts.push('First-gen')
  if (f['origin_loan']) facts.push('Loan-funded degree')
  if (f['origin_shop_family'] && !f['side_biz'] && !f['shop_empire']) facts.push('Shop at home')
  if (f['origin_topper']) facts.push('The topper')
  if (f['origin_english'] && !f['fluent_speaker']) facts.push('English came late')
  if (f['origin_hustler']) facts.push('College hustler')

  // How you are
  if (state.stats.burnout >= 70) facts.push('Running on fumes')
  else if (f['health_rebuilt'] || f['reset_taken']) facts.push('Repaired')

  return facts.filter(Boolean)
}
