const { getUser, setUser, getAllUsers } = require('../utils/storage');
const { formatMoney, randomInt, randomChoice, cooldownCheck, formatTime } = require('../utils/format');

const STOCKS = {
    AAPL: { name: 'Apple', price: 150, volatility: 0.08 },
    TSLA: { name: 'Tesla', price: 200, volatility: 0.15 },
    GOOG: { name: 'Google', price: 120, volatility: 0.06 },
    AMZN: { name: 'Amazon', price: 180, volatility: 0.10 },
    META: { name: 'Meta', price: 90, volatility: 0.12 },
};

const CRYPTO = {
    BTC: { name: 'Bitcoin', price: 45000, volatility: 0.20 },
    ETH: { name: 'Ethereum', price: 3000, volatility: 0.18 },
    SOL: { name: 'Solana', price: 100, volatility: 0.25 },
    DOGE: { name: 'Dogecoin', price: 0.15, volatility: 0.30 },
};

const BONDS = {
    GOV5: { name: '5Y Government Bond', price: 1000, rate: 0.04, term: 5 },
    GOV10: { name: '10Y Government Bond', price: 5000, rate: 0.06, term: 10 },
    CORP: { name: 'Corporate Bond', price: 2000, rate: 0.08, term: 3 },
};

const BUSINESSES = {
    lemonade: { name: 'Lemonade Stand', price: 1000, income: 50, emoji: '🍋' },
    cafe: { name: 'Cafe', price: 5000, income: 200, emoji: '☕' },
    restaurant: { name: 'Restaurant', price: 20000, income: 800, emoji: '🍽️' },
    techstartup: { name: 'Tech Startup', price: 50000, income: 2500, emoji: '💻' },
    casino: { name: 'Casino', price: 100000, income: 6000, emoji: '🎰' },
    airline: { name: 'Airline', price: 500000, income: 25000, emoji: '✈️' },
};

const PROPERTIES = {
    apartment: { name: 'Apartment', price: 10000, rent: 300, emoji: '🏢' },
    house: { name: 'House', price: 30000, rent: 800, emoji: '🏠' },
    mansion: { name: 'Mansion', price: 100000, rent: 3000, emoji: '🏰' },
    penthouse: { name: 'Penthouse', price: 200000, rent: 7000, emoji: '🌆' },
    island: { name: 'Private Island', price: 1000000, rent: 30000, emoji: '🏝️' },
};

const CARS = {
    sedan: { name: 'Sedan', price: 5000, emoji: '🚗' },
    suv: { name: 'SUV', price: 15000, emoji: '🚙' },
    sports: { name: 'Sports Car', price: 50000, emoji: '🏎️' },
    lambo: { name: 'Lamborghini', price: 200000, emoji: '🏎️' },
    jet: { name: 'Private Jet', price: 1000000, emoji: '✈️' },
    yacht: { name: 'Super Yacht', price: 2000000, emoji: '🛥️' },
};

const LUXURY = {
    watch: { name: 'Rolex Watch', price: 25000, emoji: '⌚' },
    diamond: { name: 'Diamond Ring', price: 50000, emoji: '💎' },
    art: { name: 'Rare Painting', price: 100000, emoji: '🖼️' },
    crown: { name: 'Golden Crown', price: 500000, emoji: '👑' },
};

const INSURANCE = {
    basic: { name: 'Basic Insurance', price: 500, coverage: 0.5, emoji: '🛡️' },
    premium: { name: 'Premium Insurance', price: 2000, coverage: 0.8, emoji: '🛡️' },
    platinum: { name: 'Platinum Insurance', price: 10000, coverage: 1.0, emoji: '🛡️' },
};

const SHOP_ITEMS = {
    xp_boost: { name: 'XP Boost (2x)', price: 2000, emoji: '⚡' },
    lucky_charm: { name: 'Lucky Charm', price: 3000, emoji: '🍀' },
    shield: { name: 'Rob Shield (24h)', price: 5000, emoji: '🛡️' },
};

const JOBS = [
    { name: 'Janitor', pay: [50, 150], emoji: '🧹' },
    { name: 'Delivery Driver', pay: [100, 300], emoji: '🚚' },
    { name: 'Programmer', pay: [200, 600], emoji: '💻' },
    { name: 'Doctor', pay: [300, 800], emoji: '🏥' },
    { name: 'Lawyer', pay: [250, 700], emoji: '⚖️' },
    { name: 'Streamer', pay: [50, 1000], emoji: '📺' },
    { name: 'Chef', pay: [150, 400], emoji: '👨‍🍳' },
];

function defaultBank() {
    return {
        wallet: 1000,
        bank: 0,
        vault: 0,
        loan: 0,
        loanDue: 0,
        creditScore: 500,
        premium: false,
        premiumExpiry: 0,
        stocks: {},
        crypto: {},
        bonds: {},
        businesses: {},
        properties: {},
        cars: [],
        luxury: [],
        insurance: null,
        history: [],
        cooldowns: {},
        stats: { totalEarned: 0, totalSpent: 0, totalGambled: 0, gamesWon: 0, gamesLost: 0, robSuccess: 0, robFail: 0 },
        achievements: [],
        dailyStreak: 0,
        lastDaily: 0,
    };
}

function addHistory(u, entry) {
    u.history.unshift({ ...entry, time: Date.now() });
    if (u.history.length > 20) u.history.pop();
}

function getMarketPrice(base, volatility) {
    const change = 1 + (Math.random() - 0.5) * 2 * volatility;
    return Math.max(base * 0.2, Math.round(base * change * 100) / 100);
}

function checkBankAchievements(u) {
    const newAch = [];
    const has = (id) => u.achievements.includes(id);
    if (!has('first_deposit') && u.bank > 0) { u.achievements.push('first_deposit'); newAch.push('🏦 First Deposit'); u.wallet += 200; }
    if (!has('millionaire') && (u.wallet + u.bank + u.vault) >= 1000000) { u.achievements.push('millionaire'); newAch.push('💎 Millionaire'); u.wallet += 50000; }
    if (!has('investor') && Object.keys(u.stocks).length > 0) { u.achievements.push('investor'); newAch.push('📈 First Investment'); u.wallet += 500; }
    if (!has('gambler') && u.stats.totalGambled >= 10000) { u.achievements.push('gambler'); newAch.push('🎰 High Roller'); u.wallet += 2000; }
    if (!has('business_owner') && Object.keys(u.businesses).length > 0) { u.achievements.push('business_owner'); newAch.push('🏢 Business Owner'); u.wallet += 1000; }
    if (!has('homeowner') && Object.keys(u.properties).length > 0) { u.achievements.push('homeowner'); newAch.push('🏠 Homeowner'); u.wallet += 1000; }
    if (!has('streak7') && u.dailyStreak >= 7) { u.achievements.push('streak7'); newAch.push('🔥 7-Day Streak'); u.wallet += 5000; }
    return newAch;
}

