// Mobile menu + dropdowns
const header = document.querySelector(".header");
document.querySelector(".menu-btn").addEventListener("click", (e) => {
  const open = header.classList.toggle("menu-open");
  e.currentTarget.setAttribute("aria-expanded", open);
});
document.querySelectorAll(".nav-item > button").forEach((btn) => {
  btn.addEventListener("click", () => {
    const item = btn.parentElement;
    document.querySelectorAll(".nav-item.open").forEach((o) => o !== item && o.classList.remove("open"));
    btn.setAttribute("aria-expanded", item.classList.toggle("open"));
  });
});
document.addEventListener("click", (e) => {
  if (!e.target.closest(".nav-item")) document.querySelectorAll(".nav-item.open").forEach((o) => o.classList.remove("open"));
  if (e.target.closest(".header-panel a")) header.classList.remove("menu-open");
});

// The audience tab under the logo shows only while the hero is on screen, so it does not sit over content further down.
const hero = document.querySelector("main > :first-child");
if (hero && "IntersectionObserver" in window) {
  new IntersectionObserver(([entry]) => header.classList.toggle("past-hero", !entry.isIntersecting), {
    rootMargin: `-${header.offsetHeight}px 0px 0px 0px`,
  }).observe(hero);
}

// Accordion feature: one item open at a time, matching visual on the stage.
// The progress bar under the stage shows the time left before the next tab opens. It waits while the
// pointer or keyboard focus is on the section, and stops for good once the visitor picks a tab.
document.querySelectorAll("[data-accordion]").forEach((root) => {
  const DWELL = 4500;
  const items = root.querySelectorAll(".acc-item");
  const mocks = root.querySelectorAll(".mock");
  const bars = [...root.querySelector(".progress").children];
  let current = 0;
  let elapsed = 0;
  let paused = false;
  let auto = !matchMedia("(prefers-reduced-motion: reduce)").matches;
  const show = (i) => {
    current = i;
    elapsed = 0;
    items.forEach((el, j) => {
      el.classList.toggle("on", i === j);
      el.querySelector("button").setAttribute("aria-expanded", i === j);
    });
    mocks.forEach((el, j) => el.classList.toggle("on", i === j));
    bars.forEach((el, j) => {
      el.classList.toggle("on", i === j);
      el.classList.toggle("done", j < i);
      el.style.setProperty("--p", auto ? 0 : 1);
    });
  };
  let last = 0;
  const tick = (now) => {
    if (!auto) return;
    if (!paused && last) elapsed += Math.min(now - last, 100); // cap so a background tab does not skip ahead
    last = now;
    if (elapsed >= DWELL) show((current + 1) % items.length);
    bars[current].style.setProperty("--p", elapsed / DWELL);
    requestAnimationFrame(tick);
  };
  items.forEach((item, i) => {
    item.querySelector("button").addEventListener("click", () => {
      auto = false;
      show(i);
    });
  });
  ["mouseenter", "focusin"].forEach((e) => root.addEventListener(e, () => (paused = true)));
  ["mouseleave", "focusout"].forEach((e) => root.addEventListener(e, () => (paused = false)));
  show(0);
  requestAnimationFrame(tick);
});

// Horizontal scroller: arrows and dots move one card at a time; one dot per scroll stop
document.querySelectorAll("[data-scroller]").forEach((root) => {
  const track = root.querySelector(".scroller-track");
  const prev = root.querySelector(".prev");
  const next = root.querySelector(".next");
  const dots = root.querySelector(".dots");
  const step = () => track.firstElementChild.getBoundingClientRect().width + 16;
  const max = () => track.scrollWidth - track.clientWidth;
  const go = (i) => track.scrollTo({ left: i * step(), behavior: "smooth" });
  const current = () => (track.scrollLeft > max() - 4 ? dots.children.length - 1 : Math.round(track.scrollLeft / step()));
  const sync = () => {
    const i = current();
    prev.disabled = i === 0;
    next.disabled = i === dots.children.length - 1;
    [...dots.children].forEach((d, j) => d.classList.toggle("on", i === j));
  };
  const build = () => {
    const stops = Math.ceil(max() / step() - 0.05) + 1;
    dots.innerHTML = "";
    for (let i = 0; i < stops; i++) {
      const d = document.createElement("button");
      d.type = "button";
      d.setAttribute("aria-label", `Go to testimonial ${i + 1}`);
      d.addEventListener("click", () => go(i));
      dots.appendChild(d);
    }
    sync();
  };
  prev.addEventListener("click", () => go(current() - 1));
  next.addEventListener("click", () => go(current() + 1));
  track.addEventListener("scroll", sync, { passive: true });
  window.addEventListener("resize", build);
  build();
});

