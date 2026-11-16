document.addEventListener('click',event=>{
  const button=event.target.closest('button[data-view]');
  if(!button)return;
  const gallery=button.closest('.product-gallery');
  const image=gallery.querySelector('figure img');
  image.src=button.dataset.view;
  image.alt=button.dataset.alt;
  image.style.maskImage='url("'+button.dataset.mask+'")';
  image.style.webkitMaskImage='url("'+button.dataset.mask+'")';
  gallery.querySelector('.gallery-stage').style.cssText=button.dataset.layout;
  gallery.querySelector('.gallery-current').textContent=button.querySelector('.gallery-thumb-label').textContent;
  gallery.querySelectorAll('button[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
});
document.addEventListener('toggle',event=>{if(event.target.matches('.product-video')&&!event.target.open)event.target.querySelector('video').pause();},true);
// Keep one film playing at a time, including the homepage archive.
document.addEventListener('play',event=>{
  if(!(event.target instanceof HTMLVideoElement))return;
  document.querySelectorAll('video').forEach(video=>{if(video!==event.target)video.pause();});
},true);
