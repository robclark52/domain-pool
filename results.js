// Actual tournament results - UPDATE THIS FILE as games are played
// Each element is the winning team's abbreviation, or null if game not yet played
// Game indices match bracket.js structure:
//   R64: 0-31, R32: 32-47, S16: 48-55, E8: 56-59, F4: 60-61, NCG: 62
// Last updated: 2026-03-29T20:42:36.583Z

const RESULTS = [
    // === R64 (games 0-31) ===
    'DUKE', 'TCU', 'SJU', 'KU', 'LOU', 'MSU', 'UCLA', 'CONN',  // East
    'FLA', 'IOWA', 'VAN', 'NEB', 'VCU', 'ILL', 'TA&M', 'HOU',  // West
    'ARIZ', 'USU', 'HPU', 'ARK', 'TEX', 'GONZ', 'MIA', 'PUR',  // South
    'MICH', 'SLU', 'TTU', 'ALA', 'TENN', 'UVA', 'UK', 'ISU',  // Midwest
    // === R32 (games 32-47) ===
    'DUKE', 'SJU', 'MSU', 'CONN', 'IOWA', 'NEB', 'ILL', 'HOU', 'ARIZ', 'ARK', 'TEX', 'PUR', 'MICH', 'ALA', 'TENN', 'ISU',
    // === S16 (games 48-55) ===
    'DUKE', 'CONN', 'IOWA', 'ILL', 'ARIZ', 'PUR', 'MICH', 'TENN',
    // === E8 (games 56-59) ===
    null, 'ILL', 'ARIZ', 'MICH',
    // === F4 (games 60-61) ===
    null, null,
    // === NCG (game 62) ===
    null
];
