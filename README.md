# 🧭 Personal Goals Assistant

An interactive **AI-powered web app** that helps users turn personal goals into structured, actionable plans.  

The frontend is lightweight (HTML, CSS, JavaScript) and can connect to a backend API for **LLM-based plan generation** and **persistent storage**.

---

## ✨ Features
- Add, edit, and delete personal goals
- Track progress visually in a clean UI
- Optional backend integration for AI-driven planning
- Simple, frontend-only deployment possible

---

## ⚙️ Configuration

The frontend can call a backend API for persistent storage and AI-driven plan generation.  
Check `app.js` for configuration (e.g., `API_BASE_URL`).

**Suggested config options:**

- `API_BASE_URL` — backend base URL (e.g., `https://<your-vercel-backend>.vercel.app/api`)  
- `USE_LOCAL_STORAGE` — toggle to use browser `localStorage` (for testing only — this won’t replace the AI backend)

> **Note:** Without the backend, localStorage fallback will only persist raw goals; it **will not generate AI plans**.

---

## 🏗 Architecture

```text
┌──────────────────────────┐
│        UI Layer          │
│  (index.html, styles.css)│
│  - Goal list             │
│  - Input form            │
│  - Progress view         │
└─────────────┬────────────┘
              │
              ▼
┌──────────────────────────┐
│   Application Logic      │
│        (app.js)          │
│  - Render functions      │
│  - Event handlers        │
│  - Storage (API/local)   │
└─────────────┬────────────┘
              │
              ▼
┌----────────────────────-─┐
│        Backend API       │ (Vercel)
│      Persistent storage  │
│      LLM integration     │
└────────────────────------┘
```
## 🧑‍💻 Development

Keep logic modular in `app.js`:

- **UI render functions** (e.g., `renderGoalList`)
- **Storage layer** (API vs localStorage)
- **Event handlers** (add / edit / delete)

### Recommended Enhancements
- Add `config.js` for API settings
- Add linting (**ESLint**) + formatting (**Prettier**)

## 🧪 Testing

### Manual Testing
- Add goals, mark complete, refresh page (check persistence)

### Unit Testing
- Extract pure functions and test with **Jest**

### Integration Testing
- Mock backend API calls for tests

## 🌍 Deployment

This app is static — deploy anywhere:

- **GitHub Pages**
- **Netlify**
- **Vercel**
- Any static hosting service

> If paired with a backend, deploy backend separately (e.g., Vercel functions).

## 🛠 Troubleshooting

| Issue | Solution |
|-------|----------|
| **Goals don't persist after refresh** | Check backend URL in `app.js` or verify localStorage is enabled |
| **Style issues** | Ensure `styles.css` is linked in `index.html` |
| **CORS errors** | Backend must allow your frontend origin |

## 🗺 Roadmap

- [ ] Add authentication for private goals
- [ ] Local persistence using `localStorage` (fallback mode)
- [ ] Support categories, due dates, and reminders
- [ ] Add progress analytics (weekly/monthly)
- [ ] Import/export goals (JSON)
- [ ] Improve accessibility & mobile UX

## 🤝 Contributing

1. **Fork the repo**
2. **Create a feature branch**
   ```bash
   git checkout -b feat/your-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m "feat: add new feature"
   ```
4. **Push to your fork**
   ```bash
   git push origin feat/your-feature
   ```
5. **Open a Pull Request**

## 📜 License

Licensed under the **MIT License**.  
See `LICENSE` for details.

## 📬 Contact

Created by **@mrme77**.  
Contributions, issues, and feature requests are welcome!
```

