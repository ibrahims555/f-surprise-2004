# Falak ke liye birthday surprise: poora guide

Link jab bhi khule, seedha "Open Your Surprise" wali screen aati hai. Koi 12 baje wala lock nahi, aap jab chahein link bhej dein.

Yeh sab kaam phone ke browser se bhi ho jata hai, laptop par aur bhi aasan hai. Phone par GitHub ke buttons chhote lagen to browser mein "Desktop site" on kar lein.

## Files kaun si hain

Yeh 4 files GitHub par upload karni hain:

- `index.html` (website ka dhancha)
- `style.css` (rang aur design)
- `script.js` (animations aur interactions)
- `content.js` (saare alfaaz yahin hain, jo badalna ho yahan se badlein)

Saath mein aapki photos (`1.jpg` se `5.jpg`) aur chahein to `music.mp3`.

Pehle wali website ki `config.js` ab istemal nahi hoti. Purani repository mein upload kar rahe hain to bas yeh 4 nayi files usi naam se dobara upload kar dein, wo purani wali ko badal dengi. `config.js` rehne dein ya delete kar dein, koi farq nahi.

## Step 1. GitHub account (agar nahi hai)

1. github.com kholein, **Sign up** dabayein, email aur password se free account banayein.
2. Email verify kar lein.

## Step 2. Nayi repository banayein

1. Upar daayen taraf **+** dabayein, phir **New repository**.
2. **Repository name** mein kuch aisa likhein jo koi guess na kar sake, misal `f-surprise-2311`.
3. **Public** select rehne dein (free website ke liye zaroori hai).
4. **Create repository** dabayein.

## Step 3. Files upload karein

1. Khali repository ke page par **uploading an existing file** par click karein.
2. Chaaron files (`index.html`, `style.css`, `script.js`, `content.js`) drag karein ya **choose your files** se chunein.
3. Photos aur music bhi isi waqt chun sakte hain (neeche dekhein).
4. Neeche **Commit changes** dabayein.

## Step 4. Website on karein (GitHub Pages)

1. Repository mein upar **Settings** dabayein.
2. Left menu mein **Pages**.
3. **Source** mein *Deploy from a branch* chunein. **Branch** mein `main` aur folder `/ (root)`, phir **Save**.
4. 1-2 minute baad page refresh karein, upar link aa jayega:
   `https://AAPKA-USERNAME.github.io/REPOSITORY-NAAM/`
5. Link khud kholein aur poori website ek baar dekh lein. Phir wahi link wife ko bhej dein.

## Photos kaise dalni hain

Website mein 5 photo cards hain. Jab tak photo na ho, wahan ek khoobsurat placeholder ("Your photo here") dikhta hai, kuch toota hua nahi lagta.

1. Apni 5 photos ke naam `1.jpg`, `2.jpg`, `3.jpg`, `4.jpg`, `5.jpg` rakhein (chhote letters mein).
2. Repository mein **Add file → Upload files** se upload karein, phir **Commit changes**.
3. 1-2 minute baad website mein nazar aa jayengi. Na aayen to page ko hard refresh karein ya private tab mein kholein.

Dhyan dein:

- Photo ki extension bilkul wahi honi chahiye jo `content.js` mein likhi hai (`1.jpg`). Aapki photos `.png` ya `.jpeg` hon to `content.js` mein us card ka `photo: "1.jpg"` badal kar `photo: "1.png"` kar dein.
- Photo card se zyada ya kam karni ho to `content.js` mein `cards` ke andar ek `{ ... }` hissa copy ya delete kar dein.
- iPhone ki `.heic` photos nahi chalengi. Photo ko WhatsApp se khud ko bhej kar download kar lein, wo JPG ban jati hai aur size bhi chhota ho jata hai. Har photo 500 KB se kam ho to phone par bhi tez khulegi.

## Music

Website mein music ka button (upar daayen kone mein) hamesha nazar aata hai, aur music tab tak shuru nahi hota jab tak wife "Open Your Surprise" ya music button na dabaye.

- `music.mp3` naam ki file upload kar dein to wahi chalegi.
- File na ho to ek halki si khud ban jane wali dhun chalti hai (soft pad aur bell notes), is liye button hamesha kaam karta hai.

## Alfaaz badalna

1. Repository mein `content.js` par click karein.
2. Pencil icon (Edit) dabayein.
3. Sirf inverted commas (" ") ke andar ka text badlein. Commas aur brackets na hatayein.
4. **Commit changes** dabayein. 1-2 minute baad website update ho jayegi.

`content.js` mein hi birthday ki tareekh, Nikkah ki tareekh (din ginne ke liye), candles ki tadaad aur letter ke paragraphs hain.

## Kya kya hai website mein

1. Taaron wali intro aur ek raaz bhara paigham, phir "Open Your Surprise" button.
2. Button dabate hi taare tezi se guzarte hain (warp) aur subah jaisa asman khulta hai.
3. "Happy Birthday Falak" ka animated greeting.
4. Memory cards: swipe karein ya tap karke palat kar caption parhein.
5. Birthday cake: har candle par tap karke bujhayein, phir confetti.
6. Mohar (seal) wala lifafa, aur typewriter se likha hua letter (letter par tap karein to poora ek saath khul jata hai).
7. Aakhri tara: usse chhoo kar chhupa hua paigham kholein, phir "Experience it again" se dobara shuru.

Phone ki settings mein "reduce motion" on ho to animations bahut halki ho jati hain aur sab kuch phir bhi kaam karta hai.

## Dhyan rakhein

Repository Public hogi, to jis ko repository ka link pata ho wo files mein likhe alfaaz parh sakta hai. Isliye repository ka naam aisa rakhein jo koi guess na kare, aur sirf wife ko website ka link dein. Website search engines se bhi chhupi hai (`noindex`).
