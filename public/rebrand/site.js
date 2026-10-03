import { company, hero, sections, applications, capabilities, faqs, models } from './content.js';
import { renderArchitecture, renderBenchmarks } from './visuals.js';
import { renderPage } from './pages.js';

export const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const e = escapeHTML;
const arrow = '<span aria-hidden="true">↗</span>';
const link = (href, text, extra = '') => `<a href="${e(href)}" class="ah-button ${extra}">${e(text)} ${arrow}</a>`;
const sectionHeading = (number, label, title, description = '') => `<div class="ah-section-heading"><span class="ah-kicker">// ${e(number)} — ${e(label)} //</span><h2>${e(title)}</h2>${description ? `<p>${e(description)}</p>` : ''}</div>`;

export function renderHeader(path = '/') {
  const home = path === '/';
  return `<a class="ah-skip" href="#main">skip to content</a>
  <div class="ah-announcement">introducing fx-1 & fx-1 lite. <a href="/#benchmarks">explore the evaluations ${arrow}</a></div>
  <header class="ah-header">
    <a class="ah-brand" aria-label="artificial hedge home" href="/">artificial hedge<span class="ah-brand-dot">.</span></a>
    <nav class="ah-nav" aria-label="main navigation">
      <a href="${home ? '#architecture' : '/#architecture'}">architecture</a>
      <a href="${home ? '#benchmarks' : '/#benchmarks'}">benchmarks</a>
      <a href="/pricing" ${path === '/pricing' ? 'aria-current="page"' : ''}>pricing</a>
      <a href="/use-cases" ${path.startsWith('/use-cases') ? 'aria-current="page"' : ''}>applications</a>
      <div class="ah-nav-dropdown"><button type="button" aria-expanded="false" aria-controls="resource-menu">resources <span aria-hidden="true">⌄</span></button><div id="resource-menu" class="ah-resource-menu" hidden><a href="/models">fx-1 & fx-1 lite</a><a href="/pricing#api-pricing">API pricing</a><a href="/research">research & evaluation</a><a href="/docs">documentation</a><a href="/#faq">questions</a></div></div>
    </nav>
    <a class="ah-header-cta" href="/contact">talk to us ${arrow}</a>
    <button class="ah-menu-toggle" aria-label="open navigation" aria-expanded="false" aria-controls="mobile-menu"><span></span><span></span></button>
    <nav class="ah-mobile-menu" id="mobile-menu" aria-label="mobile navigation" hidden><a href="/models">fx-1 & fx-1 lite</a><a href="/#architecture">architecture</a><a href="/#benchmarks">benchmarks</a><a href="/use-cases">applications</a><a href="/research">research</a><a href="/pricing">model subscriptions & API pricing</a><a href="/contact">talk to us ${arrow}</a></nav>
  </header>`;
}

function applicationPanel(item, index) {
  return `<div class="ah-application-panel" id="application-${e(item.id)}" role="tabpanel" aria-labelledby="tab-${e(item.id)}" ${index ? 'hidden' : ''}>
    <div class="ah-application-copy"><span class="ah-kicker">fx-1 / ${e(item.label)}</span><h3>${e(item.title)}</h3><p>${e(item.description)}</p><ul>${item.bullets.map(text => `<li>${e(text)}</li>`).join('')}</ul><a class="ah-text-link" href="/use-cases/${e(item.id)}">explore the application ${arrow}</a></div>
    <div class="ah-task-flow" aria-label="${e(item.label)} workflow"><div class="ah-flow-label">illustrative workflow</div><div class="ah-flow-step"><span>01</span><div>source material<small>documents · financial data · task context</small></div></div><div class="ah-flow-connector" aria-hidden="true">↓</div><div class="ah-flow-step ah-flow-model"><span>02</span><div>fx-1<small>financial reasoning & quantitative analysis</small></div></div><div class="ah-flow-connector" aria-hidden="true">↓</div><div class="ah-flow-step"><span>03</span><div>${e(item.output)}<small>assumptions · evidence · review</small></div></div><div class="ah-flow-footer">${e(item.number)} / ${e(item.label)}</div></div>
  </div>`;
}

