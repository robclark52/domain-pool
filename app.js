// Domain Pool - Main Application

const GITHUB_REPO = 'robclark52/domain-pool';
const RESULTS_FILE = 'results.js';

// ─── GitHub PAT Management ───────────────────────────────
function getGitHubPAT() {
    let pat = localStorage.getItem('domain_pool_github_pat');
    if (!pat) {
        pat = prompt(
            'Enter your GitHub Personal Access Token (PAT) to enable saving results.\n\n' +
            'The token needs "public_repo" scope. It will be stored in your browser\'s localStorage.\n\n' +
            'Create one at: https://github.com/settings/tokens'
        );
        if (pat) localStorage.setItem('domain_pool_github_pat', pat.trim());
    }
    return pat ? pat.trim() : null;
}

function clearGitHubPAT() {
    localStorage.removeItem('domain_pool_github_pat');
}

// ─── GitHub Contents API ─────────────────────────────────
async function fetchResultsFromGitHub() {
    try {
        const url = `https://raw.githubusercontent.com/${GITHUB_REPO}/main/${RESULTS_FILE}?t=${Date.now()}`;
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        return await resp.text();
    } catch (e) {
        console.error('Failed to fetch results from GitHub:', e);
        return null;
    }
}

async function commitResultsToGitHub(newContent) {
    const pat = getGitHubPAT();
    if (!pat) {
        alert('GitHub PAT is required to save results.');
        return false;
    }

    try {
        // Get current file SHA
        const apiUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${RESULTS_FILE}`;
        const getResp = await fetch(apiUrl, {
            headers: { 'Authorization': `token ${pat}`, 'Accept': 'application/vnd.github.v3+json' }
        });

        let sha = null;
        if (getResp.ok) {
            const data = await getResp.json();
            sha = data.sha;
        } else if (getResp.status !== 404) {
            throw new Error(`Failed to get file info: ${getResp.statusText}`);
        }

        // Commit the file
        const body = {
            message: `Update results - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
            content: btoa(unescape(encodeURIComponent(newContent)))
        };
        if (sha) body.sha = sha;

        const putResp = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${pat}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (putResp.ok) return true;

        const err = await putResp.json().catch(() => ({}));
        if (putResp.status === 401) {
            localStorage.removeItem('domain_pool_github_pat');
            alert('Invalid GitHub PAT. It has been cleared. Please try again.');
        } else {
            alert(`Failed to save: ${err.message || putResp.statusText}`);
        }
        return false;
    } catch (e) {
        alert(`Error saving to GitHub: ${e.message}`);
        return false;
    }
}

// ─── ESPN Auto-Fetch ─────────────────────────────────────

// Build reverse lookup: lowercase full name → abbreviation
const ESPN_NAME_TO_ABBREV = {};
for (const [abbrev, full] of Object.entries(TEAM_NAMES)) {
    ESPN_NAME_TO_ABBREV[full.toLowerCase()] = abbrev;
}
// Add common ESPN display name variants that differ from our TEAM_NAMES
const ESPN_EXTRA_NAMES = {
    'uconn': 'CONN', 'connecticut': 'CONN',
    'michigan state': 'MSU', 'mich. st.': 'MSU', 'mich st': 'MSU',
    'ohio st': 'OSU', 'ohio st.': 'OSU',
    'north dakota st': 'NDSU', 'north dakota state': 'NDSU', 'n. dakota st.': 'NDSU',
    'st. john\'s': 'SJU', 'st john\'s': 'SJU', "saint john's": 'SJU', "st. john's (ny)": 'SJU',
    'south fla': 'USF', 'south fla.': 'USF', 'usf': 'USF',
    'california baptist': 'CBU', 'cal baptist': 'CBU',
    'prairie view a&m': 'PV', 'prairie view': 'PV', 'prairie view a&m': 'PV',
    'texas a&m': 'TA&M', 'texas am': 'TA&M',
    'mcneese state': 'MCN', 'mcneese st': 'MCN', 'mcneese st.': 'MCN',
    'saint mary\'s': 'SMC', "saint mary's (ca)": 'SMC', "st. mary's": 'SMC', "st. mary's (ca)": 'SMC',
    'long island': 'LIU', 'long island university': 'LIU', 'liu': 'LIU',
    'utah st': 'USU', 'utah st.': 'USU', 'utah state': 'USU',
    'high point': 'HPU',
    "hawai'i": 'HAW', 'hawaii': 'HAW',
    'kennesaw state': 'KENN', 'kennesaw st': 'KENN', 'kennesaw st.': 'KENN',
    'miami (fl)': 'MIA', 'miami fl': 'MIA',
    'miami (oh)': 'MIOH', 'miami oh': 'MIOH', 'miami ohio': 'MIOH',
    'saint louis': 'SLU', 'st. louis': 'SLU',
    'texas tech': 'TTU',
    'iowa state': 'ISU', 'iowa st': 'ISU', 'iowa st.': 'ISU',
    'wright state': 'WRST', 'wright st': 'WRST', 'wright st.': 'WRST',
    'santa clara': 'SCU',
    'tennessee state': 'TNST', 'tennessee st': 'TNST', 'tennessee st.': 'TNST',
    'northern iowa': 'UNI',
    'queens': 'QUNS', 'queens (nc)': 'QUNS',
    'n dakota st': 'NDSU',
    'n. carolina': 'UNC',
    'ca baptist': 'CBU'
};
for (const [name, abbrev] of Object.entries(ESPN_EXTRA_NAMES)) {
    ESPN_NAME_TO_ABBREV[name.toLowerCase()] = abbrev;
}

