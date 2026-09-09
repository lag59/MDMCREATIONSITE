const body=document.body;
const lang=document.querySelector('.lang');
lang.addEventListener('click',()=>{body.classList.toggle('es');const isSpanish=body.classList.contains('es');lang.textContent=isSpanish?'ES':'EN';lang.setAttribute('aria-label',`Current language: ${isSpanish?'Spanish':'English'}`);document.documentElement.lang=isSpanish?'es':'en'});
document.querySelectorAll('.year').forEach(year=>{year.textContent=new Date().getFullYear()});
