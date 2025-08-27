const assert = require('assert');
const { chooseOutsider, chooseWord, computeVotes, allocatePoints } = require('./gameLogic');

// اختبار اختيار برا السالفة
testChooseOutsider();
// اختبار اختيار كلمة
testChooseWord();
// اختبار حساب الأصوات
testComputeVotes();
// اختبار توزيع النقاط
testAllocatePoints();

console.log('جميع الاختبارات نجحت');

function testChooseOutsider() {
    const players = [{id:'1'},{id:'2'},{id:'3'}];
    const id = chooseOutsider(players);
    assert(players.some(p => p.id === id), 'المعرف المختار يجب أن يكون من اللاعبين');
}

function testChooseWord() {
    const pack = { words: ['أ', 'ب', 'ج'] };
    const w = chooseWord(pack, 'easy');
    assert(pack.words.includes(w), 'الكلمة يجب أن تكون من الباقة');
}

function testComputeVotes() {
    const votes = [
        {voterId:'1', suspectId:'2'},
        {voterId:'2', suspectId:'2'},
        {voterId:'3', suspectId:'1'}
    ];
    const res = computeVotes(votes, 3);
    assert(res.winnerId === '2', 'المشتبه به يجب أن يكون 2');
    assert(res.hasMajority === true, 'يجب تحقيق الأغلبية');
}

function testAllocatePoints() {
    const round = { outsiderId:'1', result:'team_won', players:['1','2','3'] };
    const players = { '1': {score:0}, '2':{score:0}, '3':{score:0} };
    allocatePoints(round, players);
    assert(players['2'].score === 1 && players['3'].score === 1, 'اللاعبون العاديون يجب أن يحصلوا على نقطة');
    assert(players['1'].score === 0, 'برا السالفة لا يحصل على نقاط عند خسارته');
}
