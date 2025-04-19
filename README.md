# 🧠 Deepread

**Deepread** is an immersive reading and thinking app that helps you not just read books — but *understand* them deeply, and apply their insights to your life.

## 📖 Quick Start

```bash
# Install dependencies
yarn install

# Start mobile app
cd apps/mobile
expo start

# Start backend server
cd deepread-backend
npm start
```

## 📚 Documentation

All project documentation is available in the [`documentation`](./documentation) folder:

- [Setup Guide](./documentation/setup-guide.md)
- [Architecture](./documentation/architecture.md)
- [API Reference](./documentation/api-reference.md)
- [Full Documentation Index](./documentation/README.md)

## 🔮 Vision

> "Don't just read the book. Let it change you."

Deepread transforms passive reading into an active learning ritual — powered by LLMs, personal insight tracking, and daily practice.

## 👤 Author

Built by [@papigupta](https://github.com/papigupta)

## Dynamic Practice Questions

The app now supports generating practice questions for each concept based on its assigned depth level:

- Level 1: Recall, recognize, or identify the idea
- Level 2: Reframe, explain it in their own words  
- Level 3: Apply, use it in real-life context
- Level 4: Contrast, compare it with other ideas
- Level 5: Critique, evaluate its flaws or limitations
- Level 6: Remix, combine it with other models or frameworks

When you click the "Practice" button next to any concept, the app will:

1. Generate 3 tailored questions using OpenAI's API
2. Present those questions to you in a modal
3. Allow you to input answers to each question
4. Store your responses (implementation pending)

The question generation pipeline:
- Takes a concept and its depth_target
- Builds a JSON payload with context (concept, depth, book title, related concepts, mental models)
- Sends this to OpenAI's API with system prompts and examples
- Gets back structured question responses
- Caches the results (implementation pending)
