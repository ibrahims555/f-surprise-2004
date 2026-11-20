# Falak ke liye surprise website: poora guide

Is mein 12 baje wala lock nahi hai. Link jab bhi khule, seedha "Open" button aata hai. Aap jab chahein link bhej sakte hain.

Yeh sab kaam phone ke browser se bhi ho jata hai, laptop par aur bhi aasan hai. Phone par ho to browser mein "Desktop site" on kar lein, GitHub ke buttons saaf nazar aayenge.

---

## Step 1. GitHub account (agar nahi hai)

1. github.com kholein, **Sign up** dabayein, email aur password se free account banayein.
2. Email verify kar lein.

## Step 2. Nayi repository banayein

1. Upar daayen taraf **+** par click karein, phir **New repository**.
2. **Repository name** mein kuch aisa likhein jo koi guess na kar sake, misal: `f-surprise-2311`.
3. **Public** select rehne dein (free website ke liye zaroori hai).
4. Neeche **Create repository** dabayein.

## Step 3. Files upload karein

1. Nayi khali repository ke page par **uploading an existing file** wala link hoga. Us par click karein.
2. In 4 files ko drag karein (ya **choose your files** se select karein):
   - `index.html`
   - `style.css`
   - `script.js`
   - `config.js`
3. Photos bhi isi waqt upload kar sakte hain (neeche "Photos" wala hissa dekhein).
4. Neeche **Commit changes** dabayein. Upload complete.

## Step 4. Website on karein (GitHub Pages)

1. Repository mein upar **Settings** par jayein.
2. Left side menu mein **Pages** par click karein.
3. **Build and deployment** ke neeche **Source** mein *Deploy from a branch* chunein.
4. **Branch** mein `main` aur saath wala folder `/ (root)` chunein, phir **Save**.
5. 1-2 minute ruk kar page refresh karein. Upar ek link aa jayega:
   `https://AAPKA-USERNAME.github.io/REPOSITORY-NAAM/`
6. Is link ko khud kholein, "Open" dabayein aur poori website dekh lein.

Yehi link wife ko bhejna hai, jab dil chahe.

---

## Photos kaise dalni hain

Do tareeqe hain, jo aasan lage wo use karein.

**Tareeqa 1 (sab se aasan): naam 1, 2, 3**

- Photos ke naam `1.jpg`, `2.jpg`, `3.jpg` ... kar dein (chhote letters, zyada se zyada 24).
- `.jpg`, `.jpeg`, `.png`, `.webp` chal jayenge.
- Repository mein **Add file → Upload files** se upload karein, phir **Commit changes**.
- Website khud dhoond leti hai, code mein kuch nahi badalna.

**Tareeqa 2: asli naam ke saath**

- Photos ko unke asli naam se upload karein (misal `IMG_2031.jpg`).
- Phir repository mein `config.js` kholein, pencil icon (Edit) dabayein, aur `photoFiles` mein naam likh dein:
  `photoFiles: ["IMG_2031.jpg", "IMG_2045.jpg"],`
- **Commit changes** dabayein.
- Naam bilkul wahi likhein jaise file ka hai, capital aur small letters ka bhi farq hota hai.

Zaroori baatein:

- iPhone ki `.heic` photos nahi chalengi. Photo ko WhatsApp se khud ko bhej kar download kar lein, wo JPG ban jati hai aur size bhi chhota ho jata hai (har photo 1 MB se kam ho to behtar).
- Upload ke 1-2 minute baad website mein nazar aayengi. Na aayen to page ko hard refresh karein ya private tab mein kholein.
- Photos na hon to gallery wala hissa khud chhup jata hai.
- Photo ke neeche naam likhna ho to `config.js` mein `captions` mein likh dein.
- Website par photo kala safed dikhti hai, us par tap karne se rang wapas aa jata hai.

## Music (optional)

Ek mp3 file `music.mp3` naam se usi tarah upload kar dein. Wife jab "Open" dabayegi, music halki awaz se shuru ho jayega, aur upar daayen kone mein band karne ka button hoga. File na ho to music button nazar nahi aata.

## Baad mein koi lafz badalna ho

1. Repository mein `index.html` par click karein.
2. Pencil icon (Edit) dabayein.
3. Text badal kar **Commit changes** dabayein.
4. 1-2 minute baad website update ho jayegi.

## Dhyan rakhein

Repository Public hogi, to jis ko repository ka link pata ho wo files mein likhe alfaaz parh sakta hai. Isliye repository ka naam aisa rakhein jo koi guess na kare, aur sirf wife ko website ka link dein. Website search engines se bhi chhupi hai (`noindex`).
