import './storage';
import React, { useState, useRef } from 'react';
import { Camera, Upload, Check, X, Loader2, Trophy, Award, User, LogOut, TrendingUp, Image as ImageIcon } from 'lucide-react';

export default function TouchGrassApp() {
  const [view, setView] = useState('login');
  const [username, setUsername] = useState('');
  const [image, setImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [userData, setUserData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const loadUserData = async (user) => {
    setLoading(true);
    try {
      const result = await window.storage.get(`user:${user}`);
      if (result) {
        const data = JSON.parse(result.value);
        setUserData(data);
        
        const galleryResult = await window.storage.get(`gallery:${user}`);
        if (galleryResult) {
          setGallery(JSON.parse(galleryResult.value));
        }
      } else {
        const newUser = {
          username: user,
          streak: 0,
          maxStreak: 0,
          totalAttempts: 0,
          successfulTouches: 0,
          joinedDate: new Date().toISOString(),
          achievements: []
        };
        await window.storage.set(`user:${user}`, JSON.stringify(newUser));
        setUserData(newUser);
        setGallery([]);
      }
    } catch (error) {
      console.error("Error loading user:", error);
    }
    setLoading(false);
  };

  const saveUserData = async (data) => {
    try {
      await window.storage.set(`user:${username}`, JSON.stringify(data));
      setUserData(data);
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  const updateLeaderboard = async (user, score) => {
    try {
      await window.storage.set(`leaderboard:${user}`, JSON.stringify({
        username: user,
        maxStreak: score,
        timestamp: new Date().toISOString()
      }), true);
    } catch (error) {
      console.error("Error updating leaderboard:", error);
    }
  };

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const keys = await window.storage.list('leaderboard:', true);
      if (keys && keys.keys) {
        const entries = await Promise.all(
          keys.keys.map(async (key) => {
            try {
              const result = await window.storage.get(key, true);
              return result ? JSON.parse(result.value) : null;
            } catch {
              return null;
            }
          })
        );
        const sorted = entries
          .filter(e => e !== null)
          .sort((a, b) => b.maxStreak - a.maxStreak)
          .slice(0, 10);
        setLeaderboard(sorted);
      }
    } catch (error) {
      console.error("Error loading leaderboard:", error);
    }
    setLoading(false);
  };

  const saveToGallery = async (imageData, analysis) => {
    const newEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      success: analysis.touching_grass,
      reason: analysis.reason,
      comment: analysis.roast_or_praise
    };
    const updatedGallery = [newEntry, ...gallery].slice(0, 20);
    setGallery(updatedGallery);
    
    try {
      await window.storage.set(`gallery:${username}`, JSON.stringify(updatedGallery));
    } catch (error) {
      console.error("Error saving gallery:", error);
    }
  };

  const checkAchievements = (data) => {
    const newAchievements = [...data.achievements];
    
    if (data.streak >= 3 && !newAchievements.includes('first_streak')) {
      newAchievements.push('first_streak');
    }
    if (data.streak >= 7 && !newAchievements.includes('week_warrior')) {
      newAchievements.push('week_warrior');
    }
    if (data.totalAttempts >= 10 && !newAchievements.includes('dedicated')) {
      newAchievements.push('dedicated');
    }
    if (data.successfulTouches >= 25 && !newAchievements.includes('grass_master')) {
      newAchievements.push('grass_master');
    }
    
    return newAchievements;
  };

  const analyzeImage = async (imageData) => {
  setAnalyzing(true);
  setResult(null);

  try {
    // Simulate realistic processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create image element to analyze
    const img = new Image();
    img.src = imageData;
    
    await new Promise((resolve) => {
      img.onload = resolve;
    });
    
    // Analyze brightness and color
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    
    const imageDataRaw = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageDataRaw.data;
    let brightness = 0;
    let greenness = 0;
    let totalPixels = data.length / 4;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      brightness += (r + g + b) / 3;
      
      // Check if pixel is green-ish (grass color)
      if (g > r && g > b && g > 100) {
        greenness++;
      }
    }
    
    brightness = brightness / totalPixels;
    const greenPercentage = (greenness / totalPixels) * 100;
    
    // Determine if it looks like grass/outdoor
    const isBright = brightness > 100; // Outdoor photos are brighter
    const isGreen = greenPercentage > 10; // Has significant green
    const touchingGrass = isBright && isGreen;
    
    const successResponses = [
      "Finally! You've achieved the impossible - you've gone outside! Your RGB lighting must miss you.",
      "Wow, actual grass! I'm genuinely impressed. The sun must feel weird on your skin, huh?",
      "Look at you, touching grass like a normal person! Your Discord server can wait.",
      "Congratulations! You've discovered the mystical outdoor realm. Legend says there's a big yellow ball in the sky there.",
      "GRASS CONFIRMED! Take that, basement dwellers! You're one of the chosen ones now.",
      "Mother Nature sends her regards! Looks like you finally remembered the outside exists.",
      "Achievement unlocked: Touched Grass! Your gaming chair misses you already.",
      "Is that... sunlight? And green things? I'm almost proud of you!"
    ];
    
    const failResponses = [
      "Nice try, but that's not fooling anyone. Is that... a houseplant? Go touch some REAL grass, my friend.",
      "I see you're trying, but I need to SEE the grass touching. This isn't 'point vaguely at green things' app.",
      "That's either fake grass, a very green carpet, or you're pranking me. Get outside for real!",
      "Nope. Not convinced. That looks suspiciously indoor. The sun is free, you know.",
      "Did you just take a picture of your monitor showing grass? I'm onto you, buddy.",
      "That's not grass, that's your keyboard's RGB lighting set to green. Nice try though!",
      "I've seen better attempts. Maybe try actually going outside this time?",
      "Error 404: Grass not found. Please try again with actual outdoor vegetation."
    ];
    
    const analysis = {
      touching_grass: touchingGrass,
      confidence: (isBright && isGreen) ? "high" : "medium",
      reason: touchingGrass 
        ? `Outdoor conditions detected! Brightness: ${Math.round(brightness)}/255, Green content: ${greenPercentage.toFixed(1)}%. This looks like real grass!`
        : `Indoor setting detected. Brightness: ${Math.round(brightness)}/255, Green content: ${greenPercentage.toFixed(1)}%. Need more outdoor indicators!`,
      roast_or_praise: touchingGrass 
        ? successResponses[Math.floor(Math.random() * successResponses.length)]
        : failResponses[Math.floor(Math.random() * failResponses.length)]
    };
    
    setResult(analysis);
    
    // Update user stats
    const updatedData = {
      ...userData,
      totalAttempts: userData.totalAttempts + 1,
      successfulTouches: analysis.touching_grass ? userData.successfulTouches + 1 : userData.successfulTouches,
      streak: analysis.touching_grass ? userData.streak + 1 : 0,
      maxStreak: analysis.touching_grass ? Math.max(userData.maxStreak, userData.streak + 1) : userData.maxStreak
    };
    
    updatedData.achievements = checkAchievements(updatedData);
    
    await saveUserData(updatedData);
    await saveToGallery(imageData, analysis);
    
    if (analysis.touching_grass) {
      await updateLeaderboard(username, updatedData.maxStreak);
    }
    
  } catch (error) {
    console.error("Analysis error:", error);
    setResult({
      touching_grass: false,
      confidence: "error",
      reason: "Failed to analyze image. Make sure it's a valid photo.",
      roast_or_praise: "Something went wrong with the AI. Did you upload a corrupted meme?"
    });
  } finally {
    setAnalyzing(false);
  }
};

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target.result;
      setImage(imageData);
      analyzeImage(imageData);
    };
    reader.readAsDataURL(file);
  };

  const handleLogin = async () => {
    if (usernameInput.trim()) {
      setUsername(usernameInput.trim());
      await loadUserData(usernameInput.trim());
      setView('main');
    }
  };

  const handleLogout = () => {
    setUsername('');
    setUserData(null);
    setGallery([]);
    setView('login');
    setImage(null);
    setResult(null);
  };

  const achievements = {
    first_streak: { icon: '🔥', name: 'On Fire', desc: '3 day streak' },
    week_warrior: { icon: '⚔️', name: 'Week Warrior', desc: '7 day streak' },
    dedicated: { icon: '💪', name: 'Dedicated', desc: '10 attempts' },
    grass_master: { icon: '🌟', name: 'Grass Master', desc: '25 successful touches' }
  };

  if (view === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border-2 border-green-200">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-green-800 mb-2">🌱</h1>
            <h2 className="text-3xl font-bold text-green-800 mb-2">Touch Some Grass</h2>
            <p className="text-green-600">Prove you go outside</p>
          </div>
          
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Enter username"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:outline-none"
            />
            <button
              onClick={handleLogin}
              disabled={!usernameInput.trim() || loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-all"
            >
              {loading ? 'Loading...' : 'Start Touching Grass'}
            </button>
          </div>
          
          <p className="text-sm text-gray-500 text-center mt-4">
            No password needed - this is a demo app
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pb-20">
      <div className="max-w-2xl mx-auto p-4">
        <div className="text-center mb-6 pt-6">
          <h1 className="text-4xl font-bold text-green-800 mb-2">🌱 Touch Some Grass</h1>
          <p className="text-green-600">Welcome back, {username}!</p>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-6">
          <button
            onClick={() => setView('main')}
            className={`py-3 px-2 rounded-lg font-semibold transition-all ${
              view === 'main' ? 'bg-green-600 text-white' : 'bg-white text-green-600 border-2 border-green-200'
            }`}
          >
            <Camera className="w-5 h-5 mx-auto mb-1" />
            <span className="text-xs">Camera</span>
          </button>
          <button
            onClick={() => { setView('leaderboard'); loadLeaderboard(); }}
            className={`py-3 px-2 rounded-lg font-semibold transition-all ${
              view === 'leaderboard' ? 'bg-green-600 text-white' : 'bg-white text-green-600 border-2 border-green-200'
            }`}
          >
            <TrendingUp className="w-5 h-5 mx-auto mb-1" />
            <span className="text-xs">Leaders</span>
          </button>
          <button
            onClick={() => setView('gallery')}
            className={`py-3 px-2 rounded-lg font-semibold transition-all ${
              view === 'gallery' ? 'bg-green-600 text-white' : 'bg-white text-green-600 border-2 border-green-200'
            }`}
          >
            <ImageIcon className="w-5 h-5 mx-auto mb-1" />
            <span className="text-xs">Gallery</span>
          </button>
          <button
            onClick={() => setView('profile')}
            className={`py-3 px-2 rounded-lg font-semibold transition-all ${
              view === 'profile' ? 'bg-green-600 text-white' : 'bg-white text-green-600 border-2 border-green-200'
            }`}
          >
            <User className="w-5 h-5 mx-auto mb-1" />
            <span className="text-xs">Profile</span>
          </button>
        </div>

        {view === 'main' && (
          <>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-green-200">
                <p className="text-xs text-gray-600 mb-1">Streak</p>
                <p className="text-2xl font-bold text-green-600">{userData?.streak || 0}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-green-200">
                <p className="text-xs text-gray-600 mb-1">Best</p>
                <p className="text-2xl font-bold text-yellow-600">{userData?.maxStreak || 0}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-green-200">
                <p className="text-xs text-gray-600 mb-1">Success</p>
                <p className="text-2xl font-bold text-blue-600">
                  {userData?.totalAttempts > 0 
                    ? Math.round((userData.successfulTouches / userData.totalAttempts) * 100)
                    : 0}%
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border-2 border-green-200">
              <div className="space-y-3">
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all transform hover:scale-105 shadow-lg"
                >
                  <Camera className="w-6 h-6" />
                  Take Photo
                </button>
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all transform hover:scale-105 shadow-lg"
                >
                  <Upload className="w-6 h-6" />
                  Upload Photo
                </button>

                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>

            {image && (
              <div className="bg-white rounded-2xl shadow-xl p-4 mb-6 border-2 border-green-200">
                <img src={image} alt="Uploaded" className="w-full rounded-lg" />
              </div>
            )}

            {analyzing && (
              <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-green-200 text-center">
                <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
                <p className="text-lg text-gray-600">Analyzing your grass-touching abilities...</p>
              </div>
            )}

            {result && !analyzing && (
              <div className={`rounded-2xl shadow-xl p-6 border-2 ${
                result.touching_grass ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'
              }`}>
                <div className="flex items-center justify-center mb-4">
                  {result.touching_grass ? (
                    <div className="bg-green-500 rounded-full p-4">
                      <Check className="w-10 h-10 text-white" />
                    </div>
                  ) : (
                    <div className="bg-red-500 rounded-full p-4">
                      <X className="w-10 h-10 text-white" />
                    </div>
                  )}
                </div>
                
                <h2 className={`text-2xl font-bold text-center mb-2 ${
                  result.touching_grass ? 'text-green-800' : 'text-red-800'
                }`}>
                  {result.touching_grass ? 'GRASS TOUCHED! ✅' : 'NO GRASS ❌'}
                </h2>
                
                <div className="bg-white rounded-lg p-4 mb-3">
                  <p className="text-gray-600 text-sm">{result.reason}</p>
                </div>
                
                <div className={`rounded-lg p-4 ${
                  result.touching_grass ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <p className={`font-semibold text-sm ${
                    result.touching_grass ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {result.roast_or_praise}
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {view === 'leaderboard' && (
          <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-green-200">
            <h2 className="text-2xl font-bold text-green-800 mb-4 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              Top Grass Touchers
            </h2>
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 text-green-600 animate-spin mx-auto" />
              </div>
            ) : leaderboard.length > 0 ? (
              <div className="space-y-2">
                {leaderboard.map((entry, idx) => (
                  <div key={entry.username} className={`flex items-center gap-3 p-3 rounded-lg ${
                    entry.username === username ? 'bg-green-100 border-2 border-green-400' : 'bg-gray-50'
                  }`}>
                    <div className="text-2xl font-bold text-gray-400 w-8">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{entry.username}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-green-600">{entry.maxStreak}</p>
                      <p className="text-xs text-gray-500">streak</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No entries yet. Be the first!</p>
            )}
          </div>
        )}

        {view === 'gallery' && (
          <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-green-200">
            <h2 className="text-2xl font-bold text-green-800 mb-4">Your History</h2>
            {gallery.length > 0 ? (
              <div className="space-y-3">
                {gallery.map((entry) => (
                  <div key={entry.id} className={`p-4 rounded-lg border-2 ${
                    entry.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${entry.success ? 'bg-green-500' : 'bg-red-500'}`}>
                        {entry.success ? <Check className="w-4 h-4 text-white" /> : <X className="w-4 h-4 text-white" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-1">
                          {new Date(entry.timestamp).toLocaleDateString()} {new Date(entry.timestamp).toLocaleTimeString()}
                        </p>
                        <p className="text-sm text-gray-700 mb-1">{entry.reason}</p>
                        <p className="text-sm font-semibold text-gray-800">{entry.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No history yet. Start touching grass!</p>
            )}
          </div>
        )}

        {view === 'profile' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-green-200">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {username[0].toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-green-800">{username}</h2>
                  <p className="text-sm text-gray-500">
                    Member since {new Date(userData?.joinedDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-3xl font-bold text-green-600">{userData?.totalAttempts || 0}</p>
                  <p className="text-sm text-gray-600">Total Attempts</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-3xl font-bold text-green-600">{userData?.successfulTouches || 0}</p>
                  <p className="text-sm text-gray-600">Successful</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-green-200">
              <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
                <Award className="w-6 h-6" />
                Achievements
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(achievements).map(([key, ach]) => {
                  const unlocked = userData?.achievements?.includes(key);
                  return (
                    <div key={key} className={`p-4 rounded-lg border-2 text-center ${
                      unlocked ? 'bg-yellow-50 border-yellow-400' : 'bg-gray-50 border-gray-200 opacity-50'
                    }`}>
                      <div className="text-3xl mb-2">{ach.icon}</div>
                      <p className="font-bold text-sm text-gray-800">{ach.name}</p>
                      <p className="text-xs text-gray-600">{ach.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}