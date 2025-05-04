
const anchorTags = document.querySelectorAll('.navbar-nav a'); // Select all anchor tags inside the element with class "navbar-nav"

// Function to apply styles to the parent <li> of the anchor
function applyStyles(parentLi) {
  if (parentLi && parentLi.classList.contains('nav-item')) {
    parentLi.style.fontWeight = 'bold';
    parentLi.style.backgroundColor = '#46b06C';
    parentLi.style.border = '3px solid #28a745';
    parentLi.style.color='white';

    const anchor = parentLi.querySelector('a');
    if (anchor) {
      anchor.style.color = 'white'; 
    }
  

  }
}

// Function to remove styles from the parent <li> of the anchor
function removeStyles(parentLi) {
  if (parentLi && parentLi.classList.contains('nav-item')) {
    parentLi.style.fontWeight = '';
    parentLi.style.backgroundColor = '';
    parentLi.style.border = '';
    parentLi.style.color='';

    
    const anchor = parentLi.querySelector('a');
    if (anchor) {
      anchor.style.color = ''; 
    }
  
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
        window.scrollTo({ top: 2300, behavior: 'smooth' });
      } else if (target === 'testimonials') {
        window.scrollTo({ top: 3850, behavior: 'smooth' });
      } else if (target === 'FAQS') {
        window.scrollTo({ top: 5000, behavior: 'smooth' });
      }
    } else {
      // Desktop view scroll positions
      if (target === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (target === 'role') {
        window.scrollTo({ top: 900, behavior: 'smooth' });
      } else if (target === 'services') {
        window.scrollTo({ top: 1880, behavior: 'smooth' });
      } else if (target === 'testimonials') {
        window.scrollTo({ top: 2750, behavior: 'smooth' });
      } else if (target === 'FAQS') {
        window.scrollTo({ top: 3500, behavior: 'smooth' });
      }
    }

    
    const parentLi = anchor.parentElement; 
    if (parentLi && parentLi.classList.contains('nav-item')) {
      anchorTags.forEach(otherAnchor => {
        const otherParentLi = otherAnchor.parentElement;
        removeStyles(otherParentLi); 
      });

      applyStyles(parentLi);
    }
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const exploreBtn = document.querySelector('.btn[href="#services-part"]');
  const servicesLink = document.querySelector('.navbar-nav a[href="#services"]');

  exploreBtn.addEventListener('click', function (event) {
      event.preventDefault();
      window.scrollTo({ top: 1850, behavior: 'smooth' });

      anchorTags.forEach(link => removeStyles(link.parentElement)); // Remove styles from all
      applyStyles(servicesLink.parentElement); // Highlight Services link
  });
});    