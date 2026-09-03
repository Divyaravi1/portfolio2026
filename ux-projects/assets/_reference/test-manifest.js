/* ============================================================
   test-manifest.js — reference fixture for the flow strip.

   PATH: assets/_reference/test-manifest.js
   Loaded by: assets/_reference/test.html, via a plain <script src>
              BEFORE ../js/flow-strip.js

   Lives under assets/_reference/ so it sits away from the live pages.
   This is the reference for what the component looks like populated —
   eight screens so the group overflows and the arrows and connector
   appear, and two screens carrying real explanation text so the
   comment bubble and its pop animation are demonstrated.
   ============================================================ */

window.FLOW_MANIFEST_REFERENCE = {
  "strips": [
    {
      "id": "reference-eight",
      "orientation": "portrait",
      "useCaseLabel": "selecting between two passports",
      "caption": "Eight screens in one use-case group. Arrows advance by exactly four and disable at each end rather than looping; the connector marks the last visible tile of a page that has a next.",
      "gloss": "DCQL — the query language a verifier uses to specify which credential and which information it needs.",
      "screens": [
        { "file": "ref_1.png", "alt": "Verifier request screen showing the requested credential", "label": "1 · request",
          "explanation": "The verifier's request arrives written in a query language. This screen is the first point at which a person sees it in plain language." },
        { "file": "ref_2.png", "alt": "Android OS credential picker", "label": "2 · not yours", "explanation": null },
        { "file": "ref_3.png", "alt": "Wallet consent screen", "label": "3 · wallet consent",
          "explanation": "Field-level selection is the reason the wallet screen exists in this flow, and it is the one thing the OS surface cannot offer." },
        { "file": "ref_4.png", "alt": "Field-level selection screen", "label": "4 · field select", "explanation": null },
        { "file": "ref_5.png", "alt": "Confirmation screen", "label": "5 · confirm", "explanation": null },
        { "file": "ref_6.png", "alt": "Share result screen", "label": "6 · result", "explanation": null },
        { "file": "ref_7.png", "alt": "Choosing between two passport credentials", "label": "7 · two passports", "explanation": null },
        { "file": "ref_8.png", "alt": "Completed share", "label": "8 · done", "explanation": null }
      ]
    }
  ]
};
