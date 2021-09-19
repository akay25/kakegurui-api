const mongoose = require('mongoose');
const config = require('./config/config');
const logger = require('./config/logger');
const Theme = require('./models/theme.model');

let server;
mongoose.connect(config.mongoose.url, config.mongoose.options).then(async () => {
  logger.info('Connected to MongoDB');

  // Write to db
  const cards = [
    'https://www.listchallenges.com/f/items/2b8027ba-a0ca-4c9e-99c3-9c26a04e1380.jpg',
    'https://www.listchallenges.com/f/items/aa8108de-c974-43d9-8566-984acb962c56.jpg',
    'https://www.listchallenges.com/f/items-dl/5ece0341-70d5-4219-a244-1ca74ea7b208.jpg',
    'https://www.listchallenges.com/f/items/8eae0596-ba4d-4ebe-8806-719c4fe3f076.jpg',
    'https://www.listchallenges.com/f/items/e214119b-4e58-49b8-8079-3456047a189d.jpg',
    'https://www.listchallenges.com/f/items-dl/4d3c9d83-fa3c-48f4-9284-91ac66f38f5f.jpg',
    'https://www.listchallenges.com/f/items/c5328cae-c741-4e46-97bf-da108e49961a.jpg',
    'https://www.listchallenges.com/f/items-dl/7be17270-0cc0-4bca-8951-39dbef8fb94e.jpg',
    'https://www.listchallenges.com/f/items/892f958a-c932-43c4-8901-d0c282f2b572.jpg',
    'https://www.listchallenges.com/f/items/1afd2736-b718-4ee1-96c4-dd5fe4aed00e.jpg',
    'https://www.listchallenges.com/f/items-dl/f3f43d9a-d8f2-4b9c-92af-b86ba4032d78.jpg',
    'https://www.listchallenges.com/f/items/9f47a4ad-4ede-4723-ab45-28c4f24e0b4f.jpg',
    'https://www.listchallenges.com/f/items/6b6c86af-4352-46ab-883f-ec8fa2e2f043.jpg',
    'https://www.listchallenges.com/f/items-dl/b729fe0b-dac6-45f6-ac3e-7e730ff1dba9.jpg',
    'https://www.listchallenges.com/f/items/0ea8e52d-70aa-4cb4-9c9f-640e31dbe230.jpg',
    'https://www.listchallenges.com/f/items/75d8dd54-1d30-429e-a153-cde1d4db89aa.jpg',
    'https://www.listchallenges.com/f/items/3d0c464c-dc12-4168-b2cf-00923b96ab88.jpg',
    'https://www.listchallenges.com/f/items-dl/ca431800-ef8b-43a0-897c-c544098772ff.jpg',
    'https://www.listchallenges.com/f/items/a055fc8f-b207-45a7-91af-67be031a413b.jpg',
    'https://www.listchallenges.com/f/items/6a0a68db-451f-4539-a9e1-ad749be1d12b.jpg',
    'https://www.listchallenges.com/f/items/998686be-f014-4b56-9c02-9c72e551165d.jpg',
    'https://www.listchallenges.com/f/items/c08f7299-041c-471a-8b38-676ae592d171.jpg',
    'https://www.listchallenges.com/f/items/3b1a7b20-16aa-46dd-802f-be12209cc6f4.jpg',
    'https://www.listchallenges.com/f/items/39436b51-c9d0-4314-97fd-ca62373a4f26.jpg',
    'https://www.listchallenges.com/f/items/6b6c86af-4352-46ab-883f-ec8fa2e2f043.jpg',
    'https://www.listchallenges.com/f/items-dl/b729fe0b-dac6-45f6-ac3e-7e730ff1dba9.jpg',
    'https://www.listchallenges.com/f/items/0ea8e52d-70aa-4cb4-9c9f-640e31dbe230.jpg',
    'https://www.listchallenges.com/f/items/75d8dd54-1d30-429e-a153-cde1d4db89aa.jpg',
    'https://www.listchallenges.com/f/items/3d0c464c-dc12-4168-b2cf-00923b96ab88.jpg',
    'https://www.listchallenges.com/f/items-dl/ca431800-ef8b-43a0-897c-c544098772ff.jpg',
    'https://www.listchallenges.com/f/items/a055fc8f-b207-45a7-91af-67be031a413b.jpg',
    'https://www.listchallenges.com/f/items/6a0a68db-451f-4539-a9e1-ad749be1d12b.jpg',
    'https://www.listchallenges.com/f/items/998686be-f014-4b56-9c02-9c72e551165d.jpg',
    'https://www.listchallenges.com/f/items/c08f7299-041c-471a-8b38-676ae592d171.jpg',
    'https://www.listchallenges.com/f/items/3b1a7b20-16aa-46dd-802f-be12209cc6f4.jpg',
    'https://www.listchallenges.com/f/items/39436b51-c9d0-4314-97fd-ca62373a4f26.jpg',
  ];

  const t = Theme();
  t.name = 'Harry Potter';
  t.cover =
    'https://images-ext-1.discordapp.net/external/XE_pUEpxwqzMHXj1geMwDWoDW0WG5pnNaOy5gbJ7EO4/https/uploads.turbologo.com/uploads/design/hq_preview_image/5097676/draw_svg20210617-26747-23281c.svg.png?width=300&height=300';
  t.cards = cards;
  await t.save();
});
