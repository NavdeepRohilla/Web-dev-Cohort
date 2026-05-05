const API_URL = "https://api.freeapi.app/api/v1/public/cats/cat/random";

const imageStage = document.getElementById("image-stage");
const catImage = document.getElementById("cat-image");
const breedLabel = document.getElementById("breed-label");
const refreshButton = document.getElementById("refresh-button");
const errorMessage = document.getElementById("error-message");
const statusText = document.getElementById("status-text");

const state = {
  hasLoadedImage: false,
  isLoading: false,
};

function setLoading(isLoading) {
  state.isLoading = isLoading;
  imageStage.classList.toggle("loading", isLoading);
  imageStage.setAttribute("aria-busy", String(isLoading));
  refreshButton.disabled = isLoading;
  refreshButton.textContent = isLoading ? "Loading..." : "Show Another Cat";
  statusText.textContent = state.hasLoadedImage
    ? "Finding another cat..."
    : "Fetching a cat...";
}

function showError(message) {
  errorMessage.hidden = false;
  errorMessage.textContent = message;
  imageStage.classList.add("error-state");
}

function clearError() {
  errorMessage.hidden = true;
  errorMessage.textContent = "";
  imageStage.classList.remove("error-state");
}

function getImageUrl(payload) {
  const data = payload?.data;
  const candidates = [
    data?.image,
    data?.image?.url,
    data?.url,
    data?.imageUrl,
    data?.image_url,
    data?.media?.url,
    data?.file?.url,
  ];

  return (
    candidates.find(
      (value) => typeof value === "string" && value.trim().length > 0
    ) || ""
  );
}

function getBreedName(payload) {
  return payload?.data?.name || "Random Cat";
}

function preloadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(src);
    image.onerror = () => reject(new Error("Image failed to load."));
    image.src = src;
  });
}

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function swapImage(imageUrl, breedName) {
  if (state.hasLoadedImage) {
    catImage.classList.remove("is-visible");
    await wait(150);
  }

  catImage.src = imageUrl;
  catImage.alt = `${breedName} cat`;
  breedLabel.textContent = `Meet ${breedName}`;

  window.requestAnimationFrame(() => {
    catImage.classList.add("is-visible");
    imageStage.classList.add("has-image");
  });

  state.hasLoadedImage = true;
}

async function fetchCat() {
  if (state.isLoading) {
    return;
  }

  setLoading(true);
  clearError();

  try {
    const response = await fetch(API_URL, {
      headers: {
        accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const payload = await response.json();

    if (!payload?.success) {
      throw new Error(payload?.message || "API returned an invalid response.");
    }

    const imageUrl = getImageUrl(payload);
    const breedName = getBreedName(payload);

    if (!imageUrl) {
      throw new Error("No cat image URL was found in the response.");
    }

    await preloadImage(imageUrl);
    await swapImage(imageUrl, breedName);
  } catch (error) {
    console.error("CatSnap error:", error);
    showError("Could not load a cat right now. Please try again.");
    if (!state.hasLoadedImage) {
      breedLabel.textContent = "Still waiting for a cat cameo...";
    }
  } finally {
    setLoading(false);
  }
}

refreshButton.addEventListener("click", fetchCat);
window.addEventListener("DOMContentLoaded", fetchCat);
