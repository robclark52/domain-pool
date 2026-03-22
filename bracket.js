// 2026 NCAA Tournament Bracket Structure
// Fixed bracket - does not change once tournament starts

const REGIONS = ['East', 'West', 'South', 'Midwest'];

// Team abbreviation to full name mapping
const TEAM_NAMES = {
    'DUKE': 'Duke', 'SIEN': 'Siena', 'OSU': 'Ohio State', 'TCU': 'TCU',
    'SJU': "St John's", 'UNI': 'Northern Iowa', 'KU': 'Kansas', 'CBU': 'CA Baptist',
    'LOU': 'Louisville', 'USF': 'South Florida', 'MSU': 'Michigan St', 'NDSU': 'N Dakota St',
    'UCLA': 'UCLA', 'UCF': 'UCF', 'CONN': 'UConn', 'FUR': 'Furman',
    'FLA': 'Florida', 'PV': 'Prairie View', 'CLEM': 'Clemson', 'IOWA': 'Iowa',
    'VAN': 'Vanderbilt', 'MCN': 'McNeese', 'NEB': 'Nebraska', 'TROY': 'Troy',
    'UNC': 'North Carolina', 'VCU': 'VCU', 'ILL': 'Illinois', 'PENN': 'Penn',
    'SMC': "Saint Mary's", 'TA&M': 'Texas A&M', 'HOU': 'Houston', 'IDHO': 'Idaho',
    'ARIZ': 'Arizona', 'LIU': 'Long Island', 'VILL': 'Villanova', 'USU': 'Utah State',
    'WIS': 'Wisconsin', 'HPU': 'High Point', 'ARK': 'Arkansas', 'HAW': "Hawai'i",
    'BYU': 'BYU', 'TEX': 'Texas', 'GONZ': 'Gonzaga', 'KENN': 'Kennesaw St',
    'MIA': 'Miami', 'MIZ': 'Missouri', 'PUR': 'Purdue', 'QUNS': 'Queens',
    'MICH': 'Michigan', 'HOW': 'Howard', 'UGA': 'Georgia', 'SLU': 'Saint Louis',
    'TTU': 'Texas Tech', 'AKR': 'Akron', 'ALA': 'Alabama', 'HOF': 'Hofstra',
    'TENN': 'Tennessee', 'MIOH': 'Miami OH', 'UVA': 'Virginia', 'WRST': 'Wright St',
    'UK': 'Kentucky', 'SCU': 'Santa Clara', 'ISU': 'Iowa State', 'TNST': 'Tennessee St'
};

// R64 matchups: 32 games, 8 per region, ordered by bracket position
// Each entry: [highSeedAbbrev, highSeed, lowSeedAbbrev, lowSeed]
const R64_MATCHUPS = [
    // === EAST (games 0-7) ===
    ['DUKE', 1, 'SIEN', 16],
    ['OSU', 8, 'TCU', 9],
    ['SJU', 5, 'UNI', 12],
    ['KU', 4, 'CBU', 13],
    ['LOU', 6, 'USF', 11],
    ['MSU', 3, 'NDSU', 14],
    ['UCLA', 7, 'UCF', 10],
    ['CONN', 2, 'FUR', 15],
    // === WEST (games 8-15) ===
    ['FLA', 1, 'PV', 16],
    ['CLEM', 8, 'IOWA', 9],
    ['VAN', 5, 'MCN', 12],
    ['NEB', 4, 'TROY', 13],
    ['UNC', 6, 'VCU', 11],
    ['ILL', 3, 'PENN', 14],
    ['SMC', 7, 'TA&M', 10],
    ['HOU', 2, 'IDHO', 15],
    // === SOUTH (games 16-23) ===
    ['ARIZ', 1, 'LIU', 16],
    ['VILL', 8, 'USU', 9],
    ['WIS', 5, 'HPU', 12],
    ['ARK', 4, 'HAW', 13],
    ['BYU', 6, 'TEX', 11],
    ['GONZ', 3, 'KENN', 14],
    ['MIA', 7, 'MIZ', 10],
    ['PUR', 2, 'QUNS', 15],
    // === MIDWEST (games 24-31) ===
    ['MICH', 1, 'HOW', 16],
    ['UGA', 8, 'SLU', 9],
    ['TTU', 5, 'AKR', 12],
    ['ALA', 4, 'HOF', 13],
    ['TENN', 6, 'MIOH', 11],
    ['UVA', 3, 'WRST', 14],
    ['UK', 7, 'SCU', 10],
    ['ISU', 2, 'TNST', 15]
];

