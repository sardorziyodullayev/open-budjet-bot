const { InlineKeyboard } = require("grammy");

module.exports = async ctx => {
	const userPhone = ctx.message.text;

	// Raqamni tekshirish
	if (!/^\d{9,12}$/.test(userPhone)) {
		return ctx.reply(
			"❌ Noto‘g‘ri format! Iltimos, telefon raqamingizni to‘g‘ri kiriting. \nNa'muna: 991234567",
		);
	}

	// Ovoz berish tugmasi
	const voteButton = new InlineKeyboard().url(
		"🌟 OVOZ BERISH ✅",
		"https://openbudget.uz/boards/initiatives/initiative/50/5904380c-5914-4fe5-993e-62a74dcc545d",
	);

	// Foydalanuvchiga xabar yuborish
	await ctx.reply(
		"✅ Telefon raqamingiz qabul qilindi!\n\n" +
			"📢 Endi *“Ovoz berish ✅”* tugmasini bosing va ovoz bering!\n\n" +
			"📸 Ovoz berganingizni tasdiqlash uchun *skrinsotni botga yuboring!*\n\n" +
			"⏳ *5 daqiqa kuting yoki saytdan ovoz berib, skrinsot yuboring.*\n\n" +
			"👉 [Ovoz berish uchun bu yerni bosing](https://openbudget.uz/boards/initiatives/initiative/50/5904380c-5914-4fe5-993e-62a74dcc545d)",
		{
			parse_mode: "Markdown",
			reply_markup: voteButton,
		},
	);
};
