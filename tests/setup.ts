try {
  const mime = require('mime');
  if (mime && !mime.getType && typeof mime.lookup === 'function') {
    mime.getType = mime.lookup.bind(mime);
  }
} catch {
}
