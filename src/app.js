class GetFBShareList {
  constructor() {
    this.listWrapper = document.querySelector('div[id^=view_shares_dialog]');
    this.observer = new MutationObserver(this.mutation.bind(this));
  }

  mutation(mutationsList) {
    window.scrollTo(0, document.body.offsetHeight);
    console.log(Array.from(mutationsList[0].target.children));

    const pagelet = document.getElementById('pagelet_scrolling_pager');

    if (!pagelet.children.length) {
      this.done();
    }
  }

  done() {
    console.log('done');
    const list = Array.from(this.listWrapper.children)
      .reduce((acc, childDiv) => [...acc, ...childDiv.children], [])
      .map(share => ({
        name: share.querySelector('a.profileLink').innerHTML,
        link: share.querySelector('.clearfix > a').getAttribute('href'),
      }));

    window.list = list;
    console.log(list);
  }

  start() {
    this.observer.observe(this.listWrapper, {
      childList: true,
    });

    window.scrollTo(0, document.body.offsetHeight);
  }
}

(async () => {
  const getFBShareList = new GetFBShareList();

  getFBShareList.start();
})();
