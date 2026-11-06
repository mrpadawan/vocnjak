import raw from './football.generated.json';

/**
 * FK Luk (Voćnjak) data. The JSON is produced by `scripts/fetch-football.mjs` from srbijasport.net
 * (run automatically before every build) — don't edit it by hand.
 */

export interface Match {
  id: string;
  round: number;
  date: Date;
  home: string;
  away: string;
  /** Town where the match is played. */
  venue: string;
  score: { home: number; away: number } | null;
  url: string;
}

export interface Standing {
  clubId: number;
  pos: number;
  team: string;
  town: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
}

export interface TopPlayer {
  id: number;
  num: number;
  name: string;
  position: string;
}

export const club = raw.club;
export const source = raw.source;
export const fetchedAt = new Date(raw.fetchedAt);
export const standings = raw.standings as Standing[];
export const topPlayers = raw.topPlayers as TopPlayer[];

const parts = raw.competition.name.split(' - ');
/** e.g. "2026/2027" and "Opštinska liga Loznica – grupa A" */
export const season = (parts[2] ?? '').replace('-', '/');
export const competitionName = parts.slice(4).join(' – ') || raw.competition.name;
export const competitionUrl = raw.competition.url;

const all: Match[] = raw.matches.map((m) => ({ ...m, date: new Date(m.date), score: m.score })) as Match[];
export const results = all.filter((m) => m.score).sort((a, b) => b.date.getTime() - a.date.getTime());
export const fixtures = all.filter((m) => !m.score).sort((a, b) => a.date.getTime() - b.date.getTime());

export const isClub = (name: string) => name === club.name;
export const isHome = (m: Match) => isClub(m.home);

export type Outcome = 'W' | 'D' | 'L';
/** Result from FK Luk's point of view. */
export const outcomeOf = (m: Match): Outcome | null => {
  if (!m.score) return null;
  const mine = isHome(m) ? m.score.home : m.score.away;
  const theirs = isHome(m) ? m.score.away : m.score.home;
  return mine > theirs ? 'W' : mine < theirs ? 'L' : 'D';
};
