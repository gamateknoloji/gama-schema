(function() {
  var faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Fotoselli kronometre nasil calisir?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Fotoselli kronometreler, atlet belirlenen mesafeyi gecerken isik huzmesini keserek tetiklenen sensorler araciligiyla milisaniye hassasiyetinde sure olcumu yapar. Baslangic ve bitis noktasina yerlestirilen sensorler kablosuz olarak birbirine bagli olup olcum sonuclari el terminali, PC veya mobil uygulama uzerinden aninda goruntulenir. BESYO ve profesyonel atletizm testlerinde manuel kronometre hatalarini tamamen ortadan kaldirir."
        }
      },
      {
        "@type": "Question",
        "name": "BESYO sinavi icin hangi ekipmanlar gerekir?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "BESYO beden egitimi giris sinavi icin fotoselli kronometre sistemi, dikey sicrama olcum sensoru ve sprint olcum ekipmanlari gereklidir. Fotoselli kronometre 30 metre ve 60 metre sprint testlerinde, dikey sicrama sensoru ise dikey atlama testinde kullanilir. Gama Teknoloji bu ekipmanlarin tamamini yurt ici uretim olarak sunmaktadir."
        }
      },
      {
        "@type": "Question",
        "name": "Hali saha skorbord secerken nelere dikkat edilmeli?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Hali saha skorbord seciminde once tesisin boyutuna uygun ekran boyutu belirlenmelidir. Dis mekanda kullanilacaksa yuksek parlaklikh ve su gecirmez (IP65 veya uzeri) olmasi sart. Kablosuz kontrol ozelligi, kolay kurulum ve yedek parca temin imkani da onemli kriterlerdir. Yerli uretim skorbordlarda teknik servis ve yedek parca temini cok daha hizli saglanir."
        }
      },
      {
        "@type": "Question",
        "name": "Kazasiz is gunu panosu nedir ve nasil kullanilir?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Kazasiz is gunu panosu, fabrikalarda ve uretim tesislerinde kaza olmadan gecen gun sayisini gostererek is guvenligi kulturu olusturmaya yardimci olan LED ekranli bir sayac sistemidir. Panoya bagli kontrol unitesi uzerinden gun sayaci sifirlanabilir veya guncellenebilir. Calisanlarin is guvenligi bilincini artirmak ve yasal IS-SG gerekliliklerini karsilamak icin kullanilir."
        }
      },
      {
        "@type": "Question",
        "name": "Akaryakit fiyat panosu nasil calisir?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Akaryakit fiyat panolari, benzin istasyonlarinda yakit fiyatlarini yuksek parlaklikli LED ekranlarla gosterir. Uzaktan kumanda veya yazilim araciligiyla fiyatlar aninda guncellenebilir. Yuksek parlaklik ozelligi sayesinde gunes isiginda bile net okunabilirlik saglar. Gama Teknoloji akaryakit fiyat panolari IP65 koruma sinifinda uretilerek dis hava kosullarinda uzun omurlu kullanim sunar."
        }
      },
      {
        "@type": "Question",
        "name": "Yerli uretim skorbord ile ithal urun arasindaki fark nedir?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yerli uretim skorbordlarin en buyuk avantaji hizli teknik servis ve yedek parca temindir. Ithal urunlerde yedek parca bulmak aylar surebilirken yerli uretimde ayni gun veya ertesi gun cozum saglanabilir. Aracilik olmadigi icin fiyatlar daha uygun, yazilim guncelllemeleri ucretsiz yapilabilir. Gama Teknoloji tum elektronik kartlarini, yazilimini ve mekanik aksamini kendi tesisinde uretmektedir."
        }
      }
    ]
  };

  var script = document.createElement('script');
  script.type = 'application/ld+json';
  script.text = JSON.stringify(faqSchema);
  document.head.appendChild(script);
})();
