const { getUser, setUser, getAllUsers } = require('../utils/storage');
const { randomInt, randomChoice, formatTime, cooldownCheck, progressBar } = require('../utils/format');

const SPELLS = {
    fireball: { name: 'Fireball', emoji: '🔥', dmg: [15, 30], type: 'fire', cost: 10 },
    frostbolt: { name: 'Frostbolt', emoji: '❄️', dmg: [12, 25], type: 'ice', cost: 8 },
    lightning: { name: 'Lightning', emoji: '⚡', dmg: [20, 35], type: 'storm', cost: 15 },
    heal: { name: 'Heal', emoji: '💚', dmg: [0, 0], heal: [20, 40], type: 'holy', cost: 12 },
    shield: { name: 'Shield', emoji: '🛡️', dmg: [0, 0], def: 15, type: 'holy', cost: 10 },
    teleport: { name: 'Teleport', emoji: '🌀', dmg: [0, 0], dodge: true, type: 'arcane', cost: 20 },
    meteor: { name: 'Meteor', emoji: '☄️', dmg: [30, 50], type: 'fire', cost: 25 },
    blizzard: { name: 'Blizzard', emoji: '🌨️', dmg: [25, 40], type: 'ice', cost: 20 },
    earthquake: { name: 'Earthquake', emoji: '🌍', dmg: [20, 45], type: 'earth', cost: 22 },
    phoenix: { name: 'Phoenix', emoji: '🦅', dmg: [10, 20], heal: [15, 30], type: 'fire', cost: 30 },
    dragon: { name: 'Dragon Breath', emoji: '🐉', dmg: [35, 55], type: 'fire', cost: 35 },
    unicorn: { name: 'Unicorn Light', emoji: '🦄', dmg: [5, 10], heal: [30, 50], type: 'holy', cost: 28 },
};

const CREATURES = {
    golem: { name: 'Stone Golem', emoji: '🗿', hp: 50, atk: 10, def: 20, cost: 30 },
    imp: { name: 'Fire Imp', emoji: '👹', hp: 30, atk: 20, def: 5, cost: 15 },
    fairy: { name: 'Fairy', emoji: '🧚', hp: 20, atk: 5, def: 5, heal: 15, cost: 20 },
    drake: { name: 'Shadow Drake', emoji: '🐲', hp: 60, atk: 25, def: 15, cost: 50 },
};

function defaultWizard() {
    return {
        hp: 100,
        maxHp: 100,
        mana: 50,
        maxMana: 50,
        atk: 10,
        def: 10,
        level: 1,
        xp: 0,
        xpNeeded: 100,
        spells: ['fireball', 'heal'],
        creatures: [],
        activeCreature: null,
        stats: { wins: 0, losses: 0, duels: 0, spellsCast: 0 },
        cooldowns: {},
    };
}

function levelUpWizard(w) {
    while (w.xp >= w.xpNeeded) {
        w.xp -= w.xpNeeded;
        w.level++;
        w.maxHp += 10;
        w.hp = w.maxHp;
        w.maxMana += 5;
        w.mana = w.maxMana;
        w.atk += 2;
        w.def += 2;
        w.xpNeeded = Math.floor(w.xpNeeded * 1.3);
    }
}

