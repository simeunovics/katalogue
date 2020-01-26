require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const createNewReference = require('./services/uniqueReference');
const database = require('./services/database');
const { PORT: APP_PORT, MONGO_DSN, SOURCE_VERSION = 'dev' } = process.env;

mongoose.connect(MONGO_DSN, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});
const app = express();
const db = database();

app.use(bodyParser.json());

app.get('/api/v1/create-reference', (req, res) => {
  res.json({
    reference: createNewReference(),
  });
});
app.post('/api/v1/save', async (req, res) => {
  const { reference = createNewReference(), title, url } = req.body;

  try {
    await db.saveLink(reference, { title, url }, req.get('User-Agent'));
    res.status(201).json({
      message: 'Link Saved',
      reference,
    });
  } catch (e) {
    res.status(400).json({
      message: e,
    });
  }
});
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    version: SOURCE_VERSION,
  });
});
app.get('/api/v1/list/:reference', async (req, res) => {
  const { reference } = req.params;
  let { page = 1, perPage = 500 } = req.query;
  page = Number(page);
  perPage = Number(perPage);

  try {
    const references = await db.find(reference, page, perPage);
    res.json({
      page,
      perPage,
      records: references.map(ref => ({
        reference,
        title: ref.title,
        url: ref.url,
        createdAt: ref.createdAt,
        authorUserAgent: ref.authorUserAgent,
      })),
    });
  } catch (e) {
    res.status(400).json({
      message: e,
    });
  }
});
app.listen(APP_PORT, () => console.log(`App listening on ${APP_PORT}`));
