const anchorTags = document.querySelectorAll('.navbar-nav a'); // Select all anchor tags inside the element with class "navbar-nav"

// Function to apply styles to the parent <li> of the anchor
function applyStyles(parentLi) {
  if (parentLi && parentLi.classList.contains('nav-item')) {
    parentLi.style.fontWeight = 'bold';
    parentLi.style.backgroundColor = '#46b06C';
    parentLi.style.border = '3px solid #28a745';
    parentLi.style.color = 'white';
  }
}

// Function to remove styles from the parent <li> of the anchor
function removeStyles(parentLi) {
  if (parentLi && parentLi.classList.contains('nav-item')) {
    parentLi.style.fontWeight = '';
    parentLi.style.backgroundColor = '';
    parentLi.style.border = '';
    parentLi.style.color = '';
  }
}

// Apply default styles to the "Home" link
const homeLink = document.querySelector('.navbar-nav a[href="#home"]');
if (homeLink) {
  const homeParentLi = homeLink.parentElement;
  applyStyles(homeParentLi); // Apply styles to the "Home" link by default
}

// Remove styles from all other links initially
anchorTags.forEach(anchor => {
  if (anchor.getAttribute('href') !== '#home') {
    const parentLi = anchor.parentElement;
    removeStyles(parentLi); // Remove styles from all other links
  }
});

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
        window.scrollTo({ top: 3600, behavior: 'smooth' });
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

    // Apply styles to the parent <li> tag of the clicked anchor
    const parentLi = anchor.parentElement; // Get the parent <li> of the anchor
    if (parentLi && parentLi.classList.contains('nav-item')) {
      // Remove styles from all other <li> elements, including the "Home" link
      anchorTags.forEach(otherAnchor => {
        const otherParentLi = otherAnchor.parentElement;
        removeStyles(otherParentLi); // Remove styles from all links
      });

      // Apply styles to the clicked <li> element
      applyStyles(parentLi);
    }
  });
});
