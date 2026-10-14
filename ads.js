/* =====================================================================
   Pile-Poil · pubs
   ---------------------------------------------------------------------
   Tout ce qui concerne la publicité est ici. Le jeu n'appelle que :
     TZAds.real()                        -> true si de vraies pubs sont actives
     TZAds.rewarded(onReward, onFail)    -> vidéo récompensée (indices, passer)
     TZAds.interstitial(onDone)          -> pub entre deux niveaux (toutes les 4 parties)
     TZAds.externalConsent()             -> true si la fenêtre de consentement
                                            est gérée par Google (CMP certifiée)
     TZAds.showConsent()                 -> rouvre les choix de confidentialité Google

   Deux modes réels, choisis automatiquement :
     • sur le site web          -> AdSense « H5 Games Ads » (provider: 'adsense')
     • dans l'app Android       -> AdMob (détecté tout seul quand le jeu tourne
                                    dans l'app Capacitor)

   À REMPLIR quand tes comptes sont validés :
     client          : ton ID éditeur AdSense, ex. 'ca-pub-1234567890123456'
     admob.rewarded  : ID du bloc d'annonces « avec récompense » AdMob
     admob.interstitial : ID du bloc « interstitiel » AdMob
     test / admob.testing : true pendant tes essais, false une fois publié
   (Les ID AdMob ci-dessous sont les ID DE TEST officiels de Google.)
   ===================================================================== */
window.TZ_ADS_CONFIG = {
  provider: 'simulated',            // site web : 'simulated' (démo) ou 'adsense'
  client: 'ca-pub-XXXXXXXXXXXXXXXX',// <- ton ID éditeur AdSense
  test: true,                       // pubs de test AdSense (data-adbreak-test="on")
  frequencyHint: '30s',
  admob: {
    rewarded: 'ca-app-pub-3940256099942544/5224354917',     // test Google
    interstitial: 'ca-app-pub-3940256099942544/1033173712', // test Google
    testing: true
  }
};

(function () {
  const C = window.TZ_ADS_CONFIG;
  const cap = window.Capacitor, native = !!(cap && cap.isNativePlatform && cap.isNativePlatform());
  const AM = native && cap.Plugins && cap.Plugins.AdMob;
  const mode = AM ? 'admob' : (C.provider === 'adsense' && !/X{6,}/.test(C.client) ? 'adsense' : 'simulated');
  const pauseGame = () => { try { window.dispatchEvent(new Event('tz-ad-start')); } catch (e) {} };
  const resumeGame = () => { try { window.dispatchEvent(new Event('tz-ad-end')); } catch (e) {} };

  /* ---------- AdSense H5 Games Ads (site web) ---------- */
  if (mode === 'adsense') {
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + encodeURIComponent(C.client);
    s.crossOrigin = 'anonymous';
    s.setAttribute('data-ad-client', C.client);
    s.setAttribute('data-ad-frequency-hint', C.frequencyHint);
    if (C.test) s.setAttribute('data-adbreak-test', 'on');
    document.head.appendChild(s);
    window.adsbygoogle = window.adsbygoogle || [];
    window.adBreak = window.adConfig = function (o) { window.adsbygoogle.push(o); };
    window.adConfig({ preloadAdBreaks: 'on', sound: 'on' });
  }

  /* ---------- AdMob (app Android via Capacitor) ---------- */
  let amReady = null;
  if (mode === 'admob') {
    amReady = (async () => {
      try {
        await AM.initialize({ initializeForTesting: !!C.admob.testing });
        // fenêtre de consentement Google (UMP), configurée dans AdMob > Confidentialité et messages
        const info = await AM.requestConsentInfo();
        if (info && info.isConsentFormAvailable && info.status === 'REQUIRED') await AM.showConsentForm();
      } catch (e) {}
    })();
  }

  window.TZAds = {
    real: () => mode !== 'simulated',
    externalConsent: () => mode !== 'simulated',
    showConsent() {
      if (mode === 'admob') { try { (AM.showPrivacyOptionsForm || AM.showConsentForm).call(AM); } catch (e) {} return; }
      window.googlefc = window.googlefc || {};
      window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];
      window.googlefc.callbackQueue.push(() => { try { window.googlefc.showRevocationMessage(); } catch (e) {} });
    },
    setSound(on) { if (mode === 'adsense') window.adConfig({ sound: on ? 'on' : 'off' }); },

    rewarded(onReward, onFail) {
      if (mode === 'admob') {
        (async () => {
          try {
            await amReady; pauseGame();
            await AM.prepareRewardVideoAd({ adId: C.admob.rewarded, isTesting: !!C.admob.testing });
            const reward = await AM.showRewardVideoAd();
            resumeGame();
            if (reward) onReward && onReward(); else onFail && onFail('dismissed');
          } catch (e) { resumeGame(); onFail && onFail('error'); }
        })();
        return;
      }
      if (mode !== 'adsense') return onFail && onFail('simulated');
      let rewarded = false;
      window.adBreak({
        type: 'reward', name: 'tz_reward', beforeAd: pauseGame, afterAd: resumeGame,
        beforeReward: (showAdFn) => showAdFn(),
        adViewed: () => { rewarded = true; },
        adDismissed: () => { rewarded = false; },
        adBreakDone: (info) => { if (rewarded) onReward && onReward(); else onFail && onFail(info && info.breakStatus); }
      });
    },

    interstitial(onDone) {
      let done = false;
      const finish = () => { if (!done) { done = true; resumeGame(); onDone && onDone(); } };
      if (mode === 'admob') {
        setTimeout(finish, 45000); // sécurité : ne jamais bloquer le joueur
        (async () => {
          try {
            await amReady;
            const h1 = await AM.addListener('interstitialAdDismissed', () => { try { h1.remove(); } catch (e) {} finish(); });
            const h2 = await AM.addListener('interstitialAdFailedToShow', () => { try { h2.remove(); } catch (e) {} finish(); });
            await AM.prepareInterstitial({ adId: C.admob.interstitial, isTesting: !!C.admob.testing });
            pauseGame(); await AM.showInterstitial();
          } catch (e) { finish(); }
        })();
        return;
      }
      if (mode !== 'adsense') return onDone && onDone();
      setTimeout(finish, 12000);
      window.adBreak({ type: 'next', name: 'tz_between_levels', beforeAd: pauseGame, afterAd: resumeGame, adBreakDone: finish });
    }
  };
})();
