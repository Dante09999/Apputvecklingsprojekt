const names = { sverige: "Sverige", ukraina: "Ukraina", japan: "Japan" };
const key = "res-norm-tips-v1";
const validUrl = /^(sverige|ukraina|japan)-[1-4]\.html$/;
const get = id => document.getElementById(id);

function read() {
  try {
    const saved = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(saved) ? saved.filter(item => item && validUrl.test(item.url)) : [];
  } catch {
    return [];
  }
}

function write(items) {
  try {
    localStorage.setItem(key, JSON.stringify(items));
    return true;
  } catch {
    return false;
  }
}

get("trip")?.addEventListener("submit", event => {
  event.preventDefault();
  const { from, to } = Object.fromEntries(new FormData(event.currentTarget));
  get("error").hidden = from !== to;
  if (from !== to && Object.hasOwn(names, to)) location.href = to + ".html?fran=" + from;
});

const origin = get("origin");
const from = new URLSearchParams(location.search).get("fran");
if (origin && Object.hasOwn(names, from)) {
  origin.hidden = false;
  origin.textContent = "Avreseland: " + names[from];
}

function filter() {
  const query = get("search").value.trim().toLocaleLowerCase("sv");
  const category = get("category").value;
  const cards = [...document.querySelectorAll(".tip")];
  for (const card of cards) {
    card.hidden = !card.textContent.toLocaleLowerCase("sv").includes(query)
      || (category !== "" && card.dataset.category !== category);
  }
  get("no-results").hidden = cards.some(card => !card.hidden);
}

get("search")?.addEventListener("input", filter);
get("category")?.addEventListener("change", filter);

const save = get("save");
if (save) {
  const item = { ...save.dataset };
  const refresh = () => {
    const exists = read().some(tip => tip.url === item.url);
    save.textContent = exists ? "Ta bort från sparat" : "Spara tips";
    save.setAttribute("aria-pressed", String(exists));
  };
  window.addEventListener("pageshow", refresh);
  save.addEventListener("click", () => {
    const saved = read();
    const exists = saved.some(tip => tip.url === item.url);
    const updated = exists ? saved.filter(tip => tip.url !== item.url) : [...saved, item];
    get("save-status").textContent = write(updated)
      ? (exists ? "Tipset togs bort." : "Tipset finns nu under Sparat.")
      : "Tipset kunde inte sparas i den här webbläsaren.";
    refresh();
  });
}

const list = get("saved");
function renderSaved() {
  const saved = read();
  list.replaceChildren();
  get("empty").hidden = saved.length > 0;
  for (const item of saved) {
    const card = document.createElement("article");
    card.className = "card";
    const country = document.createElement("p");
    country.className = "label";
    country.textContent = item.country;
    const title = document.createElement("h2");
    const link = document.createElement("a");
    link.href = item.url;
    link.textContent = item.title;
    title.append(link);
    const remove = document.createElement("button");
    remove.textContent = "Ta bort";
    remove.addEventListener("click", () => {
      if (write(read().filter(tip => tip.url !== item.url))) renderSaved();
    });
    card.append(country, title, remove);
    list.append(card);
  }
}

if (list) window.addEventListener("pageshow", renderSaved);

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
