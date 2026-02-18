// Год в футере
document.getElementById('year').textContent = new Date().getFullYear();

// Лайтбокс для галереи
const gallery = document.getElementById('galleryGrid');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');

if (gallery && lightbox) {
    // Открыть
    gallery.addEventListener('click', (e) => {
        const item = e.target.closest('.g-item');
        if (!item) return;

        const img = item.querySelector('img');
        if (!img) return;

        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightbox.hidden = false;
        document.body.style.overflow = 'hidden';
    });

    // Закрыть
    const close = () => {
        lightbox.hidden = true;
        document.body.style.overflow = '';
    };

    lightbox.querySelector('.lightbox__bg')?.addEventListener('click', close);
    lightbox.querySelector('.lightbox__close')?.addEventListener('click', close);

    // Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !lightbox.hidden) close();
    });
}