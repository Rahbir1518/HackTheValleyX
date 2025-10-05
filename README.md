# HackTheValleyX - Baby Babble Analysis Platform 👶🗣️# HackTheValleyX - Baby Babble Analysis Platform



An AI-powered platform for analyzing baby babble audio to assess developmental milestones and potential speech-related conditions using advanced audio processing and Google Gemini AI.An AI-powered platform for analyzing baby babble audio to assess developmental milestones and potential speech-related conditions.



## 🚀 Tech Stack## 🚀 Tech Stack



**Frontend:****Frontend:**

- React + TypeScript + Vite- React + TypeScript + Vite

- Tailwind CSS- Tailwind CSS

- Clerk Authentication- Clerk Authentication

- WebSocket for real-time updates- WebSocket for real-time updates

- Lucide React icons

**Backend:**

**Backend:**- FastAPI (Python)

- FastAPI (Python)- Google Gemini AI

- Google Gemini AI- Librosa & Parselmouth for audio analysis

- Librosa & Parselmouth for audio analysis- WebSocket support

- WebSocket support

- Uvicorn server## 📦 Quick Start (Local Development)



## 📦 Quick Start (Local Development)Currently, two official plugins are available:



### Prerequisites- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh

- Node.js 18+ and npm- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

- Python 3.9+

- Google Gemini API key## React Compiler

- Clerk account (for authentication)

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

### 1. Clone the Repository

```bash## Expanding the ESLint configuration

git clone https://github.com/Rahbir1518/HackTheValleyX.git

cd HackTheValleyXIf you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```

```js

### 2. Backend Setupexport default defineConfig([

  globalIgnores(['dist']),

Install Python dependencies:  {

```bash    files: ['**/*.{ts,tsx}'],

pip3 install -r requirements.txt    extends: [

```      // Other configs...



Create `.env` file in the root directory:      // Remove tseslint.configs.recommended and replace with this

```env      tseslint.configs.recommendedTypeChecked,

GEMINI_API_KEY=your_gemini_api_key_here      // Alternatively, use this for stricter rules

ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5175      tseslint.configs.strictTypeChecked,

```      // Optionally, add this for stylistic rules

      tseslint.configs.stylisticTypeChecked,

Start the backend server:

```bash      // Other configs...

python3 src/main.py    ],

```    languageOptions: {

      parserOptions: {

The backend will run on `http://localhost:8000`        project: ['./tsconfig.node.json', './tsconfig.app.json'],

        tsconfigRootDir: import.meta.dirname,

### 3. Frontend Setup      },

      // other options...

Install npm dependencies:    },

```bash  },

npm install])

``````



Create `.env.local` file in the root directory:You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```env

VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key```js

VITE_API_URL=http://localhost:8000// eslint.config.js

VITE_WS_URL=ws://localhost:8000import reactX from 'eslint-plugin-react-x'

```import reactDom from 'eslint-plugin-react-dom'



Start the frontend:export default defineConfig([

```bash  globalIgnores(['dist']),

npm run dev  {

```    files: ['**/*.{ts,tsx}'],

    extends: [

The frontend will run on `http://localhost:5173`      // Other configs...

      // Enable lint rules for React

### 4. Open the App      reactX.configs['recommended-typescript'],

Navigate to `http://localhost:5173` in your browser.      // Enable lint rules for React DOM

      reactDom.configs.recommended,

---    ],

    languageOptions: {

## 🌐 Deployment      parserOptions: {

        project: ['./tsconfig.node.json', './tsconfig.app.json'],

Ready to deploy your app to production? We've got you covered!        tsconfigRootDir: import.meta.dirname,

      },

### Quick Deployment Setup      // other options...

Run the setup script:    },

```bash  },

./deploy-setup.sh])

``````


### Full Deployment Guide
See [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step instructions on:
- Deploying backend to Render
- Deploying frontend to Vercel
- Configuring environment variables
- Setting up Clerk for production
- Troubleshooting common issues

**Recommended Hosting:**
- **Backend**: Render (free tier available)
- **Frontend**: Vercel (free tier available)

---

## 📁 Project Structure

```
HackTheValleyX/
├── src/                      # Frontend & Backend source files
│   ├── main.py              # FastAPI backend server
│   ├── extractor.py         # Audio feature extraction
│   ├── App.tsx              # Main React app component
│   ├── Dashboard.tsx        # Dashboard with audio analysis
│   ├── Login.tsx            # Authentication pages
│   └── assets/              # Images and static files
├── audio/                    # Audio files for testing
├── requirements.txt          # Python dependencies
├── package.json             # Node.js dependencies
├── vite.config.ts           # Vite configuration
├── DEPLOYMENT.md            # Deployment guide
└── README.md                # This file
```

---

## ✨ Features

- 🎤 **Audio Upload**: Upload baby babble audio files for analysis
- 📊 **Real-time Analysis**: Get instant feedback with WebSocket updates
- 🧠 **AI-Powered Assessment**: Uses Google Gemini to analyze speech patterns
- 📈 **Visual Analytics**: Interactive charts showing pitch and energy data
- 🔐 **Secure Authentication**: Protected routes with Clerk
- 🏥 **Doctor Recommendations**: Find nearby specialists based on analysis
- 📱 **Responsive Design**: Works on desktop and mobile devices

---

## 🛠️ Development

### Run Tests
```bash
npm run lint
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

Built with ❤️ by Team HackTheValleyX

---

## 🆘 Support

Having issues? Check out:
- [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment help
- [Issues page](https://github.com/Rahbir1518/HackTheValleyX/issues) to report bugs
- [Discussions](https://github.com/Rahbir1518/HackTheValleyX/discussions) for questions

---

## 🙏 Acknowledgments

- Google Gemini AI for powering our analysis
- Clerk for authentication
- Librosa and Parselmouth for audio processing
- The open-source community
