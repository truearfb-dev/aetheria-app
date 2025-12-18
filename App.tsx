import React, { useState, useEffect } from 'react';
import { AppStage, UserProfile, AppData, DailyPrediction } from './types';
import { getZodiacSign, generateDailyPrediction } from './utils/mystic';
import { initTelegramApp, triggerNotification, triggerHaptic } from './services/telegram';
import { generateDailyHoroscope } from './services/geminiService';
import { handlePayment } from './services/payment';
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
    initTelegramApp();
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data: AppData = JSON.parse(saved);
      const today = new Date().toDateString();
      let newData = { ...data };
      if (data.lastVisitDate !== today) {
        newData.visitCount += 1;
        newData.lastVisitDate = today;
        newData.isUnlockedToday = false;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      }
      setUserData(newData);
      // Сначала генерируем базовое, потом ритуал обновит его через AI
      setPrediction(generateDailyPrediction(data.user!.zodiacSign));
      setStage(AppStage.DASHBOARD);
    }
  }, []);

  const handleOnboardingComplete = (name: string, dateStr: string) => {
    const zodiac = getZodiacSign(dateStr);
    const userProfile: UserProfile = { name, birthDate: dateStr, zodiacSign: zodiac };
    const newData: AppData = {
      user: userProfile,
      visitCount: 1,
      lastVisitDate: new Date().toDateString(),
      isPremium: false,
      isUnlockedToday: false,
      oracleTokens: 0
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    setUserData(newData);
    setPrediction(generateDailyPrediction(zodiac));
    setStage(AppStage.RITUAL);
  };

  const handleRitualStart = async () => {
    if (!userData || !prediction) return;
    try {
        const aiText = await generateDailyHoroscope(
            userData.user!.zodiacSign, 
            userData.user!.name,
            userData.user!.birthDate
        );
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

  const saveUserData = (data: AppData) => {
      setUserData(data);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const handleUnlockPremium = () => {
    if (!userData) return;
    handlePayment('premium_lifetime', 
        () => {
            saveUserData({ ...userData, isPremium: true });
            triggerNotification('success');
        },
        () => triggerNotification('error')
    );
  };

  const handleSingleUnlock = () => {
    if (!userData) return;
    handlePayment('tokens_pack_small',
        () => {
            saveUserData({ ...userData, isUnlockedToday: true });
            triggerNotification('success');
        },
        () => triggerNotification('error')
    );
  };

  const handleUnlockDaily = () => {
    if (userData) {
        saveUserData({ ...userData, isUnlockedToday: true });
        triggerNotification('success');
    }
  };

  const handleResetApp = () => {
    triggerHaptic('rigid');
    if (window.confirm("Очистить астральный след? Это позволит начать новый путь.")) {
        localStorage.removeItem(STORAGE_KEY);
        setUserData(null);
        setPrediction(null);
        setStage(AppStage.ONBOARDING);
    }
  };

  const isLocked = userData ? !userData.isPremium && !userData.isUnlockedToday : false;

  return (
    <main className="min-h-screen w-full relative overflow-hidden bg-void">
      <StarBackground />
      {stage === AppStage.ONBOARDING && <Onboarding onComplete={handleOnboardingComplete} />}
      {stage === AppStage.RITUAL && userData && (
        <Ritual zodiac={userData.user!.zodiacSign} onStart={handleRitualStart} onComplete={handleRitualComplete} />
      )}
      {stage === AppStage.DASHBOARD && userData && prediction && (
        <Dashboard 
          key={prediction.text.substring(0, 20)} // Форсируем перерисовку при смене текста
          user={userData.user!} 
          prediction={prediction}
          isLocked={isLocked}
          visitCount={userData.visitCount}
          onUnlockPremium={handleUnlockPremium}
          onUnlockDaily={handleUnlockDaily}
          onSingleUnlock={handleSingleUnlock}
          onReset={handleResetApp}
        />
      )}
    </main>
  );
};

export default App;