function matchESPNTeam(espnName, espnSeed) {
    const lower = espnName.toLowerCase().trim();
    const stripped = lower.replace(/[^a-z ]/g, '');

    // 1. Direct match on full name or variant
    if (ESPN_NAME_TO_ABBREV[lower]) return ESPN_NAME_TO_ABBREV[lower];
    if (ESPN_NAME_TO_ABBREV[stripped]) return ESPN_NAME_TO_ABBREV[stripped];

    // 2. Check if espnName matches any abbreviation directly (ESPN sometimes uses abbrevs)
    const upper = espnName.toUpperCase().trim();
    if (TEAM_NAMES[upper]) return upper;

    // 3. Seed-aware partial match: only allow substring match if seeds agree
    if (espnSeed) {
        const seedNum = parseInt(espnSeed);
        for (const [abbrev, full] of Object.entries(TEAM_NAMES)) {
            const teamSeed = getTeamSeed(abbrev);
            if (teamSeed !== seedNum) continue;
            const fullLower = full.toLowerCase();
            if (fullLower.includes(lower) || lower.includes(fullLower)) return abbrev;
        }
    }

    // 4. Fuzzy partial match (word-boundary aligned)
    for (const [name, abbrev] of Object.entries(ESPN_NAME_TO_ABBREV)) {
        if (lower.length > name.length) {
            if (lower.startsWith(name) && (lower[name.length] === ' ' || lower[name.length] === undefined)) return abbrev;
        } else if (name.length > lower.length) {
            if (name.startsWith(lower) && (name[lower.length] === ' ' || name[lower.length] === undefined)) return abbrev;
        }
    }

    console.warn(`No match for ESPN team: "${espnName}" (seed ${espnSeed})`);
    return null;
}

// Map ESPN round note text to our round ranges
function parseESPNRound(noteText) {
    if (noteText.includes('1st Round')) return 'R64';
    if (noteText.includes('2nd Round')) return 'R32';
    if (noteText.includes('Sweet') || noteText.includes('Regional Semifinal')) return 'S16';
    if (noteText.includes('Elite') || noteText.includes('Regional Final')) return 'E8';
    if (noteText.includes('Final Four') || noteText.includes('National Semifinal')) return 'F4';
    if (noteText.includes('National Championship')) return 'NCG';
    return null;
}

// Find which bracket index a game belongs to given the two teams and the round
function findBracketIndex(team1Abbrev, team2Abbrev, round) {
    const ranges = { R64: [0, 32], R32: [32, 48], S16: [48, 56], E8: [56, 60], F4: [60, 62], NCG: [62, 63] };
    const [start, end] = ranges[round] || [0, 63];

    for (let gi = start; gi < end; gi++) {
        let homeTeam, awayTeam;
        if (gi < 32) {
            homeTeam = R64_MATCHUPS[gi][0];
            awayTeam = R64_MATCHUPS[gi][2];
        } else {
            const [f1, f2] = feederGames(gi);
            homeTeam = RESULTS[f1];
            awayTeam = RESULTS[f2];
        }
        if (!homeTeam || !awayTeam) continue;
        if ((homeTeam === team1Abbrev && awayTeam === team2Abbrev) ||
            (homeTeam === team2Abbrev && awayTeam === team1Abbrev)) {
            return gi;
        }
    }
    return -1;
}

