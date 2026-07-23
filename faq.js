(function () {
  "use strict";

  const ALLOWED_PATH = "/sayfa/hakkimizda";
  const SCRIPT_ID = "gama-schema-faq";

  function normalizePath(pathname) {
    const p = String(pathname || "/").replace(/\/+$/, "");
    return p || "/";
  }

  function canonicalUrl() {
    const canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) return window.location.href;
    try {
      return new URL(canonical.getAttribute("href"), window.location.origin).href;
    } catch (error) {
      return window.location.href;
    }
  }

  function normalizeText(value) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .trim()
      .toLocaleLowerCase("tr-TR");
  }

  function addJsonLd(data) {
    const old = document.getElementById(SCRIPT_ID);
    if (old) old.remove();

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = SCRIPT_ID;
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  }

  function collectFromSemanticElements() {
    const pairs = [];

    document
      .querySelectorAll(
        'details, .faq-item, .sss-item, [itemprop="mainEntity"], [class*="faq-item"], [class*="sss-item"]'
      )
      .forEach(function (container) {
        const question =
          container.querySelector(
            'summary, [itemprop="name"], .question, .soru, h2, h3, h4'
          );
        const answer =
          container.querySelector(
            '[itemprop="acceptedAnswer"], [itemprop="text"], .answer, .cevap, p'
          );

        const questionText = question ? question.textContent.trim() : "";
        const answerText = answer ? answer.textContent.trim() : "";

        if (
          questionText.length >= 8 &&
          answerText.length >= 20 &&
          questionText !== answerText
        ) {
          pairs.push([questionText, answerText]);
        }
      });

    return pairs;
  }

  /*
   * Hakkımızda sayfasında halen kullanıcıya görünür olan soru-cevaplar.
   * Her çift, sayfa metninde hem soru hem cevap bulunduğunda işaretlenir.
   */
  const VISIBLE_FAQ = [
    [
      "Gama Teknoloji ne zaman kuruldu?",
      "Gama Teknoloji, 2005 yılında Antalya'da kurulmuştur. 20 yılı aşkın üretim deneyimiyle Türkiye'nin köklü yerli elektronik üreticileri arasında yer almaktadır."
    ],
    [
      "Ürünler nereden üretiliyor?",
      "Tüm ürünlerimiz Antalya Kemer'deki kendi üretim tesisimizde, yerli mühendisler tarafından tasarlanıp üretilmektedir. Elektronik kart tasarımından yazılım geliştirmeye kadar tüm süreçler şirket bünyesinde yürütülmektedir."
    ],
    [
      "Türkiye'nin her iline hizmet veriyor musunuz?",
      "Evet. Türkiye'nin 81 iline ürün teslimatı ve teknik servis sağlamaktayız."
    ],
    [
      "BESYO sınavı için uygun kronometreler satıyor musunuz?",
      "Evet. Fotoselli kronometre sistemlerimiz, BESYO fiziksel yetenek sınavlarında kullanılan ölçüm standartlarına uygun olarak tasarlanmıştır. Hem bireysel antrenörler hem de eğitim kurumları için uygun modeller mevcuttur."
    ],
    [
      "Kurumsal ve endüstriyel projeler için özel üretim yapıyor musunuz?",
      "Evet. Fabrikalar, spor kompleksleri ve akaryakıt istasyonları gibi kurumsal projeler için özel boyut, renk ve yazılım özellikleriyle ürün üretiyoruz."
    ]
  ];

  function collectVisibleFallback() {
    const bodyText = normalizeText(document.body.innerText);
    return VISIBLE_FAQ.filter(function (pair) {
      return (
        bodyText.includes(normalizeText(pair[0])) &&
        bodyText.includes(normalizeText(pair[1]))
      );
    });
  }

  function uniquePairs(pairs) {
    const seen = new Set();

    return pairs.filter(function (pair) {
      const key = normalizeText(pair[0]);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function run() {
    if (normalizePath(window.location.pathname) !== ALLOWED_PATH) return;

    let pairs = collectFromSemanticElements();
    if (!pairs.length) pairs = collectVisibleFallback();
    pairs = uniquePairs(pairs);

    if (!pairs.length) return;

    addJsonLd({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": canonicalUrl() + "#faq",
      "mainEntity": pairs.map(function (pair) {
        return {
          "@type": "Question",
          "name": pair[0],
          "acceptedAnswer": {
            "@type": "Answer",
            "text": pair[1]
          }
        };
      })
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }
})();
