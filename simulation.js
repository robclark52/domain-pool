// Monte Carlo Simulation Engine for NCAA Tournament Pool
// Supports RPI-based and Seed-based win probability models

// Historical seed matchup win rates (1985-2024)
const SEED_WIN_RATES = {
    '1v16': 0.993, '1v8': 0.788, '1v9': 0.862, '1v5': 0.648, '1v12': 0.750,
    '1v4': 0.566, '1v13': 0.850, '1v6': 0.600, '1v11': 0.652, '1v3': 0.533,
    '1v14': 0.867, '1v7': 0.600, '1v10': 0.636, '1v2': 0.508,
    '2v15': 0.946, '2v7': 0.631, '2v10': 0.700, '2v3': 0.508, '2v14': 0.867,
    '2v6': 0.564, '2v11': 0.615, '2v1': 0.492,
    '3v14': 0.851, '3v6': 0.530, '3v11': 0.596, '3v2': 0.492, '3v7': 0.571,
    '3v10': 0.588, '3v1': 0.467,
    '4v13': 0.789, '4v5': 0.541, '4v12': 0.625, '4v1': 0.434, '4v8': 0.500,
    '4v9': 0.556, '4v6': 0.500,
    '5v12': 0.649, '5v4': 0.459, '5v13': 0.625, '5v1': 0.352, '5v8': 0.444,
    '5v9': 0.500,
    '6v11': 0.620, '6v3': 0.470, '6v14': 0.600, '6v7': 0.500, '6v10': 0.538,
    '6v2': 0.436, '6v1': 0.400,
    '7v10': 0.609, '7v2': 0.369, '7v15': 0.500, '7v3': 0.429, '7v6': 0.500,
    '8v9': 0.517, '8v1': 0.212, '8v4': 0.500, '8v5': 0.556,
    '9v8': 0.483, '9v1': 0.138, '9v4': 0.444, '9v5': 0.500,
    '10v7': 0.391, '10v2': 0.300, '10v15': 0.500, '10v3': 0.412, '10v6': 0.462,
    '11v6': 0.380, '11v3': 0.404, '11v14': 0.500, '11v2': 0.385, '11v7': 0.500,
    '12v5': 0.351, '12v4': 0.375, '12v13': 0.500, '12v1': 0.250,
    '13v4': 0.211, '13v5': 0.375, '13v12': 0.500,
    '14v3': 0.149, '14v6': 0.400, '14v11': 0.500, '14v2': 0.133,
    '15v2': 0.054, '15v7': 0.500, '15v10': 0.500,
    '16v1': 0.007
};

// RPI-based logistic win probability
function winProbRPI(teamA, teamB, k) {
    const rpiA = lookupRPI(teamA) || 0.500;
    const rpiB = lookupRPI(teamB) || 0.500;
    return 1 / (1 + Math.pow(10, (rpiB - rpiA) * k));
}

// Seed-based historical win probability
function winProbSeed(seedA, seedB) {
    const key = `${seedA}v${seedB}`;
    if (SEED_WIN_RATES[key] !== undefined) return SEED_WIN_RATES[key];
    const revKey = `${seedB}v${seedA}`;
    if (SEED_WIN_RATES[revKey] !== undefined) return 1 - SEED_WIN_RATES[revKey];
    // Fallback: derive from seed difference
    return 1 / (1 + Math.pow(10, (seedA - seedB) * 0.05));
}

// Lookup RPI for a team (using abbreviation)
function lookupRPIForAbbrev(abbrev) {
    const fullName = TEAM_NAMES[abbrev];
    if (!fullName) return 0.500;
    return lookupRPI(fullName) || 0.500;
}

// Simulate a single game
function simGame(teamA, teamB, k, model) {
    let prob;
    if (model === 'seed') {
        const seedA = getTeamSeed(teamA) || 8;
        const seedB = getTeamSeed(teamB) || 8;
        prob = winProbSeed(seedA, seedB);
    } else {
        const nameA = TEAM_NAMES[teamA] || teamA;
        const nameB = TEAM_NAMES[teamB] || teamB;
        prob = winProbRPI(nameA, nameB, k);
    }
    return Math.random() < prob ? teamA : teamB;
}

// Simulate remaining tournament games from a starting state
// Returns a complete 63-element results array
function simulateTournament(startingResults, k, model, forceChamp) {
    const sim = [...startingResults]; // copy

    for (let g = 0; g < 63; g++) {
        if (sim[g] !== null) continue; // game already decided

        let teamA, teamB;
        if (g < 32) {
            teamA = R64_MATCHUPS[g][0];
            teamB = R64_MATCHUPS[g][2];
        } else {
            const [f1, f2] = feederGames(g);
            teamA = sim[f1];
            teamB = sim[f2];
            if (!teamA || !teamB) continue; // feeder games not yet resolved
        }

        // Force champion: if this is NCG and forceChamp specified, force the result
        if (g === 62 && forceChamp) {
            sim[g] = forceChamp;
            continue;
        }
        // For games where forceChamp must pass through: bias heavily
        if (forceChamp && (teamA === forceChamp || teamB === forceChamp)) {
            if (g >= 48) { // S16 and later, give forced champ very high win prob
                sim[g] = forceChamp;
                continue;
            }
        }

        sim[g] = simGame(teamA, teamB, k, model);
    }

    return sim;
}

