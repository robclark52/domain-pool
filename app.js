// Domain Pool - Main Application

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
