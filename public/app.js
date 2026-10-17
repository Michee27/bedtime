const $ = (id) => document.getElementById(id);
const eur = (c) => `€${(c / 100).toFixed(2)}`;
const post = (url, body) =>
  fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(async (r) => {
    const data = await r.json();
    if (!r.ok) throw new Error(data.error);
    return data;
  });

let jar = loadJar();
let rewards = [];

function toast(msg) {
  $('toast').textContent = msg;
  $('toast').classList.remove('hidden');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => $('toast').classList.add('hidden'), 2500);
}

function burst(el) {
  for (let i = 0; i < 8; i++) {
    const s = document.createElement('span');
    s.className = 'spark';
    s.textContent = '⭐';
    s.style.setProperty('--dx', `${(Math.random() - 0.5) * 160}px`);
    s.style.setProperty('--dy', `${-60 - Math.random() * 100}px`);
    el.appendChild(s);
    setTimeout(() => s.remove(), 900);
  }
}

const loadRewards = () => fetch(`/api/rewards?age=${jar.child.ageMonths}`).then((r) => r.json()).then((r) => { rewards = r; render(); });

function render() {
  const cheapest = Math.min(...rewards.filter((b) => b.price > jar.unlocked).map((b) => b.price));
  $('kidName').textContent = `${jar.child.name}'s jar`;
  $('unlocked').textContent = eur(jar.unlocked);
  $('starCount').textContent = `${jar.stars}⭐`;
  $('nextGoal').textContent = isFinite(cheapest)
    ? `${Math.ceil((cheapest - jar.unlocked) / CENTS_PER_STAR)} more ⭐ until the next book!`
    : '🎉 You can pick any book!';
  $('jarFill').style.height = `${Math.min(100, isFinite(cheapest) ? (jar.unlocked / cheapest) * 100 : 100)}%`;

  $('missions').innerHTML = '';
  jar.missions.forEach((m) => {
    const b = document.createElement('button');
    b.className = 'mission';
    b.innerHTML = `<span class="m-emoji">${m.emoji}</span><span>${m.name}</span><span class="m-stars">+${m.stars}⭐</span>`;
    b.onclick = () => {
      try { completeMission(jar, m.id); burst(b); render(); } catch (e) { toast(e.message); }
    };
    $('missions').appendChild(b);
  });

  $('rewards').innerHTML = '';
  rewards.forEach((bk) => {
    const can = jar.unlocked >= bk.price;
    const el = document.createElement('div');
    el.className = `book ${can ? 'can' : 'locked'}`;
    el.innerHTML = `
      <img src="https://covers.openlibrary.org/b/isbn/${bk.isbn}-M.jpg" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'cover',textContent:'📖'}))" />
      <h4>${bk.title}</h4>
      <p class="price">${Math.ceil(bk.price / CENTS_PER_STAR)}⭐</p>
      <button class="${can ? 'primary' : 'secondary'} small" ${can ? '' : 'disabled'}>${can ? 'Get it! 🎁' : '🔒'}</button>`;
    el.querySelector('button').onclick = () => {
      try { redeemBook(jar, bk); toast(`🎉 ${bk.title} is yours!`); render(); } catch (e) { toast(e.message); }
    };
    $('rewards').appendChild(el);
  });

  $('shelfTitle').classList.toggle('hidden', !jar.shelf.length);
  $('shelf').innerHTML = jar.shelf.map((b) => `<img title="${b.title}" src="https://covers.openlibrary.org/b/isbn/${b.isbn}-S.jpg" />`).join('');

  $('locked').textContent = eur(jar.locked);
  $('unlockedP').textContent = eur(jar.unlocked);
  $('rate').textContent = eur(CENTS_PER_STAR);
  $('allowance').classList.toggle('hidden', !jar.allowance);
  $('childName').value = jar.child.name;
  $('childAge').value = jar.child.ageMonths;
  $('log').innerHTML = jar.log.slice(0, 15).map((l) => `<li>${l.emoji} ${l.text} <span class="muted">${new Date(l.at).toLocaleTimeString()}</span></li>`).join('') || '<li class="muted">Nothing yet</li>';
}

document.querySelectorAll('.tab').forEach((t) => (t.onclick = () => {
  document.querySelectorAll('.tab').forEach((x) => x.classList.toggle('on', x === t));
  $('kid').classList.toggle('hidden', t.dataset.tab !== 'kid');
  $('parent').classList.toggle('hidden', t.dataset.tab !== 'parent');
}));

const checkout = (url, body) => post(url, { ...body, child: jar.child.name }).then((r) => (location.href = r.url)).catch((e) => toast(e.message));
document.querySelectorAll('[data-topup]').forEach((b) => (b.onclick = () => checkout('/api/topup', { amount: +b.dataset.topup })));
$('subscribe').onclick = () => checkout('/api/subscribe', {});

$('saveChild').onclick = () => {
  jar.child = { name: $('childName').value || jar.child.name, ageMonths: Number($('childAge').value) || jar.child.ageMonths };
  saveJar(jar);
  loadRewards();
  toast('Saved!');
};

$('addMission').onclick = () => {
  if (!$('mName').value) return toast('Mission needs a name');
  jar.missions.push({ id: `m${Date.now()}`, emoji: $('mEmoji').value || '⭐', name: $('mName').value, stars: Number($('mStars').value) || 2 });
  saveJar(jar);
  $('mName').value = '';
  render();
};

render();
loadRewards();