// Game index structure (deterministic bracket tree):
// R64:  games 0-31  (32 games)
// R32:  games 32-47 (16 games) - game N pairs winners of R64 games (N-32)*2 and (N-32)*2+1
// S16:  games 48-55 (8 games)  - game N pairs winners of R32 games (N-48)*2+32 and (N-48)*2+33
// E8:   games 56-59 (4 games)  - game N pairs winners of S16 games (N-56)*2+48 and (N-56)*2+49
// F4:   games 60-61 (2 games)  - game 60 pairs E8 winners 56 & 57 (East vs West)
//                                game 61 pairs E8 winners 58 & 59 (South vs Midwest)
// NCG:  game 62     (1 game)   - pairs F4 winners 60 & 61

const ROUND_NAMES = ['R64', 'R32', 'S16', 'E8', 'F4', 'NCG'];
const ROUND_RANGES = {
    R64: [0, 32],   // 32 games
    R32: [32, 48],  // 16 games
    S16: [48, 56],  // 8 games
    E8:  [56, 60],  // 4 games
    F4:  [60, 62],  // 2 games
    NCG: [62, 63]   // 1 game
};

const ESPN_SCORING = { R64: 10, R32: 20, S16: 40, E8: 80, F4: 160, NCG: 320 };
const MAX_POSSIBLE = 1920; // 32*10 + 16*20 + 8*40 + 4*80 + 2*160 + 1*320

// Returns which round a game index belongs to
function gameRound(gameIdx) {
    if (gameIdx < 32) return 'R64';
    if (gameIdx < 48) return 'R32';
    if (gameIdx < 56) return 'S16';
    if (gameIdx < 60) return 'E8';
    if (gameIdx < 62) return 'F4';
    return 'NCG';
}

// Returns the two feeder game indices for a given game
function feederGames(gameIdx) {
    if (gameIdx < 32) return null; // R64 has no feeders
    if (gameIdx < 48) return [(gameIdx - 32) * 2, (gameIdx - 32) * 2 + 1];
    if (gameIdx < 56) return [(gameIdx - 48) * 2 + 32, (gameIdx - 48) * 2 + 33];
    if (gameIdx < 60) return [(gameIdx - 56) * 2 + 48, (gameIdx - 56) * 2 + 49];
    if (gameIdx < 62) return [(gameIdx - 60) * 2 + 56, (gameIdx - 60) * 2 + 57];
    return [60, 61]; // NCG
}

// Get the two teams playing in a game given results so far
function getMatchupTeams(gameIdx, resultArray) {
    if (gameIdx < 32) {
        return [R64_MATCHUPS[gameIdx][0], R64_MATCHUPS[gameIdx][2]];
    }
    const [f1, f2] = feederGames(gameIdx);
    return [resultArray[f1], resultArray[f2]];
}

// Get seed for a team abbreviation
function getTeamSeed(abbrev) {
    for (const m of R64_MATCHUPS) {
        if (m[0] === abbrev) return m[1];
        if (m[2] === abbrev) return m[3];
    }
    return null;
}

// Get region for a team
function getTeamRegion(abbrev) {
    for (let i = 0; i < 32; i++) {
        if (R64_MATCHUPS[i][0] === abbrev || R64_MATCHUPS[i][2] === abbrev) {
            return REGIONS[Math.floor(i / 8)];
        }
    }
    return null;
}
