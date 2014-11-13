// ==UserScript==
// @name         laposte.net. BOUGEZ AVEC LA POSTE
// @version      2014.3.19.1555
// @description  laposte.net webmail power ups: Déconnexion d’un seul clic, moins de pubs
// @homepage     http://userscripts-mirror.org/scripts/show/422068
// @supportURL   https://github.com/jesus2099/konami-command/issues
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://raw.githubusercontent.com/jesus2099/konami-command/master/laposte.net_BOUGEZ-AVEC-LA-POSTE.user.js
// @updateURL    https://raw.githubusercontent.com/jesus2099/konami-command/master/laposte.net_BOUGEZ-AVEC-LA-POSTE.user.js
// @author       PATATE12 aka. jesus2099/shamo
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2014-03-21
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @grant        none
// @include      http://www.laposte.net/*
// @include      http://webmail.laposte.net/*
// @exclude      *advertisement*
// @exclude      *leftpub*
// @run-at       document-end
// ==/UserScript==
(function(){"use strict";
	document.head.appendChild(document.createElement("style")).setAttribute("type", "text/css");
	var j2css = document.styleSheets[document.styleSheets.length-1];
	j2css.insertRule([
		"div.home div#aside div[class*='advertis']",
		"div.home div#aside div[class*='Shopping']",
		"iframe#adtopiframe",
		"iframe.adtopiframe",
		"td#bottomPub",
		"td.bottomPub",
	].join(",")+"{display: none;}", j2css.cssRules.length);
	var maxinterval = 20;
	var interval = setInterval(function(){
		var quitter = document.querySelector("a#quitLink[onclick]");
		if (quitter) {
			quitter.removeAttribute("onclick");
			quitter.setAttribute("href", "https://compte.laposte.net/logout.do");
			quitter.style.setProperty("color", "#fc6");
		}
		if (quitter||maxinterval--<0) clearInterval(interval);
	}, 400);
})();