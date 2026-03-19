const ackBtn = document.getElementById("ackBtn");
const helpBtn = document.getElementById("helpBtn");
const feedback = document.getElementById("actionFeedback");
const detectedAt = document.getElementById("detectedAt");
const statusBadge = document.getElementById("alertStatusBadge");
const toast = document.getElementById("incidentToast");
const singleIncidentTag = document.getElementById("singleIncidentTag");
const parentAlertText = document.getElementById("parentAlertText");
const chatContainer = document.getElementById("chatContainer");
const currentIncidentType = document.getElementById("currentIncidentType");
const riskScore = document.getElementById("riskScore");

const riskByIncident = {
  הטרדה: "88/100",
  פדופיליה: "97/100",
  "סחיטה פיזית": "94/100",
  "פגיעה מילולית": "79/100",
  "אנטישמיות / גזענות": "84/100",
};

if (detectedAt) {
  detectedAt.textContent = new Date().toLocaleString("he-IL");
}

if (toast) {
  setTimeout(() => {
    toast.classList.add("hidden");
  }, 6000);
}

function renderIncident(incidentType) {
  if (singleIncidentTag) {
    singleIncidentTag.textContent = incidentType;
    if (incidentType === "פדופיליה" || incidentType === "הטרדה") {
      singleIncidentTag.classList.add("danger");
      singleIncidentTag.classList.remove("warning");
    } else {
      singleIncidentTag.classList.add("warning");
      singleIncidentTag.classList.remove("danger");
    }
  }

  if (currentIncidentType) currentIncidentType.textContent = incidentType;
  if (riskScore && riskByIncident[incidentType]) {
    riskScore.textContent = riskByIncident[incidentType];
  }

  if (parentAlertText) {
    parentAlertText.textContent = `הילד שלך חווה ${incidentType} בשיחה החשודה.`;
  }
}

if (ackBtn && feedback && statusBadge) {
  ackBtn.addEventListener("click", () => {
    feedback.textContent = "ההתראה סומנה כטופלה. המשך מעקב פעיל.";
    statusBadge.textContent = "בטיפול";
    statusBadge.classList.remove("danger");
    statusBadge.classList.add("safe");
  });
}

if (helpBtn && feedback) {
  helpBtn.addEventListener("click", () => {
    feedback.textContent = "שלב ראשון: אמתו זהות משתתפים. שלב שני: יציאה מהשיחה.";
  });
}

function classifyText(text) {
  const lower = text.toLowerCase();

  if (/(גיל|בן כמה|תמונה שלך|סוד בינינו)/.test(lower)) return "פדופיליה";
  if (/(אם לא|תשלח|איים|השלכות|אפרסם)/.test(lower)) return "סחיטה פיזית";
  if (/(מטומטם|אפס|שונא|תמות|עלוב)/.test(lower)) return "פגיעה מילולית";
  if (/(יהודי|ערבי|כושי|גזע|נאצי)/.test(lower)) return "אנטישמיות / גזענות";

  return "הטרדה";
}

// AI works behind the scenes: classify current chat automatically.
let combinedChat = "";
if (chatContainer) {
  const suspectMessages = chatContainer.querySelectorAll(".msg.suspect p");
  suspectMessages.forEach((msg) => {
    combinedChat += ` ${msg.textContent || ""}`;
  });
}

const incidentType = classifyText(combinedChat);
renderIncident(incidentType);

