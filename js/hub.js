/* =========================================================
   WHT MST HUB
   ========================================================= */

(function () {
    const modules = document.querySelectorAll("[data-module]");

    function closePanels(module) {
        module.classList.remove("is-open", "is-download");

        module
            .querySelectorAll(".module__btn[data-action]")
            .forEach((btn) => btn.classList.remove("is-active"));

        const frame = module.querySelector(".module__frame");

        if (frame && frame.dataset.loaded === "true") {
            /* keep src — faster re-open; clear if you want full reset:
               frame.removeAttribute("src");
               frame.dataset.loaded = "false";
            */
        }
    }

    function openApp(module) {
        const wasOpen = module.classList.contains("is-open");

        modules.forEach((item) => {
            if (item !== module) {
                closePanels(item);
            }
        });

        if (wasOpen) {
            closePanels(module);
            return;
        }

        module.classList.remove("is-download");
        module.classList.add("is-open");

        module
            .querySelectorAll(".module__btn[data-action]")
            .forEach((btn) => btn.classList.remove("is-active"));

        const openBtn = module.querySelector('.module__btn[data-action="open"]');

        if (openBtn) {
            openBtn.classList.add("is-active");
        }

        const frame = module.querySelector(".module__frame");
        const src = module.dataset.appSrc;

        if (frame && src) {
            frame.classList.remove("is-ready");

            if (frame.dataset.loaded !== "true") {
                frame.src = src;
                frame.dataset.loaded = "true";
            } else {
                /* already loaded — ask for height again */
                try {
                    frame.contentWindow.postMessage(
                        { type: "wm-tool-request-height" },
                        "*",
                    );
                } catch (error) {
                    /* ignore */
                }

                window.setTimeout(() => {
                    frame.classList.add("is-ready");
                }, 50);
            }
        }
    }

    function openDownload(module) {
        const wasDownload = module.classList.contains("is-download");

        modules.forEach((item) => {
            if (item !== module) {
                closePanels(item);
            }
        });

        if (wasDownload) {
            closePanels(module);
            return;
        }

        module.classList.remove("is-open");
        module.classList.add("is-download");

        module
            .querySelectorAll(".module__btn[data-action]")
            .forEach((btn) => btn.classList.remove("is-active"));

        const downloadBtn = module.querySelector(
            '.module__btn[data-action="download"]',
        );

        if (downloadBtn) {
            downloadBtn.classList.add("is-active");
        }
    }

    modules.forEach((module) => {
        const openBtn = module.querySelector('.module__btn[data-action="open"]');
        const downloadBtn = module.querySelector(
            '.module__btn[data-action="download"]',
        );

        if (openBtn) {
            openBtn.addEventListener("click", () => openApp(module));
        }

        if (downloadBtn) {
            downloadBtn.addEventListener("click", () => openDownload(module));
        }
    });

    const params = new URLSearchParams(window.location.search);
    const openId = params.get("open");

    if (openId) {
        const module = document.querySelector(`[data-module="${openId}"]`);

        if (module) {
            openApp(module);

            const cleanUrl = new URL(window.location.href);
            cleanUrl.searchParams.delete("open");
            window.history.replaceState({}, "", cleanUrl.pathname);
        }
    }

    window.addEventListener("message", (event) => {
        if (!event.data || event.data.type !== "wm-tool-resize") {
            return;
        }

        const height = Number(event.data.height);

        if (!Number.isFinite(height) || height < 200) {
            return;
        }

        modules.forEach((module) => {
            if (!module.classList.contains("is-open")) {
                return;
            }

            const frame = module.querySelector(".module__frame");

            if (frame && frame.contentWindow === event.source) {
                frame.style.height = `${Math.ceil(height)}px`;
                frame.classList.add("is-ready");
            }
        });
    });
})();
