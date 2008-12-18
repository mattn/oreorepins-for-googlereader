// ==UserScript==
// @name           OreOrePins for GoogleReader
// @namespace      http://mattn.kaoriya.net/
// @description    OreOrePins for GoogleReader
// @include        http://www.google.tld/reader/*
// @include        https://www.google.tld/reader/*
// ==/UserScript==

(function(window) {

if (!FullFeed || FullFeed.addPreFilter) return;

var pin_server = GM_getValue("server");
if (!pin_server) {
  pin_server = window.prompt('set pin server');
  GM_setValue("server", pin_server);
}

function getElementsByXPath(xpath, node) {
  node = node || document;
  var nodesSnapshot = (node.ownerDocument || node).
    evaluate(xpath, node, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
  var data = [];
  for (var i = 0, l = nodesSnapshot.snapshotLength; i < l;
    data.push(nodesSnapshot.snapshotItem(i++)));
  return data.length > 0 ? data : null;
}

function getFirstElementByXPath(xpath, node) {
  node = node || document;
  var result = (node.ownerDocument || node).
    evaluate(xpath, node, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
  return result.singleNodeValue ? result.singleNodeValue : null;
}

FullFeed.addPreFilter(function() {
  var container = getFirstElementByXPath('id("current-entry")//a[contains(concat(" ", @class, " "), " entry-title-link ")]').parentNode;
  if (!container) return;
  var star = getFirstElementByXPath('id("current-entry")//div[contains(concat(" ", @class, " "), " entry-actions ")]//span[contains(concat(" ", @class, " "), " star ")]');
  if (!star) return;

  star.addEventListener('click', function() {
    var action = (star.className || '').split(/\s+/).indexOf('item-star-active') != -1 ? 'add' : 'remove';
    var link = getFirstElementByXPath('id("current-entry")//a[contains(concat(" ", @class, " "), " entry-title-link ")]');
	var body = getFirstElementByXPath('id("current-entry")//div[contains(concat(" ", @class, " "), " entry-body ")]');
    window.setTimeout(GM_xmlhttpRequest, 0, {
      method: 'POST',
      url: pin_server + '/api/pin/' + action,
      data: [
        'link=' + encodeURIComponent(link.href),
        'title=' + encodeURIComponent(link.textContent),
        'content=' + encodeURIComponent(body.innerHTML)
      ].join('&'),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent":   navigator.userAgent + " Greasemonkey (OreOrePins for GoogleReader 1.0.0)"
      },
      onerror: function(res) { },
      onload: function(res) { }
    });
  }, false);
});

})(unsafeWindow || window);
