'use strict';

function setupTabs(containerSelector, attribute, panelPrefix) {
  const container = document.querySelector(containerSelector);
  const tabs = Array.from(container.querySelectorAll('[role="tab"]'));
  function activate(tab) {
    tabs.forEach((other) => {
      const selected = other === tab;
      other.setAttribute('aria-selected', String(selected));
      other.tabIndex = selected ? 0 : -1;
      document.getElementById(panelPrefix + other.dataset[attribute]).hidden = !selected;
    });
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(tab));
    tab.addEventListener('keydown', (event) => {
      let target;
      if (event.key === 'ArrowRight') target = tabs[(index + 1) % tabs.length];
      if (event.key === 'ArrowLeft') target = tabs[(index - 1 + tabs.length) % tabs.length];
      if (event.key === 'Home') target = tabs[0];
      if (event.key === 'End') target = tabs[tabs.length - 1];
      if (target) { event.preventDefault(); activate(target); target.focus(); }
    });
  });
}
setupTabs('.behavior-tabs', 'example', 'example-');

const dialog = document.getElementById('figure-dialog');
const dialogImage = document.getElementById('dialog-image');
let figureTrigger;
document.querySelectorAll('.figure-zoom').forEach((button) => {
  button.addEventListener('click', () => {
    figureTrigger = button;
    document.getElementById('figure-dialog-title').textContent = button.dataset.title;
    dialogImage.src = button.dataset.image;
    dialogImage.alt = button.querySelector('img').alt;
    dialog.showModal();
  });
});
document.getElementById('close-figure').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});
dialog.addEventListener('close', () => figureTrigger?.focus());
document.addEventListener('visibilitychange', () => {
  if (document.hidden) document.querySelectorAll('video').forEach((video) => video.pause());
});