async function fetchESPNScoreboard() {
    // Tournament dates for 2026
    const tourneyDates = [
        '20260319', '20260320', '20260321', '20260322',
        '20260326', '20260327', '20260328', '20260329',
        '20260404', '20260406'
    ];
    const allGames = [];
    for (const d of tourneyDates) {
        try {
            const url = `https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard?dates=${d}&groups=100&limit=50`;
            const resp = await fetch(url);
            const data = await resp.json();
            allGames.push(...(data.events || []));
        } catch (e) { /* skip date if fetch fails */ }
    }
    return allGames;
}

function generateResultsFileContent() {
    const lines = [];
    lines.push('// Actual tournament results - UPDATE THIS FILE as games are played');
    lines.push('// Each element is the winning team\'s abbreviation, or null if game not yet played');
    lines.push('// Game indices match bracket.js structure:');
    lines.push('//   R64: 0-31, R32: 32-47, S16: 48-55, E8: 56-59, F4: 60-61, NCG: 62');
    lines.push(`// Last updated: ${new Date().toISOString()}`);
    lines.push('');
    lines.push('const RESULTS = [');

    const regionNames = ['East', 'West', 'South', 'Midwest'];
    lines.push('    // === R64 (games 0-31) ===');
    for (let r = 0; r < 4; r++) {
        const start = r * 8;
        const vals = [];
        for (let i = start; i < start + 8; i++) vals.push(RESULTS[i] ? `'${RESULTS[i]}'` : 'null');
        lines.push(`    ${vals.join(', ')},  // ${regionNames[r]}`);
    }
    lines.push('    // === R32 (games 32-47) ===');
    let r32 = []; for (let i = 32; i < 48; i++) r32.push(RESULTS[i] ? `'${RESULTS[i]}'` : 'null');
    lines.push(`    ${r32.join(', ')},`);
    lines.push('    // === S16 (games 48-55) ===');
    let s16 = []; for (let i = 48; i < 56; i++) s16.push(RESULTS[i] ? `'${RESULTS[i]}'` : 'null');
    lines.push(`    ${s16.join(', ')},`);
    lines.push('    // === E8 (games 56-59) ===');
    let e8 = []; for (let i = 56; i < 60; i++) e8.push(RESULTS[i] ? `'${RESULTS[i]}'` : 'null');
    lines.push(`    ${e8.join(', ')},`);
    lines.push('    // === F4 (games 60-61) ===');
    let f4 = []; for (let i = 60; i < 62; i++) f4.push(RESULTS[i] ? `'${RESULTS[i]}'` : 'null');
    lines.push(`    ${f4.join(', ')},`);
    lines.push('    // === NCG (game 62) ===');
    lines.push(`    ${RESULTS[62] ? `'${RESULTS[62]}'` : 'null'}`);
    lines.push('];');
    lines.push('');
    return lines.join('\n');
}

function setStatus(msg, isError) {
    const el = document.getElementById('update-status');
    el.textContent = msg;
    el.className = 'update-status' + (isError ? ' error' : '');
    el.classList.remove('hidden');
}

