const API_URL = "https://api.freeapi.app/api/v1/public/quotes";
const STORAGE_KEYS = {
  favorites: "quoteflow:favorites",
  theme: "quoteflow:theme",
};

// Central state keeps pagination, filters, loaded quotes, and saved favorites in sync.
const state = {
  page: 1,
  limit: 10,
  hasNextPage: true,
  isLoading: false,
  quotes: [],
  favorites: loadFavorites(),
  filters: {
    search: "",
    author: "",
    favoritesOnly: false,
  },
};

// DOM references are collected once so the rest of the code can stay focused on behavior.
const elements = {
  authorFilter: document.querySelector("#authorFilter"),
  emptyState: document.querySelector("#emptyState"),
  errorPanel: document.querySelector("#errorPanel"),
  errorText: document.querySelector("#errorText"),
  favoritesFilter: document.querySelector("#favoritesFilter"),
  loadMoreButton: document.querySelector("#loadMoreButton"),
  quoteGrid: document.querySelector("#quoteGrid"),
  quoteOfTheDay: document.querySelector("#quoteOfTheDay"),
  retryButton: document.querySelector("#retryButton"),
  searchInput: document.querySelector("#searchInput"),
  skeletonGrid: document.querySelector("#skeletonGrid"),
  template: document.querySelector("#quoteCardTemplate"),
  themeIcon: document.querySelector("#themeIcon"),
  themeToggle: document.querySelector("#themeToggle"),
  toast: document.querySelector("#toast"),
};

document.addEventListener("DOMContentLoaded", initializeApp);

function initializeApp() {
  // Apply user preferences before fetching so the first paint matches their saved theme.
  applySavedTheme();
  bindEvents();
  fetchQuotes();
}

function bindEvents() {
  // Filter controls update the already-loaded gallery instantly.
  elements.loadMoreButton.addEventListener("click", () => fetchQuotes());
  elements.retryButton.addEventListener("click", () => fetchQuotes());

  elements.searchInput.addEventListener("input", (event) => {
    state.filters.search = event.target.value.trim().toLowerCase();
    renderQuotes();
  });

  elements.authorFilter.addEventListener("change", (event) => {
    state.filters.author = event.target.value;
    renderQuotes();
  });

  elements.favoritesFilter.addEventListener("click", () => {
    state.filters.favoritesOnly = !state.filters.favoritesOnly;
    elements.favoritesFilter.setAttribute("aria-pressed", String(state.filters.favoritesOnly));
    renderQuotes();
  });

  elements.themeToggle.addEventListener("click", toggleTheme);
}

async function fetchQuotes() {
  // Guard against duplicate clicks while a request is active or after the final page.
  if (state.isLoading || !state.hasNextPage) {
    return;
  }

  setLoading(true);
  hideError();

  try {
    const url = new URL(API_URL);
    url.searchParams.set("page", state.page);
    url.searchParams.set("limit", state.limit);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const result = await response.json();

    if (result?.success === false) {
      throw new Error(result?.message || "The quotes service returned an error.");
    }

    const payload = result?.data ?? {};
    const apiQuotes = Array.isArray(payload.data) ? payload.data : [];
    const normalizedQuotes = apiQuotes.map(normalizeQuote).filter((quote) => quote.content);

    mergeQuotes(normalizedQuotes);
    state.hasNextPage =
      typeof payload.nextPage === "boolean" ? payload.nextPage : normalizedQuotes.length === state.limit;
    state.page = Number(payload.page || state.page) + 1;

    renderAuthorOptions();
    renderQuoteOfTheDay();
    renderQuotes();
  } catch (error) {
    showError(error);
  } finally {
    setLoading(false);
  }
}

function normalizeQuote(quote) {
  // Convert every API item to the small shape the UI needs and gracefully fill missing authors.
  return {
    id: quote?.id ?? `${quote?.author ?? "Unknown"}-${quote?.content ?? Date.now()}`,
    content: String(quote?.content ?? "").trim(),
    author: String(quote?.author ?? "Unknown").trim() || "Unknown",
  };
}

