// Get URL Encoded strings to be passed to x-www-form-urlencoded request body
const getURLEncodedStringFromHTMLForm = form => {
  const formData = new FormData(form);
  return getURLEncodedStringFromFormData(formData);
};

const getURLEncodedStringFromFormData = formData => {
  const urlEncodedPairs = [];
  formData.forEach((value, key) => {
    urlEncodedPairs.push(
      encodeURIComponent(key) + '=' + encodeURIComponent(value)
    );
  });
  const urlEncodedBody = urlEncodedPairs.join('&').replace(/%20/g, '+');
  return urlEncodedBody;
};
