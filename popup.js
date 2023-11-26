chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  const activeTab = tabs[0];

  if (!activeTab) {
    console.error('No active tab found.');
    return;
  }

  const isJobSearchPage = activeTab.url.startsWith('https://www.linkedin.com/jobs/search') || activeTab.url.startsWith('https://www.linkedin.com/jobs');

  const toggleSwitch = document.getElementById('toggleSwitch');
  const navigateButton = document.getElementById('navigateButton');
  const toggleSwitchContainer = document.getElementById('toggleSwitchContainer');

  // Show/hide UI elements based on the page
  toggleSwitchContainer.style.display = isJobSearchPage ? 'block' : 'none';
  navigateButton.style.display = isJobSearchPage ? 'none' : 'block';

  // Load toggle state and trigger change event if needed
  chrome.storage.sync.get('toggleState', function (data) {
    toggleSwitch.checked = data.toggleState || false;
    if (toggleSwitch.checked) {
      toggleSwitch.dispatchEvent(new Event('change'));
    }
  });
});

document.getElementById('toggleSwitch').addEventListener('change', function () {
  const toggleState = this.checked;

  // Save toggle state to storage
  chrome.storage.sync.set({ 'toggleState': toggleState });

  // Execute/remove function based on toggle state
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const activeTab = tabs[0];

    if (!activeTab) {
      console.error('No active tab found.');
      return;
    }

    if (toggleState) {
      // Execute the function when the toggle switch is ON
      chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        func: () => {
          console.log('Content Script Executed');

          var i = 0;
          function removePromoted() {
            const list = document.querySelectorAll("li");
            list.forEach(e => {
              e.innerHTML.match(/Promoted/) && e.remove();
            });
            i++;
          }

          setInterval(removePromoted, 100);
        }
      });
    } else {
      // Clean up or handle logic when the toggle switch is OFF
      chrome.tabs.reload(activeTab.id);
      console.log('Page refreshed.');
    }
  });
});

document.getElementById('navigateButton').addEventListener('click', function () {
  // Open LinkedIn job search page in the same tab
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const activeTab = tabs[0];

    if (!activeTab) {
      console.error('No active tab found.');
      return;
    }

    // Update the URL to the LinkedIn job search page
    chrome.tabs.update(activeTab.id, { url: 'https://www.linkedin.com/jobs/search' }, function () {
      // Set the toggle state to true in storage and HTML
      chrome.storage.sync.set({ 'toggleState': true });
      document.getElementById('toggleSwitch').checked = true;
      // Close the popup
      window.close();
    });
  });
});
