"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectVote = exports.approveVote = exports.checkVotes = void 0;
const fs_1 = __importDefault(require("fs"));
const VOTES_FILE = "votes.json";
const checkVotes = (bot, chatId) => {
    if (!fs_1.default.existsSync(VOTES_FILE)) {
        bot.sendMessage(chatId, "❌ Hech qanday rasm saqlanmagan.");
        return;
    }
    const votes = JSON.parse(fs_1.default.readFileSync(VOTES_FILE, "utf8"));
    if (votes.length === 0) {
        bot.sendMessage(chatId, "❌ Hech qanday rasm topilmadi.");
        return;
    }
    for (const vote of votes) {
        if (vote.status === "pending") {
            bot.sendMessage(chatId, `🆔 Foydalanuvchi: @${vote.username} (${vote.userId})\n📅 Sana: ${vote.date}`);
            bot.sendPhoto(chatId, vote.photoId, {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "✅ Tasdiqlash", callback_data: `approve_${vote.userId}` }],
                        [{ text: "❌ Rad etish", callback_data: `reject_${vote.userId}` }]
                    ]
                }
            });
        }
    }
};
exports.checkVotes = checkVotes;
const approveVote = (bot, userId) => {
    if (!fs_1.default.existsSync(VOTES_FILE))
        return;
    let votes = JSON.parse(fs_1.default.readFileSync(VOTES_FILE, "utf8"));
    votes = votes.map((vote) => vote.userId === userId ? Object.assign(Object.assign({}, vote), { status: "approved" }) : vote);
    fs_1.default.writeFileSync(VOTES_FILE, JSON.stringify(votes, null, 2), "utf8");
    bot.sendMessage(userId, "🎉 Tabriklaymiz! Ovoz berish tasdiqlandi. 50,000 so‘m mukofot hisobingizga o'tkazildi.");
};
exports.approveVote = approveVote;
const rejectVote = (bot, userId) => {
    if (!fs_1.default.existsSync(VOTES_FILE))
        return;
    let votes = JSON.parse(fs_1.default.readFileSync(VOTES_FILE, "utf8"));
    votes = votes.map((vote) => vote.userId === userId ? Object.assign(Object.assign({}, vote), { status: "rejected" }) : vote);
    fs_1.default.writeFileSync(VOTES_FILE, JSON.stringify(votes, null, 2), "utf8");
    bot.sendMessage(userId, "❌ Ovoz berish rad etildi.");
};
exports.rejectVote = rejectVote;