function mergeQuotes(nextQuotes) {
  // Prevent duplicate cards if the same page is fetched twice or the API repeats an item.
  const existingIds = new Set(state.quotes.map((quote) => String(quote.id)));
  const uniqueQuotes = nextQuotes.filter((quote) => !existingIds.has(String(quote.id)));
  state.quotes = [...state.quotes, ...uniqueQuotes];
}

function renderQuotes() {
  elements.quoteGrid.textContent = "";

  const visibleQuotes = getVisibleQuotes();
  visibleQuotes.forEach((quote, index) => {
    const card = createQuoteCard(quote);
    card.style.animationDelay = `${Math.min(index * 35, 280)}ms`;
    elements.quoteGrid.append(card);
  });

  elements.emptyState.classList.toggle("hidden", state.isLoading || visibleQuotes.length > 0);
  updateLoadMoreButton();
}

function createQuoteCard(quote) {
  // textContent keeps quote and author rendering safe even if the API returns unexpected text.
  const fragment = elements.template.content.cloneNode(true);
  const card = fragment.querySelector(".quote-card");
  const quoteText = fragment.querySelector(".quote-text");
  const author = fragment.querySelector(".quote-author");
  const copyButton = fragment.querySelector(".copy-button");
  const favoriteButton = fragment.querySelector(".favorite-button");
  const favoriteKey = getQuoteKey(quote);
  const isFavorite = Boolean(state.favorites[favoriteKey]);

  quoteText.textContent = quote.content;
  author.textContent = `— ${quote.author}`;
  updateFavoriteButton(favoriteButton, isFavorite);

  favoriteButton.addEventListener("click", () => {
    toggleFavorite(quote);
    updateFavoriteButton(favoriteButton, Boolean(state.favorites[favoriteKey]));
    renderAuthorOptions();
    renderQuotes();
  });

  copyButton.addEventListener("click", async () => {
    const quoteToCopy = `"${quote.content}" — ${quote.author}`;
    await copyToClipboard(quoteToCopy);
    showToast("Quote copied");
  });

  return card;
}

function getVisibleQuotes() {
  const quotePool = getQuotePool();

  return quotePool.filter((quote) => {
    const quoteKey = getQuoteKey(quote);
    const matchesSearch =
      quote.content.toLowerCase().includes(state.filters.search) ||
      quote.author.toLowerCase().includes(state.filters.search);
    const matchesAuthor = !state.filters.author || quote.author === state.filters.author;
    const matchesFavorite = !state.filters.favoritesOnly || Boolean(state.favorites[quoteKey]);

    return matchesSearch && matchesAuthor && matchesFavorite;
  });
}

function getQuotePool() {
  // Favorites view includes saved quotes from localStorage, even before their page is loaded again.
  if (!state.filters.favoritesOnly) {
    return state.quotes;
  }

  const storedFavorites = Object.values(state.favorites);
  const quoteMap = new Map();

  [...storedFavorites, ...state.quotes].forEach((quote) => {
    quoteMap.set(getQuoteKey(quote), quote);
  });

  return [...quoteMap.values()];
}

function renderAuthorOptions() {
  const selectedAuthor = state.filters.author;
  const authorPool = [...state.quotes, ...Object.values(state.favorites)];
  const authors = [...new Set(authorPool.map((quote) => quote.author))].sort((a, b) =>
    a.localeCompare(b)
  );

  elements.authorFilter.textContent = "";
  elements.authorFilter.append(new Option("All authors", ""));

  authors.forEach((author) => {
    elements.authorFilter.append(new Option(author, author));
  });

  if (authors.includes(selectedAuthor)) {
    elements.authorFilter.value = selectedAuthor;
  } else {
    state.filters.author = "";
  }
}

