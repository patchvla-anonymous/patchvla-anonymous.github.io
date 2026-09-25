'use strict';

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
