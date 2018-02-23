const port = chrome.runtime.connect();

const flattenNodes = nodes =>
  Array.from(nodes).reduce((list, node) => [...list, ...node.children], []);

const scrollToBottom = () => window.scrollTo(0, document.body.offsetHeight);

const mapElementToShare = element => ({
  name: element.querySelector('a.profileLink').innerHTML,
  link: element.querySelector('.clearfix > a').getAttribute('href'),
});

const unique = shareList =>
  Object.values(
    shareList.reduce(
      (map, share) =>
        Object.assign({}, map, {
          [share.link]: share,
        }),
      {},
    ),
  );

const getFBShareList = () =>
  new Promise(resolve => {
    const listWrapper = document.querySelector('div[id^=view_shares_dialog]');
    const shareList = flattenNodes(listWrapper.children).map(mapElementToShare);

    const mutation = mutationsList => {
      scrollToBottom();

      const addedShares = flattenNodes(mutationsList[0].addedNodes).map(
        mapElementToShare,
      );

      shareList.push(...addedShares);

      console.log(shareList.length);
      port.postMessage({
        type: 'PROGRESS',
        payload: shareList.length,
      });

      // pagelet will umount and remount, so we get it everytime the list updated
      const pagelet = document.getElementById('pagelet_scrolling_pager');

      // When there is no children in pagelet then the fetching is done
      if (!pagelet.children.length) {
        resolve(unique(shareList));
      }
    };

    const observer = new MutationObserver(mutation);

    observer.observe(listWrapper, {
      childList: true,
    });

    scrollToBottom();
  });

getFBShareList().then(console.log);
