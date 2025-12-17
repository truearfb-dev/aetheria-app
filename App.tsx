import React, { useState, useEffect } from 'react';
import { AppStage, UserProfile, AppData, DailyPrediction } from './types';
import { getZodiacSign, generateDailyPrediction } from './utils/mystic';
import { initTelegramApp, triggerNotification } from './services/telegram';
import { generateDailyHoroscope } from './services/geminiService';
import StarBackground from './components/StarBackground';
import Onboarding from './components/Onboarding';
import Ritual from './components/Ritual';
import Dashboard from './components/Dashboard';

const STORAGE_KEY = 'aetheria_data';

const App: React.FC = () => {
  const [stage, setStage] = useState<AppStage>(AppStage.ONBOARDING);
  const [userData, setUserData] = useState<AppData | null>(null);
  const [prediction, setPrediction] = useState<DailyPrediction | null>(null);

  useEffect(() => {
    // Initialize Telegram WebApp
    initTelegramApp();

    // Load Data
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data: AppData = JSON.parse(saved);
      const today = new Date().toDateString();
      
      let newData = { ...data };

      // New Day Logic
      if (data.lastVisitDate !== today) {
        newData.visitCount += 1;
        newData.lastVisitDate = today;
        newData.isUnlockedToday = false; // Reset daily unlock
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      }
      
      setUserData(newData);
      setPrediction(generateDailyPrediction(data.user!.zodiacSign));
      setStage(AppStage.DASHBOARD);
    }
  }, []);

  const handleOnboardingComplete = (name: string, dateStr: string) => {
    const zodiac = getZodiacSign(dateStr);
    const userProfile: UserProfile = {
      name,
      birthDate: dateStr,
      zodiacSign: zodiac
    };

    const newData: AppData = {
      user: userProfile,
      visitCount: 1,
      lastVisitDate: new Date().toDateString(),
      isPremium: false,
      isUnlockedToday: false
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    setUserData(newData);
    setPrediction(generateDailyPrediction(zodiac));
    setStage(AppStage.RITUAL);
  };

  const handleRitualStart = async () => {
    if (!userData || !prediction) return;
    try {
        const aiText = await generateDailyHoroscope(userData.user!.zodiacSign, userData.user!.name);
        if (aiText) {
            setPrediction(prev => prev ? { ...prev, text: aiText } : null);
        }
    } catch (e) {
        console.error("AI fetch failed during ritual", e);
    }
  };

  const handleRitualComplete = () => {
    triggerNotification('success');
    setStage(AppStage.DASHBOARD);
  };

  // Option 1: Buy Premium (Lifetime)
  const handleUnlockPremium = () => {
    if (userData) {
      const updatedData = { ...userData, isPremium: true };
      setUserData(updatedData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
      triggerNotification('success');
      alert("✨ Премиум активирован! Все тайны вселенной теперь доступны.");
    }
  };

  // Option 2: Subscribe to Channel (Daily Unlock)
  const handleUnlockDaily = () => {
    if (userData) {
        const updatedData = { ...userData, isUnlockedToday: true };
        setUserData(updatedData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
        triggerNotification('success');
    }
  }

  const handleResetApp = () => {
    if (window.confirm("Вы уверены? Это сотрет ваши данные и прогресс.")) {
        triggerNotification('warning');
        localStorage.removeItem(STORAGE_KEY);
        setUserData(null);
        setPrediction(null);
        setStage(AppStage.ONBOARDING);
    }
  };

  // Locking Logic:
  // Locked if: Not Premium AND visited more than 3 times AND hasn't unlocked today
  const isLocked = userData 
    ? !userData.isPremium && userData.visitCount > 0 && !userData.isUnlockedToday 
    : false;

  return (
    <main className="min-h-screen w-full relative overflow-hidden bg-void">
      <StarBackground />
      
      {stage === AppStage.ONBOARDING && (
        <Onboarding onComplete={handleOnboardingComplete} />
      )}

      {stage === AppStage.RITUAL && userData && (
        <Ritual 
            zodiac={userData.user!.zodiacSign} 
            onStart={handleRitualStart}
            onComplete={handleRitualComplete} 
        />
      )}

      {stage === AppStage.DASHBOARD && userData && prediction && (
        <Dashboard 
          user={userData.user!} 
          prediction={prediction}
          isLocked={isLocked} 
          onUnlockPremium={handleUnlockPremium}
          onUnlockDaily={handleUnlockDaily}
          onReset={handleResetApp}
        />
      )}
    </main>
  );
};

export default App;
