document.addEventListener("DOMContentLoaded", () => {
  const saveButton = document.getElementById("saveButton");
  const statusMessage = document.getElementById("statusMessage");
  const linksList = document.getElementById("stashedLinksList");
  const searchInput = document.getElementById("searchInput");
  // NEW: Get the filter bar elements
  const filterInfo = document.getElementById("filter-info");
  const activeFilterTag = document.getElementById("active-filter-tag");
  const clearFilterBtn = document.getElementById("clear-filter-btn");

  let allPages = [];

  // Main function to render the list, now with filter types
  function renderList(filter = "", filterType = "search") {
    linksList.innerHTML = "";
    const searchTerm = filter.toLowerCase();
    let filteredPages = [];

    // NEW: Logic to switch between search and tag filtering
    if (filterType === "tag") {
      filteredPages = allPages.filter(
        (page) => page.tags && page.tags.includes(searchTerm)
      );
      filterInfo.style.display = "flex";
      activeFilterTag.textContent = filter;
      searchInput.value = ""; // Clear search when filtering by tag
    } else {
      filteredPages = allPages.filter(
        (page) =>
          page && page.title && page.title.toLowerCase().includes(searchTerm)
      );
      filterInfo.style.display = "none"; // Hide tag filter bar
    }

    if (filteredPages.length === 0) {
      linksList.innerHTML = "<li>No pages found.</li>";
      return;
    }

    filteredPages.forEach((page) => {
      // ... (listItem, favicon, linkData, link creation is the same) ...
      const listItem = document.createElement("li");
      const favicon = document.createElement("img");
      favicon.className = "favicon";
      favicon.src =
        page.favIconUrl || chrome.runtime.getURL("icons/default-favicon.svg");
      const linkData = document.createElement("div");
      linkData.className = "link-data";
      const link = document.createElement("a");
      link.href = page.url;
      link.textContent = page.title;
      link.target = "_blank";

      const tagsContainer = document.createElement("div");
      tagsContainer.className = "tags-container";
      const tags = page.tags || [];
      tags.forEach((tag) => {
        // NEW: Change span back to a button to make it clickable
        const tagBadge = document.createElement("button");
        tagBadge.className = "tag-badge";
        tagBadge.textContent = tag;
        // NEW: Add the click event listener
        tagBadge.addEventListener("click", () => {
          renderList(tag, "tag");
        });
        tagsContainer.appendChild(tagBadge);
      });

      linkData.appendChild(link);
      linkData.appendChild(tagsContainer);

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "X";
      deleteButton.className = "delete-btn";
      deleteButton.addEventListener("click", () => deletePage(page.url));

      listItem.appendChild(favicon);
      listItem.appendChild(linkData);
      listItem.appendChild(deleteButton);
      linksList.appendChild(listItem);
    });
  }

  // ... (deletePage, saveButton listener, flashMessage are the same) ...
  function deletePage(url) {
    chrome.runtime.sendMessage(
      { action: "deletePage", url: url },
      (response) => {
        if (response && response.status === "success") {
          init();
        }
      }
    );
  }
  saveButton.addEventListener("click", async () => {
    const tabs = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (
      !tabs ||
      tabs.length === 0 ||
      !tabs[0].url ||
      !tabs[0].url.startsWith("http")
    ) {
      flashMessage("Cannot save this page.");
      return;
    }
    const currentTab = tabs[0];
    const isSaved = allPages.some((page) => page.url === currentTab.url);
    if (isSaved) {
      flashMessage("This page is already in Silo.");
      return;
    }
    const tagsString = window.prompt(
      "Add tags (comma-separated):",
      "reading, article"
    );
    const tags = tagsString ? tagsString.split(",").map((t) => t.trim()) : [];
    const newPage = {
      url: currentTab.url,
      title: currentTab.title,
      favIconUrl: currentTab.favIconUrl,
      savedAt: new Date().toISOString(),
      tags: tags,
    };
    chrome.runtime.sendMessage(
      { action: "savePage", page: newPage },
      (response) => {
        if (response && response.status === "success") {
          flashMessage("Page saved!");
          init();
        }
      }
    );
  });
  function flashMessage(message) {
    statusMessage.textContent = message;
    setTimeout(() => (statusMessage.textContent = ""), 2500);
  }

  // Main initialization logic
  async function init() {
    const data = await chrome.storage.sync.get({ stashedPages: [] });
    allPages = data.stashedPages;
    renderList(searchInput.value);
  }

  // Add listeners for search and the new clear button
  searchInput.addEventListener("input", () => renderList(searchInput.value));
  clearFilterBtn.addEventListener("click", () => renderList());

  init();
});
