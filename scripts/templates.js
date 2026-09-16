const config = require('../blog.config');

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Header e footer idênticos aos de index.html, só com caminhos
// raiz-relativos (funcionam em /blog/ e /blog/<slug>/, não só em /).
function renderHeader() {
  return `
    <header>
        <div class="nav">
            <a href="/" class="logo" aria-label="Mauricio Lindoso Advocacia, página inicial">
                <img class="logo-img logo-img-light" src="/assets/brand/logo-full-white.svg"
                    alt="Mauricio Lindoso Advocacia">
                <img class="logo-img logo-img-dark" src="/assets/brand/logo-full-red.svg"
                    alt="Mauricio Lindoso Advocacia">
            </a>

            <button class="menu-toggle" aria-label="Alternar menu">
                <div class="hamburger"></div>
            </button>

            <nav class="nav-links">
                <a href="/#sobre">O Escritório</a>
                <a href="/#areas">Áreas de Atuação</a>
                <a href="/#fundador">Sócio Fundador</a>
                <a href="/#equipe">Nossa Equipe</a>
                <a href="/blog/" aria-current="page">Conteúdos</a>
                <a href="/#contato">Contato</a>
                <a href="/#contato" class="btn btn-outline-dark">Fale com o escritório</a>
            </nav>
        </div>
    </header>`;
}

function renderFooter() {
  return `
    <footer>
        <div class="wrap">
            <div class="footer-grid">
                <div class="footer-brand">
                    <img class="logo-img" src="/assets/brand/logo-full-white.svg" alt="Mauricio Lindoso Advocacia">
                    <p>Direito de Família e Sucessões em Brasília desde 1985.</p>
                </div>
                <div class="footer-col">
                    <h4>Navegação</h4>
                    <a href="/#sobre">O Escritório</a>
                    <a href="/#areas">Áreas de Atuação</a>
                    <a href="/#fundador">Sócio Fundador</a>
                    <a href="/#equipe">Equipe</a>
                    <a href="/blog/">Conteúdos</a>
                    <a href="/#contato">Contato</a>
                </div>
                <div class="footer-col">
                    <h4>Contato</h4>
                    <span>SCS Q. 06, Bl. A, nº 136, 3º andar</span>
                    <span>Brasília, DF, 70.306-906</span>
                    <span>contato@mauriciolindoso.adv.br</span>
                </div>
            </div>
            <div class="footer-bottom">
                <span>© 2026 Mauricio Lindoso Advocacia. Todos os direitos reservados.</span>
                <span>OAB, Direito de Família e Sucessões</span>
            </div>
        </div>
    </footer>`;
}

function renderShell({ title, description, ogTitle, ogDescription, ogImage, canonical, ogType, bodyClass, main }) {
  return `<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title>

    <link rel="icon" type="image/svg+xml" href="/assets/brand/monogram-red.svg">
    <link rel="icon" type="image/png" sizes="32x32" href="/assets/brand/favicon-32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/assets/brand/favicon-16.png">
    <link rel="icon" type="image/x-icon" href="/assets/brand/favicon.ico">
    <link rel="apple-touch-icon" href="/assets/brand/apple-touch-icon.png">

    <link rel="canonical" href="${escapeHtml(canonical)}">
    <meta name="description" content="${escapeHtml(description)}">
    <meta property="og:title" content="${escapeHtml(ogTitle)}">
    <meta property="og:description" content="${escapeHtml(ogDescription)}">
    <meta property="og:image" content="${escapeHtml(ogImage)}">
    <meta property="og:url" content="${escapeHtml(canonical)}">
    <meta property="og:type" content="${escapeHtml(ogType || 'website')}">
    <meta name="twitter:card" content="summary_large_image">

    <link rel="stylesheet" href="/style.css">
</head>

<body${bodyClass ? ` class="${escapeHtml(bodyClass)}"` : ''}>
${renderHeader()}
    <main>
${main}
    </main>
${renderFooter()}
    <script src="/script.js"></script>
    <script src="/blog/blog.js"></script>
</body>

</html>
`;
}

