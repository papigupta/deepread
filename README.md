# 🧠 Deepread

**Deepread** is an immersive reading and thinking app that helps you not just read books — but *understand* them deeply, and apply their insights to your life.

---

## ✨ Core Idea

Reading is easy. Remembering, applying, and growing from what you read? That’s the hard part.

Deepread turns passive reading into an **active learning ritual** — powered by LLMs, personal insight tracking, and daily practice.

---

## 📐 Architecture

Deepread is built with:

| Layer          | Stack / Tool                          |
|----------------|----------------------------------------|
| Frontend       | React Native (Expo)                   |
| UI Framework   | Tamagui / NativeBase                  |
| State Mgmt     | Zustand                               |
| Backend + Auth | Supabase                              |
| Voice Input    | Expo Speech / React Native Voice      |
| Book Data      | Open Library API                      |
| LLM Engine     | OpenAI (GPT-3.5 / GPT-4 Turbo)        |
| Deployment     | Expo EAS                              |

For schema details, see [`architecture.md`](./architecture.md)  
For stack rationale, see [`tech-stack.md`](./tech-stack.md)

---

## 🚧 Current Features (MVP in Progress)

- [x] Local project setup with folder structure
- [x] Supabase schema with Users, Books, Insights, PracticeSessions
- [x] Initial architecture + tech design
- [ ] Book add/search via Open Library
- [ ] LLM-based practice prompt + feedback engine
- [ ] UI for insight tracking + streaks
- [ ] Voice and text input for practice

---

## 🔮 Vision

> “Don't just read the book. Let it change you.”  
> Deepread is your tool for comprehension, application, and personal growth — one insight at a time.

---

## 🧪 Dev Setup

```bash
# install dependencies
yarn install

# start mobile app
cd apps/mobile
expo start --web
```

Supabase: configure your `.env` in `supabase/` with your keys.  
LLM API keys (OpenAI) should be added when prompt engine is implemented.

---

## 🧠 Coming Soon

- Animated visual layer of ideas (glowing neurons 🌐)
- Insight maps from each book
- Daily prompts and spaced repetition
- Creator + community layer

---

## 🔒 License

Private for now. Will open-source parts of it when ready.

---

## 👤 Author

Built by [@papigupta](https://github.com/papigupta)  
Project logs, ideas, and vision are evolving in public. Stay tuned.