async function updateResults() {
    const btn = document.getElementById('update-results-btn');
    btn.disabled = true;
    btn.textContent = 'Fetching scores...';
    setStatus('Fetching latest scores from ESPN...', false);

    try {
        const games = await fetchESPNScoreboard();
        let updated = 0;
        let matched = 0;
        const unmatched = [];

        // Process games round by round (R64 first, then R32, etc.) so feeder results are available
        const roundOrder = ['R64', 'R32', 'S16', 'E8', 'F4', 'NCG'];

        // Bucket games by round
        const gamesByRound = {};
        for (const event of games) {
            const comp = event.competitions[0];
            if (comp.status.type.name !== 'STATUS_FINAL') continue;
            const notes = (comp.notes || []).map(n => n.headline).join(' ');
            const round = parseESPNRound(notes);
            if (!round) continue;
            if (!gamesByRound[round]) gamesByRound[round] = [];
            gamesByRound[round].push(comp);
        }

        for (const round of roundOrder) {
            const roundGames = gamesByRound[round] || [];
            for (const comp of roundGames) {
                const teams = comp.competitors;
                const t1 = teams[0], t2 = teams[1];
                const name1 = t1.team.shortDisplayName || t1.team.displayName;
                const name2 = t2.team.shortDisplayName || t2.team.displayName;
                const seed1 = t1.curatedRank?.current || null;
                const seed2 = t2.curatedRank?.current || null;

                const abbrev1 = matchESPNTeam(name1, seed1);
                const abbrev2 = matchESPNTeam(name2, seed2);

                if (!abbrev1 || !abbrev2) {
                    unmatched.push(`${name1} vs ${name2}`);
                    continue;
                }

                const winner = t1.winner ? abbrev1 : t2.winner ? abbrev2 : null;
                if (!winner) continue;

                const gi = findBracketIndex(abbrev1, abbrev2, round);
                if (gi < 0) {
                    console.warn(`Could not find bracket slot for ${abbrev1} vs ${abbrev2} in ${round}`);
                    continue;
                }

                matched++;
                if (RESULTS[gi] !== winner) {
                    RESULTS[gi] = winner;
                    updated++;
                }
            }
        }

        if (unmatched.length > 0) {
            console.warn('Unmatched ESPN games:', unmatched);
        }

        // Re-render standings with new results
        renderStandings();

        if (updated > 0) {
            btn.textContent = 'Saving to GitHub...';
            setStatus(`Found ${matched} completed games, ${updated} new results. Saving...`, false);

            const content = generateResultsFileContent();
            const saved = await commitResultsToGitHub(content);

            if (saved) {
                setStatus(`Updated ${updated} results and saved to GitHub.`, false);
                btn.textContent = `Updated ${updated} results ✓`;
            } else {
                setStatus(`Updated ${updated} results locally but failed to save to GitHub.`, true);
                btn.textContent = 'Save failed';
            }
        } else {
            setStatus(`All ${matched} completed games already up to date.`, false);
            btn.textContent = 'Already up to date ✓';
        }
    } catch (e) {
        setStatus(`Error: ${e.message}`, true);
        btn.textContent = 'Update failed';
        console.error('Update failed:', e);
    }

    setTimeout(() => { btn.textContent = 'Update Results'; btn.disabled = false; }, 3000);
}

// ─── Navigation ────────────────────────────────────────
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    });
});

// ─── ESPN Link ─────────────────────────────────────────
document.getElementById('espn-link').href = ESPN_GROUP_URL;

// ─── Scoring Engine ────────────────────────────────────
function computeStandings() {
    return PLAYERS.map(p => {
        const score = scorePlayer(p.picks, RESULTS);
        const max = maxPossibleScore(p.picks, RESULTS);

        // Extract key picks from indices
        const f4 = [p.picks[56], p.picks[57], p.picks[58], p.picks[59]]; // E8 winners = F4 teams
        const champ = p.picks[62];
        const semiWinners = [p.picks[60], p.picks[61]]; // F4 winners
        const runnerUp = semiWinners.find(t => t !== champ) || semiWinners[1];

        // Check if champ pick is still alive
        const champAlive = canTeamReachGame(champ, 62, RESULTS);
        // Check F4 teams alive
        const f4Alive = f4.map((t, i) => canTeamReachGame(t, 56 + i, RESULTS));

        return {
            name: p.name,
            espn: p.espn,
            pts: score.total,
            max,
            r64: score.R64,
            r32: score.R32,
            s16: score.S16,
            e8: score.E8,
            f4pts: score.F4,
            ncg: score.NCG,
            finalFour: f4,
            f4Alive,
            champ,
            champAlive,
            runnerUp
        };
    }).sort((a, b) => b.pts - a.pts || b.max - a.max);
}

