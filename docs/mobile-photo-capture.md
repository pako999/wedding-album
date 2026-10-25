# Album camera recovery — 25 October 2026

The supplied image shows the phone's native camera UI with a black preview, not a website video element. Album capture does not use getUserMedia. The site cannot inspect that preview or change the host app's iOS/Android camera permission. The exact hardware/host-app failure is not reproduced in cloud automation.

Found three duplicated inputs combining image/video acceptance, multi-selection and rear-camera capture. Replace these with a single shared photo-only, single-file native capture button. Camera files continue through the existing UploadModal and retain their original bytes. Repeated selection is supported. Disable the photo button when album flags disallow photos; normal video/gallery uploads remain available through the existing upload flow.

Recognized mobile WebViews (including typical iPhone embedded user agents and Android wv) show a translated recovery dialog before attempting native capture. Guests can upload from their photo library, open the album in Safari/Chrome using the host app menu, or explicitly retry capture. Cancellation leaves the fallback available. The ordinary upload dialog also shows this recovery guidance in embedded browsers, covering the system picker’s own Camera option. Detection is a heuristic; the separate upload button remains available in all supported browsers.

Verification: build/TypeScript, existing product checks and 37 suite/checkout tests; actual component file-chooser tests with iPhone Safari, Android Chrome and embedded browser identities; all six languages at 320px; existing upload-modal browser regression. CI runs capture checks using Chromium and WebKit. Native hardware preview, host-app permissions and the actual user's phone remain unverified. No album rows, file storage rules or payment code change.

CI uses the pinned Playwright 1.55.1 Noble image to match its pinned browser-tool package. Two host browser-install attempts stalled before tests; the image supplies Chromium/WebKit and their OS dependencies without that installation step.
