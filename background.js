// Listen for the message from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "savePage") {
    // Get the current active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (tab && tab.url) {
        const newPage = {
          url: tab.url,
          title: tab.title,
          savedAt: new Date().toISOString(),
        };
        savePage(newPage, sendResponse);
      } else {
        sendResponse({ status: "error", message: "No active tab found." });
      }
    });
    // Return true to indicate you wish to send a response asynchronously
    return true;
  }
});

function savePage(page, sendResponse) {
  // Get existing stashed pages from storage
  chrome.storage.sync.get({ stashedPages: [] }, (data) => {
    const stashedPages = data.stashedPages;
    stashedPages.push(page);

    // Save the updated list back to storage
    chrome.storage.sync.set({ stashedPages }, () => {
      console.log("Page stashed:", page);
      sendResponse({ status: "success" });
    });
  });
}