// ─── Determine current round status ────────────────────
function getCurrentRoundStatus() {
    let r64Done = 0, r32Done = 0, s16Done = 0, e8Done = 0, f4Done = 0, ncgDone = 0;
    for (let i = 0; i < 32; i++) if (RESULTS[i]) r64Done++;
    for (let i = 32; i < 48; i++) if (RESULTS[i]) r32Done++;
    for (let i = 48; i < 56; i++) if (RESULTS[i]) s16Done++;
    for (let i = 56; i < 60; i++) if (RESULTS[i]) e8Done++;
    for (let i = 60; i < 62; i++) if (RESULTS[i]) f4Done++;
    if (RESULTS[62]) ncgDone = 1;

    if (ncgDone) return 'Tournament Complete';
    if (f4Done > 0) return `Championship (F4: ${f4Done}/2)`;
    if (e8Done > 0) return `Final Four (E8: ${e8Done}/4)`;
    if (s16Done > 0) return `Elite 8 (S16: ${s16Done}/8)`;
    if (r32Done > 0) return `Sweet 16 (R32: ${r32Done}/16)`;
    if (r64Done > 0) return `Round of 32 (R64: ${r64Done}/32)`;
    return 'Pre-Tournament';
}

// ─── Render Leaderboard ────────────────────────────────
function renderStandings() {
    const standings = computeStandings();

    // Round status
    document.getElementById('round-status').innerHTML =
        `<div class="round-badge">${getCurrentRoundStatus()}</div>`;

    // Podium (top 3)
    const podium = document.getElementById('podium');
    podium.innerHTML = '';
    const medals = ['🥇', '🥈', '🥉'];
    for (let i = 0; i < Math.min(3, standings.length); i++) {
        const s = standings[i];
        podium.innerHTML += `
            <div class="podium-card rank-${i + 1}">
                <div class="podium-medal">${medals[i]}</div>
                <div class="podium-name">${s.name}</div>
                <div class="podium-pts">${s.pts} pts</div>
                <div class="podium-max">Max: ${s.max}</div>
                <div class="podium-champ ${s.champAlive ? 'alive' : 'dead'}">
                    Champ: ${TEAM_NAMES[s.champ] || s.champ}
                </div>
            </div>
        `;
    }

    // Full standings table
    const tbody = document.getElementById('standings-body');
    tbody.innerHTML = '';
    standings.forEach((s, i) => {
        const f4Html = s.finalFour.map((t, j) =>
            `<span class="team-tag ${s.f4Alive[j] ? 'alive' : 'dead'}">${t}</span>`
        ).join(' ');

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${i + 1}</td>
            <td class="name-cell">${s.name}</td>
            <td class="pts-cell">${s.pts}</td>
            <td class="max-cell">${s.max}</td>
            <td>${s.r64}</td>
            <td>${s.r32}</td>
            <td>${s.s16}</td>
            <td>${s.e8}</td>
            <td>${s.f4pts}</td>
            <td>${s.ncg}</td>
            <td class="f4-cell">${f4Html}</td>
            <td class="champ-cell ${s.champAlive ? 'alive' : 'dead'}">${TEAM_NAMES[s.champ] || s.champ}</td>
            <td>${TEAM_NAMES[s.runnerUp] || s.runnerUp}</td>
        `;
        tbody.appendChild(tr);
    });

    // Champion pick distribution
    const dist = {};
    for (const p of PLAYERS) {
        const c = TEAM_NAMES[p.picks[62]] || p.picks[62];
        dist[c] = (dist[c] || 0) + 1;
    }
    const sorted = Object.entries(dist).sort((a, b) => b[1] - a[1]);
    let distHtml = '<h3>Champion Pick Distribution</h3><div class="champ-dist">';
    for (const [team, count] of sorted) {
        const pct = (count / PLAYERS.length * 100).toFixed(0);
        const alive = canTeamReachGame(
            Object.keys(TEAM_NAMES).find(k => TEAM_NAMES[k] === team) || team,
            62, RESULTS
        );
        distHtml += `<div class="dist-bar ${alive ? 'alive' : 'dead'}">
            <span class="dist-team">${team}</span>
            <div class="dist-fill" style="width:${pct * 2}px"></div>
            <span class="dist-count">${count} (${pct}%)</span>
        </div>`;
    }
    distHtml += '</div>';
    document.getElementById('champ-distribution').innerHTML = distHtml;
}

// ─── Model description ─────────────────────────────────
document.getElementById('sim-model').addEventListener('change', updateModelDesc);
function updateModelDesc() {
    const model = document.getElementById('sim-model').value;
    const kGroup = document.getElementById('k-group');
    const desc = document.getElementById('model-desc');
    if (model === 'rpi') {
        kGroup.style.display = '';
        desc.textContent = 'RPI Model: Win probability from logistic function of RPI difference. Higher k = more separation.';
    } else {
        kGroup.style.display = 'none';
        desc.textContent = 'Seed Model: Win probability from historical seed-vs-seed matchup data (1985-2024).';
    }
}

// ─── Run Single Simulation ─────────────────────────────
function runSimulation() {
    const model = document.getElementById('sim-model').value;
    const k = parseFloat(document.getElementById('sim-k').value) || 10;
    const numSims = parseInt(document.getElementById('sim-count').value);
    const startMode = document.getElementById('sim-start').value;

    document.getElementById('sim-progress').classList.remove('hidden');
    document.getElementById('sim-results').classList.add('hidden');
    document.getElementById('sim-suite-results').classList.add('hidden');

    setTimeout(() => {
        const { results, champPcts } = runPoolSimulation(numSims, k, model, startMode, (pct) => {
            document.getElementById('progress-fill').style.width = (pct * 100) + '%';
            document.getElementById('progress-text').textContent = `Running... ${(pct * 100).toFixed(0)}%`;
        });

        document.getElementById('sim-progress').classList.add('hidden');
        renderSimResults(results, champPcts, numSims);
    }, 50);
}

function renderSimResults(results, champPcts, numSims) {
    const container = document.getElementById('sim-results');
    container.classList.remove('hidden');

    // Top 3 podium
    const podium = document.getElementById('sim-podium');
    podium.innerHTML = '';
    const medals = ['🥇', '🥈', '🥉'];
    for (let i = 0; i < Math.min(3, results.length); i++) {
        const r = results[i];
        podium.innerHTML += `
            <div class="sim-card rank-${i + 1}">
                <div class="podium-medal">${medals[i]}</div>
                <div class="podium-name">${r.name}</div>
                <div class="sim-winpct">${(r.winPct * 100).toFixed(1)}%</div>
                <div class="sim-ev">E[pts]: ${r.avgPoints.toFixed(0)}</div>
            </div>
        `;
    }

    // Full table
    const thead = document.getElementById('sim-thead');
    thead.innerHTML = '<th>#</th><th>Name</th><th>Win%</th><th>E[pts]</th><th>1st</th><th>2nd</th><th>3rd</th>';
    const tbody = document.getElementById('sim-body');
    tbody.innerHTML = '';
    results.forEach((r, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${i + 1}</td>
            <td>${r.name}</td>
            <td class="pts-cell">${(r.winPct * 100).toFixed(1)}%</td>
            <td>${r.avgPoints.toFixed(0)}</td>
            <td>${(r.first * 100).toFixed(1)}%</td>
            <td>${(r.second * 100).toFixed(1)}%</td>
            <td>${(r.third * 100).toFixed(1)}%</td>
        `;
        tbody.appendChild(tr);
    });
}

