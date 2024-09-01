 (function() {
  "use strict";

  /**
   * Apply .scrolled class to the body as the page is scrolled down
   */
  function toggleScrolled() {
    const selectBody = document.querySelector('body');
    const selectHeader = document.querySelector('#header');
    if (!selectHeader.classList.contains('scroll-up-sticky') && !selectHeader.classList.contains('sticky-top') && !selectHeader.classList.contains('fixed-top')) return;
    window.scrollY > 100 ? selectBody.classList.add('scrolled') : selectBody.classList.remove('scrolled');
  }

  document.addEventListener('scroll', toggleScrolled);
  window.addEventListener('load', toggleScrolled);

  /**
   * Mobile nav toggle
   */
  const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');

  function mobileNavToogle() {
    document.querySelector('body').classList.toggle('mobile-nav-active');
    mobileNavToggleBtn.classList.toggle('bi-list');
    mobileNavToggleBtn.classList.toggle('bi-x');
  }
  mobileNavToggleBtn.addEventListener('click', mobileNavToogle);

  /**
   * Hide mobile nav on same-page/hash links
   */
  document.querySelectorAll('#navmenu a').forEach(navmenu => {
    navmenu.addEventListener('click', () => {
      if (document.querySelector('.mobile-nav-active')) {
        mobileNavToogle();
      }
    });

  });

  /**
   * Toggle mobile nav dropdowns
   */
  document.querySelectorAll('.navmenu .toggle-dropdown').forEach(navmenu => {
    navmenu.addEventListener('click', function(e) {
      e.preventDefault();
      this.parentNode.classList.toggle('active');
      this.parentNode.nextElementSibling.classList.toggle('dropdown-active');
      e.stopImmediatePropagation();
    });
  });

  /**
   * Preloader
   */
  const preloader = document.querySelector('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.remove();
    });
  }

  /**
   * Scroll top button
   */
  let scrollTop = document.querySelector('.scroll-top');

  function toggleScrollTop() {
    if (scrollTop) {
      window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
    }
  }
  scrollTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  window.addEventListener('load', toggleScrollTop);
  document.addEventListener('scroll', toggleScrollTop);

  /**
   * Animation on scroll function and init
   */
  function aosInit() {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }
  window.addEventListener('load', aosInit);

 
  /**
   * Initiate Pure Counter
   */
  new PureCounter();

  /**
   * Initiate glightbox
   */
  const glightbox = GLightbox({
    selector: '.glightbox'
  });

  /**
   * Init swiper sliders
   */
  function initSwiper() {
    document.querySelectorAll(".init-swiper").forEach(function(swiperElement) {
      let config = JSON.parse(
        swiperElement.querySelector(".swiper-config").innerHTML.trim()
      );

      if (swiperElement.classList.contains("swiper-tab")) {
        initSwiperWithCustomPagination(swiperElement, config);
      } else {
        new Swiper(swiperElement, config);
      }
    });
  }

  window.addEventListener("load", initSwiper);

  /**
   * Frequently Asked Questions Toggle
   */
  document.querySelectorAll('.faq-item h3, .faq-item .faq-toggle').forEach((faqItem) => {
    faqItem.addEventListener('click', () => {
      faqItem.parentNode.classList.toggle('faq-active');
    });
  });

})();

$(document).ready(function () {
  const { jsPDF } = window.jspdf;
  const apiUrlBase = 'https://emailpwned-api.vercel.app/v1/breach-analytics?email=';

  $("#SearchMe").click(function (event) {
      event.preventDefault();
      let email = $("#edhu").val().toLowerCase().trim();
      let apiUrl = apiUrlBase + encodeURIComponent(email);

      if (!email) {
          alert("Please enter a valid email address.");
          return;
      }

      $.ajax(apiUrl).done(function (response) {
          generateAndDownloadPDF(response, email);
      }).fail(function (error) {
          generateAndDownloadErrorPDF(error, email);
      });
  });

  function generateAndDownloadPDF(response, email) {
      const exposedBreaches = response.ExposedBreaches.breaches_details;
      const breachesSummary = response.BreachesSummary;
      
      const doc = new jsPDF();
      doc.setFontSize(12);
      doc.text("Search Results", 10, 10);
      doc.text(`Searched Email: ${email}`, 10, 20);
      doc.text(`Exposed Breaches: ${exposedBreaches.length}`, 10, 30);
      doc.text(`Exposed Pastes: ${response.PastesSummary.cnt || 'No pastes found!'}`, 10, 40);
      doc.text(`Breaches Exposed: ${breachesSummary.site.split(';').join(', ')}`, 10, 50);

      doc.save("report.pdf");
  }

  function generateAndDownloadErrorPDF(error, email) {
      const doc = new jsPDF();
      doc.setFontSize(12);
      doc.text("Search Results", 10, 10);
      doc.text(`Searched Email: ${email}`, 10, 20);
      doc.text("Exposed Breaches: N/A", 10, 30);
      doc.text("Exposed Pastes: N/A", 10, 40);
      doc.text("Breaches Exposed: Failed to retrieve data", 10, 50);

      doc.save("error_report.pdf");
  }
});

const apiUrl = 'https://emailpwned-api.vercel.app/v1/metrics/';

$.ajax(apiUrl)
    .done(function (response) {
        let pastesCount = parseInt(response.Pastes_Count.replace(/,/g, ''), 10);
        let breachesCount = parseInt(response.Breaches_Count, 10);
        let breachesRecords = parseInt(response.Breaches_Records, 10);

        // Run counters for each metric with formatted output
        runCounter('#breaches-count', breachesCount);
        runCounter('#breaches-records', breachesRecords);
        runCounter('#pastes-count', pastesCount);
    });

// Function to format numbers
function formatNumber(value) {
    if (value >= 1e9) {
        return (value / 1e9).toFixed(1) + 'B'; // Billions
    } else if (value >= 1e6) {
        return (value / 1e6).toFixed(1) + 'M'; // Millions
    } else if (value >= 1e3) {
        return (value / 1e3).toFixed(1) + 'K'; // Thousands
    } else {
        return value.toString(); // Less than 1000, show as-is
    }
}

// Counter function with formatting
function runCounter(element, endValue, duration = 2000) {
    const startValue = 0;
    const incrementTime = 10; // milliseconds
    const steps = Math.ceil(duration / incrementTime);
    const incrementValue = (endValue - startValue) / steps;

    let currentValue = startValue;
    const counterInterval = setInterval(function () {
        currentValue += incrementValue;
        if (currentValue >= endValue) {
            currentValue = endValue;
            clearInterval(counterInterval);
        }
        $(element).text(formatNumber(Math.floor(currentValue)));
    }, incrementTime);
}
