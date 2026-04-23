# Smart Load Sharing

Heuristic-based backhaul load matching system for freight forwarders.
Eliminates empty return trips by suggesting ranked return loads
based on route, capacity, profit per km, and cargo compatibility.

## Live Demo
https://smart-load-sharing1.vercel.app

## Tech Stack
- React 18 + TypeScript
- Vite
- Tailwind CSS v3
- Lucide React

## Getting Started
npm install
npm run dev

## How the Matching Algorithm Works
Each return load is scored using four weighted factors:
- 40% Route Overlap — avoids sending truck back where it came from
- 30% Capacity Fit — higher available capacity scores better  
- 20% Profit per KM — profit ÷ distance, normalized to ₹25/km max
- 10% Type Match — cargo compatibility with truck type

Score formula:
score = (0.40 × routeScore) + (0.30 × capacityScore)
      + (0.20 × profitScore) + (0.10 × typeScore)

All factors are 0–1. Final score clamped between 50–99.
Same inputs always produce the same score (fully deterministic).

## Why Not "AI"?
The matching engine is a transparent, tunable heuristic —
four weighted factors any dispatcher can understand and override.
Designed so weights can be learned from acceptance history in v2,
replacing hand-tuned values with a trained model.

## Project Structure
src/
  App.tsx                      — state machine, 3-step flow
  data.ts                      — scoring algorithm + type definitions
  components/
    TruckInputForm.tsx          — step 1: enter trip details
    LoadSuggestions.tsx         — step 2: ranked return loads
    OptimizationDashboard.tsx   — step 3: results and metrics
    BusinessImpact.tsx          — footer impact statistics
    Header.tsx                  — top navigation bar
    StepIndicator.tsx           — step progress indicator
