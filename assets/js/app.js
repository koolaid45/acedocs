// ACE Wiki — App Logic

// ── NAVIGATION ──
function navigate(pageId, sidebarId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sidebar-section a, #topnav nav a').forEach(a => a.classList.remove('active'));

  const page = document.getElementById(pageId);
  if (page) page.classList.add('active');

  document.querySelectorAll(`[data-nav="${pageId}"]`).forEach(a => a.classList.add('active'));
  document.getElementById('search-results').classList.remove('open');

  // Auto-scroll top
  document.getElementById('content').scrollTop = 0;
}

// ── HERO CARDS ──
document.querySelectorAll('.hero-card').forEach(card => {
  card.addEventListener('click', () => navigate(card.dataset.target));
});

// ── TABLE SORT ──
function makeSortable(tableId) {
  const table = document.getElementById(tableId);
  if (!table) return;
  const headers = table.querySelectorAll('thead th');
  let sortCol = -1, sortDir = 1;

  headers.forEach((th, i) => {
    th.addEventListener('click', () => {
      if (sortCol === i) sortDir = -sortDir;
      else { sortCol = i; sortDir = 1; }
      headers.forEach(h => h.classList.remove('sorted-asc','sorted-desc'));
      th.classList.add(sortDir === 1 ? 'sorted-asc' : 'sorted-desc');

      const tbody = table.querySelector('tbody');
      const rows = Array.from(tbody.querySelectorAll('tr'));
      rows.sort((a, b) => {
        const av = a.cells[i]?.dataset.val ?? a.cells[i]?.textContent ?? '';
        const bv = b.cells[i]?.dataset.val ?? b.cells[i]?.textContent ?? '';
        const an = parseFloat(av), bn = parseFloat(bv);
        if (!isNaN(an) && !isNaN(bn)) return (an - bn) * sortDir;
        return av.localeCompare(bv) * sortDir;
      });
      rows.forEach(r => tbody.appendChild(r));
    });
  });
}

// ── GUN TABLE ──
function buildGunTable() {
  const clsTag = {
    C:'tag-cannon', SC:'tag-cannon', SBC:'tag-cannon', AL:'tag-cannon',
    AC:'tag-auto', RAC:'tag-auto', HMG:'tag-auto', MG:'tag-mg',
    HW:'tag-howit', MO:'tag-howit', ATR:'tag-mg', SA:'tag-cannon',
    GL:'tag-mortar', SL:'tag-mortar', FGL:'tag-mortar'
  };

  const tbody = document.querySelector('#gun-table tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  ACE.guns.forEach(g => {
    const tr = document.createElement('tr');
    const tag = clsTag[g.cls] || 'tag-cannon';
    const clsInfo = ACE.gunClasses[g.cls];
    const clsName = clsInfo ? clsInfo.name : g.cls;
    tr.innerHTML = `
      <td>${g.name}</td>
      <td><span class="tag ${tag}">${g.cls}</span><span style="color:var(--muted);font-size:11px;margin-left:6px">${clsName}</span></td>
      <td data-val="${g.cal}">${g.cal} mm</td>
      <td data-val="${g.wt}">${g.wt.toLocaleString()} kg</td>
      <td data-val="${g.rof ?? 0}">${g.rof != null ? g.rof + ' rpm' : '<span class="text-muted">—</span>'}</td>
      <td data-val="${g.maxlen}">${g.maxlen} cm</td>
      <td data-val="${g.propwt}">${g.propwt} kg</td>
      <td data-val="${g.yr}">${g.yr === 1000 ? '—' : g.yr}</td>
    `;
    tr.dataset.cls = g.cls;
    tr.dataset.name = g.name.toLowerCase();
    tbody.appendChild(tr);
  });

  makeSortable('gun-table');

  // Filters
  const filterName = document.getElementById('gun-filter-name');
  const filterCls  = document.getElementById('gun-filter-class');

  function applyGunFilters() {
    const name = filterName.value.toLowerCase();
    const cls  = filterCls.value;
    document.querySelectorAll('#gun-table tbody tr').forEach(tr => {
      const show = (!name || tr.dataset.name.includes(name)) &&
                   (!cls  || tr.dataset.cls === cls);
      tr.style.display = show ? '' : 'none';
    });
  }
  filterName?.addEventListener('input', applyGunFilters);
  filterCls?.addEventListener('change', applyGunFilters);
}

