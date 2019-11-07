window.addEventListener('load', () => {
  // LinkTableRow component ogic
  const linkTableRows = document.getElementsByClassName('link-table-row');
  for (let i = 0; i < linkTableRows.length; i++) {
    linkTableRows[i].addEventListener('click', () => {
      const href = linkTableRows[i].getAttribute('data-href');
      window.location.href = href;
    });
  }
});