// Contact form. A link's ?topic= picks the "How can YECC help?" option and a starter message, so the form
// can be sent as is. With an endpoint set it posts JSON (the option becomes the email subject); until then
// it opens the visitor's email app with everything filled in. Either way it confirms, then returns home.
const contactForm = document.querySelector("form[data-contact]");
if (contactForm) {
  const select = contactForm.elements.subject;
  const message = contactForm.elements.message;
  const topicField = contactForm.elements.topic;
  const panel = contactForm.parentElement;
  const done = panel.querySelector(".form-done");
  const error = contactForm.querySelector(".form-error");
  let topics = {};
  try { topics = JSON.parse(document.getElementById("contact-topics").textContent); } catch {}

  // The starter message is replaced when the option changes, unless the visitor has written their own.
  let starter = message.value;
  const setStarter = (text) => { if (message.value.trim() === starter.trim() || !message.value.trim()) message.value = text; starter = text; };
  const topic = topics[new URLSearchParams(location.search).get("topic")];
  if (topic) {
    select.value = topic.option;
    setStarter(topic.message);
    topicField.value = new URLSearchParams(location.search).get("topic");
  }
  select.addEventListener("change", () => setStarter(select.selectedOptions[0].dataset.message || ""));

  const finish = (title, text) => {
    done.querySelector("[data-done-title]").textContent = title;
    done.querySelector("[data-done-text]").textContent = text;
    contactForm.hidden = true;
    done.hidden = false;
    done.focus();
    let left = 8;
    const count = done.querySelector("[data-countdown]");
    const timer = setInterval(() => {
      left -= 1;
      count.textContent = left;
      if (left <= 0) { clearInterval(timer); location.href = contactForm.dataset.home; }
    }, 1000);
  };

  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    error.hidden = true;
    const d = Object.fromEntries(new FormData(contactForm));
    const payload = { subject: d.subject, name: d.name, company: d.company, email: d.email, role: d.role, message: d.message, topic: d.topic, page: document.referrer || location.href };
    const first = d.name.trim().split(/\s+/)[0];
    const endpoint = contactForm.dataset.endpoint;

    if (!endpoint) {
      const body = [`Name: ${d.name}`, `Company: ${d.company}`, `Work email: ${d.email}`, `Role: ${d.role}`, "", d.message].join("\n");
      location.href = `mailto:${contactForm.dataset.mailto}?subject=${encodeURIComponent(d.subject)}&body=${encodeURIComponent(body)}`;
      finish(`Thanks, ${first}. One last step.`, `Your email app has opened with your message ready. Press send there and the YECC team will get back to you at ${d.email}.`);
      return;
    }

    const button = contactForm.querySelector("button[type=submit]");
    button.disabled = true;
    button.textContent = "Sending…";
    try {
      const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error(String(res.status));
      finish(`Thank you, ${first}. Your message is on its way.`, `The YECC team will review your note about “${d.subject}” and get back to you at ${d.email}.`);
    } catch {
      error.textContent = `Sorry, your message could not be sent. Please try again, or email us at ${contactForm.dataset.mailto}.`;
      error.hidden = false;
      button.disabled = false;
      button.textContent = "Send message";
    }
  });
}

// Cohort inquiry form. It posts to the Google Form that collects fresher cohort leads, so answers land in the
// same responses sheet. Google does not let other sites read its reply, so a sent request counts as done;
// only a network failure shows an error. ?cohort=<slug> pre-selects the cohort.
const inquiry = document.querySelector("form[data-inquiry]");
if (inquiry) {
  const panel = inquiry.parentElement;
  const done = panel.querySelector(".form-done");
  const error = inquiry.querySelector(".form-error");
  const slug = new URLSearchParams(location.search).get("cohort");
  const pick = slug && inquiry.querySelector(`option[data-cohort="${CSS.escape(slug)}"]`);
  if (pick) pick.selected = true;

  // WhatsApp number: the code keeps a leading "+" and digits, the number keeps digits only. An Indian (+91)
  // number must be 10 digits starting 6 to 9. Both are joined into the Google Form answer on submit.
  const code = inquiry.querySelector(".phone-code");
  const phone = inquiry.querySelector(".phone-number");
  const phoneField = inquiry.querySelector(".phone ~ input[type=hidden]");
  const checkPhone = () => {
    const india = code.value === "+91";
    phone.setCustomValidity(india && phone.value && !/^[6-9][0-9]{9}$/.test(phone.value) ? "Please enter a valid 10-digit Indian mobile number." : "");
  };
  code.addEventListener("input", () => {
    code.value = "+" + code.value.replace(/[^0-9]/g, "").slice(0, 4);
    checkPhone();
  });
  phone.addEventListener("input", () => {
    phone.value = phone.value.replace(/[^0-9]/g, "");
    checkPhone();
  });

  // "I was referred by" only appears when the visitor says someone referred them.
  const referred = inquiry.querySelector(".referred");
  const source = inquiry.querySelector("select.source");
  source.addEventListener("change", () => { referred.hidden = !source.value.startsWith("I got your reference"); });

  inquiry.addEventListener("submit", async (e) => {
    e.preventDefault();
    error.hidden = true;
    phoneField.value = `${code.value} ${phone.value}`;
    const button = inquiry.querySelector("button[type=submit]");
    button.disabled = true;
    button.textContent = "Sending…";
    try {
      await fetch(inquiry.action, { method: "POST", mode: "no-cors", body: new URLSearchParams(new FormData(inquiry)) });
      const first = (inquiry.querySelector('[autocomplete="given-name"]').value || "").trim();
      done.querySelector("[data-done-title]").textContent = `Thank you${first ? ", " + first : ""}. Your inquiry is on its way.`;
      inquiry.hidden = true;
      done.hidden = false;
      done.focus();
      done.scrollIntoView({ block: "center" });
      let left = 8;
      const count = done.querySelector("[data-countdown]");
      const timer = setInterval(() => {
        left -= 1;
        count.textContent = left;
        if (left <= 0) { clearInterval(timer); location.href = inquiry.dataset.home; }
      }, 1000);
    } catch {
      error.textContent = "Sorry, your inquiry could not be sent. Please check your connection and try again.";
      error.hidden = false;
      button.disabled = false;
      button.textContent = "Send Inquiry";
    }
  });
}

