# runstats.io

A personal training dashboard built by a DevOps engineer as a self-learning project using Ollama, Claude, and the qwen3.5:4b model.

## About

I'm a DevOps engineer who took this on as a personal project to build something motivating to track running progress. It's a simple dashboard with calculations to help motivate running through the weeks, months, and years.

One day this may include an integration to pull data locally via GPX/FIT files with a SQLite database, but for now it's just a nice dashboard with visualizations to help track goal completion across different time periods.

## Overview

This application displays training metrics as a percentage of goal completion across three time periods: weekly, monthly, and yearly. It includes visual progress bars with target markers to show how you're progressing toward your goals.

## Features

- **Goal Pacing Visualization**: See your actual distance compared to weekly, monthly, and yearly goals
- **Progress Bars**: Visual representation of completion percentage with goal target markers
- **Recent Activity**: Show the most recent activity date, distance, and pace
- **Recent Event**: Highlight the most recent parkrun or similar event with details

## Data Structure

The app uses separate JSON files in `src/data/` for modularity:

- `goals.json` - Target distances for each period
- `actuals.json` - Completed distances for each period
- `activity.json` - Most recent activity details
- `event.json` - Most recent event details

## Getting Started

### Prerequisites

- Node.js 18+

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Technology Stack

- React 18
- Vite
- Vanilla CSS

## License

MIT