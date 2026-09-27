/* =========================================================
   WM CALCULATOR
   BPM → ms / Hz
   ========================================================= */

const isEmbed = window.parent !== window;
if (isEmbed) {
    document.documentElement.classList.add("is-embed");
}

function reportEmbedHeight() {
    if (!isEmbed) {
        return;
    }

    const root = document.querySelector(".calc") || document.body;
    const rect = root.getBoundingClientRect();
    const height = Math.ceil(
        Math.max(rect.height, document.body.scrollHeight, 200) + 2,
    );

    window.parent.postMessage(
        {
            type: "wm-tool-resize",
            height,
        },
        "*",
    );
}

window.reportEmbedHeight = reportEmbedHeight;

const NOTE_DEFS = [
    { id: "bar", label: "1 bar", mult: 4 },
    { id: "1/2", label: "1/2", mult: 2 },
    { id: "1/4", label: "1/4", mult: 1 },
    { id: "1/8", label: "1/8", mult: 0.5 },
    { id: "1/16", label: "1/16", mult: 0.25 },
    { id: "1/32", label: "1/32", mult: 0.125 },
    { id: "1/64", label: "1/64", mult: 0.0625 },
];

let mode = "straight"; // straight | triplet | dotted

const bpmInput = document.getElementById("bpmInput");
const bpmDown = document.getElementById("bpmDown");
const bpmUp = document.getElementById("bpmUp");
const calcBody = document.getElementById("calcBody");
const modeButtons = document.querySelectorAll(".calc__mode");

function clampBpm(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) {
        return 125;
    }
    return Math.min(400, Math.max(20, n));
}

function modeFactor(currentMode) {
    if (currentMode === "triplet") {
        return 2 / 3;
    }
    if (currentMode === "dotted") {
        return 1.5;
    }
    return 1;
}

function formatMs(ms) {
    if (ms >= 100) {
        return ms.toFixed(1).replace(/\.0$/, "");
    }
    if (ms >= 10) {
        return ms.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
    }
    return ms.toFixed(2);
}

function formatHz(hz) {
    if (hz >= 100) {
        return hz.toFixed(1).replace(/\.0$/, "");
    }
    if (hz >= 10) {
        return hz.toFixed(2);
    }
    return hz.toFixed(2);
}

function computeRows(bpm) {
    const quarterMs = 60000 / bpm;
    const factor = modeFactor(mode);

    return NOTE_DEFS.map((note) => {
        const ms = quarterMs * note.mult * factor;
        const hz = 1000 / ms;
        let label = note.label;
        if (mode === "triplet" && note.id !== "bar") {
            label = `${note.label}T`;
        } else if (mode === "dotted" && note.id !== "bar") {
            label = `${note.label}D`;
        }
        return {
            label,
            ms,
            hz,
            msText: formatMs(ms),
            hzText: formatHz(hz),
        };
    });
}

function render() {
    const bpm = clampBpm(bpmInput.value);
    if (String(bpm) !== String(bpmInput.value) && bpmInput.value !== "") {
        bpmInput.value = String(bpm);
    }

    const rows = computeRows(bpm);
    calcBody.innerHTML = "";

    rows.forEach((row) => {
        const tr = document.createElement("tr");

        const tdNote = document.createElement("td");
        tdNote.className = "calc__note";
        tdNote.textContent = row.label;

        const tdMs = document.createElement("td");
        tdMs.className = "calc__value";
        tdMs.textContent = row.msText;
        tdMs.title = "Copy ms";
        tdMs.dataset.copy = row.msText;

        const tdHz = document.createElement("td");
        tdHz.className = "calc__value";
        tdHz.textContent = row.hzText;
        tdHz.title = "Copy Hz";
        tdHz.dataset.copy = row.hzText;

        tr.appendChild(tdNote);
        tr.appendChild(tdMs);
        tr.appendChild(tdHz);
        calcBody.appendChild(tr);
    });

    reportEmbedHeight();
}

async function copyValue(el) {
    const text = el.dataset.copy;
    if (!text) {
        return;
    }

    try {
        await navigator.clipboard.writeText(text);
    } catch (error) {
        const area = document.createElement("textarea");
        area.value = text;
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        area.remove();
    }

    el.classList.add("is-copied");
    window.setTimeout(() => {
        el.classList.remove("is-copied");
    }, 400);
}

bpmInput.addEventListener("input", () => {
    render();
});

bpmInput.addEventListener("change", () => {
    bpmInput.value = String(clampBpm(bpmInput.value));
    render();
});

bpmDown.addEventListener("click", () => {
    bpmInput.value = String(clampBpm(Number(bpmInput.value) - 1));
    render();
});

bpmUp.addEventListener("click", () => {
    bpmInput.value = String(clampBpm(Number(bpmInput.value) + 1));
    render();
});

modeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        modeButtons.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        mode = btn.dataset.mode || "straight";
        render();
    });
});

calcBody.addEventListener("click", (event) => {
    const target = event.target;
    if (target && target.classList.contains("calc__value")) {
        void copyValue(target);
    }
});

window.addEventListener("message", (event) => {
    if (event.data && event.data.type === "wm-tool-request-height") {
        reportEmbedHeight();
    }
});

render();

if (isEmbed) {
    window.addEventListener("load", reportEmbedHeight);
    window.setTimeout(reportEmbedHeight, 100);
    window.setTimeout(reportEmbedHeight, 400);
}
