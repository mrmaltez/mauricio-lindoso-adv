/**
 * Configuração do build do blog headless (WordPress na Locaweb).
 *
 * ÚNICO PONTO QUE PRECISA MUDAR quando o DNS for atualizado: hoje o
 * WordPress responde no domínio principal; depois do corte de DNS, o
 * domínio principal passa a apontar pro site novo e o WordPress fica só
 * no subdomínio (ex.: cms.mauriciolindoso.adv.br). Troque WP_API_BASE
 * abaixo (ou defina a variável de ambiente WP_API_BASE antes de rodar o
 * build) — nada mais no código referencia a URL da API diretamente.
 */
module.exports = {
  // Hoje (WordPress ainda no domínio principal):
  WP_API_BASE: process.env.WP_API_BASE || 'https://mauriciolindoso.adv.br/wp-json/wp/v2',

  // Depois do corte de DNS, troque para:
  // WP_API_BASE: process.env.WP_API_BASE || 'https://cms.mauriciolindoso.adv.br/wp-json/wp/v2',

  // URL pública do site novo (usada nas meta tags canonical/OG).
  SITE_URL: process.env.SITE_URL || 'https://mauriciolindoso.adv.br',

  // Quantos posts por lote (página inicial do /blog e cada "Carregar mais").
  POSTS_PER_PAGE: 9,

  // Quantos posts buscar por requisição à API do WordPress (paginação de
  // build, não tem relação com POSTS_PER_PAGE do site).
  WP_FETCH_PAGE_SIZE: 50,

  // Nome do escritório usado como fallback quando o post não traz autor
  // identificável (a API do WordPress deste site retorna erro no embed
  // de autor — ver checklist do build).
  FALLBACK_AUTHOR: 'Maurício Lindoso Advocacia',

  // Imagem de capa usada quando o post não tem imagem destacada nem
  // nenhuma imagem no corpo do texto.
  FALLBACK_COVER_IMAGE: '/assets/brand/og-image.png',
};
