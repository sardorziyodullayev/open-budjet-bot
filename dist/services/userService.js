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
exports.handleNewUser = handleNewUser;
exports.isReturningUser = isReturningUser;
const fs_extra_1 = __importDefault(require("fs-extra"));
const usersFile = "src/data/users.json";
// Yangi foydalanuvchini tekshirish va saqlash
function handleNewUser(user) {
    return __awaiter(this, void 0, void 0, function* () {
        yield fs_extra_1.default.ensureFile(usersFile);
        let users = [];
        try {
            users = yield fs_extra_1.default.readJSON(usersFile);
        }
        catch (error) {
            console.log("Foydalanuvchilar ro‘yxati bo‘sh yoki mavjud emas.");
        }
        // Agar foydalanuvchi allaqachon bazada bo'lsa, hech narsa qilmaymiz
        if (users.some((u) => u.id === user.id)) {
            return false;
        }
        // Yangi foydalanuvchini qo'shamiz
        users.push(user);
        yield fs_extra_1.default.writeJSON(usersFile, users);
        return true;
    });
}
// Foydalanuvchi oldin botdan foydalanganini tekshirish
function isReturningUser(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        yield fs_extra_1.default.ensureFile(usersFile);
        let users = [];
        try {
            users = yield fs_extra_1.default.readJSON(usersFile);
        }
        catch (error) {
            return false;
        }
        return users.some((u) => u.id === userId);
    });
}