module.exports = {
    name: 'magic',
    category: 'Game',
    description: 'Magical Battle Commands',
    execute(api, event, { args }) {
        const uid = event.senderID;
        let w = getUser('magic', uid) || defaultWizard();
        const sub = (args[1] || '').toLowerCase();

        if (sub === 'stats') {
            const mentions = event.mentions ? Object.keys(event.mentions) : [];
            const targetID = mentions[0] || uid;
            const target = getUser('magic', targetID) || defaultWizard();
            const msg =
                `╭───〔 🪄 WIZARD STATS 〕───⬣\n` +
                `│ ⭐ *Level*: ${target.level}\n` +
                `│ ❤️ *HP*: ${target.hp}/${target.maxHp} ${progressBar(target.hp, target.maxHp)}\n` +
                `│ 💙 *Mana*: ${target.mana}/${target.maxMana} ${progressBar(target.mana, target.maxMana)}\n` +
                `│ ⚔️ *ATK*: ${target.atk}\n` +
                `│ 🛡️ *DEF*: ${target.def}\n` +
                `│ 🏆 *Wins*: ${target.stats.wins} | 💀 *Losses*: ${target.stats.losses}\n` +
                `│ ✨ *Spells*: ${target.spells.length}\n` +
                `╰──────────────⬣`;
            return api.sendMessage(msg, event.threadID);
        }

        if (sub === 'spellbook') {
            let msg = `╭───〔 📖 SPELLBOOK 〕───⬣\n│ *Your Spells:*\n`;
            for (const sk of w.spells) {
                const s = SPELLS[sk];
                if (s) msg += `│ ${s.emoji} *${s.name}* — DMG:${s.dmg[0]}-${s.dmg[1]}${s.heal ? ` HEAL:${s.heal[0]}-${s.heal[1]}` : ''} | Cost:${s.cost} mana\n`;
            }
            msg += `│\n│ *Available to Learn:*\n`;
            for (const [k, s] of Object.entries(SPELLS)) {
                if (!w.spells.includes(k)) {
                    msg += `│ ${s.emoji} *${s.name}* — Cost: Lv.${Math.ceil(s.cost / 5)} required\n`;
                }
            }
            msg += `╰──────────────⬣\n💡 magic enchant <spell>`;
            return api.sendMessage(msg, event.threadID);
        }

        if (sub === 'enchant') {
            const spellKey = (args[2] || '').toLowerCase();
            const spell = SPELLS[spellKey];
            if (!spell) return api.sendMessage('❌ Unknown spell! Use: magic spellbook', event.threadID);
            if (w.spells.includes(spellKey)) return api.sendMessage('❌ You already know this spell!', event.threadID);
            const reqLevel = Math.ceil(spell.cost / 5);
            if (w.level < reqLevel) return api.sendMessage(`❌ Need level ${reqLevel} (you're Lv.${w.level})`, event.threadID);
            w.spells.push(spellKey);
            setUser('magic', uid, w);
            return api.sendMessage(`✨ Learned *${spell.name}* ${spell.emoji}!`, event.threadID);
        }

        if (sub === 'summon') {
            const creatureKey = (args[2] || '').toLowerCase();
            const creature = CREATURES[creatureKey];
            if (!creature) {
                let msg = `╭───〔 🐲 SUMMON 〕───⬣\n`;
                for (const [k, c] of Object.entries(CREATURES)) {
                    msg += `│ ${c.emoji} *${c.name}* — HP:${c.hp} ATK:${c.atk} DEF:${c.def} | Cost:${c.cost} mana\n`;
                }
                msg += `╰──────────────⬣\n💡 magic summon <creature>`;
                return api.sendMessage(msg, event.threadID);
            }
            if (w.mana < creature.cost) return api.sendMessage(`❌ Need ${creature.cost} mana (have ${w.mana})`, event.threadID);
            w.mana -= creature.cost;
            w.activeCreature = { key: creatureKey, ...creature, currentHp: creature.hp };
            setUser('magic', uid, w);
            return api.sendMessage(`${creature.emoji} Summoned *${creature.name}*!\n❤️ HP: ${creature.hp} | ⚔️ ATK: ${creature.atk} | 🛡️ DEF: ${creature.def}`, event.threadID);
        }

        if (sub === 'profile') {
            const mentions = event.mentions ? Object.keys(event.mentions) : [];
            const targetID = mentions[0] || uid;
            const target = getUser('magic', targetID) || defaultWizard();
            const msg =
                `╭───〔 🧙 WIZARD PROFILE 〕───⬣\n` +
                `│ ⭐ Level ${target.level} Wizard\n` +
                `│ ❤️ HP: ${target.hp}/${target.maxHp}\n` +
                `│ 💙 Mana: ${target.mana}/${target.maxMana}\n` +
                `│ ⚔️ ATK: ${target.atk} | 🛡️ DEF: ${target.def}\n` +
                `│ 📖 Spells: ${target.spells.map(s => SPELLS[s]?.emoji || '?').join(' ')}\n` +
                `│ 🐲 Creature: ${target.activeCreature ? target.activeCreature.emoji + ' ' + target.activeCreature.name : 'None'}\n` +
                `│ 🏆 W/L: ${target.stats.wins}/${target.stats.losses}\n` +
                `╰──────────────⬣`;
            return api.sendMessage(msg, event.threadID);
        }

        if (sub === 'leaderboard') {
            const all = getAllUsers('magic');
            const leaders = Object.entries(all)
                .map(([id, v]) => ({ id, wins: v.stats.wins, level: v.level }))
                .sort((a, b) => b.wins - a.wins || b.level - a.level)
                .slice(0, 10);
            if (!leaders.length) return api.sendMessage('📊 No wizards yet!', event.threadID);
            const medals = ['🥇', '🥈', '🥉'];
            let msg = `╭───〔 🏆 WIZARD HALL OF FAME 〕───⬣\n`;
            leaders.forEach((l, i) => {
                msg += `│ ${medals[i] || `${i + 1}.`} Lv.${l.level} — ${l.wins} wins\n`;
            });
            msg += `╰──────────────⬣`;
            return api.sendMessage(msg, event.threadID);
        }

        // Duel
        const mentions = event.mentions ? Object.keys(event.mentions) : [];
        let targetID = mentions[0];
        if (!targetID && event.type === 'message_reply' && event.messageReply) {
            targetID = event.messageReply.senderID;
        }
        if (!targetID && args[1] && !isNaN(args[1])) {
            targetID = args[1];
        }

        if (targetID) {
            if (targetID === uid) return api.sendMessage('❌ You can\'t duel yourself!', event.threadID);
            let enemy = getUser('magic', targetID) || defaultWizard();

            if (w.hp <= 0) return api.sendMessage('❌ You have no HP! Wait for regeneration.', event.threadID);

            let log = `╭───〔 🪄 MAGICAL DUEL 〕───⬣\n`;
            log += `│ 🧙 Lv.${w.level} vs 🧙 Lv.${enemy.level}\n`;
            log += `╰──────────────⬣\n\n`;

            let myHp = w.hp, enHp = enemy.hp;
            let round = 0;

            while (myHp > 0 && enHp > 0 && round < 8) {
                round++;
                const mySpell = SPELLS[randomChoice(w.spells)];
                const enSpell = SPELLS[randomChoice(enemy.spells)];

                let myDmg = randomInt(mySpell.dmg[0], mySpell.dmg[1]) + Math.floor(w.atk / 2);
                let enDmg = randomInt(enSpell.dmg[0], enSpell.dmg[1]) + Math.floor(enemy.atk / 2);

                myDmg = Math.max(0, myDmg - Math.floor(enemy.def / 3));
                enDmg = Math.max(0, enDmg - Math.floor(w.def / 3));

                enHp -= myDmg;
                myHp -= enDmg;

                if (mySpell.heal) myHp = Math.min(w.maxHp, myHp + randomInt(mySpell.heal[0], mySpell.heal[1]));
                if (enSpell.heal) enHp = Math.min(enemy.maxHp, enHp + randomInt(enSpell.heal[0], enSpell.heal[1]));

                if (w.activeCreature && w.activeCreature.currentHp > 0) {
                    const cDmg = randomInt(3, w.activeCreature.atk);
                    enHp -= cDmg;
                    log += `🐲 ${w.activeCreature.name} deals ${cDmg}\n`;
                }

                log += `⚔️ R${round}: ${mySpell.emoji}${mySpell.name} → ${myDmg} dmg | ${enSpell.emoji}${enSpell.name} → ${enDmg} dmg\n`;
            }

            const won = myHp > enHp;
            w.hp = Math.max(0, Math.min(w.maxHp, myHp));
            enemy.hp = Math.max(0, Math.min(enemy.maxHp, enHp));
            w.stats.duels++;
            enemy.stats.duels++;

            if (won) {
                w.stats.wins++;
                enemy.stats.losses++;
                w.xp += 60;
                levelUpWizard(w);
                log += `\n🏆 *YOU WIN!* +60 XP`;
            } else {
                w.stats.losses++;
                enemy.stats.wins++;
                enemy.xp += 60;
                levelUpWizard(enemy);
                log += `\n💀 *YOU LOST!*`;
            }

            setUser('magic', uid, w);
            setUser('magic', targetID, enemy);
            return api.sendMessage(log, event.threadID);
        }

        // Default help
        api.sendMessage(
            `🪄 *MAGICAL BATTLE COMMANDS*\n\n` +
            `• magic @user → Challenge to duel\n` +
            `• magic [reply] → Challenge by reply\n` +
            `• magic stats [@user] → Wizard stats\n` +
            `• magic leaderboard → Hall of Fame\n` +
            `• magic spellbook → Browse spells\n` +
            `• magic summon <creature> → Summon creature\n` +
            `• magic enchant <spell> → Learn spell\n` +
            `• magic profile [@user] → Wizard profile\n\n` +
            `✨ *Spells*: fireball, frostbolt, lightning, heal, shield, teleport, meteor, blizzard, earthquake, phoenix, dragon, unicorn`,
            event.threadID
        );
    }
};
