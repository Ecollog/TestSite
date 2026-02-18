// 1) Год в футере
(() => {
    const y = document.getElementById("year");
    if (y) y.textContent = String(new Date().getFullYear());
})();

// 2) Лайтбокс для галереи
(() => {
    const grid = document.getElementById("galleryGrid");
    const lb = document.getElementById("lightbox");
    const lbImg = document.getElementById("lightboxImg");
    const lbCap = document.getElementById("lightboxCaption");

    if (!grid || !lb || !lbImg) return;

    const closeBtn = lb.querySelector(".lightbox__close");
    const bgBtn = lb.querySelector(".lightbox__bg");

    function open(src, alt) {
        lbImg.src = src;
        lbImg.alt = alt || "Фото";
        if (lbCap) lbCap.textContent = alt || "";
        lb.hidden = false;
        lb.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }

    function close() {
        lb.hidden = true;
        lb.setAttribute("aria-hidden", "true");
        lbImg.src = "";
        document.body.style.overflow = "";
    }

    grid.addEventListener("click", (e) => {
        const item = e.target.closest(".g-item");
        if (!item) return;

        const img = item.querySelector("img");
        const full = item.dataset.full || (img ? img.src : "");
        if (!full) return;

        open(full, img?.alt || "");
    });

    closeBtn?.addEventListener("click", close);
    bgBtn?.addEventListener("click", close);

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !lb.hidden) close();
    });
})();
