// ==UserScript==
// @name         Debrid Media Manager
// @namespace    https://debridmediamanager.com
// @version      1.0.1
// @description  Add accessible DMM buttons to IMDB, MDBList, TraktTV, JustWatch, TheTVDB, Criticker, Metacritic, and Bittorrent sites with magnet links
// @author       Ben Adrian Sarmiento <me@bensarmiento.com>
// @license      MIT
// @match        *://*/*
// @grant        none
// @downloadURL https://update.greasyfork.org/scripts/463268/Debrid%20Media%20Manager.user.js
// @updateURL https://update.greasyfork.org/scripts/463268/Debrid%20Media%20Manager.meta.js
// ==/UserScript==

(function () {
	"use strict";

	const DMM_HOST = "https://debridmediamanager.com";
	const X_DMM_HOST = "https://x.debridmediamanager.com";
	const SEARCH_BTN_LABEL = "🔎 DebridMediaManger";

function createButton(text, url) {
    const button = document.createElement("button");
    button.textContent = text;

    // Base styles
    button.style.cssText = `
        font-family: -apple-system, 'SF Pro Text', 'Helvetica Neue', sans-serif;
        font-size: 12px;
        font-weight: 500;
        letter-spacing: -0.1px;
        margin-left: 6px;
        padding: 4px 10px;
        border: none;
        border-radius: 980px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        color: rgba(255,255,255,0.92);
        background: rgba(255,255,255,0.18);
        backdrop-filter: saturate(180%) blur(20px);
        -webkit-backdrop-filter: saturate(180%) blur(20px);
        box-shadow:
            0 0 0 0.5px rgba(255,255,255,0.35) inset,
            0 1px 0 rgba(255,255,255,0.25) inset,
            0 -0.5px 0 rgba(0,0,0,0.08) inset,
            0 2px 8px rgba(0,0,0,0.12),
            0 0.5px 2px rgba(0,0,0,0.08);
        transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        text-shadow: 0 0.5px 1px rgba(0,0,0,0.25);
        isolation: isolate;
        vertical-align: middle;
    `;

    // Specular highlight pseudo-effect using a gradient overlay
    const highlight = document.createElement("span");
    highlight.style.cssText = `
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: linear-gradient(
            160deg,
            rgba(255,255,255,0.28) 0%,
            rgba(255,255,255,0.06) 40%,
            rgba(255,255,255,0.0) 60%,
            rgba(255,255,255,0.04) 100%
        );
        pointer-events: none;
    `;
    button.appendChild(highlight);

    // Hover — brighter glass, subtle lift
    button.onmouseover = function () {
        this.style.background = "rgba(255,255,255,0.26)";
        this.style.boxShadow = `
            0 0 0 0.5px rgba(255,255,255,0.45) inset,
            0 1px 0 rgba(255,255,255,0.35) inset,
            0 -0.5px 0 rgba(0,0,0,0.06) inset,
            0 4px 16px rgba(0,0,0,0.16),
            0 1px 4px rgba(0,0,0,0.1)
        `;
        this.style.transform = "translateY(-0.5px) scale(1.02)";
    };

    button.onmouseout = function () {
        this.style.background = "rgba(255,255,255,0.18)";
        this.style.boxShadow = `
            0 0 0 0.5px rgba(255,255,255,0.35) inset,
            0 1px 0 rgba(255,255,255,0.25) inset,
            0 -0.5px 0 rgba(0,0,0,0.08) inset,
            0 2px 8px rgba(0,0,0,0.12),
            0 0.5px 2px rgba(0,0,0,0.08)
        `;
        this.style.transform = "translateY(0) scale(1)";
    };

    // Click — press-in spring
    button.onmousedown = function () {
        this.style.transform = "scale(0.93) translateY(0.5px)";
        this.style.background = "rgba(255,255,255,0.12)";
        this.style.transition = "all 0.08s cubic-bezier(0.34, 1.56, 0.64, 1)";
    };

    button.onmouseup = function () {
        this.style.transform = "scale(1.02) translateY(-0.5px)";
        this.style.background = "rgba(255,255,255,0.26)";
        this.style.transition = "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)";
    };

    button.onclick = (event) => {
        event.preventDefault();
        window.open(url, "_blank");
    };

    return button;
}

function createLink(text, url) {
    const link = document.createElement("a");
    link.textContent = text;
    link.href = url;
    link.target = "_blank";

    link.style.cssText = `
        display: inline-flex;
        align-items: center;
        font-family: -apple-system, 'SF Pro Text', 'Helvetica Neue', sans-serif;
        font-size: 12px;
        font-weight: 500;
        letter-spacing: -0.1px;
        margin-left: 6px;
        padding: 4px 10px;
        border-radius: 980px;
        background: rgba(255,255,255,0.18);
        backdrop-filter: saturate(180%) blur(20px);
        -webkit-backdrop-filter: saturate(180%) blur(20px);
        color: rgba(255,255,255,0.92);
        text-decoration: none;
        cursor: pointer;
        box-shadow:
            0 0 0 0.5px rgba(255,255,255,0.35) inset,
            0 1px 0 rgba(255,255,255,0.25) inset,
            0 2px 8px rgba(0,0,0,0.12);
        text-shadow: 0 0.5px 1px rgba(0,0,0,0.25);
        vertical-align: middle;
    `;

    return link;
}
	function addButtonToElement(element, text, url) {
		const button = createButton(text, url);
		element.appendChild(button);
	}

	function addLinkToElement(element, text, url) {
		const button = createLink(text, url);
		element.appendChild(button);
	}


    function getInfoHashFromMagnetLink(magnetLink) {
        const urlParams = new URLSearchParams(magnetLink.substring(magnetLink.indexOf('?')));
        const xt = urlParams.get('xt');
        if (xt && xt.startsWith('urn:btih:')) {
            return xt.substring(9); // Remove 'urn:btih:'
        }
        return null;
    }

	// IMDB functions
	function addButtonsToIMDBSingleTitle() {
		const targetElement = document.querySelector(
			"section.ipc-page-background h1 > span"
		);

		if (targetElement && targetElement.hasAttribute("data-dmm-btn-added"))
			return;
		targetElement.setAttribute("data-dmm-btn-added", "true");

		const searchUrl = `${X_DMM_HOST}/${window.location.pathname
			.replaceAll("/", "")
			.substring(5)}`;
		addButtonToElement(targetElement, SEARCH_BTN_LABEL, searchUrl);
	}

	function addButtonsToIMDBList() {
		const items = Array.from(
			document.querySelectorAll(".ipc-metadata-list-summary-item")
		).filter((item) => !item.hasAttribute("data-dmm-btn-added"));

		items.forEach((item) => {
			const link = item.querySelector('a[href*="/title/"]');
			const imdbId = link?.href?.match(/tt\d+/)?.[0];
			if (!imdbId) return;

			item.setAttribute("data-dmm-btn-added", "true");

			const targetElement = item.querySelector("h3.ipc-title__text") || link;
			const searchUrl = `${X_DMM_HOST}/${imdbId}`;
			addButtonToElement(targetElement, SEARCH_BTN_LABEL, searchUrl);
		});

		changeObserver("ul.ipc-metadata-list", addButtonsToIMDBList);
	}

	function addButtonsToIMDBChart() {
		const items = Array.from(document.querySelectorAll(".cli-title")).filter(
			(item) => !item.hasAttribute("data-dmm-btn-added")
		);

		items.forEach((item) => {
			item.setAttribute("data-dmm-btn-added", "true");

			let link = item.querySelector('a[href^="/title/"]').href;
			let imdbId = link.match(/tt\d+/)?.[0];
			if (!imdbId) return;
			const searchUrl = `${X_DMM_HOST}/${imdbId}`;

			addButtonToElement(item, SEARCH_BTN_LABEL, searchUrl);
		});

		changeObserver("ul.ipc-metadata-list", addButtonsToIMDBChart);
	}

	// MDBList functions
	function addButtonsToMDBListSingleTitle() {
		const targetElement = document.querySelector("h1.movie-hero__title");
		if (!targetElement || targetElement.hasAttribute("data-dmm-btn-added"))
			return;

		const imdbId = document.querySelector('a[href*="imdb.com/title/"]')
			?.href?.match(/tt\d+/)?.[0];
		if (!imdbId) return;

		targetElement.setAttribute("data-dmm-btn-added", "true");
		const searchUrl = `${X_DMM_HOST}/${imdbId}`;
		addButtonToElement(targetElement, SEARCH_BTN_LABEL, searchUrl);
	}

	function addButtonsToMDBListSearchResults() {
		const items = Array.from(
			document.querySelectorAll("div.ui.centered.cards > div")
		).filter((item) => !item.hasAttribute("data-dmm-btn-added"));

		items.forEach((item) => {
			const targetElement = item.querySelector("div.header");
			if (!targetElement) return;

			const imdbId = item.querySelector('a[href*="imdb.com/title/"]')
				?.href?.match(/tt\d+/)?.[0];
			if (!imdbId) return;

			item.setAttribute("data-dmm-btn-added", "true");
			const searchUrl = `${X_DMM_HOST}/${imdbId}`;
			const button = createButton(SEARCH_BTN_LABEL, searchUrl);
			button.style.marginLeft = "0";
			button.style.marginTop = "4px";
			targetElement.insertAdjacentElement("afterend", button);
		});

		changeObserver("div.ui.centered.cards", addButtonsToMDBListSearchResults);
	}

	// TraktTV functions
	function addButtonsToTraktTVSingleTitle() {
		const targetElement = document.querySelector("#summary-wrapper div > h1");

		if (targetElement && targetElement.hasAttribute("data-dmm-btn-added"))
			return;
		// find imdb id in page, <a data-type="imdb">
		const imdbId = document
			.querySelector("a#external-link-imdb")
			?.href?.match(/tt\d+/)?.[0];
		if (!imdbId) return;

		targetElement.setAttribute("data-dmm-btn-added", "true");

		const searchUrl = `${X_DMM_HOST}/${imdbId}`;
		addButtonToElement(targetElement, SEARCH_BTN_LABEL, searchUrl);
	}

	// iCheckMovies functions
	function addButtonsToiCheckMoviesSingleTitle() {
		const imdbId = document
			.querySelector("a.optionIMDB")
			?.href?.match(/tt\d+/)?.[0];
		if (!imdbId) return;

		const targetElement = document.querySelector("#movie > h1");

		if (targetElement && targetElement.hasAttribute("data-dmm-btn-added"))
			return;
		targetElement.setAttribute("data-dmm-btn-added", "true");

		const searchUrl = `${X_DMM_HOST}/${imdbId}`;
		addButtonToElement(targetElement, SEARCH_BTN_LABEL, searchUrl);
	}

	function addButtonsToiCheckMoviesList() {
		const items = Array.from(
			document.querySelectorAll("ol#itemListMovies > li")
		).filter((item) => !item.hasAttribute("data-dmm-btn-added"));

		items.forEach((item) => {
			const imdbId = item
				.querySelector("a.optionIMDB")
				?.href?.match(/tt\d+/)?.[0];
			if (!imdbId) return;

			const targetElement = item.querySelector("h2 a");
			if (!targetElement) return;

			item.setAttribute("data-dmm-btn-added", "true");

			const searchUrl = `${X_DMM_HOST}/${imdbId}`;
			addButtonToElement(targetElement, SEARCH_BTN_LABEL, searchUrl);
		});
	}

	// JustWatch functions
	function addButtonsToJustWatchSingleTitle() {
		const targetElement = document.querySelector("h1");
		if (!targetElement || targetElement.hasAttribute("data-dmm-btn-added")) return;
		// Extract from Apollo cache in inline scripts
		let imdbId = null;
		document.querySelectorAll("script:not([src])").forEach((s) => {
			const match = s.textContent.match(/"imdbId":"(tt\d+)"/);
			if (match) imdbId = match[1];
		});
		if (!imdbId) return;
		targetElement.setAttribute("data-dmm-btn-added", "true");
		addButtonToElement(targetElement, SEARCH_BTN_LABEL, `${X_DMM_HOST}/${imdbId}`);
	}

	// TheTVDB functions
	function addButtonsToTheTVDBSingleTitle() {
		const targetElement = document.querySelector("h1#series_title");
		if (!targetElement || targetElement.hasAttribute("data-dmm-btn-added")) return;
		const imdbId = document.querySelector('a[href*="imdb.com/title/"]')?.href?.match(/tt\d+/)?.[0];
		if (!imdbId) return;
		targetElement.setAttribute("data-dmm-btn-added", "true");
		addButtonToElement(targetElement, SEARCH_BTN_LABEL, `${X_DMM_HOST}/${imdbId}`);
	}

	// Criticker functions
	function addButtonsToCritickerSingleTitle() {
		const targetElement = document.querySelector("h1");
		if (!targetElement || targetElement.hasAttribute("data-dmm-btn-added")) return;
		const imdbId = document.querySelector('a[href*="imdb.com/title/"]')?.href?.match(/tt\d+/)?.[0];
		if (!imdbId) return;
		targetElement.setAttribute("data-dmm-btn-added", "true");
		addButtonToElement(targetElement, SEARCH_BTN_LABEL, `${X_DMM_HOST}/${imdbId}`);
	}

	// Metacritic functions
	function addButtonsToMetacriticSingleTitle() {
		const targetElement = document.querySelector("h1");
		if (!targetElement || targetElement.hasAttribute("data-dmm-btn-added")) return;
		let imdbId = null;
		document.querySelectorAll("script:not([src])").forEach((s) => {
			if (!imdbId) {
				const match = s.textContent.match(/tt\d{5,}/);
				if (match) imdbId = match[0];
			}
		});
		if (!imdbId) return;
		targetElement.setAttribute("data-dmm-btn-added", "true");
		addButtonToElement(targetElement, SEARCH_BTN_LABEL, `${X_DMM_HOST}/${imdbId}`);
	}

	// letterboxd functions
	function addButtonsToLetterboxdSingleTitle() {
		const imdbId = document
			.querySelector("a[data-track-action='IMDb']")
			?.href?.match(/tt\d+/)?.[0];
		if (!imdbId) return;

		const targetElement = document.querySelector("h1.headline-1");

		if (targetElement && targetElement.hasAttribute("data-dmm-btn-added"))
			return;
		targetElement.setAttribute("data-dmm-btn-added", "true");

		const searchUrl = `${X_DMM_HOST}/${imdbId}`;
		addButtonToElement(targetElement, SEARCH_BTN_LABEL, searchUrl);
	}

	// observer utility function
	function changeObserver(cssSelector, addBtnFn) {
		const targetNode = document.querySelector(cssSelector);
		if (!targetNode) return;
		const config = { childList: true, subtree: true };
		let debounceTimer;
		const callback = function (mutationsList, observer) {
			if (debounceTimer) {
				clearTimeout(debounceTimer);
			}
			debounceTimer = setTimeout(() => {
				// if (!targetNode) return;
				observer.disconnect();
				addBtnFn();
				observer.observe(targetNode, config);
			}, 250);
		};
		const observer = new MutationObserver(callback);
		observer.observe(targetNode, config);
	}

	function addMagnetLinkButtonToElements(elements) {
		elements.forEach(function(link) {
			const magnetURL = link.href;
			const infoHash = getInfoHashFromMagnetLink(magnetURL);
			if (infoHash) {
				const buttonURL = `https://debridmediamanager.com/library?addMagnet=${infoHash}`;
				const button = createButton("🧲DebridMediaManger", buttonURL);
				link.parentNode.insertBefore(button, link.nextSibling);
			}
		});
	}

	// Main function

	const magnetLinks = document.querySelectorAll('a[href^="magnet:?"]');
	addMagnetLinkButtonToElements(magnetLinks);

	const hostname = window.location.hostname;

	///// IMDB /////
	if (hostname === "www.imdb.com") {
		const isIMDBSingleTitlePage = /^\/title\//.test(location.pathname);
		const isIMDBListPage =
			/^\/search\//.test(location.pathname) ||
			/^\/list\/ls/.test(location.pathname);
		const isIMDBChartPage = /^\/chart\//.test(location.pathname);

		if (isIMDBSingleTitlePage) {
			addButtonsToIMDBSingleTitle();
			changeObserver("section.ipc-page-background", addButtonsToIMDBSingleTitle);
		} else if (isIMDBListPage) {
			addButtonsToIMDBList();
		} else if (isIMDBChartPage) {
			addButtonsToIMDBChart();
		}

		///// IMDB MOBILE /////
	} else if (hostname === "m.imdb.com") {
		const isIMDBSingleTitlePage = /^\/title\//.test(location.pathname);
		const isIMDBListPage =
			/^\/search\//.test(location.pathname) ||
			/^\/list\/ls/.test(location.pathname);
		const isIMDBChartPage = /^\/chart\//.test(location.pathname);

		if (isIMDBSingleTitlePage) {
			addButtonsToIMDBSingleTitle();
			changeObserver("section.ipc-page-background", addButtonsToIMDBSingleTitle);
		} else if (isIMDBListPage) {
			addButtonsToIMDBList();
		} else if (isIMDBChartPage) {
			addButtonsToIMDBChart();
		}

		///// MDBLIST /////
	} else if (hostname === "mdblist.com") {
		const isMDBListSingleTitlePage = /^\/(movie|show)\//.test(
			location.pathname
		);

		if (isMDBListSingleTitlePage) {
			addButtonsToMDBListSingleTitle();
		} else {
			addButtonsToMDBListSearchResults();
		}

		///// TRAKT TV /////
	} else if (hostname === "trakt.tv") {
		const isTraktTVEpisodePage = /\/episodes\/\d/.test(location.pathname);
		if (isTraktTVEpisodePage) return;

		const isTraktTVSinglePage = /^\/(shows|movies)\/.+/.test(location.pathname);

		if (isTraktTVSinglePage) {
			addButtonsToTraktTVSingleTitle();
		}

		///// ICHECKMOVIES /////
	} else if (hostname === "www.icheckmovies.com") {
		const isiCheckMoviesListPage = /^\/lists\//.test(location.pathname);
		if (isiCheckMoviesListPage) {
			addButtonsToiCheckMoviesList();
		}
		const isiCheckMoviesSingleTitlePage = /^\/movies\//.test(location.pathname);
		if (isiCheckMoviesSingleTitlePage) {
			addButtonsToiCheckMoviesSingleTitle();
		}
		///// LETTERBOXD /////
	} else if (hostname === "letterboxd.com") {
		const isLetterboxdSingleTitlePage = /^\/film\//.test(location.pathname);
		if (isLetterboxdSingleTitlePage) {
			addButtonsToLetterboxdSingleTitle();
		}

		///// JUSTWATCH /////
	} else if (hostname === "www.justwatch.com") {
		if (/\/(movie|tv-show)\//.test(location.pathname)) {
			addButtonsToJustWatchSingleTitle();
			changeObserver("#app", addButtonsToJustWatchSingleTitle);
		}

		///// THETVDB /////
	} else if (hostname === "thetvdb.com") {
		if (/^\/(movies|series)\//.test(location.pathname)) {
			addButtonsToTheTVDBSingleTitle();
		}

		///// CRITICKER /////
	} else if (hostname === "www.criticker.com") {
		if (/^\/film\//.test(location.pathname)) {
			addButtonsToCritickerSingleTitle();
		}

		///// METACRITIC /////
	} else if (hostname === "www.metacritic.com") {
		if (/^\/(movie|tv)\//.test(location.pathname)) {
			addButtonsToMetacriticSingleTitle();
		}

	}
})();
