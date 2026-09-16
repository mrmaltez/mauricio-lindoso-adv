const fs = require('fs');
const path = require('path');
const config = require('../blog.config');
const { fetchAllPosts, normalizePost } = require('./wp');
const { renderListingPage, renderArticlePage, toCardData } = require('./templates');

const ROOT = path.join(__dirname, '..');
const BLOG_DIR = path.join(ROOT, 'blog');
const DATA_DIR = path.join(BLOG_DIR, 'data');

function chunk(array, size) {
  const out = [];
  for (let i = 0; i < array.length; i += size) out.push(array.slice(i, i + size));
  return out;
}

// Normaliza em lotes pequenos (não em paralelo total) pra não abrir 90+
// requisições de HEAD (checagem de imagem) de uma vez contra o servidor.
async function normalizeAll(rawPosts) {
  const CONCURRENCY = 8;
  const results = [];
  for (const group of chunk(rawPosts, CONCURRENCY)) {
    results.push(...(await Promise.all(group.map(normalizePost))));
  }
  return results;
}

async function main() {
  console.log(`Buscando posts em ${config.WP_API_BASE} ...`);
  const rawPosts = await fetchAllPosts();
  console.log(`${rawPosts.length} posts publicados encontrados.`);

  console.log('Normalizando posts (checando imagens)...');
  const posts = await normalizeAll(rawPosts);

  // reset /blog do zero a cada build, pra não deixar slug órfão de post
  // apagado/renomeado no WordPress.
  fs.rmSync(BLOG_DIR, { recursive: true, force: true });
  fs.mkdirSync(DATA_DIR, { recursive: true });

  for (const post of posts) {
    const postDir = path.join(BLOG_DIR, post.slug);
    fs.mkdirSync(postDir, { recursive: true });
    fs.writeFileSync(path.join(postDir, 'index.html'), renderArticlePage(post));
  }

  const batches = chunk(posts, config.POSTS_PER_PAGE);
  const firstBatch = batches[0] || [];
  const totalBatches = batches.length;

  for (let i = 1; i < batches.length; i++) {
    const pageNumber = i + 1; // batch 0 = página 1 (inline no HTML), batch 1 = page-2.json, ...
    fs.writeFileSync(
      path.join(DATA_DIR, `page-${pageNumber}.json`),
      JSON.stringify(batches[i].map(toCardData)),
    );
  }

  fs.writeFileSync(path.join(BLOG_DIR, 'index.html'), renderListingPage({ firstBatch, totalBatches }));
  fs.copyFileSync(path.join(__dirname, 'blog-runtime.js'), path.join(BLOG_DIR, 'blog.js'));

  // ---- relatório do build ----
  const bySource = { featured: 0, content: 0, fallback: 0 };
  const fallbackSlugs = [];
  const flaggedPosts = [];
  for (const post of posts) {
    bySource[post.image.source]++;
    if (post.image.source === 'fallback') fallbackSlugs.push(post.slug);
    if (post.notes.length) flaggedPosts.push({ slug: post.slug, title: post.title, notes: post.notes });
  }

  const report = {
    generatedAt: new Date().toISOString(),
    wpApiBase: config.WP_API_BASE,
    totalPosts: posts.length,
    totalListingBatches: totalBatches,
    postsPerBatch: config.POSTS_PER_PAGE,
    images: bySource,
    fallbackImageSlugs: fallbackSlugs,
    flaggedPosts,
  };
  fs.writeFileSync(path.join(__dirname, 'build-log.json'), JSON.stringify(report, null, 2));

  console.log('\n--- resumo do build ---');
  console.log(`Posts processados: ${posts.length}`);
  console.log(`Páginas de listagem geradas (${config.POSTS_PER_PAGE}/lote): ${totalBatches}`);
  console.log(`Imagem: destacada=${bySource.featured} · extraída do corpo=${bySource.content} · fallback da marca=${bySource.fallback}`);
  console.log(`Posts sinalizados para revisão manual: ${flaggedPosts.length}`);
  console.log('Relatório completo em scripts/build-log.json');
}

main().catch((err) => {
  console.error('Build do blog falhou:', err);
  process.exit(1);
});
