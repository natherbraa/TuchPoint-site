// التطبيق الرئيسي للعبة "برا السالفة"
const screens = {
    welcome: document.getElementById('welcome'),
    playerSetup: document.getElementById('playerSetup'),
    pack: document.getElementById('packScreen'),
    role: document.getElementById('roleScreen'),
    discussion: document.getElementById('discussionScreen'),
    voting: document.getElementById('votingScreen'),
    results: document.getElementById('resultsScreen')
};

let players = [];
let currentPack = null;
let outsiderId = null;
let secretWord = '';
let votes = [];
let voteIndex = 0;

function showScreen(name) {
    Object.values(screens).forEach(s => s.hidden = true);
    screens[name].hidden = false;
}

// شاشة الترحيب
document.getElementById('startBtn').addEventListener('click', () => {
    showScreen('playerSetup');
});

// إضافة اللاعبين
const playerNameInput = document.getElementById('playerName');
const addPlayerBtn = document.getElementById('addPlayerBtn');
const playersList = document.getElementById('playersList');
const nextToPackBtn = document.getElementById('nextToPack');
const playerWarning = document.getElementById('playerWarning');

addPlayerBtn.addEventListener('click', () => {
    const name = playerNameInput.value.trim();
    if (!name) return;
    const player = { id: Date.now().toString(), name, score: 0 };
    players.push(player);
    const li = document.createElement('li');
    li.textContent = name;
    playersList.appendChild(li);
    playerNameInput.value = '';
    updateNextButton();
});

function updateNextButton() {
    if (players.length >= 3) {
        nextToPackBtn.disabled = false;
        playerWarning.hidden = true;
    } else {
        nextToPackBtn.disabled = true;
        playerWarning.hidden = false;
    }
}

nextToPackBtn.addEventListener('click', () => {
    loadPacks();
    showScreen('pack');
});

// تحميل الباقات
async function loadPacks() {
    const container = document.getElementById('packsContainer');
    container.innerHTML = '';
    const res = await fetch('packs/basic.json');
    const pack = await res.json();
    currentPack = pack; // لدينا باقة واحدة فقط حالياً
    const btn = document.createElement('button');
    btn.textContent = pack.name + ' (' + pack.words.length + ')';
    btn.addEventListener('click', () => {
        document.querySelectorAll('#packsContainer button').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        document.getElementById('startRoundBtn').disabled = false;
    });
    container.appendChild(btn);
}

document.getElementById('startRoundBtn').addEventListener('click', () => {
    outsiderId = GameLogic.chooseOutsider(players);
    secretWord = GameLogic.chooseWord(currentPack, 'easy');
    currentPlayerIndex = 0;
    showScreen('role');
});

// توزيع الأدوار
let currentPlayerIndex = 0;
const showRoleBtn = document.getElementById('showRoleBtn');
const roleCard = document.getElementById('roleCard');
const roleText = document.getElementById('roleText');
const hideRoleBtn = document.getElementById('hideRoleBtn');

showRoleBtn.addEventListener('click', () => {
    if (currentPlayerIndex >= players.length) {
        showScreen('discussion');
        return;
    }
    const player = players[currentPlayerIndex];
    if (player.id === outsiderId) {
        roleText.textContent = 'أنت برا السالفة — تمثّل بهدوء';
    } else {
        roleText.textContent = 'كلمتكم: ' + secretWord + '\nلا تُرِها للآخرين';
    }
    roleCard.hidden = false;
});

hideRoleBtn.addEventListener('click', () => {
    roleCard.hidden = true;
    currentPlayerIndex++;
    if (currentPlayerIndex < players.length) {
        roleText.textContent = '';
    } else {
        showRoleBtn.textContent = 'ابدأ النقاش';
    }
});

showRoleBtn.addEventListener('click', () => {
    if (currentPlayerIndex >= players.length) {
        showScreen('discussion');
    }
});

// النقاش
const toVotingBtn = document.getElementById('toVotingBtn');
toVotingBtn.addEventListener('click', () => {
    prepareVoting();
    showScreen('voting');
});

// التصويت
function prepareVoting() {
    votes = [];
    voteIndex = 0;
    const container = document.getElementById('votingPlayers');
    container.innerHTML = '';
    players.forEach(p => {
        const btn = document.createElement('button');
        btn.textContent = p.name;
        btn.addEventListener('click', () => handleVote(p.id));
        container.appendChild(btn);
    });
}

function handleVote(suspectId) {
    const voter = players[voteIndex];
    votes.push({ voterId: voter.id, suspectId });
    voteIndex++;
    if (voteIndex >= players.length) {
        document.getElementById('finishVotingBtn').disabled = false;
        document.getElementById('votingPlayers').querySelectorAll('button').forEach(b => b.disabled = true);
    }
}

document.getElementById('finishVotingBtn').addEventListener('click', () => {
    const result = GameLogic.computeVotes(votes, players.length);
    let roundResult;
    if (result.hasMajority && result.winnerId === outsiderId) {
        roundResult = 'team_won';
        document.getElementById('winnerText').textContent = 'الفريق فاز وكشف برا السالفة!';
    } else {
        roundResult = 'outsider_survived';
        const outsiderName = players.find(p => p.id === outsiderId).name;
        document.getElementById('winnerText').textContent = 'برا السالفة نجا: ' + outsiderName;
    }
    const round = { outsiderId, result: roundResult, players: players.map(p => p.id) };
    const playersMap = Object.fromEntries(players.map(p => [p.id, p]));
    GameLogic.allocatePoints(round, playersMap);
    showScreen('results');
});

// النتائج
const newRoundBtn = document.getElementById('newRoundBtn');
newRoundBtn.addEventListener('click', () => {
    showScreen('pack');
});

document.getElementById('backHomeBtn').addEventListener('click', () => {
    showScreen('welcome');
});
