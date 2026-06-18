const { getUser, setUser, getAllUsers } = require('../utils/storage');
const { formatMoney, randomInt, randomChoice, cooldownCheck, formatTime, progressBar } = require('../utils/format');

const PETS_SHOP = {
    dog: { name: 'Dog', price: 500, emoji: '🐕', baseAtk: 10, baseDef: 8, baseHp: 100, ability: 'Loyal Bite' },
    cat: { name: 'Cat', price: 400, emoji: '🐈', baseAtk: 8, baseDef: 6, baseHp: 80, ability: 'Shadow Scratch' },
    dragon: { name: 'Dragon', price: 5000, emoji: '🐉', baseAtk: 25, baseDef: 20, baseHp: 200, ability: 'Fire Breath' },
    phoenix: { name: 'Phoenix', price: 8000, emoji: '🦅', baseAtk: 22, baseDef: 18, baseHp: 180, ability: 'Rebirth Flame' },
    unicorn: { name: 'Unicorn', price: 6000, emoji: '🦄', baseAtk: 18, baseDef: 22, baseHp: 160, ability: 'Healing Light' },
    wolf: { name: 'Wolf', price: 1500, emoji: '🐺', baseAtk: 15, baseDef: 12, baseHp: 130, ability: 'Pack Howl' },
    tiger: { name: 'Tiger', price: 3000, emoji: '🐅', baseAtk: 20, baseDef: 15, baseHp: 150, ability: 'Savage Claw' },
    snake: { name: 'Snake', price: 800, emoji: '🐍', baseAtk: 12, baseDef: 5, baseHp: 70, ability: 'Venom Strike' },
    rabbit: { name: 'Rabbit', price: 300, emoji: '🐇', baseAtk: 5, baseDef: 10, baseHp: 60, ability: 'Quick Dodge' },
    eagle: { name: 'Eagle', price: 2000, emoji: '🦅', baseAtk: 16, baseDef: 10, baseHp: 110, ability: 'Sky Dive' },
};

const FOOD_SHOP = {
    kibble: { name: 'Kibble', price: 50, hunger: 20, emoji: '🍖' },
    steak: { name: 'Premium Steak', price: 150, hunger: 50, emoji: '🥩' },
    fish: { name: 'Golden Fish', price: 100, hunger: 35, emoji: '🐟' },
    cake: { name: 'Magic Cake', price: 300, hunger: 80, emoji: '🎂' },
};

const ITEMS_SHOP = {
    potion: { name: 'Health Potion', price: 200, hp: 50, emoji: '🧪' },
    shield: { name: 'Iron Shield', price: 500, def: 5, emoji: '🛡️' },
    sword: { name: 'Steel Sword', price: 500, atk: 5, emoji: '⚔️' },
    elixir: { name: 'Super Elixir', price: 1000, hp: 100, atk: 3, def: 3, emoji: '✨' },
    collar: { name: 'Lucky Collar', price: 300, emoji: '📿', luck: 10 },
};

const EGG_TYPES = {
    bronze: { price: 1000, pets: ['rabbit', 'snake', 'cat'], emoji: '🥉' },
    silver: { price: 3000, pets: ['dog', 'wolf', 'eagle'], emoji: '🥈' },
    gold: { price: 8000, pets: ['tiger', 'dragon', 'phoenix', 'unicorn'], emoji: '🥇' },
};

const EXPLORE_LOOT = [
    { name: 'Gold Coins', type: 'money', amount: [100, 500], chance: 40, emoji: '💰' },
    { name: 'Treasure Chest', type: 'money', amount: [500, 2000], chance: 15, emoji: '🎁' },
    { name: 'Health Potion', type: 'item', item: 'potion', chance: 20, emoji: '🧪' },
    { name: 'Ancient Sword', type: 'stat', stat: 'atk', amount: [1, 3], chance: 10, emoji: '⚔️' },
    { name: 'Magic Shield', type: 'stat', stat: 'def', amount: [1, 3], chance: 10, emoji: '🛡️' },
    { name: 'Nothing', type: 'none', chance: 5, emoji: '💨' },
];

const QUESTS = [
    { id: 'explorer', desc: 'Explore 3 times', target: 3, reward: 1000, emoji: '🗺️' },
    { id: 'trainer', desc: 'Train your pet 2 times', target: 2, reward: 800, emoji: '💪' },
    { id: 'feeder', desc: 'Feed your pet 3 times', target: 3, reward: 500, emoji: '🍖' },
    { id: 'fighter', desc: 'Win 1 battle', target: 1, reward: 1500, emoji: '⚔️' },
];

