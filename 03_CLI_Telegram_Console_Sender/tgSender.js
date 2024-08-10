//** url for bot: t.me/lambda_tg_test_bot */

import TelegramBot from "node-telegram-bot-api";
import { Command } from 'commander';
import dotenv from "dotenv";

import fs from 'fs';
import path from 'path';

dotenv.config();

const TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = '389873252';

const bot = new TelegramBot(TOKEN, {polling: true});
const program = new Command();

program
  .command('message <text>')
  .alias('m')
  .description('Send a message via Telegram bot')
  .action((text) => {
    const chatId = CHAT_ID;
    bot.sendMessage(chatId, text)
      .then(() => {
        console.error('Message sent successfully!');
        process.exit(0);
      })
      .catch((err) => {
        console.error('Error when sending a message:', err);
        process.exit(1);
      })
  });

program
  .command('photo <filePath>')
  .alias('p')
  .description('Send photo via Telegram bot')
  .action((filePath) => {
    const chatId = CHAT_ID;
    const absolutePath = path.resolve(filePath);
    if(fs.existsSync(absolutePath)) {
      bot.sendPhoto(chatId, absolutePath)
        .then(() => {
          console.error('Photo sent successfully!');
          process.exit(0);
        })
        .catch(() => {
          console.error('Error when sending a photo:', err);
          process.exit(1);
        })
    } else {
      console.error('File not found:', absolutePath);
      process.exit(1);
    }
  });

if (!process.argv.slice(2).length) {
  program.help();
}

program.parse(process.argv);