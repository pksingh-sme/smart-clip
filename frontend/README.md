# StreamHub Frontend

This is the frontend application for StreamHub, a YouTube-like video streaming platform built with React, TailwindCSS, and modern web technologies.

## Features

- Responsive design with TailwindCSS
- Dark mode support
- User authentication (signup, login, logout)
- Video upload and management
- Video playback with comments and likes
- User profiles
- Internationalization support
- Smooth animations with Framer Motion
- State management with Zustand

## Technology Stack

- **React 18** - Frontend library
- **React Router** - Client-side routing
- **TailwindCSS** - Styling framework
- **Framer Motion** - Animation library
- **Zustand** - State management
- **Axios** - HTTP client
- **i18next** - Internationalization
- **Vite** - Build tool and development server

## Prerequisites

- Node.js 18+
- npm or yarn

## Getting Started

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3001`

### Building for Production

Create a production build:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable components
│   ├── pages/           # Page components
│   ├── services/        # API services
│   ├── store/           # Zustand store
│   ├── App.jsx          # Main App component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── index.html           # HTML template
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # TailwindCSS configuration
└── postcss.config.js    # PostCSS configuration
```

## Environment Variables

Create a `.env` file in the frontend directory with the following variables:

```env
VITE_API_URL=http://localhost:3000/api
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Deployment

The frontend can be deployed to any static hosting service like Vercel, Netlify, or AWS S3.

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy the `dist` folder to your hosting provider.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

This project is licensed under the MIT License.