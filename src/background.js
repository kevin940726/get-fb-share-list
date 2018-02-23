chrome.runtime.onInstalled.addListener(() => {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: {
              schemes: ['https'],
              hostEquals: 'www.facebook.com',
              pathPrefix: '/shares',
            },
          }),
        ],
        actions: [new chrome.declarativeContent.ShowPageAction()],
      },
    ]);
  });
});

chrome.pageAction.onClicked.addListener(tab => {
  chrome.tabs.executeScript(tab.id, {
    file: 'dist/content.js',
  });

  const url = chrome.extension.getURL('src/index.html');

  chrome.tabs.create({
    url,
    selected: true,
  });
});
