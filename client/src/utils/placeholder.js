/**
 * Generate a dynamic inline SVG food-specific placeholder containing the FOOD NAME
 */
export const getFoodPlaceholder = (foodName, category = '') => {
  const safeName = (foodName || 'Delicious Food')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  const safeCategory = (category || 'TastyBite')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#f97316;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#ea580c;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#c2410c;stop-opacity:1" />
      </linearGradient>
      <pattern id="pattern" width="40" height="40" patternUnits="userSpaceOnUse">
        <circle cx="20" cy="20" r="1.5" fill="#ffffff" opacity="0.1" />
      </pattern>
    </defs>
    <rect width="600" height="450" fill="url(#grad)" />
    <rect width="600" height="450" fill="url(#pattern)" />
    
    <!-- Dish Cloche Icon -->
    <g transform="translate(260, 110)" fill="#ffffff" opacity="0.95">
      <path d="M40,15 C20,15 5,30 2,50 L78,50 C75,30 60,15 40,15 Z" />
      <circle cx="40" cy="9" r="6" />
      <rect x="0" y="55" width="80" height="6" rx="3" />
    </g>
    
    <!-- Food Name Text -->
    <text x="300" y="240" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="28" font-weight="800" fill="#ffffff" text-anchor="middle">
      ${safeName}
    </text>
    
    <!-- Category Badge -->
    <rect x="200" y="275" width="200" height="32" rx="16" fill="#ffffff" opacity="0.2" />
    <text x="300" y="296" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="14" font-weight="600" fill="#ffffff" text-anchor="middle">
      ${safeCategory}
    </text>
    
    <!-- Tagline -->
    <text x="300" y="380" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="13" font-style="italic" fill="#ffedd5" text-anchor="middle" opacity="0.9">
      TastyBite • Good Food, Just a Bite Away.
    </text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};
