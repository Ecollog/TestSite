(() => {
    const $ = (s, root = document) => root.querySelector(s);
    const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));

    // ===== Year in footer
    const yearEl = $("#year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    // ===== Mobile nav
    const nav = $(".nav");
    const toggle = $(".nav-toggle");
    if (nav && toggle) {
        toggle.addEventListener("click", () => {
            const open = nav.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", String(open));
        });

        nav.addEventListener("click", (e) => {
            const a = e.target.closest("a");
            if (!a) return;
            nav.classList.remove("is-open");
            toggle.setAttribute("aria-expanded", "false");
        });

        window.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && nav.classList.contains("is-open")) {
                nav.classList.remove("is-open");
                toggle.setAttribute("aria-expanded", "false");
            }
        });
    }

    // ===== Smooth scroll offset for sticky header
    const header = $(".site-header") || $("header");
    const headerH = () => (header ? header.getBoundingClientRect().height : 0);

    $$('a[href^="#"]').forEach((a) => {
        a.addEventListener("click", (e) => {
            const id = a.getAttribute("href");
            if (!id || id === "#") return;

            const target = document.querySelector(id);
            if (!target) return;

            e.preventDefault();
            const y = window.scrollY + target.getBoundingClientRect().top - headerH() - 10;
            window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
        });
    });

    // ===== Active section highlight in nav
    const sections = $$("main section[id]");
    const navLinks =
        $$(".nav__list a[href^='#']")
            .concat($$(".nav a[href^='#']"))
            .filter((v, i, arr) => arr.indexOf(v) === i);

    const linkById = new Map(navLinks.map(a => [a.getAttribute("href").slice(1), a]));

    const onScrollActive = () => {
        const mid = window.scrollY + headerH() + 120;

        let currentId = null;
        for (const s of sections) {
            const top = s.offsetTop;
            const bottom = top + s.offsetHeight;
            if (mid >= top && mid < bottom) {
                currentId = s.id;
                break;
            }
        }

        navLinks.forEach(a => a.classList.remove("is-active"));
        if (currentId && linkById.has(currentId)) {
            linkById.get(currentId).classList.add("is-active");
        }
    };
    window.addEventListener("scroll", onScrollActive, { passive: true });
    onScrollActive();

    // ===== Back to top button
    const backTop = document.createElement("button");
    backTop.className = "backtop";
    backTop.type = "button";
    backTop.setAttribute("aria-label", "Наверх");
    backTop.innerHTML = "<span>↑</span>";
    document.body.appendChild(backTop);

    const toggleBackTop = () => {
        if (window.scrollY > 700) backTop.classList.add("is-visible");
        else backTop.classList.remove("is-visible");
    };
    window.addEventListener("scroll", toggleBackTop, { passive: true });
    toggleBackTop();

    backTop.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    // ===== Toast helper
    let toastTimer = null;
    function toast(html, ms = 3500) {
        const old = $(".toast");
        if (old) old.remove();

        const t = document.createElement("div");
        t.className = "toast";
        t.innerHTML = html;
        document.body.appendChild(t);

        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => t.remove(), ms);
    }

    // ===== Gallery lightbox (под новый HTML)
    // Было: #gallery figure
    // Стало: #gallery .gallery-grid figure.card
    const galleryFigures =
        $$("#gallery .gallery-grid figure")
            .concat($$("#gallery figure"))
            .filter((v, i, arr) => arr.indexOf(v) === i);

    if (galleryFigures.length) {
        const lb = document.createElement("div");
        lb.className = "lightbox";
        lb.setAttribute("role", "dialog");
        lb.setAttribute("aria-modal", "true");
        lb.innerHTML = `
      <div class="lightbox__panel">
        <div class="lightbox__top">
          <div class="lightbox__title">Галерея</div>
          <button class="lightbox__btn" type="button" aria-label="Закрыть">Закрыть ✕</button>
        </div>
        <img class="lightbox__img" alt="" />
        <div class="lightbox__caption"></div>
      </div>
    `;
        document.body.appendChild(lb);

        const lbImg = $(".lightbox__img", lb);
        const lbCaption = $(".lightbox__caption", lb);
        const lbCloseBtn = $(".lightbox__btn", lb);

        let lastFocus = null;

        function openLightbox(src, alt, caption) {
            lastFocus = document.activeElement;
            lbImg.src = src;
            lbImg.alt = alt || "Фото";
            lbCaption.textContent = caption || "";
            lb.classList.add("is-open");
            document.body.style.overflow = "hidden";
            lbCloseBtn.focus();
        }

        function closeLightbox() {
            lb.classList.remove("is-open");
            document.body.style.overflow = "";
            if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
        }

        galleryFigures.forEach((fig) => {
            fig.tabIndex = 0;
            const img = $("img", fig);
            const cap = $("figcaption", fig);
            if (!img) return;

            const src = img.dataset.full || img.currentSrc || img.src;
            const caption = cap ? cap.textContent : "";

            const open = () => openLightbox(src, img.alt, caption);

            fig.addEventListener("click", open);
            fig.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    open();
                }
            });
        });

        lb.addEventListener("click", (e) => {
            if (e.target === lb) closeLightbox();
        });
        lbCloseBtn.addEventListener("click", closeLightbox);
        window.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && lb.classList.contains("is-open")) closeLightbox();
        });
    }

    // ===== Form: validation + "smart submit"
    const form = $("#bookingForm");
    if (form) {
        const nameInput = $("input[name='name']", form);
        const phoneInput = $("input[name='phone']", form);
        const serviceSelect = $("select[name='service']", form);
        const agreeCheck = $("input[name='agree']", form);
        const hint = $(".form-hint", form) || $(".form-hint");

        function clearErrors() {
            $$(".error-text", form).forEach(el => el.remove());
            $$(".field-error", form).forEach(el => el.classList.remove("field-error"));
        }

        function setFieldError(field, msg) {
            field.classList.add("field-error");
            const p = document.createElement("div");
            p.className = "error-text";
            p.textContent = msg;

            const wrap = field.closest("label") || field.parentElement;
            wrap.appendChild(p);
        }

        function normalizePhone(raw) {
            const cleaned = String(raw || "").replace(/[^\d+]/g, "");
            const digits = cleaned.replace(/[^\d]/g, "");
            if (digits.length === 11 && digits.startsWith("8")) return "+7" + digits.slice(1);
            if (digits.length === 11 && digits.startsWith("7")) return "+" + digits;
            if (cleaned.startsWith("+") && digits.length >= 10) return cleaned;
            return cleaned;
        }

        function validate() {
            clearErrors();
            if (hint) hint.textContent = "";

            let ok = true;
            const name = (nameInput?.value || "").trim();
            const phone = normalizePhone(phoneInput?.value || "");
            const service = serviceSelect?.value || "";
            const agree = !!agreeCheck?.checked;

            if (!nameInput || !phoneInput || !serviceSelect || !agreeCheck) {
                toast("Ошибка: не найдены поля формы. Проверьте name/id в HTML.");
                return false;
            }

            if (!name || name.length < 2) {
                ok = false;
                setFieldError(nameInput, "Введите имя (минимум 2 символа).");
            }

            const digits = phone.replace(/[^\d]/g, "");
            const looksRu = phone.startsWith("+7") && digits.length === 11;
            const looksAny = digits.length >= 10;

            if (!looksRu && !looksAny) {
                ok = false;
                setFieldError(phoneInput, "Введите корректный телефон (минимум 10 цифр).");
            } else {
                phoneInput.value = phone;
            }

            if (!service) {
                ok = false;
                setFieldError(serviceSelect, "Выберите услугу.");
            }

            if (!agree) {
                ok = false;
                setFieldError(agreeCheck, "Нужно согласие на обработку данных.");
            }

            return ok;
        }

        form.addEventListener("submit", (e) => {
            e.preventDefault();

            if (!validate()) {
                if (hint) hint.textContent = "Проверьте поля формы — есть ошибки.";
                toast("Проверьте поля формы — есть ошибки.");
                return;
            }

            const name = (nameInput.value || "").trim();
            const phone = normalizePhone(phoneInput.value || "");
            const service = serviceSelect.value;
            const comment = ($("textarea[name='comment']", form)?.value || "").trim();

            const plain =
                `Запись на брови:\n` +
                `Имя: ${name}\n` +
                `Телефон: ${phone}\n` +
                `Услуга: ${service}\n` +
                (comment ? `Комментарий: ${comment}\n` : "");

            const msg = encodeURIComponent(plain);

            // TODO: ЗАМЕНИТЕ на реальные данные
            const telegram = `https://t.me/USERNAME?text=${msg}`;
            const whatsapp = `https://wa.me/000000000000?text=${msg}`;

            toast(
                `Заявка готова ✅ <a href="${telegram}" target="_blank" rel="noopener">Отправить в Telegram</a> • ` +
                `<a href="${whatsapp}" target="_blank" rel="noopener">WhatsApp</a>`,
                8000
            );

            if (hint) hint.textContent = "Заявка сформирована. Выберите мессенджер в всплывающем сообщении.";
            form.reset();
        });

        // Убираем ошибку у поля при вводе
        form.addEventListener("input", (e) => {
            const field = e.target;
            if (!(field instanceof HTMLElement)) return;

            field.classList.remove("field-error");
            const err = field.closest("label")?.querySelector(".error-text")
                || field.parentElement?.querySelector(".error-text");
            if (err) err.remove();
        }, { passive: true });
    }
})();
