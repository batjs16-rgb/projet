function formatMoney(n) {
    return '$' + Number(n).toLocaleString('en-US');
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function cooldownCheck(lastTime, cooldownMs) {
    if (!lastTime) return { ready: true, remaining: 0 };
    const elapsed = Date.now() - lastTime;
    if (elapsed >= cooldownMs) return { ready: true, remaining: 0 };
    return { ready: false, remaining: cooldownMs - elapsed };
}

function formatTime(ms) {
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    const parts = [];
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    if (sec > 0 || parts.length === 0) parts.push(`${sec}s`);
    return parts.join(' ');
}

function progressBar(current, max, length = 10) {
    const filled = Math.round((current / max) * length);
    return '█'.repeat(filled) + '░'.repeat(length - filled);
}

module.exports = { formatMoney, randomInt, randomChoice, cooldownCheck, formatTime, progressBar };