module.exports = {
    name: 'bank',
    category: 'Game',
    description: 'Complete Banking & Economy System',
    execute(api, event, { args }) {
        const uid = event.senderID;
        let u = getUser('bank', uid) || defaultBank();
        const sub = (args[1] || '').toLowerCase();
        const arg2 = (args[2] || '').toLowerCase();
        const arg3 = (args[3] || '').toLowerCase();
        const amount = parseInt(args[2]) || parseInt(args[3]) || 0;

        const isPremium = u.premium && u.premiumExpiry > Date.now();
        const multiplier = isPremium ? 2 : 1;

        // === BASIC BANKING ===
        if (sub === 'balance' || sub === 'bal' || !sub) {
            const total = u.wallet + u.bank + u.vault;
            const msg =
                `╭───〔 🏦 BANK ACCOUNT 〕───⬣\n` +
                `│ 💵 *Wallet*: ${formatMoney(u.wallet)}\n` +
                `│ 🏦 *Bank*: ${formatMoney(u.bank)}\n` +
                `│ 🔐 *Vault*: ${formatMoney(u.vault)}\n` +
                `│ 📊 *Total*: ${formatMoney(total)}\n` +
                `│ 💳 *Loan*: ${formatMoney(u.loan)}\n` +
                `│ 📊 *Credit*: ${u.creditScore}/1000\n` +
                `│ ${isPremium ? '💎 *Premium*: Active' : '⭐ *Premium*: Inactive'}\n` +
                `╰──────────────⬣`;
            return api.sendMessage(msg, event.threadID);
        }

        if (sub === 'deposit' || sub === 'dep') {
            if (amount <= 0) return api.sendMessage('❌ Usage: bank deposit <amount>', event.threadID);
            if (amount > u.wallet) return api.sendMessage(`❌ Not enough! Wallet: ${formatMoney(u.wallet)}`, event.threadID);
            u.wallet -= amount;
            u.bank += amount;
            addHistory(u, { type: 'deposit', amount });
            const ach = checkBankAchievements(u);
            setUser('bank', uid, u);
            let msg = `✅ Deposited ${formatMoney(amount)}\n🏦 Bank: ${formatMoney(u.bank)}`;
            if (ach.length) msg += `\n\n🏆 *Achievement!* ${ach.join(', ')}`;
            return api.sendMessage(msg, event.threadID);
        }

        if (sub === 'withdraw' || sub === 'wd') {
            if (amount <= 0) return api.sendMessage('❌ Usage: bank withdraw <amount>', event.threadID);
            if (amount > u.bank) return api.sendMessage(`❌ Not enough! Bank: ${formatMoney(u.bank)}`, event.threadID);
            u.bank -= amount;
            u.wallet += amount;
            addHistory(u, { type: 'withdraw', amount });
            setUser('bank', uid, u);
            return api.sendMessage(`✅ Withdrew ${formatMoney(amount)}\n💵 Wallet: ${formatMoney(u.wallet)}`, event.threadID);
        }

        if (sub === 'transfer' || sub === 'send') {
            const mentions = event.mentions ? Object.keys(event.mentions) : [];
            const targetID = mentions[0];
            const txAmount = parseInt(args[3]) || parseInt(args[2]) || 0;
            if (!targetID || txAmount <= 0) return api.sendMessage('❌ Usage: bank transfer @user <amount>', event.threadID);
            if (txAmount > u.wallet) return api.sendMessage(`❌ Not enough! Wallet: ${formatMoney(u.wallet)}`, event.threadID);
            let target = getUser('bank', targetID) || defaultBank();
            u.wallet -= txAmount;
            target.wallet += txAmount;
            addHistory(u, { type: 'sent', amount: txAmount, to: targetID });
            addHistory(target, { type: 'received', amount: txAmount, from: uid });
            u.creditScore = Math.min(1000, u.creditScore + 2);
            setUser('bank', uid, u);
            setUser('bank', targetID, target);
            return api.sendMessage(`✅ Sent ${formatMoney(txAmount)} to @${targetID}!\n💵 Wallet: ${formatMoney(u.wallet)}`, event.threadID);
        }

        if (sub === 'loan') {
            if (u.loan > 0) return api.sendMessage(`❌ You already have a loan of ${formatMoney(u.loan)}! Repay first.`, event.threadID);
            const maxLoan = u.creditScore * 20;
            if (amount <= 0) return api.sendMessage(`💳 Max loan: ${formatMoney(maxLoan)} (Credit: ${u.creditScore})\nUsage: bank loan <amount>`, event.threadID);
            if (amount > maxLoan) return api.sendMessage(`❌ Max loan: ${formatMoney(maxLoan)}`, event.threadID);
            u.wallet += amount;
            u.loan = Math.floor(amount * 1.15);
            u.loanDue = Date.now() + 7 * 24 * 60 * 60 * 1000;
            addHistory(u, { type: 'loan', amount });
            setUser('bank', uid, u);
            return api.sendMessage(`💳 Loan approved: ${formatMoney(amount)}\n💰 To repay: ${formatMoney(u.loan)} (15% interest)\n⏰ Due: 7 days`, event.threadID);
        }

        if (sub === 'repay') {
            if (u.loan <= 0) return api.sendMessage('❌ No active loan!', event.threadID);
            const repayAmount = amount > 0 ? Math.min(amount, u.loan) : u.loan;
            if (repayAmount > u.wallet) return api.sendMessage(`❌ Not enough! Wallet: ${formatMoney(u.wallet)}`, event.threadID);
            u.wallet -= repayAmount;
            u.loan -= repayAmount;
            u.creditScore = Math.min(1000, u.creditScore + 10);
            addHistory(u, { type: 'repay', amount: repayAmount });
            setUser('bank', uid, u);
            return api.sendMessage(`✅ Repaid ${formatMoney(repayAmount)}\n💳 Remaining: ${formatMoney(u.loan)}\n📊 Credit: ${u.creditScore}`, event.threadID);
        }

        if (sub === 'history') {
            if (!u.history.length) return api.sendMessage('📋 No transaction history.', event.threadID);
            let msg = `╭───〔 📋 HISTORY 〕───⬣\n`;
            for (const h of u.history.slice(0, 10)) {
                const time = new Date(h.time).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' });
                msg += `│ ${h.type.toUpperCase()} — ${formatMoney(h.amount)} — ${time}\n`;
            }
            msg += `╰──────────────⬣`;
            return api.sendMessage(msg, event.threadID);
        }

        if (sub === 'daily') {
            const cd = cooldownCheck(u.cooldowns.daily, 24 * 60 * 60 * 1000);
            if (!cd.ready) return api.sendMessage(`⏳ Daily cooldown: ${formatTime(cd.remaining)}`, event.threadID);
            u.cooldowns.daily = Date.now();
            const lastDay = new Date(u.lastDaily).toDateString();
            const today = new Date().toDateString();
            const yesterday = new Date(Date.now() - 86400000).toDateString();
            if (lastDay === yesterday) u.dailyStreak++;
            else if (lastDay !== today) u.dailyStreak = 1;
            u.lastDaily = Date.now();
            const base = randomInt(500, 1500);
            const streakBonus = u.dailyStreak * 100;
            const reward = (base + streakBonus) * multiplier;
            u.wallet += reward;
            u.stats.totalEarned += reward;
            addHistory(u, { type: 'daily', amount: reward });
            const ach = checkBankAchievements(u);
            setUser('bank', uid, u);
            let msg = `🎁 *Daily Reward!*\n\n💰 +${formatMoney(reward)}\n🔥 Streak: ${u.dailyStreak} days (+${formatMoney(streakBonus)} bonus)\n${isPremium ? '💎 2x Premium bonus!' : ''}\n💵 Wallet: ${formatMoney(u.wallet)}`;
            if (ach.length) msg += `\n\n🏆 ${ach.join(', ')}`;
            return api.sendMessage(msg, event.threadID);
        }

        if (sub === 'work') {
            const cd = cooldownCheck(u.cooldowns.work, 30 * 60 * 1000);
            if (!cd.ready) return api.sendMessage(`⏳ Work cooldown: ${formatTime(cd.remaining)}`, event.threadID);
            u.cooldowns.work = Date.now();
            const job = randomChoice(JOBS);
            const pay = randomInt(job.pay[0], job.pay[1]) * multiplier;
            u.wallet += pay;
            u.stats.totalEarned += pay;
            addHistory(u, { type: 'work', amount: pay });
            setUser('bank', uid, u);
            return api.sendMessage(`${job.emoji} You worked as a *${job.name}*!\n💰 +${formatMoney(pay)}\n💵 Wallet: ${formatMoney(u.wallet)}`, event.threadID);
        }

        // === INVESTMENTS ===
        if (sub === 'stocks') {
            if (arg2 === 'list' || !arg2) {
                let msg = `╭───〔 📊 STOCK MARKET 〕───⬣\n`;
                for (const [sym, s] of Object.entries(STOCKS)) {
                    const price = getMarketPrice(s.price, s.volatility);
                    const owned = u.stocks[sym] || 0;
                    msg += `│ 📈 *${sym}* (${s.name}) — ${formatMoney(price)} ${owned > 0 ? `[Own: ${owned}]` : ''}\n`;
                }
                msg += `╰──────────────⬣\n💡 bank stocks buy/sell <symbol> <qty>`;
                return api.sendMessage(msg, event.threadID);
            }
            if (arg2 === 'buy') {
                const sym = (args[3] || '').toUpperCase();
                const qty = parseInt(args[4]) || 1;
                const stock = STOCKS[sym];
                if (!stock) return api.sendMessage('❌ Unknown stock. Use: bank stocks list', event.threadID);
                const price = getMarketPrice(stock.price, stock.volatility);
                const cost = Math.round(price * qty);
                if (cost > u.wallet) return api.sendMessage(`❌ Need ${formatMoney(cost)}, have ${formatMoney(u.wallet)}`, event.threadID);
                u.wallet -= cost;
                u.stocks[sym] = (u.stocks[sym] || 0) + qty;
                u.stats.totalSpent += cost;
                addHistory(u, { type: 'buy_stock', amount: cost });
                const ach = checkBankAchievements(u);
                setUser('bank', uid, u);
                let msg = `✅ Bought ${qty}x *${sym}* at ${formatMoney(price)} each\n💰 Total: ${formatMoney(cost)}`;
                if (ach.length) msg += `\n🏆 ${ach.join(', ')}`;
                return api.sendMessage(msg, event.threadID);
            }
            if (arg2 === 'sell') {
                const sym = (args[3] || '').toUpperCase();
                const qty = parseInt(args[4]) || 1;
                if (!u.stocks[sym] || u.stocks[sym] < qty) return api.sendMessage('❌ You don\'t own enough of that stock!', event.threadID);
                const stock = STOCKS[sym];
                const price = getMarketPrice(stock.price, stock.volatility);
                const revenue = Math.round(price * qty);
                u.stocks[sym] -= qty;
                if (u.stocks[sym] <= 0) delete u.stocks[sym];
                u.wallet += revenue;
                u.stats.totalEarned += revenue;
                addHistory(u, { type: 'sell_stock', amount: revenue });
                setUser('bank', uid, u);
                return api.sendMessage(`✅ Sold ${qty}x *${sym}* at ${formatMoney(price)} each\n💰 Revenue: ${formatMoney(revenue)}`, event.threadID);
            }
        }

        if (sub === 'crypto') {
            if (arg2 === 'list' || !arg2) {
                let msg = `╭───〔 ₿ CRYPTO MARKET 〕───⬣\n`;
                for (const [sym, c] of Object.entries(CRYPTO)) {
                    const price = getMarketPrice(c.price, c.volatility);
                    const owned = u.crypto[sym] || 0;
                    msg += `│ ₿ *${sym}* (${c.name}) — ${formatMoney(price)} ${owned > 0 ? `[Own: ${owned}]` : ''}\n`;
                }
                msg += `╰──────────────⬣\n💡 bank crypto buy/sell <symbol> <qty>`;
                return api.sendMessage(msg, event.threadID);
            }
            if (arg2 === 'buy') {
                const sym = (args[3] || '').toUpperCase();
                const qty = parseInt(args[4]) || 1;
                const coin = CRYPTO[sym];
                if (!coin) return api.sendMessage('❌ Unknown crypto. Use: bank crypto list', event.threadID);
                const price = getMarketPrice(coin.price, coin.volatility);
                const cost = Math.round(price * qty);
                if (cost > u.wallet) return api.sendMessage(`❌ Need ${formatMoney(cost)}`, event.threadID);
                u.wallet -= cost;
                u.crypto[sym] = (u.crypto[sym] || 0) + qty;
                addHistory(u, { type: 'buy_crypto', amount: cost });
                setUser('bank', uid, u);
                return api.sendMessage(`✅ Bought ${qty}x *${sym}* at ${formatMoney(price)} each\n💰 Total: ${formatMoney(cost)}`, event.threadID);
            }
            if (arg2 === 'sell') {
                const sym = (args[3] || '').toUpperCase();
                const qty = parseInt(args[4]) || 1;
                if (!u.crypto[sym] || u.crypto[sym] < qty) return api.sendMessage('❌ Not enough crypto!', event.threadID);
                const coin = CRYPTO[sym];
                const price = getMarketPrice(coin.price, coin.volatility);
                const revenue = Math.round(price * qty);
                u.crypto[sym] -= qty;
                if (u.crypto[sym] <= 0) delete u.crypto[sym];
                u.wallet += revenue;
                addHistory(u, { type: 'sell_crypto', amount: revenue });
                setUser('bank', uid, u);
                return api.sendMessage(`✅ Sold ${qty}x *${sym}* at ${formatMoney(price)}\n💰 Revenue: ${formatMoney(revenue)}`, event.threadID);
            }
        }

        if (sub === 'bonds') {
            if (arg2 === 'list' || !arg2) {
                let msg = `╭───〔 🏛️ BONDS 〕───⬣\n`;
                for (const [k, b] of Object.entries(BONDS)) {
                    const owned = u.bonds[k] || 0;
                    msg += `│ 📄 *${b.name}* — ${formatMoney(b.price)} | ${(b.rate * 100).toFixed(0)}% return ${owned > 0 ? `[Own: ${owned}]` : ''}\n`;
                }
                msg += `╰──────────────⬣\n💡 bank bonds buy/sell <name> <qty>`;
                return api.sendMessage(msg, event.threadID);
            }
            if (arg2 === 'buy') {
                const bondKey = arg3;
                const qty = parseInt(args[4]) || 1;
                const bond = BONDS[bondKey.toUpperCase()];
                if (!bond) return api.sendMessage('❌ Unknown bond. Use: bank bonds list', event.threadID);
                const cost = bond.price * qty;
                if (cost > u.wallet) return api.sendMessage(`❌ Need ${formatMoney(cost)}`, event.threadID);
                u.wallet -= cost;
                u.bonds[bondKey.toUpperCase()] = (u.bonds[bondKey.toUpperCase()] || 0) + qty;
                setUser('bank', uid, u);
                return api.sendMessage(`✅ Bought ${qty}x *${bond.name}*\n💰 Cost: ${formatMoney(cost)}`, event.threadID);
            }
            if (arg2 === 'sell') {
                const bondKey = (args[3] || '').toUpperCase();
                const qty = parseInt(args[4]) || 1;
                if (!u.bonds[bondKey] || u.bonds[bondKey] < qty) return api.sendMessage('❌ Not enough bonds!', event.threadID);
                const bond = BONDS[bondKey];
                const revenue = Math.round(bond.price * (1 + bond.rate) * qty);
                u.bonds[bondKey] -= qty;
                if (u.bonds[bondKey] <= 0) delete u.bonds[bondKey];
                u.wallet += revenue;
                setUser('bank', uid, u);
                return api.sendMessage(`✅ Sold ${qty}x *${bond.name}*\n💰 Revenue: ${formatMoney(revenue)} (incl. ${(bond.rate * 100).toFixed(0)}% return)`, event.threadID);
            }
        }

        if (sub === 'portfolio') {
            let total = 0;
            let msg = `╭───〔 📊 PORTFOLIO 〕───⬣\n`;
            for (const [sym, qty] of Object.entries(u.stocks)) {
                const price = getMarketPrice(STOCKS[sym].price, STOCKS[sym].volatility);
                const val = Math.round(price * qty);
                total += val;
                msg += `│ 📈 ${sym}: ${qty} shares (${formatMoney(val)})\n`;
            }
            for (const [sym, qty] of Object.entries(u.crypto)) {
                const price = getMarketPrice(CRYPTO[sym].price, CRYPTO[sym].volatility);
                const val = Math.round(price * qty);
                total += val;
                msg += `│ ₿ ${sym}: ${qty} coins (${formatMoney(val)})\n`;
            }
            for (const [k, qty] of Object.entries(u.bonds)) {
                const val = BONDS[k].price * qty;
                total += val;
                msg += `│ 📄 ${BONDS[k].name}: ${qty} (${formatMoney(val)})\n`;
            }
            if (total === 0) msg += `│ Empty portfolio!\n`;
            msg += `│\n│ 📊 *Total Value*: ${formatMoney(total)}\n╰──────────────⬣`;
            return api.sendMessage(msg, event.threadID);
        }

        if (sub === 'market') {
            let msg = `╭───〔 📈 LIVE MARKET 〕───⬣\n│ 📊 *STOCKS*\n`;
            for (const [sym, s] of Object.entries(STOCKS)) {
                const price = getMarketPrice(s.price, s.volatility);
                const change = ((price - s.price) / s.price * 100).toFixed(1);
                msg += `│ ${sym}: ${formatMoney(price)} (${change > 0 ? '+' : ''}${change}%)\n`;
            }
            msg += `│\n│ ₿ *CRYPTO*\n`;
            for (const [sym, c] of Object.entries(CRYPTO)) {
                const price = getMarketPrice(c.price, c.volatility);
                const change = ((price - c.price) / c.price * 100).toFixed(1);
                msg += `│ ${sym}: ${formatMoney(price)} (${change > 0 ? '+' : ''}${change}%)\n`;
            }
            msg += `╰──────────────⬣`;
            return api.sendMessage(msg, event.threadID);
        }

        if (sub === 'dividend') {
            let total = 0;
            for (const [sym, qty] of Object.entries(u.stocks)) {
                total += Math.round(STOCKS[sym].price * 0.02 * qty);
            }
            for (const [k, qty] of Object.entries(u.bonds)) {
                total += Math.round(BONDS[k].price * BONDS[k].rate * qty);
            }
            if (total <= 0) return api.sendMessage('❌ No investments to collect dividends from!', event.threadID);
            const cd = cooldownCheck(u.cooldowns.dividend, 24 * 60 * 60 * 1000);
            if (!cd.ready) return api.sendMessage(`⏳ Dividend cooldown: ${formatTime(cd.remaining)}`, event.threadID);
            u.cooldowns.dividend = Date.now();
            total = total * multiplier;
            u.wallet += total;
            u.stats.totalEarned += total;
            setUser('bank', uid, u);
            return api.sendMessage(`💰 *Dividends Collected!*\n\n💵 +${formatMoney(total)}\n${isPremium ? '💎 2x Premium!' : ''}`, event.threadID);
        }

        // === BUSINESS ===
        if (sub === 'business') {
            if (arg2 === 'list' || !arg2) {
                let msg = `╭───〔 🏢 BUSINESSES 〕───⬣\n`;
                for (const [k, b] of Object.entries(BUSINESSES)) {
                    const owned = u.businesses[k];
                    const lvl = owned ? ` [Lv.${owned.level}]` : '';
                    msg += `│ ${b.emoji} *${b.name}* — ${formatMoney(b.price)} | Income: ${formatMoney(b.income)}/collect${lvl}\n`;
                }
                msg += `╰──────────────⬣\n💡 bank business buy/upgrade <name>`;
                return api.sendMessage(msg, event.threadID);
            }
            if (arg2 === 'buy') {
                const biz = BUSINESSES[arg3];
                if (!biz) return api.sendMessage('❌ Unknown business!', event.threadID);
                if (u.businesses[arg3]) return api.sendMessage('❌ Already owned! Use: bank business upgrade', event.threadID);
                if (u.wallet < biz.price) return api.sendMessage(`❌ Need ${formatMoney(biz.price)}`, event.threadID);
                u.wallet -= biz.price;
                u.businesses[arg3] = { level: 1, lastCollect: 0 };
                const ach = checkBankAchievements(u);
                setUser('bank', uid, u);
                let msg = `✅ Bought ${biz.emoji} *${biz.name}*!`;
                if (ach.length) msg += `\n🏆 ${ach.join(', ')}`;
                return api.sendMessage(msg, event.threadID);
            }
            if (arg2 === 'upgrade') {
                const biz = BUSINESSES[arg3];
                if (!biz || !u.businesses[arg3]) return api.sendMessage('❌ You don\'t own that!', event.threadID);
                const cost = biz.price * u.businesses[arg3].level;
                if (u.wallet < cost) return api.sendMessage(`❌ Upgrade costs ${formatMoney(cost)}`, event.threadID);
                u.wallet -= cost;
                u.businesses[arg3].level++;
                setUser('bank', uid, u);
                return api.sendMessage(`⬆️ Upgraded *${biz.name}* to Lv.${u.businesses[arg3].level}!\n💰 Income: ${formatMoney(biz.income * u.businesses[arg3].level)}/collect`, event.threadID);
            }
        }

        if (sub === 'business_collect') {
            const owned = Object.entries(u.businesses);
            if (!owned.length) return api.sendMessage('❌ No businesses! Use: bank business buy', event.threadID);
            const cd = cooldownCheck(u.cooldowns.bizCollect, 5 * 60 * 60 * 1000);
            if (!cd.ready) return api.sendMessage(`⏳ Business cooldown: ${formatTime(cd.remaining)}`, event.threadID);
            u.cooldowns.bizCollect = Date.now();
            let total = 0;
            let msg = `╭───〔 🏢 BUSINESS INCOME 〕───⬣\n`;
            for (const [k, biz] of owned) {
                const base = BUSINESSES[k];
                const income = base.income * biz.level * multiplier;
                total += income;
                msg += `│ ${base.emoji} ${base.name} Lv.${biz.level}: +${formatMoney(income)}\n`;
            }
            u.wallet += total;
            u.stats.totalEarned += total;
            msg += `│\n│ 💰 *Total*: ${formatMoney(total)}\n╰──────────────⬣`;
            setUser('bank', uid, u);
            return api.sendMessage(msg, event.threadID);
        }

        // === PROPERTY ===
        if (sub === 'property' || sub === 'house') {
            const catalog = PROPERTIES;
            if (arg2 === 'list' || !arg2) {
                let msg = `╭───〔 🏠 REAL ESTATE 〕───⬣\n`;
                for (const [k, p] of Object.entries(catalog)) {
                    const owned = u.properties[k] ? ' ✅' : '';
                    msg += `│ ${p.emoji} *${p.name}* — ${formatMoney(p.price)} | Rent: ${formatMoney(p.rent)}/collect${owned}\n`;
                }
                msg += `╰──────────────⬣\n💡 bank property buy/sell <name>`;
                return api.sendMessage(msg, event.threadID);
            }
            if (arg2 === 'buy') {
                const prop = catalog[arg3];
                if (!prop) return api.sendMessage('❌ Unknown property!', event.threadID);
                if (u.properties[arg3]) return api.sendMessage('❌ Already owned!', event.threadID);
                if (u.wallet < prop.price) return api.sendMessage(`❌ Need ${formatMoney(prop.price)}`, event.threadID);
                u.wallet -= prop.price;
                u.properties[arg3] = { bought: Date.now() };
                const ach = checkBankAchievements(u);
                setUser('bank', uid, u);
                let msg = `✅ Bought ${prop.emoji} *${prop.name}*!`;
                if (ach.length) msg += `\n🏆 ${ach.join(', ')}`;
                return api.sendMessage(msg, event.threadID);
            }
            if (arg2 === 'sell') {
                if (!u.properties[arg3]) return api.sendMessage('❌ You don\'t own that!', event.threadID);
                const prop = catalog[arg3];
                const revenue = Math.floor(prop.price * 0.7);
                delete u.properties[arg3];
                u.wallet += revenue;
                setUser('bank', uid, u);
                return api.sendMessage(`✅ Sold ${prop.emoji} *${prop.name}* for ${formatMoney(revenue)}`, event.threadID);
            }
        }

        if (sub === 'rent') {
            const owned = Object.entries(u.properties);
            if (!owned.length) return api.sendMessage('❌ No properties!', event.threadID);
            const cd = cooldownCheck(u.cooldowns.rent, 12 * 60 * 60 * 1000);
            if (!cd.ready) return api.sendMessage(`⏳ Rent cooldown: ${formatTime(cd.remaining)}`, event.threadID);
            u.cooldowns.rent = Date.now();
            let total = 0;
            for (const [k] of owned) {
                total += PROPERTIES[k].rent * multiplier;
            }
            u.wallet += total;
            u.stats.totalEarned += total;
            setUser('bank', uid, u);
            return api.sendMessage(`💰 *Rent Collected!*\n💵 +${formatMoney(total)}\n${isPremium ? '💎 2x Premium!' : ''}`, event.threadID);
        }

        // === CARS & LUXURY ===
        if (sub === 'car') {
            if (arg2 === 'list' || !arg2) {
                let msg = `╭───〔 🚗 CAR DEALERSHIP 〕───⬣\n`;
                for (const [k, c] of Object.entries(CARS)) {
                    const owned = u.cars.includes(k) ? ' ✅' : '';
                    msg += `│ ${c.emoji} *${c.name}* — ${formatMoney(c.price)}${owned}\n`;
                }
                msg += `╰──────────────⬣`;
                return api.sendMessage(msg, event.threadID);
            }
            if (arg2 === 'buy') {
                const car = CARS[arg3];
                if (!car) return api.sendMessage('❌ Unknown vehicle!', event.threadID);
                if (u.cars.includes(arg3)) return api.sendMessage('❌ Already owned!', event.threadID);
                if (u.wallet < car.price) return api.sendMessage(`❌ Need ${formatMoney(car.price)}`, event.threadID);
                u.wallet -= car.price;
                u.cars.push(arg3);
                setUser('bank', uid, u);
                return api.sendMessage(`✅ Bought ${car.emoji} *${car.name}*!`, event.threadID);
            }
            if (arg2 === 'sell') {
                if (!u.cars.includes(arg3)) return api.sendMessage('❌ You don\'t own that!', event.threadID);
                const car = CARS[arg3];
                const revenue = Math.floor(car.price * 0.6);
                u.cars = u.cars.filter(c => c !== arg3);
                u.wallet += revenue;
                setUser('bank', uid, u);
                return api.sendMessage(`✅ Sold ${car.emoji} *${car.name}* for ${formatMoney(revenue)}`, event.threadID);
            }
        }

        if (sub === 'luxury') {
            if (arg2 === 'list' || !arg2) {
                let msg = `╭───〔 💎 LUXURY SHOP 〕───⬣\n`;
                for (const [k, l] of Object.entries(LUXURY)) {
                    const owned = u.luxury.includes(k) ? ' ✅' : '';
                    msg += `│ ${l.emoji} *${l.name}* — ${formatMoney(l.price)}${owned}\n`;
                }
                msg += `╰──────────────⬣`;
                return api.sendMessage(msg, event.threadID);
            }
            if (arg2 === 'buy') {
                const item = LUXURY[arg3];
                if (!item) return api.sendMessage('❌ Unknown item!', event.threadID);
                if (u.luxury.includes(arg3)) return api.sendMessage('❌ Already owned!', event.threadID);
                if (u.wallet < item.price) return api.sendMessage(`❌ Need ${formatMoney(item.price)}`, event.threadID);
                u.wallet -= item.price;
                u.luxury.push(arg3);
                setUser('bank', uid, u);
                return api.sendMessage(`✅ Bought ${item.emoji} *${item.name}*!`, event.threadID);
            }
        }

        // === GAMING ===
        if (sub === 'gamble') {
            if (amount <= 0) return api.sendMessage('❌ Usage: bank gamble <amount>', event.threadID);
            if (amount > u.wallet) return api.sendMessage(`❌ Not enough! Wallet: ${formatMoney(u.wallet)}`, event.threadID);
            u.stats.totalGambled += amount;
            const roll = Math.random();
            if (roll < 0.45) {
                const win = Math.floor(amount * randomInt(150, 300) / 100);
                u.wallet += win - amount;
                u.stats.gamesWon++;
                u.stats.totalEarned += win;
                addHistory(u, { type: 'gamble_win', amount: win });
                const ach = checkBankAchievements(u);
                setUser('bank', uid, u);
                let msg = `🎲 *You won!*\n💰 Bet: ${formatMoney(amount)} → Won: ${formatMoney(win)}\n💵 Wallet: ${formatMoney(u.wallet)}`;
                if (ach.length) msg += `\n🏆 ${ach.join(', ')}`;
                return api.sendMessage(msg, event.threadID);
            }
            u.wallet -= amount;
            u.stats.gamesLost++;
            setUser('bank', uid, u);
            return api.sendMessage(`🎲 *You lost!*\n💸 -${formatMoney(amount)}\n💵 Wallet: ${formatMoney(u.wallet)}`, event.threadID);
        }

        if (sub === 'slots') {
            if (amount <= 0) return api.sendMessage('❌ Usage: bank slots <amount>', event.threadID);
            if (amount > u.wallet) return api.sendMessage(`❌ Not enough!`, event.threadID);
            u.stats.totalGambled += amount;
            const symbols = ['🍒', '🍋', '🍊', '🍇', '💎', '7️⃣', '🔔'];
            const s1 = randomChoice(symbols), s2 = randomChoice(symbols), s3 = randomChoice(symbols);
            let winnings = 0;
            if (s1 === s2 && s2 === s3) {
                winnings = s1 === '💎' ? amount * 10 : s1 === '7️⃣' ? amount * 7 : amount * 5;
            } else if (s1 === s2 || s2 === s3 || s1 === s3) {
                winnings = Math.floor(amount * 1.5);
            }
            u.wallet += winnings - amount;
            if (winnings > 0) { u.stats.gamesWon++; u.stats.totalEarned += winnings; }
            else u.stats.gamesLost++;
            setUser('bank', uid, u);
            const result = winnings > 0 ? `🎉 *WIN!* +${formatMoney(winnings)}` : `💀 *LOST!* -${formatMoney(amount)}`;
            return api.sendMessage(`🎰 *SLOT MACHINE*\n\n┃ ${s1} ┃ ${s2} ┃ ${s3} ┃\n\n${result}\n💵 Wallet: ${formatMoney(u.wallet)}`, event.threadID);
        }

        if (sub === 'blackjack' || sub === 'bj') {
            if (amount <= 0) return api.sendMessage('❌ Usage: bank blackjack <amount>', event.threadID);
            if (amount > u.wallet) return api.sendMessage(`❌ Not enough!`, event.threadID);
            u.stats.totalGambled += amount;
            const deal = () => randomInt(1, 11);
            let player = deal() + deal(), dealer = deal() + deal();
            while (player < 17) player += deal();
            while (dealer < 17) dealer += deal();
            if (player > 21) player = 0;
            if (dealer > 21) dealer = 0;
            const won = player > dealer;
            const push = player === dealer && player > 0;
            let winnings = 0;
            if (won) { winnings = amount * 2; u.stats.gamesWon++; }
            else if (push) { winnings = amount; }
            else { u.stats.gamesLost++; }
            u.wallet += winnings - amount;
            if (winnings > amount) u.stats.totalEarned += winnings;
            setUser('bank', uid, u);
            const result = won ? `🎉 *YOU WIN!* +${formatMoney(winnings)}` : push ? `🤝 *PUSH!* Money returned.` : `💀 *DEALER WINS!* -${formatMoney(amount)}`;
            return api.sendMessage(`🃏 *BLACKJACK*\n\n👤 You: *${player || 'BUST'}*\n🏠 Dealer: *${dealer || 'BUST'}*\n\n${result}\n💵 Wallet: ${formatMoney(u.wallet)}`, event.threadID);
        }

        if (sub === 'roulette') {
            if (amount <= 0) return api.sendMessage('❌ Usage: bank roulette <amount> <red/black/number>', event.threadID);
            if (amount > u.wallet) return api.sendMessage(`❌ Not enough!`, event.threadID);
            const bet = arg3 || 'red';
            u.stats.totalGambled += amount;
            const result = randomInt(0, 36);
            const isRed = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(result);
            const color = result === 0 ? '🟢' : isRed ? '🔴' : '⚫';
            let won = false;
            let winnings = 0;
            if (bet === 'red' && isRed) { won = true; winnings = amount * 2; }
            else if (bet === 'black' && !isRed && result !== 0) { won = true; winnings = amount * 2; }
            else if (parseInt(bet) === result) { won = true; winnings = amount * 36; }
            if (won) { u.stats.gamesWon++; u.stats.totalEarned += winnings; }
            else u.stats.gamesLost++;
            u.wallet += winnings - amount;
            setUser('bank', uid, u);
            const msg = won ? `🎉 *WIN!* +${formatMoney(winnings)}` : `💀 *LOST!* -${formatMoney(amount)}`;
            return api.sendMessage(`🎯 *ROULETTE*\n\n${color} Ball landed on *${result}*\n\n${msg}\n💵 Wallet: ${formatMoney(u.wallet)}`, event.threadID);
        }

        if (sub === 'lottery') {
            if (arg2 === 'buy') {
                if (u.wallet < 500) return api.sendMessage('❌ Lottery ticket costs $500!', event.threadID);
                u.wallet -= 500;
                const numbers = Array.from({ length: 6 }, () => randomInt(1, 49)).sort((a, b) => a - b);
                const winning = Array.from({ length: 6 }, () => randomInt(1, 49)).sort((a, b) => a - b);
                const matches = numbers.filter(n => winning.includes(n)).length;
                let prize = 0;
                if (matches === 6) prize = 1000000;
                else if (matches === 5) prize = 50000;
                else if (matches === 4) prize = 5000;
                else if (matches === 3) prize = 500;
                u.wallet += prize;
                if (prize > 0) u.stats.totalEarned += prize;
                setUser('bank', uid, u);
                return api.sendMessage(
                    `🎫 *LOTTERY*\n\n🎱 Your: ${numbers.join(', ')}\n🏆 Winning: ${winning.join(', ')}\n\n✅ Matches: ${matches}/6\n${prize > 0 ? `🎉 Prize: ${formatMoney(prize)}!` : '❌ No win this time.'}\n💵 Wallet: ${formatMoney(u.wallet)}`,
                    event.threadID
                );
            }
            return api.sendMessage(`🎫 *LOTTERY*\n\n🎟️ Ticket: $500\n🏆 Prizes: 3 match ($500), 4 ($5K), 5 ($50K), 6 ($1M)\n\n💡 bank lottery buy`, event.threadID);
        }

        // === PREMIUM & SOCIAL ===
        if (sub === 'premium') {
            if (arg2 === 'buy') {
                const cost = 10000;
                if (u.wallet < cost) return api.sendMessage(`❌ Premium costs ${formatMoney(cost)}!`, event.threadID);
                u.wallet -= cost;
                u.premium = true;
                u.premiumExpiry = Date.now() + 30 * 24 * 60 * 60 * 1000;
                setUser('bank', uid, u);
                return api.sendMessage(`💎 *Premium Activated!* (30 days)\n\n✅ 2x earnings on all income\n✅ Exclusive perks`, event.threadID);
            }
            return api.sendMessage(`💎 *PREMIUM* — ${formatMoney(10000)}/month\n\n✅ 2x daily/work/business income\n✅ 2x dividends & rent\n\n💡 bank premium buy`, event.threadID);
        }

        if (sub === 'vault') {
            if (arg2 === 'deposit') {
                const vAmount = parseInt(args[3]) || 0;
                if (vAmount <= 0 || vAmount > u.wallet) return api.sendMessage('❌ Invalid amount!', event.threadID);
                u.wallet -= vAmount;
                u.vault += vAmount;
                setUser('bank', uid, u);
                return api.sendMessage(`🔐 Deposited ${formatMoney(vAmount)} to vault\n🔐 Vault: ${formatMoney(u.vault)}`, event.threadID);
            }
            if (arg2 === 'withdraw') {
                const vAmount = parseInt(args[3]) || 0;
                if (vAmount <= 0 || vAmount > u.vault) return api.sendMessage('❌ Invalid amount!', event.threadID);
                u.vault -= vAmount;
                u.wallet += vAmount;
                setUser('bank', uid, u);
                return api.sendMessage(`🔐 Withdrew ${formatMoney(vAmount)} from vault\n💵 Wallet: ${formatMoney(u.wallet)}`, event.threadID);
            }
            return api.sendMessage(`🔐 *VAULT*: ${formatMoney(u.vault)}\n\n💡 bank vault deposit/withdraw <amount>`, event.threadID);
        }

        if (sub === 'insurance') {
            if (arg2 === 'list' || !arg2) {
                let msg = `╭───〔 🛡️ INSURANCE 〕───⬣\n`;
                for (const [k, ins] of Object.entries(INSURANCE)) {
                    msg += `│ ${ins.emoji} *${ins.name}* — ${formatMoney(ins.price)} (${(ins.coverage * 100).toFixed(0)}% coverage)\n`;
                }
                msg += `╰──────────────⬣\n\nCurrent: ${u.insurance ? INSURANCE[u.insurance].name : 'None'}\n💡 bank insurance buy <type>`;
                return api.sendMessage(msg, event.threadID);
            }
            if (arg2 === 'buy') {
                const ins = INSURANCE[arg3];
                if (!ins) return api.sendMessage('❌ Unknown type! basic/premium/platinum', event.threadID);
                if (u.wallet < ins.price) return api.sendMessage(`❌ Need ${formatMoney(ins.price)}`, event.threadID);
                u.wallet -= ins.price;
                u.insurance = arg3;
                setUser('bank', uid, u);
                return api.sendMessage(`✅ Bought ${ins.name}! (${(ins.coverage * 100).toFixed(0)}% coverage)`, event.threadID);
            }
        }

        if (sub === 'credit') {
            return api.sendMessage(`📊 *Credit Score*: ${u.creditScore}/1000\n\n💡 Improve by repaying loans and transferring money.`, event.threadID);
        }

        if (sub === 'shop') {
            if (arg2 === 'list' || !arg2) {
                let msg = `╭───〔 🛒 SHOP 〕───⬣\n`;
                for (const [k, item] of Object.entries(SHOP_ITEMS)) {
                    msg += `│ ${item.emoji} *${item.name}* — ${formatMoney(item.price)}\n`;
                }
                msg += `╰──────────────⬣\n💡 bank shop buy <item>`;
                return api.sendMessage(msg, event.threadID);
            }
            if (arg2 === 'buy') {
                const item = SHOP_ITEMS[arg3];
                if (!item) return api.sendMessage('❌ Unknown item!', event.threadID);
                if (u.wallet < item.price) return api.sendMessage(`❌ Need ${formatMoney(item.price)}`, event.threadID);
                u.wallet -= item.price;
                setUser('bank', uid, u);
                return api.sendMessage(`✅ Bought ${item.emoji} *${item.name}*!`, event.threadID);
            }
        }

        if (sub === 'achievements') {
            const allAch = [
                { id: 'first_deposit', name: '🏦 First Deposit', desc: 'Make your first deposit' },
                { id: 'millionaire', name: '💎 Millionaire', desc: 'Have $1,000,000 total' },
                { id: 'investor', name: '📈 First Investment', desc: 'Buy your first stock' },
                { id: 'gambler', name: '🎰 High Roller', desc: 'Gamble $10,000 total' },
                { id: 'business_owner', name: '🏢 Business Owner', desc: 'Buy a business' },
                { id: 'homeowner', name: '🏠 Homeowner', desc: 'Buy property' },
                { id: 'streak7', name: '🔥 7-Day Streak', desc: '7 daily streak' },
            ];
            let msg = `╭───〔 🏆 ACHIEVEMENTS 〕───⬣\n`;
            for (const a of allAch) {
                msg += `│ ${u.achievements.includes(a.id) ? '✅' : '⬜'} ${a.name} — ${a.desc}\n`;
            }
            msg += `╰──────────────⬣`;
            return api.sendMessage(msg, event.threadID);
        }

        if (sub === 'leaderboard') {
            const all = getAllUsers('bank');
            const leaders = Object.entries(all)
                .map(([id, v]) => ({ id, total: (v.wallet || 0) + (v.bank || 0) + (v.vault || 0) }))
                .sort((a, b) => b.total - a.total)
                .slice(0, 10);
            if (!leaders.length) return api.sendMessage('📊 No players yet!', event.threadID);
            const medals = ['🥇', '🥈', '🥉'];
            let msg = `╭───〔 🏆 RICH LEADERBOARD 〕───⬣\n`;
            leaders.forEach((l, i) => {
                msg += `│ ${medals[i] || `${i + 1}.`} ${formatMoney(l.total)}\n`;
            });
            msg += `╰──────────────⬣`;
            return api.sendMessage(msg, event.threadID);
        }

        if (sub === 'rob') {
            const cd = cooldownCheck(u.cooldowns.rob, 12 * 60 * 60 * 1000);
            if (!cd.ready) return api.sendMessage(`⏳ Rob cooldown: ${formatTime(cd.remaining)}`, event.threadID);
            const all = getAllUsers('bank');
            const targets = Object.entries(all)
                .filter(([id]) => id !== uid)
                .map(([id, v]) => ({ id, total: (v.wallet || 0) + (v.bank || 0) }))
                .sort((a, b) => b.total - a.total)
                .slice(0, 10);
            if (!targets.length) return api.sendMessage('❌ No targets available!', event.threadID);
            u.cooldowns.rob = Date.now();
            const target = randomChoice(targets);
            const success = Math.random() < 0.69;
            if (success) {
                const stolen = Math.floor(target.total * 0.1);
                let tv = getUser('bank', target.id);
                if (tv.wallet >= stolen) tv.wallet -= stolen;
                else { tv.bank -= (stolen - tv.wallet); tv.wallet = 0; }
                u.wallet += stolen;
                u.stats.robSuccess++;
                setUser('bank', target.id, tv);
                setUser('bank', uid, u);
                return api.sendMessage(`🏴‍☠️ *Rob successful!*\n💰 Stole ${formatMoney(stolen)}!`, event.threadID);
            }
            const fine = randomInt(500, 2000);
            u.wallet = Math.max(0, u.wallet - fine);
            u.stats.robFail++;
            u.creditScore = Math.max(0, u.creditScore - 20);
            setUser('bank', uid, u);
            return api.sendMessage(`🚔 *Caught!* Fined ${formatMoney(fine)}\n📊 Credit: ${u.creditScore}`, event.threadID);
        }

        if (sub === 'invest') {
            return api.sendMessage(
                `╭───〔 📈 INVESTMENTS 〕───⬣\n` +
                `│ 📊 bank stocks [list/buy/sell]\n` +
                `│ ₿ bank crypto [list/buy/sell]\n` +
                `│ 🏛️ bank bonds [list/buy/sell]\n` +
                `│ 📊 bank portfolio\n` +
                `│ 📈 bank market\n` +
                `│ 💰 bank dividend\n` +
                `╰──────────────⬣`,
                event.threadID
            );
        }

        // Default help
        api.sendMessage(
            `🏦 *BANKING SYSTEM*\n━━━━━━━━━━━━━━━━\n\n` +
            `💰 *BASIC*: balance, deposit, withdraw, transfer, loan, repay, history, daily, work\n\n` +
            `📈 *INVESTMENTS*: invest, stocks, crypto, bonds, portfolio, market, dividend\n\n` +
            `🏢 *BUSINESS*: business [list/buy/upgrade], business_collect\n\n` +
            `🏠 *REAL ESTATE*: property [list/buy/sell], rent\n\n` +
            `💎 *LUXURY*: car [list/buy/sell], luxury [list/buy]\n\n` +
            `🎰 *GAMING*: gamble, slots, blackjack, roulette, lottery\n\n` +
            `⭐ *PREMIUM*: premium, vault, insurance, credit, achievements, leaderboard, rob, shop`,
            event.threadID
        );
    }
};
