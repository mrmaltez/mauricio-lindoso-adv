// Runtime do "Carregar mais" da listagem /blog/. Busca os lotes
// seguintes (gerados em /blog/data/page-N.json pelo build) e anexa os
// cards, sem recarregar a página nem precisar de /blog/page/2 separado.

function escapeHtml(str) {
    return String(str == null ? '' : str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function categoryBadgesHTML(categories) {
    // Mesmo filtro do server (ver categoryBadges em scripts/templates.js)
    // — "Uncategorized" é a categoria padrão vazia do WordPress, não
    // aparece como rótulo. Sem isso, só os cards carregados via
    // "Carregar mais" (client-side) ficavam com o rótulo errado.
    var visible = (categories || []).filter(function (c) { return c.slug !== 'uncategorized'; });
    if (!visible.length) return '';
    return '<div class="blog-categories">' +
        visible.map(function (c) { return '<span class="blog-category">' + escapeHtml(c.name) + '</span>'; }).join('') +
        '</div>';
}

function cardHTML(post) {
    return '<a class="blog-card" href="' + escapeHtml(post.link) + '">' +
        '<div class="blog-card-cover"><img src="' + escapeHtml(post.image.src) + '" alt="' + escapeHtml(post.image.alt) + '" loading="lazy"></div>' +
        '<div class="blog-card-body">' +
        categoryBadgesHTML(post.categories) +
        '<h3>' + escapeHtml(post.title) + '</h3>' +
        '<p class="blog-card-excerpt">' + escapeHtml(post.excerpt) + '</p>' +
        '<span class="blog-card-date">' + escapeHtml(post.dateDisplay) + '</span>' +
        '</div></a>';
}

const loadMoreBtn = document.getElementById('blog-load-more-btn');
const grid = document.getElementById('blog-grid');

if (loadMoreBtn && grid) {
    loadMoreBtn.addEventListener('click', async () => {
        const nextPage = Number(loadMoreBtn.dataset.nextPage);
        const totalPages = Number(loadMoreBtn.dataset.totalPages);

        loadMoreBtn.disabled = true;
        loadMoreBtn.textContent = 'Carregando...';

        try {
            const res = await fetch(`/blog/data/page-${nextPage}.json`);
            if (!res.ok) throw new Error('Falha ao buscar mais posts');
            const posts = await res.json();

            grid.insertAdjacentHTML('beforeend', posts.map(cardHTML).join(''));

            const following = nextPage + 1;
            if (following > totalPages) {
                loadMoreBtn.remove();
            } else {
                loadMoreBtn.dataset.nextPage = String(following);
                loadMoreBtn.disabled = false;
                loadMoreBtn.textContent = 'Carregar mais';
            }
        } catch (err) {
            loadMoreBtn.disabled = false;
            loadMoreBtn.textContent = 'Carregar mais';
            console.error(err);
        }
    });
}
