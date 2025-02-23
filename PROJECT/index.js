const anchorTags = document.querySelectorAll(' a') // Select all anchor tags inside nav-bar

anchorTags.forEach(anchor => {
  anchor.addEventListener('click', event => {
     
    const href = anchor.getAttribute('href');
    if (href === "Contactus.html") {
      return;
    }

    event.preventDefault();
    const target = href.substring(1);

    document.documentElement.style.scrollBehavior = 'smooth';
    if (target === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (target === 'role') {
      window.scrollTo({ top: 600, behavior: 'smooth' })
    } else if (target === 'services') {
      window.scrollTo({ top: 1200, behavior: 'smooth' })
    } else if (target === 'testimonials') {
      window.scrollTo({ top: 1800, behavior: 'smooth' })
    } else if (target === 'FAQS') {
      window.scrollTo({ top: 2400, behavior: 'smooth' })
    } else{
       
    }
  })
})
