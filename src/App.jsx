import React, { useState, useEffect } from 'react';
import { Analytics } from "@vercel/analytics/next"

// --- CONFIGURATION ---
const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;

// FORCE the Redirect URI to match your Vercel domain exactly.
// This prevents browser inconsistencies (like www vs non-www, or http vs https).
const REDIRECT_URI = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
  ? "http://127.0.0.1:5173/"
  : "https://audioabuse.vercel.app/";

const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const SCOPE = "user-top-read";

// API Key for Gemini
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// --- INLINE ICONS ---
const FlameIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></svg>
);
const MusicIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
);
const LogOutIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
);
const AlertIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
);
const LoaderIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
);
const SettingsIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
);

export default function App() {
  const [token, setToken] = useState("");
  const [artists, setArtists] = useState([]);
  const [roast, setRoast] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  // New States for Customization
  const [language, setLanguage] = useState("hinglish"); // 'english' | 'hinglish'
  const [intensity, setIntensity] = useState("savage"); // 'mild' | 'savage' | 'nuclear'

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code && !window.localStorage.getItem("token")) {
      exchangeToken(code);
    } else {
      const storedToken = window.localStorage.getItem("token");
      if (storedToken) setToken(storedToken);
    }

    if (code) {
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  // --- PKCE HELPER FUNCTIONS ---
  const generateRandomString = (length) => {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };

  const sha256 = async (plain) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return window.crypto.subtle.digest('SHA-256', data);
  };

  const base64encode = (input) => {
    return btoa(String.fromCharCode(...new Uint8Array(input)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  };

  const handleLogin = async () => {
    const codeVerifier = generateRandomString(128);
    const hashed = await sha256(codeVerifier);
    const codeChallenge = base64encode(hashed);

    window.localStorage.setItem('code_verifier', codeVerifier);

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: CLIENT_ID,
      scope: SCOPE,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
      redirect_uri: REDIRECT_URI,
    });

    window.location.href = `${AUTH_ENDPOINT}?${params.toString()}`;
  };

  const exchangeToken = async (code) => {
    setStatus("Securing connection...");
    const codeVerifier = window.localStorage.getItem('code_verifier');

    try {
      const response = await fetch(TOKEN_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: CLIENT_ID,
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: REDIRECT_URI,
          code_verifier: codeVerifier,
        }),
      });

      const data = await response.json();

      if (data.access_token) {
        setToken(data.access_token);
        window.localStorage.setItem("token", data.access_token);
        setStatus("");
      } else {
        setStatus("Token exchange failed.");
        console.error("Token Error:", data);
      }
    } catch (err) {
      console.error(err);
      setStatus("Network error during login.");
    }
  };

  const logout = () => {
    setToken("");
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("code_verifier");
    setArtists([]);
    setRoast("");
  };

  const getTopArtists = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://api.spotify.com/v1/me/top/artists?limit=10", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 401) {
        logout();
        return;
      }

      const data = await response.json();
      if (data.items) {
        setArtists(data.items);
        const names = data.items.map(a => a.name).join(", ");
        await fetchRoast(names);
      }
    } catch (error) {
      console.error(error);
      alert("Could not fetch artists.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoast = async (artistList) => {
    try {
      // Dynamic Prompt Construction
      let langInstruction = "";
      if (language === "hinglish") {
        langInstruction = "You speak in natural, conversational 'Hinglish' (English mixed with Hindi slang). Use words like 'bhai', 'pagal', 'dhakkan', 'bakwaas' naturally. Do NOT use markdown (* or bold) for hindi words.";
      } else {
        langInstruction = "You speak in standard, witty English. Use slang like 'bro', 'cringe', 'red flag' etc.";
      }

      let roastInstruction = "";
      if (intensity === "mild") {
        roastInstruction = "Be playful and sarcastic, like a friendly ribbing. Don't be too mean, just tease them about their basic taste.";
      } else if (intensity === "savage") {
        roastInstruction = "Be brutally honest and judgmental. Make fun of their life choices, pretentiousness, or fake depression. Be a snob.";
      } else {
        roastInstruction = "NUCLEAR OPTION. Destroy them. Be absolutely ruthless. Attack their emotional stability, their lack of a job, and their age. Make them regret asking for this. Use specific lyrics to mock them.";
      }

      const systemPrompt = `You are a music critic.
      ${langInstruction}
      ${roastInstruction}

      Your goal: Roast the user based on these artists: ${artistList}
      
      Guidelines:
      - Address the user directly ('You').
      - Keep it under 150 words.
      - No intro (e.g. "Here is your roast"). Just start roasting.
      - ensure there are no * or markdown formatting in the response.
      - ensure no html or other code snippets are included.
      `;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Roast these artists: ${artistList}` }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] }
        })
      });

      const data = await response.json();
      setRoast(data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm too stunned by your bad taste to speak.");
    } catch (err) {
      console.error(err);
      setRoast("Error contacting the roasting department. The servers probably crashed from the cringe.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#121212] text-white flex flex-col font-sans selection:bg-[#1DB954] selection:text-black">

      {/* Navbar */}
      <nav className="w-full p-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <FlameIcon className="w-6 h-6 text-red-500" />
          <span className="font-bold text-xl tracking-tight">Spotify<span className="text-[#1DB954]">Roaster</span></span>
        </div>
        {token && (
          <button
            onClick={logout}
            className="text-sm font-medium text-neutral-400 hover:text-white transition-colors flex items-center gap-2"
          >
            <LogOutIcon className="w-4 h-4" />
            Sign Out
          </button>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-4xl mx-auto flex flex-col items-center justify-center p-6 text-center">

        {/* Header Section */}
        <div className="space-y-6 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight">
            How bad is your<br />
            <span className="bg-gradient-to-r from-[#1DB954] to-emerald-300 bg-clip-text text-transparent">
              music taste?
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-neutral-400 max-w-2xl mx-auto font-light">
            Our AI judges your listening history more harshly than your ex did.
          </p>
        </div>

        {/* Status / Error Message */}
        {status && (
          <div className="flex items-center gap-2 text-yellow-500 bg-yellow-500/10 px-4 py-2 rounded-full mb-8">
            <AlertIcon className="w-4 h-4" />
            <span className="text-sm font-medium">{status}</span>
          </div>
        )}

        {/* Action Area */}
        {!token ? (
          <div className="animate-in zoom-in-50 duration-500 delay-150">
            {/* Dev Helper - Only shows if config is likely wrong */}
            {!window.location.host.includes("vercel") && !window.location.host.includes("netlify") && (
              <div className="mb-6 text-xs text-neutral-600 bg-neutral-900 border border-neutral-800 p-3 rounded-lg max-w-md mx-auto">
                <p className="font-mono mb-1">Redirect URI for Dashboard:</p>
                <code className="text-[#1DB954] select-all">{REDIRECT_URI}</code>
              </div>
            )}

            <button
              onClick={handleLogin}
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-[#1DB954] text-black text-lg font-bold rounded-full hover:bg-[#1ed760] transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(29,185,84,0.5)]"
            >
              <MusicIcon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Login with Spotify
            </button>
            <p className="mt-4 text-xs text-neutral-600 uppercase tracking-widest">
              Safe & Secure • No Data Stored
            </p>
          </div>
        ) : (
          <div className="w-full max-w-2xl animate-in fade-in duration-500">

            {/* --- CONFIGURATION PANEL --- */}
            {!roast && (
              <div className="bg-[#181818] border border-[#282828] p-6 rounded-2xl mb-8 max-w-lg mx-auto shadow-lg">
                <div className="flex items-center gap-2 mb-4 text-neutral-400 text-sm font-bold uppercase tracking-wider">
                  <SettingsIcon className="w-4 h-4" />
                  Customize Your Pain
                </div>

                {/* Language Toggles */}
                <div className="mb-6">
                  <p className="text-left text-sm text-neutral-400 mb-2">Language</p>
                  <div className="flex p-1 bg-[#000] rounded-lg">
                    {['english', 'hinglish'].map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setLanguage(lang)}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-bold transition-all capitalize ${language === lang
                          ? 'bg-[#1DB954] text-black shadow-lg'
                          : 'text-neutral-500 hover:text-white'
                          }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Intensity Toggles */}
                <div>
                  <p className="text-left text-sm text-neutral-400 mb-2">Roast Level</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'mild', label: 'Mild', emoji: '🌶️' },
                      { id: 'savage', label: 'Savage', emoji: '🔥' },
                      { id: 'nuclear', label: 'Nuclear', emoji: '☢️' }
                    ].map((level) => (
                      <button
                        key={level.id}
                        onClick={() => setIntensity(level.id)}
                        className={`py-3 px-2 rounded-lg text-xs md:text-sm font-bold transition-all border ${intensity === level.id
                          ? 'bg-[#2a2a2a] border-[#1DB954] text-[#1DB954] shadow-[0_0_15px_-5px_#1DB954]'
                          : 'bg-[#121212] border-transparent text-neutral-500 hover:bg-[#202020] hover:text-white'
                          }`}
                      >
                        <span className="block text-lg mb-1">{level.emoji}</span>
                        {level.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!roast ? (
              <button
                onClick={getTopArtists}
                disabled={loading}
                className="w-full md:w-auto px-12 py-5 bg-white text-black text-xl font-bold rounded-full hover:bg-neutral-200 transition-all hover:scale-105 active:scale-95 shadow-[0_0_50px_-15px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3 mx-auto"
              >
                {loading ? (
                  <>
                    <LoaderIcon className="w-6 h-6 animate-spin" />
                    Cooking...
                  </>
                ) : (
                  <>
                    <FlameIcon className="w-6 h-6 text-red-600" />
                    Roast My Taste
                  </>
                )}
              </button>
            ) : (
              <div className="bg-[#181818] border border-[#282828] p-8 md:p-10 rounded-2xl shadow-2xl relative overflow-hidden group text-left">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500" />

                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <span className="text-lg font-bold">AI</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-white">The Verdict</h3>
                      <p className="text-xs text-neutral-400 capitalize">{language} • {intensity} Mode</p>
                    </div>
                  </div>
                </div>

                <p className="text-lg md:text-xl text-neutral-200 leading-relaxed whitespace-pre-wrap font-medium">
                  "{roast}"
                </p>

                <div className="mt-8 pt-6 border-t border-[#333]">
                  <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">
                    Culprits found in your history
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {artists.map((artist, i) => (
                      <span key={i} className="px-3 py-1 bg-[#282828] text-neutral-300 text-sm rounded-full border border-[#333] hover:border-[#1DB954] transition-colors cursor-default">
                        {artist.name}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => { setRoast(""); }}
                  className="mt-8 w-full py-3 text-sm font-bold text-neutral-500 hover:text-white transition-colors border border-dashed border-neutral-700 rounded-lg hover:border-neutral-500 hover:bg-neutral-800/50"
                >
                  I want to be hurt again (Retry)
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-neutral-600 text-sm">
        <p>Random bullshit done by Aadi using Spotify API + Gemini</p>
      </footer>

    </div>
  );
}