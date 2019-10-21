const ok = (res, payload) => {
  res.status(200).json({
    error: '',
    data: payload,
  });
};

const badRequest = (res, message) => {
  res.status(400).json({
    error: message,
    data: null,
  });
};

const internalError = (res, message) => {
  res.status(500).json({
    error: message,
    data: null,
  });
};

module.exports = { ok, badRequest, internalError };
