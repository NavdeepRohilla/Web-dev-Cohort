const API_BASE_URL = "https://api.freeapi.app/api/v1/public/randomproducts";
const PAGE_SIZE = 10;

const state = {
  products: [],
  page: 1,
  totalPages: 1,
  isLoading: false,
  hasError: false,
  cartCount: 0,
  selectedProduct: null,
};

const productGrid = document.querySelector("#productGrid");
const loadMoreButton = document.querySelector("#loadMoreButton");
const statusPanel = document.querySelector("#statusPanel");
const searchInput = document.querySelector("#searchInput");
const categoryFilter = document.querySelector("#categoryFilter");
const sortSelect = document.querySelector("#sortSelect");
const cartCount = document.querySelector("#cartCount");
const themeToggle = document.querySelector("#themeToggle");
const modal = document.querySelector("#productModal");
const modalCartButton = document.querySelector("#modalCartButton");

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const fallbackImage = createProductPlaceholderImage();

function getProductList(payload) {
  // FreeAPI nests product arrays as data.data; this keeps the UI resilient if the API shape changes.
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
}

function getPagination(payload) {
  const pagination = payload?.data || {};
  const currentPage = Number(pagination.page) || state.page;
  const totalPages = Number(pagination.totalPages);

  return {
    page: currentPage,
    totalPages: Number.isFinite(totalPages) ? totalPages : state.totalPages,
    nextPage: Boolean(pagination.nextPage),
  };
}

function toSafeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function escapeSvgText(value) {
  return toSafeString(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}

function truncateText(value, maxLength = 28) {
  const text = toSafeString(value);
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}...` : text;
}

function createProductPlaceholderImage(product = {}) {
  const title = escapeSvgText(truncateText(getProductTitle(product) || "Product image"));
  const category = escapeSvgText(truncateText(getProductCategory(product), 18));

  return `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
      <rect width="800" height="600" fill="#eef4f8"/>
      <circle cx="170" cy="140" r="78" fill="#39c7b8" opacity=".22"/>
      <circle cx="635" cy="440" r="118" fill="#0f9f8f" opacity=".14"/>
      <rect x="222" y="142" width="356" height="270" rx="34" fill="#ffffff" stroke="#dce3ea" stroke-width="8"/>
      <path d="M304 238h192l-24 116H328l-24-116z" fill="#dff8f4" stroke="#0f9f8f" stroke-width="16" stroke-linejoin="round"/>
      <path d="M336 238c10-52 36-78 64-78s54 26 64 78" fill="none" stroke="#17202a" stroke-width="18" stroke-linecap="round"/>
      <text x="400" y="480" text-anchor="middle" fill="#17202a" font-family="Arial, sans-serif" font-size="36" font-weight="700">${title}</text>
      <text x="400" y="525" text-anchor="middle" fill="#657083" font-family="Arial, sans-serif" font-size="24" font-weight="700">${category}</text>
    </svg>
  `)}`;
}

function getCurrentDummyJsonImage(product) {
  const title = getProductTitle(product);
  const category = getProductCategory(product);

  if (!title || !category) return "";

  return `https://cdn.dummyjson.com/products/images/${encodeURIComponent(category)}/${encodeURIComponent(title)}/thumbnail.png`;
}

function getProductImageSources(product) {
  const thumbnail = toSafeString(product?.thumbnail);
  const images = Array.isArray(product?.images) ? product.images.map(toSafeString) : [];
  const sources = [
    getCurrentDummyJsonImage(product),
    thumbnail,
    ...images,
    createProductPlaceholderImage(product),
  ];

  return [...new Set(sources.filter(Boolean))];
}

function loadProductImage(imageElement, product) {
  const sources = getProductImageSources(product);
  let sourceIndex = 0;

  imageElement.decoding = "async";
  imageElement.referrerPolicy = "no-referrer";
  imageElement.onerror = () => {
    sourceIndex += 1;

    if (sourceIndex < sources.length) {
      imageElement.src = sources[sourceIndex];
      return;
    }

    imageElement.onerror = null;
    imageElement.src = fallbackImage;
  };

  imageElement.src = sources[sourceIndex] || fallbackImage;
}

function getProductTitle(product) {
  return toSafeString(product?.title) || "Untitled product";
}

function getProductCategory(product) {
  return toSafeString(product?.category) || "General";
}

function getProductPrice(product) {
  return Number.isFinite(Number(product?.price)) ? Number(product.price) : null;
}

function formatPrice(product) {
  const price = getProductPrice(product);
  return price === null ? "Price unavailable" : currencyFormatter.format(price);
}

function showStatus(message, type = "error") {
  statusPanel.textContent = message;
  statusPanel.className = `status-panel ${type === "info" ? "info" : ""}`.trim();
  statusPanel.hidden = false;
}

