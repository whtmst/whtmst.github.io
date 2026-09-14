/* =========================================================
   WM TAPPER
   Tap Key Handler
   ========================================================= */

/* =========================================================
   IMPORTS
   ========================================================= */

import { settings, isAllowedTapKey } from "./settings.js";

import { getTranslations } from "./i18n.js";

/* =========================================================
   KEY DISPLAY NAME
   ========================================================= */

/**
 * Convert KeyboardEvent.code to a readable label.
 *
 * @param {string} code
 * @returns {string}
 */
export function getKeyDisplayName(code) {
    /* Letters */

    if (/^Key[A-Z]$/.test(code)) {
        return code.replace("Key", "");
    }

    /* Numbers */

    if (/^Digit[0-9]$/.test(code)) {
        return code.replace("Digit", "");
    }

    /* Numpad numbers */

    if (/^Numpad[0-9]$/.test(code)) {
        return `NUM ${code.replace("Numpad", "")}`;
    }

    const specialNames = {
        Space: "SPACE",

        Enter: "ENTER",

        Tab: "TAB",

        Backquote: "`",
        Minus: "-",
        Equal: "=",
        BracketLeft: "[",
        BracketRight: "]",
        Backslash: "\\",
        Semicolon: ";",
        Quote: "'",
        Comma: ",",
        Period: ".",
        Slash: "/",

        F1: "F1",
        F2: "F2",
        F3: "F3",
        F4: "F4",
        F5: "F5",
        F6: "F6",
        F7: "F7",
        F8: "F8",
        F9: "F9",
        F10: "F10",
        F11: "F11",
        F12: "F12",

        ArrowUp: "↑",
        ArrowDown: "↓",
        ArrowLeft: "←",
        ArrowRight: "→",

        Home: "HOME",
        End: "END",

        PageUp: "PAGE UP",
        PageDown: "PAGE DOWN",

        Insert: "INSERT",
        Delete: "DELETE",

        NumpadAdd: "NUM +",
        NumpadSubtract: "NUM −",
        NumpadMultiply: "NUM ×",
        NumpadDivide: "NUM ÷",
        NumpadDecimal: "NUM .",
        NumpadEnter: "NUM ENTER",
    };

    return specialNames[code] || code.toUpperCase();
}

/* =========================================================
   TAP KEY CONTROLLER
   ========================================================= */

export class TapKeyController {
    /**
     * @param {Object} elements
     * @param {HTMLElement} elements.control
     * @param {HTMLElement} elements.value
     */
    constructor(elements) {
        this.control = elements.control;
    
        this.value = elements.value;
    
        this.onTap = elements.onTap;
        this.onCaptureStart = elements.onCaptureStart || null;
        this.onCaptureEnd = elements.onCaptureEnd || null;

        this.isCapturing = false;

        this.previousKey = settings.get("tapKey");

        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    /**
     * Get current language.
     *
     * @returns {string}
     */
    getLanguage() {
        return settings.get("language");
    }

    /**
     * Update displayed key.
     */
    updateDisplay() {
        if (this.isCapturing) {
            return;
        }

        const key = settings.get("tapKey");

        this.value.textContent = getKeyDisplayName(key);
    }

    /**
     * Start capture mode.
     */
    startCapture() {
        if (this.isCapturing) {
            return;
        }

        this.previousKey = settings.get("tapKey");

        this.isCapturing = true;

        this.control.classList.add("is-listening");

        const text = getTranslations(this.getLanguage());

        this.value.textContent = text.pressKey;

        if (typeof this.onCaptureStart === "function") {
            this.onCaptureStart();
        }

        document.addEventListener("keydown", this.handleKeyDown, true);
    }

    /**
     * Stop capture mode.
     */
    stopCapture() {
        this.isCapturing = false;

        this.control.classList.remove("is-listening");

        document.removeEventListener("keydown", this.handleKeyDown, true);

        this.updateDisplay();

        if (typeof this.onCaptureEnd === "function") {
            this.onCaptureEnd();
        }
    }

    /**
     * Handle captured key.
     *
     * @param {KeyboardEvent} event
     */
    handleKeyDown(event) {
        /* -----------------------------------------
           Escape = cancel
           ----------------------------------------- */

        if (event.code === "Escape") {
            event.preventDefault();
            event.stopPropagation();

            settings.set("tapKey", this.previousKey);

            this.stopCapture();

            return;
        }

        /* -----------------------------------------
           Reject modifier combinations
           ----------------------------------------- */

        if (event.ctrlKey || event.shiftKey || event.altKey || event.metaKey) {
            return;
        }

        /* -----------------------------------------
           Check key
           ----------------------------------------- */

        if (!isAllowedTapKey(event.code)) {
            return;
        }

        if (event.code === settings.get("globalTapKey")) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();

            this.control.classList.remove("is-error");
            void this.control.offsetWidth;
            this.control.classList.add("is-error");

            window.setTimeout(() => {
                this.control.classList.remove("is-error");
            }, 500);

            return;
        }

        event.preventDefault();
        event.stopPropagation();

        /* -----------------------------------------
           Save immediately
           ----------------------------------------- */

        settings.set("tapKey", event.code);

        this.stopCapture();
    }

