const helloBtn = document.getElementById("helloBtn");
const screenshotBtn = document.getElementById("screenshotBtn");

if (helloBtn) {
  helloBtn.addEventListener("click", () => {
    alert("מעולה! האתר שלך עובד.");
  });
}

if (screenshotBtn) {
  screenshotBtn.addEventListener("click", async () => {
    if (typeof html2canvas !== "function") {
      alert("צילום המסך לא זמין כרגע. נסה לרענן את העמוד.");
      return;
    }

    try {
      const canvas = await html2canvas(document.body, {
        useCORS: true,
        scale: window.devicePixelRatio || 1,
      });
      const imageUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = imageUrl;
      downloadLink.download = "screenshot.png";
      downloadLink.click();
    } catch (error) {
      alert("לא הצלחנו לצלם את המסך. נסה שוב.");
      console.error("Screenshot failed:", error);
    }
  });
}
