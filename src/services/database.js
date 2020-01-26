const mongoose = require('mongoose');
const MAX_PER_PAGE = 500;
const SORT_DESC = -1;
const MIN_PAGE = 1;

const LinkSchema = mongoose.Schema(
  {
    reference: String,
    url: String,
    title: String,
    authorUserAgent: String,
  },
  { timestamps: true }
);
const LinkModel = mongoose.model('Link', LinkSchema);

const failWithError = msg => {
  throw new Error(msg);
};

class Database {
  saveLink(
    reference = failWithError('Reference is required'),
    link = failWithError('Link is required'),
    authorUserAgent = 'unknown'
  ) {
    const parameters = {
      reference,
      url: link.url || failWithError('URL is required'),
      title: link.title || failWithError('Title is required'),
      authorUserAgent,
    };
    return LinkModel.create(parameters);
  }

  find(reference = failWithError('Reference is required'), page, perPage) {
    page = Number(page < MIN_PAGE ? MIN_PAGE : page);
    perPage = Number(perPage > MAX_PER_PAGE ? MAX_PER_PAGE : perPage);

    return LinkModel.find({ reference })
      .limit(perPage)
      .skip((page - 1) * perPage)
      .sort({ createdAt: SORT_DESC });
  }
}

module.exports = (...args) => new Database(...args);
