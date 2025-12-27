# SafeTrade Telegram Mini App

A modern, responsive Telegram Mini App for purchasing gift cards with cryptocurrency.

## 🚀 Features

- 📱 Native Telegram Mini App experience
- 🎁 Browse gift cards by category (Streaming, Gaming, App Stores)
- 💰 USDT wallet integration
- ⚡ Instant gift card delivery
- 📊 Order history and transaction tracking
- 🔐 Secure Telegram authentication

## 🛠️ Tech Stack

- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Routing:** React Router v6
- **API Client:** Axios
- **Telegram SDK:** @twa-dev/sdk
- **TON Connect:** @tonconnect/ui-react

## 📁 Project Structure

```
telegram-app/
├── src/
│   ├── api/                 # API client
│   │   └── client.ts        # SafeTrade API integration
│   ├── components/          # Reusable components
│   │   └── BottomNav.tsx    # Bottom navigation
│   ├── pages/               # Page components
│   │   ├── HomePage.tsx     # Categories & featured
│   │   ├── ProductsPage.tsx # Product listing
│   │   ├── ProductDetailPage.tsx # Product details
│   │   ├── WalletPage.tsx   # Wallet & transactions
│   │   ├── OrdersPage.tsx   # Order history
│   │   └── OrderDetailPage.tsx # Order details & code
│   ├── store/               # State management
│   │   └── useStore.ts      # Zustand store
│   ├── types/               # TypeScript types
│   │   └── index.ts         # Type definitions
│   ├── utils/               # Utilities
│   │   └── telegram.ts      # Telegram WebApp utils
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── index.html               # HTML template
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ and npm
- SafeTrade backend running (see `../backend/README.md`)
- Telegram Bot created with @BotFather

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env`:
   ```
   VITE_API_URL=http://localhost:3000/api
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

### Development with Telegram

To test in Telegram:

1. **Expose local server:**
   ```bash
   # Use ngrok or similar
   ngrok http 5173
   ```

2. **Set Mini App URL:**
   - Open @BotFather in Telegram
   - Send `/mybots`
   - Select your bot → Bot Settings → Menu Button
   - Configure Web App → Enter ngrok URL

3. **Open in Telegram:**
   - Start your bot
   - Click the menu button to open Mini App

## 🧪 Testing Without Telegram

For local development without Telegram:

1. Open `http://localhost:5173` in a browser
2. The app will work with mock Telegram data
3. User authentication will be bypassed

## 📦 Building for Production

```bash
npm run build
```

Output will be in `dist/` directory.

## 🚀 Deployment

### Deploy to Vercel/Netlify:

1. **Build settings:**
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`

2. **Environment variables:**
   ```
   VITE_API_URL=https://api.safetrade.io/api
   ```

3. **Deploy:**
   ```bash
   # Vercel
   vercel --prod

   # Netlify
   netlify deploy --prod
   ```

### Update Bot Menu Button:

After deployment, update your bot's Web App URL in @BotFather to your production URL.

## 🎨 Customization

### Telegram Theme Colors

The app automatically adapts to Telegram's theme. Colors are defined in `src/index.css`:

```css
:root {
  --tg-theme-bg-color: #ffffff;
  --tg-theme-text-color: #000000;
  --tg-theme-hint-color: #999999;
  --tg-theme-link-color: #2481cc;
  --tg-theme-button-color: #2481cc;
  --tg-theme-button-text-color: #ffffff;
  --tg-theme-secondary-bg-color: #f4f4f4;
}
```

### Adding New Pages

1. Create page component in `src/pages/`
2. Add route in `src/App.tsx`
3. Update navigation in `src/components/BottomNav.tsx` if needed

## 📱 Features Checklist

- [x] Product browsing by category
- [x] Product detail view with savings calculator
- [x] Wallet balance display
- [x] Order creation flow
- [x] Order history
- [x] Gift card code display
- [x] Transaction history
- [x] Telegram theme integration
- [x] Haptic feedback
- [x] Back button support
- [x] Main button integration
- [ ] TON Connect wallet integration
- [ ] Real payment processing
- [ ] Push notifications
- [ ] Referral system
- [ ] Settings page

## 🔗 Related Documentation

- [Backend API Reference](../backend/docs/API-REFERENCE.md)
- [Master Plan](../backend/docs/MASTER-PLAN.md)
- [Telegram Mini Apps Documentation](https://core.telegram.org/bots/webapps)
- [TON Connect Documentation](https://docs.ton.org/develop/dapps/ton-connect/overview)

## 🐛 Troubleshooting

### API Connection Issues

```bash
# Check backend is running
curl http://localhost:3000/api/products

# Verify CORS is enabled in backend
# See backend/src/main.ts
```

### Telegram WebApp Not Loading

1. Check ngrok/tunnel is running
2. Verify HTTPS (Telegram requires HTTPS)
3. Check browser console for errors
4. Verify Bot Token is correct

## 📄 License

See main project LICENSE file.

## 👥 Support

For issues or questions:
- GitHub Issues: [github.com/yourrepo/safetrade](https://github.com/yourrepo/safetrade)
- Telegram: @SafeTradeSupport
