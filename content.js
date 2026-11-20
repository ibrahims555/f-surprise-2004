/*
  ALL THE WORDS LIVE HERE.
  Change any text between the quotation marks, save, and upload this file again.
  Do not delete the quotation marks, commas or curly brackets.
*/
window.CONTENT = {
  name: "Falak",
  birthday: "23 November",

  // Used for the "days since" line at the end. Leave nikkahDate as "" to hide that line.
  nikkahDate: "2026-09-11",
  nikkahLabel: "11 September",

  // Photos are looked up by file name. If you keep them in a folder, write it here, for example "photos/"
  photoFolder: "",

  // Optional music. Upload a file with this name. If it is missing, a soft built-in melody plays instead.
  music: { file: "music.mp3" },

  intro: {
    lines: [
      "Somewhere between midnight and morning…",
      "the sky has been keeping a secret.",
      "It was written for one person only."
    ],
    button: "Open Your Surprise",
    hint: "Best with the sound on."
  },

  greeting: {
    small: "Happy Birthday",
    sub: "My Shahzaadi",
    line: "Today, even the sky is celebrating you.",
    next: "Our memories"
  },

  memories: {
    title: "Our memories",
    hint: "Tap a card to turn it over. Swipe it away to see the next one.",
    next: "Make a wish",
    // photo: file name of your picture. Until you add it, a soft placeholder is shown.
    cards: [
      {
        photo: "1.jpg",
        place: "Cafe Boogie",
        title: "The day we first met",
        text: "Just the two of us at a table, and somehow it already felt like I had known you forever."
      },
      {
        photo: "2.jpg",
        place: "The malls",
        title: "Again and again, side by side",
        text: "Same paths, over and over. I never needed a destination. Only you."
      },
      {
        photo: "3.jpg",
        place: "11 September",
        title: "Our Nikkah",
        text: "The day “you and me” became “us”. Every little moment since has become a memory I want to keep forever."
      },
      {
        photo: "4.jpg",
        place: "Every single time",
        title: "Sulking and making up",
        text: "We are not perfect, and that is exactly what makes it real. I would choose every one of these moments again."
      },
      {
        photo: "5.jpg",
        place: "Somewhere in between",
        title: "Our little everyday moments",
        text: "The ones nobody else notices, and the ones I treasure most."
      }
    ]
  },

  cake: {
    title: "Make a wish",
    hint: "Close your eyes and think of it. Then tap each candle to blow it out.",
    progress: "{n} more to go…",
    candles: 5,
    done: "May every wish you just made come true.",
    next: "Read my letter"
  },

  letter: {
    seal: "Tap the seal to open",
    title: "To my beautiful wife, my forever love",
    paragraphs: [
      "Some people come into our lives and make everything more beautiful. You came into mine and made it feel like home.",
      "Since our Nikkah on 11 September, every little moment has become a memory I wish to keep forever. From our endless laughter and silly arguments to those sweet moments of making up, every part of our journey is special to me.",
      "We are not perfect, and that is what makes our story so real. We are learning, growing, changing, and understanding each other a little more every day. You have changed so many things in me, and I hope I have brought beautiful changes into your life too.",
      "I want to be your biggest supporter, your safest place, your favourite person, and the one who never stops choosing you. I want us to grow old together, collect countless memories, celebrate every little happiness, and hold each other's hands through every chapter of life.",
      "Happy Birthday, my Shahzaadi. You are my today, my tomorrow, and my forever. I love you endlessly."
    ],
    sign: "Always yours",
    skip: "Tap the letter to read it all at once",
    next: "One last thing"
  },

  finale: {
    prompt: "One last thing. Touch the star.",
    lines: [
      "Falak means sky.",
      "And you are the only sky I want to wake up under.",
      "My peace. My prayer. My home."
    ],
    big: "I love you endlessly.",
    days: "It has been {days} days since {date}, and I would choose you again in every one of them.",
    end: "Happy Birthday, my Shahzaadi.",
    sign: "Always yours",
    replay: "Experience it again"
  }
};