function categoryBadges(categories) {
  if (!categories.length) return '';
  return `<div class="blog-categories">${categories
    .map((c) => `<span class="blog-category">${escapeHtml(c.name)}</span>`)
    .join('')}</div>`;
}

function renderCard(post) {
  return `<a class="blog-card" href="${escapeHtml(post.link)}">
    <div class="blog-card-cover">
        <img src="${escapeHtml(post.image.src)}" alt="${escapeHtml(post.image.alt)}" loading="lazy">
    </div>
    <div class="blog-card-body">
        ${categoryBadges(post.categories)}
        <h3>${escapeHtml(post.title)}</h3>
        <p class="blog-card-excerpt">${escapeHtml(post.excerpt)}</p>
        <span class="blog-card-date">${escapeHtml(post.dateDisplay)}</span>
    </div>
</a>`;
}

// Card "leve" (sem contentHTML) usado nos lotes JSON do "Carregar mais" —
// o client monta o mesmo markup de renderCard via blog.js.
function toCardData(post) {
  return {
    link: post.link,
    title: post.title,
    excerpt: post.excerpt,
    dateDisplay: post.dateDisplay,
    categories: post.categories,
    image: post.image,
  };
}

function renderListingPage({ firstBatch, totalBatches }) {
  const cardsHTML = firstBatch.map(renderCard).join('\n');
  const loadMoreButton = totalBatches > 1
    ? `<div class="blog-load-more">
        <button id="blog-load-more-btn" class="btn btn-outline-dark" data-next-page="2" data-total-pages="${totalBatches}">
            Carregar mais
        </button>
    </div>`
    : '';

  const main = `
        <section class="blog-listing">
            <div class="wrap">
                <div class="section-head reveal">
                    <span class="eyebrow">Conteúdos</span>
                    <h1>Artigos e conteúdos jurídicos</h1>
                    <p>Análises, novidades e orientações em Direito de Família e Sucessões, publicadas pela nossa
                        equipe.</p>
                </div>
                <div class="blog-grid" id="blog-grid">
${cardsHTML}
                </div>
                ${loadMoreButton}
            </div>
        </section>`;

  return renderShell({
    title: 'Conteúdos | Mauricio Lindoso Advocacia',
    description: 'Análises, novidades e orientações em Direito de Família e Sucessões pela equipe da Mauricio Lindoso Advocacia.',
    ogTitle: 'Conteúdos | Mauricio Lindoso Advocacia',
    ogDescription: 'Análises, novidades e orientações em Direito de Família e Sucessões pela equipe da Mauricio Lindoso Advocacia.',
    ogImage: `${config.SITE_URL}/assets/brand/og-image.png`,
    canonical: `${config.SITE_URL}/blog/`,
    main,
  });
}

function renderArticlePage(post) {
  const main = `
        <article class="article">
            <div class="wrap article-header">
                ${categoryBadges(post.categories)}
                <h1>${escapeHtml(post.title)}</h1>
                <div class="article-meta">
                    <span>${escapeHtml(post.author)}</span>
                    <span aria-hidden="true">·</span>
                    <time datetime="${escapeHtml(post.dateISO)}">${escapeHtml(post.dateDisplay)}</time>
                </div>
            </div>
            <div class="article-cover">
                <img src="${escapeHtml(post.image.src)}" alt="${escapeHtml(post.image.alt)}">
            </div>
            <div class="wrap">
                <div class="article-body">
${post.contentHTML}
                </div>
                <a class="article-back" href="/blog/">← Voltar para Conteúdos</a>
            </div>
        </article>`;

  return renderShell({
    title: `${post.title} | Mauricio Lindoso Advocacia`,
    description: post.excerpt,
    ogTitle: post.title,
    ogDescription: post.excerpt,
    ogImage: post.image.src.startsWith('http') ? post.image.src : `${config.SITE_URL}${post.image.src}`,
    ogType: 'article',
    canonical: `${config.SITE_URL}${post.link}`,
    main,
  });
}

module.exports = { renderListingPage, renderArticlePage, renderCard, toCardData, escapeHtml };
