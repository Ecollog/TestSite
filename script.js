// script.js

// 1) Год в футере
(() => {
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();

// 2) Бургер-меню (доступно + aria)
(() => {
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.getElementById("siteNav");
    if (!toggle || !nav) return;

    // Ставим стартовое состояние для мобилки
    const mq = window.matchMedia("(max-width: 640px)");

    function setMobileState(isMobile) {
        if (!isMobile) {
            // на десктопе меню всегда видно
            nav.removeAttribute("hidden");
            toggle.setAttribute("aria-expanded", "false");
            return;
        }
        // на мобилке закрыто по умолчанию
        nav.setAttribute("hidden", "");
        toggle.setAttribute("aria-expanded", "false");
    }

    setMobileState(mq.matches);
    mq.addEventListener?.("change", (e) => setMobileState(e.matches));

    function openMenu() {
        nav.removeAttribute("hidden");
        toggle.setAttribute("aria-expanded", "true");
    }

    function closeMenu() {
        nav.setAttribute("hidden", "");
        toggle.setAttribute("aria-expanded", "false");
    }

    toggle.addEventListener("click", () => {
        const expanded = toggle.getAttribute("aria-expanded") === "true";
        expanded ? closeMenu() : openMenu();
    });

    // Закрывать по клику на ссылку (на мобилке)
    nav.addEventListener("click", (e) => {
        const a = e.target.closest("a");
        if (!a) return;
        if (mq.matches) closeMenu();
    });

    // Закрыть по Escape
    document.addEventListener("keydown", (e) => {
        if (e.key !== "Escape") return;
        if (mq.matches) closeMenu();
    });
})();

// 3) Галерея: колесо мыши прокручивает горизонтально + drag-to-scroll
(() => {
    const scroller = document.querySelector(".gallery-scroll");
    if (!scroller) return;

    // 3.1) Wheel -> горизонтальный скролл
    scroller.addEventListener(
        "wheel",
        (e) => {
            // Если пользователь уже скроллит по горизонтали трекпадом — не мешаем
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

            // Если зажали Shift — браузер и так часто скроллит горизонтально
            if (e.shiftKey) return;

            e.preventDefault();
            scroller.scrollLeft += e.deltaY;
        },
        { passive: false }
    );

    // 3.2) Drag-to-scroll hints
    scroller.style.cursor = "grab";
    scroller.style.userSelect = "none";

    let isDown = false;
    let startX = 0;
    let startLeft = 0;

    function onDown(clientX) {
        isDown = true;
        startX = clientX;
        startLeft = scroller.scrollLeft;
        scroller.style.cursor = "grabbing";
    }

    function onMove(clientX) {
        if (!isDown) return;
        const dx = clientX - startX;
        scroller.scrollLeft = startLeft - dx;
    }

    function onUp() {
        isDown = false;
        scroller.style.cursor = "grab";
    }

    // Мышь
    scroller.addEventListener("mousedown", (e) => {
        // только ЛКМ
        if (e.button !== 0) return;
        onDown(e.clientX);
    });

    window.addEventListener("mousemove", (e) => onMove(e.clientX));
    window.addEventListener("mouseup", onUp);

    // Тач
    scroller.addEventListener(
        "touchstart",
        (e) => {
            if (!e.touches || e.touches.length !== 1) return;
            onDown(e.touches[0].clientX);
        },
        { passive: true }
    );

    scroller.addEventListener(
        "touchmove",
        (e) => {
            if (!e.touches || e.touches.length !== 1) return;
            onMove(e.touches[0].clientX);
        },
        { passive: true }
    );

    scroller.addEventListener("touchend", onUp);

    // 3.3) Клавиатура: стрелки влево/вправо двигают ленту, если фокус на ленте
    scroller.addEventListener("keydown", (e) => {
        const step = 280; // примерно ширина карточки
        if (e.key === "ArrowRight") {
            scroller.scrollBy({ left: step, behavior: "smooth" });
            e.preventDefault();
        }
        if (e.key === "ArrowLeft") {
            scroller.scrollBy({ left: -step, behavior: "smooth" });
            e.preventDefault();
        }
    });
})();
