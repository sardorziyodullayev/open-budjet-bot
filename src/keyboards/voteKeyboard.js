const { InlineKeyboard } = require("grammy");

const voteKeyboard = new InlineKeyboard().url(
	"🌐 Ovoz berish ✅",
	"https://openbudget.uz/boards/initiatives/initiative/50/5904380c-5914-4fe5-993e-62a74dcc545d",
);

module.exports = voteKeyboard;
