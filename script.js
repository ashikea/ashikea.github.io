// Smooth scroll for internal links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function(e) {
    e.preventDefault();
    document.querySelector(this.getAttribute("href"))
      .scrollIntoView({ behavior: "smooth" });
  });
});

const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");
const closeMenu = document.getElementById("closeMenu");

menuToggle.addEventListener("click", () => {
  mobileMenu.style.display = "flex";
});

closeMenu.addEventListener("click", () => {
  mobileMenu.style.display = "none";
});

document.querySelectorAll(".mobile-menu a").forEach(link => {
  link.addEventListener("click", () => {
    mobileMenu.style.display = "none";
  });
});

// Change header background on scroll

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

// Animate skill progress bars when they come into view
document.querySelectorAll(".progress-bar").forEach(bar => {
  const width = bar.style.width;
  bar.style.width = "0";

  const skillObserver = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      bar.style.width = width;
      skillObserver.disconnect();
    }
  });

  skillObserver.observe(bar);
});

