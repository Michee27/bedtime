// Jar state lives in the browser so the app runs on serverless hosting without a database.
const CENTS_PER_STAR = 50;
const KEY = 'bedtime-bounty';

const DEFAULT_JAR = {
  child: { name: 'Lily', ageMonths: 30 },
  locked: 0,      // money parents put in, waiting to be earned
  unlocked: 0,    // money the kid earned with stars, ready to spend
  stars: 0,
  allowance: false,
  missions: [
    { id: 'teeth', emoji: '🪥', name: 'Brush teeth', stars: 2 },
    { id: 'bath', emoji: '🛁', name: 'Bath time', stars: 2 },
    { id: 'toys', emoji: '🧸', name: 'Tidy toys', stars: 3 },
    { id: 'veggies', emoji: '🥦', name: 'Ate veggies', stars: 3 },
    { id: 'bed', emoji: '😴', name: 'In bed by 8pm', stars: 4 },
    { id: 'read', emoji: '📖', name: 'Read together', stars: 2 },
  ],
  log: [],
  shelf: [],
  credited: [],
};

function loadJar() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved) return { ...structuredClone(DEFAULT_JAR), ...saved };
  } catch {}
  return structuredClone(DEFAULT_JAR);
}

function saveJar(jar) {
  try { localStorage.setItem(KEY, JSON.stringify(jar)); } catch {}
  return jar;
}

const addLog = (jar, emoji, text) => jar.log.unshift({ emoji, text, at: Date.now() });

// Credit a confirmed Checkout Session exactly once
function creditJar(jar, session) {
  if (!session.paid || jar.credited.includes(session.id)) return false;
  jar.credited.push(session.id);
  jar.locked += session.amount;
  if (session.mode === 'subscription') jar.allowance = true;
  addLog(jar, '💶', `Parent added €${(session.amount / 100).toFixed(2)} to the jar`);
  saveJar(jar);
  return true;
}

function completeMission(jar, missionId) {
  const m = jar.missions.find((x) => x.id === missionId);
  const cents = m.stars * CENTS_PER_STAR;
  if (jar.locked < cents) throw new Error('The jar is empty! Ask a grown-up to top it up 🫙');
  jar.locked -= cents;
  jar.unlocked += cents;
  jar.stars += m.stars;
  addLog(jar, m.emoji, `${jar.child.name} did "${m.name}" +${m.stars}⭐`);
  return saveJar(jar);
}

function redeemBook(jar, book) {
  if (jar.unlocked < book.price) throw new Error('Not enough stars yet — keep going!');
  jar.unlocked -= book.price;
  jar.shelf.unshift({ ...book, at: Date.now() });
  addLog(jar, '🎁', `${jar.child.name} earned "${book.title}"!`);
  return saveJar(jar);
}
