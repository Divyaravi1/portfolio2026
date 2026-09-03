/* ============================================================
   inji-manifest.js — flow-strip data for inji.html

   PATH: assets/data/inji-manifest.js
   Loaded by: inji.html, via a plain <script src> BEFORE flow-strip.js
   Images:    assets/img/inji/   (filenames per screen-naming.md)

   A plain script, not fetched JSON, so the page works when opened
   straight from disk over file://.

   ── EDITING THIS FILE BY HAND ───────────────────────────────
   Every screen sits between  ─── SCREEN n ───  and  ─── END SCREEN n ───
   delimiters, numbered per strip. To remove a comment bubble, delete
   that screen's "explanation" line or set it to null. Nothing else
   needs touching — a null explanation renders no bubble, no empty
   container and no layout shift.

   To remove a screen entirely, delete everything between its two
   delimiters, including the trailing comma.
   ────────────────────────────────────────────────────────────

   ── STILL TO DO ─────────────────────────────────────────────
   1. Every "alt" is a PLACEHOLDER written from the filename, not from
      the screen. All 15 need replacing.
   2. The three "DRAFT —" explanations are drafts for review. Bubbles
      are capped at four across the whole page (CORRECTIONS.md); three
      are used here, so one remains available.
   ────────────────────────────────────────────────────────────

   Captions and glosses are verbatim from inji-page-content.md.
   ============================================================ */