// ─── Run Conditional Suite ─────────────────────────────
function runSimSuite() {
    const model = document.getElementById('sim-model').value;
    const k = parseFloat(document.getElementById('sim-k').value) || 10;
    const numSims = parseInt(document.getElementById('sim-count').value);
    const startMode = document.getElementById('sim-start').value;

    document.getElementById('sim-progress').classList.remove('hidden');
    document.getElementById('sim-results').classList.add('hidden');
    document.getElementById('sim-suite-results').classList.add('hidden');

    // Get alive contenders (teams that can still win)
    const contenders = [];
    // Check which teams from top seeds can still reach NCG
    const topTeams = ['DUKE', 'FLA', 'ARIZ', 'MICH', 'HOU', 'CONN', 'PUR', 'ISU', 'MSU', 'ILL', 'KU', 'NEB', 'TEX'];
    for (const t of topTeams) {
        if (canTeamReachGame(t, 62, getStartingResults(startMode))) {
            contenders.push(t);
        }
    }
    // Also add any R32+ winners not in the list
    for (let i = 32; i < 63; i++) {
        const r = RESULTS[i];
        if (r && !contenders.includes(r)) contenders.push(r);
    }

    setTimeout(() => {
        const suiteResults = {};

        // Normal scenario first
        const normal = runPoolSimulation(numSims, k, model, startMode, (pct) => {
            const overall = pct / (contenders.length + 1);
            document.getElementById('progress-fill').style.width = (overall * 100) + '%';
            document.getElementById('progress-text').textContent = `Normal scenario... ${(pct * 100).toFixed(0)}%`;
        });
        suiteResults['Normal'] = normal.results;

        // Forced champion scenarios
        contenders.forEach((team, ci) => {
            const forced = runPoolSimulation(numSims, k, model, startMode, (pct) => {
                const overall = (ci + 1 + pct) / (contenders.length + 1);
                document.getElementById('progress-fill').style.width = (overall * 100) + '%';
                document.getElementById('progress-text').textContent =
                    `If ${TEAM_NAMES[team] || team} wins... ${(pct * 100).toFixed(0)}%`;
            }, team);
            suiteResults[team] = forced.results;
        });

        document.getElementById('sim-progress').classList.add('hidden');
        renderSimSuite(suiteResults);
    }, 50);
}

