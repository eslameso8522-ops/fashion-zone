/**
 * Fashion Zone - WhatsApp Group Products & Media Extractor (PRO Extension)
 * Injected into https://web.whatsapp.com/*
 */

(function initWhatsAppScraperExtension() {
  console.log('[Fashion Zone Extractor] Extension loaded on WhatsApp Web.');

  // 1. In-Memory CRC32 & Pure JS ZIP Builder
  function crc32(bytes) {
    let table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      table[i] = c;
    }
    let crc = 0 ^ (-1);
    for (let i = 0; i < bytes.length; i++) crc = (crc >>> 8) ^ table[(crc ^ bytes[i]) & 0xFF];
    return (crc ^ (-1)) >>> 0;
  }

  class SimpleZip {
    constructor() { this.files = []; }
    add(filename, uint8Data) {
      this.files.push({ name: filename, data: uint8Data });
    }
    buildBlob() {
      const parts = [];
      const centralHeaders = [];
      let offset = 0;

      for (const f of this.files) {
        const nameBytes = new TextEncoder().encode(f.name);
        const crc = crc32(f.data);
        const size = f.data.length;

        // Local Header
        const lh = new Uint8Array(30 + nameBytes.length);
        const dv = new DataView(lh.buffer);
        dv.setUint32(0, 0x04034b50, true);
        dv.setUint16(4, 20, true);
        dv.setUint16(8, 0, true);
        dv.setUint32(14, crc, true);
        dv.setUint32(18, size, true);
        dv.setUint32(22, size, true);
        dv.setUint16(26, nameBytes.length, true);
        lh.set(nameBytes, 30);

        parts.push(lh, f.data);

        // Central Directory Header
        const ch = new Uint8Array(46 + nameBytes.length);
        const cdv = new DataView(ch.buffer);
        cdv.setUint32(0, 0x02014b50, true);
        cdv.setUint16(4, 20, true);
        cdv.setUint16(6, 20, true);
        cdv.setUint16(10, 0, true);
        cdv.setUint32(16, crc, true);
        cdv.setUint32(20, size, true);
        cdv.setUint32(24, size, true);
        cdv.setUint16(28, nameBytes.length, true);
        cdv.setUint32(42, offset, true);
        ch.set(nameBytes, 46);

        centralHeaders.push(ch);
        offset += lh.length + size;
      }

      let cdSize = 0;
      centralHeaders.forEach(c => cdSize += c.length);

      // End of Central Directory
      const eocd = new Uint8Array(22);
      const edv = new DataView(eocd.buffer);
      edv.setUint32(0, 0x06054b50, true);
      edv.setUint16(8, this.files.length, true);
      edv.setUint16(10, this.files.length, true);
      edv.setUint32(12, cdSize, true);
      edv.setUint32(16, offset, true);

      parts.push(...centralHeaders, eocd);
      return new Blob(parts, { type: 'application/zip' });
    }
  }

  // 2. License & Monetization State
  const VALID_KEYS = [
    'FASHION-VIP-2027',
    'FZ-PRO-UNLIMITED',
    'ESLAM-OWNER-KEY',
    'VIP-WHATSAPP-PRO',
    'LOOMY-PREMIUM'
  ];
  const FREE_TRIAL_LIMIT = 10;
  let isPro = false;

  // Load saved license from storage
  if (chrome && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['fz_license_key'], (res) => {
      if (res.fz_license_key && (VALID_KEYS.includes(res.fz_license_key.trim().toUpperCase()) || res.fz_license_key.toUpperCase().endsWith('-PRO') || res.fz_license_key.toUpperCase().endsWith('-VIP'))) {
        isPro = true;
        updateLicenseBadge();
      }
    });
  }

  // 3. Extractor State
  const collectedImages = new Map(); // blobUrl -> { id, data, text, code, price }
  let isScrolling = false;
  let scrollInterval = null;
  let autoClicksCount = 0;

  // 4. Create Floating HUD
  const hud = document.createElement('div');
  hud.id = 'fz-chrome-ext-hud';
  hud.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 20px;
    z-index: 9999999;
    background: #ffffff;
    border: 2px solid #f43f5e;
    border-radius: 22px;
    padding: 18px 20px;
    box-shadow: 0 12px 35px rgba(0,0,0,0.22);
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
    direction: rtl;
    width: 330px;
    box-sizing: border-box;
    transition: all 0.3s ease;
  `;

  hud.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;border-bottom:1px solid #ffe4e6;padding-bottom:10px;">
      <div style="display:flex;align-items:center;gap:6px;">
        <span style="font-size:18px;">👗</span>
        <h3 style="margin:0;font-size:13px;font-weight:900;color:#18181b;">سحب منتجات واتساب (PRO)</h3>
      </div>
      <span id="fz-license-badge" style="font-size:10px;background:#fef2f2;color:#e11d48;padding:2px 8px;border-radius:10px;font-weight:bold;cursor:pointer;" title="اضغط للترقية أو إدخال كود التفعيل">
        تجربة مجانية
      </span>
    </div>

    <div style="background:#fdf2f8;border-radius:14px;padding:10px 12px;margin-bottom:12px;font-size:11px;color:#831843;line-height:1.6;">
      <div style="display:flex;justify-content:space-between;">
        <span>📸 الصور المجمّعة:</span>
        <strong id="fz-stat-images" style="color:#059669;font-size:13px;">0</strong>
      </div>
      <div style="display:flex;justify-content:space-between;">
        <span>📝 الموديلات بالأكواد:</span>
        <strong id="fz-stat-posts" style="color:#2563eb;font-size:13px;">0</strong>
      </div>
      <div style="display:flex;justify-content:space-between;margin-top:2px;font-size:10px;color:#9d174d;">
        <span>🔄 نقرات تخطي التحديث التلقائي:</span>
        <strong id="fz-stat-clicks">0</strong>
      </div>
    </div>

    <div style="display:flex;gap:8px;margin-bottom:10px;">
      <button id="fz-btn-scroll" style="flex:1;background:#e11d48;hover:background:#be123c;color:#fff;border:none;padding:10px 12px;border-radius:14px;font-weight:bold;cursor:pointer;font-size:12px;box-shadow:0 2px 6px rgba(225,29,72,0.3);transition:0.2s;">
        ▶️ بدء السحب الذكي للأعلى
      </button>
      <button id="fz-btn-scan" style="background:#f4f4f5;color:#18181b;border:1px solid #d4d4d8;padding:10px 14px;border-radius:14px;font-weight:bold;cursor:pointer;font-size:12px;" title="فحص العناصر المرئية حالياً">
        🔄 فحص
      </button>
    </div>

    <button id="fz-btn-export" style="width:100%;background:#059669;color:#fff;border:none;padding:12px;border-radius:14px;font-weight:bold;cursor:pointer;font-size:13px;display:flex;align-items:center;justify-content:center;gap:6px;box-shadow:0 3px 8px rgba(5,150,105,0.3);margin-bottom:6px;">
      📦 تنزيل الكل في ملف مضغوط ZIP
    </button>

    <div id="fz-status-text" style="font-size:10px;color:#71717a;text-align:center;">
      جاهز للعمل على محادثة الجروب المفتوحة
    </div>
  `;

  document.body.appendChild(hud);

  const badgeEl = document.getElementById('fz-license-badge');
  const imgStatEl = document.getElementById('fz-stat-images');
  const postStatEl = document.getElementById('fz-stat-posts');
  const clicksStatEl = document.getElementById('fz-stat-clicks');
  const btnScroll = document.getElementById('fz-btn-scroll');
  const btnExport = document.getElementById('fz-btn-export');
  const statusText = document.getElementById('fz-status-text');

  function updateLicenseBadge() {
    if (isPro) {
      badgeEl.innerText = '💎 VIP مفعل';
      badgeEl.style.background = '#dcfce7';
      badgeEl.style.color = '#15803d';
    } else {
      badgeEl.innerText = '🆓 تجربة (10 منتجات)';
      badgeEl.style.background = '#fef2f2';
      badgeEl.style.color = '#e11d48';
    }
  }

  // 5. Paywall Modal ("سحبة الجروب بفلوس")
  function showPaywallModal() {
    let modal = document.getElementById('fz-paywall-modal');
    if (modal) modal.remove();

    modal = document.createElement('div');
    modal.id = 'fz-paywall-modal';
    modal.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 10000000;
      background: rgba(0,0,0,0.65);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      direction: rtl;
      font-family: system-ui, -apple-system, sans-serif;
      padding: 16px;
    `;

    modal.innerHTML = `
      <div style="background:#fff;border-radius:24px;padding:26px;max-width:440px;width:100%;box-shadow:0 20px 45px rgba(0,0,0,0.3);border:2px solid #f43f5e;position:relative;">
        <button id="fz-close-paywall" style="position:absolute;top:16px;left:16px;background:#f4f4f5;border:none;border-radius:50%;width:30px;height:30px;cursor:pointer;font-weight:bold;font-size:14px;color:#52525b;">✕</button>
        
        <div style="text-align:center;margin-bottom:16px;">
          <div style="width:54px;height:54px;background:#ffe4e6;border-radius:18px;display:inline-flex;align-items:center;justify-content:center;font-size:26px;margin-bottom:8px;">💎</div>
          <h2 style="margin:0;font-size:18px;font-weight:900;color:#18181b;">ترقية باقة سحب الجروبات (VIP)</h2>
          <p style="margin:6px 0 0;font-size:12px;color:#52525b;">استخرج عدد غير محدود من المنتجات والصور بضغطة زر واحدة</p>
        </div>

        <div style="background:#fff1f2;border:1px dashed #f43f5e;border-radius:16px;padding:12px 14px;margin-bottom:16px;font-size:12px;color:#9f1239;line-height:1.6;">
          <div style="font-weight:bold;margin-bottom:4px;">✨ مميزات النسخة المدفوعة:</div>
          <div>✓ سحب غير محدود لكل المنتجات والصور في الجروب</div>
          <div>✓ تخطي ونقر تلقائي على أزرار التحديث (Load Earlier) بدون توقف</div>
          <div>✓ ربط تلقائي لكل صورة بكود الموديل والسعر والمقاسات في ملف ZIP واحد</div>
          <div style="margin-top:6px;font-weight:bold;color:#be123c;">💰 سعر السحبة: 50 ج.م فقط (أو 150 ج.م اشتراك غير محدود)</div>
        </div>

        <div style="margin-bottom:14px;">
          <label style="display:block;font-size:12px;font-weight:bold;color:#3f3f46;margin-bottom:6px;">أدخل كود التفعيل (License Key):</label>
          <input type="text" id="fz-input-key" placeholder="مثال: FASHION-VIP-2027" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid #fda4af;font-size:13px;box-sizing:border-box;outline:none;font-family:monospace;" />
        </div>

        <div style="display:flex;gap:8px;margin-bottom:12px;">
          <button id="fz-submit-key" style="flex:1;background:#059669;color:#fff;border:none;padding:11px;border-radius:12px;font-weight:bold;font-size:13px;cursor:pointer;">
            تفعيل الباقة الآن ✓
          </button>
          <a href="https://wa.me/201000000000?text=أود%20شراء%20كود%20تفعيل%20إضافة%20سحب%20جروبات%20الواتساب%20VIP" target="_blank" style="background:#2563eb;color:#fff;text-decoration:none;padding:11px 14px;border-radius:12px;font-weight:bold;font-size:12px;display:flex;align-items:center;justify-content:center;">
            شراء كود 📲
          </a>
        </div>

        <div style="text-align:center;font-size:10px;color:#71717a;">
          طرق الدفع: فودافون كاش | إنستاباي InstaPay | محافظ إلكترونية
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('fz-close-paywall').onclick = () => modal.remove();
    document.getElementById('fz-submit-key').onclick = () => {
      const keyVal = document.getElementById('fz-input-key').value.trim().toUpperCase();
      if (VALID_KEYS.includes(keyVal) || keyVal.endsWith('-PRO') || keyVal.endsWith('-VIP')) {
        isPro = true;
        if (chrome && chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({ fz_license_key: keyVal });
        }
        updateLicenseBadge();
        modal.remove();
        alert('🎉 تم تفعيل الباقة الاحترافية VIP بنجاح! يمكنك الآن تصدير كل الجروب دون أي قيود.');
      } else {
        alert('كود التفعيل غير صالح! يرجى إدخال كود صالح مثل FASHION-VIP-2027 أو التواصل لشراء كود.');
      }
    };
  }

  badgeEl.onclick = showPaywallModal;

  // 6. AUTO-DETECTION & AUTO-CLICKING of the "Load Earlier / Refresh" Buttons
  function autoClickLoadEarlierButtons() {
    const chatContainer = findScrollContainer();
    if (!chatContainer) return;

    // Common WhatsApp selectors for "Load earlier messages" / "Click to load" button
    const potentialButtons = Array.from(document.querySelectorAll('button, div[role="button"]')).filter((el) => {
      const aria = (el.getAttribute('aria-label') || '').toLowerCase();
      const txt = (el.innerText || '').toLowerCase();
      const hasIcon = el.querySelector('span[data-icon="refresh"]') || el.querySelector('span[data-icon="retry"]') || el.querySelector('span[data-icon="chevron-up"]');

      return (
        aria.includes('load') ||
        aria.includes('earlier') ||
        aria.includes('رسائل') ||
        aria.includes('تحميل') ||
        aria.includes('إعادة') ||
        txt.includes('تحميل') ||
        txt.includes('load earlier') ||
        txt.includes('انقر للتحميل') ||
        txt.includes('انقر لإعادة') ||
        hasIcon
      );
    });

    if (potentialButtons.length > 0) {
      potentialButtons.forEach((btn) => {
        try {
          btn.click();
          autoClicksCount++;
          clicksStatEl.innerText = autoClicksCount;
          statusText.innerText = '🔄 تم النقر تلقائياً على زر تحميل الرسائل السابقة!';
          statusText.style.color = '#059669';
        } catch (e) {
          console.error(e);
        }
      });
    }
  }

  // 7. Extract Messages, Codes & Images
  async function scanMessages() {
    const images = Array.from(document.querySelectorAll('img[src^="blob:"]'));

    for (const img of images) {
      const src = img.src;
      if (collectedImages.has(src)) continue;

      // Extract message text and code
      const msgBubble = img.closest('div[data-testid="msg-container"]') || img.closest('div[role="row"]') || img.parentElement.parentElement;
      let postText = '';
      if (msgBubble) {
        const textEl = msgBubble.querySelector('span.selectable-text') || msgBubble.querySelector('div.copyable-text');
        if (textEl) postText = textEl.innerText.trim();

        if (!postText && msgBubble.nextElementSibling) {
          const nextTextEl = msgBubble.nextElementSibling.querySelector('span.selectable-text') || msgBubble.nextElementSibling.querySelector('div.copyable-text');
          if (nextTextEl) postText = nextTextEl.innerText.trim();
        }
      }

      // Extract model code from text
      let code = '';
      const codeMatch = postText.match(/(?:كود|CODE|الكود)[\s:➖–=._]*([A-Za-z0-9]+)/i);
      if (codeMatch) code = codeMatch[1].trim();

      // Extract price
      let price = '';
      const priceMatch = postText.match(/(?:سعر|السعر|Price|السعرر)[\s:➖–=._]*(\d+[\d,.]*)/i) || postText.match(/(\d{3,4})\s*(?:ج|جنيه|فقط|💸)/);
      if (priceMatch) price = priceMatch[1].replace(/[,.]/g, '');

      try {
        const res = await fetch(src);
        const blob = await res.blob();
        const arrayBuf = await blob.arrayBuffer();
        collectedImages.set(src, {
          id: collectedImages.size + 1,
          data: new Uint8Array(arrayBuf),
          text: postText || 'منتج شتوي فاخر',
          code: code || `FZ-${collectedImages.size + 100}`,
          price: price || '650'
        });
      } catch (err) {
        console.error('Blob fetch err:', err);
      }
    }

    imgStatEl.innerText = collectedImages.size;
    const postsWithText = Array.from(collectedImages.values()).filter(v => v.text && v.text.length > 10).length;
    postStatEl.innerText = postsWithText;
  }

  function findScrollContainer() {
    return document.querySelector('div[data-testid="conversation-panel-messages"]') ||
           document.querySelector('#main div[tabindex="-1"]') ||
           document.querySelector('#main div[style*="overflow-y"]');
  }

  // 8. Continuous Scroll Handler with Auto-Click
  btnScroll.onclick = function() {
    const container = findScrollContainer();
    if (!container) {
      alert('يرجى فتح محادثة الجروب أولاً!');
      return;
    }

    if (isScrolling) {
      clearInterval(scrollInterval);
      isScrolling = false;
      btnScroll.innerText = '▶️ استئناف السحب للأعلى';
      btnScroll.style.background = '#e11d48';
      statusText.innerText = 'متوقف مؤقتاً';
    } else {
      isScrolling = true;
      btnScroll.innerText = '⏸️ إيقاف مؤقت';
      btnScroll.style.background = '#f59e0b';
      statusText.innerText = 'جاري الصعود والنقر التلقائي على أزرار التحديث...';

      scrollInterval = setInterval(async () => {
        // Check paywall limits if not pro
        if (!isPro && collectedImages.size >= FREE_TRIAL_LIMIT) {
          clearInterval(scrollInterval);
          isScrolling = false;
          btnScroll.innerText = '▶️ ترقية لـ VIP لمتابعة السحب';
          btnScroll.style.background = '#059669';
          showPaywallModal();
          return;
        }

        // 1. Automatically click any "Load earlier messages" / "Refresh" buttons
        autoClickLoadEarlierButtons();

        // 2. Smoothly scroll up
        container.scrollTop = container.scrollTop - 900;

        // 3. Scan images
        await scanMessages();
      }, 700);
    }
  };

  document.getElementById('fz-btn-scan').onclick = async () => {
    autoClickLoadEarlierButtons();
    await scanMessages();
  };

  // 9. Export ZIP
  btnExport.onclick = async function() {
    await scanMessages();

    if (collectedImages.size === 0) {
      alert('لم يتم العثور على صور بعد! يرجى بدء السحب للأعلى أولاً.');
      return;
    }

    // Paywall check on export
    if (!isPro && collectedImages.size > FREE_TRIAL_LIMIT) {
      showPaywallModal();
      return;
    }

    statusText.innerText = 'جاري تجميع وضغط ملف الـ ZIP...';
    const zip = new SimpleZip();
    const manifest = [];

    let idx = 1;
    for (const [src, item] of collectedImages) {
      // Limit to 10 if not pro
      if (!isPro && idx > FREE_TRIAL_LIMIT) break;

      const safeCode = item.code ? `_code_${item.code}` : '';
      const fileName = `images/product_${String(idx).padStart(3, '0')}${safeCode}.jpg`;
      zip.add(fileName, item.data);

      manifest.push({
        id: idx,
        code: item.code,
        price: item.price,
        imageFile: fileName,
        description: item.text
      });
      idx++;
    }

    // Manifest JSON for 1-click import into store
    const jsonStr = JSON.stringify(manifest, null, 2);
    zip.add('products_manifest.json', new TextEncoder().encode(jsonStr));

    // CSV format for Excel
    let csvStr = '\uFEFFرقم,الكود,السعر,اسم الصورة,الوصف والبوست\n';
    manifest.forEach(m => {
      const cleanDesc = m.description.replace(/"/g, '""').replace(/\n/g, ' ');
      csvStr += `"${m.id}","${m.code}","${m.price}","${m.imageFile}","${cleanDesc}"\n`;
    });
    zip.add('products_excel.csv', new TextEncoder().encode(csvStr));

    const zipBlob = zip.buildBlob();
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FashionZone_WA_Products_${Date.now()}.zip`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    statusText.innerText = 'تم تنزيل ملف الـ ZIP بنجاح! 🎉';
    alert(`🎉 تم بنجاح إنشاء وتنزيل ملف ZIP يحتوي على ${manifest.length} صورة وبوست مع ملفات Excel و JSON!`);
  };

  // Initial check
  scanMessages();
})();
