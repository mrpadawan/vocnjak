#!/usr/bin/env node
/**
 * Pulls FK Luk (Voćnjak) data from srbijasport.net and writes src/data/football.generated.json:
 * results, upcoming fixtures, league table and the club's listed top players.
 *
 * Usage:  node scripts/fetch-football.mjs        (also runs automatically before `npm run build`)
 *
 * The site is static, so data is refreshed at build time. If srbijasport.net cannot be reached the
 * previous JSON file is kept and the build continues.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = 'https://srbijasport.net';
const CLUB_ID = 1148;
const CLUB_URL = `${BASE}/club/${CLUB_ID}-luk-vocnjak`;
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../src/data/football.generated.json');
const UA = 'Mozilla/5.0 (compatible; vocnjak-site-build/1.0; +community website for Vocnjak)';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: { 'user-agent': UA, 'accept-language': 'sr' }, redirect: 'follow' });
      if (res.ok) return await res.text();
      throw new Error(`HTTP ${res.status}`);
    } catch (e) {
      if (i === tries - 1) throw new Error(`${url}: ${e.message}`);
      await sleep(800 * (i + 1));
    }
  }
}

const decode = (s) =>
  s
    .replace(/&scaron;/g, 'š')
    .replace(/&Scaron;/g, 'Š')
    .replace(/&ccaron;/g, 'č')
    .replace(/&Ccaron;/g, 'Č')
    .replace(/&cacute;/g, 'ć')
    .replace(/&Cacute;/g, 'Ć')
    .replace(/&zcaron;/g, 'ž')
    .replace(/&Zcaron;/g, 'Ž')
    .replace(/&dstrok;/g, 'đ')
    .replace(/&Dstrok;/g, 'Đ')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#0?39;/g, "'")
    .replace(/&ldquo;|&rdquo;|&bdquo;/g, '"')
    .replace(/&nbsp;/g, ' ');
const text = (html) => decode(html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

/** Current league = the first league link on the club page (newest season first). */
function currentLeague(clubHtml) {
  const m = clubHtml.match(/href="(\/league\/(\d+)-([^"]+))"/);
  if (!m) throw new Error('No league link on club page');
  return { path: m[1], id: m[2] };
}

