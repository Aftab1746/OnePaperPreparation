// Auto-migrated from components/AppShell.jsx mock data (Sprint 1: MVP -> real DB).
// Single source of truth for the seed script below. If you add more mock
// subjects/questions to AppShell.jsx, update here too before re-seeding.
const SUBJECTS = [
  { id: "gk", name: "General Knowledge", short: "GK", color: "#0F3D5C", questions: [
    { id: "gk1", text: "Which mountain range separates Pakistan from China?", options: ["Hindu Kush", "Karakoram", "Sulaiman", "Himalayas"], correct: 1, difficulty: "Medium", explanation: "The Karakoram range forms the shared border area, home to K2." },
    { id: "gk2", text: "Mohenjo-daro is located in which province?", options: ["Punjab", "Sindh", "Balochistan", "KPK"], correct: 1, difficulty: "Easy", explanation: "Mohenjo-daro lies in Larkana district, Sindh." },
    { id: "gk3", text: "Which is the longest river of Pakistan?", options: ["Jhelum", "Chenab", "Indus", "Ravi"], correct: 2, difficulty: "Easy", explanation: "The Indus River runs about 3,180 km, the longest in the country." },
    { id: "gk4", text: "The Wagah Border ceremony takes place near which city?", options: ["Sialkot", "Lahore", "Multan", "Gujranwala"], correct: 1, difficulty: "Easy", explanation: "Wagah lies about 24 km from Lahore." },
  ]},
  { id: "english", name: "English", short: "ENG", color: "#1B5E4A", questions: [
    { id: "en1", text: "Choose the correctly spelled word.", options: ["Recieve", "Receive", "Receve", "Receeve"], correct: 1, difficulty: "Easy", explanation: "'i before e except after c' — Receive follows this rule." },
    { id: "en2", text: "Synonym of 'Candid':", options: ["Deceptive", "Frank", "Hidden", "Confused"], correct: 1, difficulty: "Medium", explanation: "Candid means open and honest, closest to 'Frank'." },
    { id: "en3", text: "Fill in the blank: She has been working here ___ 2019.", options: ["for", "since", "from", "at"], correct: 1, difficulty: "Medium", explanation: "'Since' pairs with a specific point in time." },
    { id: "en4", text: "Passive voice of: 'They built this bridge in 1990.'", options: ["This bridge is built in 1990.", "This bridge was built in 1990.", "This bridge built in 1990.", "This bridge has built in 1990."], correct: 1, difficulty: "Medium", explanation: "Past simple active becomes 'was/were + past participle'." },
  ]},
  { id: "urdu", name: "Urdu", short: "URD", color: "#7A4F1C", questions: [
    { id: "ur1", text: "\u0645\u062a\u0631\u0627\u062f\u0641 \u0644\u0641\u0638 \u0686\u0646\u06cc\u06ba: \u0627\u0644\u0641\u0627\u0638 \u06a9\u0627 \u0645\u062a\u0631\u0627\u062f\u0641 \u0644\u0641\u0638 \u06c1\u06d2 \u061f", options: ["\u0627\u0644\u0641\u0627\u0638", "\u0627\u0644\u0641\u0638", "\u0644\u0641\u0638\u06d2", "\u0627\u0644\u0641\u06cc\u0638"], correct: 1, difficulty: "Medium", explanation: "\u0627\u0644\u0641\u0627\u0638 \u06a9\u0627 \u0648\u0627\u062d\u062f \u0644\u0641\u0638 \u200f'\u0644\u0641\u0638' \u06c1\u06d2\u06d4" },
    { id: "ur2", text: "\u0645\u0631\u0632\u0627 \u063a\u0627\u0644\u0628 \u06a9\u0627 \u062a\u0639\u0644\u0642 \u06a9\u0633 \u0635\u0646\u0641 \u0627\u062f\u0628 \u0633\u06d2 \u06c1\u06d2\u061f", options: ["\u063a\u0632\u0644", "\u0645\u0631\u062b\u06cc\u06c1", "\u0642\u0635\u06cc\u062f\u06c1", "\u0646\u0638\u0645"], correct: 0, difficulty: "Easy", explanation: "\u0645\u0631\u0632\u0627 \u063a\u0627\u0644\u0628 \u0627\u0631\u062f\u0648 \u06a9\u06d2 \u0645\u0634\u06c1\u0648\u0631 \u062a\u0631\u06cc\u0646 \u063a\u0632\u0644 \u06af\u0648 \u06c1\u06cc\u06ba\u06d4" },
    { id: "ur3", text: "'\u0622\u0628 \u0632\u062f' \u0645\u062d\u0627\u0648\u0631\u06c1 \u06a9\u0627 \u0645\u0637\u0644\u0628 \u06c1\u06d2:", options: ["\u062c\u0644\u062f\u06cc \u0628\u0627\u0632 \u0622\u0646\u06d2 \u0648\u0627\u0644\u0627", "\u0628\u0632\u062f\u0644", "\u0633\u0633\u062a", "\u062e\u0648\u0634 \u0645\u0632\u0627\u062c"], correct: 0, difficulty: "Medium", explanation: "'\u0622\u0628 \u0632\u062f' \u06a9\u0627 \u0645\u0637\u0644\u0628 \u06c1\u06d2 \u062c\u0644\u062f \u0628\u0627\u0632 \u0622\u0646\u06d2 \u0648\u0627\u0644\u0627\u06d4" },
  ]},
  { id: "islamiat", name: "Islamic Studies", short: "ISL", color: "#14532D", questions: [
    { id: "is1", text: "How many Ashra Mubashra companions are there?", options: ["8", "10", "12", "6"], correct: 1, difficulty: "Easy", explanation: "Ten companions were given glad tidings of Paradise." },
    { id: "is2", text: "The first revelation was received in which cave?", options: ["Cave of Thawr", "Cave of Hira", "Cave of Uhud", "Cave of Badr"], correct: 1, difficulty: "Easy", explanation: "The first revelation came in the Cave of Hira." },
    { id: "is3", text: "Which Surah is known as the heart of the Quran?", options: ["Surah Yaseen", "Surah Rahman", "Surah Ikhlas", "Surah Fatiha"], correct: 0, difficulty: "Medium", explanation: "Surah Yaseen is traditionally called the heart of the Quran." },
  ]},
  { id: "pakstudy", name: "Pakistan Studies & Current Affairs", short: "PSC", color: "#8C2F39", questions: [
    { id: "ps1", text: "Pakistan became a nuclear power in which year?", options: ["1974", "1998", "2001", "1988"], correct: 1, difficulty: "Easy", explanation: "Nuclear tests were conducted at Chagai in May 1998." },
    { id: "ps2", text: "The Objectives Resolution was passed in which year?", options: ["1949", "1956", "1962", "1940"], correct: 0, difficulty: "Medium", explanation: "Passed by the Constituent Assembly in March 1949." },
    { id: "ps3", text: "Which city is known as the 'City of Gardens'?", options: ["Multan", "Lahore", "Faisalabad", "Peshawar"], correct: 1, difficulty: "Easy", explanation: "Lahore is traditionally called the City of Gardens." },
  ]},
  { id: "math", name: "Mathematics", short: "MATH", color: "#0B4F6C", questions: [
    { id: "ma1", text: "A shopkeeper sells an item for Rs. 1200 at 20% profit. Find the cost price.", options: ["Rs. 960", "Rs. 1000", "Rs. 1440", "Rs. 1100"], correct: 1, difficulty: "Medium", explanation: "CP = SP / (1 + profit%) = 1200 / 1.2 = Rs. 1000." },
    { id: "ma2", text: "What is 15% of 640?", options: ["96", "86", "106", "90"], correct: 0, difficulty: "Easy", explanation: "0.15 x 640 = 96." },
    { id: "ma3", text: "Ratio of boys to girls is 3:2, total 30 students. How many girls?", options: ["18", "12", "15", "20"], correct: 1, difficulty: "Medium", explanation: "Each part = 6, girls = 2 x 6 = 12." },
  ]},
  { id: "reasoning", name: "Analytical Reasoning", short: "REAS", color: "#4A2E5C", questions: [
    { id: "re1", text: "Find the next number: 2, 6, 12, 20, 30, ?", options: ["36", "40", "42", "44"], correct: 2, difficulty: "Medium", explanation: "Differences: 4,6,8,10,12 → 30+12=42." },
    { id: "re2", text: "If CAT is coded as DBU, how is DOG coded?", options: ["EPH", "EPI", "FQH", "EQH"], correct: 0, difficulty: "Hard", explanation: "Each letter shifts forward by 1: D→E, O→P, G→H." },
    { id: "re3", text: "All roses are flowers. Some flowers fade quickly. Conclusion?", options: ["All roses fade quickly", "Some roses may fade quickly", "No roses fade quickly", "All flowers are roses"], correct: 1, difficulty: "Hard", explanation: "Only a possibility follows, not a certainty." },
  ]},
  { id: "science", name: "Everyday Science", short: "SCI", color: "#1A6E6E", questions: [
    { id: "sc1", text: "Which gas is most abundant in Earth's atmosphere?", options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"], correct: 2, difficulty: "Easy", explanation: "Nitrogen makes up about 78% of the atmosphere." },
    { id: "sc2", text: "The unit of electric current is:", options: ["Volt", "Watt", "Ampere", "Ohm"], correct: 2, difficulty: "Easy", explanation: "Electric current is measured in Amperes." },
    { id: "sc3", text: "Vitamin C deficiency causes which disease?", options: ["Rickets", "Scurvy", "Night blindness", "Beriberi"], correct: 1, difficulty: "Medium", explanation: "Scurvy results from a lack of Vitamin C." },
  ]},
  { id: "computer", name: "Computer & IT", short: "COMP", color: "#2B3A67", questions: [
    { id: "co1", text: "Which shortcut key copies selected text?", options: ["Ctrl + V", "Ctrl + C", "Ctrl + X", "Ctrl + Z"], correct: 1, difficulty: "Easy", explanation: "Ctrl+C copies, Ctrl+V pastes." },
    { id: "co2", text: "RAM stands for:", options: ["Random Access Memory", "Read Access Memory", "Random Allocated Memory", "Read Allocated Memory"], correct: 0, difficulty: "Easy", explanation: "RAM = Random Access Memory." },
    { id: "co3", text: "Which of these is an input device?", options: ["Monitor", "Printer", "Scanner", "Speaker"], correct: 2, difficulty: "Easy", explanation: "A scanner sends input into the computer." },
  ]},
  { id: "laws", name: "Departmental Laws", short: "LAW", color: "#5C4033", questions: [
    { id: "la1", text: "The FIA was established under which year's act?", options: ["1974", "1975", "1973", "1978"], correct: 0, difficulty: "Medium", explanation: "The FIA Act was promulgated in 1974." },
    { id: "la2", text: "FIA primarily investigates cases related to:", options: ["Traffic violations", "Federal crimes & cross-border offences", "Municipal disputes", "Local property disputes"], correct: 1, difficulty: "Medium", explanation: "FIA handles federal crimes including trafficking and cybercrime." },
  ]},
];

module.exports = { SUBJECTS };
