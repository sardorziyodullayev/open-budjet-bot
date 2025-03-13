const { Bot, InlineKeyboard } = require("grammy");
const { config } = require("./config/config");
const startHandler = require("./handlers/startHandler");
const voteHandler = require("./handlers/voteHandler");
const phoneHandler = require("./handlers/phoneHandler");

const bot = new Bot(config.BOT_TOKEN);

// Start bosilganda ishlovchi handler
bot.command("start", startHandler);

// Ovoz berish tugmasi bosilganda ishlovchi handler
bot.callbackQuery("vote", voteHandler);

// Telefon raqamini yuborganda ishlovchi handler
bot.on("message:text", phoneHandler);

bot.start();
