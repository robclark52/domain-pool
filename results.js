// Actual tournament results - UPDATE THIS FILE as games are played
// Each element is the winning team's abbreviation, or null if game not yet played
// Game indices match bracket.js structure:
//   R64: 0-31, R32: 32-47, S16: 48-55, E8: 56-59, F4: 60-61, NCG: 62
// Last updated: 2026-03-21 (R64 complete, R32 in progress)

const RESULTS = [
    // === R64 (games 0-31) - ALL COMPLETE ===
    // East
    'DUKE',  // (0) Duke 71, Siena 65
    'TCU',   // (1) Ohio State 64, TCU 66
    'SJU',   // (2) St John's 79, Northern Iowa 53
    'KU',    // (3) Kansas 68, CA Baptist 60
    'LOU',   // (4) Louisville 83, South Florida 53 (corrected from page)
    'MSU',   // (5) Michigan St 92, N Dakota St 67
    'UCLA',  // (6) UCLA 75, UCF 71
    'CONN',  // (7) UConn 82, Furman 71
    // West
    'FLA',   // (8) Florida 114, Prairie View 51 (corrected)
    'IOWA',  // (9) Clemson 59, Iowa 78
    'VAN',   // (10) Vanderbilt 73, McNeese 61
    'NEB',   // (11) Nebraska 88, Troy 65
    'VCU',   // (12) North Carolina 55, VCU 65 (UPSET - 11 over 6)
    'ILL',   // (13) Illinois 76, Penn 51
    'TA&M',  // (14) Saint Mary's 59, Texas A&M 72 (10 over 7)
    'HOU',   // (15) Houston 88, Idaho 57
    // South
    'ARIZ',  // (16) Arizona 92, Long Island 51
    'USU',   // (17) Villanova 62, Utah State 71 (9 over 8)
    'HPU',   // (18) Wisconsin 61, High Point 65 (UPSET - 12 over 5)
    'ARK',   // (19) Arkansas 78, Hawai'i 56
    'TEX',   // (20) BYU 68, Texas 74 (11 over 6)
    'GONZ',  // (21) Gonzaga 83, Kennesaw St 52
    'MIA',   // (22) Miami 73, Missouri 62
    'PUR',   // (23) Purdue 85, Queens 55
    // Midwest
    'MICH',  // (24) Michigan 95, Howard 58
    'SLU',   // (25) Georgia 62, Saint Louis 72 (9 over 8)
    'TTU',   // (26) Texas Tech 71, Akron 51
    'ALA',   // (27) Alabama 86, Hofstra 65
    'TENN',  // (28) Tennessee 74, Miami OH 52
    'UVA',   // (29) Virginia 70, Wright St 51
    'UK',    // (30) Kentucky 72, Santa Clara 51
    'ISU',   // (31) Iowa State 83, Tennessee St 55

    // === R32 (games 32-47) - IN PROGRESS 3/21-22 ===
    'DUKE',  // (32) Duke over TCU
    null,    // (33) St John's vs Kansas
    'MSU',   // (34) Louisville vs Michigan St → MSU
    null,    // (35) UCLA vs UConn
    null,    // (36) Florida vs Iowa
    'NEB',   // (37) Vanderbilt vs Nebraska → NEB
    'ILL',   // (38) VCU vs Illinois → ILL
    'HOU',   // (39) Texas A&M vs Houston → HOU
    null,    // (40) Arizona vs Utah State
    null,    // (41) High Point vs Arkansas
    'TEX',   // (42) Texas vs Gonzaga → TEX (UPSET - 11 over 3!)
    null,    // (43) Miami vs Purdue
    'MICH',  // (44) Michigan vs Saint Louis → MICH
    null,    // (45) Texas Tech vs Alabama
    null,    // (46) Tennessee vs Virginia
    null,    // (47) Kentucky vs Iowa State

    // === S16 (games 48-55) ===
    null, null, null, null, null, null, null, null,

    // === E8 (games 56-59) ===
    null, null, null, null,

    // === F4 (games 60-61) ===
    null, null,

    // === NCG (game 62) ===
    null
];
