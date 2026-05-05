const API_URL = "https://api.freeapi.app/api/v1/public/meals";

class MealsApp {
  constructor() {
    this.meals = [];
    this.filteredMeals = [];
    this.favoriteIds = new Set();
    this.activeMeal = null;

    this.elements = {
      searchInput: document.querySelector("#searchInput"),
      mealsGrid: document.querySelector("#mealsGrid"),
      loadingState: document.querySelector("#loadingState"),
      errorState: document.querySelector("#errorState"),
      errorMessage: document.querySelector("#errorMessage"),
      emptyState: document.querySelector("#emptyState"),
      retryButton: document.querySelector("#retryButton"),
      mealCount: document.querySelector("#mealCount"),
      resultCount: document.querySelector("#resultCount"),
      cardTemplate: document.querySelector("#mealCardTemplate"),
      modal: document.querySelector("#mealModal"),
      modalImage: document.querySelector("#modalImage"),
      modalTitle: document.querySelector("#modalTitle"),
      modalMeta: document.querySelector("#modalMeta"),
      modalInstructions: document.querySelector("#modalInstructions"),
      modalIngredients: document.querySelector("#modalIngredients"),
      modalCloseButton: document.querySelector("#modalCloseButton"),
      modalFavoriteButton: document.querySelector("#modalFavoriteButton"),
    };
  }

  init() {
    this.bindEvents();
    this.loadFavorites();
    this.fetchMeals();
  }

  bindEvents() {
    this.elements.searchInput.addEventListener("input", (event) => {
      this.filterMeals(event.target.value);
    });

    this.elements.retryButton.addEventListener("click", () => {
      this.fetchMeals();
    });

    this.elements.mealsGrid.addEventListener("click", (event) => {
      const card = event.target.closest(".meal-card");

      if (!card) {
        return;
      }

      const { mealId } = card.dataset;
      const meal = this.meals.find((item) => item.idMeal === mealId);

      if (!meal) {
        return;
      }

      if (event.target.closest(".favorite-button")) {
        this.toggleFavorite(meal.idMeal);
        return;
      }

      if (event.target.closest(".meal-card__details")) {
        this.openModal(meal);
      }
    });

    this.elements.modal.addEventListener("click", (event) => {
      if (event.target.closest("[data-close-modal='true']")) {
        this.closeModal();
      }
    });

    this.elements.modalCloseButton.addEventListener("click", () => {
      this.closeModal();
    });

    this.elements.modalFavoriteButton.addEventListener("click", () => {
      if (this.activeMeal) {
        this.toggleFavorite(this.activeMeal.idMeal);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !this.elements.modal.classList.contains("hidden")) {
        this.closeModal();
      }
    });
  }

  async fetchMeals() {
    this.showLoading();

    try {
      const initialResponse = await this.fetchPage(1);
      const firstPageMeals = initialResponse.data?.data ?? [];
      const totalPages = initialResponse.data?.totalPages ?? 1;

      const requests = [];

      for (let page = 2; page <= totalPages; page += 1) {
        requests.push(this.fetchPage(page));
      }

      const settledResponses = await Promise.allSettled(requests);
      const additionalMeals = settledResponses
        .filter((result) => result.status === "fulfilled")
        .flatMap((result) => result.value.data?.data ?? []);

      this.meals = [...firstPageMeals, ...additionalMeals];
      this.filterMeals(this.elements.searchInput.value);
      this.showGrid();
    } catch (error) {
      const message =
        error instanceof TypeError
          ? "Unable to reach the meals API. Please check your connection and try again."
          : error.message;

      this.showError(message);
    }
  }

  async fetchPage(page) {
    const response = await fetch(`${API_URL}?page=${page}&limit=10`);

    if (!response.ok) {
      throw new Error("The meals service is unavailable right now.");
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Unable to fetch meals.");
    }

    return result;
  }

  filterMeals(query) {
    const normalizedQuery = query.trim().toLowerCase();

    this.filteredMeals = this.meals.filter((meal) =>
      meal.strMeal.toLowerCase().includes(normalizedQuery)
    );

    this.renderMeals();
    this.updateStats();
    this.toggleEmptyState();
  }

  renderMeals() {
    this.elements.mealsGrid.innerHTML = "";

    const fragment = document.createDocumentFragment();

    this.filteredMeals.forEach((meal, index) => {
      const card = this.elements.cardTemplate.content.firstElementChild.cloneNode(true);
      card.dataset.mealId = meal.idMeal;
      card.style.animationDelay = `${Math.min(index * 40, 220)}ms`;

      const image = card.querySelector(".meal-card__image");
      const title = card.querySelector(".meal-card__title");
      const category = card.querySelector(".meal-card__category");
      const area = card.querySelector(".meal-card__area");
      const instructions = card.querySelector(".meal-card__instructions");
      const favoriteButton = card.querySelector(".favorite-button");

      image.src = meal.strMealThumb;
      image.alt = meal.strMeal;
      title.textContent = meal.strMeal;
      category.textContent = meal.strCategory || "Uncategorized";
      area.textContent = meal.strArea || "Global";
      instructions.textContent = this.sanitizeInstructions(meal.strInstructions, 140);

      this.syncFavoriteButton(favoriteButton, meal.idMeal);
      fragment.appendChild(card);
    });

    this.elements.mealsGrid.appendChild(fragment);
    this.toggleEmptyState();
  }