function hideStatus() {
  statusPanel.hidden = true;
  statusPanel.textContent = "";
}

function renderSkeletonCards(count = 8) {
  // Skeletons make the initial fetch feel responsive while the API is loading.
  const fragment = document.createDocumentFragment();

  for (let index = 0; index < count; index += 1) {
    const card = document.createElement("article");
    card.className = "skeleton-card";
    card.setAttribute("aria-hidden", "true");

    const media = document.createElement("div");
    media.className = "skeleton-media";

    const lines = ["short", "tall", "medium", "short"].map((size) => {
      const line = document.createElement("div");
      line.className = `skeleton-line ${size}`;
      return line;
    });

    card.append(media, ...lines);
    fragment.append(card);
  }

  productGrid.replaceChildren(fragment);
}

async function fetchProducts(page = 1) {
  // Fetch one paginated batch with async/await, then merge it into local UI state.
  state.isLoading = true;
  state.hasError = false;
  updateLoadMoreButton();
  hideStatus();

  if (state.products.length === 0) {
    renderSkeletonCards();
  }

  try {
    const url = new URL(API_BASE_URL);
    url.searchParams.set("page", page);
    url.searchParams.set("limit", PAGE_SIZE);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const payload = await response.json();
    const products = getProductList(payload);
    const pagination = getPagination(payload);

    if (!products.length && state.products.length === 0) {
      showStatus("No products are available right now. Please try again soon.", "info");
    }

    state.products = mergeProducts(state.products, products);
    state.page = pagination.page;
    state.totalPages = pagination.totalPages;

    updateCategoryOptions();
    renderProducts();
  } catch (error) {
    console.error(error);
    state.hasError = true;
    if (state.products.length === 0) {
      productGrid.replaceChildren();
    }
    showStatus("We could not load products. Check your connection and try again.");
  } finally {
    state.isLoading = false;
    updateLoadMoreButton();
  }
}

function mergeProducts(existingProducts, incomingProducts) {
  const productsByKey = new Map();

  [...existingProducts, ...incomingProducts].forEach((product, index) => {
    const key = product?.id ?? `${getProductTitle(product)}-${index}`;
    productsByKey.set(key, product);
  });

  return Array.from(productsByKey.values());
}

