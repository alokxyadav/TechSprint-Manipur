# AI Demand Intelligence Platform

A production-ready AI-powered multi-domain demand intelligence and forecasting platform that delivers intelligent, data-driven insights across seven industry verticals.

## 🎯 Overview

This platform combines **Google Trends** data, **Facebook Prophet** machine learning, and advanced AI recommendation engines to provide comprehensive demand forecasting and strategic business insights.

### Key Features

- **Multi-Domain Support**: Specialized forecasting for IT, Healthcare, EV, OTT, Biotech, AgriTech (Tea Gardens), and Restaurant sectors
- **Google Trends Integration**: Real-time trend data, related queries, and seasonality signals via PyTrends
- **Prophet ML Forecasting**: 6-12 month predictions with confidence intervals and growth rate detection
- **AI Recommendations**: Actionable insights for production timing, marketing strategies, risk warnings, and launch planning
- **Interactive Dashboards**: Beautiful visualizations with Recharts including line graphs, confidence bands, and seasonal heatmaps
- **User Authentication**: Secure JWT-based authentication with role-based access control
- **RESTful API**: Comprehensive tRPC endpoints for all platform features

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React 19)                      │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │   Home      │  │  Dashboard   │  │ Forecast Detail  │   │
│  │   Page      │  │    Page      │  │      Page        │   │
│  └─────────────┘  └──────────────┘  └──────────────────┘   │
│                    Tailwind CSS + Recharts                   │
└─────────────────────────────────────────────────────────────┘
                              │
                         tRPC API
                              │
┌─────────────────────────────────────────────────────────────┐
│                  Backend (Node.js + Express)                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              tRPC Routers & Procedures               │   │
│  │  • domains  • forecasts  • recommendations  • auth   │   │
│  └──────────────────────────────────────────────────────┘   │
│                              │                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              AI Service Layer (Python)               │   │
│  │  ┌────────────┐  ┌────────────┐  ┌───────────────┐  │   │
│  │  │   Trend    │  │  Prophet   │  │Recommendation │  │   │
│  │  │  Fetcher   │  │  Forecast  │  │    Engine     │  │   │
│  │  │ (PyTrends) │  │   Engine   │  │   (AI Logic)  │  │   │
│  │  └────────────┘  └────────────┘  └───────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    Database (MySQL/TiDB)                     │
│  • users  • domains  • forecasts  • recommendations          │
│  • trendCache                                                │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 22+
- Python 3.11+
- MySQL/TiDB database
- pnpm package manager

### Installation

1. **Clone and install dependencies**
   ```bash
   cd ai-demand-platform
   pnpm install
   ```

2. **Install Python ML dependencies**
   ```bash
   sudo pip3 install prophet pytrends xgboost pandas numpy scikit-learn redis
   ```

3. **Setup database**
   ```bash
   pnpm db:push
   ```

4. **Seed domain data**
   ```bash
   node server/services/seedDomains.mjs
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

The platform will be available at `http://localhost:3000`

## 📊 Supported Domains

### 1. IT & Software Services 💻
Cloud computing, AI/ML, cybersecurity, SaaS, DevOps

### 2. Healthcare & MedTech 🏥
Telemedicine, medical devices, digital health, healthcare AI

### 3. Electric Vehicles ⚡
EV technology, charging infrastructure, battery systems

### 4. OTT & Media Platforms 📺
Streaming services, video on demand, digital content

### 5. Biotech & Life Sciences 🧬
Gene therapy, CRISPR, drug discovery, precision medicine

### 6. AgriTech (Precision Agriculture) 🌱
Smart farming, IoT agriculture, **tea garden management**, crop monitoring

### 7. Restaurants & FoodTech 🍽️
Restaurant technology, food delivery, cloud kitchens, POS systems

## 🧠 AI/ML Pipeline

### 1. Trend Intelligence Layer
- Fetches Google Trends data using PyTrends
- Extracts related and rising queries
- Identifies seasonality signals
- Caches results for performance

### 2. Forecasting Engine (Prophet)
- Time-series ML with Facebook Prophet
- Yearly seasonality enabled
- 95% confidence intervals
- Growth rate detection
- 6-12 month forecasts

### 3. Recommendation AI
- Rule-based + ML hybrid logic
- Generates actionable insights:
  - **Production**: Capacity planning, scaling strategies
  - **Marketing**: Campaign timing, budget allocation
  - **Risk**: Market volatility warnings, mitigation strategies
  - **Timing**: Optimal launch windows, seasonal planning
  - **Strategy**: Long-term positioning, competitive moves

