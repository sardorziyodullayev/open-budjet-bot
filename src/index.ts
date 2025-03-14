import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { handleNewUser } from "./services/userService";
import { sendWelcomeMessage, sendChannelMessages, sendReferralLink } from "./services/telegramService";
import { User } from "./types/user";

dotenv.config();

const bot = new TelegramBot(process.env.BOT_TOKEN as string, { polling: true });
const VOTES_FILE = path.join(__dirname, "data", "votes.json"); // Ovoz bergan foydalanuvchilar ro‘yxati saqlanadigan fayl
const ADMIN_ID = process.env.ADMIN_ID ? Number(process.env.ADMIN_ID) : 0; // Admin Telegram ID'si
const pendingVotes = new Set();

// 🛠 JSON fayldan ovozlarni yuklash funksiyasi
function loadVotes() {
   if (fs.existsSync(VOTES_FILE)) {
      try {
         return JSON.parse(fs.readFileSync(VOTES_FILE, "utf8"));
      } catch (error) {
         console.error("❌ votes.json faylni o‘qishda xatolik:", error);
         return [];
      }
   }
   return [];
}

// ✅ Foydalanuvchilarni qayta ishlash
bot.on("message", async (msg) => {
   const chatId = msg.chat.id;
   const text = msg.text || "";

   // Agar foydalanuvchi "/start" buyruğini bersa
   if (text === "/start") {
      sendWelcomeMessage(bot, chatId);
      sendChannelMessages(bot, chatId);
   } 

   // 📥 "Ovoz berish" tugmasi bosilganda
   else if (text === "📥 Ovoz berish") {
      bot.sendMessage(chatId, 
         "🚀 Iltimos, quyidagi tugma orqali saytda ovoz bering:\n\n" +
         "<a href='https://openbudget.uz/boards/initiatives/initiative/50/e9c12c39-62f1-4fc6-979e-3c3e35f2bc2d'>📥 Ovoz berish</a>\n\n" +
         "✅ Ovoz berganingizdan so'ng, 'Botda ovoz berdim' tugmasi paydo bo‘ladi!",
         {
            parse_mode: "HTML",
            reply_markup: {
               inline_keyboard: [
                  [{ text: "🔗 Saytda ovoz berish", url: "https://openbudget.uz/boards/initiatives/initiative/50/aa107adf-552b-4200-ab71-392f1648f410" }],
                  [{ text: "🤖 Botda ovoz berish", url: "https://t.me/ochiqbudjet_4_bot?start=050372066006" }],
                  [{ text: "✅ Ovoz berdim", callback_data: "confirm_vote" }]
               ]  
            }
         }
      );
   } 

   // 💳 "Hisobim" tugmasi bosilganda
   else if (text === "💳 Hisobim") {
      bot.sendMessage(chatId, "💰 Sizning hisobingizda 0 so'm");
   }

   // 👥 "Do‘stlarni taklif qilish" tugmasi bosilganda
   else if (text === "👥 Do‘stlarni taklif qilish") {
      if (!msg.from?.id) {
         return bot.sendMessage(chatId, "❌ Foydalanuvchi ID'sini aniqlab bo‘lmadi.");
      }
      sendReferralLink(bot, chatId, msg.from.id);
   }
});

// 🛠 Tekshirilmagan ovozlarni ko‘rish uchun admin buyrug‘i
bot.onText(/\/check_votes/, (msg) => {
   const chatId = msg.chat.id;
   if (chatId !== ADMIN_ID) {
      bot.sendMessage(chatId, "❌ Siz admin emassiz.");
      return;
   }

   let votes = loadVotes();
   const pendingVotes = votes.filter((vote: any) => vote.status === "pending");

   if (pendingVotes.length === 0) {
      bot.sendMessage(chatId, "✅ Hozircha tekshirilmagan ovozlar yo‘q.");
      return;
   }

   pendingVotes.forEach((vote: any) => {
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
bot.on("callback_query", async (query) => {
   if (!query.data) return; // Agar callback data yo‘q bo‘lsa, chiqamiz

   const chatId = query.message?.chat.id;
   if (!chatId) return;

   let votes = loadVotes();
   const userId = query.data.split("_")[1];

   try {
      // **1. Dastlab admin tugmani bosganini tasdiqlaymiz**
      await bot.answerCallbackQuery(query.id);

      if (query.data === "confirm_vote") {
         pendingVotes.add(chatId); 
         // ✅ Ovoz berganimni tasdiqlash tugmasi bosilganda
         bot.sendMessage(chatId, "😊 Ovoz berganingiz uchun rahmat! Endi iltimos, ekran nusxasini yuboring. 📸");
      } 
      else if (query.data.startsWith("approve_")) {
         let userVote = votes.find((vote: any) => vote.userId.toString() === userId);

         // ✅ Agar foydalanuvchi allaqachon tasdiqlangan bo‘lsa, takror xabar yuborilmaydi
         if (userVote && userVote.status === "approved") {
            bot.sendMessage(chatId, "❗ Ushbu foydalanuvchi allaqachon tasdiqlangan.");
            return;
         }

         // ✅ Statusni yangilaymiz
         votes = votes.map((vote: any) =>
            vote.userId.toString() === userId ? { ...vote, status: "approved" } : vote
         );
         fs.writeFileSync(VOTES_FILE, JSON.stringify(votes, null, 2), "utf8");

         try {
            bot.sendMessage(Number(userId), "✅ Sizning ovozingiz tasdiqlandi! Mukofot olish uchun administrator bilan bog‘laning.");
         } catch (error) {
            console.error(`❌ Xabar yuborishda xatolik: ${error}`);
         }

         bot.sendMessage(chatId, `✅ @${userId} ning ovozi tasdiqlandi.`);
      } else if (query.data.startsWith("reject_")) {
         votes = votes.filter((vote: any) => vote.userId.toString() !== userId);
         fs.writeFileSync(VOTES_FILE, JSON.stringify(votes, null, 2), "utf8");

         try {
            bot.sendMessage(Number(userId), "❌ Siz yuborgan rasm tasdiqlanmadi. Iltimos, yana urinib ko‘ring.");
         } catch (error) {
            console.error(`❌ Xabar yuborishda xatolik: ${error}`);
         }

         bot.sendMessage(chatId, `❌ @${userId} ning ovozi rad etildi.`);
      }
   } catch (error) {
      console.error(`❌ Callback javobida xatolik: ${error}`);
   }
});


// 🖼 Rasm yuborilganda
bot.on("photo", (msg) => {
   if (!msg.photo || !msg.chat.id) return; 
   const fileId = msg.photo[msg.photo.length - 1].file_id; // Eng katta o‘lchamdagi rasmni olish

   const chatId = msg.chat.id;
   if (!pendingVotes.has(chatId)) return; // Agar foydalanuvchi ovoz berganini tasdiqlamagan bo‘lsa, chiqamiz
   pendingVotes.delete(chatId); // Foydalanuvchini ro‘yxatdan o‘chiramiz
   bot.sendMessage(chatId, "✅ Ekran nusxangiz qabul qilindi. Rahmat!");
   
   // Ovoz berilganini ro‘yxatga olish
   let votes = loadVotes();
   votes.push({
      userId: msg.from?.id,
      username: msg.from?.username || "Noma'lum",
      photoId: fileId,
      date: new Date().toISOString(),
      status: "pending"
   });
   fs.writeFileSync(VOTES_FILE, JSON.stringify(votes, null, 2), "utf8");
});




console.log("🚀 Bot ishga tushdi...");
