const anchorTags = document.querySelectorAll('nav a') // Select all anchor tags inside nav-bar

anchorTags.forEach(anchor => {
  anchor.addEventListener('click', event => {
    event.preventDefault() // Prevent default anchor behavior
    const target = anchor.getAttribute('href').substring(1) // Get the target section ID without '#'

    document.documentElement.style.scrollBehavior = 'smooth'

    // Scroll the page to only these sections
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
    } else if (target === 'Contact-Us') {
      window.scrollTo({ top: 2800, behavior: 'smooth' })
    }
  })
})
