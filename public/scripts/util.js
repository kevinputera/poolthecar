// Make an `application/json` HTTP request
const sendJSON = async (url, method, JSONPayload) => {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(JSONPayload),
  });
  const json = await res.json();
  if (res.ok) {
    return {
      data: json.data,
    };
  }
  return {
    error: json.error,
  };
};

const getJSONFromHTMLForm = form => {
  const formData = new FormData(form);
  const json = {};
  for (const [key, val] of formData) {
    json[key] = val;
  }
  return json;
};

const prettyFormatJSON = json => {
  return JSON.stringify(json, null, 4);
};
