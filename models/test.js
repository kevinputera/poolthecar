const { getClient } = require('../db');
const { Account } = require('./account');
const { Message } = require('./message');

(async () => {
  const client = await getClient();

  const account1 = new Account('A', '-', '-', 'male', '-', '-');
  const account2 = new Account('B', '-', '-', 'male', '-', '-');
  await account1.save();
  await account2.save();

  const message1 = new Message(null, 'A', 'B', 'Hi', null);
  const message2 = new Message(null, 'B', 'A', 'Hi back', null);

  const id1 = (await message1.save()).id;
  const id2 = (await message2.save()).id;

  console.log(id1, id2);

  console.log(await Message.findByUsers('A', 'B'));
})()
  .then(() => console.log('Test succesful'))
  .catch(e => console.log('Test unsucessful', e));
