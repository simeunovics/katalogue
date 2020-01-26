const createNewReference = require('../../src/services/uniqueReference');

it('will generate string reference', () => {
  const reference = createNewReference();
  expect(typeof reference).toBe('string');
});
