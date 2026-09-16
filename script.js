const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('in');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Mobile Menu Toggle
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if(menuToggle) {
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
}

// Header scroll state: transparente sobre o hero, sólido depois dele.
// Páginas sem .hero (ex.: blog) ficam sempre no estado "scrolled".
const header = document.querySelector('header');
const hero = document.querySelector('.hero');

if (header) {
    if (!hero) {
        header.classList.add('header-scrolled');
    } else {
        const updateHeaderState = () => {
            const threshold = hero.offsetHeight - 1;
            header.classList.toggle('header-scrolled', window.scrollY > threshold);
        };
        updateHeaderState();
        window.addEventListener('scroll', updateHeaderState, { passive: true });
        window.addEventListener('resize', updateHeaderState);
    }
}

// Accordion da bio no card de equipe (só tem efeito visual no mobile —
// no desktop o CSS mantém a bio sempre visível independente da classe).
document.querySelectorAll('.team-member-toggle').forEach((toggle) => {
    const member = toggle.closest('.team-member');

    const setOpen = (open) => {
        member.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
    };

    toggle.addEventListener('click', () => {
        setOpen(!member.classList.contains('is-open'));
    });

    toggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen(!member.classList.contains('is-open'));
        }
    });
});

