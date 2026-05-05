const API_URL = "https://api.freeapi.app/api/v1/public/randomjokes";
const SAVED_JOKES_KEY = "jokebox-saved-jokes";
const THEME_KEY = "jokebox-theme";

const jokeSetupEl = document.getElementById("jokeSetup");
const jokePunchlineEl = document.getElementById("jokePunchline");
const jokeWrapEl = document.getElementById("jokeWrap");
const categoryEl = document.getElementById("category");
const statusEl = document.getElementById("status");
const errorEl = document.getElementById("error");
const getJokeBtn = document.getElementById("getJokeBtn");
const copyBtn = document.getElementById("copyBtn");
const saveBtn = document.getElementById("saveBtn");
const savedCountEl = document.getElementById("savedCount");
const themeToggleBtn = document.getElementById("themeToggle");
const themeIconEl = document.getElementById("themeIcon");

let currentJokeText = "";
let currentJokeId = null;

function getSavedJokes() {
  try {
    return JSON.parse(localStorage.getItem(SAVED_JOKES_KEY)) || [];
  } catch {
    return [];
  }
}

function setSavedJokes(jokes) {
  localStorage.setItem(SAVED_JOKES_KEY, JSON.stringify(jokes));
}

function updateSavedCount() {
  savedCountEl.textContent = String(getSavedJokes().length);
}

function setLoading(isLoading) {
  getJokeBtn.disabled = isLoading;
  copyBtn.disabled = isLoading;
  saveBtn.disabled = isLoading;
  statusEl.hidden = !isLoading;
  if (isLoading) {
    statusEl.textContent = "Loading a fresh joke...";
  }
}

function showError(message) {
  errorEl.hidden = false;
  errorEl.textContent = message;
}

function hideError() {
  errorEl.hidden = true;
  errorEl.textContent = "";
}

function setCategory(categories) {
  if (Array.isArray(categories) && categories.length > 0) {
    categoryEl.hidden = false;
    categoryEl.textContent = `Category: ${categories.join(", ")}`;
    return;
  }

  categoryEl.hidden = true;
  categoryEl.textContent = "";
}

function getJokeParts(item) {
  if (!item || typeof item !== "object") {
    return { setup: "No joke found.", punchline: "Please try again." };
  }

  const hasSetupAndPunchline =
    typeof item.setup === "string" && item.setup.trim() &&
    typeof item.punchline === "string" && item.punchline.trim();

  if (hasSetupAndPunchline) {
    return {
      setup: item.setup.trim(),
      punchline: item.punchline.trim(),
    };
  }

  // Handle APIs that return one text field instead of setup/punchline fields.
  const singleText =
    typeof item.content === "string" && item.content.trim()
      ? item.content.trim()
      : typeof item.joke === "string" && item.joke.trim()
        ? item.joke.trim()
        : "No joke available right now.";

  return { setup: singleText, punchline: "" };
}

function renderJoke(jokeItem) {
  const { setup, punchline } = getJokeParts(jokeItem);

  currentJokeText = punchline ? `${setup}\n${punchline}` : setup;
  currentJokeId = jokeItem?.id ?? null;

  setCategory(jokeItem?.categories || []);

  jokeWrapEl.classList.remove("visible");
  jokeWrapEl.classList.add("hidden");

  // Delay content update for a smooth fade transition.
  setTimeout(() => {
    jokeSetupEl.textContent = setup;
    jokePunchlineEl.textContent = punchline;
    jokeWrapEl.classList.remove("hidden");
    jokeWrapEl.classList.add("visible");
  }, 140);
}

async function fetchRandomJoke() {
  setLoading(true);
  hideError();

  try {
    const response = await fetch(API_URL, { method: "GET" });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    // API returns a list in result.data.data, so we pick one randomly.
    const items = result?.data?.data;

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("Empty response from API");
    }

    const randomIndex = Math.floor(Math.random() * items.length);
    renderJoke(items[randomIndex]);
  } catch (error) {
    showError("Could not fetch a joke right now. Please try again in a moment.");
    jokeSetupEl.textContent = "Oops, the joke machine is taking a break.";
    jokePunchlineEl.textContent = "Tap the button to retry.";
    categoryEl.hidden = true;
    currentJokeText = "";
    currentJokeId = null;
    console.error("Joke fetch failed:", error);
  } finally {
    setLoading(false);
  }
}

async function copyCurrentJoke() {
  if (!currentJokeText) {
    showError("No joke to copy yet. Fetch one first.");
    return;
  }

  try {
    await navigator.clipboard.writeText(currentJokeText);
    hideError();

    const previousText = copyBtn.textContent;
    copyBtn.textContent = "Copied!";
    setTimeout(() => {
      copyBtn.textContent = previousText;
    }, 1000);
  } catch {
    showError("Clipboard permission denied. You can copy manually.");
  }
}

function saveCurrentJoke() {
  if (!currentJokeText) {
    showError("No joke to save yet. Fetch one first.");
    return;
  }

  // Persist favorites in localStorage so data survives refresh.
  const savedJokes = getSavedJokes();
  const alreadySaved = savedJokes.some((item) => item.id === currentJokeId && item.text === currentJokeText);

  if (alreadySaved) {
    showError("This joke is already saved.");
    return;
  }

  savedJokes.push({
    id: currentJokeId,
    text: currentJokeText,
    savedAt: new Date().toISOString(),
  });

  setSavedJokes(savedJokes);
  updateSavedCount();
  hideError();

  const oldLabel = saveBtn.textContent;
  saveBtn.textContent = "Saved!";
  setTimeout(() => {
    saveBtn.textContent = oldLabel;
  }, 900);
}

function applyTheme(theme) {
  const darkMode = theme === "dark";
  document.body.classList.toggle("dark", darkMode);
  themeIconEl.textContent = darkMode ? "☀️" : "🌙";
}

function initializeTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);

  if (savedTheme === "dark" || savedTheme === "light") {
    applyTheme(savedTheme);
    return;
  }

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(prefersDark ? "dark" : "light");
}

themeToggleBtn.addEventListener("click", () => {
  const isDark = document.body.classList.contains("dark");
  const nextTheme = isDark ? "light" : "dark";
  localStorage.setItem(THEME_KEY, nextTheme);
  applyTheme(nextTheme);
});

getJokeBtn.addEventListener("click", fetchRandomJoke);
copyBtn.addEventListener("click", copyCurrentJoke);
saveBtn.addEventListener("click", saveCurrentJoke);

initializeTheme();
updateSavedCount();
fetchRandomJoke();
