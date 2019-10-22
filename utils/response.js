const ok = (res, payload) => {
  res.status(200).json({
    error: null,
    data: payload,
  });
};

const okMessage = (res, message) => {
  res.status(200).json({
    error: null,
    data: {
      message,
    },
  });
};

const badRequest = (res, error) => {
  res.status(400).json({
    error,
    data: null,
  });
};

const badRequestMessage = (res, message) => {
  res.status(400).json({
    error: {
      message,
    },
    data: null,
  });
};

const internalError = (res, error) => {
  res.status(500).json({
    error,
    data: null,
  });
};

const internalErrorMessage = (res, message) => {
  res.status(500).json({
    error: {
      message,
    },
    data: null,
  });
};

module.exports = {
  ok,
  okMessage,
  badRequest,
  badRequestMessage,
  internalError,
  internalErrorMessage,
};
