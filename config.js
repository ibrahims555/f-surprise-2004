/*
  Yahan se aap sab kuch aasani se badal sakte hain.
*/
window.CONFIG = {
  // Nikkah ki tareekh (finale mein din ginne ke liye)
  nikkahDate: "2026-09-11",

  // Music (optional): ek mp3 file "music.mp3" naam se upload kar dein.
  // File na ho to music button nazar nahi aayega.
  music: "music.mp3",

  // Photos, tareeqa 1 (aasan): 1.jpg, 2.jpg, 3.jpg ... naam se upload karein (chhote letters).
  // Website khud dhoond leti hai, yahan kuch likhne ki zaroorat nahi.
  photoMax: 24,
  photoExts: ["jpg", "jpeg", "png", "webp", "JPG", "JPEG", "PNG"],

  // Photos, tareeqa 2: apni photos ke asli naam yahan likh dein, is order mein dikhengi.
  // Misal: photoFiles: ["IMG_2031.jpg", "IMG_2045.jpg", "WhatsApp Image 1.jpeg"],
  // Is list mein kuch ho to upar wala tareeqa 1 istemal nahi hota.
  photoFiles: [],

  // Folder mein rakhna chahein to yahan "photos/" likh dein, warna khali chhor dein.
  photoFolder: "",

  // Photo ke neeche likhne wale chhote alfaaz (optional). Misal:
  // captions: { 1: "Cafe Boogie", 2: "Our Nikkah" }
  captions: {}
};
