"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWelcomeMessage = sendWelcomeMessage;
exports.sendChannelMessages = sendChannelMessages;
exports.sendReferralLink = sendReferralLink;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const welcomeText = `
Assalomu alaykum! 👋  

Bu bot orqali siz **Open Budget** loyihalarida ovoz berishingiz va hisobingizni tekshirishingiz mumkin. ✨  

🔗 Ovoz berish uchun havola:  
https://openbudget.uz/boards/initiatives/initiative/50/e9c12c39-62f1-4fc6-979e-3c3e35f2bc2d  

💰 Xar bir ovoz uchun *50 000 so‘m* pul mukofotiga ega bolasiz  

👨‍💼 ADMIN: @open_adm1n2025  

👇 Quyidagi tugmalardan birini tanlang!  
`;
function sendWelcomeMessage(bot, chatId) {
    bot.sendMessage(chatId, welcomeText, {
        parse_mode: "Markdown",
        reply_markup: {
            keyboard: [
                [{ text: "📥 Ovoz berish" }],
                [{ text: "💳 Hisobim" }],
                [{ text: "👥 Do‘stlarni taklif qilish" }]
            ],
            resize_keyboard: true,
            one_time_keyboard: false
        }
    });
}
// Kanalga joylangan xabarlarni yuborish funksiyasi
function sendChannelMessages(bot, chatId) {
    const channelId = -1002365133761; // Kanal ID
    const messageIds = [4, 5]; // Yuboriladigan xabarlar ID-lari
    messageIds.forEach((messageId) => {
        bot.forwardMessage(chatId, channelId, messageId).catch((err) => {
            console.error(`Xabarni jo‘natishda xatolik: ${err.message}`);
        });
    });
}
// Do‘stlarni taklif qilish tugmasi uchun referal havola yuborish
function sendReferralLink(bot, chatId, userId) {
    if (!process.env.BOT_USERNAME) {
        return bot.sendMessage(chatId, "❌ Bot foydalanuvchi nomi aniqlanmadi. Admin bilan bog‘laning.");
    }
    const referralLink = `https://t.me/${process.env.BOT_USERNAME}?start=ref${userId}`;
    const referralMessage = `👥 Do‘stlaringizni taklif qilish uchun ushbu havolani ulashing:\n\n
   🔗 Taklif havolasi: ${referralLink}\n\n
   🎁 Har bir taklif qilingan do‘stingiz uchun 10000 so'm pul mukofoti olasiz!`;
    bot.sendMessage(chatId, referralMessage, {
        parse_mode: "Markdown",
        reply_markup: {
            inline_keyboard: [
                [{
                        text: "📤 Do‘stlarga yuborish",
                        switch_inline_query: `Do‘stlar! Open Budget loyihasida ovoz bering va mukofotga ega bo‘ling! 🎁\n\nTaklif havolasi: ${referralLink}`
                    }]
            ]
        }
    });
}