  openModal(meal) {
    this.activeMeal = meal;
    this.elements.modalImage.src = meal.strMealThumb;
    this.elements.modalImage.alt = meal.strMeal;
    this.elements.modalTitle.textContent = meal.strMeal;
    this.elements.modalMeta.textContent = `${meal.strCategory || "Uncategorized"} • ${
      meal.strArea || "Global"
    } cuisine`;
    this.elements.modalInstructions.textContent = this.formatInstructions(
      meal.strInstructions
    );

    this.renderIngredients(meal);
    this.syncFavoriteButton(this.elements.modalFavoriteButton, meal.idMeal);

    this.elements.modal.classList.remove("hidden");
    document.body.classList.add("modal-open");
  }

  closeModal() {
    this.activeMeal = null;
    this.elements.modal.classList.add("hidden");
    document.body.classList.remove("modal-open");
  }

  renderIngredients(meal) {
    this.elements.modalIngredients.innerHTML = "";
    const fragment = document.createDocumentFragment();

    for (let index = 1; index <= 20; index += 1) {
      const ingredient = meal[`strIngredient${index}`]?.trim();
      const measure = meal[`strMeasure${index}`]?.trim();

      if (ingredient) {
        const listItem = document.createElement("li");
        const ingredientName = document.createElement("strong");
        const ingredientMeasure = document.createElement("span");

        ingredientName.textContent = ingredient;
        ingredientMeasure.textContent = measure || "As needed";

        listItem.append(ingredientName, ingredientMeasure);
        fragment.appendChild(listItem);
      }
    }

    this.elements.modalIngredients.appendChild(fragment);
  }

  toggleFavorite(mealId) {
    if (this.favoriteIds.has(mealId)) {
      this.favoriteIds.delete(mealId);
    } else {
      this.favoriteIds.add(mealId);
    }

    this.persistFavorites();
    this.refreshFavoriteButtons(mealId);
  }

  refreshFavoriteButtons(mealId) {
    const buttons = document.querySelectorAll(
      `.meal-card[data-meal-id="${mealId}"] .favorite-button`
    );

    buttons.forEach((button) => this.syncFavoriteButton(button, mealId));

    if (this.activeMeal?.idMeal === mealId) {
      this.syncFavoriteButton(this.elements.modalFavoriteButton, mealId);
    }
  }

  syncFavoriteButton(button, mealId) {
    const isFavorite = this.favoriteIds.has(mealId);
    button.classList.toggle("is-favorite", isFavorite);
    button.setAttribute("aria-pressed", String(isFavorite));
    button.querySelector("span[aria-hidden='true']").textContent = isFavorite ? "♥" : "♡";
  }

  updateStats() {
    this.elements.mealCount.textContent = String(this.meals.length);
    this.elements.resultCount.textContent = String(this.filteredMeals.length);
  }

  showLoading() {
    this.elements.loadingState.classList.remove("hidden");
    this.elements.errorState.classList.add("hidden");
    this.elements.emptyState.classList.add("hidden");
    this.elements.mealsGrid.classList.add("hidden");
  }

  showGrid() {
    this.elements.loadingState.classList.add("hidden");
    this.elements.errorState.classList.add("hidden");
    this.elements.mealsGrid.classList.remove("hidden");
    this.toggleEmptyState();
  }

  showError(message) {
    this.elements.loadingState.classList.add("hidden");
    this.elements.mealsGrid.classList.add("hidden");
    this.elements.emptyState.classList.add("hidden");
    this.elements.errorMessage.textContent = message;
    this.elements.errorState.classList.remove("hidden");
  }

  toggleEmptyState() {
    const shouldShowEmpty = this.filteredMeals.length === 0;
    this.elements.emptyState.classList.toggle("hidden", !shouldShowEmpty);
    this.elements.mealsGrid.classList.toggle("hidden", shouldShowEmpty);
  }

  sanitizeInstructions(text, maxLength) {
    const cleanedText = (text || "Instructions are not available for this meal.")
      .replace(/\s+/g, " ")
      .trim();

    if (cleanedText.length <= maxLength) {
      return cleanedText;
    }

    return `${cleanedText.slice(0, maxLength).trimEnd()}...`;
  }

  formatInstructions(text) {
    return (text || "Instructions are not available for this meal.")
      .replace(/\r/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  loadFavorites() {
    try {
      const storedFavorites = localStorage.getItem("midnight-meals-favorites");

      if (!storedFavorites) {
        return;
      }

      this.favoriteIds = new Set(JSON.parse(storedFavorites));
    } catch {
      this.favoriteIds = new Set();
    }
  }

  persistFavorites() {
    try {
      localStorage.setItem(
        "midnight-meals-favorites",
        JSON.stringify([...this.favoriteIds])
      );
    } catch {
      // Ignore storage write failures and keep the UI responsive.
    }
  }
}

const app = new MealsApp();
app.init();
