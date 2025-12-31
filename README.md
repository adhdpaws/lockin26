<div align="center">

<img src="assets/icon.png" alt="LockIn Logo" width="120" />

# LockIn

**One Year. One Goal.**

A psychology-first goal tracking app with a companion character that actually holds you accountable.

[![MIT License](https://img.shields.io/badge/License-MIT-black.svg)](LICENSE)
[![Expo](https://img.shields.io/badge/Expo-54-000020.svg?logo=expo)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB.svg?logo=react)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6.svg?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Twitter](https://img.shields.io/badge/Follow-@adhd__paws-1DA1F2?logo=twitter&logoColor=white)](https://x.com/adhd_paws)

[Features](#features) · [Installation](#installation) · [Philosophy](#philosophy) · [Contributing](#contributing) · [Sponsor](#sponsor)

<br />

<a href="https://x.com/adhd_paws/status/2006359359325155418">
  <img src="https://img.shields.io/badge/▶_Watch_Demo-000000?style=for-the-badge&logo=x&logoColor=white" alt="Watch Demo" />
</a>

</div>

---

## Why LockIn?

You've tried every productivity app. You've set goals. You've made plans.

**3 weeks later** — notifications muted, goals forgotten, back to square one.

LockIn is built around *why* we fail, not just *what* to do. It's designed with ADHD brains in mind, but works for anyone who struggles with follow-through.

---

## Features

### 🔒 Lock Into One Goal
You define ONE objective for the entire year. No switching. No "pivoting." The app literally won't let you change it. Your sprite already knows your goal, your milestones, everything — and will call you out when you drift.

### 🎭 A Sprite That Actually Reacts

| When you... | The sprite... |
|-------------|---------------|
| Work | Watches. Gets progressively excited. |
| Win | Celebrates harder than you do. |
| Slack | Laughs at you. Then shouts. Then slow claps. |
| Chase shiny objects | Analyzes your "great idea" and tells you if it's a distraction. |

### ⏱️ Focus Timer (You're Not Alone)
Start a focus session. The sprite rows beside you the whole time. Not a gimmick — it's the social presence effect. You work differently when someone's watching.

### 🌊 Watch Your Progress Bounce
Stressed? Open the Journey screen. Tilt your phone. Watch your completed milestones literally bounce around and grow. Get distracted by YOUR wins for once.

### 🤖 Works Offline
On-device AI plans your year, suggests next steps, and detects when new ideas are just distractions. No internet? No excuse. No API costs.

---

## Installation

### Prerequisites

- Node.js 18+
- iOS Simulator / Android Emulator / Physical Device
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/adhdpaws/lockin.git
cd lockin

# Install dependencies
npm install

# Start development server
npm start

# Run on specific platform
npm run ios      # iOS Simulator
npm run android  # Android Emulator
```

### Environment Setup

Create a `.env` file in the root:

```env
# Optional: Fallback when on-device AI unavailable
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

Get your free API key at [Google AI Studio](https://aistudio.google.com/apikey)

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Expo SDK 54 |
| Navigation | Expo Router v6 |
| Styling | NativeWind v4 (Tailwind CSS) |
| Animations | React Native Reanimated v4 |
| Language | TypeScript 5.9 |
| Storage | AsyncStorage |
| Sensors | Expo Sensors |
| AI | On-Device (expo-ai-kit) + Gemini fallback |

---

## Project Structure

```
lockin/
├── app/                      # Expo Router pages
│   ├── (onboarding)/         # First-time user flow
│   ├── (tabs)/               # Main dashboard
│   ├── (focus)/              # Focus mode screens
│   └── focus-zone/           # Milestone management
├── components/
│   ├── dashboard/            # Sprite characters & widgets
│   ├── onboarding/           # Onboarding components
│   └── ui/                   # Shared UI elements
├── services/
│   └── gemini.ts             # AI service layer
├── contexts/                 # React contexts
├── hooks/                    # Custom hooks
└── types.ts                  # TypeScript definitions
```

---

## Philosophy

> *"We are grateful for your achievements, but if we get lost in between, everything is forgotten and goes unseen."*

### The Character Exists Because:

1. **We behave differently when watched** — Eyes activate your social brain
2. **Emotions are contagious** — Its excitement becomes yours
3. **Shame can be healing** — When a cartoon mocks you, it's safe to laugh

### The Mockery System

When you fail, instead of silent judgment:

```
Phase 1          Phase 2          Phase 3
────────         ────────         ────────
😂 LAUGH         😤 SHOUT         👏 CLAP
"Bruh."          "WEAK."          *applause*
  ↓                ↓                ↓
Tears            Shaking          Sarcasm
```

It's absurd. It's over-the-top. That's the point — failure becomes a game mechanic, not a personality flaw.

---

## Contributing

Contributions welcome! Whether it's:

- 🐛 Bug fixes
- ✨ New features  
- 🎨 Design improvements
- 📚 Documentation
- 🌍 Translations

### Development Workflow

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Guidelines

- TypeScript strict mode
- Reanimated for all animations
- Sprites go in `components/dashboard/`
- Follow existing patterns

---

## Roadmap

- [x] On-Device AI — Local inference support
- [ ] War Room — Community squads & accountability partners
- [ ] Cloud Sync — Cross-device synchronization
- [ ] Widgets — iOS & Android home screen widgets
- [ ] Sound Design — Custom audio feedback
- [ ] Themes — Dark mode & color customization

---

## Sponsor

<div align="center">

### Support LockIn Development

If this project helps you achieve your goals, consider supporting its development.

<a href="https://github.com/sponsors/adhdpaws">
  <img src="https://img.shields.io/badge/GitHub_Sponsors-EA4AAA?style=for-the-badge&logo=github-sponsors&logoColor=white" alt="GitHub Sponsors" />
</a>

<br /><br />

**Your sponsorship supports:**

📱 Device testing · ☕ Late-night coding fuel · 🎨 Design assets · 🖥️ Infrastructure

</div>

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with discipline, frustration, and a little digital friend who believes in you.**

Made by [adhd.dev](https://x.com/adhd_paws)

⭐ Star this repo if LockIn helps you lock in.

</div>
