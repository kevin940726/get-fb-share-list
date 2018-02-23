const progress = document.getElementById('progress');

console.log(progress.innerHTML);

chrome.runtime.onConnect.addListener(port => {
  console.log(port.name);
  port.onMessage.addListener(msg => {
    if (msg.type === 'PROGRESS') {
      progress.innerHTML = String(msg.payload);
    }
  });
});
