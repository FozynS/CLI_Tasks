import { input, select, confirm } from '@inquirer/prompts';

async function main() {
  const users = [];
  let addMoreUsers = true;

  while(addMoreUsers) {
    const name = await input({ message: 'Enter the name (or press ENTER to finish)' });
    if(name === '') break;    

    const gender = await select({
      message: 'Select a package manager',
      choices: [
        {name: 'Male', value: 'Male'},
        {name: 'Female', value: 'Female'},
        { name: 'Other', value: 'Other' },
      ],
    });

    const age = await input({ message: 'Enter your age', validate: validateAge });

    users.push({name, gender, age});

    addMoreUsers = await confirm({ message: 'Do you want to add one more person?' });
  }

  if (users.length > 0) {
    const searchForUser = await confirm({ message: 'Do you want to search for a user by name?' });

    if (searchForUser) {
      const searchTerm = await input({ message: 'Type part of the name to search:' });

      const foundUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

      if (foundUsers.length > 0) {
        foundUsers.forEach(user => {
          console.log(`User found: ${JSON.stringify(user, null, 2)}`);
        });
      } else {
        console.log('User not found.');
      }
    }
  }

  console.log('Goodbye!');
};

function validateAge(age) {
  const ageNumber = parseInt(age, 10);
  return !isNaN(ageNumber) && ageNumber > 0 ? true : 'Please enter a valid age.';
};

main().catch(error => console.error(error));