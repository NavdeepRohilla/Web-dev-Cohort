import { useEffect, useState } from "react";

const API_ENDPOINT = "https://api.freeapi.app/api/v1/public/randomusers";
const THEME_STORAGE_KEY = "userdeck-theme";

const initialMeta = {
  page: 1,
  limit: 10,
  totalPages: 1,
  totalItems: 0,
  currentPageItems: 0,
  nextPage: false,
  previousPage: false,
};

function getInitialTheme() {
  if (typeof window === "undefined") {
    return "dark";
  }

  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

  if (savedTheme === "dark" || savedTheme === "light") {
    return savedTheme;
  }

  return "dark";
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(dateString));
}

function formatAddress(user) {
  const { street, city, state, country, postcode } = user.location;
  return `${street.number} ${street.name}, ${city}, ${state}, ${country} ${postcode}`;
}

function getVisiblePages(currentPage, totalPages) {
  const candidates = [1, currentPage - 1, currentPage, currentPage + 1, totalPages]
    .filter((page) => page >= 1 && page <= totalPages)
    .filter((page, index, all) => all.indexOf(page) === index)
    .sort((left, right) => left - right);

  const pages = [];

  candidates.forEach((page, index) => {
    if (index > 0 && page - candidates[index - 1] > 1) {
      pages.push("ellipsis");
    }

    pages.push(page);
  });

  return pages;
}

function StatCard({ label, value, helper }) {
  return (
    <article className="stat-card">
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
      <span className="stat-helper">{helper}</span>
    </article>
  );
}

function ThemeToggle({ theme, onChange }) {
  return (
    <div className="theme-control">
      <span>Theme</span>
      <div className="theme-toggle" role="group" aria-label="Color theme">
        {["dark", "light"].map((option) => (
          <button
            key={option}
            type="button"
            className={`theme-option ${theme === option ? "is-active" : ""}`}
            onClick={() => onChange(option)}
            aria-pressed={theme === option}
          >
            {option === "dark" ? "Dark" : "Light"}
          </button>
        ))}
      </div>
    </div>
  );
}

function UserCard({ user, isActive, onSelect }) {
  return (
    <button
      type="button"
      className={`user-card ${isActive ? "is-active" : ""}`}
      onClick={onSelect}
      aria-pressed={isActive}
    >
      <div className="user-card__top">
        <img
          className="user-card__avatar"
          src={user.picture.large}
          alt={`${user.name.first} ${user.name.last}`}
        />
        <div className="user-card__identity">
          <span className="badge badge-soft">{user.nat}</span>
          <h3>{`${user.name.title} ${user.name.first} ${user.name.last}`}</h3>
          <p>@{user.login.username}</p>
        </div>
      </div>

      <dl className="user-card__meta">
        <div>
          <dt>Email</dt>
          <dd>{user.email}</dd>
        </div>
        <div>
          <dt>Phone</dt>
          <dd>{user.phone}</dd>
        </div>
        <div>
          <dt>Location</dt>
          <dd>{`${user.location.city}, ${user.location.country}`}</dd>
        </div>
      </dl>

      <div className="user-card__footer">
        <span className="badge">{user.gender}</span>
        <span className="badge">{`${user.dob.age} yrs`}</span>
      </div>
    </button>
  );
}

