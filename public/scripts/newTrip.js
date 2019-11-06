window.addEventListener('load', () => {
  // Trip + stops creation logic
  const newTripForm = document.getElementById('new-trip-form');
  const newTripButton = document.getElementById('new-trip-button');
  newTripButton.addEventListener('click', async event => {
    event.preventDefault();

    const formData = new FormData(newTripForm);

    // Get list of stops inside form
    const stopsData = [];
    const stopKeys = [];
    for (const key of formData.keys()) {
      const matches = key.match(/^stopAddress(\d+)$/);
      if (matches && matches.length > 0) {
        const index = matches[1];
        const addressKey = `stopAddress${index}`;
        const minPriceKey = `stopMinPrice${index}`;
        stopsData.push({
          address: formData.get(addressKey),
          minPrice: formData.get(minPriceKey),
        });
        stopKeys.push(addressKey, minPriceKey);
      }
    }
    // Remove stop-related data from formData
    stopKeys.forEach(key => formData.delete(key));

    // Replace local time with ISO format date
    const departingOnISOFormat = new Date(
      formData.get('departingOn')
    ).toISOString();
    formData.set('departingOn', departingOnISOFormat);

    try {
      const createTripRes = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: getURLEncodedStringFromFormData(formData),
      });
      if (!createTripRes.ok) {
        console.log('New trip creation failed');
        return;
      }
      const createdTrip = (await createTripRes.json()).data;

      const createStopsRes = await Promise.all(
        stopsData.map(data =>
          fetch(`/api/trips/${createdTrip.tid}/stops`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          })
        )
      );
      createStopsRes.forEach(res => {
        if (!res.ok) {
          console.log('New stop creation failed');
        }
      });

      // Reload page
      window.location.reload();
    } catch (error) {
      console.log('New trip/stops creation error', error);
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
    addressFormInput.name = `stopAddress${rowId}`;
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
    minPriceFormInput.name = `stopMinPrice${rowId}`;
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
