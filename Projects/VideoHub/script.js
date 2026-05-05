const API_URL = "https://api.freeapi.app/api/v1/public/youtube/videos";
const PAGE_LIMIT = 10;

const state = {
  page: 1,
  hasNextPage: true,
  isLoading: false,
  videos: [],
  searchTerm: "",
  activeFilter: "all",
};

const elements = {
  grid: document.querySelector("#videoGrid"),
  loadMore: document.querySelector("#loadMoreBtn"),
  status: document.querySelector("#statusMessage"),
  searchForm: document.querySelector("#searchForm"),
  searchInput: document.querySelector("#searchInput"),
  themeToggle: document.querySelector("#themeToggle"),
  chips: document.querySelectorAll(".chip"),
  modal: document.querySelector("#videoModal"),
  modalTitle: document.querySelector("#modalTitle"),
  player: document.querySelector("#videoPlayer"),
};

document.addEventListener("DOMContentLoaded", () => {
  hydrateTheme();
  bindEvents();
  fetchVideos();
});

function bindEvents() {
  elements.loadMore.addEventListener("click", () => {
    if (!state.isLoading && state.hasNextPage) {
      state.page += 1;
      fetchVideos();
    }
  });

  // Search is client-side and filters the videos that are already loaded.
  elements.searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    state.searchTerm = elements.searchInput.value.trim().toLowerCase();
    renderVideos();
  });

  elements.searchInput.addEventListener("input", (event) => {
    state.searchTerm = event.target.value.trim().toLowerCase();
    renderVideos();
  });

  elements.themeToggle.addEventListener("click", toggleTheme);

  elements.chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      elements.chips.forEach((item) => item.classList.remove("active"));
      chip.classList.add("active");
      state.activeFilter = chip.dataset.filter;
      renderVideos();
    });
  });

  elements.modal.addEventListener("click", (event) => {
    if (event.target.matches("[data-close-modal]")) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !elements.modal.classList.contains("hidden")) {
      closeModal();
    }
  });
}

async function fetchVideos() {
  const requestedPage = state.page;

  setLoading(true);
  hideStatus();
  renderSkeletons(state.page === 1 ? PAGE_LIMIT : 4);

  try {
    const response = await fetch(`${API_URL}?page=${state.page}&limit=${PAGE_LIMIT}`);

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const payload = await response.json();
    const pageData = payload?.data;
    const videos = Array.isArray(pageData?.data)
      ? pageData.data.map(normalizeVideo).filter(Boolean)
      : [];

    state.videos = requestedPage === 1 ? videos : [...state.videos, ...videos];
    state.hasNextPage = Boolean(pageData?.nextPage);
    renderVideos();
  } catch (error) {
    console.error("Unable to fetch videos:", error);

    if (requestedPage > 1) {
      state.page = Math.max(1, state.page - 1);
      renderVideos();
    } else {
      elements.grid.innerHTML = "";
      state.hasNextPage = false;
      elements.loadMore.hidden = true;
    }

    showStatus(
      "We could not load videos right now. Please check your connection and try again."
    );
  } finally {
    setLoading(false);
  }
}

function normalizeVideo(record) {
  // The API wraps each YouTube item inside record.items, so flatten it first.
  const item = record?.items;
  const snippet = item?.snippet ?? {};
  const statistics = item?.statistics ?? {};
  const videoId = item?.id;

  if (!videoId) return null;

  return {
    id: videoId,
    title: snippet.title || "Untitled video",
    channel: snippet.channelTitle || "Unknown channel",
    thumbnail:
      snippet.thumbnails?.maxres?.url ||
      snippet.thumbnails?.standard?.url ||
      snippet.thumbnails?.high?.url ||
      snippet.thumbnails?.medium?.url ||
      snippet.thumbnails?.default?.url ||
      "",
    views: Number(statistics.viewCount || 0),
    publishedAt: snippet.publishedAt || "",
    duration: item?.contentDetails?.duration || "",
    tags: Array.isArray(snippet.tags) ? snippet.tags : [],
  };
}

function renderVideos() {
  // Rendering always starts from state so search, filters, and pagination stay in sync.
  const visibleVideos = getFilteredVideos();
  elements.grid.innerHTML = "";

  if (!visibleVideos.length) {
    showStatus(
      state.videos.length
        ? "No loaded videos match your search or filter."
        : "No videos were found."
    );
  } else {
    hideStatus();
  }

  const fragment = document.createDocumentFragment();
  visibleVideos.forEach((video) => fragment.appendChild(createVideoCard(video)));
  elements.grid.appendChild(fragment);

  elements.loadMore.hidden = !state.hasNextPage;
  elements.loadMore.disabled = state.isLoading;
}

