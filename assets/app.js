(function () {
  'use strict';
  var D = window.SD, I = D.icons, V = "4";
  var MOB = window.matchMedia('(max-width:640px)');
  var COURT = { 'Qualité visuelle': ['Qualité', 'visuelle'], 'Cohérence de marque': ['Cohérence', 'de marque'], 'Contact et conversion': ['Contact', 'et conversion'], 'Présence LinkedIn': ['Présence', 'LinkedIn'], 'Preuves et réalisations': ['Preuves et', 'réalisations'] };
  function radLab() { return D.scores.map(function (s) { return MOB.matches ? (COURT[s[0]] || s[0]) : s[0]; }); }
  Chart.defaults.responsive = true;
  Chart.defaults.maintainAspectRatio = false;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var fmt = function (n) { return n.toLocaleString('fr-FR').replace(/\u202f/g, '\u00a0'); };
  var BL = '#004AAD', CI = '#38B6FF', LI = '#0A66C2', FB = '#1877F2';
  var NET = { Instagram: { c: BL, i: 'instagram' }, LinkedIn: { c: LI, i: 'linkedin' }, Facebook: { c: FB, i: 'facebook' } };
  var BADGE = { 'actif': 'b-actif', 'absent': 'b-absent', 'à convertir': 'b-conv', 'à fusionner': 'b-fus', 'à relancer': 'b-rel' };
  Chart.defaults.font.family = 'Mulish, system-ui, sans-serif';
  Chart.defaults.color = '#667085';

  /* ---------- Visionneuse ---------- */
  var LB = [], lbi = 0, lb = $('#lb');
  function lbShow() { var it = LB[lbi]; $('#lb-img').src = it.src; $('#lb-img').alt = it.cap; $('#lb-cap').textContent = it.cap + '  (' + (lbi + 1) + ' / ' + LB.length + ')'; }
  function lbOpen(list, i) { LB = list; lbi = i; lbShow(); lb.hidden = false; document.body.style.overflow = 'hidden'; $('.lb-x', lb).focus(); }
  function lbClose() { lb.hidden = true; document.body.style.overflow = ''; }
  $('.lb-x', lb).onclick = lbClose;
  $('.lb-p', lb).onclick = function () { lbi = (lbi + LB.length - 1) % LB.length; lbShow(); };
  $('.lb-n', lb).onclick = function () { lbi = (lbi + 1) % LB.length; lbShow(); };
  lb.addEventListener('click', function (e) { if (e.target === lb) lbClose(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') lbClose(); else if (e.key === 'ArrowLeft') $('.lb-p', lb).click(); else if (e.key === 'ArrowRight') $('.lb-n', lb).click();
  });

  function copyBtn(txt) {
    var b = document.createElement('button'); b.className = 'cp'; b.type = 'button';
    b.innerHTML = I.copy + '<span>Copier le texte</span>';
    b.onclick = function () {
      var done = function () { b.classList.add('done'); b.querySelector('span').textContent = 'Copié'; setTimeout(function () { b.classList.remove('done'); b.querySelector('span').textContent = 'Copier le texte'; }, 1800); };
      if (navigator.clipboard) navigator.clipboard.writeText(txt).then(done, done); else { var t = document.createElement('textarea'); t.value = txt; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); } catch (e) {} t.remove(); done(); }
    };
    return b;
  }
  function seg(id, cb) {
    var el = $(id); if (!el) return;
    el.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      $$('button', el).forEach(function (x) { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); });
      cb(b.dataset.k);
    });
    $$('button', el).forEach(function (x) { x.setAttribute('aria-pressed', x.classList.contains('on')); });
  }

  /* ---------- 1. Audit ---------- */
  var cAb = null;
  function renderComptes(net) {
    var L = D.comptes.filter(function (c) { return net === 'tous' || c[1] === net; });
    $('#comptes').innerHTML = L.map(function (c) {
      var n = NET[c[1]];
      return '<article class="card acc"><div class="acc-h"><span class="acc-ic" style="background:' + n.c + '">' + I[n.i] + '</span><div><div class="acc-n">' + esc(c[0]) + '</div><div class="acc-r">' + c[1] + '</div></div></div>' +
        '<div class="acc-v">' + (c[3] === 'absent' ? '0' : fmt(c[2])) + '<small>' + (c[3] === 'absent' ? 'pas de page' : 'abonnés') + '</small></div>' +
        '<span class="badge ' + BADGE[c[3]] + '">' + esc(c[3]) + '</span><p>' + esc(c[4]) + '</p></article>';
    }).join('');
    var P = L.filter(function (c) { return c[3] !== 'absent'; });
    var tot = P.reduce(function (a, c) { return a + c[2]; }, 0);
    $('#ab-tot').textContent = fmt(tot) + ' abonnés au total';
    var lab = P.map(function (c) { return c[0].replace(/ \(.*\)/, ''); });
    if (cAb) { cAb.data.labels = lab; cAb.data.datasets[0].data = P.map(function (c) { return c[2]; }); cAb.data.datasets[0].backgroundColor = P.map(function (c) { return NET[c[1]].c; }); cAb.update(); return; }
    cAb = new Chart($('#c-abonnes'), { type: 'bar', data: { labels: lab, datasets: [{ data: P.map(function (c) { return c[2]; }), backgroundColor: P.map(function (c) { return NET[c[1]].c; }), borderRadius: 8, maxBarThickness: 34 }] },
      options: { indexAxis: 'y', maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (x) { return fmt(x.raw) + ' abonnés'; } } } }, scales: { x: { grid: { color: '#EEF1F5' }, beginAtZero: true }, y: { grid: { display: false }, ticks: { font: { weight: 700, size: MOB.matches ? 11 : 12 } } } } } });
  }
  seg('#f-reseau', renderComptes);
  renderComptes('tous');

  var cRad = new Chart($('#c-radar'), { type: 'radar', data: { labels: radLab(), datasets: [{ data: D.scores.map(function (s) { return s[1]; }), backgroundColor: 'rgba(56,182,255,.25)', borderColor: BL, pointBackgroundColor: BL, borderWidth: 2 }] },
    options: { maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { r: { min: 0, max: 10, ticks: { stepSize: 2, backdropColor: 'transparent' }, pointLabels: { font: function () { return { size: MOB.matches ? 10.5 : 12, weight: 700 }; }, color: '#3A3A3B', padding: MOB.matches ? 4 : 8 }, grid: { color: '#E3E8EF' }, angleLines: { color: '#E3E8EF' } } } } });
  function majMob() { cRad.data.labels = radLab(); cRad.options.scales.r.pointLabels.padding = MOB.matches ? 4 : 8; cRad.update(); if (cAb) { cAb.options.scales.y.ticks.font.size = MOB.matches ? 11 : 12; cAb.update(); } }
  if (MOB.addEventListener) MOB.addEventListener('change', majMob); else if (MOB.addListener) MOB.addListener(majMob);

  new Chart($('#c-mois'), { type: 'bar', data: { labels: D.igmois.map(function (m) { return m[0]; }), datasets: [{ data: D.igmois.map(function (m) { return m[1]; }), backgroundColor: D.igmois.map(function (m) { return m[1] ? BL : '#E3E8EF'; }), borderRadius: 6, minBarLength: 4 }] },
    options: { maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (x) { return x.raw + ' publication' + (x.raw > 1 ? 's' : ''); } } } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: '#EEF1F5' } }, x: { grid: { display: false }, ticks: { autoSkip: false, maxRotation: 0, font: { size: MOB.matches ? 10 : 12 } } } } } });

  var igL = D.igposts.map(function (p) { return { src: 'img/' + p[5] + '?v=' + V, cap: p[0] + ', ' + p[1] + ', ' + p[2] }; });
  $('#igposts').innerHTML = D.igposts.map(function (p, k) {
    return '<button class="igp" type="button" data-k="' + k + '" aria-label="Agrandir : ' + esc(p[2]) + '"><img src="img/' + p[5] + '?v=' + V + '" alt=""><span class="m"><b>' + p[0] + '</b>' + (p[3] === null ? 'j\'aime masqués' : p[3] + ' j\'aime') + ', ' + p[4] + ' comm.</span></button>';
  }).join('');
  $$('#igposts .igp').forEach(function (b) { b.onclick = function () { lbOpen(igL, +b.dataset.k); }; });

  /* ---------- 2. Campagne ---------- */
  var DA = 'A', TH = 'tous';
  var themes = ['tous'].concat(Object.keys(D.themes));
  $('#f-theme-c').innerHTML = themes.map(function (t, k) { return '<button class="chip' + (k ? '' : ' on') + '" data-k="' + t + '">' + (k ? '<i style="display:inline-block;width:9px;height:9px;border-radius:50%;background:' + D.themes[t] + '"></i> ' + t : 'Tous les thèmes') + '</button>'; }).join('');
  function renderPosts() {
    var L = D.posts.filter(function (p) { return TH === 'tous' || p[3] === TH; });
    var list = L.map(function (p) { return { src: 'img/SODEBAT_' + DA + '_' + p[1] + '.jpg?v=' + V, cap: 'Post ' + p[0] + ', ' + p[2] }; });
    var g = $('#posts'); g.innerHTML = '';
    L.forEach(function (p, k) {
      var a = document.createElement('article'); a.className = 'card post';
      a.innerHTML = '<button class="th" type="button" aria-label="Agrandir le post ' + p[0] + '"><img src="' + list[k].src + '" alt="Post ' + p[0] + ' : ' + esc(p[2]) + '"><span class="n">' + p[0] + '</span></button>' +
        '<div class="bd"><span class="th-tag"><i style="background:' + D.themes[p[3]] + '"></i>' + p[3] + '</span><div class="tt">' + esc(p[2]) + '</div><div class="lg">' + esc(p[4]) + '</div></div>';
      $('.th', a).onclick = function () { lbOpen(list, k); };
      $('.bd', a).appendChild(copyBtn(p[4]));
      g.appendChild(a);
    });
    $('#phone').src = 'img/SODEBAT_' + DA + '_grille-instagram.jpg?v=' + V;
  }
  seg('#f-da', function (k) { DA = k; renderPosts(); renderCal(); });
  seg('#f-theme-c', function (k) { TH = k; renderPosts(); });
  $('.phone-wrap').addEventListener('click', function () { lbOpen([{ src: $('#phone').src, cap: 'Grille Instagram proposée, direction ' + (DA === 'A' ? 'sobre' : 'colorée') }], 0); });
  renderPosts();

  /* ---------- 3. Calendrier ---------- */
  var MO = '2026-12', CA = 'tous', cTh = null, cSe = null;
  var MN = { '2026-12': 'Décembre 2026', '2027-01': 'Janvier 2027' };
  var JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  function vis(e) { if (!e[4]) return null; return 'img/SODEBAT_' + (e[4].charAt(0) === 'L' ? '' : DA + '_') + e[4] + '.jpg?v=' + V; }
  function calItems() { return D.cal.filter(function (e) { return (MO === 'tous' || e[0].slice(0, 7) === MO) && (CA === 'tous' || e[2] === CA); }); }
  function dfr(iso) { var p = iso.split('-'); return p[2] + '/' + p[1]; }
  function renderCal() {
    var L = calItems();
    var months = MO === 'tous' ? ['2026-12', '2027-01'] : [MO];
    var calList = L.map(function (e) { return { src: vis(e), cap: dfr(e[0]) + ', ' + e[2] + ', ' + e[5] }; });
    var idx = {}; L.forEach(function (e, k) { (idx[e[0]] = idx[e[0]] || []).push(k); });
    var html = months.map(function (m) {
      var y = +m.slice(0, 4), mo = +m.slice(5) - 1, first = new Date(y, mo, 1), nd = new Date(y, mo + 1, 0).getDate(), off = (first.getDay() + 6) % 7;
      var cells = JOURS.map(function (j) { return '<div class="cd">' + j + '</div>'; }).join('');
      for (var i = 0; i < off; i++) cells += '<div class="cc off"></div>';
      for (var d = 1; d <= nd; d++) {
        var iso = m + '-' + (d < 10 ? '0' : '') + d;
        cells += '<div class="cc"><span class="dn">' + d + '</span>' + (idx[iso] || []).map(function (k) {
          var e = L[k], cls = e[2] === 'LinkedIn' ? 'li' : (e[3] === 'Post' ? 'ig' : 'st');
          return '<button class="ev ' + cls + '" type="button" data-k="' + k + '" title="' + esc(e[2] + ', ' + e[3] + ' : ' + e[5]) + '">' + I[NET[e[2]].i] + '<span>' + esc(e[3] === 'Post' ? e[5] : e[3] + ' : ' + e[5]) + '</span></button>';
        }).join('') + '</div>';
      }
      return '<div class="month"><div class="mh">' + MN[m] + '</div><div class="cg">' + cells + '</div></div>';
    }).join('');
    $('#cal').innerHTML = L.length ? html : '<p class="empty">Aucune publication pour ce filtre.</p>';
    $$('#cal .ev').forEach(function (b) { b.onclick = function () { var k = +b.dataset.k; if (calList[k].src) lbOpen(calList.filter(function (x) { return x.src; }), calList.slice(0, k).filter(function (x) { return x.src; }).length); else document.getElementById('ci-' + k).scrollIntoView({ behavior: 'smooth', block: 'center' }); }; });

    var nIg = L.filter(function (e) { return e[2] === 'Instagram'; }).length, nLi = L.length - nIg, nSt = L.filter(function (e) { return e[3] !== 'Post'; }).length;
    $('#cal-kpis').innerHTML = [[L.length, 'publications'], [nIg, 'sur Instagram'], [nLi, 'sur LinkedIn'], [nSt, 'stories et vidéo']].map(function (x) { return '<div class="ck"><b>' + x[0] + '</b><span>' + x[1] + '</span></div>'; }).join('');

    $('#cal-list').innerHTML = L.map(function (e, k) {
      var s = vis(e);
      return '<article class="card ci" id="ci-' + k + '"><div class="vg">' + (s ? '<img src="' + s + '" alt="">' : I[e[3] === 'Reel' ? 'image' : 'message-square']) + '</div><div><div class="dt">' + e[1] + ' ' + dfr(e[0]) + '</div><div class="t">' + esc(e[5]) + '</div><div class="meta"><span>' + e[2] + '</span><span>' + e[3] + '</span><span style="background:' + D.themes[e[6]] + ';color:#fff">' + e[6] + '</span></div></div></article>';
    }).join('');

    var tk = Object.keys(D.themes), tv = tk.map(function (t) { return L.filter(function (e) { return e[6] === t; }).length; });
    if (cTh) { cTh.data.datasets[0].data = tv; cTh.update(); }
    else cTh = new Chart($('#c-themes'), { type: 'doughnut', data: { labels: tk, datasets: [{ data: tv, backgroundColor: tk.map(function (t) { return D.themes[t]; }), borderWidth: 2, borderColor: '#fff' }] }, options: { maintainAspectRatio: false, cutout: '62%', plugins: { legend: { position: 'right', labels: { boxWidth: 12, font: { weight: 700 } } } } } });

    var wk = {}; L.forEach(function (e) { var d = new Date(e[0] + 'T12:00:00'), m = new Date(d); m.setDate(d.getDate() - (d.getDay() + 6) % 7); var key = m.toISOString().slice(0, 10); wk[key] = wk[key] || { ig: 0, li: 0 }; wk[key][e[2] === 'LinkedIn' ? 'li' : 'ig']++; });
    var ks = Object.keys(wk).sort(), lab = ks.map(function (k) { return 'sem. du ' + dfr(k); });
    var dsI = ks.map(function (k) { return wk[k].ig; }), dsL = ks.map(function (k) { return wk[k].li; });
    if (cSe) { cSe.data.labels = lab; cSe.data.datasets[0].data = dsI; cSe.data.datasets[1].data = dsL; cSe.update(); }
    else cSe = new Chart($('#c-sem'), { type: 'bar', data: { labels: lab, datasets: [{ label: 'Instagram', data: dsI, backgroundColor: BL, borderRadius: 5 }, { label: 'LinkedIn', data: dsL, backgroundColor: CI, borderRadius: 5 }] }, options: { maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12 } } }, scales: { x: { stacked: true, grid: { display: false }, ticks: { font: { size: 10 } } }, y: { stacked: true, beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: '#EEF1F5' } } } } });
  }
  seg('#f-mois', function (k) { MO = k; renderCal(); });
  seg('#f-canal', function (k) { CA = k; renderCal(); });
  renderCal();

  /* ---------- 4. LinkedIn ---------- */
  var liList = D.linkedin.map(function (l) { return { src: 'img/SODEBAT_' + l[0] + '.jpg?v=' + V, cap: l[2] }; });
  var g = $('#li');
  D.linkedin.forEach(function (l, k) {
    var a = document.createElement('article'); a.className = 'card lic';
    a.innerHTML = '<button class="th" type="button" aria-label="Agrandir le visuel"><img src="' + liList[k].src + '" alt="' + esc(l[2]) + '"></button><div class="bd"><div class="aud">' + esc(l[1]) + '</div><div class="tt" style="font-weight:800">' + esc(l[2]) + '</div><pre>' + esc(l[3]) + '</pre></div>';
    $('.th', a).onclick = function () { lbOpen(liList, k); };
    $('.bd', a).appendChild(copyBtn(l[3]));
    g.appendChild(a);
  });
})();