function getVisibleProducts() {
  // Search, filter, and sort happen on already-loaded products for instant UI feedback.
  const searchTerm = searchInput.value.trim().toLowerCase();
  const selectedCategory = categoryFilter.value;
  const sortBy = sortSelect.value;

  const filteredProducts = state.products.filter((product) => {
    const title = getProductTitle(product).toLowerCase();
    const category = getProductCategory(product);
    const matchesSearch = title.includes(searchTerm);
    const matchesCategory = selectedCategory === "all" || category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return [...filteredProducts].sort((first, second) => {
    const firstPrice = getProductPrice(first);
    const secondPrice = getProductPrice(second);

    if (firstPrice === null && secondPrice === null) return 0;
    if (firstPrice === null) return 1;
    if (secondPrice === null) return -1;
    if (sortBy === "price-asc") return firstPrice - secondPrice;
    if (sortBy === "price-desc") return secondPrice - firstPrice;
    return 0;
  });
}

function renderProducts() {
  const visibleProducts = getVisibleProducts();
  const fragment = document.createDocumentFragment();

  if (!visibleProducts.length) {
    productGrid.replaceChildren();
    showStatus("No products match your current search or filters.", "info");
    return;
  }

  hideStatus();

  visibleProducts.forEach((product, index) => {
    fragment.append(createProductCard(product, index));
  });

  productGrid.replaceChildren(fragment);
}

function createProductCard(product, index) {
  // Build cards with DOM nodes/textContent so product data is rendered safely.
  const card = document.createElement("article");
  card.className = "product-card";
  card.style.animationDelay = `${Math.min(index * 35, 280)}ms`;

  const imageWrap = document.createElement("div");
  imageWrap.className = "product-image-wrap";

  const image = document.createElement("img");
  image.alt = getProductTitle(product);
  image.loading = "lazy";
  loadProductImage(image, product);

  const body = document.createElement("div");
  body.className = "product-body";

  const meta = document.createElement("div");
  meta.className = "product-meta";

  const category = document.createElement("span");
  category.className = "category-pill";
  category.textContent = getProductCategory(product);

  const rating = document.createElement("span");
  rating.className = "rating";
  const ratingValue = Number(product?.rating);
  rating.textContent = Number.isFinite(ratingValue) ? `★ ${ratingValue.toFixed(1)}` : "New";

  const title = document.createElement("h2");
  title.className = "product-title";
  title.textContent = getProductTitle(product);

  const priceRow = document.createElement("div");
  priceRow.className = "price-row";

  const price = document.createElement("span");
  price.className = "price";
  price.textContent = formatPrice(product);

  const stock = document.createElement("span");
  stock.className = "stock";
  const stockValue = Number(product?.stock);
  stock.textContent = Number.isFinite(stockValue)
    ? stockValue > 0
      ? `${stockValue} in stock`
      : "Out of stock"
    : "Stock n/a";

  const actions = document.createElement("div");
  actions.className = "card-actions";

  const detailsButton = document.createElement("button");
  detailsButton.className = "secondary-button";
  detailsButton.type = "button";
  detailsButton.textContent = "View Details";
  detailsButton.addEventListener("click", () => openProductModal(product));

  const cartButton = document.createElement("button");
  cartButton.className = "primary-button";
  cartButton.type = "button";
  cartButton.textContent = "Add to Cart";
  cartButton.addEventListener("click", () => addToCart());

  imageWrap.append(image);
  meta.append(category, rating);
  priceRow.append(price, stock);
  actions.append(detailsButton, cartButton);
  body.append(meta, title, priceRow, actions);
  card.append(imageWrap, body);

  return card;
}

function updateCategoryOptions() {
  // Categories are derived from loaded products, so the filter grows with each page.
  const currentValue = categoryFilter.value;
  const categories = [...new Set(state.products.map(getProductCategory))].sort((a, b) =>
    a.localeCompare(b),
  );

  categoryFilter.replaceChildren(new Option("All categories", "all"));

  categories.forEach((category) => {
    categoryFilter.append(new Option(category, category));
  });

  categoryFilter.value = categories.includes(currentValue) ? currentValue : "all";
}

function updateLoadMoreButton() {
  const hasMorePages = state.page < state.totalPages;
  const canRetry = state.hasError && state.products.length === 0;

  loadMoreButton.disabled = state.isLoading || (!hasMorePages && !canRetry);
  loadMoreButton.textContent = state.isLoading
    ? "Loading..."
    : canRetry
      ? "Try Again"
      : hasMorePages
      ? "Load More Products"
      : "All Products Loaded";
}

function addToCart() {
  state.cartCount += 1;
  cartCount.textContent = state.cartCount;
}

function openProductModal(product) {
  state.selectedProduct = product;

  const modalImage = document.querySelector("#modalImage");
  modalImage.alt = getProductTitle(product);
  loadProductImage(modalImage, product);

  const brand = toSafeString(product?.brand);
  document.querySelector("#modalCategory").textContent =
    `${getProductCategory(product)}${brand ? ` • ${brand}` : ""}`;
  document.querySelector("#modalTitle").textContent = getProductTitle(product);
  document.querySelector("#modalDescription").textContent =
    toSafeString(product?.description) || "No description is available for this product.";
  document.querySelector("#modalPrice").textContent = formatPrice(product);
  const ratingValue = Number(product?.rating);
  const stockValue = Number(product?.stock);

  document.querySelector("#modalRating").textContent = Number.isFinite(ratingValue)
    ? `${ratingValue.toFixed(1)} / 5`
    : "Not rated";
  document.querySelector("#modalStock").textContent = Number.isFinite(stockValue)
    ? stockValue
    : "n/a";

  modal.hidden = false;
  document.body.style.overflow = "hidden";
  modalCartButton.focus();
}

function closeProductModal() {
  modal.hidden = true;
  document.body.style.overflow = "";
  state.selectedProduct = null;
}

function applySavedTheme() {
  const savedTheme = localStorage.getItem("shopgrid-theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const useDarkMode = savedTheme ? savedTheme === "dark" : prefersDark;

  document.body.classList.toggle("dark-mode", useDarkMode);
  themeToggle.querySelector("span").textContent = useDarkMode ? "☀" : "☾";
}

function toggleTheme() {
  const useDarkMode = !document.body.classList.contains("dark-mode");
  document.body.classList.toggle("dark-mode", useDarkMode);
  localStorage.setItem("shopgrid-theme", useDarkMode ? "dark" : "light");
  themeToggle.querySelector("span").textContent = useDarkMode ? "☀" : "☾";
}

loadMoreButton.addEventListener("click", () => {
  if (state.isLoading) return;

  if (state.hasError && state.products.length === 0) {
    fetchProducts(state.page);
  } else if (state.page < state.totalPages) {
    fetchProducts(state.page + 1);
  }
});

searchInput.addEventListener("input", renderProducts);
categoryFilter.addEventListener("change", renderProducts);
sortSelect.addEventListener("change", renderProducts);
themeToggle.addEventListener("click", toggleTheme);
modalCartButton.addEventListener("click", addToCart);

modal.addEventListener("click", (event) => {
  if (event.target.matches("[data-close-modal]")) {
    closeProductModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modal.hidden) {
    closeProductModal();
  }
});

applySavedTheme();
fetchProducts();
