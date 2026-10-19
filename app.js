import { rollDice } from "./dice.js";
import { firebaseConfig } from "./firebase-config.js";

const SDK = "https://www.gstatic.com/firebasejs/10.14.1/";

const form = document.getElementById("roll-form");
const nameInput = document.getElementById("name");
const actionInput = document.getElementById("action");
const poolInput = document.getElementById("pool");
const difficultyInput = document.getElementById("difficulty");
const willpowerInput = document.getElementById("willpower");
const button = form.querySelector("button");
const log = document.getElementById("log");
const status = document.getElementById("status");

try {
  nameInput.value = localStorage.getItem("name") ?? "";
} catch {}

let saveRoll = await connect();

async function connect() {
  if (!firebaseConfig.projectId) {
    showStatus("Firebase isn't set up yet, so rolls only show on this screen. See README.md.");
    return localLog();
  }
  try {
    const { initializeApp } = await import(SDK + "firebase-app.js");
    const fs = await import(SDK + "firebase-firestore.js");
    const rolls = fs.collection(fs.getFirestore(initializeApp(firebaseConfig)), "rolls");
    fs.onSnapshot(
      fs.query(rolls, fs.orderBy("createdAt", "desc"), fs.limit(50)),
      snap => render(snap.docs.map(doc => {
        const data = doc.data({ serverTimestamps: "estimate" });
        return { ...data, dice: data.dice.map(d => d.c), time: data.createdAt.toDate() };
      })),
      err => showStatus("Can't load rolls: " + err.message)
    );
    return roll => fs.addDoc(rolls, {
      ...roll,
      dice: roll.dice.map(c => ({ c })),
      createdAt: fs.serverTimestamp()
    });
  } catch (err) {
    showStatus("Can't reach Firebase, so rolls only show on this screen: " + err.message);
    return localLog();
  }
}

function localLog() {
  const rolls = [];
  return async roll => {
    rolls.unshift({ ...roll, time: new Date() });
    render(rolls);
  };
}

form.addEventListener("submit", async e => {
  e.preventDefault();
  const name = nameInput.value.trim();
  const opts = {
    pool: parseInt(poolInput.value, 10),
    difficulty: parseInt(difficultyInput.value, 10),
    willpower: willpowerInput.checked
  };
  try {
    localStorage.setItem("name", name);
  } catch {}

  button.disabled = true;
  try {
    await saveRoll({ name, action: actionInput.value.trim(), ...opts, ...rollDice(opts) });
    willpowerInput.checked = false;
  } catch (err) {
    showStatus("That roll didn't save: " + err.message);
  } finally {
    button.disabled = false;
  }
});

function render(rolls) {
  log.replaceChildren(...rolls.map(renderRoll));
}

function renderRoll(r) {
  const meta = el("div", "meta");
  meta.append(el("span", "who", r.name), el("span", "time", formatTime(r.time)));

  const parts = [`Pool ${r.pool}`, `Diff ${r.difficulty}`];
  if (r.action) {
    parts.unshift(r.action);
  }
  if (r.willpower) {
    parts.push("Willpower");
  }

  const dice = el("div", "dice");
  let markedOne = false;
  for (const chain of r.dice) {
    const span = el("span", "chain");
    chain.forEach((v, i) => {
      if (i > 0) {
        span.append("→");
      }
      let cls = v >= r.difficulty ? "hit" : "";
      if (i === 0 && v === 1 && !markedOne) {
        cls = "one";
        markedOne = true;
      }
      span.append(el("span", cls, String(v)));
    });
    dice.append(span);
  }

  const li = el("li");
  li.append(meta, el("div", "desc", parts.join(" · ")), dice, el("div", "result " + r.outcome, resultText(r)));
  return li;
}

function resultText(r) {
  if (r.outcome === "failure") {
    return "Failure";
  }
  if (r.outcome === "botch") {
    return "Botch!";
  }
  const text = `${r.successes} success${r.successes === 1 ? "" : "es"}`;
  return r.willpower ? text + " (+1 WP)" : text;
}

function formatTime(date) {
  const sameDay = date.toDateString() === new Date().toDateString();
  return sameDay
    ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function el(tag, cls = "", text) {
  const node = document.createElement(tag);
  if (cls) {
    node.className = cls;
  }
  if (text !== undefined) {
    node.textContent = text;
  }
  return node;
}

function showStatus(message) {
  status.textContent = message;
  status.hidden = false;
}
