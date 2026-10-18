function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (s) => {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[s];
  });
}

function showToast(msg) {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 1400);
}

function download(filename, text, type = "text/plain;charset=utf-8") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function formatMonth(ym) {
  const [y, m] = ym.split("-");
  return `${y}年${parseInt(m, 10)}月`;
}

function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function getAllTags() {
  const counter = {};
  entries.forEach((e) => {
    (e.tags || []).forEach((t) => {
      counter[t] = (counter[t] || 0) + 1;
    });
  });
  return Object.keys(counter).sort((a, b) => counter[b] - counter[a]);
}

// 压缩图片并转为 Base64
function compressImage(file, maxWidth = 800) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        // 压缩质量 0.7
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}

// ================= 图片 IndexedDB =================
const imageDB = {
  db: null,
  init() {
    return new Promise((resolve) => {
      const request = indexedDB.open("NotesImageDB", 1);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains("images")) {
          db.createObjectStore("images", { keyPath: "id" });
        }
      };
      request.onsuccess = (e) => {
        this.db = e.target.result;
        resolve();
      };
    });
  },
  save(id, base64) {
    return new Promise((resolve) => {
      const tx = this.db.transaction("images", "readwrite");
      tx.objectStore("images").put({ id, base64 });
      tx.oncomplete = resolve;
    });
  },
  get(id) {
    return new Promise((resolve) => {
      const tx = this.db.transaction("images", "readonly");
      const req = tx.objectStore("images").get(id);
      req.onsuccess = () => resolve(req.result ? req.result.base64 : null);
    });
  },
  delete(id) {
    return new Promise((resolve) => {
      const tx = this.db.transaction("images", "readwrite");
      tx.objectStore("images").delete(id);
      tx.oncomplete = resolve;
    });
  }
};

// ================= 音频 IndexedDB =================
const audioDB = {
  db: null,
  init() {
    return new Promise((resolve) => {
      const request = indexedDB.open("NotesAudioDB", 1);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains("audios")) {
          db.createObjectStore("audios", { keyPath: "id" });
        }
      };
      request.onsuccess = (e) => {
        this.db = e.target.result;
        resolve();
      };
    });
  },
  save(id, blob) {
    return new Promise((resolve) => {
      const tx = this.db.transaction("audios", "readwrite");
      tx.objectStore("audios").put({ id, blob });
      tx.oncomplete = resolve;
    });
  },
  get(id) {
    return new Promise((resolve) => {
      const tx = this.db.transaction("audios", "readonly");
      const req = tx.objectStore("audios").get(id);
      req.onsuccess = () => resolve(req.result ? req.result.blob : null);
    });
  },
  delete(id) {
    return new Promise((resolve) => {
      const tx = this.db.transaction("audios", "readwrite");
      tx.objectStore("audios").delete(id);
      tx.oncomplete = resolve;
    });
  }
};

function formatCardDate(dateStr) {
  if (!dateStr) return "";
  return dateStr.replace(/-/g, ".");
}