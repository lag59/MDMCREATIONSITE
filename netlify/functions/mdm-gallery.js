const fallbackGallery = [
  { image_url: 'assets/branding-flat-lay.png', title: 'Luxury Branding Flat Lay', source_url: '/gallery.html' },
  { image_url: 'assets/branding.png', title: 'Branding & Design', source_url: '/gallery.html' },
  { image_url: 'assets/web-design-workspace.png', title: 'Web Design Workspace', source_url: '/gallery.html' },
  { image_url: 'assets/social-media-planning.png', title: 'Social Media Planning', source_url: '/gallery.html' },
  { image_url: 'assets/nfc-business-collection.png', title: 'NFC Business Cards', source_url: '/gallery.html' },
  { image_url: 'assets/business-support-management.png', title: 'Business Support', source_url: '/gallery.html' },
  { image_url: 'assets/mdm-process.png', title: 'MDM Process', source_url: '/gallery.html' }
];

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return response(405, { error: 'Method not allowed' });
  }

  // Keep the Netlify function available for future API-backed integration, but fall back to the local gallery data by default.
  return response(200, { items: fallbackGallery, source: 'local-fallback' });
};

function response(statusCode, body, isError = false) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': isError ? 'no-store' : 'public, max-age=60, stale-while-revalidate=300'
    },
    body: JSON.stringify(body)
  };
}
