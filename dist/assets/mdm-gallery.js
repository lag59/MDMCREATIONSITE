(() => {
  const grid = document.querySelector('[data-mdm-gallery]');
  const status = document.querySelector('[data-gallery-status]');
  if (!grid || !status) return;

  const showStatus = (message) => {
    status.textContent = message;
    status.hidden = false;
  };

  fetch('/.netlify/functions/mdm-gallery?limit=12')
    .then((response) => {
      if (!response.ok) throw new Error('Gallery request failed');
      return response.json();
    })
    .then((payload) => {
      const items = Array.isArray(payload) ? payload : (payload.items || payload.media || payload.photos || payload.data || []);
      const validItems = items.filter((item) => item && (item.image_url || item.imageUrl || item.url || item.media_url));
      if (!validItems.length) {
        showStatus('New approved projects will appear here soon.');
        return;
      }
      status.hidden = true;
      validItems.slice(0, 12).forEach((item) => {
        const imageUrl = item.image_url || item.imageUrl || item.media_url || item.url;
        const sourceUrl = item.source_url || item.sourceUrl || item.permalink || imageUrl;
        const title = item.caption || item.title || item.category || 'MDM Creation project';
        const figure = document.createElement('figure');
        figure.className = 'gallery-item';
        figure.innerHTML = `<img src="${escapeAttribute(imageUrl)}" alt="${escapeAttribute(title)}" loading="lazy"><figcaption>${escapeHtml(title)}</figcaption>`;
        let galleryItem = figure;
        if (sourceUrl) {
          const link = document.createElement('a');
          link.href = sourceUrl;
          link.target = '_blank';
          link.rel = 'noopener';
          link.className = 'gallery-item';
          link.append(...figure.childNodes);
          galleryItem = link;
        }
        grid.appendChild(galleryItem);
      });
    })
    .catch(() => showStatus('The project gallery is temporarily unavailable.'));

  function escapeHtml(value) { return String(value).replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char])); }
  function escapeAttribute(value) { return escapeHtml(value); }
})();
