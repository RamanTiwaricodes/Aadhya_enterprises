/**
 * ===================================================================
 * AADYA ENTERPRISES — PREMIUM SOLAR ENERGY SCRIPT
 * High-performance, accessible, responsive interactive features
 * ===================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initStickyHeader();
  initMobileMenu();
  initScrollReveal();
  initSolarCalculator();
  initGalleryLightbox();
  initFaqAccordion();
  initEnquiryForm();
  initTiltEffect();
});

/* ----------------------------------------------------
   1. Preloader
   ---------------------------------------------------- */
function initPreloader() {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  const hideLoader = () => {
    preloader.classList.add('loaded');
  };

  if (document.readyState === 'complete') {
    setTimeout(hideLoader, 350);
  } else {
    window.addEventListener('load', () => setTimeout(hideLoader, 350));
    // Safe fallback timeout
    setTimeout(hideLoader, 1500);
  }
}

/* ----------------------------------------------------
   2. Sticky Header Shrink
   ---------------------------------------------------- */
function initStickyHeader() {
  const header = document.querySelector('.sticky-header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/* ----------------------------------------------------
   3. Mobile Drawer Navigation
   ---------------------------------------------------- */
function initMobileMenu() {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const drawer = document.getElementById('mobileDrawer');
  const overlay = document.getElementById('drawerOverlay');
  const navLinks = document.querySelectorAll('.mobile-nav-link');

  if (!hamburgerBtn || !drawer || !overlay) return;

  function toggleMenu(isOpen) {
    hamburgerBtn.classList.toggle('active', isOpen);
    drawer.classList.toggle('open', isOpen);
    overlay.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  hamburgerBtn.addEventListener('click', () => {
    const isCurrentlyOpen = drawer.classList.contains('open');
    toggleMenu(!isCurrentlyOpen);
  });

  overlay.addEventListener('click', () => toggleMenu(false));

  navLinks.forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });
}

/* ----------------------------------------------------
   4. Scroll Reveal via IntersectionObserver
   ---------------------------------------------------- */
function initScrollReveal() {
  // Check if reduced motion is requested
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal-fade-up, .reveal-fade-left, .reveal-fade-right, .reveal-scale-in')
      .forEach(el => el.classList.add('is-revealed'));
    return;
  }

  const revealElements = document.querySelectorAll('.reveal-fade-up, .reveal-fade-left, .reveal-fade-right, .reveal-scale-in');

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => observer.observe(el));
}

/* ----------------------------------------------------
   5. Solar Savings Calculator with Count-up Animations
   ---------------------------------------------------- */
