const { getUser, setUser } = require('../utils/storage');
const { randomChoice, formatMoney } = require('../utils/format');

const QUESTIONS = [
    { q: 'What planet is known as the Red Planet?', a: 'mars', options: ['Venus', 'Mars', 'Jupiter', 'Saturn'] },
    { q: 'What is the largest ocean on Earth?', a: 'pacific', options: ['Atlantic', 'Pacific', 'Indian', 'Arctic'] },
    { q: 'How many continents are there?', a: '7', options: ['5', '6', '7', '8'] },
    { q: 'What gas do plants absorb?', a: 'co2', options: ['Oxygen', 'CO2', 'Nitrogen', 'Hydrogen'] },
    { q: 'Who painted the Mona Lisa?', a: 'leonardo', options: ['Picasso', 'Leonardo', 'Van Gogh', 'Monet'] },
    { q: 'What is the speed of light (approx)?', a: '300000', options: ['150,000 km/s', '300,000 km/s', '500,000 km/s', '1M km/s'] },
    { q: 'What is the chemical symbol for water?', a: 'h2o', options: ['H2O', 'CO2', 'NaCl', 'O2'] },
    { q: 'What year did WW2 end?', a: '1945', options: ['1943', '1944', '1945', '1946'] },
    { q: 'What is the largest mammal?', a: 'blue whale', options: ['Elephant', 'Blue Whale', 'Giraffe', 'Hippo'] },
    { q: 'How many legs does a spider have?', a: '8', options: ['6', '8', '10', '12'] },
    { q: 'What is the capital of Japan?', a: 'tokyo', options: ['Seoul', 'Tokyo', 'Beijing', 'Bangkok'] },
    { q: 'What element has symbol Fe?', a: 'iron', options: ['Gold', 'Iron', 'Silver', 'Copper'] },
    { q: 'How many bones in adult human body?', a: '206', options: ['186', '206', '226', '256'] },
    { q: 'What is the smallest planet?', a: 'mercury', options: ['Mars', 'Mercury', 'Pluto', 'Venus'] },
    { q: 'Who wrote Romeo and Juliet?', a: 'shakespeare', options: ['Dickens', 'Shakespeare', 'Austen', 'Twain'] },
];

const activeQuizzes = {};

module.exports = {
    name: 'quiz',
    category: 'Game',
    description: 'Trivia quiz game',
    execute(api, event, { args }) {
        const uid = event.senderID;
        const tid = event.threadID;

        if (activeQuizzes[tid] && args[1]) {
            const quiz = activeQuizzes[tid];
            const answer = args.slice(1).join(' ').toLowerCase();
            const correct = answer.includes(quiz.answer) || answer === String(quiz.correctIndex + 1);

            delete activeQuizzes[tid];

            if (correct) {
                const reward = 300;
                let u = getUser('bank', uid) || { wallet: 1000 };
                u.wallet = (u.wallet || 0) + reward;
                setUser('bank', uid, u);
                return api.sendMessage(`✅ *Correct!* The answer is *${quiz.options[quiz.correctIndex]}*\n💰 +${formatMoney(reward)}`, tid);
            }
            return api.sendMessage(`❌ *Wrong!* The answer was *${quiz.options[quiz.correctIndex]}*`, tid);
        }

        const question = randomChoice(QUESTIONS);
        const shuffled = [...question.options].sort(() => Math.random() - 0.5);
        const correctIndex = shuffled.findIndex(o => o.toLowerCase().includes(question.a));

        activeQuizzes[tid] = {
            answer: question.a,
            options: shuffled,
            correctIndex,
            asker: uid,
        };

        let msg = `╭───〔 🧠 QUIZ 〕───⬣\n│ ${question.q}\n│\n`;
        shuffled.forEach((o, i) => {
            msg += `│ ${i + 1}. ${o}\n`;
        });
        msg += `╰──────────────⬣\n\n💡 Reply with: quiz <answer or number>\n💰 Reward: $300`;

        api.sendMessage(msg, tid);
    }
};
