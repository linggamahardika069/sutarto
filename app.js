(function () {
  "use strict";

  var grid = document.getElementById("grid");
  var chipsEl = document.getElementById("chips");
  var searchEl = document.getElementById("search");
  var emptyEl = document.getElementById("empty");
  var projects = [];
  var activeTag = "Semua";

  document.getElementById("year").textContent = new Date().getFullYear();

  // Daftar negara dipakai sebagai filter. Tag ke-2 di projects.json = negara.
  function market(p) { return (p.tags && p.tags[1]) || ""; }

  function host(url) {
    try { return new URL(url).host; } catch (e) { return url; }
  }

  function shotSources(p) {
    if (p.screenshot) return [p.screenshot];
    var u = encodeURIComponent(p.url);
    return [
      "https://s0.wp.com/mshots/v1/" + u + "?w=1200&h=750",
      "https://image.thum.io/get/width/1200/crop/750/" + p.url
    ];
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function card(p) {
    var c = el("article", "card");

    var shot = el("div", "shot");
    var fb = el("div", "fallback", (p.name || "?").charAt(0).toUpperCase());
    shot.appendChild(fb);
    var srcs = shotSources(p), i = 0;
    var img = new Image();
    img.alt = "Tangkapan layar " + p.name;
    img.loading = "lazy";
    img.decoding = "async";
    img.onload = function () { if (img.naturalWidth > 40) fb.style.display = "none"; };
    img.onerror = function () {
      i += 1;
      if (i < srcs.length) img.src = srcs[i]; else img.remove();
    };
    img.src = srcs[0];
    shot.appendChild(img);
    c.appendChild(shot);

    var copy = el("button", "copy", "Salin link");
    copy.type = "button";
    copy.addEventListener("click", function (e) {
      e.preventDefault(); e.stopPropagation();
      var done = function () {
        copy.textContent = "Tersalin";
        setTimeout(function () { copy.textContent = "Salin link"; }, 1500);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(p.url).then(done, done);
      } else { done(); }
    });
    c.appendChild(copy);

    var body = el("div", "body");
    var h = el("h3");
    var a = el("a", null, p.name);
    a.href = p.url; a.target = "_blank"; a.rel = "noopener";
    h.appendChild(a);
    body.appendChild(h);
    body.appendChild(el("p", "host", host(p.url)));
    body.appendChild(el("p", "desc", p.desc || ""));
    var tags = el("div", "tags");
    (p.tags || []).forEach(function (t) { tags.appendChild(el("span", "tag", t)); });
    body.appendChild(tags);
    c.appendChild(body);
    return c;
  }

  function matches(p, q) {
    if (activeTag !== "Semua" && market(p) !== activeTag) return false;
    if (!q) return true;
    var hay = [p.name, p.url, p.desc].concat(p.tags || []).join(" ").toLowerCase();
    return hay.indexOf(q) !== -1;
  }

  function render() {
    var q = searchEl.value.trim().toLowerCase();
    grid.textContent = "";
    var shown = projects.filter(function (p) { return matches(p, q); });
    shown.forEach(function (p) { grid.appendChild(card(p)); });
    emptyEl.hidden = shown.length > 0;
  }

  function buildChips() {
    var markets = ["Semua"];
    projects.forEach(function (p) {
      var m = market(p);
      if (m && markets.indexOf(m) === -1) markets.push(m);
    });
    chipsEl.textContent = "";
    markets.forEach(function (m) {
      var b = el("button", "chip", m);
      b.type = "button";
      b.setAttribute("aria-pressed", m === activeTag ? "true" : "false");
      b.addEventListener("click", function () {
        activeTag = m;
        Array.prototype.forEach.call(chipsEl.children, function (x) {
          x.setAttribute("aria-pressed", x === b ? "true" : "false");
        });
        render();
      });
      chipsEl.appendChild(b);
    });
    document.getElementById("stat-markets").textContent = markets.length - 1;
  }

  searchEl.addEventListener("input", render);

  fetch("projects.json", { cache: "no-cache" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (data) {
      // Terbaru di atas
      projects = data.slice().sort(function (a, b) {
        return String(b.added || "").localeCompare(String(a.added || ""));
      });
      document.getElementById("stat-count").textContent = projects.length;
      buildChips();
      render();
    })
    .catch(function () {
      emptyEl.hidden = false;
      emptyEl.textContent = "projects.json gagal dimuat. Kalau dibuka langsung dari file, jalankan: python3 -m http.server lalu buka localhost:8000";
    });
})();