function SkeletonCard() {
  return (
    <article className="user-card user-card--skeleton" aria-hidden="true">
      <div className="user-card__top">
        <div className="skeleton skeleton-avatar" />
        <div className="skeleton-stack">
          <div className="skeleton skeleton-line skeleton-line--short" />
          <div className="skeleton skeleton-line" />
        </div>
      </div>
      <div className="skeleton-stack skeleton-stack--spaced">
        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-line skeleton-line--medium" />
      </div>
    </article>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="detail-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Spotlight({ user }) {
  if (!user) {
    return (
      <aside className="spotlight-card spotlight-card--empty">
        <p className="eyebrow">Profile Preview</p>
        <h2>Select a user card</h2>
        <p>
          Click any profile in the directory to inspect contact details, address, account metadata,
          and timezone information from the API response.
        </p>
      </aside>
    );
  }

  return (
    <aside className="spotlight-card">
      <div className="spotlight-card__hero">
        <div>
          <p className="eyebrow">Selected Profile</p>
          <h2>{`${user.name.first} ${user.name.last}`}</h2>
          <p className="spotlight-subtitle">{`${user.location.city}, ${user.location.country}`}</p>
        </div>
        <img
          className="spotlight-card__avatar"
          src={user.picture.large}
          alt={`${user.name.first} ${user.name.last}`}
        />
      </div>

      <div className="spotlight-grid">
        <section className="spotlight-section">
          <div className="section-title">
            <h3>Identity</h3>
            <span className="badge badge-soft">{user.nat}</span>
          </div>
          <DetailRow label="Gender" value={user.gender} />
          <DetailRow label="Age" value={`${user.dob.age} years`} />
          <DetailRow label="Birthday" value={formatDate(user.dob.date)} />
          <DetailRow label="Username" value={`@${user.login.username}`} />
        </section>

        <section className="spotlight-section">
          <div className="section-title">
            <h3>Contact</h3>
          </div>
          <DetailRow label="Email" value={user.email} />
          <DetailRow label="Phone" value={user.phone} />
          <DetailRow label="Cell" value={user.cell} />
        </section>

        <section className="spotlight-section">
          <div className="section-title">
            <h3>Location</h3>
          </div>
          <DetailRow label="Address" value={formatAddress(user)} />
          <DetailRow label="Timezone" value={user.location.timezone.description} />
          <DetailRow label="UTC Offset" value={user.location.timezone.offset} />
          <DetailRow
            label="Coordinates"
            value={`${user.location.coordinates.latitude}, ${user.location.coordinates.longitude}`}
          />
        </section>

        <section className="spotlight-section">
          <div className="section-title">
            <h3>Account</h3>
          </div>
          <DetailRow label="Member Since" value={formatDate(user.registered.date)} />
          <DetailRow label="Years Registered" value={`${user.registered.age}`} />
          <DetailRow label="User ID" value={`${user.id}`} />
          <DetailRow label="UUID" value={user.login.uuid} />
        </section>
      </div>
    </aside>
  );
}

function App() {
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState(initialMeta);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [theme, setTheme] = useState(getInitialTheme);
  const [selectedId, setSelectedId] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchUsers() {
      setError("");

      if (users.length === 0) {
        setStatus("loading");
      } else {
        setIsRefreshing(true);
      }

      try {
        const response = await fetch(`${API_ENDPOINT}?page=${page}&limit=${limit}`, {
          headers: {
            accept: "application/json",
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message || "Unable to load users.");
        }

        const payload = result.data;
        const nextUsers = payload.data || [];

        setUsers(nextUsers);
        setMeta({
          page: payload.page,
          limit: payload.limit,
          totalPages: payload.totalPages,
          totalItems: payload.totalItems,
          currentPageItems: payload.currentPageItems,
          nextPage: Boolean(payload.nextPage),
          previousPage: Boolean(payload.previousPage),
        });
        setSelectedId((currentId) => {
          if (nextUsers.some((user) => user.login.uuid === currentId)) {
            return currentId;
          }

          return nextUsers[0]?.login.uuid ?? null;
        });
        setStatus("success");
      } catch (fetchError) {
        if (fetchError.name === "AbortError") {
          return;
        }

        setError(fetchError.message || "Something went wrong while loading users.");
        setStatus("error");
      } finally {
        setIsRefreshing(false);
      }
    }

    fetchUsers();

    return () => controller.abort();
  }, [page, limit, refreshKey]);

  const selectedUser = users.find((user) => user.login.uuid === selectedId) ?? users[0] ?? null;
  const averageAge = users.length
    ? Math.round(users.reduce((sum, user) => sum + user.dob.age, 0) / users.length)
    : 0;
  const countriesOnPage = new Set(users.map((user) => user.location.country)).size;
  const visiblePages = getVisiblePages(meta.page, meta.totalPages);
  const selectedLocation = selectedUser
    ? `${selectedUser.location.city}, ${selectedUser.location.country}`
    : "Awaiting selection";

  return (
    <div className="app-shell">
      <div className="ambient ambient--one" />
      <div className="ambient ambient--two" />

      <main className="app-frame">
        <header className="hero-panel">
          <section className="hero-copy">
            <p className="eyebrow">Random Users API Explorer</p>
            <h1>Dark-first people directory with a polished light mode built in.</h1>
            <p className="hero-description">
              This interface reads the nested Random Users payload and turns it into a responsive
              people directory with profile cards, drill-down details, theme switching, and
              pagination support.
            </p>
            <div className="hero-meta">
              <span className="meta-pill">{theme === "dark" ? "Dark mode active" : "Light mode active"}</span>
              <span className="meta-pill">{selectedLocation}</span>
              <span className="meta-pill">{meta.totalItems ? `${meta.totalItems} total profiles` : "API-backed directory"}</span>
            </div>
          </section>

          <section className="stats-grid">
            <StatCard
              label="Total Profiles"
              value={meta.totalItems || "--"}
              helper="Reported by the API payload."
            />
            <StatCard
              label="Profiles on Page"
              value={meta.currentPageItems || users.length || "--"}
              helper={`Page ${meta.page} of ${meta.totalPages}`}
            />
            <StatCard
              label="Countries Here"
              value={countriesOnPage || "--"}
              helper={`Average age: ${averageAge || "--"}`}
            />
          </section>
        </header>

        <section className="toolbar">
          <div className="toolbar-copy">
            <p className="toolbar-label">Directory Controls</p>
            <h2>User Deck</h2>
            <p className="toolbar-note">
              Switch the theme, tune the page size, and refresh the dataset whenever you want a new
              pass through the directory.
            </p>
          </div>

          <div className="toolbar-actions">
            <ThemeToggle theme={theme} onChange={setTheme} />

            <label className="select-field">
              <span>Profiles per page</span>
              <select
                value={limit}
                onChange={(event) => {
                  setPage(1);
                  setLimit(Number(event.target.value));
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </label>

            <button type="button" className="refresh-button" onClick={() => setRefreshKey((key) => key + 1)}>
              Refresh Data
            </button>
          </div>
        </section>

        {status === "error" ? (
          <section className="feedback-card">
            <p className="eyebrow">Request Failed</p>
            <h2>We couldn&apos;t load the user directory.</h2>
            <p>{error}</p>
            <button type="button" className="refresh-button" onClick={() => setRefreshKey((key) => key + 1)}>
              Try Again
            </button>
          </section>
        ) : (
          <section className="content-layout">
            <section className="directory-panel">
              <div className="panel-header">
                <div>
                  <p className="toolbar-label">Loaded from FreeAPI</p>
                  <h2>Profiles</h2>
                </div>
                {isRefreshing ? <span className="sync-pill">Syncing...</span> : null}
              </div>

              {status === "loading" ? (
                <div className="user-grid">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <SkeletonCard key={index} />
                  ))}
                </div>
              ) : users.length === 0 ? (
                <div className="empty-state">
                  <h3>No users found</h3>
                  <p>The API returned an empty page for this request.</p>
                </div>
              ) : (
                <>
                  <div className="user-grid">
                    {users.map((user) => (
                      <UserCard
                        key={user.login.uuid}
                        user={user}
                        isActive={selectedUser?.login.uuid === user.login.uuid}
                        onSelect={() => setSelectedId(user.login.uuid)}
                      />
                    ))}
                  </div>

                  <nav className="pagination" aria-label="Pagination">
                    <button
                      type="button"
                      className="pagination-button"
                      onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                      disabled={!meta.previousPage}
                    >
                      Previous
                    </button>

                    <div className="pagination-pages">
                      {visiblePages.map((item, index) =>
                        item === "ellipsis" ? (
                          <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                            ...
                          </span>
                        ) : (
                          <button
                            key={item}
                            type="button"
                            className={`pagination-page ${item === meta.page ? "is-current" : ""}`}
                            onClick={() => setPage(item)}
                          >
                            {item}
                          </button>
                        ),
                      )}
                    </div>

                    <button
                      type="button"
                      className="pagination-button"
                      onClick={() => setPage((currentPage) => Math.min(meta.totalPages, currentPage + 1))}
                      disabled={!meta.nextPage}
                    >
                      Next
                    </button>
                  </nav>
                </>
              )}
            </section>

            <Spotlight user={selectedUser} />
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
