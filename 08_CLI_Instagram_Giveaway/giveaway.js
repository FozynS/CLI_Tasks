import fs from 'fs';
import path from 'path';

// const folderPath = './200k_words';
const folderPath = './2kk_words';

function readFilesFromFolder(folderPath) {
  const filesContent = [];
  const files = fs.readdirSync(folderPath);

  files.forEach(file => {

    const filePath = path.join(folderPath, file);
    const fileData = fs.readFileSync(filePath, 'utf8');
    const frases = fileData.split('\n').map(line => line.trim()).filter(Boolean);

    filesContent.push(frases);
  })

  return filesContent;
};

const filesContent = readFilesFromFolder(folderPath);

function countUniquePhrases(filesContent) {
  const uniquePhrases = new Set();

  filesContent.forEach(fileContent => {
    fileContent.forEach(username => uniquePhrases.add(username));
  });
  return uniquePhrases.size;
};

function countPhrasesInAllFiles(filesContent) {
  const commonPhrases = new Set(filesContent[0]);

  filesContent.forEach(fileContent => {

    const currentSet = new Set(fileContent);
  
      for (let phrase of commonPhrases) {
        if (!currentSet.has(phrase)) {
          commonPhrases.delete(phrase);
        }
      }
  });

  return commonPhrases.size;
};

function countPhrasesInAtLeast10Files(filesContent) {
  const countPhrases = {};
  let count = 0;

  filesContent.forEach(fileContent => {
    const fileSet = new Set(fileContent);
    
    fileSet.forEach(phrase => {
      if(phrase in countPhrases) {
        countPhrases[phrase]++;
      } else {
        countPhrases[phrase] = 1;
      }
    });

  });
  
  for (let phrase in countPhrases) {
    if (countPhrases[phrase] >= 10) {
      count++;
    }
  }

  return count;
};

console.time('Time for all functions');

console.time('Count Unique Phrases');
console.log('Unique Phrases:', countUniquePhrases(filesContent));
console.timeEnd('Count Unique Phrases');

console.time('Count Phrases in All Files');
console.log('Phrases in All Files:', countPhrasesInAllFiles(filesContent));
console.timeEnd('Count Phrases in All Files');

console.time('Count Usernames in At Least 10 Files');
console.log('Usernames in At Least 10 Files:', countPhrasesInAtLeast10Files(filesContent));
console.timeEnd('Count Usernames in At Least 10 Files');

console.timeEnd('Time for all functions');

