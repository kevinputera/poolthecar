window.addEventListener('load', () => {
  const tripRows = document.getElementsByName('trip-row');
  for (let tripRow of tripRows) {
    tripRow.addEventListener('click', () => {
      window.location = '/p/detailTrip/' + tripRow.id;
    });
  }
});
