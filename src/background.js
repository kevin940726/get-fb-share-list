chrome.runtime.onInstalled.addListener(() => {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: {
              schemes: ['https'],
              hostEquals: 'www.facebook.com',
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
});

// TODO: replace it with a map with postID as key
let shareList = [];

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'SHOW_RESULT_PAGE') {
    const resultURL = chrome.runtime.getURL('dist/index.html');
    chrome.tabs.create({ url: resultURL }, tab => {
      shareList = request.payload;
    });
  } else if (request.type === 'GET_RESULT_SHARE_LIST') {
    sendResponse(shareList);
  }
});

// handle facebook login
chrome.tabs.onUpdated.addListener((tabID, changeInfo, tab) => {
  if (
    changeInfo.url.startsWith(
      'https://www.facebook.com/connect/login_success.html',
    )
  ) {
    const resultURL = chrome.runtime.getURL('dist/index.html');
    const { hash } = new URL(changeInfo.url);

    chrome.tabs.update(tabID, {
      url: `${resultURL}${hash}`,
    });
  }
});