// Course page: sections fade in as they come into view
const reveals = document.querySelectorAll(".reveal");
if (reveals.length && "IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: "0px 0px -8% 0px" });
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add("in"));
}

// Course page: "Read more" on the description, hidden when the text already fits
document.querySelectorAll("[data-more]").forEach((root) => {
  const text = root.querySelector("p");
  const btn = root.querySelector("button");
  if (text.scrollHeight <= text.clientHeight + 4) {
    root.classList.add("open");
    btn.hidden = true;
    return;
  }
  btn.addEventListener("click", () => {
    const open = root.classList.toggle("open");
    btn.setAttribute("aria-expanded", open);
    btn.querySelector("span").textContent = open ? "Show less" : "Read more";
  });
});

// Course page: expand or collapse every module at once
const expandAll = document.querySelector("[data-expand-all]");
if (expandAll) {
  const modules = [...document.querySelectorAll("details.module")];
  const sync = () => (expandAll.textContent = modules.every((m) => m.open) ? "Collapse all" : "Expand all");
  expandAll.addEventListener("click", () => {
    const open = !modules.every((m) => m.open);
    modules.forEach((m) => (m.open = open));
    sync();
  });
  modules.forEach((m) => m.addEventListener("toggle", sync));
  sync();
}

// Course page on small screens: a buy bar slides up once the card's buy button has scrolled away
const buyAnchor = document.querySelector("[data-buy-anchor]");
const buyBar = document.querySelector(".buy-bar");
if (buyAnchor && buyBar && "IntersectionObserver" in window) {
  new IntersectionObserver(([e]) => {
    const show = !e.isIntersecting && e.boundingClientRect.top < 0;
    buyBar.classList.toggle("show", show);
    buyBar.inert = !show;
  }).observe(buyAnchor);
}

// Course catalog: filter by audience and functional area as soon as a choice is made. The choices are kept in
// the address (?audience=...&area=...) so a filtered list can be shared or bookmarked.
const filterForm = document.querySelector("[data-filters]");
if (filterForm) {
  const cards = [...document.querySelectorAll(".course-card")];
  const selects = [...filterForm.querySelectorAll("select")];
  const reset = filterForm.querySelector('[type="reset"]');
  const count = filterForm.querySelector("[data-count]");
  const empty = document.querySelector("[data-empty]");
  const apply = () => {
    const chosen = Object.fromEntries(selects.map((s) => [s.name, s.value]));
    let shown = 0;
    cards.forEach((card) => {
      const match = selects.every((s) => !s.value || card.dataset[s.name].split("|").includes(s.value));
      card.hidden = !match;
      if (match) shown++;
    });
    selects.forEach((s) => s.classList.toggle("set", !!s.value));
    reset.hidden = selects.every((s) => !s.value);
    count.textContent = shown;
    count.parentElement.lastChild.textContent = shown === 1 ? " course" : " courses";
    empty.hidden = shown > 0;
    const url = new URL(location.href);
    Object.entries(chosen).forEach(([k, v]) => (v ? url.searchParams.set(k, v) : url.searchParams.delete(k)));
    history.replaceState(null, "", url);
  };
  const params = new URLSearchParams(location.search);
  selects.forEach((s) => {
    if ([...s.options].some((o) => o.value === params.get(s.name))) s.value = params.get(s.name);
  });
  filterForm.addEventListener("change", apply);
  filterForm.addEventListener("reset", () => setTimeout(apply));
  document.querySelector("[data-clear]")?.addEventListener("click", () => filterForm.reset());
  apply();
}
