# WM Tapper

A modern cross-platform web and desktop application combining manual tap tempo with automated audio analysis (BPM, Musical Key, Waveform) and flexible UI customization.

This tool was created primarily for personal studio workflow and quick track organization to immediately detect tempo and scale, test rhythmic patterns, and manage audio sessions without relying on heavy DAWs.

## Features & Technologies

* **Automated Audio Analysis:** Utilizes [Essentia.js](https://github.com/mtg/essentia.js) (WebAssembly) in a dedicated Web Worker to analyze loaded audio files for exact BPM and Musical Key without blocking the main UI thread.
* **Manual Tap Tempo Engine:** High-precision manual BPM counter supporting key/mouse inputs, custom tap reset intervals, and dynamic average calculation.
* **Interactive Waveform Player:** Powered by HTML5 Canvas for real-time visual waveform rendering, audio playback control, and precise seeking.
* **Cross-Platform & Desktop GUI:** Built with modern Web standards (HTML5/CSS3/ES Modules) and wrapped with [Tauri](https://tauri.app/) for native, lightweight cross-platform desktop builds.
* **Localization & Workflows:** Built-in multi-language support (i18n), customizable hotkey bindings, and session/settings state persistence via `localStorage`.

## License & Usage

This project is **source-available** and free for **personal, non-commercial use**. 

You are welcome to study, run, and use this project for your personal workflow. Commercial distribution, hosting it as a paid/commercial service, or creating derivative commercial products is prohibited.

For complete licensing terms, see the [LICENSE](LICENSE) file.
