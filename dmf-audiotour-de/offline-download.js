(() => {
  const button = document.getElementById("offline-download-button");
  const progress = document.getElementById("offline-download-progress");
  const status = document.getElementById("offline-download-status");
  const scriptUrl = document.currentScript?.src;

  if (!button || !progress || !status || !scriptUrl) {
    return;
  }

  const startLabel = button.dataset.labelStart || button.textContent.trim();
  const downloadingLabel =
    button.dataset.labelDownloading || "Tour wordt gedownload...";

  async function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) {
      throw new Error("Deze browser ondersteunt offline opslaan niet.");
    }

    const script = new URL(scriptUrl);
    const workerUrl = new URL("service-worker.js", script);
    const scope = new URL("./", script).pathname;
    const registration = await navigator.serviceWorker.register(workerUrl, {
      scope,
    });
    await navigator.serviceWorker.ready;
    const worker = registration.active || navigator.serviceWorker.controller;
    if (!worker) {
      throw new Error("De offline service worker is niet actief.");
    }
    return worker;
  }

  const serviceWorkerPromise = registerServiceWorker();

  function downloadTour(worker) {
    return new Promise((resolve, reject) => {
      const channel = new MessageChannel();
      channel.port1.onmessage = ({ data }) => {
        if (data.type === "DOWNLOAD_PROGRESS") {
          progress.hidden = false;
          progress.max = data.total;
          progress.value = data.completed;
          status.textContent = `${data.completed} van ${data.total} bestanden gedownload`;
        } else if (data.type === "DOWNLOAD_COMPLETE") {
          resolve(data.total);
        } else if (data.type === "DOWNLOAD_FAILED") {
          reject(new Error(data.message));
        }
      };
      worker.postMessage({ type: "DOWNLOAD_TOUR" }, [channel.port2]);
    });
  }

  button.addEventListener("click", async () => {
    button.disabled = true;
    button.textContent = downloadingLabel;
    progress.hidden = false;
    progress.max = 1;
    progress.value = 0;
    status.textContent = "Offlinebestanden voorbereiden...";
    try {
      const worker = await serviceWorkerPromise;
      const total = await downloadTour(worker);
      progress.value = progress.max;
      status.textContent = `Klaar: ${total} bestanden zijn beschikbaar voor offline gebruik.`;
    } catch (error) {
      status.textContent =
        error instanceof Error
          ? error.message
          : "De tour kon niet offline worden opgeslagen.";
    } finally {
      button.disabled = false;
      button.textContent = startLabel;
    }
  });

  navigator.serviceWorker?.addEventListener("message", ({ data }) => {
    if (data.type === "CACHE_UPDATED") {
      status.textContent = "De offline tour is bijgewerkt.";
    } else if (data.type === "CACHE_UPDATE_FAILED") {
      status.textContent = `Offline bijwerken is mislukt: ${data.message}`;
    }
  });
})();
