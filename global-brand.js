// Keep the selected figure or chapter when the reader changes language.
function syncLanguageAnchors(){
  const hash=window.location.hash;
  document.querySelectorAll('.languages a').forEach(link=>{
    const destination=new URL(link.href,window.location.href);
    destination.hash=hash;
    link.href=destination.href;
  });
}
syncLanguageAnchors();
window.addEventListener('hashchange',syncLanguageAnchors);
