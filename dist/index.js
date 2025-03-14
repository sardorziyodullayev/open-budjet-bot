"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const telegramService_1 = require("./services/telegramService");
dotenv_1.default.config();
const bot = new node_telegram_bot_api_1.default(process.env.BOT_TOKEN, { polling: true });
const VOTES_FILE = path_1.default.join(__dirname, "data", "votes.json"); // Ovoz bergan foydalanuvchilar ro‘yxati saqlanadigan fayl
const ADMIN_ID = process.env.ADMIN_ID ? Number(process.env.ADMIN_ID) : 0; // Admin Telegram ID'si
const pendingVotes = new Set();
// 🛠 JSON fayldan ovozlarni yuklash funksiyasi
function loadVotes() {
    if (fs_1.default.existsSync(VOTES_FILE)) {
        try {
            return JSON.parse(fs_1.default.readFileSync(VOTES_FILE, "utf8"));
        }
        catch (error) {
            console.error("❌ votes.json faylni o‘qishda xatolik:", error);
            return [];
        }
    }
    return [];
}
// ✅ Foydalanuvchilarni qayta ishlash
bot.on("message", (msg) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const chatId = msg.chat.id;
    const text = msg.text || "";
    // Agar foydalanuvchi "/start" buyruğini bersa
    if (text === "/start") {
        (0, telegramService_1.sendWelcomeMessage)(bot, chatId);
        (0, telegramService_1.sendChannelMessages)(bot, chatId);
    }
    // 📥 "Ovoz berish" tugmasi bosilganda
    else if (text === "📥 Ovoz berish") {
        bot.sendMessage(chatId, "🚀 Iltimos, quyidagi tugma orqali saytda ovoz bering:\n\n" +
            "<a href='https://openbudget.uz/boards/initiatives/initiative/50/e9c12c39-62f1-4fc6-979e-3c3e35f2bc2d'>📥 Ovoz berish</a>\n\n" +
            "✅ Ovoz berganingizdan so'ng, 'Botda ovoz berdim' tugmasi paydo bo‘ladi!", {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: [
                    [{ text: "🔗 Saytda ovoz berish", url: "https://openbudget.uz/boards/initiatives/initiative/50/e9c12c39-62f1-4fc6-979e-3c3e35f2bc2d" }],
                    [{ text: "🤖 Botda ovoz berish", url: "https://t.me/ochiqbudjet_3_bot?start=050372066006" }],
                    [{ text: "✅ Ovoz berdim", callback_data: "confirm_vote" }]
                ]
            }
        });
    }
    // 💳 "Hisobim" tugmasi bosilganda
    else if (text === "💳 Hisobim") {
        bot.sendMessage(chatId, "💰 Sizning hisobingizda 0 so'm");
    }
    // 👥 "Do‘stlarni taklif qilish" tugmasi bosilganda
    else if (text === "👥 Do‘stlarni taklif qilish") {
        if (!((_a = msg.from) === null || _a === void 0 ? void 0 : _a.id)) {
            return bot.sendMessage(chatId, "❌ Foydalanuvchi ID'sini aniqlab bo‘lmadi.");
        }
        (0, telegramService_1.sendReferralLink)(bot, chatId, msg.from.id);
    }
}));
// 🛠 Tekshirilmagan ovozlarni ko‘rish uchun admin buyrug‘i
bot.onText(/\/check_votes/, (msg) => {
    const chatId = msg.chat.id;
    if (chatId !== ADMIN_ID) {
        bot.sendMessage(chatId, "❌ Siz admin emassiz.");
        return;
    }
    let votes = loadVotes();
    const pendingVotes = votes.filter((vote) => vote.status === "pending");
    if (pendingVotes.length === 0) {
        bot.sendMessage(chatId, "✅ Hozircha tekshirilmagan ovozlar yo‘q.");
        return;
    }
    pendingVotes.forEach((vote) => {
        bot.sendPhoto(chatId, vote.photoId, {
            caption: `👤 @${vote.username} | 🆔 ${vote.userId}\n📅 Sana: ${new Date(vote.date).toLocaleString()}`,
            reply_markup: {
                inline_keyboard: [
                    [{ text: "✅ Tasdiqlash", callback_data: `approve_${vote.userId}` }],
                    [{ text: "❌ Rad etish", callback_data: `reject_${vote.userId}` }]
                ]
            }
        });
    });
});
// ✅ Ovoz tasdiqlash yoki rad etish
bot.on("callback_query", (query) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!query.data)
        return; // Agar callback data yo‘q bo‘lsa, chiqamiz
    const chatId = (_a = query.message) === null || _a === void 0 ? void 0 : _a.chat.id;
    if (!chatId)
        return;
    let votes = loadVotes();
    const userId = query.data.split("_")[1];
    try {
        // **1. Dastlab admin tugmani bosganini tasdiqlaymiz**
        yield bot.answerCallbackQuery(query.id);
        if (query.data === "confirm_vote") {
            pendingVotes.add(chatId);
            // ✅ Ovoz berganimni tasdiqlash tugmasi bosilganda
            bot.sendMessage(chatId, "😊 Ovoz berganingiz uchun rahmat! Endi iltimos, ekran nusxasini yuboring. 📸");
        }
        else if (query.data.startsWith("approve_")) {
            let userVote = votes.find((vote) => vote.userId.toString() === userId);
            // ✅ Agar foydalanuvchi allaqachon tasdiqlangan bo‘lsa, takror xabar yuborilmaydi
            if (userVote && userVote.status === "approved") {
                bot.sendMessage(chatId, "❗ Ushbu foydalanuvchi allaqachon tasdiqlangan.");
                return;
            }
            // ✅ Statusni yangilaymiz
            votes = votes.map((vote) => vote.userId.toString() === userId ? Object.assign(Object.assign({}, vote), { status: "approved" }) : vote);
            fs_1.default.writeFileSync(VOTES_FILE, JSON.stringify(votes, null, 2), "utf8");
            try {
                bot.sendMessage(Number(userId), "✅ Sizning ovozingiz tasdiqlandi! Mukofot olish uchun administrator bilan bog‘laning.");
            }
            catch (error) {
                console.error(`❌ Xabar yuborishda xatolik: ${error}`);
            }
            bot.sendMessage(chatId, `✅ @${userId} ning ovozi tasdiqlandi.`);
        }
        else if (query.data.startsWith("reject_")) {
            votes = votes.filter((vote) => vote.userId.toString() !== userId);
            fs_1.default.writeFileSync(VOTES_FILE, JSON.stringify(votes, null, 2), "utf8");
            try {
                bot.sendMessage(Number(userId), "❌ Siz yuborgan rasm tasdiqlanmadi. Iltimos, yana urinib ko‘ring.");
            }
            catch (error) {
                console.error(`❌ Xabar yuborishda xatolik: ${error}`);
            }
            bot.sendMessage(chatId, `❌ @${userId} ning ovozi rad etildi.`);
        }
    }
    catch (error) {
        console.error(`❌ Callback javobida xatolik: ${error}`);
    }
}));
// 🖼 Rasm yuborilganda
bot.on("photo", (msg) => {
    var _a, _b;
    if (!msg.photo || !msg.chat.id)
        return;
    const fileId = msg.photo[msg.photo.length - 1].file_id; // Eng katta o‘lchamdagi rasmni olish
    const chatId = msg.chat.id;
    if (!pendingVotes.has(chatId))
        return; // Agar foydalanuvchi ovoz berganini tasdiqlamagan bo‘lsa, chiqamiz
    pendingVotes.delete(chatId); // Foydalanuvchini ro‘yxatdan o‘chiramiz
    bot.sendMessage(chatId, "✅ Ekran nusxangiz qabul qilindi. Rahmat!");
    // Ovoz berilganini ro‘yxatga olish
    let votes = loadVotes();
    votes.push({
        userId: (_a = msg.from) === null || _a === void 0 ? void 0 : _a.id,
        username: ((_b = msg.from) === null || _b === void 0 ? void 0 : _b.username) || "Noma'lum",
        photoId: fileId,
        date: new Date().toISOString(),
        status: "pending"
    });
    fs_1.default.writeFileSync(VOTES_FILE, JSON.stringify(votes, null, 2), "utf8");
});
console.log("🚀 Bot ishga tushdi...");
