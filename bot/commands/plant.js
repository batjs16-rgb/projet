const { getUser, setUser } = require('../utils/storage');
const { formatMoney, randomInt, cooldownCheck, formatTime } = require('../utils/format');

const PLANTS = {
    wheat: { name: 'Wheat', emoji: '🌾', growTime: 30 * 60 * 1000, profit: 100, cost: 20 },
    carrot: { name: 'Carrot', emoji: '🥕', growTime: 60 * 60 * 1000, profit: 250, cost: 50 },
    corn: { name: 'Corn', emoji: '🌽', growTime: 2 * 60 * 60 * 1000, profit: 500, cost: 100 },
    tomato: { name: 'Tomato', emoji: '🍅', growTime: 4 * 60 * 60 * 1000, profit: 1000, cost: 200 },
    golden_apple: { name: 'Golden Apple', emoji: '🍎', growTime: 12 * 60 * 60 * 1000, profit: 5000, cost: 1000 },
};

module.exports = {
    name: 'plant',
    category: 'Game',
    description: 'Farming game - plant and harvest crops',
    execute(api, event, { args }) {
        const uid = event.senderID;
        let u = getUser('farm', uid) || { plots: [], harvested: 0 };
        const sub = (args[1] || '').toLowerCase();

        if (sub === 'shop') {
            let msg = `╭───〔 🌱 SEED SHOP 〕───⬣\n`;
            for (const [k, p] of Object.entries(PLANTS)) {
                msg += `│ ${p.emoji} *${p.name}* — Cost:${formatMoney(p.cost)} | Profit:${formatMoney(p.profit)} | Time:${formatTime(p.growTime)}\n`;
            }
            msg += `╰──────────────⬣\n💡 plant seed <name>`;
            return api.sendMessage(msg, event.threadID);
        }

        if (sub === 'seed') {
            const plantKey = (args[2] || '').toLowerCase();
            const plant = PLANTS[plantKey];
            if (!plant) return api.sendMessage('❌ Unknown plant! Use: plant shop', event.threadID);
            if (u.plots.length >= 5) return api.sendMessage('❌ Max 5 plots! Harvest first.', event.threadID);
            let bank = getUser('bank', uid) || { wallet: 1000 };
            if ((bank.wallet || 0) < plant.cost) return api.sendMessage(`❌ Need ${formatMoney(plant.cost)}`, event.threadID);
            bank.wallet -= plant.cost;
            setUser('bank', uid, bank);
            u.plots.push({ type: plantKey, planted: Date.now() });
            setUser('farm', uid, u);
            return api.sendMessage(`🌱 Planted ${plant.emoji} *${plant.name}*! Harvest in ${formatTime(plant.growTime)}`, event.threadID);
        }

        if (sub === 'harvest') {
            if (!u.plots.length) return api.sendMessage('❌ Nothing planted! Use: plant seed <name>', event.threadID);
            let totalProfit = 0;
            const ready = [];
            const notReady = [];
            for (const plot of u.plots) {
                const plant = PLANTS[plot.type];
                if (Date.now() - plot.planted >= plant.growTime) {
                    ready.push(plot);
                    totalProfit += plant.profit;
                } else {
                    notReady.push(plot);
                }
            }
            if (!ready.length) return api.sendMessage('❌ No crops ready yet!', event.threadID);
            u.plots = notReady;
            u.harvested = (u.harvested || 0) + ready.length;
            setUser('farm', uid, u);
            let bank = getUser('bank', uid) || { wallet: 1000 };
            bank.wallet = (bank.wallet || 0) + totalProfit;
            setUser('bank', uid, bank);
            return api.sendMessage(`🌾 Harvested ${ready.length} crops!\n💰 +${formatMoney(totalProfit)}`, event.threadID);
        }

        if (sub === 'view' || !sub) {
            if (!u.plots.length) return api.sendMessage('🌱 No crops! Use: plant shop → plant seed <name>', event.threadID);
            let msg = `╭───〔 🌿 YOUR FARM 〕───⬣\n`;
            u.plots.forEach((plot, i) => {
                const plant = PLANTS[plot.type];
                const elapsed = Date.now() - plot.planted;
                const ready = elapsed >= plant.growTime;
                const remaining = ready ? '✅ Ready!' : formatTime(plant.growTime - elapsed);
                msg += `│ ${i + 1}. ${plant.emoji} ${plant.name} — ${remaining}\n`;
            });
            msg += `│ 📊 Harvested: ${u.harvested || 0}\n╰──────────────⬣`;
            return api.sendMessage(msg, event.threadID);
        }

        api.sendMessage('🌱 *FARMING*\n\n• plant shop → Seed shop\n• plant seed <name> → Plant a crop\n• plant harvest → Harvest ready crops\n• plant view → View your farm', event.threadID);
    }
};