function getFilteredVideos() {
  return state.videos.filter((video) => {
    const searchableText = [video.title, video.channel, ...video.tags]
      .join(" ")
      .toLowerCase();
    const matchesSearch =
      !state.searchTerm || searchableText.includes(state.searchTerm);
    const matchesFilter =
      state.activeFilter === "all" || searchableText.includes(state.activeFilter);

    return matchesSearch && matchesFilter;
  });
}

function createVideoCard(video) {
  const card = document.createElement("button");
  card.className = "video-card";
  card.type = "button";
  card.setAttribute("aria-label", `Play ${video.title}`);
  card.addEventListener("click", () => openModal(video));

  const thumbnailWrap = document.createElement("div");
  thumbnailWrap.className = "thumbnail-wrap";

  if (video.thumbnail) {
    const image = document.createElement("img");
    image.className = "thumbnail";
    image.src = video.thumbnail;
    image.alt = "";
    image.loading = "lazy";
    thumbnailWrap.appendChild(image);
  } else {
    const fallback = document.createElement("div");
    fallback.className = "thumbnail-fallback";
    fallback.textContent = "Thumbnail unavailable";
    thumbnailWrap.appendChild(fallback);
  }

  const duration = formatDuration(video.duration);
  if (duration) {
    const durationBadge = document.createElement("span");
    durationBadge.className = "duration";
    durationBadge.textContent = duration;
    thumbnailWrap.appendChild(durationBadge);
  }

  const body = document.createElement("div");
  body.className = "card-body";

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = getInitial(video.channel);

  const textWrap = document.createElement("div");

  const title = document.createElement("h3");
  title.className = "video-title";
  title.textContent = video.title;

  const channel = document.createElement("p");
  channel.className = "video-meta";
  channel.textContent = video.channel;

  const meta = document.createElement("p");
  meta.className = "video-meta";
  meta.textContent = `${formatViews(video.views)} views • ${formatPublishedTime(
    video.publishedAt
  )}`;

  textWrap.append(title, channel, meta);
  body.append(avatar, textWrap);
  card.append(thumbnailWrap, body);

  return card;
}

function renderSkeletons(count) {
  if (state.page > 1) return;

  elements.grid.innerHTML = "";
  const fragment = document.createDocumentFragment();

  for (let index = 0; index < count; index += 1) {
    const skeleton = document.createElement("article");
    skeleton.className = "skeleton-card";
    skeleton.innerHTML = `
      <div class="skeleton-thumb"></div>
      <div class="skeleton-info">
        <div class="skeleton-avatar"></div>
        <div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line short"></div>
        </div>
      </div>
    `;
    fragment.appendChild(skeleton);
  }

  elements.grid.appendChild(fragment);
}

function setLoading(isLoading) {
  state.isLoading = isLoading;
  elements.grid.setAttribute("aria-busy", String(isLoading));
  elements.loadMore.disabled = isLoading || !state.hasNextPage;
  elements.loadMore.textContent = isLoading ? "Loading..." : "Load More";
}

function showStatus(message) {
  elements.status.textContent = message;
  elements.status.classList.remove("hidden");
}

function hideStatus() {
  elements.status.textContent = "";
  elements.status.classList.add("hidden");
}

function openModal(video) {
  elements.modalTitle.textContent = video.title;
  elements.player.src = `https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`;
  elements.modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  elements.player.src = "";
  elements.modal.classList.add("hidden");
  document.body.style.overflow = "";
}

function hydrateTheme() {
  const savedTheme = localStorage.getItem("tubelite-theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const shouldUseDark = savedTheme ? savedTheme === "dark" : prefersDark;

  document.documentElement.classList.toggle("dark", shouldUseDark);
  elements.themeToggle.setAttribute("aria-pressed", String(shouldUseDark));
}

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle("dark");
  localStorage.setItem("tubelite-theme", isDark ? "dark" : "light");
  elements.themeToggle.setAttribute("aria-pressed", String(isDark));
}

function formatViews(value) {
  if (!Number.isFinite(value) || value <= 0) return "No";

  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatPublishedTime(dateString) {
  if (!dateString) return "Unknown date";

  const publishedDate = new Date(dateString);
  if (Number.isNaN(publishedDate.getTime())) return "Unknown date";

  const seconds = Math.floor((Date.now() - publishedDate.getTime()) / 1000);
  const units = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];

  for (const [unit, unitSeconds] of units) {
    const interval = Math.floor(seconds / unitSeconds);
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? "s" : ""} ago`;
    }
  }

  return "Just now";
}

function formatDuration(duration) {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "";

  const hours = Number(match[1] || 0);
  const minutes = Number(match[2] || 0);
  const seconds = Number(match[3] || 0);
  const parts = hours
    ? [hours, String(minutes).padStart(2, "0"), String(seconds).padStart(2, "0")]
    : [minutes, String(seconds).padStart(2, "0")];

  return parts.join(":");
}

function getInitial(channelName) {
  return (channelName || "T").trim().charAt(0).toUpperCase();
}
