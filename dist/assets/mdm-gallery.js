(() => {
  const grid = document.querySelector('[data-mdm-gallery]');
  const status = document.querySelector('[data-gallery-status]');
  if (!grid || !status) return;

  const fallbackItems = [
    { image_url: 'assets/branding-flat-lay.png', title: 'Luxury Branding Flat Lay' },
    { image_url: 'assets/branding.png', title: 'Branding & Design' },
    { image_url: 'assets/web-design-workspace.png', title: 'Web Design Workspace' },
    { image_url: 'assets/social-media-planning.png', title: 'Social Media Planning' },
    { image_url: 'assets/nfc-business-collection.png', title: 'NFC Business Cards' },
    { image_url: 'assets/business-support-management.png', title: 'Business Support' },
    { image_url: 'assets/mdm-process.png', title: 'MDM Process' }
  ];

  const showStatus = (message) => {
    status.textContent = message;
    status.hidden = false;
  };

  const renderItems = (items) => {
    const validItems = items.filter((item) => item && isSafeImageUrl(getImageUrl(item)));
    if (!validItems.length) {
      showStatus('New approved projects will appear here soon.');
      return;
    }
    status.hidden = true;
    validItems.slice(0, 12).forEach((item) => {
      const imageUrl = sanitizeImageUrl(getImageUrl(item));
      const sourceUrl = sanitizeUrl(item.source_url || item.sourceUrl || item.permalink || imageUrl);
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
  };

  if (location.protocol === 'file:') {
    renderItems(fallbackItems);
    return;
  }

  fetch('/.netlify/functions/mdm-gallery?limit=12')
    .then(async (response) => {
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Gallery request failed');
      return payload;
    })
    .then((payload) => {
      const items = findItems(payload);
      if (!items.length) {
        renderItems(fallbackItems);
        return;
      }
      renderItems(items);
    })
    .catch((error) => {
      console.warn('MDM project gallery fallback engaged:', error);
      renderItems(fallbackItems);
    });

  function findItems(payload) {
    if (Array.isArray(payload)) return payload;
    const candidates = [
      payload?.items,
      payload?.media,
      payload?.photos,
      payload?.gallery,
      payload?.results,
      payload?.data,
      payload?.data?.items,
      payload?.data?.media,
      payload?.data?.photos,
      payload?.data?.gallery
    ];
    return candidates.find(Array.isArray) || [];
  }

  function getImageUrl(item) {
    return item.image_url || item.imageUrl || item.media_url || item.mediaUrl || item.thumbnail_url || item.thumbnailUrl || item.image?.url || item.media?.url || item.url;
  }

  function sanitizeImageUrl(value) {
    const url = sanitizeUrl(value);
    if (!url) return null;
    try {
      const parsed = new URL(url, window.location.origin);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return parsed.href;
    } catch {
      return null;
    }
    return null;
  }

  function sanitizeUrl(value) {
    if (!value || typeof value !== 'string') return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    const lower = trimmed.toLowerCase();
    if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('blob:')) return null;
    return trimmed;
  }

  function isSafeImageUrl(value) {
    return Boolean(sanitizeImageUrl(value));
  }

  function escapeHtml(value) { return String(value).replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char])); }
  function escapeAttribute(value) { return escapeHtml(value); }
})();
