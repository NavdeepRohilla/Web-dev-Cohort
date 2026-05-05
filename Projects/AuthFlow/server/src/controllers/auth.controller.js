import { forwardToFreeApi } from "../services/freeApi.service.js";

export function registerUser(req, res, next) {
  forwardToFreeApi(req, res, next, {
    method: "POST",
    path: "/register",
    successMessage: "Registration successful",
  });
}

export function loginUser(req, res, next) {
  forwardToFreeApi(req, res, next, {
    method: "POST",
    path: "/login",
    successMessage: "Login successful",
  });
}

export function logoutUser(req, res, next) {
  forwardToFreeApi(req, res, next, {
    method: "POST",
    path: "/logout",
    successMessage: "Logout successful",
  });
}

export function getCurrentUser(req, res, next) {
  forwardToFreeApi(req, res, next, {
    method: "GET",
    path: "/current-user",
    successMessage: "Current user fetched",
  });
}
