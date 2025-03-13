const { Keyboard } = require("grammy");

module.exports = async ctx => {
	const channelId = -1002365133761; // Kanal ID
	const messageIds = [4, 5]; // Kanaldan olib kelinadigan xabarlar IDlari

	// Kanaldan 4 va 5-xabarlarni yuborish
	for (let messageId of messageIds) {
		try {
			await ctx.api.copyMessage(ctx.chat.id, channelId, messageId);
		} catch (error) {
			console.error("Xatolik:", error);
		}
	}

	// Menu keyboard
	const menuKeyboard = new Keyboard()
		.text("📦 Ovoz berish")
		.row()
		.text("💰 Hisobim")
		.text("💸 Pul yechib olish")
		.row()
		.text("🔗 Referral")
		.resized();

	// Tugmalar bilan xabar yuborish
	await ctx.reply("Quyidagi menyudan foydalaning:", {
		reply_markup: menuKeyboard,
	});
};
