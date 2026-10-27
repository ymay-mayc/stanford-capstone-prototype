import { useEffect, useId, useRef, useState } from "react";
import { useAgenda } from "../agenda/AgendaContext";

type MenuId = "event" | "explore" | "info" | null;

const eventItems = [
  { id: "overview", label: "Overview" },
  { id: "agenda", label: "My Agenda" },
];

const exploreItems = [
  { id: "in-person", label: "In-Person Activities" },
  { id: "online", label: "Online Activities" },
];

const infoItems = [
  { id: "speakers", label: "Speakers" },
  { id: "sponsors", label: "Sponsors" },
  { id: "schedule", label: "Event Schedule" },
  { id: "dreamforce-101", label: "Dreamforce 101" },
  { id: "faq", label: "FAQ" },
];

export function EventNav() {
  const { openAgenda, openActivities, openInfo } = useAgenda();
  const [openMenu, setOpenMenu] = useState<MenuId>(null);
  const navRef = useRef<HTMLElement>(null);
  const menuId = useId();

  useEffect(() => {
    function onPointer(event: MouseEvent) {
      if (!navRef.current?.contains(event.target as Node)) setOpenMenu(null);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenMenu(null);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  function choose(id: string) {
    setOpenMenu(null);
    if (id === "agenda") {
      openAgenda();
      return;
    }
    if (id === "in-person") {
      openActivities();
      return;
    }
    openInfo(id);
  }

  return (
    <header className="nav" ref={navRef} data-theme="day">
      <div className="nav__inner">
        <button type="button" className="nav__brand" onClick={() => choose("overview")}>
          <img
            className="nav__brand-mark"
            src="https://sfdc-ui-documentation-667d4c5e8394.herokuapp.com/dms-design-tokens/images/salesforce-logo-bug.svg"
            alt=""
            width={36}
            height={25}
          />
          <span className="nav__brand-name">Dreamforce</span>
        </button>
        <nav className="nav__links" aria-label="Event">
          <button type="button" className="nav__link" onClick={() => choose("overview")}>
            Home
          </button>
          <Menu
            label="My Event"
            menuId={`${menuId}-event`}
            open={openMenu === "event"}
            onOpen={() => setOpenMenu("event")}
            onClose={() => setOpenMenu((current) => (current === "event" ? null : current))}
            items={eventItems}
            onChoose={choose}
          />
          <Menu
            label="Explore"
            menuId={`${menuId}-explore`}
            open={openMenu === "explore"}
            onOpen={() => setOpenMenu("explore")}
            onClose={() => setOpenMenu((current) => (current === "explore" ? null : current))}
            items={exploreItems}
            onChoose={choose}
          />
          <Menu
            label="Event info"
            menuId={`${menuId}-info`}
            open={openMenu === "info"}
            onOpen={() => setOpenMenu("info")}
            onClose={() => setOpenMenu((current) => (current === "info" ? null : current))}
            items={infoItems}
            onChoose={choose}
          />
        </nav>
        <div className="nav__actions">
          <button type="button" className="sf-cta sf-cta--medium sf-cta--secondary nav__logout">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

function Menu({
  label,
  menuId,
  open,
  onOpen,
  onClose,
  items,
  onChoose,
}: {
  label: string;
  menuId: string;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  items: { id: string; label: string }[];
  onChoose: (id: string) => void;
}) {
  return (
    <div
      className="nav__menu"
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
      onFocus={onOpen}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) onClose();
      }}
    >
      <button
        type="button"
        className="nav__link"
        aria-expanded={open}
        aria-controls={menuId}
      >
        {label}
        <i className="icon icon--chevrondown icon--xs" aria-hidden="true" />
      </button>
      {open ? (
        <div className="nav__popover" id={menuId} role="menu">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              className="nav__item"
              onClick={() => onChoose(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

const footerAsset =
  "https://sfdc-ui-documentation-667d4c5e8394.herokuapp.com/dms-design-tokens/images";

const footerColumns = [
  {
    title: "New to Salesforce?",
    links: [
      "What is CRM?",
      "Digital Marketing",
      "Customer Service Software",
      "Email Marketing",
      "Ecommerce",
      "Artificial Intelligence",
      "Revenue Management Solutions",
      "AI Agents",
      "SaaS",
    ],
  },
  {
    title: "About Salesforce",
    links: [
      "What is Salesforce?",
      "Newsroom",
      "Customer Success",
      "Blog",
      "Careers",
      "Trust",
      "Sustainability",
      "Investors",
      "Give us your Feedback",
    ],
  },
  {
    title: "Popular Links",
    links: [
      "Salesforce Login",
      "New Release Features",
      "Find or Become a Partner",
      "Dreamforce",
      "Pricing",
      "CRM Software",
      "All Cloud Products",
      "Product Pricing",
      "Newsletter Sign-up",
    ],
  },
];

const social = [
  ["facebook.svg", "Facebook"],
  ["twitter.svg", "X (Twitter)"],
  ["linkedin.svg", "LinkedIn"],
  ["instagram.svg", "Instagram"],
  ["youtube.svg", "YouTube"],
  ["tik-tok.svg", "TikTok"],
];

const legal = [
  "Legal",
  "Terms of Service",
  "Privacy Information",
  "Responsible Disclosure",
  "Trust",
  "Contact",
  "Cookie Preferences",
  "Your Privacy Choices",
];

export function EventFooter() {
  return (
    <footer
      className="sf-footer"
      data-theme="day"
      role="contentinfo"
      onClick={(event) => {
        if ((event.target as HTMLElement).closest("a")) event.preventDefault();
      }}
    >
      <div className="sf-footer__links">
        <div className="sf-footer__brand">
          <img
            className="sf-footer__logo"
            src={`${footerAsset}/salesforce-logo.svg`}
            alt="Salesforce"
            width={92}
            height={65}
          />
          <div className="sf-footer__social">
            {social.map(([file, label]) => (
              <a key={file} href="#" aria-label={label}>
                <img
                  src={`${footerAsset}/footer-social/${file}`}
                  alt={label}
                  width={32}
                  height={32}
                />
              </a>
            ))}
          </div>
          <p className="sf-footer__phone">Call us at 1-800-664-9073</p>
          <a href="#" className="sf-footer__contact-link">
            See all ways to contact us
          </a>
        </div>
        <div className="sf-footer__columns">
          {footerColumns.map((column) => (
            <div key={column.title} className="sf-footer__column">
              <h3>{column.title}</h3>
              <ul>
                {column.links.map((label) => (
                  <li key={label}>
                    <a href="#">{label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="sf-footer__bottom">
        <div className="sf-footer__bottom-inner">
          <button type="button" className="sf-footer__region">
            <i className="icon icon--globe" aria-hidden="true" />
            Worldwide <span aria-hidden="true">&#9662;</span>
          </button>
          <div className="sf-footer__legal">
            <div className="sf-footer__legal-links">
              {legal.map((label) => (
                <a key={label} href="#">
                  {label}
                </a>
              ))}
            </div>
            <p className="sf-footer__copyright">
              © Copyright 2024 Salesforce, Inc. <a href="#">All rights reserved</a>. Various
              trademarks held by their respective owners. Salesforce, Inc. Salesforce Tower, 415
              Mission Street, 3rd Floor, San Francisco, CA 94105, United States
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
