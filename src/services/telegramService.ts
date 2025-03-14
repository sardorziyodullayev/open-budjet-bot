import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";

dotenv.config();

const welcomeText = `
Assalomu alaykum! 👋  

Bu bot orqali siz **Open Budget** loyihalarida ovoz berishingiz va hisobingizni tekshirishingiz mumkin. ✨  

🔗 Ovoz berish uchun havola:  
https://openbudget.uz/boards/initiatives/initiative/50/aa107adf-552b-4200-ab71-392f1648f410  

💰 Xar bir ovoz uchun *50 000 so‘m* pul mukofotiga ega bolasiz  

👨‍💼 ADMIN: @open_adm1n2025  

👇 Quyidagi tugmalardan birini tanlang!  
`;

export function sendWelcomeMessage(bot: TelegramBot, chatId: number) {
   bot.sendMessage(chatId, welcomeText, {
      parse_mode: "HTML",
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
export function sendChannelMessages(bot: TelegramBot, chatId: number) {
   const channelId = -1002365133761; // Kanal ID
   const messageIds = [4, 5]; // Yuboriladigan xabarlar ID-lari

   messageIds.forEach((messageId) => {
      bot.forwardMessage(chatId, channelId, messageId).catch((err) => {
         console.error(`Xabarni jo‘natishda xatolik: ${err.message}`);
      });
   });
}

// Do‘stlarni taklif qilish tugmasi uchun referal havola yuborish
export function sendReferralLink(bot: TelegramBot, chatId: number, userId: number) {
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