function initSolarCalculator() {
  const billRange = document.getElementById('billRange');
  const billDisplay = document.getElementById('billDisplay');
  const typeButtons = document.querySelectorAll('.type-btn');
  const rooftopInput = document.getElementById('rooftopArea');
  
  const resCapacity = document.getElementById('calcCapacity');
  const resMonthly = document.getElementById('calcMonthly');
  const resYearly = document.getElementById('calcYearly');
  const resPayback = document.getElementById('calcPayback');
  const resCo2 = document.getElementById('calcCo2');
  const calcWhatsappBtn = document.getElementById('calcWhatsappBtn');

  if (!billRange || !billDisplay) return;

  let currentType = 'Residential';

  typeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      typeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentType = btn.getAttribute('data-type') || 'Residential';
      calculateSolar();
    });
  });

  billRange.addEventListener('input', () => {
    billDisplay.textContent = `₹${parseInt(billRange.value, 10).toLocaleString('en-IN')}`;
    calculateSolar();
  });

  if (rooftopInput) {
    rooftopInput.addEventListener('input', calculateSolar);
  }

  function animateNumber(element, start, end, prefix = '', suffix = '', decimals = 0, duration = 400) {
    if (!element) return;
    const startTime = performance.now();
    
    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease out
      const current = start + (end - start) * easeProgress;
      
      let formatted = decimals > 0 ? current.toFixed(decimals) : Math.round(current).toLocaleString('en-IN');
      element.textContent = `${prefix}${formatted}${suffix}`;
      
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }
    requestAnimationFrame(step);
  }

  let prevCap = 0;
  let prevMonth = 0;
  let prevYear = 0;
  let prevPayback = 0;
  let prevCo2 = 0;

  function calculateSolar() {
    const bill = parseFloat(billRange.value) || 4500;
    
    // Tariff estimate per unit in Lucknow (UPPCL / MVVNL)
    let unitRate = 7.5;
    if (currentType === 'Commercial') unitRate = 9.0;
    if (currentType === 'Industrial') unitRate = 8.2;

    const monthlyUnits = bill / unitRate;
    // 1 kW solar generates ~120 units per month in UP sun
    let recommendedKw = monthlyUnits / 120;
    recommendedKw = Math.max(1, Math.round(recommendedKw * 2) / 2); // round to 0.5 kW steps

    // Check rooftop constraint if specified (approx 90-100 sq ft per kW)
    const rooftopArea = parseFloat(rooftopInput?.value) || 500;
    const maxCapacityByRoof = Math.max(1, Math.floor(rooftopArea / 90));
    const finalKw = Math.min(recommendedKw, maxCapacityByRoof);

    // Monthly & Yearly Savings
    const estimatedMonthlySavings = Math.round(finalKw * 120 * unitRate * 0.92);
    const estimatedYearlySavings = estimatedMonthlySavings * 12;

    // Approximate investment cost based on tier & subsidies
    const approximateCost = finalKw * 60000;
    const paybackYears = Math.max(2.8, Math.round((approximateCost / estimatedYearlySavings) * 10) / 10);

    // CO2 offset: ~1.4 tons per kW per year
    const co2Reduction = Math.round(finalKw * 1.4 * 10) / 10;

    // Animate UI numbers
    animateNumber(resCapacity, prevCap, finalKw, '', ' kW', 1);
    animateNumber(resMonthly, prevMonth, estimatedMonthlySavings, '₹', '/mo', 0);
    animateNumber(resYearly, prevYear, estimatedYearlySavings, '₹', '/yr', 0);
    animateNumber(resPayback, prevPayback, paybackYears, '', ' Yrs', 1);
    animateNumber(resCo2, prevCo2, co2Reduction, '', ' Tons/yr', 1);

    prevCap = finalKw;
    prevMonth = estimatedMonthlySavings;
    prevYear = estimatedYearlySavings;
    prevPayback = paybackYears;
    prevCo2 = co2Reduction;

    // Update CTA button link to WhatsApp with calculated parameters
    if (calcWhatsappBtn) {
      const msg = `Hello Aadya Enterprises! I used your Solar Savings Calculator.%0A- Property: ${currentType}%0A- Monthly Bill: ₹${bill}%0A- Recommended Capacity: ${finalKw} kW%0A- Est. Yearly Savings: ₹${estimatedYearlySavings.toLocaleString('en-IN')}%0APlease provide a free consultation and rooftop site survey.`;
      calcWhatsappBtn.href = `https://wa.me/918052511835?text=${msg}`;
    }
  }

  calculateSolar();
}

/* ----------------------------------------------------
   6. Gallery Lightbox with Keyboard & Touch Support
   ---------------------------------------------------- */
const galleryItemsData = [
  { src: 'assets/solar-1.jpg', title: 'High-Efficiency Rooftop Installation', tag: 'Residential Solar' },
  { src: 'assets/solar-2.jpg', title: 'Precision Mounting & Structure Assembly', tag: 'Structural Engineering' },
  { src: 'assets/solar-3.jpg', title: 'Advanced Hybrid Inverter & Protection Units', tag: 'Power Management' },
  { src: 'assets/solar-4.jpg', title: 'Comprehensive Solar Package Solutions', tag: 'Silver / Gold / Platinum' },
  { src: 'assets/solar-5.jpg', title: 'Government Subsidy & Net Metering Advisory', tag: 'PM Surya Ghar' },
  { src: 'assets/solar-6.jpg', title: 'Completed Turnkey Home Solar Project', tag: 'Clean Energy Handover' }
];