const ACHIEVEMENTS = [
    { id: 'first_pet', name: 'First Friend', desc: 'Buy your first pet', emoji: '🐾', reward: 500 },
    { id: 'rich', name: 'Getting Rich', desc: 'Have $10,000', emoji: '💰', reward: 1000 },
    { id: 'collector', name: 'Collector', desc: 'Own 3 pets', emoji: '🏅', reward: 2000 },
    { id: 'warrior', name: 'Warrior', desc: 'Win 5 battles', emoji: '⚔️', reward: 3000 },
    { id: 'explorer', name: 'World Explorer', desc: 'Explore 10 times', emoji: '🗺️', reward: 1500 },
    { id: 'maxlevel', name: 'Max Power', desc: 'Reach pet level 20', emoji: '🌟', reward: 5000 },
];

function defaultUser() {
    return {
        money: 1000,
        pets: [],
        selectedPet: null,
        inventory: {},
        stats: { wins: 0, losses: 0, explores: 0, trains: 0, feeds: 0 },
        cooldowns: {},
        questProgress: {},
        questDay: null,
        dailyQuests: [],
        achievements: [],
        totalEarned: 0,
    };
}

function defaultPet(petKey) {
    const base = PETS_SHOP[petKey];
    return {
        key: petKey,
        name: base.name,
        emoji: base.emoji,
        level: 1,
        xp: 0,
        xpNeeded: 100,
        hp: base.baseHp,
        maxHp: base.baseHp,
        atk: base.baseAtk,
        def: base.baseDef,
        hunger: 100,
        thirst: 100,
        happiness: 80,
        ability: base.ability,
        form: 1,
        safe: false,
        passiveRate: 10,
        lastCollect: 0,
    };
}

function getSelectedPet(u) {
    if (!u.selectedPet || !u.pets.length) return null;
    return u.pets.find(p => p.name === u.selectedPet) || u.pets[0];
}

function levelUp(pet) {
    while (pet.xp >= pet.xpNeeded) {
        pet.xp -= pet.xpNeeded;
        pet.level++;
        pet.maxHp += 10;
        pet.hp = pet.maxHp;
        pet.atk += 2;
        pet.def += 2;
        pet.xpNeeded = Math.floor(pet.xpNeeded * 1.3);
        pet.passiveRate += 5;
    }
}

function checkAchievements(u) {
    const newAch = [];
    const has = (id) => u.achievements.includes(id);
    if (!has('first_pet') && u.pets.length >= 1) { u.achievements.push('first_pet'); newAch.push(ACHIEVEMENTS.find(a => a.id === 'first_pet')); u.money += 500; }
    if (!has('rich') && u.money >= 10000) { u.achievements.push('rich'); newAch.push(ACHIEVEMENTS.find(a => a.id === 'rich')); u.money += 1000; }
    if (!has('collector') && u.pets.length >= 3) { u.achievements.push('collector'); newAch.push(ACHIEVEMENTS.find(a => a.id === 'collector')); u.money += 2000; }
    if (!has('warrior') && u.stats.wins >= 5) { u.achievements.push('warrior'); newAch.push(ACHIEVEMENTS.find(a => a.id === 'warrior')); u.money += 3000; }
    if (!has('explorer') && u.stats.explores >= 10) { u.achievements.push('explorer'); newAch.push(ACHIEVEMENTS.find(a => a.id === 'explorer')); u.money += 1500; }
    const maxLvl = u.pets.reduce((m, p) => Math.max(m, p.level), 0);
    if (!has('maxlevel') && maxLvl >= 20) { u.achievements.push('maxlevel'); newAch.push(ACHIEVEMENTS.find(a => a.id === 'maxlevel')); u.money += 5000; }
    return newAch;
}