function parseStandings(html) {
  const tbody = html.match(/<tbody class="data">([\s\S]*?)<\/tbody>/);
  if (!tbody) return [];
  return [...tbody[1].matchAll(/<tr[^>]*data-club-id="(\d+)"[^>]*>([\s\S]*?)<\/tr>/g)].map((m) => {
    const row = m[2];
    const num = (cls) => Number((row.match(new RegExp(`col-${cls}[^>]*>\\s*([+-]?\\d+)`)) ?? [])[1] ?? 0);
    return {
      clubId: Number(m[1]),
      pos: Number((row.match(/pos-deleg[^>]*>\s*(\d+)/) ?? [])[1] ?? 0),
      team: text((row.match(/team-name">([\s\S]*?)<\/div>/) ?? [])[1] ?? ''),
      town: text((row.match(/team-city">([\s\S]*?)<\/div>/) ?? [])[1] ?? ''),
      played: num('UTAKM'),
      won: num('POB'),
      drawn: num('NER'),
      lost: num('POR'),
      gf: num('DG'),
      ga: num('PG'),
      gd: num('GR'),
      pts: Number((row.match(/pts-wrapper">\s*(\d+)/) ?? [])[1] ?? 0),
    };
  });
}

/** Offset of Europe/Belgrade (CET/CEST) for a local date-time. */
function belgradeOffset(y, mo, d, h) {
  const lastSunday = (month) => {
    const last = new Date(Date.UTC(y, month + 1, 0));
    return last.getUTCDate() - last.getUTCDay();
  };
  const local = Date.UTC(y, mo - 1, d, h);
  const start = Date.UTC(y, 2, lastSunday(2), 2);
  const end = Date.UTC(y, 9, lastSunday(9), 3);
  return local >= start && local < end ? '+02:00' : '+01:00';
}

function parseGames(html, round) {
  const games = [];
  const parts = html.split(/(?=<div role="link"[^>]*game-row)/);
  for (const part of parts.slice(1)) {
    const id = (part.match(/data-id="(\d+)"/) ?? [])[1];
    const host = (part.match(/team-host[^>]*>([\s\S]*?)<\/div>/) ?? [])[1];
    const guest = (part.match(/team-guest[^>]*>([\s\S]*?)<\/div>/) ?? [])[1];
    if (!id || !host || !guest) continue;
    let date = null;
    let venue = '';
    let url = `${BASE}/game/${id}`;
    const ldm = part.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    if (ldm) {
      try {
        const ld = JSON.parse(ldm[1]);
        date = ld.startDate ?? null;
        venue = decode(ld.location?.name ?? '');
        url = ld.url ?? url;
      } catch {
        /* fall back to the visible date */
      }
    }
    if (!date) {
      const d = part.match(/hidden sm:block">(\d{2})\.(\d{2})\.(\d{4})</);
      const t = part.match(/<div class="">\s*(\d{2}):(\d{2})\s*<\/div>/);
      if (!d) continue;
      const [hh, mm] = t ? [t[1], t[2]] : ['00', '00'];
      date = `${d[3]}-${d[2]}-${d[1]}T${hh}:${mm}:00${belgradeOffset(+d[3], +d[2], +d[1], +hh)}`;
    }
    const rh = (part.match(/res-host[\s\S]*?text-base">\s*(\d+)\s*</) ?? [])[1];
    const ra = (part.match(/res-guest[\s\S]*?text-base">\s*(\d+)\s*</) ?? [])[1];
    games.push({
      id,
      round,
      date,
      home: text(host),
      away: text(guest),
      venue,
      score: rh !== undefined && ra !== undefined ? { home: Number(rh), away: Number(ra) } : null,
      url,
    });
  }
  return games;
}


function parseTopPlayers(clubHtml) {
  const out = [];
  for (const m of clubHtml.matchAll(/<a[^>]*href="\/player\/(\d+)-[^"]*"[^>]*>([\s\S]*?)<\/a>/g)) {
    const t = text(m[2]);
    const p = t.match(/^(\d+)\s+(.+?)\s+(Golman|Odbrana|Sredina|Veza|Napad)$/);
    if (p) out.push({ id: Number(m[1]), num: Number(p[1]), name: p[2], position: p[3] });
  }
  return out.filter((p, i, a) => a.findIndex((x) => x.id === p.id) === i);
}

async function main() {
  const clubHtml = await get(CLUB_URL);
  const league = currentLeague(clubHtml);
  const leagueUrl = `${BASE}${league.path}`;
  const leagueHtml = await get(leagueUrl);

  const competition = text((leagueHtml.match(/<title>([\s\S]*?)<\/title>/) ?? [])[1] ?? '');
  const standings = parseStandings(leagueHtml);
  const me = standings.find((s) => s.clubId === CLUB_ID);
  if (!me) throw new Error('FK Luk not found in the league table');
  const rounds = Math.max(1, (standings.length - 1) * 2);

  const all = [];
  for (let r = 1; r <= rounds; r++) {
    all.push(...parseGames(await get(`${leagueUrl}/kolo/${r}`), r));
    await sleep(250);
  }
  const mine = all.filter((g) => g.home === me.team || g.away === me.team).sort((a, b) => a.date.localeCompare(b.date));

  const data = {
    fetchedAt: new Date().toISOString(),
    source: { name: 'srbijasport.net', url: CLUB_URL },
    club: { id: CLUB_ID, name: me.team, town: me.town, founded: 1990 },
    competition: { name: competition.replace(/^srbijasport\.net\s*-\s*/i, '').replace(/\s*-\s*Rezultati.*$/i, ''), url: leagueUrl },
    standings,
    matches: mine,
    topPlayers: parseTopPlayers(clubHtml),
  };

  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(data, null, 2) + '\n');
  const played = mine.filter((g) => g.score).length;
  console.log(`[football] ${me.team}: ${played} played, ${mine.length - played} upcoming, table of ${standings.length}, ${data.topPlayers.length} players → ${OUT}`);
}

main().catch(async (e) => {
  let kept = false;
  try {
    await readFile(OUT);
    kept = true;
  } catch {
    /* no previous file */
  }
  console.warn(`[football] fetch failed (${e.message}). ${kept ? 'Keeping the previous data.' : 'No previous data available!'}`);
  process.exit(kept ? 0 : 1);
});