// ── ENGINE TABLE ──
function buildEngineTable() {
  const tbody = document.querySelector('#engine-table tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const fuelTag = {Petrol:'tag-petrol',Diesel:'tag-diesel',Electric:'tag-electric',Multifuel:'tag-multi',Turbine:'tag-turbine'};

  ACE.engines.forEach(e => {
    const power = e.torque && e.limitRPM ? Math.round(e.torque * e.limitRPM / 9549) : null;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${e.name}</td>
      <td><span class="tag ${fuelTag[e.fuel] || 'tag-petrol'}">${e.fuel}</span></td>
      <td data-val="${e.wt}">${e.wt.toLocaleString()} kg</td>
      <td data-val="${e.torque}">${e.torque.toLocaleString()} N·m</td>
      <td data-val="${power ?? 0}">${power ? power.toLocaleString() + ' kW' : '—'}</td>
      <td data-val="${e.idleRPM ?? 0}">${e.idleRPM != null ? e.idleRPM.toLocaleString() : '—'}</td>
      <td data-val="${e.limitRPM ?? 0}">${e.limitRPM != null ? e.limitRPM.toLocaleString() : '—'}</td>
      <td data-val="${e.pts ?? 0}">${e.pts != null ? e.pts.toLocaleString() : '—'}</td>
    `;
    tr.dataset.fuel = e.fuel;
    tr.dataset.cat  = e.cat;
    tr.dataset.name = e.name.toLowerCase();
    tbody.appendChild(tr);
  });

  makeSortable('engine-table');

  const filterName = document.getElementById('eng-filter-name');
  const filterFuel = document.getElementById('eng-filter-fuel');

  function applyEngFilters() {
    const name = filterName?.value.toLowerCase() ?? '';
    const fuel = filterFuel?.value ?? '';
    document.querySelectorAll('#engine-table tbody tr').forEach(tr => {
      const show = (!name || tr.dataset.name.includes(name)) &&
                   (!fuel || tr.dataset.fuel === fuel);
      tr.style.display = show ? '' : 'none';
    });
  }
  filterName?.addEventListener('input', applyEngFilters);
  filterFuel?.addEventListener('change', applyEngFilters);
}

// ── ROUND CARDS ──
function buildRoundCards() {
  const grid = document.getElementById('round-grid');
  if (!grid) return;
  grid.innerHTML = '';
  ACE.roundTypes.forEach(r => {
    const penColor = {High:'#c85',Very:' color:#e77',Extreme:'#e66',Medium:'#8bc',Low:'#7a8',None:'#555'}[r.pen.split(' ')[0]] || '#888';
    const paramsHtml = Object.entries(r.params).map(([k,v]) =>
      `<div class="meta-row"><span class="mk">${k}</span><span class="mv">${v}</span></div>`
    ).join('');
    const card = document.createElement('div');
    card.className = 'round-card';
    card.innerHTML = `
      <div class="round-tag">${r.id}</div>
      <h3>${r.name}</h3>
      <p>${r.desc}</p>
      <div class="round-meta">
        <div class="meta-row"><span class="mk">Penetration Type</span><span class="mv" style="color:${penColor}">${r.pen}</span></div>
        <div class="meta-row"><span class="mk">Has Explosive Filler</span><span class="mv">${r.he ? 'Yes' : 'No'}</span></div>
        ${paramsHtml}
        ${r.blacklist ? `<div class="meta-row"><span class="mk">Incompatible With</span><span class="mv" style="color:var(--muted);font-size:10px">${r.blacklist.split(' ').join(', ')}</span></div>` : ''}
      </div>
    `;
    grid.appendChild(card);
  });
}

// ── ARMOR CARDS ──
function buildArmorCards() {
  const grid = document.getElementById('armor-grid');
  if (!grid) return;
  grid.innerHTML = '';
  ACE.armors.forEach(a => {
    const card = document.createElement('div');
    card.className = 'armor-card';
    const rows = [
      ['Mass Modifier', a.massMod + '×'],
      ['KE Effectiveness', a.effectiveness],
      ['HEAT Effectiveness', a.HEATeffectiveness ?? '—'],
      ['Resiliance', a.resiliance],
      ['Spall Resistance', a.spallresist ?? '—'],
      ['Year Introduced', a.year],
    ];
    card.innerHTML = `
      <div class="armor-id">${a.sname} · ${a.id}</div>
      <h3>${a.name}</h3>
      <p style="font-size:12px;color:var(--muted);margin:8px 0 10px">${a.desc}</p>
      ${rows.map(([k,v]) => `<div class="armor-stat-row"><span class="k">${k}</span><span class="v">${v}</span></div>`).join('')}
    `;
    grid.appendChild(card);
  });
}

// ── MISSILE TABLE ──
function buildMissileTable() {
  const tbody = document.querySelector('#missile-table tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  ACE.missiles.forEach(m => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${m.name}<div style="font-size:11px;color:var(--muted);margin-top:2px">${m.desc.slice(0,80)}…</div></td>
      <td><span class="tag tag-missile">${m.cls}</span></td>
      <td>${m.guidance.join(', ')}</td>
      <td data-val="${m.speed ?? 0}">${m.speed != null ? m.speed + ' m/s' : '—'}</td>
      <td data-val="${m.weight}">${m.weight} kg</td>
      <td data-val="${m.cal}">${m.cal} cm</td>
      <td data-val="${m.maxpen ?? 0}">${m.maxpen != null ? m.maxpen + ' mm' : '—'}</td>
      <td data-val="${m.thrust}">${m.thrust > 0 ? m.thrust + ' m/s²' : '—'}</td>
      <td data-val="${m.dragcoef}">${m.dragcoef}</td>
    `;
    tbody.appendChild(tr);
  });
  makeSortable('missile-table');
}

// ── BALLISTICS CALCULATOR ──
function setupBallisticsCalc() {
  const form = document.getElementById('ballistics-form');
  if (!form) return;

  function calc() {
    const propMass = parseFloat(document.getElementById('bc-prop').value) || 0;
    const projMass = parseFloat(document.getElementById('bc-proj').value) || 0;
    const dragCoef = parseFloat(document.getElementById('bc-drag').value) || 0;
    const range    = parseFloat(document.getElementById('bc-range').value) || 0;

    if (!propMass || !projMass) return;

    // Muzzle velocity (ACE formula)
    const PBase = 4e6, PScale = 0.6, MVScale = 0.5;
    const PEnergy = PBase * (Math.pow(1 + propMass, PScale) - 1);
    const muzzleVel = Math.pow(PEnergy * 2000 / projMass, MVScale);

    // Velocity at range (Pejsa model approximation used by ACE)
    const VelScale = 0.0254, DragDiv = 8000;
    const V0 = muzzleVel * 39.37 * VelScale; // convert to game units
    const D0 = dragCoef * Math.pow(V0, 2) / DragDiv;
    const K1 = Math.pow(D0 / Math.pow(V0, 1.5), -1);
    const rangeIn = range * 39.37;
    const Vel = Math.max(Math.pow(Math.sqrt(V0) - (rangeIn / (2 * K1)), 2), 0);
    const velMs = Vel * 0.0254;

    // Kinetic energy and penetration at range
    const KinFudge = 1.8, KEtoRHA = 0.04;
    const PenAreaMod = 0.6;
    const FrArea = Math.PI * Math.pow(parseFloat(document.getElementById('bc-cal').value || 10) / 2, 2);
    const PenArea = Math.pow(FrArea, PenAreaMod);
    const LimitVel = parseFloat(document.getElementById('bc-limitvel').value || 750);
    const KE = (projMass * Math.pow(velMs, 2)) / 2000;
    const Momentum = velMs * projMass;
    const fullKE = (projMass * Math.pow(velMs, KinFudge)) / 2000 + Momentum;
    const overspeed = Math.max(velMs - LimitVel, 0);
    const Penetration = Math.max(fullKE - (Math.pow(overspeed, 2)) / (LimitVel * 5) * Math.pow(fullKE / 200, 0.95), fullKE * 0.1);
    const maxPen = (Penetration / PenArea) * KEtoRHA;

    document.getElementById('bc-out-mv').textContent = Math.round(muzzleVel) + ' m/s';
    document.getElementById('bc-out-vel').textContent = Math.round(velMs) + ' m/s';
    document.getElementById('bc-out-ke').textContent = Math.round(KE) + ' kJ';
    document.getElementById('bc-out-pen').textContent = Math.round(maxPen) + ' mm RHAe';
  }

  form.querySelectorAll('input').forEach(i => i.addEventListener('input', calc));
  calc();
}

// ── SEARCH ──
const searchIndex = [];
function buildSearchIndex() {
  ACE.guns.forEach(g => searchIndex.push({ name: g.name, cat: 'Gun · ' + g.cls, target: 'page-guns' }));
  ACE.engines.forEach(e => searchIndex.push({ name: e.name, cat: 'Engine · ' + e.fuel, target: 'page-engines' }));
  ACE.armors.forEach(a => searchIndex.push({ name: a.name, cat: 'Armor', target: 'page-armor' }));
  ACE.roundTypes.forEach(r => searchIndex.push({ name: r.name, cat: 'Ammo Type', target: 'page-ammo' }));
  ACE.missiles.forEach(m => searchIndex.push({ name: m.name, cat: 'Missile', target: 'page-missiles' }));
}

const searchBox = document.getElementById('search-box');
const searchResults = document.getElementById('search-results');

searchBox?.addEventListener('input', () => {
  const q = searchBox.value.toLowerCase().trim();
  if (!q) { searchResults.classList.remove('open'); return; }
  const hits = searchIndex.filter(x => x.name.toLowerCase().includes(q)).slice(0, 8);
  searchResults.innerHTML = hits.map(h =>
    `<div class="sr-item" data-target="${h.target}"><div class="sr-name">${h.name}</div><div class="sr-cat">${h.cat}</div></div>`
  ).join('') || '<div class="sr-item"><div class="sr-cat">No results</div></div>';
  searchResults.classList.add('open');
  searchResults.querySelectorAll('.sr-item').forEach(item => {
    item.addEventListener('click', () => {
      navigate(item.dataset.target);
      searchBox.value = '';
    });
  });
});

document.addEventListener('click', e => {
  if (!searchBox?.contains(e.target) && !searchResults?.contains(e.target)) {
    searchResults?.classList.remove('open');
  }
});

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  buildGunTable();
  buildEngineTable();
  buildRoundCards();
  buildArmorCards();
  buildMissileTable();
  buildSearchIndex();
  setupBallisticsCalc();

  // Nav links
  document.querySelectorAll('[data-nav]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      navigate(a.dataset.nav);
    });
  });
});
