// Listen for messages from the popup
// In background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "savePage") {
    // The 'page' object now comes directly from the popup
    savePage(request.page, sendResponse);
    return true;
  } else if (request.action === "deletePage") {
    deletePage(request.url, sendResponse);
    return true;
  }
});

function savePage(page, sendResponse) {
  chrome.storage.sync.get({ stashedPages: [] }, (data) => {
    const stashedPages = data.stashedPages;
    // Add the new page object to the array
    stashedPages.unshift(page); // unshift adds to the beginning

    chrome.storage.sync.set({ stashedPages }, () => {
      console.log("Page saved with tags:", page);
      sendResponse({ status: "success" });
    });
  });
}

// ... deletePage function remains unchanged ...

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