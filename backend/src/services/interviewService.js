const QUESTIONS = {
  chest: [
    {
      title: "Where is the pain located?",
      options: [
        { text: "Center of chest (Retrosternal)", isRed: true },
        { text: "Left shoulder radiating", isRed: true },
        { text: "Upper stomach region", isRed: false },
        { text: "Right chest wall", isRed: false },
      ],
    },
    {
      title: "How long have you had the pain?",
      options: [
        { text: "More than 3 days", isRed: true },
        { text: "Started today / sudden", isRed: true },
        { text: "Intermittent over a week", isRed: false },
        { text: "Only with deep breaths", isRed: false },
      ],
    },
    {
      title: "Does the pain radiate to arm or jaw?",
      options: [
        { text: "Yes, left arm and shoulder", isRed: true },
        { text: "Yes, up into jaw/neck", isRed: true },
        { text: "Radiates straight to back", isRed: false },
        { text: "No radiation", isRed: false },
      ],
    },
    {
      title: "Are you experiencing breathlessness?",
      options: [
        { text: "Yes, shortness of breath + sweating", isRed: true },
        { text: "Mild breathless on exertion", isRed: false },
        { text: "Only general fatigue", isRed: false },
        { text: "No breathlessness", isRed: false },
      ],
    },
  ],
  fever: [
    {
      title: "What is your temperature?",
      options: [
        { text: "High grade (> 102° F)", isRed: true },
        { text: "Moderate (100° F - 101° F)", isRed: false },
        { text: "Low grade (< 100° F)", isRed: false },
        { text: "Unmeasured / feeling warm", isRed: false },
      ],
    },
    {
      title: "How many days have you had fever?",
      options: [
        { text: "1 - 2 days", isRed: false },
        { text: "3 - 5 days", isRed: false },
        { text: "More than 7 days", isRed: true },
        { text: "On and off fever", isRed: false },
      ],
    },
    {
      title: "Do you have cough?",
      options: [
        { text: "Productive phlegm cough", isRed: false },
        { text: "Dry hacking cough", isRed: false },
        { text: "Severe cough with chest pain", isRed: true },
        { text: "No cough", isRed: false },
      ],
    },
    {
      title: "Any body ache or joint pain?",
      options: [
        { text: "Severe body ache", isRed: false },
        { text: "Mild joint pain", isRed: false },
        { text: "Stiffness in neck", isRed: true },
        { text: "No body ache", isRed: false },
      ],
    },
  ],
  diabetes: [
    {
      title: "When was your last HbA1c test?",
      options: [
        { text: "Within last 3 months", isRed: false },
        { text: "More than 6 months ago", isRed: true },
        { text: "Never tested", isRed: true },
        { text: "Don't remember", isRed: false },
      ],
    },
    {
      title: "Are you taking medications regularly?",
      options: [
        { text: "Yes, daily without miss", isRed: false },
        { text: "Sometimes I skip", isRed: true },
        { text: "Stopped taking them", isRed: true },
        { text: "Not on any medication", isRed: false },
      ],
    },
    {
      title: "Any foot issues or vision changes?",
      options: [
        { text: "Numbness in feet", isRed: true },
        { text: "Blurred vision", isRed: true },
        { text: "Slow wound healing", isRed: true },
        { text: "No issues", isRed: false },
      ],
    },
    {
      title: "How often do you check blood sugar?",
      options: [
        { text: "Daily", isRed: false },
        { text: "Weekly", isRed: false },
        { text: "Rarely", isRed: true },
        { text: "Never", isRed: true },
      ],
    },
  ],
};

const RED_FLAG_KEYWORDS = [
  "chest pain",
  "difficulty breathing",
  "unconscious",
  "severe bleeding",
  "high fever",
  "seizure",
  "stroke",
  "heart attack",
];

export function getQuestions(complaint) {
  const comp = (complaint || "").toLowerCase();

  if (comp.includes("chest") || comp.includes("pain")) return QUESTIONS.chest;
  if (comp.includes("fever")) return QUESTIONS.fever;
  if (comp.includes("diabet") || comp.includes("sugar")) return QUESTIONS.diabetes;

  return QUESTIONS.chest;
}

export function checkRedFlags(answers) {
  const isRed = answers.some((a) => a.isRed);
  const freeTextFlags = answers
    .filter((a) => a.freeText)
    .some((a) =>
      RED_FLAG_KEYWORDS.some((kw) => a.freeText.toLowerCase().includes(kw))
    );
  return isRed || freeTextFlags;
}
