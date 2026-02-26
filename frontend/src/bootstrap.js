// Run before any other app code: guard JSON.parse so unknown code (e.g. at window.onload)
// never parses noscript/DOM text and throws.
(function () {
  const originalParse = JSON.parse;
  JSON.parse = function (text, reviver) {
    if (typeof text === "string") {
      const t = text.trim();
      if (!t) return null;
      // Reject common non-JSON UI/HTML strings (exact or prefix)
      if (
        t === "JavaScript is required to run this app." ||
        t === "You need to enable JavaScript to run this app." ||
        t === "Loading..." ||
        t.startsWith("You need ") ||
        t.startsWith("JavaScript is required") ||
        t.startsWith("Loading")
      ) return null;
      // Also reject any string that looks like "Loading..." (different quotes/whitespace)
      if (/^Loading\.{0,3}\s*$/i.test(t)) return null;
    }
    return originalParse.call(this, text, reviver);
  };
})();