function renderSimSuite(suiteResults) {
    const container = document.getElementById('sim-suite-results');
    container.classList.remove('hidden');

    const scenarios = Object.keys(suiteResults);
    const thead = document.getElementById('suite-thead');
    const tbody = document.getElementById('suite-body');
    thead.innerHTML = '';
    tbody.innerHTML = '';

    // Header row
    let h1 = '<tr><th rowspan="2">Player</th>';
    let h2 = '<tr>';
    for (const sc of scenarios) {
        const label = sc === 'Normal' ? 'Current' : (TEAM_NAMES[sc] || sc);
        h1 += `<th colspan="2">${label}</th>`;
        h2 += '<th>Win%</th><th>E[pts]</th>';
    }
    h1 += '</tr>';
    h2 += '</tr>';
    thead.innerHTML = h1 + h2;

    // Get all player names from first scenario
    const playerNames = suiteResults[scenarios[0]].map(r => r.name);

    // Build rows
    for (const name of playerNames) {
        const tr = document.createElement('tr');
        let html = `<td class="name-cell">${name}</td>`;
        for (const sc of scenarios) {
            const pData = suiteResults[sc].find(r => r.name === name);
            if (pData) {
                const winPct = (pData.winPct * 100).toFixed(1);
                const isTop = pData.winPct === Math.max(...suiteResults[sc].map(r => r.winPct));
                html += `<td class="${isTop ? 'pts-cell' : ''}">${winPct}%</td>`;
                html += `<td>${pData.avgPoints.toFixed(0)}</td>`;
            } else {
                html += '<td>-</td><td>-</td>';
            }
        }
        tr.innerHTML = html;
        tbody.appendChild(tr);
    }
}

