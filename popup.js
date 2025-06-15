document.addEventListener("DOMContentLoaded", () => {
  const saveButton = document.getElementById("saveButton");
  const statusMessage = document.getElementById("statusMessage");
  const linksList = document.getElementById("stashedLinksList");
  const searchInput = document.getElementById("searchInput"); // Get the search input

  // Function to display links, now with an optional filter
  function displayStashedLinks(filter = "") {
    linksList.innerHTML = ""; // Clear the list

    chrome.storage.sync.get({ stashedPages: [] }, (data) => {
      const searchTerm = filter.toLowerCase();

      // Filter pages based on the search term before displaying
      const filteredPages = data.stashedPages.filter((page) =>
        page.title.toLowerCase().includes(searchTerm),
      );

      if (filteredPages.length === 0) {
        linksList.innerHTML = "<li>No matching pages found.</li>";
        return;
      }

      filteredPages.forEach((page) => {
        // This part is the same as before
        const listItem = document.createElement("li");
        const favicon = document.createElement("img");
        favicon.className = "favicon";
        favicon.src = page.favIconUrl || "icons/default-favicon.svg";

        const link = document.createElement("a");
        link.href = page.url;
        link.textContent = page.title;
        link.target = "_blank";

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "X";
        deleteButton.className = "delete-btn";
        deleteButton.title = "Delete this item";

        deleteButton.addEventListener("click", () => {
          chrome.runtime.sendMessage(
            { action: "deletePage", url: page.url },
            (response) => {
              if (response && response.status === "success") {
                displayStashedLinks(searchInput.value); // Re-filter with current search
              }
            },
          );
        });

        listItem.appendChild(favicon);
        listItem.appendChild(link);
        listItem.appendChild(deleteButton);
        linksList.appendChild(listItem);
      });
    });
  }

  // Save button functionality
  saveButton.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "savePage" }, (response) => {
      if (response && response.status === "success") {
        statusMessage.textContent = "Page saved!";
        displayStashedLinks(searchInput.value); // Refresh list with filter
        setTimeout(() => (statusMessage.textContent = ""), 2000);
      }
    });
  });

  // NEW: Event listener for the search input
  searchInput.addEventListener("input", () => {
    displayStashedLinks(searchInput.value);
  });

  // Initial display of all links when popup opens
  displayStashedLinks();
});