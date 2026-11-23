import { defineConfig } from 'vite';

// Dirección pública del sitio. Se usa para la imagen de vista previa (og:image),
// la URL canónica, los datos estructurados, el sitemap y robots.txt.
// Si el sitio cambia de dominio, basta con cambiarla aquí (o definir SITE_URL).
const SITE_URL = (process.env.SITE_URL || 'https://portafolio-interactivo-psicologa-or.vercel.app').replace(/\/+$/, '');

export default defineConfig({
  plugins: [
    {
      name: 'site-url',
      // WhatsApp, LinkedIn y Facebook solo muestran la imagen si og:image es una URL completa
      transformIndexHtml(html) {
        return html.replaceAll('__SITE_URL__', SITE_URL);
      },
      generateBundle() {
        const today = new Date().toISOString().slice(0, 10);
        this.emitFile({
          type: 'asset',
          fileName: 'sitemap.xml',
          source: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>${SITE_URL}/og-image.jpg</image:loc>
    </image:image>
    <image:image>
      <image:loc>${SITE_URL}/Antonia-Chica.jpg</image:loc>
    </image:image>
  </url>
</urlset>
`,
        });
        this.emitFile({
          type: 'asset',
          fileName: 'robots.txt',
          source: `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
        });
      },
    },
  ],
});