    /**
     * Handle normal tap key press.
     *
     * @param {KeyboardEvent} event
     */
    handleTapKeyDown(event) {
        if (this.isCapturing) {
            return;
        }

        const tapKey = settings.get("tapKey");

        if (event.code !== tapKey) {
            return;
        }

        if (event.ctrlKey || event.shiftKey || event.altKey || event.metaKey) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        this.onTap();
    }

    /**
     * Initialize the controller.
     */
    initialize() {
        this.control.addEventListener("click", () => {
            this.startCapture();
        });
    
        this.handleTapKeyDown =
            this.handleTapKeyDown.bind(this);
    
        document.addEventListener(
            "keydown",
            this.handleTapKeyDown,
            true,
        );
    
        this.updateDisplay();
    }
}

/* =========================================================
   GLOBAL TAP KEY CONTROLLER (UI capture only)
   ========================================================= */

export class GlobalTapKeyController {
    constructor(elements) {
        this.control = elements.control;
        this.value = elements.value;
        this.onChanged = elements.onChanged || null;
        this.onCaptureStart = elements.onCaptureStart || null;
        this.onCaptureEnd = elements.onCaptureEnd || null;
        this.isCapturing = false;
        this.previousKey = settings.get("globalTapKey");
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    getLanguage() {
        return settings.get("language");
    }

    updateDisplay() {
        if (this.isCapturing) {
            return;
        }

        const key = settings.get("globalTapKey");
        this.value.textContent = getKeyDisplayName(key);
    }

    startCapture() {
        if (this.isCapturing) {
            return;
        }

        this.previousKey = settings.get("globalTapKey");
        this.isCapturing = true;
        this.control.classList.add("is-listening");

        const text = getTranslations(this.getLanguage());
        this.value.textContent = text.pressKey;

        if (typeof this.onCaptureStart === "function") {
            this.onCaptureStart();
        }

        document.addEventListener("keydown", this.handleKeyDown, true);
    }

    stopCapture() {
        this.isCapturing = false;
        this.control.classList.remove("is-listening");
        document.removeEventListener("keydown", this.handleKeyDown, true);
        this.updateDisplay();

        if (typeof this.onCaptureEnd === "function") {
            this.onCaptureEnd();
        }
    }

    handleKeyDown(event) {
        if (event.code === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            settings.set("globalTapKey", this.previousKey);
            this.stopCapture();
            return;
        }

        if (event.ctrlKey || event.shiftKey || event.altKey || event.metaKey) {
            return;
        }

        if (!isAllowedTapKey(event.code)) {
            return;
        }

        if (event.code === settings.get("tapKey")) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();

            this.control.classList.remove("is-error");
            void this.control.offsetWidth;
            this.control.classList.add("is-error");

            window.setTimeout(() => {
                this.control.classList.remove("is-error");
            }, 500);

            return;
        }

        event.preventDefault();
        event.stopPropagation();

        settings.set("globalTapKey", event.code);
        this.stopCapture();

        if (typeof this.onChanged === "function") {
            this.onChanged(event.code);
        }
    }

    initialize() {
        if (!this.control || !this.value) {
            return;
        }

        this.control.addEventListener("click", () => {
            this.startCapture();
        });

        this.updateDisplay();
    }
}
