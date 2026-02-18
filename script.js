// script.js
document.addEventListener("DOMContentLoaded", () => {
    // 1) Текущий год в футере
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    // 2) Бургер-меню
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.getElementById("siteNav");

    const setMenu = (open) => {
        if (!toggle || !nav) return;
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        nav.classList.toggle("is-open", open);
        document.body.style.overflow = open ? "hidden" : "";
    };

    if (toggle && nav) {
        toggle.addEventListener("click", () => {
            const isOpen = toggle.getAttribute("aria-expanded") === "true";
            setMenu(!isOpen);
        });

        // Закрыть по клику на ссылку
        nav.addEventListener("click", (e) => {
            const a = e.target.closest("a");
            if (!a) return;
            // если якорь — закрываем и плавно скроллим
            const href = a.getAttribute("href") || "";
            if (href.startsWith("#")) setMenu(false);
        });

        // Закрыть по ESC
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") setMenu(false);
        });

        // Закрыть при клике вне меню (на мобилке)
        document.addEventListener("click", (e) => {
            if (!nav.classList.contains("is-open")) return;
            const insideNav = nav.contains(e.target);
            const insideBtn = toggle.contains(e.target);
            if (!insideNav && !insideBtn) setMenu(false);
        });
    }

    // 3) Плавный скролл для якорей (и небольшой отступ под sticky header)
    const header = document.querySelector(".site-header");
    const headerOffset = () => (header ? header.getBoundingClientRect().height : 0);

    document.addEventListener("click", (e) => {
        const a = e.target.closest('a[href^="#"]');
        if (!a) return;

        const id = a.getAttribute("href");
        if (!id || id === "#") return;

        const target = document.querySelector(id);
        if (!target) return;

        e.preventDefault();
        const top = window.scrollY + target.getBoundingClientRect().top - headerOffset() - 10;

        window.scrollTo({ top, behavior: "smooth" });
        history.pushState(null, "", id);
    });

    // 4) Активная ссылка меню по секциям (IntersectionObserver)
    const navLinks = Array.from(document.querySelectorAll('.nav__list a[href^="#"]'));
    const sections = navLinks
        .map(a => document.querySelector(a.getAttribute("href")))
        .filter(Boolean);

    const setActive = (id) => {
        navLinks.forEach(a => {
            const active = a.getAttribute("href") === id;
            a.classList.toggle("is-active", active);
        });
    };

    if (sections.length) {
        const obs = new IntersectionObserver((entries) => {
            // выбираем наиболее видимую секцию
            const visible = entries
                .filter(e => e.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

            if (visible?.target?.id) setActive("#" + visible.target.id);
        }, {
            root: null,
            threshold: [0.15, 0.25, 0.4, 0.6],
            rootMargin: `-${headerOffset()}px 0px -55% 0px`
        });

        sections.forEach(s => obs.observe(s));
    }

    // 5) “Мягкая” реакция хедера при скролле
    const onScroll = () => {
        const scrolled = window.scrollY > 10;
        document.querySelector(".site-header")?.classList.toggle("is-scrolled", scrolled);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // 6) Галерея: прокрутка колесом мыши (горизонтально)
    const gallery = document.querySelector(".gallery-scroll");
    if (gallery) {
        gallery.addEventListener("wheel", (e) => {
            // если трекпад — часто уже горизонталь, не мешаем
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
            e.preventDefault();
            gallery.scrollLeft += e.deltaY;
        }, { passive: false });

        // Подсказка: если есть прокрутка — добавим class, можно использовать в css при желании
        const update = () => {
            gallery.classList.toggle("is-scrollable", gallery.scrollWidth > gallery.clientWidth + 2);
        };
        update();
        window.addEventListener("resize", update);
    }
});
