const { getUser, setUser } = require('../utils/storage');
const { randomInt, randomChoice, formatMoney } = require('../utils/format');

const CAR_TYPES = [
    { name: 'Honda Civic', emoji: '🚗', speed: 60, price: 2000 },
    { name: 'BMW M3', emoji: '🏎️', speed: 75, price: 5000 },
    { name: 'Ferrari 488', emoji: '🏎️', speed: 90, price: 15000 },
    { name: 'Lamborghini Huracan', emoji: '🏎️', speed: 95, price: 25000 },
    { name: 'Bugatti Chiron', emoji: '🏎️', speed: 100, price: 50000 },
];

module.exports = {
    name: 'car',
    category: 'Game',
    description: 'Car racing game',
    execute(api, event, { args }) {
        const uid = event.senderID;
        const sub = (args[1] || '').toLowerCase();

        if (sub === 'shop') {
            let msg = `╭───〔 🏎️ CAR SHOP 〕───⬣\n`;
            CAR_TYPES.forEach((c, i) => {
                msg += `│ ${c.emoji} *${c.name}* — Speed:${c.speed} | ${formatMoney(c.price)}\n`;
            });
            msg += `╰──────────────⬣\n💡 car buy <name>`;
            return api.sendMessage(msg, event.threadID);
        }

        if (sub === 'buy') {
            const carName = args.slice(2).join(' ').toLowerCase();
            const carType = CAR_TYPES.find(c => c.name.toLowerCase().includes(carName));
            if (!carType) return api.sendMessage('❌ Car not found! Use: car shop', event.threadID);
            let bank = getUser('bank', uid) || { wallet: 1000 };
            if ((bank.wallet || 0) < carType.price) return api.sendMessage(`❌ Need ${formatMoney(carType.price)}`, event.threadID);
            bank.wallet -= carType.price;
            setUser('bank', uid, bank);
            let u = getUser('cars', uid) || { car: null };
            u.car = carType;
            setUser('cars', uid, u);
            return api.sendMessage(`✅ Bought ${carType.emoji} *${carType.name}*!`, event.threadID);
        }

        if (sub === 'race') {
            let u = getUser('cars', uid) || { car: null };
            if (!u.car) return api.sendMessage('❌ No car! Use: car shop → car buy', event.threadID);
            const opCar = randomChoice(CAR_TYPES);
            const mySpeed = u.car.speed + randomInt(-15, 15);
            const opSpeed = opCar.speed + randomInt(-15, 15);
            const won = mySpeed > opSpeed;
            const reward = randomInt(200, 800);

            if (won) {
                let bank = getUser('bank', uid) || { wallet: 1000 };
                bank.wallet = (bank.wallet || 0) + reward;
                setUser('bank', uid, bank);
            }

            return api.sendMessage(
                `╭───〔 🏁 RACE 〕───⬣\n` +
                `│ ${u.car.emoji} *${u.car.name}*: ${mySpeed} km/h\n` +
                `│ ${opCar.emoji} *${opCar.name}*: ${opSpeed} km/h\n` +
                `╰──────────────⬣\n\n${won ? `🏆 *YOU WIN!* +${formatMoney(reward)}` : '💀 *YOU LOST!*'}`,
                event.threadID
            );
        }

        api.sendMessage('🏎️ *CAR GAME*\n\n• car shop → Browse cars\n• car buy <name> → Buy a car\n• car race → Race!', event.threadID);
    }
};
