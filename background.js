// background.js
chrome.browserAction.onClicked.addListener(function(tab) {
    const desiredURL = "https://myactivity.google.com/page?hl=en&utm_medium=web&utm_source=youtube&page=youtube_comments";
    chrome.tabs.create({ url: desiredURL });
  });
  