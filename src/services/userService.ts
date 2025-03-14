import fs from "fs-extra";
import { User } from "../types/user";

const usersFile = "src/data/users.json";

// Yangi foydalanuvchini tekshirish va saqlash
export async function handleNewUser(user: User): Promise<boolean> {
   await fs.ensureFile(usersFile);
   let users: User[] = [];

   try {
      users = await fs.readJSON(usersFile);
   } catch (error) {
      console.log("Foydalanuvchilar ro‘yxati bo‘sh yoki mavjud emas.");
   }

   // Agar foydalanuvchi allaqachon bazada bo'lsa, hech narsa qilmaymiz
   if (users.some((u) => u.id === user.id)) {
      return false;
   }

   // Yangi foydalanuvchini qo'shamiz
   users.push(user);
   await fs.writeJSON(usersFile, users);
   return true;
}

// Foydalanuvchi oldin botdan foydalanganini tekshirish
export async function isReturningUser(userId: number): Promise<boolean> {
   await fs.ensureFile(usersFile);
   let users: User[] = [];

   try {
      users = await fs.readJSON(usersFile);
   } catch (error) {
      return false;
   }

   return users.some((u) => u.id === userId);
}
