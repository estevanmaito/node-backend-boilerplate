module.exports.formatErrorMessage = err =>
  err.inner.map(e => ({
    path: e.path,
    message: e.message
  }));