export function renderHome() {
  return `<section class="ah-hero" id="hero">
    <div class="ah-hero-tree" id="ah-tree" aria-hidden="true"></div>
    <div class="ah-hero-content"><a class="ah-hero-eyebrow" href="#models">introducing fx-1 & fx-1 lite — explore the models ${arrow}</a><h1>frontier intelligence<br>for finance.</h1><p class="ah-hero-description">${e(hero.description)}</p><p class="ah-hero-support">${e(hero.supportingText)}</p><div class="ah-actions">${link('/contact', 'talk to us', 'ah-button-light')}${link('#models', 'explore the models', 'ah-button-orange')}</div></div>
    <div class="ah-hero-caption"><span>artificial hedge / fx series</span><span>frontier financial language models</span></div>
  </section>
  <section class="ah-evaluation-strip" aria-label="featured fx-1 reported results"><p>financial intelligence. measured across the work.</p><div class="ah-stat-row"><a href="#benchmarks"><strong>63.5</strong><span>Finance Agent v2</span></a><a href="#benchmarks"><strong>100</strong><span>FinanceBench</span></a><a href="#benchmarks"><strong>98</strong><span>OmniDoc Bench</span></a><a href="#benchmarks"><strong>1,732 <small>Elo</small></strong><span>GDPval-AA v2</span></a></div><span class="ah-score-note">fx-1 · reported evaluation results</span></section>
  ${renderModelFamily()}
  <section class="ah-section ah-applications" id="applications">${sectionHeading('01', 'applications', sections.applications.title, sections.applications.description)}<div class="ah-application-layout"><div class="ah-application-tabs" role="tablist" aria-label="financial applications" aria-orientation="vertical">${applications.map((item,i)=>`<button id="tab-${e(item.id)}" role="tab" aria-selected="${!i}" aria-controls="application-${e(item.id)}" tabindex="${i ? -1 : 0}" data-application="${e(item.id)}"><span>${e(item.number)}</span>${e(item.label)}<span class="ah-tab-arrow" aria-hidden="true">↗</span></button>`).join('')}</div><div class="ah-application-panels">${applications.map(applicationPanel).join('')}</div></div></section>
  <section class="ah-thesis" id="why-artificial-hedge"><div class="ah-thesis-intro"><span class="ah-kicker">// 02 — financial reasoning //</span><h2>finance requires<br>more than an answer.</h2><p>the numbers, the assumptions and the evidence all matter. we build models around the work that connects them.</p></div><div class="ah-thesis-grid"><div><span class="ah-thesis-number">01</span><h3>understand the evidence.</h3><p>disclosures, financial statements, tables and footnotes. keep the question connected to its sources.</p></div><div><span class="ah-thesis-number">02</span><h3>reason through the numbers.</h3><p>work with the relationships between figures, the units behind them and the assumptions that shape a conclusion.</p></div><div><span class="ah-thesis-number">03</span><h3>complete the workflow.</h3><p>connect research and quantitative tools with a defined task, a clear output and the right review points.</p></div></div></section>
  <section class="ah-section ah-capabilities" id="features">${sectionHeading('03', sections.capabilities.eyebrow, sections.capabilities.title)}<div class="ah-capability-grid">${capabilities.map((item,i)=>`<article class="ah-capability"><div class="ah-capability-top"><span>${e(item.number)}</span><span>fx-1</span></div><h3>${e(item.title)}</h3><p>${e(item.description)}</p>${capabilityFigure(i)}<div class="ah-capability-focus"><span>${e(item.label)}</span><p>${e(item.focus)}</p></div></article>`).join('')}</div></section>
  ${renderArchitecture()}
  ${renderBenchmarks()}
  <section class="ah-dipcatcher" id="pricing"><div><span class="ah-kicker">// model subscriptions / research preview //</span><h2>intelligence,<br>put to work.</h2><p>subscribe to fx-1 and fx-1 lite usage, with API token rates listed separately. dipcatcher is under development and will release soon. when available, it will be bundled free with subscriptions until the research preview ends on december 12, 2026.</p>${link('/pricing','view subscriptions & API pricing','ah-button-light')}</div><div class="ah-harness-ledger"><div><span>models</span><strong>fx-1 / fx-1 lite</strong></div><div><span>dipcatcher</span><strong>under development</strong></div><div><span>release</span><strong>coming soon / waitlist</strong></div><div><span>pricing</span><strong>model subscriptions</strong></div><a href="/contact?interest=dipcatcher">join the dipcatcher waitlist ${arrow}</a><small>model subscriptions from $20* / month · * subject to change</small></div></section>
  <section class="ah-section ah-faq" id="faq">${sectionHeading('06','questions','frequently asked questions.')}<div class="ah-faq-list">${faqs.map((item,i)=>`<details ${i===0?'open':''}><summary><span>${String(i+1).padStart(2,'0')}</span>${e(item.question)}<span class="ah-faq-plus" aria-hidden="true">+</span></summary><p>${e(item.answer)}</p></details>`).join('')}</div></section>`;
}

