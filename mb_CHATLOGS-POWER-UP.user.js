// ==UserScript==
// @name         mb. CHATLOGS POWER-UP
// @version      2015.11.6
// @description  MIGRATION (to chatlogs.metabrainz.org) IN PROGRESS. Toggle server messages; See red bar below last read line; Linkify forgotten links; Highlight lines containing one of keywords; previous/next date log page; misc stuff too
// @homepage     http://userscripts-mirror.org/scripts/show/127580
// @supportURL   https://github.com/jesus2099/konami-command/issues
// @namespace    https://github.com/jesus2099/konami-command
// @downloadURL  https://github.com/jesus2099/konami-command/raw/master/mb_CHATLOGS-POWER-UP.user.js
// @updateURL    https://github.com/jesus2099/konami-command/raw/master/mb_CHATLOGS-POWER-UP.user.js
// @author       PATATE12
// @licence      CC BY-NC-SA 3.0 (https://creativecommons.org/licenses/by-nc-sa/3.0/)
// @since        2012-03-05
// @icon         data:image/gif;base64,R0lGODlhEAAQAKEDAP+/3/9/vwAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh/glqZXN1czIwOTkAIfkEAQACAwAsAAAAABAAEAAAAkCcL5nHlgFiWE3AiMFkNnvBed42CCJgmlsnplhyonIEZ8ElQY8U66X+oZF2ogkIYcFpKI6b4uls3pyKqfGJzRYAACH5BAEIAAMALAgABQAFAAMAAAIFhI8ioAUAIfkEAQgAAwAsCAAGAAUAAgAAAgSEDHgFADs=
// @require      https://greasyfork.org/scripts/10888-super/code/SUPER.js?version=84017&v=2015.11.2
// @grant        none
// @include      http://chatlogs.metabrainz.org/*
// @include      http://hcm.fam.cx/mbja/chatlog.cgi*
// @run-at       document-end
// ==/UserScript==
"use strict";
var userjs = "j2userjs127580";
var cat = location.href.match(/https?:\/\/chatlogs\.metabrainz\.org\/brainzbot\/([^/]+)\/|mbja/);
if (cat) {
	cat = cat[1] ? cat[1] : "musicbrainz-ja";
	if (cat != "musicbrainz-ja") {
		document.head.appendChild(document.createElement("style")).setAttribute("type", "text/css");
		var css = document.styleSheets[document.styleSheets.length - 1];
		css.insertRule("header#Site-Header { display: none; }", 0);
		css.insertRule("header#Log-Header { padding: 0px; }", 0);
	}
}
if (cat.match(/(meta|music)brainz/) && document.title.match(/error/i) && location.pathname.match(/today|yesterday/)) {
	var pathnameSplit = location.pathname.match(/^(.+)(today|yesterday)/);
	var shift = pathnameSplit[2] == "today" ? 0 : -1;
	var sdate = new Date();
	sdate.setDate(sdate.getDate() + shift);
	var yyyy = zeroPad(sdate.getFullYear(), 4);
	var mm = zeroPad(sdate.getMonth() + 1, 2);
	var dd = zeroPad(sdate.getDate(), 2);
	location.replace(pathnameSplit[1] + yyyy + "/" + (cat.match(/-ja/) ? mm + "/" + dd : yyyy + "-" + mm + "/" + yyyy + "-" + mm + "-" + dd + ".html"));
}
var date = location.pathname.match(/\/(\d{4})[-/](\d{2})[-/](\d{2})\b/);
if (date) date = date[1] + "-" + date[2] + "-" + date[3];
var entries = document.querySelectorAll("table#log th + td, dd");
var srdd = "none";
var srnv = "ajico bowie script 百恵";/*just some starting default value example*/
linkify();
var lskeys = [];
for (var lsi = 0; lsi < localStorage.length; lsi++) {
	if (localStorage.key(lsi).match(new RegExp(userjs + "lr" + (cat ? cat : "[a-z-]+") + "\\d{4}-\\d{2}-\\d{2}", "i"))) {
		lskeys.push(localStorage.key(lsi));
	}
}
if (lskeys.length > 0) {
	document.body.appendChild(document.createElement("h2")).appendChild(createA("Last read " + (cat ? "#" + cat : "") + " chat logs", function (event) { var lulu = document.getElementById(userjs + "logs"); lulu.style.setProperty("display", lulu.style.getPropertyValue("display") == "none" ? "block" : "none"); }));
	lskeys.sort();
	var ul = document.body.appendChild(document.createElement("ul"));
	ul.setAttribute("id", userjs + "logs");
	ul.style.setProperty("display", "none");
	for (var k = 0; k < lskeys.length; k++) {
		var lrpage = lskeys[k].match(new RegExp(userjs + "lr([a-z-]+)((\\d{4})-(\\d{2})-(\\d{2}))", "i"));
		if (lrpage) {
			ul.appendChild(document.createElement("li")).appendChild(document.createElement("a")).appendChild(document.createTextNode(lrpage[1] + " " + lrpage[2])).parentNode.setAttribute("href", "/" + lrpage[1] + "/" + lrpage[3] + "/" + lrpage[3] + "-" + lrpage[4] + "/" + lrpage[2] + ".html");
		}
	}
}
if (cat) {
	document.head.appendChild(document.createElement("style")).setAttribute("type", "text/css");
	var ss = document.styleSheets[document.styleSheets.length - 1];
	ss.insertRule("div#" + userjs + "toolbar { position: fixed; bottom: 0; right: 0; background-color: #ccc; padding: 2px 0 0 4px; border: 2px solid #eee; border-width: 2px 0 0 2px; }", ss.cssRules.length);
	ss.insertRule("body { padding-bottom: .5em; }", ss.cssRules.length);
	var ctt = document.body.appendChild(createTag("div", {a: {id: userjs + "toolbar"}}));
	if (date) {
		document.title = "#" + cat + " (" + date + ")";
		if (history.replaceState) history.replaceState(history.state, document.title);
		var re_urlid = /^#(.+)$/;
		var re_server = /^\S+ has (?:joined|left) #\S+$/;
		var re_nick = /([^\s\[\]>]+)\]?$/;
		var css_brdr = "2px dashed red";
		var maxStoredLastread = 100;
		/* lastread and hashrow are <dt> in mb, <tr> in mbja */
		var tmp;
		var lastread = localStorage.getItem(userjs + "lr" + cat + date);
		if (lastread) { lastread = document.getElementById(lastread.split(" ")[0]); }
		var hashrow;
		if ((tmp = location.hash.match(re_urlid)) && (tmp = document.getElementById(tmp[1]))) { hashrow = tmp; }
		if (tmp = localStorage.getItem(userjs + "srd")) { srdd = tmp; }
		if (tmp = localStorage.getItem(userjs + "nick")) { srnv = tmp; }
		var sr = ss.insertRule("dt.server, dd.server, table#log tr:not(.msg) { display: " + srdd + "; }", ss.cssRules.length);
		var nrdt = ss.insertRule(nicksel(srnv, "dt") + " { background-color: #ff6; }", ss.cssRules.length);
		var nrdd = ss.insertRule(nicksel(srnv, "dd") + " { background-color: #ffc; }", ss.cssRules.length);
		/* jump links */
		if (hashrow) {
			separate(ctt);
			var a = ctt.appendChild(createA("#\u00a0" + hashrow.firstChild.textContent.replace(/[^\d:]/g, ""), "#" + hashrow.getAttribute("id"), hashrow.getAttribute("id")));
			var nextDD = getSibling(hashrow, "dd");
			if (hashrow.className.match(/enter|quit/) || nextDD && isServer(nextDD)) {
				ctt.appendChild(document.createTextNode(" (server)"));
				a.addEventListener("click", function(event) {
					var servel = document.getElementById(this.getAttribute("href").substr(1));
					if ((servel) && self.getComputedStyle(servel).display == "none") {
						var prevmsg = getSibling(servel, !cat.match(/-ja/) ? "dt" : "tr", !cat.match(/-ja/) ? "nick-" : "msg", true);
						if (prevmsg) {
							prevmsg.querySelector("a").style.setProperty("background-color", "#ff9");
							scrollTo(0, prevmsg.offsetTop);
							event.cancelBubble = true;
							if (event.stopPropagation) event.stopPropagation();
							event.preventDefault();
							return false;
						}
					}
				}, false);
			}
			hashrow.querySelector("a").style.setProperty("border", css_brdr);
		}
		if (lastread) {
			separate(ctt);
			ctt.appendChild(createA("#\u00a0last-read", function(event) {
				document.getElementById(this.getAttribute("title")).scrollIntoView();
			}, lastread.getAttribute("id")));
		}
		if (!cat.match(/-ja/)) {
			/* nick names highlight */ 
			if (navigator.userAgent.match(/firefox/i)) {/*(-_-;)*/
				separate(ctt);
				var a = ctt.appendChild(createA("Firefox bug 28182", "http://bugs.webkit.org/show_bug.cgi?id=28182", "reload after change nick names"));
				a.style.setProperty("background-color", "pink");
				a.setAttribute("target", "_blank");
				ctt.appendChild(document.createTextNode("\u00a0→\u00a0"));
			} else {
				separate(ctt);
			}
			ctt.appendChild(createTag("input", {a: {id: userjs + "nick", type: "text", value: srnv}, e: {keyup: function(event) { plusmoins(this.value); }}}));
			asyncPlusmoins();
		}
		/* server messages on/off */
		separate(ctt);
		ctt.appendChild(createTag("input", {a: {id: userjs + "tog", type: "button", value: (srdd == "none" ? "Show" : "Hide") + " server messages"}, e: {click: function(event) {
			var fv;
			var log = document.querySelector("dl, table#log");
			if (log && log.offsetTop < self.pageYOffset) { fv = firstVisibleMsg(); }
			var s = this.value.match(/^(Show|Hide)/);
			if (s) { s = s[1] == "Show"; }
			var d = s ? (cat.match(/-ja/) ? "table-row" : "block") : "none";
			localStorage.setItem(userjs + "srd", d);
			ss.cssRules[sr].style.setProperty("display", d);
			this.value = this.value.replace(s ? "Show" : "Hide", s ? "Hide" : "Show");
			if (fv) {
				var y = fv[0].offsetTop - fv[1];
				if (y < 0) {
					var prevmsg = getSibling(fv[0], !cat.match(/-ja/) ? "dt" : "tr", !cat.match(/-ja/) ? "nick-" : "msg", true);
					if (prevmsg) {
						y = prevmsg.offsetTop;
					} else {
						y = fv[0].offsetTop;
					}
				}
				scrollTo(0, y);
			}
		}}}));
		/* jump around! */
		var jumpto = setTimeout(function() {
			jumpAround();
			jumpto = null;
		}, 400);
		document.getElementsByTagName("head")[0].addEventListener("DOMNodeInserted", function(event) {
			if (!jumpto) jumpAround();
		}, false);
		/* last read stuff */
		if (date) {
			if (lastread) {
				(cat.match(/-ja/) ? lastread.querySelector("td:last-child") : document.querySelector("dt#" + lastread.getAttribute("id") + " ~ dd")).style.setProperty("border-bottom", css_brdr);
			}
			var ldt = lastMsg();
			if (ldt) {
				localStorage.setItem(userjs + "lr" + cat + date, ldt.getAttribute("id") + " " + new Date().getTime());
			}
			/* last read cleanup */
			var dates = [];
			for (var sto = 0; sto < localStorage.length; sto++) {
				var key = localStorage.key(sto).match(new RegExp(userjs + "lr\\d{4}-\\d{2}-\\d{2}"));
				if (key) {
					dates.push(key);
				}
			}
			if (dates.length > maxStoredLastread) {
				dates.sort(function(a,b) {
					return (parseInt(localStorage.getItem(a).split(" ")[1]) - parseInt(localStorage.getItem(b).split(" ")[1]));
				});
				for (var dat = 0; dat < dates.length - maxStoredLastread; dat++) {
					localStorage.removeItem(dates[dat]);
				}
			}
		}
	}
	/* cross linking */
	separate(ctt);
	if (!cat.match(/-ja/)) {
		var tgt = (cat.match(/^musicbrainz$/) ? "meta" : "music") + "brainz";
		var tgtA = createA("#" + tgt, location.pathname.replace(/\/(meta|music)brainz\//, "/" + tgt + "/"));
		if (cat == "musicbrainz") {
			ctt.appendChild(document.createTextNode("#musicbrainz"));
		} else {
			ctt.appendChild(tgtA);
		}
		separate(ctt);
		if (cat == "metabrainz") {
			ctt.appendChild(document.createTextNode("#metabrainz"));
		} else {
			ctt.appendChild(tgtA);
		}
		separate(ctt);
		ctt.appendChild(createA("#musicbrainz-ja", "http://hcm.fam.cx/mbja/chatlog.cgi/" + (location.pathname.match(/\d/) ? (location.pathname.match(/[\d-]+(?=\/$|\.html$)/) + "").replace(/-/g, "/") : "")));
	} else {
		var path = "";
		if (location.pathname.match(/\d/)) {
			var dateDetect = location.pathname.match(/(\d{4})\/(?:(\d{2})\/)?(\d{2})?$/);
			if (dateDetect[1]) {
				path += dateDetect[1] + "/";
				if (dateDetect[2]) {
					path += dateDetect[1] + "-" + dateDetect[2] + "/";
					if (dateDetect[3]) {
						path += dateDetect[1] + "-" + dateDetect[2] + "-" + dateDetect[3] + ".html";
					}
				}
			}
		}
		ctt.appendChild(createA("#musicbrainz", "https://chatlogs.musicbrainz.org/musicbrainz/" + path));
		separate(ctt);
		ctt.appendChild(createA("#metabrainz", "https://chatlogs.musicbrainz.org/metabrainz/" + path));
		separate(ctt);
		ctt.appendChild(document.createTextNode("#musicbrainz-ja"));
	}
	/* prev./next day */
	if (date) {
		separate(ctt);
		ctt.appendChild(createA("« " + (cat.match(/-ja/) ? "前日" : "prev."), shiftDate(-1)));
		separate(ctt);
		ctt.appendChild(createA((cat.match(/-ja/) ? "翌日" : "next") + " »", shiftDate(+1)));
	}
}
function shiftDate(shift) {
	var sdate = (new Date(date));
	sdate.setDate(sdate.getDate() + shift);
	var yyyy = zeroPad(sdate.getFullYear(), 4);
	var mm = zeroPad(sdate.getMonth() + 1, 2);
	var dd = zeroPad(sdate.getDate(), 2);
	return location.pathname.match(/[^\d]+/) + yyyy + "/" + (cat.match(/-ja/) ? mm + "/" + dd : yyyy + "-" + mm + "/" + yyyy + "-" + mm + "-" + dd + ".html");
}
function zeroPad(i, cols) {
	var str = "" + i;
	while (str.length < cols) {
		str = "0" + str;
	}
	return str;
}
var timeoutPlusmoins;
function jumpAround() {
	var highlighted = document.querySelector(nicksel(srnv, "*"));
	if (highlighted = (hashrow || lastread || highlighted)) {
		highlighted.scrollIntoView();
	}
}
function asyncPlusmoins(event) {
	if (event) {
		document.body.removeEventListener("DOMNodeInserted", asyncPlusmoins, false);
		document.body.removeEventListener("DOMAttrModified", asyncPlusmoins, false);
		clearTimeout(timeoutPlusmoins);
		timeoutPlusmoins = setTimeout(plusmoins, 400);
	} else {
		document.body.addEventListener("DOMNodeInserted", asyncPlusmoins, false);
		document.body.addEventListener("DOMAttrModified", asyncPlusmoins, false);
	}
}
function plusmoins(p) {
	if (p) {
		srnv = p;
		localStorage.setItem(userjs + "nick", srnv);
		ss.cssRules[nrdt].selectorText = nicksel(srnv, "dt");
		ss.cssRules[nrdd].selectorText = nicksel(srnv, "dd");
	}
	/* not supporting the “add/remove nick to watched keywords” feature in mbja — i think i will simply remove this feature completely */
	if (!cat.match(/-ja/)) {
		var nicks = document.getElementsByTagName("dt");
		for (var nick = 0; nick < nicks.length; nick++) {
			var who = nicks[nick].innerHTML.match(re_nick);
			if (who) {
				var gotit = srnv.match(new RegExp("(?:^|[^\\w-])"+who[1]+"(?:$|[^\\w-])"));
				var a = nicks[nick].getElementsByClassName(userjs + "plusmoins");
				if (a && a.length == 1) {
					a = a[0];
					a.replaceChild(document.createTextNode(gotit ? "-" : "+"), a.firstChild);
					a.setAttribute("title", a.getAttribute("title").replace(/^(\S+)/, gotit ? "unwatch" : "watch"));
				} else {
					a = createA(gotit ? "-" : "+", function(event) {
						var inni = document.getElementById(userjs + "nick");
						var t = this.getAttribute("title").match(/^(\S+) (\S+)$/);
						var v = inni.value;
						if (t[1] == "watch") {
							v += " " + t[2];
						} else {
							v = v.replace(t[2], "");
						}
						var ns = v.match(/([\w-]+)/g);
						ns.sort(function(a,b) {
							return (a.toLowerCase() > b.toLowerCase() ? 1 : -1);
						});
						v = "";
						for (var n = 0; n < ns.length; n++) {
							v += ns[n] + " ";
						}
						inni.value = v;
						plusmoins(inni.value);
					}, (gotit ? "unwatch" : "watch") + " " + who[1]);
					a.setAttribute("class", userjs + "plusmoins");
					a.style.setProperty("text-decoration", "none");
					a.style.setProperty("margin-right", "0");
					nicks[nick].insertBefore(a, nicks[nick].lastChild);
					nicks[nick].insertBefore(document.createTextNode(" "), nicks[nick].lastChild);
				}
				var subs = srnv.split(" ");
				for (var sub = 0; sub < subs.length; sub++) {
					var dd = getSibling(nicks[nick], "dd");
					if (subs[sub].match(/\w+/) && dd.textContent.match(new RegExp(subs[sub], "i"))) {
						dd.classList.add("nick-" + subs[sub]);
					} else {
						dd.classList.remove(subs[sub]);
					}
				}
			}
		}
	}
}
function nicksel(nicklist, tag) {
	var nicks = nicklist.match(/([\w-]+)/g);
	var sep = "";
	var sel = "";
	for (var n = 0; nicks && n < nicks.length; n++) {
		sel += sep + tag + "[class*='nick-" + nicks[n] + "']" + (tag == "dt" ? "+dd" : "");
		if (sep == "") { sep = ", "; }
	}
	return sel;
}
function firstVisibleMsg() {
	var okdt;
	for (var dd = 0; dd < entries.length; dd++) {
		if (entries[dd].offsetTop >= self.pageYOffset + self.innerHeight) {
			return [okdt, 0];
		} else if (!isServer(entries[dd])) {
			okdt = getSibling(entries[dd], cat.match(/-ja/) ? "th" : "dt", null, true);
			if (entries[dd].offsetTop >= self.pageYOffset) { return [okdt, okdt.offsetTop - self.pageYOffset]; }
		}
	}
	return null;
}
function lastMsg() {
	for (var dd = entries.length-1; dd >= 0; dd--) {
		if (!isServer(entries[dd])) { return cat.match(/-ja/) ? entries[dd].parentNode : getSibling(entries[dd], "dt", null, true); }
	}
	return null;
}
function isServer(o) {
	return cat.match(/-ja/) && o.parentNode.className.match(/enter|quit/) || (o.childNodes.length == 1 && o.firstChild.nodeType == 3 && o.firstChild.nodeValue.match(re_server));
}
function createA(text, link, title) {
	var a = document.createElement("a");
	if (link && typeof link == "string") {
		a.setAttribute("href", link);
	} else {
		if (link && typeof link == "function") {
			a.addEventListener("click", link, false);
		}
		a.style.setProperty("cursor", "pointer");
		a.style.setProperty("text-decoration", "underline");
	}
	if (title) { a.setAttribute("title", title); }
	a.appendChild(typeof text == "string" ? document.createTextNode(text) : text);
	return a;
}
function linkify() {
	/*linkify http://userscripts.org/scripts/show/1295 adapt*/
	var urlRegex = /\b(https?:\/\/[^\s\"\<\>]+)/ig;/*/\b(https?:\/\/[^\s+\"\<\>]+)/ig;*/
	/* tags we will scan looking for un-hyperlinked urls */
	var allowedParents = [
		/*"abbr", "acronym", "address", "applet", "b", "bdo", "big", "blockquote", "body", 
		"caption", "center", "cite", "code", */"dd"/*, "del", "div", "dfn", "dt", "em", 
		"fieldset", "font", "form", "h1", "h2", "h3", "h4", "h5", "h6", "i", "iframe",
		"ins", "kdb", "li", "object", "pre", "p", "q", "samp", "small", "span", "strike", 
		"s", "strong", "sub", "sup", "td", "th", "tt", "u", "var"*/
		];
	var xpath = "//text()[(parent::" + allowedParents.join(" or parent::") + ") and " +
				"contains(translate(., 'HTTP', 'http'), 'http')]";
	var candidates = document.evaluate(xpath, document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
	/*var t0 = new Date().getTime();*/
	for (var cand = null, i = 0; (cand = candidates.snapshotItem(i)); i++) {
		if (urlRegex.test(cand.nodeValue)) {
			var span = document.createElement("span");
			var source = cand.nodeValue;
			cand.parentNode.replaceChild(span, cand);
			urlRegex.lastIndex = 0;
			for (var match = null, lastLastIndex = 0; (match = urlRegex.exec(source)); ) {
				span.appendChild(document.createTextNode(source.substring(lastLastIndex, match.index)));
				var a = document.createElement("a");
				a.setAttribute("href", match[0]);
				a.appendChild(document.createTextNode(match[0]));
				span.appendChild(a);
				lastLastIndex = urlRegex.lastIndex;
			}
			span.appendChild(document.createTextNode(source.substring(lastLastIndex)));
			span.normalize();
		}
	}
	/*alert(((new Date().getTime()) - t0) / 1000);*/
}
function separate(cont, sep) {
	if (cont.firstChild) ctt.appendChild(document.createTextNode(sep ? sep : " | "));
}
