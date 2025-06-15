// This is our canary. If we don't see this, the script isn't running.
console.log("Popup script started!");

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM content loaded. Finding elements.");

  const saveButton = document.getElementById("saveButton");
  const statusMessage = document.getElementById("statusMessage");
  const linksList = document.getElementById("stashedLinksList");

  // Function to display the saved links
  function displayStashedLinks() {
    linksList.innerHTML = ""; // Clear the list

    chrome.storage.sync.get({ stashedPages: [] }, (data) => {
      const stashedPages = data.stashedPages;
      console.log("Found stashed pages:", stashedPages);

      if (stashedPages.length === 0) {
        linksList.innerHTML = "<li>No pages stashed yet.</li>";
        return;
      }

      stashedPages.forEach((page) => {
        const listItem = document.createElement("li");
        const link = document.createElement("a");
        link.href = page.url;
        link.textContent = page.title;
        link.target = "_blank";

        listItem.appendChild(link);
        linksList.appendChild(listItem);
      });
    });
  }

  // Save button functionality
  saveButton.addEventListener("click", () => {
    console.log("Save button clicked.");
    chrome.runtime.sendMessage({ action: "savePage" }, (response) => {
      if (response && response.status === "success") {
        statusMessage.textContent = "Page saved!";
        displayStashedLinks();
        setTimeout(() => (statusMessage.textContent = ""), 2000);
      } else {
        statusMessage.textContent = "Error saving page.";
        console.error("Error response from background:", response);
      }
    });
  });

  // Initial display of links when popup opens
  displayStashedLinks();
});