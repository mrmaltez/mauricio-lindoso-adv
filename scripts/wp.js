const { sanitizeArticleBody, stripToPlainText } = require('./sanitize');
const config = require('../blog.config');

// Busca todos os posts publicados, seguindo a paginação da API do
// WordPress (per_page + X-WP-TotalPages), com _embed pra trazer imagem
// destacada, autor e categorias junto de cada post.
async function fetchAllPosts() {
  const perPage = config.WP_FETCH_PAGE_SIZE;
  const firstUrl = `${config.WP_API_BASE}/posts?per_page=${perPage}&page=1&_embed`;
  const firstRes = await fetch(firstUrl);
  if (!firstRes.ok) {
    throw new Error(`Falha ao buscar posts (${firstRes.status}): ${firstUrl}`);
  }
  const totalPages = Number(firstRes.headers.get('x-wp-totalpages') || '1');
  const firstBatch = await firstRes.json();

  const allPosts = [...firstBatch];
  for (let page = 2; page <= totalPages; page++) {
    const url = `${config.WP_API_BASE}/posts?per_page=${perPage}&page=${page}&_embed`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Falha ao buscar posts (${res.status}): ${url}`);
    }
    allPosts.push(...(await res.json()));
  }
  return allPosts;
}

function resolveAuthorName(post) {
  const embedded = post._embedded?.author?.[0];
  if (embedded && !embedded.code) {
    return embedded.name;
  }
  // A API deste WordPress retorna o embed de autor quebrado
  // (rest_user_invalid_id) em todos os posts — o Yoast SEO guarda o
  // nome do autor separadamente e cobre esse buraco.
  const yoastAuthor = post.yoast_head_json?.author;
  if (yoastAuthor) return yoastAuthor;
  return config.FALLBACK_AUTHOR;
}

function resolveCategories(post) {
  const terms = post._embedded?.['wp:term']?.[0] || [];
  return terms
    .filter((t) => t.taxonomy === 'category' && !t.code)
    .map((t) => ({ name: t.name, slug: t.slug }));
}

function resolveExcerpt(post) {
  const yoastDescription = post.yoast_head_json?.og_description;
  if (yoastDescription) return stripToPlainText(yoastDescription);

  const rawExcerpt = stripToPlainText(post.excerpt?.rendered || '');
  if (rawExcerpt) return rawExcerpt;

  const fromContent = stripToPlainText(post.content?.rendered || '');
  return fromContent.length > 160 ? `${fromContent.slice(0, 157)}...` : fromContent;
}

// Alguns posts referenciam imagens (destacada ou dentro do corpo) que já
// foram apagadas do WordPress — a URL existe no HTML mas responde 404.
// Confirma com um HEAD antes de aceitar, senão a página quebra com um
// ícone de imagem quebrada.
async function urlResolves(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, { method: 'HEAD', signal: controller.signal });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

// Ordem de resolução da imagem de capa (cada candidata é checada de
// verdade antes de aceitar — ver urlResolves acima):
// 1. Imagem destacada, se o embed resolveu e o arquivo ainda existe.
// 2. Primeira <img> do corpo do post cujo arquivo ainda existe.
// 3. Fallback visual da marca.
async function resolveImage(post) {
  const media = post._embedded?.['wp:featuredmedia']?.[0];
  if (media && media.source_url && (await urlResolves(media.source_url))) {
    return { src: media.source_url, alt: media.alt_text || '', source: 'featured' };
  }

  const raw = post.content?.rendered || '';
  const candidates = [...raw.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)].map((m) => m[1]);
  for (const src of candidates) {
    if (await urlResolves(src)) {
      return { src, alt: '', source: 'content' };
    }
  }

  return { src: config.FALLBACK_COVER_IMAGE, alt: 'Maurício Lindoso Advocacia', source: 'fallback' };
}

function formatDatePtBR(isoDate) {
  const date = new Date(isoDate);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

// Normaliza um post cru da API do WordPress pro formato que os templates
// consomem, já registrando qualquer coisa que precisou de fallback (pra
// entrar no relatório final do build).
async function normalizePost(post) {
  const title = stripToPlainText(post.title?.rendered || '(sem título)');
  const excerpt = resolveExcerpt(post);
  const contentHTML = sanitizeArticleBody(post.content?.rendered || '');
  const image = await resolveImage(post);
  const author = resolveAuthorName(post);
  const categories = resolveCategories(post);

  const rawImgCount = [...(post.content?.rendered || '').matchAll(/<img[^>]+src=/gi)].length;

  const notes = [];
  if (image.source === 'fallback') {
    notes.push(
      rawImgCount > 0
        ? 'imagem(ns) referenciada(s) no post não existem mais (404) — usado fallback da marca'
        : 'sem imagem (capa nem no corpo do post) — usado fallback da marca',
    );
  }
  if (contentHTML.length < 50) notes.push('corpo do artigo ficou muito curto após sanitização — revisar manualmente');
  if (!post._embedded?.author?.[0] || post._embedded.author[0].code) notes.push('embed de autor quebrado na API, usado fallback');

  return {
    id: post.id,
    slug: post.slug,
    link: `/blog/${post.slug}/`,
    title,
    dateISO: post.date,
    dateDisplay: formatDatePtBR(post.date),
    author,
    categories,
    excerpt,
    contentHTML,
    image,
    notes,
  };
}

module.exports = { fetchAllPosts, normalizePost };
