# Expense Tracker

A responsive expense tracker built with React and Vite. Track income and expenses, filter transactions, view category totals, and keep data saved in the browser with local storage.

## Features

- Add income and expense transactions
- Edit or delete existing transactions
- Dashboard cards for balance, income, expenses, and savings rate
- Filter transactions by type, category, date range, and search text
- Category spending summary with visual progress bars
- Local storage persistence
- Responsive layout for desktop and mobile

## Tech Stack

- React
- Vite
- Lucide React icons
- CSS
- Browser localStorage

## Getting Started

### Prerequisites

Install [Node.js](https://nodejs.org/) version 18 or newer.

### Installation

```bash
npm install
```

### Run Locally

```bash
npm run dev
```

Open the local URL shown in your terminal, usually:

```text
http://localhost:5173
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```text
expense-tracker/
├── index.html
├── package.json
├── README.md
├── eslint.config.js
├── .gitignore
└── src/
    ├── App.jsx
    ├── main.jsx
    └── styles.css
```

## GitHub Upload

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/expense-tracker.git
git push -u origin main
```

## Deployment

This project can be deployed on Vercel, Netlify, GitHub Pages, or any static hosting provider. Build command:

```bash
npm run build
```

Output directory:

```text
dist
```
