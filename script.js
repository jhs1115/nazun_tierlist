const NAMES = [
  '감성준', '힘웃사', '그그달', '레전드', '다람쥐',
  '레몬', '혜지', '영호', '꽉낄라', '파우스트',
  '누핑', '오후', '천사', '쏘이', '키노카노',
  '윈드', '망객', '브이', '실버', '민초',
  '밴치', '보람', '요루'
];

let placements = JSON.parse(localStorage.getItem('tl_data') || '{}');

function save() {
  localStorage.setItem('tl_data', JSON.stringify(placements));
}

function makeCard(name) {
  const el = document.createElement('div');
  el.className = 'card';
  el.textContent = name;
  el.dataset.name = name;
  el.draggable = true;
  return el;
}

let dragging = null;
let ghost = null;
let ghostOX = 0, ghostOY = 0;

function setupDrag(card) {
  card.addEventListener('dragstart', e => {
    dragging = card;
    card.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', card.dataset.name);

    ghost = card.cloneNode(true);
    ghost.classList.remove('dragging');
    ghost.classList.add('drag-ghost');
    document.body.appendChild(ghost);

    const r = card.getBoundingClientRect();
    ghostOX = e.clientX - r.left;
    ghostOY = e.clientY - r.top;
    ghost.style.left = (e.clientX - ghostOX) + 'px';
    ghost.style.top  = (e.clientY - ghostOY) + 'px';
    e.dataTransfer.setDragImage(new Image(), 0, 0);
  });

  card.addEventListener('dragend', () => {
    card.classList.remove('dragging');
    dragging = null;
    if (ghost) { ghost.remove(); ghost = null; }
    updateHints();
    save();
  });
}

document.addEventListener('dragover', e => {
  e.preventDefault();
  if (ghost) {
    ghost.style.left = (e.clientX - ghostOX) + 'px';
    ghost.style.top  = (e.clientY - ghostOY) + 'px';
  }
});

function setupZone(zone) {
  zone.addEventListener('dragover', e => {
    e.preventDefault();
    zone.classList.add('drag-over');
    const row = zone.closest('.tier-row');
    if (row) row.classList.add('drag-over');
  });

  zone.addEventListener('dragleave', e => {
    if (!zone.contains(e.relatedTarget)) {
      zone.classList.remove('drag-over');
      const row = zone.closest('.tier-row');
      if (row) row.classList.remove('drag-over');
    }
  });

  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    const row = zone.closest('.tier-row');
    if (row) row.classList.remove('drag-over');
    if (!dragging) return;

    const name = dragging.dataset.name;
    const zoneId = zone.dataset.zone;

    const cards = [...zone.querySelectorAll('.card:not(.dragging)')];
    let insertBefore = null;
    for (const c of cards) {
      const r = c.getBoundingClientRect();
      if (e.clientX < r.left + r.width / 2) { insertBefore = c; break; }
    }

    if (insertBefore) zone.insertBefore(dragging, insertBefore);
    else zone.appendChild(dragging);

    placements[name] = zoneId;
    updateHints();
    save();
  });
}

function updateHints() {
  document.querySelectorAll('[data-zone]').forEach(z => {
    let hint = z.querySelector('.empty-hint');
    const hasCards = z.querySelector('.card');
    if (!hasCards) {
      if (!hint) {
        hint = document.createElement('div');
        hint.className = 'empty-hint';
        hint.textContent = z.id === 'pool' ? '모두 배치됨' : '여기에 드래그';
        z.appendChild(hint);
      }
    } else {
      if (hint) hint.remove();
    }
  });
}

function init() {
  const pool = document.getElementById('pool');
  NAMES.forEach(name => {
    const card = makeCard(name);
    setupDrag(card);
    const zone = placements[name];
    if (zone && zone !== 'pool') {
      const target = document.querySelector(`[data-zone="${zone}"]`);
      if (target) { target.appendChild(card); return; }
    }
    pool.appendChild(card);
  });

  document.querySelectorAll('[data-zone]').forEach(setupZone);
  updateHints();
}

init();
