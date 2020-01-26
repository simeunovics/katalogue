const dbHandler = require('../db-handler');
const database = require('../../src/services/database');

/**
 * Connect to a new in-memory database before running any tests.
 */
beforeAll(async () => await dbHandler.connect());

/**
 * Clear all test data after every test.
 */
afterEach(async () => await dbHandler.clearDatabase());

/**
 * Remove and close the db and server.
 */
afterAll(async () => await dbHandler.closeDatabase());

test('it can store link in the DB', async () => {
  const reference = 'asdasdasdadadadad';
  const link = {
    url: 'https://example.com',
    title: 'Example Com',
  };

  const db = database();
  const savedLink = await db.saveLink(reference, link);
  const { createdAt, title, url } = savedLink;

  expect(typeof createdAt !== 'undefined').toBe(true);
  expect(url).toBe(link.url);
  expect(title).toBe(title);
});

test('it can can list all links for related reference', async () => {
  const db = database();
  await db.saveLink('reference-1', {
    title: 'Reference A',
    url: 'http://example.com/1',
  });
  await db.saveLink('reference-1', {
    title: 'Reference A.1',
    url: 'http://example.com/1.1',
  });
  await db.saveLink('reference-2', {
    title: 'Reference B',
    url: 'http://example.com/2',
  });

  const links = await db.find('reference-1');
  expect(links.length).toBe(2);
  expect(links[1].title).toBe('Reference A');
  expect(links[1].url).toBe('http://example.com/1');
  expect(links[0].title).toBe('Reference A.1');
  expect(links[0].url).toBe('http://example.com/1.1');
});
