// ===============================
// NARAD — Digital Design Studio
// JavaScript
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  // Automatically update the copyright year
  const yearElement = document.getElementById("current-year");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // Smooth navigation for internal links
  const internalLinks = document.querySelectorAll('a[href^="#"]');

  internalLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");

      if (!targetId || targetId === "#") {
        return;
      }

      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        event.preventDefault();

        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });

  const aboutTabList = document.querySelector(
    '[role="tablist"][aria-label="About Narad"]',
  );

  if (aboutTabList) {
    const tabs = Array.from(aboutTabList.querySelectorAll('[role="tab"]'));
    const activateTab = (selectedTab) => {
      tabs.forEach((tab) => {
        const selected = tab === selectedTab;
        const panelId = tab.getAttribute("aria-controls");
        const panel = panelId ? document.getElementById(panelId) : null;

        tab.setAttribute("aria-selected", String(selected));
        tab.tabIndex = selected ? 0 : -1;

        if (panel) {
          panel.hidden = !selected;
        }
      });
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activateTab(tab));
      tab.addEventListener("keydown", (event) => {
        let nextIndex;

        switch (event.key) {
          case "ArrowRight":
            nextIndex = (index + 1) % tabs.length;
            break;
          case "ArrowLeft":
            nextIndex = (index - 1 + tabs.length) % tabs.length;
            break;
          case "Home":
            nextIndex = 0;
            break;
          case "End":
            nextIndex = tabs.length - 1;
            break;
          default:
            return;
        }

        event.preventDefault();
        const nextTab = tabs[nextIndex];
        nextTab.focus();
        activateTab(nextTab);
      });
    });
  }

  const contactForm = document.getElementById("contactForm");
  const contactFormStatus = document.getElementById("contactFormStatus");

  if (contactForm && contactFormStatus) {
    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const submitButton = contactForm.querySelector('button[type="submit"]');

      submitButton.disabled = true;
      contactFormStatus.textContent = "Sending message...";

      const formData = new FormData(contactForm);

      const enquiry = {
        name: formData.get("name").trim(),
        email: formData.get("email").trim(),
        message: formData.get("message").trim(),
      };

      try {
        const response = await fetch("http://192.168.1.7:3000/api/contact", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(enquiry),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Could not send message.");
        }

        contactFormStatus.textContent = "Message sent successfully!";
        contactForm.reset();
      } catch (error) {
        console.error("Contact form error:", error);
        contactFormStatus.textContent =
          "Could not send your message. Please try again.";
      } finally {
        submitButton.disabled = false;
      }
    });
  }
});
