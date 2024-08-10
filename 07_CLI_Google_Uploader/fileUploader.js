import inquirer from "inquirer";
import { confirm, input } from "@inquirer/prompts";
import axios from "axios";
import fs from "fs";
import path from "path";
import { google } from "googleapis";

const KEYFILEPATH = "./credentials.json";
const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

async function authorize() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPES,
  });
  return await auth.getClient();
}

async function uploadFile(auth, filePath) {
  const drive = google.drive({ version: "v3", auth });

  const fileMetadata = {
    name: path.basename(filePath),
    parents: ["1qnjiyZ68Egz7XbzVbkwJZjeP7_JiqG5B"],
  };
  const media = {
    body: fs.createReadStream(filePath),
  };

  try {
    console.log("Attempting to upload file...");
    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: "id",
    });

    const fileId = response.data?.id;
    if (fileId) {
      const fileLink = `https://drive.google.com/uc?id=${fileId}&export=view`;
      return fileLink;
    } else {
      throw new Error("File ID not found in the response");
    }
  } catch (error) {
    console.error("Error uploading file:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
  }
}

async function shortenLink(url) {
  try {
    const response = await axios.post(
      "https://api.tinyurl.com/create",
      {
        url: url,
      },
      {
        headers: {
          Authorization:
            "Bearer VncRcD3o07UONd3ROEDXmYlNrFOL8CBGtpkP8WlWzckljnM0AD7o3o9j13kQ",
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.data.tiny_url;
  } catch (error) {
    console.error("Error shortening link:", error.message);
  }
}

async function main() {
  const { filePath } = await inquirer.prompt([
    {
      type: "prompt",
      name: "filePath",
      message:
        "Drag and drop your image to terminal and press Enter for upload",
    },
  ]);

  const fullPath = filePath.replace(/^['"]|['"]$/g, "");
  const matchName = fullPath.match(/([^\/\\]+)(?=\.[^\/\\]+$)/gm);
  const matchExtension = fullPath.match(/\.(jpg|jpeg|png|gif|bmp|tiff|webp)$/i);

  const fileName = matchName[0];
  const fileExtension = matchExtension[0];

  console.log(
    `Path to file: ${fullPath} \nFile name:${fileName} \nFile exstension:${fileExtension} `
  );

  let changeName = await confirm({
    type: "confirm",
    message: `You're uploading file with the name: ${
      fileName + fileExtension
    }. Would you like to change it?`,
  });
  let finalFilePath = fullPath;

  if (changeName) {
    const newFileName = await input({
      type: "input",
      message:
        "Enter new file name (WITHOUT extension aka .jpg .jpeg .png etc.)",
    });
    finalFilePath = fullPath.replace(matchName, newFileName);
    fs.renameSync(fullPath, finalFilePath);
    console.log(`${newFileName} \n${filePath} \nSuccesfully uploaded! `);
  }

  const auth = await authorize();
  const fileLink = await uploadFile(auth, finalFilePath);

  let shortLink = await confirm({
    type: "confirm",
    message: "Would you like to shorten your link?",
  });

  if (shortLink) {
    const tinyURL = await shortenLink(fileLink);
    console.log(`Shorten link: ${tinyURL}`);
  }
}

main();
