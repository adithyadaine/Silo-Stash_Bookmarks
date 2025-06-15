// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "savePage") {
    // ... (your existing savePage code is here) ...
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
    return true;
  } else if (request.action === "deletePage") {
    // NEW: Handle the delete request
    deletePage(request.url, sendResponse);
    return true; // Required for async response
  }
});

function savePage(page, sendResponse) {
  // ... (this function remains unchanged) ...
  chrome.storage.sync.get({ stashedPages: [] }, (data) => {
    const stashedPages = data.stashedPages;
    stashedPages.push(page);
    chrome.storage.sync.set({ stashedPages }, () => {
      console.log("Page stashed:", page);
      sendResponse({ status: "success" });
    });
  });
}

// NEW: Function to delete a page by its URL
function deletePage(pageUrl, sendResponse) {
  chrome.storage.sync.get({ stashedPages: [] }, (data) => {
    // Filter out the page that matches the URL to delete
    const updatedPages = data.stashedPages.filter(
      (page) => page.url !== pageUrl,
    );

    // Save the new, shorter list back to storage
    chrome.storage.sync.set({ stashedPages: updatedPages }, () => {
      console.log("Page deleted:", pageUrl);
      sendResponse({ status: "success" });
    });
  });
}