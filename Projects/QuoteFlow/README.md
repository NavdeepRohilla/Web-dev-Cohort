# QuoteFlow

Simple vanilla JS app that displays quotes from https://api.freeapi.app/api/v1/public/quotes

Run locally:

```bash
cd /path/to/QuoteFlow
python3 -m http.server 8000
# then open http://localhost:8000
```

Features
- Fetches quotes with async/await
- Grid layout with responsive columns
- Load more button (also supports infinite scroll-ish behavior)
- Search (client-side)
- Copy quote to clipboard
- Favorite quotes saved to `localStorage`
- Dark mode toggle

If the app shows "Running from file://" error, start a local server as above.
