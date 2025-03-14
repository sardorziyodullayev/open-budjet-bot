import fs from "fs";
import TelegramBot from "node-telegram-bot-api";

const VOTES_FILE = "votes.json";

interface Vote {
   userId: number;
   username: string;
   date: string;
   photoId: string;
   status: string;
}

export const checkVotes = (bot: TelegramBot, chatId: number): void => {
   if (!fs.existsSync(VOTES_FILE)) {
      bot.sendMessage(chatId, "❌ Hech qanday rasm saqlanmagan.");
      return;
   }

   const votes: Vote[] = JSON.parse(fs.readFileSync(VOTES_FILE, "utf8"));

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

export const approveVote = (bot: TelegramBot, userId: number): void => {
   if (!fs.existsSync(VOTES_FILE)) return;

   let votes: Vote[] = JSON.parse(fs.readFileSync(VOTES_FILE, "utf8"));
   votes = votes.map((vote: Vote) =>
      vote.userId === userId ? { ...vote, status: "approved" } : vote
   );

   fs.writeFileSync(VOTES_FILE, JSON.stringify(votes, null, 2), "utf8");
   bot.sendMessage(userId, "🎉 Tabriklaymiz! Ovoz berish tasdiqlandi. 50,000 so‘m mukofot hisobingizga o'tkazildi.");
};

export const rejectVote = (bot: TelegramBot, userId: number): void => {
   if (!fs.existsSync(VOTES_FILE)) return;

   let votes: Vote[] = JSON.parse(fs.readFileSync(VOTES_FILE, "utf8"));
   votes = votes.map((vote: Vote) =>
      vote.userId === userId ? { ...vote, status: "rejected" } : vote
   );

   fs.writeFileSync(VOTES_FILE, JSON.stringify(votes, null, 2), "utf8");
   bot.sendMessage(userId, "❌ Ovoz berish rad etildi.");
};
