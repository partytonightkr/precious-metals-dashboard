# Precious Metals Sentiment Dashboard

Real-time dashboard tracking Gold, Silver, Copper, and Platinum prices with sentiment analysis.

![Dashboard Preview](preview.png)

## Features

- **Live Prices**: Real-time spot prices for 4 precious metals
- **Sentiment Analysis**: Market sentiment score from news and social signals
- **Interactive Charts**: Historical price charts with multiple timeframes
- **News Feed**: Latest headlines with sentiment tagging

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:
```bash
cd precious-metals-dashboard
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. (Optional) Add API keys to `.env`:
```
METALS_API_KEY=your_key_here
NEWS_API_KEY=your_key_here
```

4. Start development server:
```bash
npm run dev
```

5. Open http://localhost:3000

## API Keys (Optional)

The dashboard works with mock data out of the box. For real data:

### Metals Prices
- [metals.dev](https://metals.dev) - 1000 requests/month free
- [metalpriceapi.com](https://metalpriceapi.com) - 100 requests/month free

### News
- [newsapi.org](https://newsapi.org) - 100 requests/day free

## Project Structure

```
├── app/
│   ├── api/           # API routes
│   ├── layout.tsx     # Root layout
│   └── page.tsx       # Dashboard page
├── components/
│   ├── PriceCard.tsx      # Metal price card
│   ├── SentimentGauge.tsx # Sentiment meter
│   ├── PriceChart.tsx     # Historical chart
│   └── NewsPanel.tsx      # News feed
├── lib/
│   ├── metals-api.ts  # Price fetching
│   ├── sentiment.ts   # Sentiment analysis
│   └── utils.ts       # Helpers
└── types/
    └── index.ts       # TypeScript types
```

## Customization

### Add More Metals
Edit `types/index.ts` and add to the `METALS` object.

### Change Refresh Interval
Edit `app/page.tsx` line with `setInterval`.

### Connect Real APIs
Uncomment the real API functions in `lib/metals-api.ts` and `lib/sentiment.ts`.

## License

MIT