function initGalleryLightbox() {
  const modal = document.getElementById('lightboxModal');
  const imgEl = document.getElementById('lightboxImg');
  const captionEl = document.getElementById('lightboxCaption');
  const closeBtn = document.getElementById('lightboxClose');
  const prevBtn = document.getElementById('lightboxPrev');
  const nextBtn = document.getElementById('lightboxNext');
  const galleryItems = document.querySelectorAll('.gallery-item');

  if (!modal || !imgEl) return;

  let currentIndex = 0;

  function showImage(index) {
    if (index < 0) index = galleryItemsData.length - 1;
    if (index >= galleryItemsData.length) index = 0;
    currentIndex = index;

    imgEl.src = galleryItemsData[currentIndex].src;
    imgEl.alt = galleryItemsData[currentIndex].title;
    if (captionEl) {
      captionEl.textContent = `${galleryItemsData[currentIndex].title} (${galleryItemsData[currentIndex].tag})`;
    }
  }

  function openLightbox(index) {
    showImage(index);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const idx = parseInt(item.getAttribute('data-index') || '0', 10);
      openLightbox(idx);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (prevBtn) prevBtn.addEventListener('click', () => showImage(currentIndex - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => showImage(currentIndex + 1));

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
    if (e.key === 'ArrowRight') showImage(currentIndex + 1);
  });
}

/* ----------------------------------------------------
   7. Accessible FAQ Accordion
   ---------------------------------------------------- */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question-btn');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close other active items
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          const otherBtn = otherItem.querySelector('.faq-question-btn');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle current item
      item.classList.toggle('active', !isActive);
      btn.setAttribute('aria-expanded', String(!isActive));
    });
  });
}

/* ----------------------------------------------------
   8. Enquiry Form & Instant WhatsApp Formatter
   ---------------------------------------------------- */
function initEnquiryForm() {
  const form = document.getElementById('enquiryForm');
  const toast = document.getElementById('formToast');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('formName')?.value.trim();
    const phone = document.getElementById('formPhone')?.value.trim();
    const type = document.getElementById('formType')?.value;
    const bill = document.getElementById('formBill')?.value.trim();
    const msg = document.getElementById('formMessage')?.value.trim();

    if (!name || !phone) {
      alert('Please enter your Name and Mobile Number.');
      return;
    }

    if (toast) {
      toast.className = 'form-toast loading';
      toast.textContent = 'Opening WhatsApp with your solar consultation details...';
      toast.style.display = 'block';
    }

    const formattedMessage = `Hello Aadya Enterprises!%0A` +
      `I want a solar consultation.%0A%0A` +
      `*Name:* ${encodeURIComponent(name)}%0A` +
      `*Mobile:* ${encodeURIComponent(phone)}%0A` +
      `*Requirement:* ${encodeURIComponent(type)}%0A` +
      `*Monthly Bill:* ₹${encodeURIComponent(bill || 'Not specified')}%0A` +
      `*Message:* ${encodeURIComponent(msg || 'Requesting free site survey and quote')}`;

    const whatsappUrl = `https://wa.me/918052511835?text=${formattedMessage}`;

    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
      if (toast) {
        toast.textContent = 'Redirected to WhatsApp! Our team will assist you shortly.';
      }
    }, 600);
  });
}

/* ----------------------------------------------------
   9. Subtle 3D Card Tilt for Desktop Devices
   ---------------------------------------------------- */
function initTiltEffect() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const tiltCards = document.querySelectorAll('.service-card, .package-card, .contact-person-card');

  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// Global helper for package buttons to pre-select package in contact form
window.selectPackage = function(packageName) {
  const msgField = document.getElementById('formMessage');
  const typeField = document.getElementById('formType');
  const contactSection = document.getElementById('contact');

  if (msgField) {
    msgField.value = `Interested in the ${packageName} Solar Package. Please share site survey schedule and pricing breakdown.`;
  }
  if (typeField) {
    typeField.value = 'Residential';
  }
  if (contactSection) {
    contactSection.scrollIntoView({ behavior: 'smooth' });
  }
};