## 📡 API Endpoints

### Domains
- `domains.list` - Get all supported domains
- `domains.getById` - Get domain details
- `domains.getByCode` - Get domain by code

### Forecasts
- `forecasts.create` - Create new forecast (async processing)
- `forecasts.getById` - Get forecast details
- `forecasts.list` - List user forecasts
- `forecasts.dashboard` - Get dashboard summary

### Recommendations
- `recommendations.getByForecastId` - Get AI recommendations for a forecast

### Authentication
- `auth.me` - Get current user
- `auth.logout` - Logout user

## 🎨 Frontend Stack

- **React 19** - UI framework
- **Tailwind CSS 4** - Styling with custom design system
- **Recharts** - Data visualization
- **tRPC** - Type-safe API client
- **Wouter** - Lightweight routing
- **shadcn/ui** - Component library

## 🔧 Backend Stack

- **Node.js 22** - Runtime
- **Express 4** - Web framework
- **tRPC 11** - Type-safe API
- **Drizzle ORM** - Database toolkit
- **Python 3.11** - ML/AI services

## 🤖 ML/AI Stack

- **Prophet** - Time-series forecasting
- **PyTrends** - Google Trends API
- **Pandas & NumPy** - Data processing
- **Scikit-learn** - ML utilities
- **XGBoost** - Optional hybrid enhancement

## 📈 Usage Example

1. **Sign in** to the platform
2. **Select a domain** (e.g., Healthcare)
3. **Enter a keyword** (e.g., "telemedicine")
4. **Choose forecast period** (6-24 months)
5. **Wait 30-60 seconds** for AI processing
6. **View results**:
   - Historical trend data
   - Future predictions with confidence bands
   - Seasonal patterns
   - Growth rate analysis
   - AI-generated recommendations

## 🔐 Security Features

- JWT-based authentication
- Role-based access control (admin/user)
- Input validation with Zod
- Secure session management
- Environment-based configuration

## 📦 Database Schema

### Tables
- **users** - User accounts and authentication
- **domains** - Industry domain configurations
- **forecasts** - Forecast results and metadata
- **recommendations** - AI-generated recommendations
- **trendCache** - Cached Google Trends data

## 🧪 Testing

Run the test suite:
```bash
pnpm test
```

## 📝 Environment Variables

Required environment variables are automatically injected by the Manus platform:
- `DATABASE_URL` - Database connection string
- `JWT_SECRET` - Session signing secret
- `VITE_APP_ID` - OAuth application ID
- And more (see template README)

## 🚀 Deployment

The platform is designed to run on Manus hosting with built-in:
- Automatic SSL certificates
- Custom domain support
- Database management
- OAuth integration
- File storage (S3)

## 📚 Documentation

### For Non-Technical Users

**What does this platform do?**

This platform helps businesses make smarter decisions by predicting future demand for products and services. It uses artificial intelligence to analyze trends from Google searches and generates forecasts showing whether demand will go up or down over the next 6-12 months.

**How does it work?**

1. You select your industry (like Healthcare or Electric Vehicles)
2. You enter a keyword related to your business (like "telemedicine" or "EV charging")
3. The AI analyzes millions of data points from Google Trends
4. It creates predictions using advanced machine learning (Prophet algorithm)
5. It generates specific recommendations on when to increase production, launch marketing campaigns, or prepare for seasonal changes

**Why is it useful?**

- **Save money**: Avoid overproduction during low-demand periods
- **Maximize revenue**: Scale up during high-demand seasons
- **Reduce risk**: Get early warnings about market downturns
- **Perfect timing**: Launch products when demand is highest
- **Data-driven**: Make decisions based on real market signals, not guesswork

## 🏆 Key Differentiators

1. **Multi-Domain Intelligence**: Unlike generic forecasting tools, this platform has domain-specific keyword intelligence for 7 industries
2. **Tea Garden Focus**: Unique AgriTech support with tea plantation-specific keywords and insights
3. **Explainable AI**: Every recommendation includes reasoning and confidence scores
4. **Production-Ready**: Built with enterprise-grade architecture, not a prototype
5. **Real-Time Data**: Integrates live Google Trends data, not historical datasets

## 🤝 Contributing

This is a production platform. For feature requests or bug reports, please contact the development team.

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- **Facebook Prophet** - Time-series forecasting framework
- **Google Trends** - Trend data source
- **Manus Platform** - Hosting and infrastructure
- **shadcn/ui** - Component library

---

**Built with ❤️ for data-driven decision making**