function renderQuoteOfTheDay() {
  // The daily quote is deterministic for the current date and the quotes loaded so far.
  if (!state.quotes.length) {
    return;
  }

  const dailyQuote = getDailyQuote(state.quotes);
  elements.quoteOfTheDay.querySelector(".daily-text").textContent = dailyQuote.content;
  elements.quoteOfTheDay.querySelector(".daily-author").textContent = `— ${dailyQuote.author}`;
}

function getDailyQuote(quotes) {
  const today = new Date();
  const dateSeed = Number(
    `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(
      today.getDate()
    ).padStart(2, "0")}`
  );

  return quotes[dateSeed % quotes.length];
}

function toggleFavorite(quote) {
  const favoriteKey = getQuoteKey(quote);

  if (state.favorites[favoriteKey]) {
    delete state.favorites[favoriteKey];
    showToast("Removed from favorites");
  } else {
    state.favorites[favoriteKey] = quote;
    showToast("Added to favorites");
  }

  saveFavorites();
}

function updateFavoriteButton(button, isFavorite) {
  button.textContent = isFavorite ? "★" : "☆";
  button.setAttribute("aria-pressed", String(isFavorite));
  button.setAttribute("aria-label", isFavorite ? "Remove from favorites" : "Add to favorites");
}

function getQuoteKey(quote) {
  return String(quote.id ?? `${quote.author}-${quote.content}`);
}

async function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fall through to the textarea copy method below.
    }
  }

  // Clipboard fallback for local file previews or older browsers.
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function setLoading(isLoading) {
  state.isLoading = isLoading;
  elements.skeletonGrid.classList.toggle("hidden", !isLoading);
  elements.loadMoreButton.disabled = isLoading;
  elements.loadMoreButton.textContent = isLoading ? "Loading..." : "Load More";
  updateLoadMoreButton();
}

function updateLoadMoreButton() {
  const shouldHide = state.filters.favoritesOnly || (!state.hasNextPage && !state.isLoading);
  elements.loadMoreButton.classList.toggle("hidden", shouldHide);

  if (!state.isLoading) {
    elements.loadMoreButton.disabled = !state.hasNextPage;
    elements.loadMoreButton.textContent = state.hasNextPage ? "Load More" : "All Quotes Loaded";
  }
}

function showError(error) {
  console.error("QuoteFlow fetch error:", error);
  elements.errorText.textContent = "Please check your connection and try again in a moment.";
  elements.errorPanel.classList.remove("hidden");
  showToast("Could not load quotes");
}

function hideError() {
  elements.errorPanel.classList.add("hidden");
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("visible");

  clearTimeout(showToast.timeoutId);
  showToast.timeoutId = setTimeout(() => {
    elements.toast.classList.remove("visible");
  }, 1800);
}

function loadFavorites() {
  try {
    const parsedFavorites = JSON.parse(readStorage(STORAGE_KEYS.favorites)) || {};
    return Object.values(parsedFavorites).reduce((favorites, quote) => {
      const normalizedQuote = normalizeQuote(quote);

      if (normalizedQuote.content) {
        favorites[getQuoteKey(normalizedQuote)] = normalizedQuote;
      }

      return favorites;
    }, {});
  } catch {
    return {};
  }
}

function saveFavorites() {
  writeStorage(STORAGE_KEYS.favorites, JSON.stringify(state.favorites));
}

function applySavedTheme() {
  const savedTheme = readStorage(STORAGE_KEYS.theme);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const shouldUseDark = savedTheme ? savedTheme === "dark" : prefersDark;

  document.body.classList.toggle("dark", shouldUseDark);
  elements.themeIcon.textContent = shouldUseDark ? "☀" : "☾";
}

function toggleTheme() {
  const isDark = document.body.classList.toggle("dark");
  writeStorage(STORAGE_KEYS.theme, isDark ? "dark" : "light");
  elements.themeIcon.textContent = isDark ? "☀" : "☾";
}

function readStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    showToast("Local storage is unavailable");
  }
}
