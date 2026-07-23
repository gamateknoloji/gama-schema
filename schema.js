(function () {
  "use strict";

  const BASE = "https://www.gamateknoloji.com";
  const ORG_ID = BASE + "/#organization";
  const WEBSITE_ID = BASE + "/#website";
  const SCRIPT_ID = "gama-schema-body";

  function normalizePath(pathname) {
    const p = String(pathname || "/").replace(/\/+$/, "");
    return p || "/";
  }

  function absoluteUrl(value) {
    if (!value) return "";
    try {
      return new URL(value, BASE).href;
    } catch (error) {
      return "";
    }
  }

  function metaContent(selector) {
    const element = document.querySelector(selector);
    return element ? String(element.getAttribute("content") || "").trim() : "";
  }

  function canonicalUrl() {
    const canonical = document.querySelector('link[rel="canonical"]');
    return absoluteUrl(canonical ? canonical.getAttribute("href") : window.location.href);
  }

  function pageTitle() {
    const heading = document.querySelector("h1");
    const raw =
      (heading && heading.textContent.trim()) ||
      metaContent('meta[property="og:title"]') ||
      document.title ||
      "";
    return raw.replace(/\s*[-–|]\s*Gama Teknoloji\s*$/i, "").trim();
  }

  function pageDescription() {
    const element = document.querySelector(
      '[itemprop="description"], .urun-aciklama, .product-description, ' +
      '.blog-content p, article p, main p'
    );
    const raw =
      (element && element.textContent.trim()) ||
      metaContent('meta[name="description"]') ||
      metaContent('meta[property="og:description"]') ||
      "";
    return raw.replace(/\s+/g, " ").trim();
  }

  function representativeImage() {
    const candidates = [
      metaContent('meta[property="og:image"]'),
      metaContent('meta[name="twitter:image"]')
    ];

    const element = document.querySelector(
      '[itemprop="image"][content], [itemprop="image"][src], ' +
      '.urun-detay img[src], .product-detail img[src], article img[src], main img[src]'
    );

    if (element) {
      candidates.push(
        element.getAttribute("content") ||
        element.getAttribute("src") ||
        ""
      );
    }

    for (const candidate of candidates) {
      const url = absoluteUrl(candidate);
      if (
        url &&
        !/\/Images\/Firma\/ust_logo\.png(?:\?|$)/i.test(url) &&
        !/\/img\/logo\.png(?:\?|$)/i.test(url) &&
        /\.(?:jpe?g|png|webp|gif|avif)(?:\?|$)/i.test(url)
      ) {
        return url;
      }
    }
    return "";
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

  function containsType(value, type) {
    return Array.isArray(value) ? value.includes(type) : value === type;
  }

  /*
   * Önceden bütün sayfalara eklenen sabit Product bloklarını temizler.
   * Head alanındaki @id içeren Organization / LocalBusiness / WebSite koduna dokunmaz.
   */
  function cleanupLegacyProductSchemas() {
    const oldProductUrls = new Set([
      BASE + "/urun/fotoselli-kronometre-cift-kapili",
      BASE + "/urun/profesyonel-cok-amacli-spor-salonu-skorbordu-300x170cm",
      BASE + "/urun/futbol-skorbord-400x200cm"
    ]);

    document
      .querySelectorAll('script[type="application/ld+json"]')
      .forEach(function (script) {
        if (script.id === SCRIPT_ID || script.id === "gama-schema-faq") return;

        let data;
        try {
          data = JSON.parse(script.textContent);
        } catch (error) {
          return;
        }

        const nodes =
          data && Array.isArray(data["@graph"]) ? data["@graph"] : [data];

        const isOldFixedProduct = nodes.some(function (node) {
          if (!node || typeof node !== "object") return false;
          if (!containsType(node["@type"], "Product")) return false;

          const url = String(node.url || "").replace(/\/+$/, "");
          return oldProductUrls.has(url);
        });

        const isOldCatalog = nodes.some(function (node) {
          return Boolean(
            node &&
            typeof node === "object" &&
            node.name === "Gama Teknoloji" &&
            node.hasOfferCatalog
          );
        });

        if (isOldFixedProduct || isOldCatalog) script.remove();
      });
  }

  function breadcrumbNode(items) {
    return {
      "@type": "BreadcrumbList",
      "@id": canonicalUrl() + "#breadcrumb",
      "itemListElement": items.map(function (item, index) {
        const node = {
          "@type": "ListItem",
          "position": index + 1,
          "name": item.name
        };
        const itemUrl = absoluteUrl(item.url);
        if (itemUrl) node.item = itemUrl;
        return node;
      })
    };
  }

  function parsePrice(raw) {
    if (!raw) return "";

    let value = String(raw).replace(/[^0-9.,]/g, "").trim();
    if (!value) return "";

    if (value.includes(",") && value.includes(".")) {
      if (value.lastIndexOf(",") > value.lastIndexOf(".")) {
        value = value.replace(/\./g, "").replace(",", ".");
      } else {
        value = value.replace(/,/g, "");
      }
    } else if (value.includes(",")) {
      const parts = value.split(",");
      value =
        parts.length === 2 && parts[1].length <= 2
          ? parts[0].replace(/\./g, "") + "." + parts[1]
          : value.replace(/,/g, "");
    } else if ((value.match(/\./g) || []).length > 1) {
      value = value.replace(/\./g, "");
    } else if (/^\d{1,3}\.\d{3}$/.test(value)) {
      value = value.replace(".", "");
    }

    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? String(number) : "";
  }

  function extractedPrice() {
    const candidates = [
      metaContent('meta[property="product:price:amount"]'),
      metaContent('meta[itemprop="price"]')
    ];

    const selectors = [
      '[itemprop="price"][content]',
      '[itemprop="price"]',
      '[data-price]',
      '.urun-fiyat',
      '.urun-detay-fiyat',
      '.product-price',
      '.new-price',
      '.price',
      '.fiyat'
    ];

    selectors.forEach(function (selector) {
      const element = document.querySelector(selector);
      if (element) {
        candidates.push(
          element.getAttribute("content") ||
          element.getAttribute("data-price") ||
          element.textContent ||
          ""
        );
      }
    });

    for (const candidate of candidates) {
      const price = parsePrice(candidate);
      if (price) return price;
    }
    return "";
  }

  function extractedSku() {
    const candidates = [
      metaContent('meta[property="product:retailer_item_id"]'),
      metaContent('meta[itemprop="sku"]')
    ];

    const element = document.querySelector('[itemprop="sku"], [data-sku]');
    if (element) {
      candidates.push(
        element.getAttribute("content") ||
        element.getAttribute("data-sku") ||
        element.textContent ||
        ""
      );
    }

    return (
      candidates
        .map(function (value) {
          return String(value || "").trim();
        })
        .find(Boolean) || ""
    );
  }

  function visibleCategory() {
    const currentPath = normalizePath(window.location.pathname);
    const links = Array.from(
      document.querySelectorAll(
        '.breadcrumb a, .breadcrumbs a, nav[aria-label*="breadcrumb" i] a, [class*="bread"] a'
      )
    ).filter(function (link) {
      try {
        return normalizePath(new URL(link.href, BASE).pathname) !== currentPath;
      } catch (error) {
        return false;
      }
    });

    const item = links.length ? links[links.length - 1] : null;
    return item
      ? { name: item.textContent.trim(), url: item.href }
      : null;
  }

  function availabilityUrl() {
    const meta = metaContent('meta[property="product:availability"]');

    if (/out.of.stock|stokta.yok/i.test(meta)) {
      return "https://schema.org/OutOfStock";
    }
    if (/in.stock|stokta/i.test(meta)) {
      return "https://schema.org/InStock";
    }

    const text = (document.body.innerText || "").toLocaleLowerCase("tr-TR");
    if (/stokta\s*yok|tükendi|satışa\s*kapalı/.test(text)) {
      return "https://schema.org/OutOfStock";
    }
    if (/stokta|sepete\s*ekle|satın\s*al/.test(text)) {
      return "https://schema.org/InStock";
    }

    return "";
  }

  const PRODUCT_DETAILS = {
    "/urun/fotoselli-kronometre-cift-kapili": {
      alternateName: "GAMATEK Çift Kapılı Fotoselli Kronometre",
      sku: "GMTEK-FKC-001",
      category: {
        name: "Performans Ölçüm Cihazları ve Kronometreler",
        url: BASE + "/kategori/performans-olcum-cihazlari-ve-kronometreler"
      },
      properties: [
        ["Hassasiyet", "0,01 saniye"],
        ["Kablosuz Menzil", "200 metre"],
        ["Üretim Yeri", "Antalya, Türkiye"],
        ["Garanti", "2 yıl"]
      ]
    },
    "/urun/profesyonel-cok-amacli-spor-salonu-skorbordu-300x170cm": {
      alternateName: "GAMATEK 5 Branşlı Profesyonel Skorbord",
      sku: "GMTEK-PSK-300170",
      category: {
        name: "Skorbord Sistemleri",
        url: BASE + "/kategori/skorbord-sistemleri"
      },
      properties: [
        ["Boyut", "300x170 cm"],
        ["Rakam Yüksekliği", "30 cm"],
        ["Desteklenen Branşlar", "Basketbol, Voleybol, Hentbol, Tenis, Güreş"],
        ["Garanti", "2 yıl"]
      ]
    },
    "/urun/futbol-skorbord-400x200cm": {
      alternateName: "GAMATEK Stadyum Futbol Skorbordu",
      sku: "GMTEK-FSK-400200",
      category: {
        name: "Futbol Skorbordları",
        url: BASE + "/kategori/futbol-skorbordlari"
      },
      properties: [
        ["Boyut", "400x200 cm"],
        ["Koruma Sınıfı", "IP65"],
        ["Görünürlük Mesafesi", "200-250 metre"],
        ["Garanti", "2 yıl"]
      ]
    }
  };

  function productNode(path) {
    const details = PRODUCT_DETAILS[path] || null;
    const name = pageTitle();
    const description = pageDescription();
    const image = representativeImage();
    const price = extractedPrice();
    const sku = (details && details.sku) || extractedSku();
    const category = (details && details.category) || visibleCategory();

    /*
     * Yanlış ürün verisi üretmemek için ad, açıklama, gerçek ürün görseli
     * veya görünür fiyat okunamazsa Product oluşturulmaz.
     */
    if (!name || !description || !image || !price) return null;

    const offer = {
      "@type": "Offer",
      "url": canonicalUrl(),
      "priceCurrency": "TRY",
      "price": price,
      "itemCondition": "https://schema.org/NewCondition",
      "seller": { "@id": ORG_ID }
    };

    const availability = availabilityUrl();
    if (availability) offer.availability = availability;

    const product = {
      "@type": "Product",
      "@id": canonicalUrl() + "#product",
      "name": name,
      "description": description,
      "url": canonicalUrl(),
      "image": [image],
      "brand": {
        "@type": "Brand",
        "name": "GAMATEK"
      },
      "manufacturer": { "@id": ORG_ID },
      "countryOfOrigin": {
        "@type": "Country",
        "name": "Türkiye"
      },
      "offers": offer
    };

    if (details && details.alternateName) {
      product.alternateName = details.alternateName;
    }
    if (sku) product.sku = sku;
    if (category && category.name) product.category = category.name;

    if (details && details.properties) {
      product.additionalProperty = details.properties.map(function (property) {
        return {
          "@type": "PropertyValue",
          "name": property[0],
          "value": property[1]
        };
      });
    }

    return product;
  }

  function findPublishedDate() {
    const meta =
      metaContent('meta[property="article:published_time"]') ||
      metaContent('meta[name="date"]');

    if (meta) return meta;

    const time = document.querySelector("time[datetime]");
    if (time) return time.getAttribute("datetime");

    const match = (document.body.innerText || "").match(
      /\b(\d{2})\.(\d{2})\.(\d{4})\b/
    );

    return match
      ? match[3] + "-" + match[2] + "-" + match[1]
      : "";
  }

  function blogPostingNode() {
    const node = {
      "@type": "BlogPosting",
      "@id": canonicalUrl() + "#article",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": canonicalUrl()
      },
      "headline": pageTitle(),
      "description": pageDescription(),
      "url": canonicalUrl(),
      "author": { "@id": ORG_ID },
      "publisher": { "@id": ORG_ID },
      "isPartOf": { "@id": WEBSITE_ID },
      "inLanguage": "tr-TR"
    };

    const image = representativeImage();
    if (image) node.image = [image];

    const published = findPublishedDate();
    if (published) node.datePublished = published;

    const modified = metaContent('meta[property="article:modified_time"]');
    if (modified) node.dateModified = modified;

    return node;
  }

  function run() {
    cleanupLegacyProductSchemas();

    const path = normalizePath(window.location.pathname);
    const graph = [];

    if (path === "/sayfa/hakkimizda") {
      graph.push(
        breadcrumbNode([
          { name: "Ana Sayfa", url: BASE + "/" },
          { name: "Hakkımızda", url: canonicalUrl() }
        ])
      );
    } else if (/^\/urun\//.test(path)) {
      const product = productNode(path);
      const category =
        (PRODUCT_DETAILS[path] && PRODUCT_DETAILS[path].category) ||
        visibleCategory();

      const crumbs = [{ name: "Ana Sayfa", url: BASE + "/" }];
      if (category && category.name && category.url) crumbs.push(category);
      crumbs.push({ name: pageTitle(), url: canonicalUrl() });

      if (product) graph.push(product);
      graph.push(breadcrumbNode(crumbs));
    } else if (/^\/kategori\//.test(path)) {
      graph.push(
        {
          "@type": "CollectionPage",
          "@id": canonicalUrl() + "#collection",
          "url": canonicalUrl(),
          "name": pageTitle(),
          "description": pageDescription(),
          "isPartOf": { "@id": WEBSITE_ID },
          "inLanguage": "tr-TR"
        },
        breadcrumbNode([
          { name: "Ana Sayfa", url: BASE + "/" },
          { name: pageTitle(), url: canonicalUrl() }
        ])
      );
    } else if (/^\/blog\//.test(path) && path !== "/blog") {
      graph.push(
        blogPostingNode(),
        breadcrumbNode([
          { name: "Ana Sayfa", url: BASE + "/" },
          { name: "Blog", url: BASE + "/blog" },
          { name: pageTitle(), url: canonicalUrl() }
        ])
      );
    }

    if (graph.length) {
      addJsonLd({
        "@context": "https://schema.org",
        "@graph": graph
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }
})();
