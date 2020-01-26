require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');

const createNewReference = require('./services/uniqueReference');
const database = require('./services/database');
const {
  PORT: APP_PORT,
  MONGO_DSN,
  HEROKU_SLUG_COMMIT: SOURCE_VERSION = 'dev',
  RATE_LIMIT_WINDOW_IN_SEC = 60,
  RATE_LIMIT_NO_REQUESTS = 200,
} = process.env;

mongoose.connect(MONGO_DSN, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});
const app = express();
const db = database();

app.use(bodyParser.json());
app.use(cors());
app.use(
  /*
   * RATE_LIMIT_WINDOW_IN_SEC -> what is the time slot we're measure
   * RATE_LIMIT_NO_REQUESTS -> how many requests per measured time slot
   * e.g. 60 / 10 = 10req per 60sec
   */
  rateLimit({
    windowMs: RATE_LIMIT_WINDOW_IN_SEC,
    max: RATE_LIMIT_NO_REQUESTS,
  })
);

app.post('/api/v1/save', async (req, res) => {
  const { reference: userSubmittedReference, title, url } = req.body;
  const reference = userSubmittedReference
    ? userSubmittedReference
    : createNewReference();

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
