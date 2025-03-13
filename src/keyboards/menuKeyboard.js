const { Keyboard } = require("grammy");

const menuKeyboard = new Keyboard()
    .text("🗳 Ovoz berish").row()
    .text("💰 Hisobim").text("💸 Pul yechib olish").row()
    .text("🔗 Referral");

module.exports = menuKeyboard;
