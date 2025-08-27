// دوال منطق اللعبة الأساسية
function chooseOutsider(players) {
    const idx = Math.floor(Math.random() * players.length);
    return players[idx].id;
}

function chooseWord(pack, difficulty) {
    const words = pack.words;
    return words[Math.floor(Math.random() * words.length)];
}

function computeVotes(votes, playersCount) {
    const tally = {};
    votes.forEach(v => {
        tally[v.suspectId] = (tally[v.suspectId] || 0) + 1;
    });
    let winnerId = null, max = 0;
    for (const id in tally) {
        if (tally[id] > max) {
            max = tally[id];
            winnerId = id;
        }
    }
    const majorityNeeded = Math.floor(playersCount / 2) + 1;
    const hasMajority = max >= majorityNeeded;
    return { winnerId, votesCount: max, hasMajority, tally };
}

function allocatePoints(round, playersMap) {
    if (round.result === 'outsider_survived') {
        playersMap[round.outsiderId].score += 2;
    } else if (round.result === 'outsider_guessed_correctly') {
        playersMap[round.outsiderId].score += 3;
    } else if (round.result === 'team_won') {
        round.players.forEach(id => {
            if (id !== round.outsiderId) playersMap[id].score += 1;
        });
    }
}

const GameLogic = { chooseOutsider, chooseWord, computeVotes, allocatePoints };
if (typeof window !== 'undefined') window.GameLogic = GameLogic;
if (typeof module !== 'undefined') module.exports = GameLogic;
