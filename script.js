$(document).ready(function () {
    'use strict';

    /* ======================================================================
       1. PRELOADER
       ====================================================================== */
    $(window).on('load', function () {
        setTimeout(function () {
            $('#preloader').addClass('hidden');
        }, 400);
    });

    // Zaxira taymer (agar biror tashqi resurs sekin yuklansa)
    setTimeout(function () {
        $('#preloader').addClass('hidden');
    }, 2000);

    /* ======================================================================
       2. AOS (ANIMATE ON SCROLL) INITIALIZATION
       ====================================================================== */
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-out-cubic',
            once: true,
            offset: 60
        });
    }

    /* ======================================================================
       3. TYPING ANIMATION (HERO SECTION)
       [TAHRIRLASH UCHUN]: O'zingizning yo'nalishlaringizni shu massivga yozing
       ====================================================================== */
    const typingRoles = [
        "Frontend Developer",
        "UI/UX Designer",
        "Web Developer",
        "Creative Coder"
    ];

    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typingElement = document.getElementById('typing-text');

    function typeEffect() {
        if (!typingElement) return;

        const currentRole = typingRoles[roleIndex];

        if (isDeleting) {
            typingElement.textContent = currentRole.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typingElement.textContent = currentRole.substring(0, charIndex + 1);
            charIndex++;
        }

        let speed = isDeleting ? 55 : 105;

        if (!isDeleting && charIndex === currentRole.length) {
            speed = 1800; // So'z tugaganda kutish vaqti
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % typingRoles.length;
            speed = 400;
        }

        setTimeout(typeEffect, speed);
    }
    typeEffect();

    /* ======================================================================
       4. SCROLL PROGRESS, NAVBAR & BACK TO TOP
       ====================================================================== */
    $(window).on('scroll', function () {
        const scrollTop = $(this).scrollTop();
        const docHeight = $(document).height() - $(window).height();
        const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

        // Yuqoridagi ko'k progress chizig'i
        $('#scroll-progress').css('width', scrollPercent + '%');

        // Navbar foni o'zgarishi
        if (scrollTop > 50) {
            $('#mainNavbar').addClass('scrolled');
        } else {
            $('#mainNavbar').removeClass('scrolled');
        }

        // Back to Top tugmasi
        if (scrollTop > 400) {
            $('#backToTop').addClass('show');
        } else {
            $('#backToTop').removeClass('show');
        }
    });

    $('#backToTop').on('click', function () {
        $('html, body').animate({ scrollTop: 0 }, 600);
    });

    // Mobil menyuda havola bosilganda menyuni avtomatik yopish
    $('.navbar-nav .nav-link').on('click', function () {
        if ($('.navbar-collapse').hasClass('show')) {
            $('.navbar-toggler').trigger('click');
        }
    });

    /* ======================================================================
       5. CUSTOM CURSOR (FAQAT DESKTOP)
       ====================================================================== */
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');

    if (cursorDot && cursorOutline && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        window.addEventListener('mousemove', function (e) {
            const posX = e.clientX;
            const posY = e.clientY;

            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;

            cursorOutline.animate({
                left: `${posX}px`,
                top: `${posY}px`
            }, { duration: 250, fill: 'forwards' });
        });

        $('a, button, input, textarea, .glass-card').on('mouseenter', function () {
            cursorOutline.classList.add('cursor-hover');
        }).on('mouseleave', function () {
            cursorOutline.classList.remove('cursor-hover');
        });
    }

    /* ======================================================================
       6. OWL CAROUSEL (PORTFOLIO GALEREYASI)
       ====================================================================== */
    const portfolioCarousel = $('.portfolio-carousel');
    if (portfolioCarousel.length) {
        portfolioCarousel.owlCarousel({
            loop: true,
            margin: 24,
            nav: false,
            dots: true,
            autoplay: true,
            autoplayTimeout: 4000,
            autoplayHoverPause: true,
            responsive: {
                0: { items: 1 },
                768: { items: 2 },
                1200: { items: 3 }
            }
        });

        $('.owl-prev-custom').on('click', function () {
            portfolioCarousel.trigger('prev.owl.carousel');
        });

        $('.owl-next-custom').on('click', function () {
            portfolioCarousel.trigger('next.owl.carousel');
        });
    }

    /* ======================================================================
       7. NOTIFICATION (TOAST) FUNKSIYASI
       ====================================================================== */
    function showNotification(message, type = 'info') {
        const toast = $(`<div class="custom-toast toast-${type}">${message}</div>`);
        $('#notification-container').append(toast);

        setTimeout(function () {
            toast.fadeOut(400, function () {
                $(this).remove();
            });
        }, 5000);
    }

    /* ======================================================================
       8. CONTACT FORM (BACKEND BILAN ISHLASH YOKI OGOHLANTIRISH)
       ====================================================================== */
    $('#contactForm').on('submit', async function (e) {
        e.preventDefault();

        const name = $('#senderName').val().trim();
        const email = $('#senderEmail').val().trim();
        const subject = $('#senderSubject').val().trim();
        const message = $('#senderMessage').val().trim();
        const endpoint = $(this).data('endpoint'); // Formspree yoki API manzili

        // Oddiy validatsiya
        if (!name || !email || !subject || !message) {
            showNotification('Iltimos, barcha maydonlarni to‘ldiring.', 'error');
            return;
        }

        // Agar backend / Formspree ulanmagan bo'lsa, yolg'on "yuborildi" xabarini ko'rsatmaymiz
        if (!endpoint) {
            showNotification(
                '<strong>Eslatma:</strong> Formaga hali backend (masalan, Formspree) ulanmagan. To‘g‘ridan-to‘g‘ri <a href="mailto:zaxro@gmail.com" class="text-info text-decoration-underline">zaxro@gmail.com</a> yoki Telegram orqali yozishingiz mumkin.',
                'warning'
            );
            return;
        }

        // Backend ulangan holat uchun real POST so'rov
        const submitBtn = $('#submitBtn');
        const originalText = submitBtn.html();
        submitBtn.prop('disabled', true).html('<i class="fa-solid fa-spinner fa-spin me-2"></i>Yuborilmoqda...');

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ name, email, subject, message })
            });

            if (response.ok) {
                showNotification('Xabaringiz muvaffaqiyatli yuborildi! Tez orada javob beraman.', 'success');
                this.reset();
            } else {
                showNotification('Xatolik yuz berdi. Iltimos, qayta urinib ko‘ring.', 'error');
            }
        } catch (error) {
            showNotification('Tarmoq xatoligi yuz berdi. Internet aloqasini tekshiring.', 'error');
        } finally {
            submitBtn.prop('disabled', false).html(originalText);
        }
    });
});