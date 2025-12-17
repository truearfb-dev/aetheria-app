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
      
      // Update visit logic
      let newData = { ...data };
      if (data.lastVisitDate !== today) {
        newData.visitCount += 1;
        newData.lastVisitDate = today;
        // Reset daily text if it's a new day so we generate a new one
        if (prediction) {
            // Logic handled when generating prediction
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      }
      
      setUserData(newData);
      
      // Check if we have a generated text for today already stored in prediction?
      // For simplicity, we regenerate base stats deterministically, and if AI text is missing, Dashboard handles it or we re-run ritual logic if needed. 
      // Current simple logic: Just load dashboard.
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
      isPremium: false
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    setUserData(newData);
    
    // Generate base stats immediately
    setPrediction(generateDailyPrediction(zodiac));
    
    // Move to Ritual
    setStage(AppStage.RITUAL);
  };

  // This function runs while the Ritual animation is playing
  const handleRitualStart = async () => {
    if (!userData || !prediction) return;
    
    // AI Generation happening in background
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

  const handleUnlockPremium = () => {
    if (userData) {
      const updatedData = { ...userData, isPremium: true };
      setUserData(updatedData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
      triggerNotification('success');
      alert("Оплата прошла успешно! Руководство разблокировано.");
    }
  };

  const handleResetApp = () => {
    if (window.confirm("Вы уверены? Это сотрет ваши данные и прогресс.")) {
        triggerNotification('warning');
        localStorage.removeItem(STORAGE_KEY);
        setUserData(null);
        setPrediction(null);
        setStage(AppStage.ONBOARDING);
    }
  };

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
          isLocked={userData.visitCount >= 4 && !userData.isPremium} 
          onUnlock={handleUnlockPremium}
          onReset={handleResetApp}
        />
      )}
    </main>
  );
};

export default App;