(function () {
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
    navmenu.addEventListener('click', function (e) {
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
    document.querySelectorAll(".init-swiper").forEach(function (swiperElement) {
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

  let fetchResponse;

  $("#SearchMe").click(function (event) {
    event.preventDefault();
    let apiUrl = apiUrlBase + encodeURIComponent(email);
    let email = $("#edhu").val().toLowerCase().trim();

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


  $("#formSubmit").click(function (event) {
    event.preventDefault();
    let email = $("#edhu").val().toLowerCase().trim();
    let apiUrl = apiUrlBase + encodeURIComponent(email);

    if (!email) {
      $("#checkModalLabel").text(`Report Not Found`);
      $(".modal-body").text("Please Enter an Email to show result");
      $("#SearchMe").remove();
      return;
    }
    $("#checkModalLabel").text(`Breach Report for ${email}`);


    $.ajax(apiUrl).done(function (response) {
      const elementEmpty = $(".report").is(":empty");
      console.log(elementEmpty);



      if (response.BreachesSummary.site === "") {
        $(".modal-dialog").removeClass("modal-xl");
        $(".report").empty().replaceWith(`<div class="report"><h4 class="text-center text-success">You are Safe 🥳🎉</h4></div>`);
        $(".pdfDownloadBtn").empty();

      } else {
        $(".report").empty().replaceWith(renderContent(response));
      }


      function renderContent(response) {
        $(".modal-dialog").addClass("modal-xl");
        $(".report").replaceWith(`
          <div class="report d-flex justify-content-between px-2" style="gap:1.5rem;">
            <div>
                <div class="breachDetails">
                  <p style="font-family: 'Poppins'; font-size:1.5rem; font-weight: 600;">Breach Details</p>
                  <div class="exposed_details">
                   
                  </div>
                </div>
              </div>
            <div class="d-flex flex-column">
              <div class="d-flex flex-column">
                <p class="h5" style="font-family:'Poppins'; font-size:1.2rem; font-weight: 600;">Breach Category</p>
                  <div class="d-flex categories">
                  </div>
              </div>
                  <div class="breachChart" style="position: relative; height:30vh;"></div>
              </div>
            
          </div>
                  `);


        $('.breachChart').append(`<canvas id="breachCategory"></canvas>`);

        const industryName = [];
        const industryCount = [];

        const industries = response.BreachMetrics.industry[0].forEach((indus) => {
          if (indus[1] === 1) {
            $(".categories").append(`
                <p class="badge rounded-pill text-bg-primary me-1" style="text-transform: capitalize; font-family:'Poppins';">${indus[0]}</p>`);
          }
          industryName.push(indus[0]);
          industryCount.push(indus[1]);
        });

        new Chart($('#breachCategory'), {
          type: 'doughnut',
          data: {
            datasets: [{
              // label: industryName,
              data: industryCount,
              borderWidth: 1
            }],
            labels: industryName,
          },
          clip: false,
          options: {
            plugins: {
              legend: {
                display: false,
              },
              datalabels: {
                color: 'white',
                align: 'end',
                anchor: 'center'
              }

            }
          }
        });

        response.ExposedBreaches.breaches_details.forEach((detail, index) => {
          $(".exposed_details").append(` 
            
             <div class="breachDetail" style="display:grid; grid-template-columns:repeat(6,1fr); gap:1rem;" id="exposed_details">
            <div style="grid-column:1 / 1;" >
            <img src="${detail.logo}" style="width:100%; aspect-ratio:1/1; object-fit:cover; object-position:center;"/>
            </div>
            <div style="grid-column:2 / span 5; display:flex; flex-direction:column; gap:0;">
            <p style="font-family:'Poppins'; font-size:1.1rem; font-weight:600; margin-bottom:0;">${detail.breach}</p>
            <div style="display:flex; gap:0.3rem; align-items:center;">
            <div style="display:flex; gap:0.3rem; align-items:center; font-family:'Poppins'; font-size:0.8rem;">
            <i class="fa-solid fa-industry"></i>
            <p style="margin-bottom:0 !important;">${detail.industry}</p>
                              </div>
                              <span style="font-family:'Poppins';  font-size:2rem; line-height:100%;">·</span>
                              <div style="display:flex; gap:0.3rem; align-items:center; font-family:'Poppins'; font-size:0.8rem;">
                              <i class="fa-solid fa-calendar"></i>
                              <p style="margin-bottom:0 !important;">${detail.xposed_date}</p>
                              <span style="font-family:'Poppins';  font-size:2rem; line-height:100%;">·</span>
                              <p style="margin-bottom:0; font-family:'Poppins'; font-size:0.8rem;"><span style="font-weight:600;">Total Data Exposed:</span> ${formatNumber(detail.xposed_records)}</p>
                              </div>
                          </div>
                          <p style="font-family:'Poppins'; font-size:0.8rem;">${detail.details}</p>

                          <div class="exposedData" style="display:flex; gap:0.2rem;">
                           <p class="badge rounded-pill text-bg-primary me-1" style="text-transform: capitalize; font-family:'Poppins';">${detail.xposed_data.replaceAll(';', ', ')}</p>
                          </div>
                        </div> </div>`);


        });


        $(".pdfDownloadBtn").replaceWith(`<button type="button" class="btn btn-primary" id="SearchMe">
            Download PDF
          </button>`);
      }


    }).fail(function (error) {
      generateAndDownloadErrorPDF(error, email);
    });

  });

  function formatNumber(num) {
    if (num >= 1e9) {
      return (num / 1e9).toFixed(2) + ' B';
    } else if (num >= 1e6) {
      return (num / 1e6).toFixed(2) + ' M';
    } else if (num >= 1e3) {
      return (num / 1e3).toFixed(2) + ' K';
    } else {
      return num.toString();
    }
  }


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
