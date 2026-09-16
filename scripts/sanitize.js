const sanitizeHtml = require('sanitize-html');

// O corpo dos posts vem do Elementor/Gutenberg do WordPress: divs e
// sections de layout, spans com "style=font-weight:400", classes
// wp-image-123/elementor-*, atributos data-*. Nada disso deve sobreviver;
// só a estrutura semântica do texto (que herda a tipografia da marca).
const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'sup', 'sub',
  'h2', 'h3', 'h4',
  'ul', 'ol', 'li',
  'blockquote', 'figure', 'figcaption',
  'img', 'a',
];

const ALLOWED_ATTRIBUTES = {
  a: ['href'],
  img: ['src', 'alt'],
};

function sanitizeArticleBody(rawHtml) {
  const clean = sanitizeHtml(rawHtml || '', {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedSchemes: ['http', 'https', 'mailto'],
    // tags fora da allowlist (div, section, span...) são descartadas mas
    // o texto/filhos dentro delas são preservados — é o "desembrulhar"
    // que queremos, não apagar o conteúdo.
    disallowedTagsMode: 'discard',
    // <b>/<i> do WordPress viram <strong>/<em>, mais semântico.
    transformTags: {
      b: 'strong',
      i: 'em',
      a: sanitizeHtml.simpleTransform('a', { target: '_blank', rel: 'noopener noreferrer' }),
    },
    exclusiveFilter: (frame) => {
      // remove parágrafos vazios que sobram de <p>&nbsp;</p> do WordPress
      if (frame.tag === 'p') {
        const text = (frame.text || '').replace(/ /g, '').trim();
        return text === '' && frame.tag !== 'img';
      }
      return false;
    },
  });
  return clean.trim();
}

// Para título/autor/categoria: precisa virar texto puro (sem <strong> etc,
// alguns títulos vêm com a tag envolvendo o texto inteiro).
function stripToPlainText(rawHtml) {
  const noTags = sanitizeHtml(rawHtml || '', { allowedTags: [], allowedAttributes: {} });
  return noTags
    .replace(/&hellip;/g, '…')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

module.exports = { sanitizeArticleBody, stripToPlainText };