function renderModelFamily() {
  return `<section class="ah-section ah-model-family" id="models">${sectionHeading('models','fx series','finance and mathematics. frontier and economy.','two models built for finance and demanding mathematical work.')}<div class="ah-model-family-grid">${models.map(model => `<article><div class="ah-model-family-top"><span>${e(model.id === 'fx-1' ? 'frontier / State-of-the-Art' : 'economy / optimised')}</span><span>research preview</span></div><h3>${e(model.name)}</h3><p>${e(model.description)}</p><dl><div><dt>total parameters</dt><dd>${e(model.totalParameters)}</dd></div><div><dt>active per token</dt><dd>${e(model.activeParametersPerToken)}</dd></div></dl><div class="ah-model-api-summary"><span>API / 1M tokens</span><div><strong>$${e(model.inputPrice)}</strong> input <span>/</span> <strong>$${e(model.outputPrice)}</strong> output</div></div><a class="ah-text-link" href="/models${model.id === 'fx-1-lite' ? '#fx-1-lite' : '#fx-1'}">explore ${e(model.name)} ${arrow}</a></article>`).join('')}</div><div class="ah-model-family-footer"><span>dipcatcher is under development and releasing soon.</span><a href="/contact?interest=dipcatcher">join the dipcatcher waitlist ${arrow}</a></div></section>`;
}

function capabilityFigure(index) {
  const figures = [
    `<div class="ah-capability-figure"><div class="ah-evidence-tag">financial question</div><div class="ah-simple-arrow" aria-hidden="true">↓</div><div class="ah-evidence-tags"><span>context</span><span>assumptions</span><span>evidence</span></div><div class="ah-simple-arrow" aria-hidden="true">↓</div><div class="ah-evidence-tag ah-evidence-output">reasoned analysis</div></div>`,
    `<div class="ah-capability-figure ah-quant-figure"><div><span>01 / inputs</span><strong>figures + units</strong></div><div><span>02 / method</span><strong>calculations + checks</strong></div><div><span>03 / output</span><strong>interpretation</strong></div></div>`,
    `<div class="ah-capability-figure ah-document-figure"><div><span>01</span>reported figures</div><div><span>02</span>tables & footnotes</div><div><span>03</span>source context</div><div class="ah-document-output">document → evidence → analysis</div></div>`,
    `<div class="ah-capability-figure"><div class="ah-workflow-track"><span>task</span><i aria-hidden="true">→</i><span>tools</span><i aria-hidden="true">→</i><span>review</span></div><div class="ah-workflow-control"><span>workflow boundaries</span><strong>permissions · evidence · handoff</strong></div></div>`,
  ];
  return figures[index];
}

export function renderFooter() {
  return `<footer class="ah-footer"><div class="ah-footer-primary"><div><a class="ah-brand" href="/">artificial hedge<span class="ah-brand-dot">.</span></a><h2>build with frontier<br>financial intelligence.</h2>${link('/contact','talk to us','ah-button-orange')}</div><div class="ah-footer-links"><div><h3>company</h3><a href="/models#fx-1">fx-1</a><a href="/models#fx-1-lite">fx-1 lite</a><a href="/research">research</a><a href="/use-cases">applications</a><a href="/contact">contact</a></div><div><h3>explore</h3><a href="/#architecture">architecture</a><a href="/#benchmarks">benchmarks</a><a href="/pricing">model subscriptions</a><a href="/pricing#api-pricing">API pricing</a><a href="/#faq">questions</a></div></div></div><div class="ah-footer-bottom"><span>© ${new Date().getFullYear()} artificial hedge</span><span>frontier financial models</span><div><a href="/privacy-policy">privacy</a><a href="/terms-and-conditions">terms</a></div></div></footer>`;
}

export function renderSite(path = '/') {
  const body = path === '/' ? renderHome() : renderPage(path);
  return `${renderHeader(path)}<main id="main">${body}</main>${renderFooter()}`;
}
