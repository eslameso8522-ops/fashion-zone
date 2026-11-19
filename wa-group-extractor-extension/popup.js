document.getElementById('open-wa').onclick = () => {
  chrome.tabs.create({ url: 'https://web.whatsapp.com' });
};

document.getElementById('manage-license').onclick = () => {
  const code = prompt('أدخل كود التفعيل VIP الخاص بك:');
  if (code) {
    chrome.storage.local.set({ fz_license_key: code.trim().toUpperCase() }, () => {
      alert('تم حفظ الكود بنجاح! أعد تحميل صفحة واتساب ويب لتفعيل مميزات الـ VIP.');
    });
  }
};

chrome.storage.local.get(['fz_license_key'], (res) => {
  const statusEl = document.getElementById('popup-status');
  if (res.fz_license_key) {
    statusEl.innerText = '💎 باقة VIP مفعلة (' + res.fz_license_key + ')';
    statusEl.style.background = '#dcfce7';
    statusEl.style.color = '#15803d';
  }
});
