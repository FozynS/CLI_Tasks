const input = document.querySelector('.input');
const saveButton = document.querySelector('.save_btn');
const list = document.querySelector('.list');
const filtersSelect = document.querySelector('.filters');

let result = [];
const maxInputSize = 20;

const saveWords = () => {
  const inputValue = input.value;

  if(inputValue.toLowerCase() === 'exit') {
    result = [];
    list.innerHTML = '';
    input.value = '';
    return;
  };

  if(result.length >= maxInputSize) {
    alert('Too much words and numbers');
    return;
  };

  const matchWords = inputValue.match(/\b\w+\b/gm);
  if(matchWords) {
    result = result.concat(matchWords);
  };

  onShowWords();
};

const applyFilters = (words, filter) => {
  let filteredWords = [...words];
  
  switch (filter) {
    case 'alphabetically':
      filteredWords.sort((a, b) => a.localeCompare(b));
      break;
    case 'asc':
      filteredWords.sort((a, b) => a.length - b.length);
      break;
    case 'desc':
      filteredWords.sort((a, b) => b.length - a.length);
      break;
    case 'unique_words':
      filteredWords = Array.from(new Set(filteredWords));
      break;
    case 'unique_values':
      filteredWords = [...new Set(filteredWords)];
      break;
    default:
      break;
  }

  return filteredWords;
};

const onShowWords = () => {
  list.innerHTML = '';
  input.value = '';
  const filter = filtersSelect.value;
  const filteredWords = applyFilters(result, filter);

  filteredWords.forEach(word => {
    const li = document.createElement('li');
    li.innerHTML = word;
    list.appendChild(li);
  });
};

filtersSelect.addEventListener('change', onShowWords);
saveButton.addEventListener('click', saveWords);