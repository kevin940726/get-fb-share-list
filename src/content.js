const getFBID = profileLink => {
  const url = new URL(profileLink);

  // www.facebook.com/profile.php?id=xxx
  if (url.searchParams && url.searchParams.has('id')) {
    return url.searchParams.get('id');
  }

  // www.facebook.com/xxx?fref=nf
  return url.pathname.substr(1);
};

const mapElementToShare = element => {
  const dateTime = element.querySelector('abbr[data-utime]');
  const profileLink = element
    .querySelector('.clearfix > a')
    .getAttribute('href');

  return {
    id: getFBID(profileLink),
    name: element.querySelector('a.profileLink').innerHTML,
    profileLink,
    content: element.querySelector('.userContent').textContent,
    timestamp: Number(dateTime.getAttribute('data-utime')),
    postLink: dateTime.parentElement.getAttribute('href'),
  };
};

const unique = shareList =>
  Object.values(
    shareList.reduce(
      (map, share) => ({
        ...map,
        [share.id]: share,
      }),
      {},
    ),
  );

const getPosts = node =>
  Array.from(node.children).filter(
    child => child.getAttribute('role') === 'article',
  );

const getNextPostNode = node =>
  node.lastElementChild && !node.lastElementChild.hasAttribute('role')
    ? node.lastElementChild
    : null;

const getPostsRecursively = node => {
  const posts = getPosts(node);
  const nextPostNode = getNextPostNode(node);

  if (nextPostNode) {
    return [...posts, ...getPostsRecursively(nextPostNode)];
  }

  return posts;
};

const removePostsRecursively = node => {
  const posts = getPosts(node);
  const nextPostNode = getNextPostNode(node);

  posts.forEach(post => {
    node.removeChild(post);
  });

  if (nextPostNode) {
    removePostsRecursively(nextPostNode);
  }
};

const renderUI = (ui, progress = 0, isDone = false) => {
  ui.innerHTML = `
    <h1>${
      isDone
        ? 'Done Fetching!'
        : 'Fecthing..., please do not close this window.'
    }</h1>
    <p>Fetched <b>${progress}</b> share posts.</p>
  `;
};

const injectUI = listWrapper => {
  const parentWrapper = listWrapper.parentElement;

  const ui = document.createElement('div');
  ui.style = `
    margin: 12px 30px 12px 29px;
    padding: 12px 12px 0;
    font-size: 14px;
    border: 1px solid #dddfe2;
    border-radius: 3px;
    text-align: center;
  `;
  renderUI(ui);

  parentWrapper.insertBefore(ui, listWrapper);

  return ui;
};

const getFBShareList = () =>
  new Promise(resolve => {
    const listWrapper = document.getElementById('repost_view_dialog');
    const ui = injectUI(listWrapper);
    const shareList = [];

    const addNodes = lastNode => {
      const addedNodes = getPostsRecursively(lastNode);
      const addedPosts = addedNodes.map(mapElementToShare);
      shareList.push(...addedPosts);
      renderUI(ui, shareList.length);

      // pagelet will umount and remount, so we get it everytime when the list updated
      const pagelet = lastNode.querySelector('.uiMorePager');

      if (pagelet) {
        // fetch next page of posts
        pagelet.scrollIntoView();
      } else {
        // When there is no pagelet then the fetching is done
        listWrapper.remove();
        renderUI(ui, shareList.length, true);

        resolve(unique(shareList));
      }

      // safely remove inserted nodes
      removePostsRecursively(lastNode);
    };

    const mutation = ([mutation]) => {
      // get mutation when `.uiMorePager` get removed from DOM
      if (
        mutation.removedNodes &&
        mutation.removedNodes[0] &&
        mutation.removedNodes[0].classList.contains('uiMorePager')
      ) {
        addNodes(mutation.target);
      }
    };

    const observer = new MutationObserver(mutation);

    observer.observe(listWrapper, {
      childList: true,
      subtree: true,
    });

    // start scrolling
    addNodes(listWrapper);
  });

getFBShareList().then(shareList => {
  chrome.runtime.sendMessage({
    type: 'SHOW_RESULT_PAGE',
    payload: shareList,
  });

  // inject helper variable and logging to the window
  window.shareList = shareList;
  console.log(shareList);
});
