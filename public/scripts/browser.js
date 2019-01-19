const copyBtn = new ClipboardJS('.btn');

clipboard.on('click', function(e) {
  console.info('Action:', e.action);
  console.info('Text:', e.text);
  console.info('Trigger:', e.trigger);

  e.clearSelection();
});