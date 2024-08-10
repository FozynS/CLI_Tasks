//** url for bot: t.me/lamda_echo_test_bot */
import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";

dotenv.config();

const TOKEN = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(TOKEN, { polling: true });

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const userFirstName = msg.from.first_name;
  const userLastName = msg.from.last_name || "";
  const userInfo = `${userFirstName} ${userLastName}`;

  const replyText = `Вы написали"${text}"`;

  if (text.toLowerCase() === "photo") {
    console.log(`Пользователь ${userInfo} запросил картинку`);
    try {
      const response = await fetch("https://picsum.photos/200/300");
      const imageUrl = response.url;

      bot.sendPhoto(chatId, imageUrl);
    } catch (error) {
      console.error("Ошибка при получении изображения:", error);
      bot.sendMessage(
        chatId,
        "Извините, произошла ошибка при получении изображения."
      );
    }
  } else {
    console.log(`Пользователь ${userInfo} написал: ${text}`);
    bot.sendMessage(chatId, replyText);
  }
});

console.log("Telegram Bot successfully started... ");
