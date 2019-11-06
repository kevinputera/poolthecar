window.addEventListener('load', () => {
  // Trip + stops creation logic
  const newTripForm = document.getElementById('new-trip-form');
  const newTripButton = document.getElementById('new-trip-button');
  newTripButton.addEventListener('click', async event => {
    event.preventDefault();

    const formData = new FormData(newTripForm);
    const departingOnISOFormat = new Date(
      formData.get('departingOn')
    ).toISOString();
    formData.set('departingOn', departingOnISOFormat);

    try {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: getURLEncodedStringFromFormData(formData),
      });
      if (res.ok) {
        // TODO: Redirect to trip management page
        window.location.reload();
      } else {
        console.log('New trip creation failed');
      }
    } catch (error) {
      console.log('New trip creation error', error);
    }
  });

  // New stop form creation logic
  let rowId = 2;
  const stopFormList = document.getElementById('stop-form-list');
  const newStopFormButton = document.getElementById('new-stop-form-button');
  newStopFormButton.addEventListener('click', async event => {
    event.preventDefault();

    // Create row
    const newStopForm = document.createElement('div');
    newStopForm.className = 'form-row';

    // Create address form group
    const addressInputId = `stop-address-${rowId}`;
    const addressFormGroup = document.createElement('div');
    addressFormGroup.className = 'form-group col-md-6';
    const addressFormLabel = document.createElement('label');
    addressFormLabel.htmlFor = addressInputId;
    addressFormLabel.innerHTML = `Address ${rowId}`;
    const addressFormInput = document.createElement('input');
    addressFormInput.id = addressInputId;
    addressFormInput.className = 'form-control';
    addressFormInput.name = 'stopAddress';
    addressFormInput.type = 'text';
    addressFormInput.placeholder = 'Enter address';
    addressFormGroup.appendChild(addressFormLabel);
    addressFormGroup.appendChild(addressFormInput);

    // Create minimum price form group
    const minPriceInputId = `stop-min-price-${rowId}`;
    const minPriceFormGroup = document.createElement('div');
    minPriceFormGroup.className = 'form-group col-md-6';
    const minPriceFormLabel = document.createElement('label');
    minPriceFormLabel.htmlFor = minPriceInputId;
    minPriceFormLabel.innerHTML = `Minimum bid price ${rowId}`;
    const minPriceFormInput = document.createElement('input');
    minPriceFormInput.id = minPriceInputId;
    minPriceFormInput.className = 'form-control';
    minPriceFormInput.name = 'stopMinPrice';
    minPriceFormInput.type = 'number';
    minPriceFormInput.placeholder = 'Enter minimum bid price';
    minPriceFormGroup.appendChild(minPriceFormLabel);
    minPriceFormGroup.appendChild(minPriceFormInput);

    newStopForm.appendChild(addressFormGroup);
    newStopForm.appendChild(minPriceFormGroup);

    stopFormList.appendChild(newStopForm);

    rowId++;
  });
});
