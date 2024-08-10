//** url for bot: t.me/lambda_weather_test_bot */
import TelegramBot from "node-telegram-bot-api";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const weatherDescriptions = {
  "clear sky": "ясное небо",
  "few clouds": "малооблачно",
  "scattered clouds": "рассеянные облака",
  "broken clouds": "переменная облачность",
  "shower rain": "ливневый дождь",
  rain: "дождь",
  thunderstorm: "гроза",
  snow: "снег",
  mist: "туман",
  "light rain": "небольшой дождь",
  "overcast clouds": "пасмурно",
};

const TOKEN = process.env.TELEGRAM_TOKEN;
const weatherApiKey = process.env.WEATHER_API_KEY;

const bot = new TelegramBot(TOKEN, { polling: true });
const chatStates = {};

const getWeatherData = async (city, interval) => {
  const cnt = interval === 3 ? 56 : 28;
  const url = `http://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&cnt=${cnt}&appid=${weatherApiKey}`;
  try {
    const response = await axios.get(url);
    return response;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const getCurrencyData = async () => {
  const url = "https://api.privatbank.ua/p24api/pubinfo?exchange&coursid=5";
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const formatCurrencyData = (data, currency) => {
  if (!data) return "Не удалось получить данные о курсе валют(";

  const currencyData = data.find((item) => item.ccy === currency);
  if (!currencyData) return `Данные для валюты ${currency} не найдены.`;

  return `
  Курс ${currency} к UAH:
  Покупка: ${currencyData.buy}
  Продажа: ${currencyData.sale}
  `;
};

const formatWeatherData = (data) => {
  if (!data) return "Не удалось получить данные о погоде(";

  const forecast = data.data.list;
  let forecastMessage = `Погода в ${data.data.city.name} :\n`;
  let currentDay = "";

  forecast.forEach((item) => {
    const date = new Date(item.dt * 1000);
    const day = date.toLocaleDateString("ru-RU", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    const time = date.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const temperature = `+${item.main.temp.toFixed(1)} °C`;
    const feelsLike = `ощущается: +${item.main.feels_like.toFixed(1)} °C`;
    let description = item.weather[0].description;
    description = weatherDescriptions[description] || description;

    if (currentDay !== day) {
      forecastMessage += `\n${day}:\n`;
      currentDay = day;
    }

    forecastMessage += `  ${time}, ${temperature}, ${feelsLike}, ${description}\n`;
  });

  return forecastMessage;
};

const mainMenuKeyboard = {
  reply_markup: {
    keyboard: [[{ text: "/Погода" }], [{ text: "/Курс валют" }]],
    resize_keyboard: true,
  },
};

const citySelectionKeyboard = {
  reply_markup: {
    inline_keyboard: [
      [{ text: "Лондон", callback_data: "weather_London" }],
      [{ text: "Нью-Йорк", callback_data: "weather_New York" }],
      [{ text: "Киев", callback_data: "weather_Kyiv" }],
      [{ text: "Днепр", callback_data: "weather_Dnipro" }],
      [{ text: "Одесса", callback_data: "weather_Odessa" }],
    ],
  },
};

const intervalSelectionKeyboard = {
  reply_markup: {
    keyboard: [
      [{ text: "С интервалом в 3 часа" }],
      [{ text: "С интервалом в 6 часов" }],
      [{ text: "Предыдущее меню" }],
    ],
    resize_keyboard: true,
  },
};

const currencySelectionKeyboard = {
  reply_markup: {
    keyboard: [
      [{ text: "USD" }],
      [{ text: "EUR" }],
      [{ text: "Предыдущее меню" }],
    ],
    resize_keyboard: true,
  },
};

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  chatStates[chatId] = "main";
  bot.sendMessage(chatId, "Выберите команду:", mainMenuKeyboard);
});

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  try {
    if (!chatStates[chatId]) {
      chatStates[chatId] = "main";
    }

    if (text === "Предыдущее меню") {
      switch (chatStates[chatId]) {
        case "city":
          chatStates[chatId] = "main";
          bot.sendMessage(chatId, "Выберите команду:", mainMenuKeyboard);
          break;
        case "interval":
          chatStates[chatId] = "city";
          bot.sendMessage(chatId, "Выберите команду:", citySelectionKeyboard);
          break;
        case "currency":
          chatStates[chatId] = "main";
          bot.sendMessage(chatId, "Выберите команду:", mainMenuKeyboard);
          break;

        default:
          chatStates[chatId] = "main";
          bot.sendMessage(chatId, "Выберите команду:", mainMenuKeyboard);
          break;
      }
    } else if (text === "/Погода") {
      chatStates[chatId] = "city";
      bot.sendMessage(
        chatId,
        "Выберите город для прогноза погоды:",
        citySelectionKeyboard
      );
    } else if (text === "/Курс валют") {
      chatStates[chatId] = "currency";
      bot.sendMessage(
        chatId,
        "Выберите обменный курс валют.",
        currencySelectionKeyboard
      );
    } else if (
      text === "С интервалом в 3 часа" ||
      text === "С интервалом в 6 часов"
    ) {
      const state = chatStates[chatId];
      if (state && state.city) {
        const interval = text.includes("3") ? 3 : 6;
        const weatherData = await getWeatherData(state.city, interval);
        const formattedData = formatWeatherData(weatherData);

        bot.sendMessage(chatId, formattedData, mainMenuKeyboard);
        chatStates[chatId] = "main";
      }
    } else if (text === "USD" || text === "EUR") {
      const currencyData = await getCurrencyData();
      const formattedData = formatCurrencyData(currencyData, text);
      bot.sendMessage(chatId, formattedData, mainMenuKeyboard);
      chatStates[chatId] = "main";
    }
  } catch (error) {
    console.error("Error processing message:", error);
  }
});

bot.on("callback_query", async (callbackQuery) => {
  const message = callbackQuery.message;
  const data = callbackQuery.data;
  const chatId = message.chat.id;
  if (data === "back_to_main") {
    chatStates[chatId] === "main";
    bot.sendMessage(
      message.chat.id,
      "Приветствую! Выберите, что вас интересует:",
      mainMenuKeyboard
    );
  } else if (data.startsWith("weather_")) {
    const city = data.split("_")[1];
    chatStates[chatId] = "interval";
    bot.sendMessage(
      message.chat.id,
      `Выберите интервал для обновлений погоды в ${city}:`,
      intervalSelectionKeyboard
    );
    chatStates[chatId] = { city, interval: null };
  }
});