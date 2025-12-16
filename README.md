# Spotify Roaster - How bad is your music taste?

A savage, AI-powered web application that judges your music taste based on your Spotify listening history. It uses multiple LLMs (Gemini, OpenAI, Groq) to generate brutal roasts in English or Hinglish.

Site Link(mostly gonna be messed up because of Gemini API key running out of requests - https://audioabuse.vercel.app/)

## Features

- 🎵**Spotify Integration**: Securely logs in via Spotify (OAuth2 PKCE) to fetch your top artists.
- 🤖 **Multi-LLM Fallback System** (to be implemented):
  - Primary: Google Gemini (Fast & Free tier friendly)
  - Secondary: Backup Gemini keys
-  **Customization**:
  - **Language**: Switch between English and Hinglish (Delhi/Mumbai slang style)
  - **Intensity**: Choose your pain level: Mild, Savage, or Nuclear
- 🎨 **UI/UX**: Fully responsive, dark-themed UI inspired by Spotify's aesthetic
- 🔒 **Privacy**: Client-side only. No data is stored on any server

##  Tech Stack

- **Frontend**: React.js + Vite
- **Styling**: Standard CSS (No external libraries required)
- **APIs**: Spotify Web API, Google Gemini API, OpenAI API
- **Icons**: Inline SVG (Lucide-style)

##  Getting Started

### Prerequisites

- Node.js installed (v16+)
- A Spotify Developer Account
- API Keys for Google Gemini (AI Studio) or OpenAI

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/AadiPandey/audioabuse.git
cd audioabuse
npm install
```

### 2. Spotify Dashboard Setup

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Copy the **Client ID**
4. Click "Edit Settings" and add the following Redirect URIs:
   - `http://127.0.0.1:5173/` (⚠️ Important: Spotify requires `127.0.0.1`, `localhost` will not work)
   - `https://your-deployed-site.vercel.app/` (Add this later when deploying)
5. Save changes

### 3. Environment Variables

Create a `.env` file in the root directory (optional, or hardcode in `App.jsx` for personal use):

```env
# Spotify Configuration
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id_here

# AI Configuration
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Add keys for OpenAI/Groq if you want to use them in the code config
```

### 4. Running Locally

Start the development server:

```bash
npm run dev
```

Open your browser to `http://127.0.0.1:5173/`

⚠️ **Critical**: Ensure the address bar says `127.0.0.1` and NOT `localhost`, otherwise the Spotify authentication flow will fail.

##  Configuration (App.jsx)

The logic for handling AI providers is located in `src/App.jsx` under the `LLM_CONFIG` array. You can add, remove, or reorder providers there:

```javascript
const LLM_CONFIG = [
  {
    provider: 'gemini',
    label: 'Gemini (Primary)',
    key: "YOUR_KEY_HERE", 
    model: 'gemini-2.5-flash-preview-09-2025'
  },
  // ... add OpenAI, Groq, or backup keys here
];
```

##  License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/AadiPandey/audioabuse/issues).

## 👨‍💻 Author

**AadiPandey** - [@AadiPandey](https://github.com/AadiPandey)

---

⭐ **Star this repo if you like getting roasted!**