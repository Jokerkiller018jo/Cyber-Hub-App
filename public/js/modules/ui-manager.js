// UI Manager & Assets - v12
// Handles UI sound effects, notifications, and modular transitions

export const playSound = (soundName = "blip") => {
  // Use a map for sound URLs
  const sounds = {
    "blip": "https://cdn.pixabay.com/audio/2021/08/04/audio_349d375001.mp3",
    "notify": "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
    "typing": "https://cdn.pixabay.com/audio/2022/09/23/audio_7318db490a.mp3"
  };
  const audio = new Audio(sounds[soundName]);
  audio.volume = 0.3;
  audio.play().catch(e => console.log("Sound context not active yet."));
};

export const showToast = (message, duration = 3000) => {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.innerText = message;
  toast.style.bottom = "30px";
  playSound("notify");
  setTimeout(() => { toast.style.bottom = "-60px"; }, duration);
};

export const toggleTheme = () => {
  document.body.classList.toggle("light-mode");
  const isLight = document.body.classList.contains("light-mode");
  localStorage.setItem("theme", isLight ? "light" : "dark");
};

export const initNotifications = () => {
    // Check permission
    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    }
};

export const sendSystemNotification = (title, body) => {
    if (Notification.permission === "granted") {
        new Notification(title, { body: body, icon: "/public/assets/icon.png" });
    }
};
