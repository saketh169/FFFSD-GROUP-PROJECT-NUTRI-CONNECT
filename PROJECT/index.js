const anchorTags = document.querySelectorAll('a'); // Select all anchor tags inside nav-bar

anchorTags.forEach(anchor => {
  anchor.addEventListener('click', event => {
    const href = anchor.getAttribute('href');

    // Skip default behavior for external links (e.g., Contactus.html)
    if (href === "Contactus.html") {
      return;
    }

    event.preventDefault();
    const target = href.substring(1);

    // Enable smooth scrolling
    document.documentElement.style.scrollBehavior = 'smooth';

    // Get the screen width
    const screenWidth = window.innerWidth;

    // Define scroll positions for different screen widths
    if (screenWidth <= 992) {
      // Mobile view scroll positions
      if (target === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (target === 'role') {
        window.scrollTo({ top: 600, behavior: 'smooth' });
      } else if (target === 'services') {
        window.scrollTo({ top: 1800, behavior: 'smooth' });
      } else if (target === 'testimonials') {
        window.scrollTo({ top: 2800, behavior: 'smooth' });
      } else if (target === 'FAQS') {
        window.scrollTo({ top:3600 , behavior: 'smooth' });
      }
    } else {
      // Desktop view scroll positions
      if (target === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (target === 'role') {
        window.scrollTo({ top: 850, behavior: 'smooth' });
      } else if (target === 'services') {
        window.scrollTo({ top: 1650, behavior: 'smooth' });
      } else if (target === 'testimonials') {
        window.scrollTo({ top: 2200, behavior: 'smooth' });
      } else if (target === 'FAQS') {
        window.scrollTo({ top: 2800, behavior: 'smooth' });
      }
    }
  });
});