window.FLOW_MANIFEST_INJI = {
  strips: [

    /* ══════════════════════════════════════════════════════════
       STRIP 1 · dcapi-flow — instant sharing, 4 screens
       Four screens at 4 across, so the group fits one page and the
       arrows and connector are correctly hidden. This is a genuinely
       short flow; leave it at four.
       ══════════════════════════════════════════════════════════ */
    {
      id: "dcapi-flow",
      orientation: "portrait",
      useCaseLabel: null,
      caption: "The browser and the OS consume the first two steps. By the time I own a surface, the user has already been asked twice, so my screen has to add something rather than repeat.",
      gloss: "DC API, the browser-and-OS route that shares a credential without opening the wallet.",
      screens: [

        // ─── SCREEN 1 · inji_dcapi_flow_1-request ─────────────────────
        // To remove this screen's comment bubble, delete the
        // "explanation" line below (or set it to null). Nothing else.
        {
          file: "inji_dcapi_flow_1-request.png",
          alt:  "PLACEHOLDER, verifier request screen",
          label: "1 · request",
          explanation: null,
          tall: false
        },
        // ─── END SCREEN 1 ─────────────────────────────────────────────

        // ─── SCREEN 2 · inji_dcapi_flow_2-ospicker ────────────────────
        // To remove this screen's comment bubble, delete the
        // "explanation" line below (or set it to null). Nothing else.
        {
          file: "inji_dcapi_flow_2-ospicker.png",
          alt:  "PLACEHOLDER, operating system credential picker",
          label: "2 · not yours",
          explanation: " The User, in this use case, can choose to share one or more (upto 3) credentials for the specific request.",
          tall: false
        },
        // ─── END SCREEN 2 ─────────────────────────────────────────────

        // ─── SCREEN 3 · inji_dcapi_flow_3-walletconsent ───────────────
        // To remove this screen's comment bubble, delete the
        // "explanation" line below (or set it to null). Nothing else.
        {
          file: "inji_dcapi_flow_3-walletconsent.png",
          alt:  "PLACEHOLDER, wallet consent screen",
          label: "3 · wallet consent",
          explanation: "The user can selectively choose which fields to share with the requesting party.",
          tall: false
        },
        // ─── END SCREEN 3 ─────────────────────────────────────────────

        // ─── SCREEN 4 · inji_dcapi_flow_4-result ──────────────────────
        // To remove this screen's comment bubble, delete the
        // "explanation" line below (or set it to null). Nothing else.
        {
          file: "inji_dcapi_flow_4-result.png",
          alt:  "PLACEHOLDER, share result screen",
          label: "4 · result",
          explanation: null,
          tall: false
        }
        // ─── END SCREEN 4 ─────────────────────────────────────────────

      ]
    },

    /* ══════════════════════════════════════════════════════════
       STRIP 2 · dcql-flow — in-app review, 8 screens
       Eight screens at 4 across pages as 4 + 4, so both arrows appear
       and the connector renders above the 4th tile on page one.
       ══════════════════════════════════════════════════════════ */
    {
      id: "dcql-flow",
      orientation: "portrait",
      useCaseLabel: null,
      caption: "Going through the app costs an interruption and buys a surface that can actually be reviewed.",
      gloss: "DCQL, the query language a verifier uses to specify which credential and which information it needs.",
      screens: [

        // ─── SCREEN 1 · inji_dcql_flow_1-request ──────────────────────
        // To remove this screen's comment bubble, delete the
        // "explanation" line below (or set it to null). Nothing else.
        {
          file: "inji_dcql_flow_1-request.png",
          alt:  "PLACEHOLDER, in-app verifier request screen",
          label: "1 · request",
          explanation: null,
          tall: false
        },
        // ─── END SCREEN 1 ─────────────────────────────────────────────

        // ─── SCREEN 2 · inji_dcql_flow_2-credentiallist ───────────────
        // To remove this screen's comment bubble, delete the
        // "explanation" line below (or set it to null). Nothing else.
        {
          file: "inji_dcql_flow_2-credentiallist.png",
          alt:  "PLACEHOLDER, list of matching credentials",
          label: "2 · credential list",
          explanation: null,
          tall: false
        },
        // ─── END SCREEN 2 ─────────────────────────────────────────────

        // ─── SCREEN 3 · inji_dcql_flow_3-fieldselect ──────────────────
        // To remove this screen's comment bubble, delete the
        // "explanation" line below (or set it to null). Nothing else.
        {
          file: "inji_dcql_flow_3-fieldselect.png",
          alt:  "PLACEHOLDER, field selection screen",
          label: "3 · choose fields",
          explanation: " Required, optional and shared-by-default, grouped and labelled rather than greyed out.",
          tall: false
        },
        // ─── END SCREEN 3 ─────────────────────────────────────────────

        // ─── SCREEN 4 · inji_dcql_flow_4-confirm ──────────────────────
        // To remove this screen's comment bubble, delete the
        // "explanation" line below (or set it to null). Nothing else.
        {
          file: "inji_dcql_flow_4-confirm.png",
          alt:  "PLACEHOLDER, confirmation screen",
          label: "4 · confirm",
          explanation: null,
          tall: false
        },
        // ─── END SCREEN 4 ─────────────────────────────────────────────

        // ─── SCREEN 5 · inji_dcql_flow_7-authenticate ─────────────────
        // To remove this screen's comment bubble, delete the
        // "explanation" line below (or set it to null). Nothing else.
        {
          file: "inji_dcql_flow_7-authenticate.png",
          alt:  "PLACEHOLDER, authentication screen",
          label: "5 · authenticate",
          explanation: null,
          tall: false
        },
        // ─── END SCREEN 5 ─────────────────────────────────────────────

        // ─── SCREEN 6 · inji_dcql_flow_8-shared ───────────────────────
        // To remove this screen's comment bubble, delete the
        // "explanation" line below (or set it to null). Nothing else.
        {
          file: "inji_dcql_flow_8-shared.png",
          alt:  "PLACEHOLDER, credential shared confirmation",
          label: "6 · shared",
          explanation: null,
          tall: false
        }
        // ─── END SCREEN 6 ─────────────────────────────────────────────

      ]
    },

    /* ══════════════════════════════════════════════════════════
       STRIP 3 · dcql-usecase-edgecases — 3 screens
       useCaseLabel is non-null, so this group renders the dotted
       outline with its label. Three screens fit one page at 4 across,
       so arrows and connector are correctly hidden. These are edge
       cases the request handling has to cover, not sequential steps
       of one flow, hence the reordering (the detail-comparison screen
       reads first, then the two ambiguous-match screens).
       ══════════════════════════════════════════════════════════ */
    {
      id: "dcql-usecase-edgecases",
      orientation: "portrait",
      useCaseLabel: "when the request is ambiguous",
      caption: "Going through the app costs an interruption and buys a surface that can actually be reviewed.",
      gloss: null,
      screens: [

        // ─── SCREEN 1 · inji_dcql_edgecase_3-passportdetail ───────────
        // To remove this screen's comment bubble, delete the
        // "explanation" line below (or set it to null). Nothing else.
        {
          file: "inji_dcql_edgecase_3-passportdetail.png",
          alt:  "PLACEHOLDER, comparing the details of two matching passports",
          label: "1 · comparing the details",
          explanation: null,
          tall: false
        },
        // ─── END SCREEN 1 ─────────────────────────────────────────────

        // ─── SCREEN 2 · inji_dcql_edgecase_1-twopassports ─────────────
        // To remove this screen's comment bubble, delete the
        // "explanation" line below (or set it to null). Nothing else.
        {
          file: "inji_dcql_edgecase_1-twopassports.png",
          alt:  "PLACEHOLDER, two passport credentials both matching the request",
          label: "2 · two passports",
          explanation: null,
          tall: false
        },
        // ─── END SCREEN 2 ─────────────────────────────────────────────

        // ─── SCREEN 3 · inji_dcql_edgecase_2-multiplematches ──────────
        // To remove this screen's comment bubble, delete the
        // "explanation" line below (or set it to null). Nothing else.
        {
          file: "inji_dcql_edgecase_2-multiplematches.png",
          alt:  "PLACEHOLDER, several credentials matching one request",
          label: "3 · several credentials match",
          explanation: null,
          tall: false
        }
        // ─── END SCREEN 3 ─────────────────────────────────────────────

      ]
    },

    /* ══════════════════════════════════════════════════════════
       STRIP 4 · sdjwt-web — selective disclosure on web, 4 screens
       Landscape, columns: 2, so four screens page 2+2 and the arrows
       and connector appear (the same reason dcql-flow runs at 4 across
       instead of fitting on one page). Screen 4 is the rejected
       greyed-out version — the contrast case — sitting last, alone on
       page two. Replaces the old before/after pair.
       ══════════════════════════════════════════════════════════ */
    {
      id: "sdjwt-web",
      orientation: "landscape",
      columns: 2,
      useCaseLabel: null,
      caption: "The shipped grouping treatment on web, ending with the greyed-out version it replaced.",
      gloss: null,
      screens: [

        // ─── SCREEN 1 · inji_sdjwt_web_1-request ──────────────────────
        // To remove this screen's comment bubble, delete the
        // "explanation" line below (or set it to null). Nothing else.
        {
          file: "inji_sdjwt_web_1-request.png",
          alt:  "PLACEHOLDER, verifier request screen on web",
          label: "1 · request",
          explanation: null,
          tall: false
        },
        // ─── END SCREEN 1 ─────────────────────────────────────────────

        // ─── SCREEN 2 · inji_sdjwt_web_2-grouped ──────────────────────
        // To remove this screen's comment bubble, delete the
        // "explanation" line below (or set it to null). Nothing else.
        {
          file: "inji_sdjwt_web_2-grouped.png",
          alt:  "PLACEHOLDER, required, optional and default groups on web",
          label: "2 · required, optional, default",
          explanation: null,
          tall: false
        },
        // ─── END SCREEN 2 ─────────────────────────────────────────────

        // ─── SCREEN 3 · inji_sdjwt_web_3-confirm ──────────────────────
        // To remove this screen's comment bubble, delete the
        // "explanation" line below (or set it to null). Nothing else.
        {
          file: "inji_sdjwt_web_3-confirm.png",
          alt:  "PLACEHOLDER, confirmation screen on web",
          label: "3 · confirm",
          explanation: null,
          tall: false
        },
        // ─── END SCREEN 3 ─────────────────────────────────────────────

        // ─── SCREEN 4 · inji_sdjwt_web_4-rejected ─────────────────────
        // To remove this screen's comment bubble, delete the
        // "explanation" line below (or set it to null). Nothing else.
        {
          file: "inji_sdjwt_web_4-rejected.png",
          alt:  "PLACEHOLDER, rejected single scrolling panel with greyed fields, on web",
          label: "4 · the version that failed",
          explanation: null,
          tall: false
        }
        // ─── END SCREEN 4 ─────────────────────────────────────────────

      ]
    }

  ]
};