// Score a player's picks against a results array
function scorePlayer(playerPicks, results) {
    const roundPts = { R64: 0, R32: 0, S16: 0, E8: 0, F4: 0, NCG: 0 };
    let total = 0;

    for (let g = 0; g < 63; g++) {
        if (results[g] === null) continue;
        const round = gameRound(g);
        if (playerPicks[g] === results[g]) {
            const pts = ESPN_SCORING[round];
            roundPts[round] += pts;
            total += pts;
        }
    }

    return { total, ...roundPts };
}

// Calculate max possible score for a player given current results
function maxPossibleScore(playerPicks, results) {
    let max = 0;
    for (let g = 0; g < 63; g++) {
        const round = gameRound(g);
        const pts = ESPN_SCORING[round];
        if (results[g] !== null) {
            // Game decided: player gets points if they picked correctly
            if (playerPicks[g] === results[g]) max += pts;
        } else {
            // Game not decided: player could still get points if their pick is alive
            if (isPickAlive(playerPicks[g], g, results)) max += pts;
        }
    }
    return max;
}

// Check if a player's pick for a game is still alive (could still win)
function isPickAlive(pick, gameIdx, results) {
    if (gameIdx < 32) {
        // R64: pick is one of the two teams, always alive if game not played
        return true;
    }
    // For later rounds, the picked team must still be able to reach this game
    // This means it must have won (or could win) all preceding games
    return canTeamReachGame(pick, gameIdx, results);
}

// Check if a team can reach a specific game slot
function canTeamReachGame(team, gameIdx, results) {
    if (gameIdx < 32) return R64_MATCHUPS[gameIdx][0] === team || R64_MATCHUPS[gameIdx][2] === team;

    const [f1, f2] = feederGames(gameIdx);

    // If a feeder game has been decided
    if (results[f1] !== null && results[f2] !== null) {
        return results[f1] === team || results[f2] === team;
    }
    if (results[f1] !== null) {
        return results[f1] === team || canTeamReachGame(team, f2, results);
    }
    if (results[f2] !== null) {
        return results[f2] === team || canTeamReachGame(team, f1, results);
    }

    return canTeamReachGame(team, f1, results) || canTeamReachGame(team, f2, results);
}

// Get the results array for a specific starting point
function getStartingResults(mode) {
    if (mode === 'pre') return new Array(63).fill(null);
    if (mode === 'current') return [...RESULTS];

    // For specific round cutoffs, include all results through that round
    const cutoffs = { R64: 32, R32: 48, S16: 56, E8: 60, F4: 62 };
    const cutoff = cutoffs[mode] || 63;
    const r = [...RESULTS];
    // Null out any results beyond the cutoff
    for (let i = cutoff; i < 63; i++) r[i] = null;
    // Also ensure all games up to cutoff that have results keep them
    // (but games not yet played remain null)
    return r;
}

// Run full Monte Carlo simulation
function runPoolSimulation(numSims, k, model, startMode, onProgress, forceChamp) {
    const startResults = getStartingResults(startMode);

    const playerStats = PLAYERS.map(p => ({
        name: p.name,
        totalWins: 0,
        totalPoints: 0,
        totalFirst: 0,
        totalSecond: 0,
        totalThird: 0
    }));

    const champCounts = {};

    for (let s = 0; s < numSims; s++) {
        if (onProgress && s % 500 === 0) onProgress(s / numSims);

        const simResults = simulateTournament(startResults, k, model, forceChamp || null);
        const champ = simResults[62];
        champCounts[champ] = (champCounts[champ] || 0) + 1;

        // Score each player
        const scores = PLAYERS.map((p, i) => ({
            idx: i,
            score: scorePlayer(p.picks, simResults).total
        }));

        // Sort by score descending
        scores.sort((a, b) => b.score - a.score);

        // Award placements
        playerStats[scores[0].idx].totalWins++;
        playerStats[scores[0].idx].totalFirst++;
        if (scores[1]) playerStats[scores[1].idx].totalSecond++;
        if (scores[2]) playerStats[scores[2].idx].totalThird++;

        for (const s2 of scores) {
            playerStats[s2.idx].totalPoints += s2.score;
        }
    }

    // Compute averages
    const results = playerStats.map(p => ({
        name: p.name,
        winPct: p.totalWins / numSims,
        avgPoints: p.totalPoints / numSims,
        first: p.totalFirst / numSims,
        second: p.totalSecond / numSims,
        third: p.totalThird / numSims
    })).sort((a, b) => b.winPct - a.winPct);

    const champPcts = {};
    for (const [team, count] of Object.entries(champCounts)) {
        champPcts[team] = count / numSims;
    }

    if (onProgress) onProgress(1);
    return { results, champPcts };
}