module.exports = {
    name: 'pet',
    category: 'Game',
    description: 'Ultimate Pet Universe v7.0',
    execute(api, event, { args }) {
        const uid = event.senderID;
        let u = getUser('pets', uid) || defaultUser();
        const sub = (args[1] || '').toLowerCase();

        if (sub === 'shop') {
            const shopType = (args[2] || '').toLowerCase();
            if (shopType === 'food') {
                let msg = `╭───〔 🍖 FOOD SHOP 〕───⬣\n`;
                for (const [k, v] of Object.entries(FOOD_SHOP)) {
                    msg += `│ ${v.emoji} *${v.name}* — ${formatMoney(v.price)} (+${v.hunger} hunger)\n`;
                }
                msg += `╰──────────────⬣\n\n💡 Use: pet buy food <name>`;
                return api.sendMessage(msg, event.threadID);
            }
            if (shopType === 'items' || shopType === 'accessories') {
                let msg = `╭───〔 🎒 ITEMS SHOP 〕───⬣\n`;
                for (const [k, v] of Object.entries(ITEMS_SHOP)) {
                    const stats = [];
                    if (v.hp) stats.push(`+${v.hp} HP`);
                    if (v.atk) stats.push(`+${v.atk} ATK`);
                    if (v.def) stats.push(`+${v.def} DEF`);
                    if (v.luck) stats.push(`+${v.luck} Luck`);
                    msg += `│ ${v.emoji} *${v.name}* — ${formatMoney(v.price)} (${stats.join(', ')})\n`;
                }
                msg += `╰──────────────⬣\n\n💡 Use: pet buy item <name>`;
                return api.sendMessage(msg, event.threadID);
            }
            let msg = `╭───〔 🛍️ PET SHOP 〕───⬣\n`;
            for (const [k, v] of Object.entries(PETS_SHOP)) {
                msg += `│ ${v.emoji} *${v.name}* — ${formatMoney(v.price)} | ATK:${v.baseAtk} DEF:${v.baseDef} HP:${v.baseHp}\n`;
            }
            msg += `╰──────────────⬣\n\n💡 Also: pet shop food | pet shop items\n💡 Buy: pet buy <name> | pet egg <type>`;
            return api.sendMessage(msg, event.threadID);
        }

        if (sub === 'buy') {
            const buyType = (args[2] || '').toLowerCase();
            if (buyType === 'food') {
                const foodKey = (args[3] || '').toLowerCase();
                const food = FOOD_SHOP[foodKey];
                if (!food) return api.sendMessage('❌ Unknown food. Use: pet shop food', event.threadID);
                if (u.money < food.price) return api.sendMessage(`❌ Not enough money! Need ${formatMoney(food.price)}, have ${formatMoney(u.money)}`, event.threadID);
                u.money -= food.price;
                u.inventory[foodKey] = (u.inventory[foodKey] || 0) + 1;
                setUser('pets', uid, u);
                return api.sendMessage(`✅ Bought ${food.emoji} *${food.name}*!\n💰 Balance: ${formatMoney(u.money)}`, event.threadID);
            }
            if (buyType === 'item') {
                const itemKey = (args[3] || '').toLowerCase();
                const item = ITEMS_SHOP[itemKey];
                if (!item) return api.sendMessage('❌ Unknown item. Use: pet shop items', event.threadID);
                if (u.money < item.price) return api.sendMessage(`❌ Not enough money! Need ${formatMoney(item.price)}, have ${formatMoney(u.money)}`, event.threadID);
                u.money -= item.price;
                u.inventory[itemKey] = (u.inventory[itemKey] || 0) + 1;
                setUser('pets', uid, u);
                return api.sendMessage(`✅ Bought ${item.emoji} *${item.name}*!\n💰 Balance: ${formatMoney(u.money)}`, event.threadID);
            }
            const petKey = buyType;
            const petData = PETS_SHOP[petKey];
            if (!petData) return api.sendMessage('❌ Unknown pet. Use: pet shop', event.threadID);
            if (u.money < petData.price) return api.sendMessage(`❌ Not enough money! Need ${formatMoney(petData.price)}, have ${formatMoney(u.money)}`, event.threadID);
            if (u.pets.find(p => p.key === petKey)) return api.sendMessage('❌ You already own this pet!', event.threadID);
            u.money -= petData.price;
            const newPet = defaultPet(petKey);
            u.pets.push(newPet);
            if (!u.selectedPet) u.selectedPet = newPet.name;
            setUser('pets', uid, u);
            const ach = checkAchievements(u);
            setUser('pets', uid, u);
            let msg = `✅ You bought ${petData.emoji} *${petData.name}*!\n💰 Balance: ${formatMoney(u.money)}`;
            if (ach.length) msg += `\n\n🏆 *Achievement Unlocked!*\n` + ach.map(a => `${a.emoji} ${a.name} (+${formatMoney(a.reward)})`).join('\n');
            return api.sendMessage(msg, event.threadID);
        }

        if (sub === 'egg') {
            const eggType = (args[2] || '').toLowerCase();
            const egg = EGG_TYPES[eggType];
            if (!egg) return api.sendMessage(`🥚 *Eggs Available:*\n🥉 Bronze — $1,000\n🥈 Silver — $3,000\n🥇 Gold — $8,000\n\n💡 Use: pet egg bronze/silver/gold`, event.threadID);
            if (u.money < egg.price) return api.sendMessage(`❌ Not enough money! Need ${formatMoney(egg.price)}`, event.threadID);
            const available = egg.pets.filter(p => !u.pets.find(pet => pet.key === p));
            if (!available.length) return api.sendMessage('❌ You already own all pets from this egg tier!', event.threadID);
            u.money -= egg.price;
            const wonKey = randomChoice(available);
            const newPet = defaultPet(wonKey);
            u.pets.push(newPet);
            if (!u.selectedPet) u.selectedPet = newPet.name;
            setUser('pets', uid, u);
            const ach = checkAchievements(u);
            setUser('pets', uid, u);
            let msg = `${egg.emoji} *${eggType.toUpperCase()} EGG* is hatching...\n\n🎉 You got: ${PETS_SHOP[wonKey].emoji} *${PETS_SHOP[wonKey].name}*!`;
            if (ach.length) msg += `\n\n🏆 *Achievement Unlocked!*\n` + ach.map(a => `${a.emoji} ${a.name}`).join('\n');
            return api.sendMessage(msg, event.threadID);
        }

        if (sub === 'view' || sub === 'stats') {
            const pet = getSelectedPet(u);
            if (!pet) return api.sendMessage('❌ You have no pet! Use: pet shop', event.threadID);
            const msg =
                `╭───〔 ${pet.emoji} ${pet.name} 〕───⬣\n` +
                `│ ⭐ *Level*: ${pet.level} (${pet.xp}/${pet.xpNeeded} XP)\n` +
                `│ ❤️ *HP*: ${pet.hp}/${pet.maxHp} ${progressBar(pet.hp, pet.maxHp)}\n` +
                `│ ⚔️ *ATK*: ${pet.atk}\n` +
                `│ 🛡️ *DEF*: ${pet.def}\n` +
                `│ 🍖 *Hunger*: ${pet.hunger}/100 ${progressBar(pet.hunger, 100)}\n` +
                `│ 💧 *Thirst*: ${pet.thirst}/100 ${progressBar(pet.thirst, 100)}\n` +
                `│ 😊 *Happiness*: ${pet.happiness}/100\n` +
                `│ ✨ *Ability*: ${pet.ability}\n` +
                `│ 🔄 *Form*: ${pet.form}\n` +
                `│ 🛡️ *Safe*: ${pet.safe ? 'Yes' : 'No'}\n` +
                `╰──────────────⬣`;
            return api.sendMessage(msg, event.threadID);
        }

        if (sub === 'pets') {
            if (!u.pets.length) return api.sendMessage('❌ You have no pets! Use: pet shop', event.threadID);
            let msg = `╭───〔 🐾 YOUR PETS 〕───⬣\n`;
            for (const p of u.pets) {
                const sel = p.name === u.selectedPet ? ' ✅' : '';
                msg += `│ ${p.emoji} *${p.name}* Lv.${p.level} | ATK:${p.atk} DEF:${p.def} HP:${p.hp}/${p.maxHp}${sel}\n`;
            }
            msg += `╰──────────────⬣\n\n💰 Balance: ${formatMoney(u.money)}\n💡 Use: pet select <name>`;
            return api.sendMessage(msg, event.threadID);
        }

        if (sub === 'inventory') {
            const items = Object.entries(u.inventory).filter(([, v]) => v > 0);
            if (!items.length) return api.sendMessage('🎒 Your inventory is empty!', event.threadID);
            let msg = `╭───〔 🎒 INVENTORY 〕───⬣\n`;
            for (const [k, v] of items) {
                const info = FOOD_SHOP[k] || ITEMS_SHOP[k] || { name: k, emoji: '📦' };
                msg += `│ ${info.emoji} *${info.name}* x${v}\n`;
            }
            msg += `╰──────────────⬣`;
            return api.sendMessage(msg, event.threadID);
        }

        if (sub === 'feed') {
            const pet = getSelectedPet(u);
            if (!pet) return api.sendMessage('❌ No pet selected!', event.threadID);
            const foodKey = (args[2] || '').toLowerCase();
            const availableFood = Object.keys(u.inventory).filter(k => FOOD_SHOP[k] && u.inventory[k] > 0);
            if (!foodKey || !FOOD_SHOP[foodKey]) {
                if (!availableFood.length) return api.sendMessage('❌ No food in inventory! Use: pet buy food <name>', event.threadID);
                const firstFood = availableFood[0];
                const food = FOOD_SHOP[firstFood];
                u.inventory[firstFood]--;
                pet.hunger = Math.min(100, pet.hunger + food.hunger);
                pet.happiness = Math.min(100, pet.happiness + 5);
                pet.xp += 10;
                u.stats.feeds++;
                levelUp(pet);
                setUser('pets', uid, u);
                return api.sendMessage(`${food.emoji} Fed *${pet.name}* with *${food.name}*!\n🍖 Hunger: ${pet.hunger}/100\n⭐ +10 XP`, event.threadID);
            }
            if (!u.inventory[foodKey] || u.inventory[foodKey] <= 0) return api.sendMessage(`❌ You don't have any ${FOOD_SHOP[foodKey].name}!`, event.threadID);
            const food = FOOD_SHOP[foodKey];
            u.inventory[foodKey]--;
            pet.hunger = Math.min(100, pet.hunger + food.hunger);
            pet.happiness = Math.min(100, pet.happiness + 5);
            pet.xp += 10;
            u.stats.feeds++;
            levelUp(pet);
            setUser('pets', uid, u);
            return api.sendMessage(`${food.emoji} Fed *${pet.name}* with *${food.name}*!\n🍖 Hunger: ${pet.hunger}/100\n⭐ +10 XP`, event.threadID);
        }

        if (sub === 'water') {
            const pet = getSelectedPet(u);
            if (!pet) return api.sendMessage('❌ No pet selected!', event.threadID);
            pet.thirst = Math.min(100, pet.thirst + 30);
            pet.happiness = Math.min(100, pet.happiness + 3);
            pet.xp += 5;
            levelUp(pet);
            setUser('pets', uid, u);
            return api.sendMessage(`💧 Gave water to *${pet.name}*!\n💧 Thirst: ${pet.thirst}/100\n⭐ +5 XP`, event.threadID);
        }

        if (sub === 'medicine') {
            const pet = getSelectedPet(u);
            if (!pet) return api.sendMessage('❌ No pet selected!', event.threadID);
            if (u.inventory.potion && u.inventory.potion > 0) {
                u.inventory.potion--;
                pet.hp = Math.min(pet.maxHp, pet.hp + 50);
                setUser('pets', uid, u);
                return api.sendMessage(`🧪 Used Health Potion on *${pet.name}*!\n❤️ HP: ${pet.hp}/${pet.maxHp}`, event.threadID);
            }
            if (u.money < 100) return api.sendMessage('❌ Need $100 or a Health Potion!', event.threadID);
            u.money -= 100;
            pet.hp = Math.min(pet.maxHp, pet.hp + 30);
            setUser('pets', uid, u);
            return api.sendMessage(`💊 Healed *${pet.name}* ($100)!\n❤️ HP: ${pet.hp}/${pet.maxHp}`, event.threadID);
        }

        if (sub === 'train') {
            const pet = getSelectedPet(u);
            if (!pet) return api.sendMessage('❌ No pet selected!', event.threadID);
            const cd = cooldownCheck(u.cooldowns.train, 30 * 60 * 1000);
            if (!cd.ready) return api.sendMessage(`⏳ Training cooldown: ${formatTime(cd.remaining)}`, event.threadID);
            u.cooldowns.train = Date.now();
            const stat = Math.random() > 0.5 ? 'atk' : 'def';
            const gain = randomInt(1, 3);
            pet[stat] += gain;
            pet.xp += 25;
            pet.hunger = Math.max(0, pet.hunger - 10);
            u.stats.trains++;
            levelUp(pet);
            setUser('pets', uid, u);
            return api.sendMessage(`💪 *${pet.name}* trained hard!\n${stat === 'atk' ? '⚔️' : '🛡️'} ${stat.toUpperCase()} +${gain} (now ${pet[stat]})\n⭐ +25 XP`, event.threadID);
        }

        if (sub === 'upgrade') {
            const pet = getSelectedPet(u);
            if (!pet) return api.sendMessage('❌ No pet selected!', event.threadID);
            const cost = pet.level * 200;
            if (u.money < cost) return api.sendMessage(`❌ Upgrade costs ${formatMoney(cost)}!`, event.threadID);
            u.money -= cost;
            pet.maxHp += 15;
            pet.hp = pet.maxHp;
            pet.atk += 3;
            pet.def += 3;
            pet.xp += 50;
            levelUp(pet);
            setUser('pets', uid, u);
            return api.sendMessage(`⬆️ *${pet.name}* upgraded!\n❤️ HP: ${pet.maxHp} | ⚔️ ATK: ${pet.atk} | 🛡️ DEF: ${pet.def}\n💰 Cost: ${formatMoney(cost)}`, event.threadID);
        }

        if (sub === 'rename') {
            const newName = args.slice(2).join(' ');
            if (!newName) return api.sendMessage('❌ Usage: pet rename <new name>', event.threadID);
            const pet = getSelectedPet(u);
            if (!pet) return api.sendMessage('❌ No pet selected!', event.threadID);
            const old = pet.name;
            pet.name = newName;
            if (u.selectedPet === old) u.selectedPet = newName;
            setUser('pets', uid, u);
            return api.sendMessage(`✅ Renamed *${old}* to *${newName}*!`, event.threadID);
        }

        if (sub === 'select') {
            const petName = args.slice(2).join(' ').toLowerCase();
            if (!petName) return api.sendMessage('❌ Usage: pet select <name>', event.threadID);
            const found = u.pets.find(p => p.name.toLowerCase() === petName || p.key === petName);
            if (!found) return api.sendMessage('❌ Pet not found! Use: pet pets', event.threadID);
            u.selectedPet = found.name;
            setUser('pets', uid, u);
            return api.sendMessage(`✅ Selected ${found.emoji} *${found.name}*!`, event.threadID);
        }

        if (sub === 'release') {
            const petName = args.slice(2).join(' ').toLowerCase();
            if (!petName) return api.sendMessage('❌ Usage: pet release <name>', event.threadID);
            const idx = u.pets.findIndex(p => p.name.toLowerCase() === petName || p.key === petName);
            if (idx === -1) return api.sendMessage('❌ Pet not found!', event.threadID);
            const removed = u.pets.splice(idx, 1)[0];
            if (u.selectedPet === removed.name) u.selectedPet = u.pets.length ? u.pets[0].name : null;
            const refund = Math.floor((PETS_SHOP[removed.key]?.price || 500) * 0.3);
            u.money += refund;
            setUser('pets', uid, u);
            return api.sendMessage(`👋 Released ${removed.emoji} *${removed.name}*\n💰 Refund: ${formatMoney(refund)}`, event.threadID);
        }

        if (sub === 'explore') {
            const pet = getSelectedPet(u);
            if (!pet) return api.sendMessage('❌ No pet selected!', event.threadID);
            const cd = cooldownCheck(u.cooldowns.explore, 15 * 60 * 1000);
            if (!cd.ready) return api.sendMessage(`⏳ Explore cooldown: ${formatTime(cd.remaining)}`, event.threadID);
            u.cooldowns.explore = Date.now();
            u.stats.explores++;

            let roll = randomInt(1, 100), cumulative = 0;
            let loot = EXPLORE_LOOT[EXPLORE_LOOT.length - 1];
            for (const l of EXPLORE_LOOT) {
                cumulative += l.chance;
                if (roll <= cumulative) { loot = l; break; }
            }

            let result = `🗺️ *${pet.name}* went exploring...\n\n`;
            if (loot.type === 'money') {
                const amount = randomInt(loot.amount[0], loot.amount[1]);
                u.money += amount;
                result += `${loot.emoji} Found *${loot.name}*! +${formatMoney(amount)}`;
            } else if (loot.type === 'item') {
                u.inventory[loot.item] = (u.inventory[loot.item] || 0) + 1;
                result += `${loot.emoji} Found *${loot.name}*! Added to inventory.`;
            } else if (loot.type === 'stat') {
                const amount = randomInt(loot.amount[0], loot.amount[1]);
                pet[loot.stat] += amount;
                result += `${loot.emoji} Found *${loot.name}*! +${amount} ${loot.stat.toUpperCase()}`;
            } else {
                result += `${loot.emoji} Found nothing this time...`;
            }
            pet.xp += 20;
            levelUp(pet);
            const ach = checkAchievements(u);
            setUser('pets', uid, u);
            if (ach.length) result += `\n\n🏆 *Achievement Unlocked!*\n` + ach.map(a => `${a.emoji} ${a.name}`).join('\n');
            return api.sendMessage(result + `\n⭐ +20 XP`, event.threadID);
        }

        if (sub === 'daily') {
            const cd = cooldownCheck(u.cooldowns.daily, 24 * 60 * 60 * 1000);
            if (!cd.ready) return api.sendMessage(`⏳ Daily cooldown: ${formatTime(cd.remaining)}`, event.threadID);
            u.cooldowns.daily = Date.now();
            const reward = randomInt(500, 1500);
            u.money += reward;
            u.totalEarned += reward;
            const pet = getSelectedPet(u);
            if (pet) { pet.xp += 30; levelUp(pet); }
            const ach = checkAchievements(u);
            setUser('pets', uid, u);
            let msg = `🎁 *Daily Reward!*\n\n💰 +${formatMoney(reward)}\n⭐ +30 XP\n\n💰 Balance: ${formatMoney(u.money)}`;
            if (ach.length) msg += `\n\n🏆 *Achievement!*\n` + ach.map(a => `${a.emoji} ${a.name}`).join('\n');
            return api.sendMessage(msg, event.threadID);
        }

        if (sub === 'ability') {
            const pet = getSelectedPet(u);
            if (!pet) return api.sendMessage('❌ No pet selected!', event.threadID);
            const cd = cooldownCheck(u.cooldowns.ability, 60 * 60 * 1000);
            if (!cd.ready) return api.sendMessage(`⏳ Ability cooldown: ${formatTime(cd.remaining)}`, event.threadID);
            u.cooldowns.ability = Date.now();
            const bonus = randomInt(5, 15);
            pet.atk += Math.floor(bonus / 2);
            pet.hp = Math.min(pet.maxHp, pet.hp + bonus * 3);
            pet.xp += 30;
            levelUp(pet);
            setUser('pets', uid, u);
            return api.sendMessage(`✨ *${pet.name}* used *${pet.ability}*!\n⚔️ ATK +${Math.floor(bonus / 2)} | ❤️ HP +${bonus * 3}\n⭐ +30 XP`, event.threadID);
        }

        if (sub === 'quest') {
            const today = new Date().toDateString();
            if (u.questDay !== today) {
                u.questDay = today;
                const shuffled = [...QUESTS].sort(() => Math.random() - 0.5);
                u.dailyQuests = shuffled.slice(0, 3).map(q => q.id);
                u.questProgress = {};
            }
            let msg = `╭───〔 📋 DAILY QUESTS 〕───⬣\n`;
            for (const qid of u.dailyQuests) {
                const q = QUESTS.find(x => x.id === qid);
                const progress = u.questProgress[qid] || 0;
                const done = progress >= q.target;
                msg += `│ ${q.emoji} ${q.desc}\n│   Progress: ${progress}/${q.target} ${done ? '✅' : ''}\n│   Reward: ${formatMoney(q.reward)}\n`;
            }
            msg += `╰──────────────⬣`;
            return api.sendMessage(msg, event.threadID);
        }

        if (sub === 'gift') {
            const mentions = event.mentions ? Object.keys(event.mentions) : [];
            const targetID = mentions[0];
            if (!targetID) return api.sendMessage('❌ Usage: pet gift @user <item> [qty]', event.threadID);
            const itemKey = (args[3] || '').toLowerCase();
            const qty = parseInt(args[4]) || 1;
            if (!itemKey || !u.inventory[itemKey] || u.inventory[itemKey] < qty) return api.sendMessage('❌ You don\'t have enough of that item!', event.threadID);
            u.inventory[itemKey] -= qty;
            let target = getUser('pets', targetID) || defaultUser();
            target.inventory[itemKey] = (target.inventory[itemKey] || 0) + qty;
            setUser('pets', uid, u);
            setUser('pets', targetID, target);
            const info = FOOD_SHOP[itemKey] || ITEMS_SHOP[itemKey] || { name: itemKey, emoji: '📦' };
            return api.sendMessage(`🎀 Gifted ${info.emoji} *${info.name}* x${qty} to @${targetID}!`, event.threadID);
        }

        if (sub === 'collect') {
            const pet = getSelectedPet(u);
            if (!pet) return api.sendMessage('❌ No pet selected!', event.threadID);
            const cd = cooldownCheck(pet.lastCollect, 60 * 60 * 1000);
            if (!cd.ready) return api.sendMessage(`⏳ Collect cooldown: ${formatTime(cd.remaining)}`, event.threadID);
            pet.lastCollect = Date.now();
            const income = pet.passiveRate * pet.level;
            u.money += income;
            u.totalEarned += income;
            setUser('pets', uid, u);
            return api.sendMessage(`💵 *${pet.name}* earned ${formatMoney(income)} passively!\n💰 Balance: ${formatMoney(u.money)}`, event.threadID);
        }

        if (sub === 'safe') {
            const petName = args.slice(2).join(' ').toLowerCase();
            if (!petName) return api.sendMessage('❌ Usage: pet safe <name>', event.threadID);
            const found = u.pets.find(p => p.name.toLowerCase() === petName || p.key === petName);
            if (!found) return api.sendMessage('❌ Pet not found!', event.threadID);
            found.safe = !found.safe;
            setUser('pets', uid, u);
            return api.sendMessage(`🛡️ *${found.name}* is now ${found.safe ? 'PROTECTED' : 'UNPROTECTED'}!`, event.threadID);
        }

        if (sub === 'achievements') {
            let msg = `╭───〔 🏅 ACHIEVEMENTS 〕───⬣\n`;
            for (const a of ACHIEVEMENTS) {
                const has = u.achievements.includes(a.id);
                msg += `│ ${has ? '✅' : '⬜'} ${a.emoji} *${a.name}*\n│   ${a.desc} — Reward: ${formatMoney(a.reward)}\n`;
            }
            msg += `╰──────────────⬣`;
            return api.sendMessage(msg, event.threadID);
        }

        if (sub === 'battle') {
            const pet = getSelectedPet(u);
            if (!pet) return api.sendMessage('❌ No pet selected!', event.threadID);
            if (pet.hp <= 0) return api.sendMessage('❌ Your pet has no HP! Use: pet medicine', event.threadID);
            const mentions = event.mentions ? Object.keys(event.mentions) : [];
            const targetID = mentions[0];
            if (!targetID) return api.sendMessage('❌ Usage: pet battle @user', event.threadID);
            if (targetID === uid) return api.sendMessage('❌ You can\'t battle yourself!', event.threadID);
            const targetUser = getUser('pets', targetID);
            if (!targetUser || !targetUser.pets.length) return api.sendMessage('❌ That user has no pets!', event.threadID);
            const enemy = getSelectedPet(targetUser);
            if (!enemy) return api.sendMessage('❌ Opponent has no selected pet!', event.threadID);
            if (enemy.safe) return api.sendMessage(`🛡️ *${enemy.name}* is protected from battles!`, event.threadID);

            let log = `╭───〔 ⚔️ PET BATTLE 〕───⬣\n`;
            log += `│ ${pet.emoji} *${pet.name}* Lv.${pet.level} vs ${enemy.emoji} *${enemy.name}* Lv.${enemy.level}\n`;
            log += `╰──────────────⬣\n\n`;

            let myHp = pet.hp, enHp = enemy.hp;
            let round = 0;
            while (myHp > 0 && enHp > 0 && round < 10) {
                round++;
                const myDmg = Math.max(1, pet.atk - Math.floor(enemy.def / 2) + randomInt(-3, 5));
                const enDmg = Math.max(1, enemy.atk - Math.floor(pet.def / 2) + randomInt(-3, 5));
                enHp -= myDmg;
                myHp -= enDmg;
                log += `⚔️ Round ${round}: ${pet.name} deals ${myDmg} | ${enemy.name} deals ${enDmg}\n`;
            }

            const won = myHp > enHp;
            pet.hp = Math.max(0, myHp);
            enemy.hp = Math.max(0, enHp);

            if (won) {
                const reward = randomInt(200, 800);
                const xpGain = 50;
                u.money += reward;
                u.stats.wins++;
                pet.xp += xpGain;
                levelUp(pet);
                targetUser.stats.losses++;
                log += `\n🏆 *${pet.name}* WINS!\n💰 +${formatMoney(reward)} | ⭐ +${xpGain} XP`;
            } else {
                u.stats.losses++;
                targetUser.stats.wins++;
                enemy.xp += 50;
                levelUp(enemy);
                log += `\n💀 *${enemy.name}* WINS!`;
            }

            const ach = checkAchievements(u);
            setUser('pets', uid, u);
            setUser('pets', targetID, targetUser);
            if (ach.length) log += `\n\n🏆 *Achievement!*\n` + ach.map(a => `${a.emoji} ${a.name}`).join('\n');
            return api.sendMessage(log, event.threadID);
        }

        if (sub === 'evolve') {
            const pet = getSelectedPet(u);
            if (!pet) return api.sendMessage('❌ No pet selected!', event.threadID);
            const reqLevel = pet.form * 10;
            if (pet.level < reqLevel) return api.sendMessage(`❌ *${pet.name}* needs level ${reqLevel} to evolve (currently Lv.${pet.level})`, event.threadID);
            const cost = pet.form * 2000;
            if (u.money < cost) return api.sendMessage(`❌ Evolution costs ${formatMoney(cost)}!`, event.threadID);
            u.money -= cost;
            pet.form++;
            pet.atk += 10;
            pet.def += 10;
            pet.maxHp += 50;
            pet.hp = pet.maxHp;
            setUser('pets', uid, u);
            return api.sendMessage(`🔄 *${pet.name}* evolved to *Form ${pet.form}*!\n⚔️ ATK: ${pet.atk} | 🛡️ DEF: ${pet.def} | ❤️ HP: ${pet.maxHp}`, event.threadID);
        }

        if (sub === 'leaderboard') {
            const all = getAllUsers('pets');
            const leaders = Object.entries(all)
                .filter(([, v]) => v.pets.length > 0)
                .map(([id, v]) => {
                    const best = v.pets.reduce((b, p) => p.level > b.level ? p : b, v.pets[0]);
                    return { id, wins: v.stats.wins, level: best.level, name: best.name, emoji: best.emoji };
                })
                .sort((a, b) => b.wins - a.wins || b.level - a.level)
                .slice(0, 10);
            if (!leaders.length) return api.sendMessage('📊 No players on the leaderboard yet!', event.threadID);
            let msg = `╭───〔 🏆 PET LEADERBOARD 〕───⬣\n`;
            const medals = ['🥇', '🥈', '🥉'];
            leaders.forEach((l, i) => {
                msg += `│ ${medals[i] || `${i + 1}.`} ${l.emoji} *${l.name}* Lv.${l.level} — ${l.wins} wins\n`;
            });
            msg += `╰──────────────⬣`;
            return api.sendMessage(msg, event.threadID);
        }

        // Default: show pet help
        api.sendMessage(
            `🌟 *ULTIMATE PET UNIVERSE v7.0* 🌟\n\n` +
            `🛍️ *SHOP*:\n` +
            `• pet shop pets/food/items\n` +
            `• pet buy <name> | pet egg bronze/silver/gold\n\n` +
            `🐾 *PET CARE*:\n` +
            `• pet view/stats/pets/inventory\n` +
            `• pet feed/water/medicine/train/upgrade\n` +
            `• pet rename/release/select\n\n` +
            `🗺️ *FEATURES*:\n` +
            `• pet explore — Adventure for loot 🗺️\n` +
            `• pet daily — Daily rewards 🎁\n` +
            `• pet ability — Special ability ✨\n` +
            `• pet quest — Daily quests 📋\n` +
            `• pet gift @user <item> [qty] 🎀\n` +
            `• pet collect — Passive income 💵\n` +
            `• pet safe <pet> — Protect from battle 🛡️\n` +
            `• pet achievements — Track progress 🏅\n\n` +
            `⚔️ *BATTLE*:\n` +
            `• pet battle @user\n` +
            `• pet evolve\n` +
            `• pet leaderboard`,
            event.threadID
        );
    }
};
