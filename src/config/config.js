require("dotenv").config();

module.exports = {
	BOT_TOKEN: process.env.BOT_TOKEN,
	CHANNEL_ID: process.env.CHANNEL_ID,
	MESSAGE_IDS: process.env.MESSAGE_IDS.split(",").map(Number),
};
