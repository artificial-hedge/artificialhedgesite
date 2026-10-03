import { initVisuals } from './visuals.js';
import { initPages } from './pages.js';
import { initTree } from './tree.js';

const toggle = document.querySelector('.ah-menu-toggle');
const menu = document.querySelector('#mobile-menu');
function closeMenu() {
  if (!menu || !toggle) return;
  menu.hidden = true;
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'open navigation');
}
toggle?.addEventListener('click', () => {
  const expanded = toggle.getAttribute('aria-expanded') === 'true';
  menu.hidden = expanded;
  toggle.setAttribute('aria-expanded', String(!expanded));
  toggle.setAttribute('aria-label', expanded ? 'open navigation' : 'close navigation');
});
menu?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  if (toggle?.getAttribute('aria-expanded') === 'true') { closeMenu(); toggle.focus(); }
  document.querySelectorAll('.ah-nav-dropdown button').forEach(button => {
    button.setAttribute('aria-expanded', 'false');
    document.getElementById(button.getAttribute('aria-controls')).hidden = true;
  });
});
document.querySelectorAll('.ah-nav-dropdown button').forEach(button => {
  const target = document.getElementById(button.getAttribute('aria-controls'));
  button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!expanded)); target.hidden = expanded;
  });
  document.addEventListener('click', event => {
    if (!button.parentElement.contains(event.target)) { button.setAttribute('aria-expanded', 'false'); target.hidden = true; }
  });
});

const tabs = [...document.querySelectorAll('[data-application]')];
function selectApplication(tab, focus = false) {
  tabs.forEach(button => {
    const selected = button === tab;
    button.setAttribute('aria-selected', String(selected));
    button.tabIndex = selected ? 0 : -1;
    document.getElementById(button.getAttribute('aria-controls')).hidden = !selected;
  });
  if (focus) tab.focus();
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectApplication(tab));
  tab.addEventListener('keydown', event => {
    let target;
    if (['ArrowDown','ArrowRight'].includes(event.key)) target = (index + 1) % tabs.length;
    if (['ArrowUp','ArrowLeft'].includes(event.key)) target = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') target = 0;
    if (event.key === 'End') target = tabs.length - 1;
    if (target !== undefined) { event.preventDefault(); selectApplication(tabs[target], true); }
  });
});

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
if (!reduceMotion.matches && 'IntersectionObserver' in window) {
  const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('ah-visible'); reveal.unobserve(entry.target); }
  }), {threshold: .07});
  document.querySelectorAll('.ah-section-heading, .ah-thesis-intro, .ah-capability, .fxv-heading').forEach(el => {el.classList.add('ah-reveal'); reveal.observe(el);});
}
initVisuals();
initPages();
initTree();