// ─── Model Explainer ───────────────────────────────────
function renderExplainer() {
    document.getElementById('explainer-content').innerHTML = `
        <h2>Simulation Methodology</h2>

        <h3>Overview</h3>
        <p>This tool uses <strong>Monte Carlo simulation</strong> to estimate each pool entry's probability of winning the Domain Real Estate Ballers ESPN Tournament Challenge. It simulates the remaining tournament games thousands of times, scores each entry's bracket against the simulated outcomes, and tallies win rates.</p>

        <h3>ESPN Scoring</h3>
        <p>Points are awarded for each correct pick, increasing by round:</p>
        <table class="explainer-table">
            <tr><th>Round</th><th>Points per Correct Pick</th><th>Games</th><th>Max Points</th></tr>
            <tr><td>Round of 64</td><td>10</td><td>32</td><td>320</td></tr>
            <tr><td>Round of 32</td><td>20</td><td>16</td><td>320</td></tr>
            <tr><td>Sweet 16</td><td>40</td><td>8</td><td>320</td></tr>
            <tr><td>Elite 8</td><td>80</td><td>4</td><td>320</td></tr>
            <tr><td>Final Four</td><td>160</td><td>2</td><td>320</td></tr>
            <tr><td>Championship</td><td>320</td><td>1</td><td>320</td></tr>
            <tr><td><strong>Total</strong></td><td></td><td><strong>63</strong></td><td><strong>1,920</strong></td></tr>
        </table>

        <h3>RPI Model</h3>
        <p>The RPI (Ratings Percentage Index) Model uses each team's RPI rating to compute win probabilities via a <strong>logistic function</strong>:</p>
        <div class="formula">P(A beats B) = 1 / (1 + 10<sup>(RPI<sub>B</sub> - RPI<sub>A</sub>) &times; k</sup>)</div>
        <p>Where:</p>
        <ul>
            <li><strong>RPI<sub>A</sub></strong>, <strong>RPI<sub>B</sub></strong> = RPI ratings for teams A and B (higher is better, typical range 0.4-0.7)</li>
            <li><strong>k</strong> = sensitivity parameter (default 10). Higher k means the model favors the higher-ranked team more strongly.</li>
        </ul>
        <p><strong>Example:</strong> Duke (RPI 0.690) vs TCU (RPI 0.560) with k=10:</p>
        <div class="formula">P(Duke) = 1 / (1 + 10<sup>(0.560 - 0.690) &times; 10</sup>) = 1 / (1 + 10<sup>-1.3</sup>) = 1 / (1 + 0.050) = <strong>95.2%</strong></div>
        <p>The logistic shape means small RPI differences yield near-50/50 odds, while larger gaps create more decisive probabilities. This mirrors real tournament dynamics well.</p>

        <h3>Seed Model</h3>
        <p>The Seed Model uses <strong>historical win rates by seed matchup</strong> from all NCAA tournaments 1985-2024 (~40 years of data). For any matchup between seed X and seed Y, the model looks up the empirical win rate:</p>
        <div class="formula">P(Seed X beats Seed Y) = Historical Win Rate[X vs Y]</div>
        <p>Key historical rates:</p>
        <table class="explainer-table">
            <tr><th>Matchup</th><th>Higher Seed Win%</th><th>Sample</th></tr>
            <tr><td>1 vs 16</td><td>99.3%</td><td>Only 2 upsets ever (UMBC 2018, FDU 2023)</td></tr>
            <tr><td>2 vs 15</td><td>94.6%</td><td>Rare upsets (Oral Roberts 2021, St. Peter's 2022)</td></tr>
            <tr><td>1 vs 8/9</td><td>~80%</td><td>1-seeds dominant in R32</td></tr>
            <tr><td>5 vs 12</td><td>64.9%</td><td>Famous "12-5 upset" spot</td></tr>
            <tr><td>1 vs 2 (late rounds)</td><td>50.8%</td><td>Nearly a coin flip</td></tr>
        </table>
        <p>When a specific seed matchup hasn't occurred historically, the model falls back to a seed-difference formula.</p>

        <h3>Starting Points</h3>
        <p>The simulation can begin from different points in the tournament:</p>
        <ul>
            <li><strong>Pre-Tournament</strong>: Simulates all 63 games from scratch</li>
            <li><strong>Current</strong>: Uses actual results so far, simulates remaining games</li>
            <li><strong>After Round of 64/32/etc.</strong>: Assumes all games through that round are decided (uses actual results where available)</li>
        </ul>

        <h3>Conditional Suite</h3>
        <p>The "Run Conditional Suite" button runs multiple simulations: one "normal" scenario plus one scenario for each remaining contender where that team is <strong>forced to win the championship</strong>. This shows how each player's odds change depending on who wins the tournament, highlighting which outcomes are best/worst for each pool entry.</p>

        <h3>How Picks Are Stored</h3>
        <p>Each player's complete 63-game bracket is stored in <code>picks.js</code>. Actual game results are stored in <code>results.js</code>. The website dynamically computes all scores, standings, max possible scores, and round-by-round breakdowns from these two data sources. To update for new results, simply edit <code>results.js</code> with the winning team abbreviation for each completed game.</p>
    `;
}

// ─── Initialize ────────────────────────────────────────
renderStandings();
updateModelDesc();
renderExplainer();

document.getElementById('update-results-btn').addEventListener('click', updateResults);
