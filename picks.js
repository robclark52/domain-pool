// Domain Real Estate Ballers - ESPN Tournament Challenge 2026
// All 63 picks per player (immutable once tournament starts)
// Pick order: R64 (0-31), R32 (32-47), S16 (48-55), E8 (56-59), F4 (60-61), NCG (62)
// Last updated: 2026-03-21

const GROUP_NAME = 'Domain Real Estate Ballers';
const GROUP_ID = '63be33f1-df6a-4554-b449-ed734a766a33';
const ESPN_GROUP_URL = 'https://fantasy.espn.com/games/tournament-challenge-bracket-2026/group?id=' + GROUP_ID;

const PLAYERS = [
    {
        name: 'Kusiak',
        espn: "John Kusiak's Picks 2",
        bracketId: 'd0480c30-2240-11f1-9a49-9107d93372e2',
        picks: ['DUKE','OSU','SJU','KU','USF','MSU','UCLA','CONN','FLA','IOWA','VAN','NEB','VCU','ILL','SMC','HOU','ARIZ','USU','HPU','ARK','TEX','GONZ','MIA','PUR','MICH','SLU','TTU','ALA','TENN','UVA','SCU','ISU','DUKE','SJU','MSU','CONN','FLA','VAN','ILL','HOU','ARIZ','ARK','GONZ','PUR','MICH','TTU','TENN','ISU','DUKE','CONN','VAN','ILL','ARIZ','PUR','MICH','ISU','DUKE','ILL','ARIZ','ISU','DUKE','ARIZ','ARIZ']
    },
    {
        name: 'Aaron',
        espn: 'AKB',
        bracketId: 'd27e10a0-23a1-11f1-9e02-25e652d12aed',
        picks: ['DUKE','TCU','SJU','KU','LOU','MSU','UCLA','CONN','FLA','IOWA','VAN','NEB','UNC','ILL','TA&M','HOU','ARIZ','USU','WIS','ARK','BYU','GONZ','MIZ','PUR','MICH','SLU','TTU','ALA','TENN','UVA','UK','ISU','DUKE','KU','MSU','CONN','FLA','NEB','ILL','HOU','ARIZ','WIS','BYU','PUR','MICH','TTU','TENN','ISU','DUKE','MSU','FLA','HOU','ARIZ','PUR','MICH','ISU','DUKE','HOU','PUR','MICH','DUKE','PUR','PUR']
    },
    {
        name: 'Alok',
        espn: "ESPNFAN9805343647's Picks 1",
        bracketId: '01b445a0-2222-11f1-b55e-3315635bfaed',
        picks: ['DUKE','OSU','SJU','KU','LOU','MSU','UCLA','CONN','FLA','IOWA','VAN','NEB','VCU','ILL','SMC','HOU','ARIZ','USU','WIS','ARK','BYU','GONZ','MIA','PUR','MICH','SLU','TTU','ALA','TENN','UVA','SCU','ISU','DUKE','SJU','MSU','CONN','FLA','VAN','ILL','HOU','ARIZ','ARK','GONZ','PUR','MICH','ALA','UVA','ISU','DUKE','MSU','FLA','HOU','ARIZ','PUR','MICH','ISU','DUKE','FLA','ARIZ','MICH','DUKE','MICH','MICH']
    },
    {
        name: 'Andrew',
        espn: "andrew1295's Picks 1",
        bracketId: 'b66c2010-2319-11f1-ac80-a5a96d9405ea',
        picks: ['DUKE','TCU','SJU','KU','USF','MSU','UCLA','CONN','FLA','IOWA','VAN','NEB','UNC','ILL','TA&M','HOU','ARIZ','USU','WIS','ARK','BYU','GONZ','MIA','PUR','MICH','SLU','TTU','ALA','TENN','UVA','UK','ISU','DUKE','KU','USF','CONN','FLA','VAN','ILL','HOU','ARIZ','ARK','GONZ','PUR','MICH','ALA','UVA','ISU','DUKE','CONN','FLA','HOU','ARIZ','PUR','MICH','ISU','DUKE','HOU','ARIZ','ISU','HOU','ARIZ','ARIZ']
    },
    {
        name: 'Angelo',
        espn: "Angelo6762's Picks 1",
        bracketId: 'd58301d0-2265-11f1-bf32-8794a055fbb5',
        picks: ['DUKE','OSU','SJU','KU','LOU','MSU','UCLA','CONN','FLA','IOWA','VAN','NEB','UNC','ILL','SMC','HOU','ARIZ','USU','WIS','ARK','BYU','GONZ','MIA','PUR','MICH','UGA','TTU','ALA','TENN','UVA','UK','ISU','DUKE','KU','MSU','UCLA','FLA','VAN','ILL','HOU','ARIZ','WIS','GONZ','PUR','MICH','TTU','UVA','ISU','DUKE','MSU','FLA','ILL','ARIZ','PUR','MICH','ISU','DUKE','ILL','ARIZ','MICH','DUKE','ARIZ','ARIZ']
    },
    {
        name: 'Houdin',
        espn: "Houdin's Picks 1",
        bracketId: 'ee8f5ab0-22c5-11f1-8c06-2576181018d8',
        picks: ['DUKE','TCU','SJU','KU','LOU','MSU','UCLA','CONN','FLA','IOWA','VAN','NEB','UNC','ILL','TA&M','HOU','ARIZ','VILL','WIS','ARK','BYU','GONZ','MIA','PUR','MICH','SLU','TTU','ALA','TENN','UVA','UK','ISU','DUKE','KU','MSU','UCLA','FLA','VAN','UNC','HOU','ARIZ','WIS','GONZ','PUR','MICH','ALA','TENN','ISU','DUKE','MSU','FLA','HOU','ARIZ','PUR','MICH','ISU','DUKE','FLA','PUR','MICH','FLA','PUR','PUR']
    },
    {
        name: 'Bob',
        espn: 'Bob Does Not Play',
        bracketId: '170b0370-2228-11f1-9806-db4fdc00baff',
        picks: ['DUKE','OSU','SJU','KU','LOU','MSU','UCLA','CONN','FLA','IOWA','VAN','NEB','UNC','ILL','SMC','HOU','ARIZ','VILL','HPU','ARK','TEX','GONZ','MIZ','PUR','MICH','UGA','TTU','ALA','TENN','UVA','UK','ISU','DUKE','SJU','MSU','CONN','FLA','NEB','ILL','HOU','ARIZ','ARK','GONZ','PUR','MICH','ALA','UVA','ISU','SJU','MSU','FLA','HOU','ARIZ','GONZ','MICH','UVA','SJU','FLA','ARIZ','MICH','FLA','ARIZ','ARIZ']
    },
    {
        name: 'Mackin',
        espn: 'JDM Picks',
        bracketId: '2cb83630-21a0-11f1-acd4-f33b5997dbb7',
        picks: ['DUKE','OSU','SJU','KU','LOU','MSU','UCLA','CONN','FLA','IOWA','VAN','NEB','VCU','ILL','SMC','HOU','ARIZ','VILL','WIS','ARK','BYU','GONZ','MIZ','PUR','MICH','UGA','TTU','ALA','TENN','UVA','UK','ISU','DUKE','SJU','MSU','CONN','FLA','NEB','ILL','HOU','ARIZ','ARK','GONZ','PUR','MICH','ALA','UVA','ISU','DUKE','CONN','FLA','HOU','ARIZ','PUR','MICH','ISU','DUKE','FLA','ARIZ','MICH','FLA','ARIZ','ARIZ']
    },
    {
        name: 'Janette',
        espn: "Janette's bad bracket",
        bracketId: 'e4d45040-2255-11f1-8c33-d1a52be5ee24',
        picks: ['DUKE','TCU','SJU','KU','LOU','MSU','UCLA','CONN','FLA','IOWA','VAN','NEB','UNC','ILL','TA&M','HOU','ARIZ','VILL','WIS','ARK','BYU','GONZ','MIA','PUR','MICH','UGA','TTU','ALA','TENN','UVA','UK','ISU','DUKE','KU','MSU','CONN','FLA','VAN','UNC','HOU','ARIZ','WIS','BYU','PUR','MICH','ALA','UVA','ISU','DUKE','CONN','FLA','HOU','ARIZ','PUR','MICH','ISU','DUKE','HOU','ARIZ','MICH','DUKE','MICH','MICH']
    },
    {
        name: 'Kevin',
        espn: "Kevin's Bracket",
        bracketId: '8fac0860-21a6-11f1-b55e-3315635bfaed',
        picks: ['DUKE','OSU','SJU','KU','LOU','MSU','UCLA','CONN','FLA','IOWA','VAN','NEB','VCU','ILL','SMC','HOU','ARIZ','USU','WIS','ARK','BYU','GONZ','MIA','PUR','MICH','UGA','AKR','ALA','TENN','UVA','SCU','ISU','DUKE','SJU','MSU','CONN','FLA','VAN','ILL','HOU','ARIZ','WIS','GONZ','PUR','MICH','ALA','UVA','ISU','DUKE','CONN','FLA','HOU','ARIZ','PUR','MICH','ISU','DUKE','HOU','ARIZ','MICH','DUKE','ARIZ','ARIZ']
    },
    {
        name: 'Valdes',
        espn: "ESPNFAN3130711220's Picks 1",
        bracketId: 'ed63ec90-2221-11f1-a342-4bf3406682a0',
        picks: ['DUKE','OSU','SJU','KU','LOU','MSU','UCLA','CONN','FLA','IOWA','VAN','NEB','VCU','ILL','TA&M','HOU','ARIZ','VILL','WIS','HAW','BYU','GONZ','MIZ','PUR','MICH','SLU','TTU','ALA','TENN','UVA','SCU','ISU','DUKE','SJU','MSU','CONN','FLA','VAN','VCU','HOU','ARIZ','WIS','BYU','PUR','MICH','TTU','TENN','ISU','DUKE','CONN','FLA','HOU','ARIZ','PUR','MICH','ISU','DUKE','HOU','ARIZ','MICH','DUKE','ARIZ','ARIZ']
    },
    {
        name: 'Clauson',
        espn: "ESPNFAN6786106731's Picks 1",
        bracketId: '4b0db2a0-232f-11f1-b770-77498f20d1f9',
        picks: ['DUKE','OSU','SJU','KU','LOU','MSU','UCF','CONN','FLA','IOWA','VAN','NEB','UNC','ILL','SMC','HOU','ARIZ','USU','WIS','ARK','TEX','GONZ','MIA','PUR','MICH','SLU','AKR','HOF','TENN','UVA','UK','ISU','DUKE','SJU','MSU','CONN','IOWA','NEB','UNC','HOU','ARIZ','ARK','GONZ','PUR','MICH','AKR','TENN','ISU','SJU','MSU','NEB','HOU','ARIZ','PUR','MICH','ISU','MSU','HOU','ARIZ','ISU','HOU','ARIZ','ARIZ']
    },
    {
        name: 'Ben',
        espn: "Bfandrade42's Picks 1",
        bracketId: '16c5a090-2229-11f1-b1fc-7f66c33ee0aa',
        picks: ['DUKE','OSU','SJU','KU','USF','MSU','UCF','CONN','FLA','IOWA','MCN','NEB','UNC','ILL','SMC','HOU','ARIZ','USU','WIS','ARK','BYU','GONZ','MIA','PUR','MICH','UGA','AKR','ALA','TENN','UVA','UK','ISU','DUKE','SJU','MSU','CONN','FLA','NEB','ILL','HOU','ARIZ','ARK','BYU','PUR','MICH','ALA','UVA','ISU','DUKE','MSU','FLA','HOU','ARIZ','PUR','MICH','UVA','DUKE','HOU','ARIZ','MICH','DUKE','MICH','MICH']
    },
    {
        name: 'Ethan',
        espn: "Baer241's Picks 1",
        bracketId: '2bfbd660-2395-11f1-9819-a38692af12ac',
        picks: ['DUKE','OSU','SJU','KU','USF','MSU','UCLA','CONN','FLA','CLEM','VAN','NEB','UNC','ILL','SMC','HOU','ARIZ','VILL','WIS','ARK','BYU','GONZ','MIZ','PUR','MICH','UGA','TTU','ALA','TENN','UVA','UK','ISU','DUKE','KU','MSU','CONN','FLA','VAN','ILL','HOU','ARIZ','WIS','GONZ','PUR','MICH','ALA','TENN','ISU','DUKE','CONN','FLA','HOU','ARIZ','GONZ','MICH','ISU','DUKE','FLA','ARIZ','ISU','FLA','ARIZ','FLA']
    },
    {
        name: 'Joel',
        espn: "espn25427822's Picks 1",
        bracketId: 'ed3ee560-2192-11f1-b55e-3315635bfaed',
        picks: ['DUKE','OSU','SJU','KU','LOU','MSU','UCF','CONN','FLA','IOWA','VAN','NEB','UNC','ILL','TA&M','HOU','ARIZ','USU','WIS','ARK','BYU','GONZ','MIZ','PUR','MICH','UGA','TTU','ALA','TENN','UVA','SCU','ISU','DUKE','SJU','MSU','CONN','FLA','VAN','UNC','HOU','ARIZ','WIS','GONZ','PUR','MICH','TTU','TENN','ISU','DUKE','CONN','FLA','UNC','ARIZ','GONZ','MICH','TENN','CONN','FLA','ARIZ','MICH','CONN','ARIZ','ARIZ']
    },
    {
        name: 'Ian',
        espn: "Ian's Best Guess",
        bracketId: '1407f720-239d-11f1-b43f-cb0840db5db0',
        picks: ['DUKE','OSU','UNI','KU','LOU','MSU','UCLA','CONN','FLA','IOWA','VAN','NEB','UNC','ILL','TA&M','HOU','ARIZ','VILL','WIS','ARK','TEX','GONZ','MIA','PUR','MICH','UGA','TTU','ALA','TENN','UVA','UK','ISU','DUKE','KU','MSU','CONN','FLA','NEB','UNC','TA&M','ARIZ','ARK','GONZ','PUR','MICH','ALA','TENN','ISU','KU','CONN','FLA','UNC','ARIZ','GONZ','ALA','ISU','CONN','FLA','GONZ','ALA','CONN','ALA','CONN']
    },
    {
        name: 'Cimino',
        espn: 'Josephine Cimino',
        bracketId: '86666660-2336-11f1-8f49-418c4dea58ce',
        picks: ['DUKE','OSU','SJU','KU','LOU','MSU','UCLA','CONN','FLA','CLEM','VAN','NEB','UNC','ILL','SMC','HOU','ARIZ','VILL','WIS','ARK','TEX','GONZ','MIA','PUR','MICH','UGA','TTU','ALA','TENN','UVA','UK','ISU','DUKE','KU','LOU','UCLA','FLA','NEB','UNC','HOU','ARIZ','ARK','GONZ','PUR','MICH','ALA','UVA','ISU','DUKE','LOU','FLA','HOU','ARIZ','PUR','MICH','UVA','DUKE','FLA','ARIZ','MICH','DUKE','MICH','MICH']
    },
    {
        name: 'Kimmel',
        espn: "kimmel220's Picks 1",
        bracketId: '582faa60-2221-11f1-8c33-d1a52be5ee24',
        picks: ['DUKE','OSU','SJU','KU','USF','MSU','UCF','CONN','FLA','IOWA','MCN','NEB','VCU','ILL','SMC','HOU','ARIZ','VILL','WIS','ARK','BYU','GONZ','MIA','PUR','MICH','UGA','AKR','HOF','TENN','UVA','UK','ISU','DUKE','SJU','MSU','CONN','FLA','NEB','VCU','HOU','ARIZ','ARK','GONZ','MIA','UGA','AKR','TENN','ISU','DUKE','CONN','FLA','HOU','ARIZ','GONZ','UGA','ISU','DUKE','FLA','ARIZ','UGA','FLA','ARIZ','FLA']
    },
    {
        name: 'Vic',
        espn: "ESPNFAN6627558668's Picks 1",
        bracketId: '7501e530-238f-11f1-94d4-6992ba69a1c4',
        picks: ['DUKE','OSU','SJU','KU','USF','MSU','UCLA','CONN','FLA','CLEM','MCN','NEB','VCU','ILL','TA&M','HOU','ARIZ','VILL','WIS','HAW','BYU','GONZ','MIZ','PUR','MICH','UGA','AKR','ALA','TENN','UVA','SCU','ISU','DUKE','SJU','USF','UCLA','CLEM','MCN','VCU','HOU','ARIZ','WIS','GONZ','PUR','MICH','ALA','TENN','ISU','DUKE','UCLA','CLEM','HOU','ARIZ','GONZ','MICH','TENN','DUKE','HOU','ARIZ','MICH','DUKE','ARIZ','DUKE']
    }
];
