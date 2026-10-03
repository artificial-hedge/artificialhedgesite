import { applications, capabilities, models } from './content.js';

const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const link = (href, label, secondary = false) => `<a class="ah-page-action${secondary ? ' is-secondary' : ''}" href="${escape(href)}">${escape(label)}<span aria-hidden="true">↗</span></a>`;
const label = text => `<p class="ah-page-label">${text}</p>`;
const hero = (eyebrow, title, description, action = '') => `<section class="ah-page-hero"><div>${label(eyebrow)}<h1>${title}</h1><p class="ah-page-lead">${description}</p>${action ? `<div class="ah-page-actions">${action}</div>` : ''}</div><span class="ah-page-hero-index" aria-hidden="true">[ah]</span></section>`;
const callout = (title, copy, href = '/contact', action = 'start a conversation') => `<section class="ah-page-callout"><div>${label('the next step')}<h2>${title}</h2><p>${copy}</p></div>${link(href, action)}</section>`;
const wrap = body => `<div class="ah-page">${body}</div>`;

const workflowInputs = {
  'financial-research': 'company disclosures, earnings materials, and a defined research question',
  banking: 'financial profiles, obligations, and stated assumptions',
  'corporate-finance': 'operating plans, funding constraints, and financial figures',
  'document-intelligence': 'source documents, tables, footnotes, and reporting context',
  'autonomous-workflows': 'a defined task, permitted tools, and review requirements',
};
const useCases = applications.map(item => ({
  slug: item.id,
  number: item.number,
  title: item.label,
  text: item.description,
  input: workflowInputs[item.id],
  output: item.output,
  question: item.title,
  focus: item.bullets.join('; '),
}));

const modelProfileCopy = {
  'fx-1': { heading: 'frontier capability.<br>financial depth.', description: 'a State-of-the-Art frontier model for finance and math-heavy workflows. built for financial reasoning, quantitative work, and complex analytical questions.', focus: 'State-of-the-Art frontier finance and math-heavy tasks' },
  'fx-1-lite': { heading: 'high capability.<br>economic efficiency.', description: 'an economy-optimised model for finance and math-heavy workflows. high-capability financial and quantitative reasoning with a lower active parameter footprint.', focus: 'economy-optimised finance and math-heavy tasks' },
};
const modelProfiles = models.map(model => ({
  ...model,
  ...modelProfileCopy[model.id],
  total: model.totalParameters,
  active: model.activeParametersPerToken,
  input: model.inputPrice,
  output: model.outputPrice,
}));
const previewDeadline = 'december 12, 2026';
const dipcatcherBundle = `when available, dipcatcher will be bundled free with model subscriptions until the research preview ends on ${previewDeadline}.`;
const readableEnquiryValue = value => ({ 'warp-plus': 'warp+', 'frontier-economy': 'frontier economy', 'frontier-extended': 'frontier extended', 'fx-1-lite': 'fx-1 lite', 'fx-1-and-fx-1-lite': 'fx-1 + fx-1 lite', 'model-access': 'model subscription', 'model-subscription': 'model subscription', dipcatcher: 'dipcatcher waitlist / in development' }[value] || value);
const plans = [
  { id: 'economy', name: 'economy', price: '20', access: 'fx-1 lite / core access', models: 'fx-1 lite', copy: 'focused financial research and math-heavy workflows with economy-optimised model access.', usage: 'economy model usage subscription' },
  { id: 'extended', name: 'extended', price: '50', access: 'fx-1 lite / expanded access', models: 'fx-1 lite', copy: 'more room for sustained financial research and quantitative work with fx-1 lite.', usage: 'extended model usage subscription' },
  { id: 'frontier-economy', name: 'frontier economy', price: '100', access: 'fx-1 / frontier access', models: 'fx-1', copy: 'State-of-the-Art frontier financial intelligence with an economy usage tier.', usage: 'frontier economy model usage subscription' },
  { id: 'frontier-extended', name: 'frontier extended', price: '500', access: 'fx-1 / higher frontier access', models: 'fx-1', copy: 'higher access for intensive frontier finance and math-heavy workflows.', usage: 'frontier extended model usage subscription' },
  { id: 'warp-plus', name: 'warp+', price: '1,000', access: 'both models / highest limits', models: 'fx-1 + fx-1 lite', copy: 'both models with the highest access limits, plus planned industry grade compliance tooling and data.', usage: 'highest model usage limits' },
];

function apiRatesTable() {
  return `<div class="ah-api-table-wrap"><table class="ah-api-table"><caption>usd per 1 million tokens</caption><thead><tr><th scope="col">model</th><th scope="col">input</th><th scope="col">output</th></tr></thead><tbody>${modelProfiles.map(model => `<tr><th scope="row">${model.name}</th><td>$${model.input}</td><td>$${model.output}</td></tr>`).join('')}</tbody></table></div>`;
}

function modelsPage() {
  return wrap(hero('models / financial intelligence', 'fx-1.<br>fx-1 lite.', 'two models for finance and math-heavy work. State-of-the-Art frontier capability and economy-optimised financial intelligence.', link('/pricing', 'subscriptions & API pricing') + link('/research', 'research notes', true)) + `
    ${modelProfiles.map(model => `<section class="ah-model-profile ah-page-section" id="${model.id}"><div class="ah-profile-name"><span class="ah-page-label">model overview</span><h2>${model.name}</h2><span class="ah-status">research preview</span></div><div class="ah-profile-content"><h3>${model.heading}</h3><p>${model.description}</p><dl class="ah-profile-ledger"><div><dt>total parameters</dt><dd>${model.total}</dd></div><div><dt>active parameters per token</dt><dd>${model.active}</dd></div><div><dt>focus</dt><dd>${model.focus}</dd></div><div><dt>access</dt><dd>model usage subscriptions; research preview by enquiry</dd></div></dl><div class="ah-page-actions">${link('/contact?interest=' + model.id, 'request ' + model.name + ' access', true)}</div></div></section>`).join('')}
    <section class="ah-page-section">${label('compare / model facts')}<div class="ah-page-section-heading"><h2>the model.<br>the footprint.</h2><p>choose the frontier model or the economy-optimised model for your financial workflow.</p></div><div class="ah-api-table-wrap"><table class="ah-api-table ah-model-compare"><caption>model specifications</caption><thead><tr><th scope="col">specification</th><th scope="col">fx-1</th><th scope="col">fx-1 lite</th></tr></thead><tbody><tr><th scope="row">total parameters</th><td>3.4T</td><td>2.4T</td></tr><tr><th scope="row">active parameters / token</th><td>~128B</td><td>~49B</td></tr><tr><th scope="row">model focus</th><td>State-of-the-Art frontier finance & math</td><td>economy-optimised finance & math</td></tr></tbody></table></div><p class="ah-model-benchmark-note">the reported evaluation scores on this website apply to fx-1. no fx-1 lite benchmark scores are presented.</p></section>
    <section class="ah-page-section">${label('areas of application')}<div class="ah-page-section-heading"><h2>reason about<br>what matters.</h2><p>financial research, quantitative work, and the workflows that connect them.</p></div><div class="ah-usecase-list">${useCases.map(item => `<a href="/use-cases/${item.slug}"><span class="ah-item-number">${item.number}</span><h3>${item.title}</h3><p>${item.text}</p><span class="ah-list-arrow" aria-hidden="true">↗</span></a>`).join('')}</div></section>
    ${callout('put your question<br>in front of us.', 'discuss a model subscription, research collaboration, or integration requirement.', '/contact?interest=model-access', 'discuss a model subscription')}`);
}

function researchPage() {
  return wrap(hero('research / evaluation', 'the work behind<br>the model.', 'financial reasoning, quantitative work, and evidence-led analysis. explore the capabilities guiding fx-1 and the reported evaluation results.', link('/#benchmarks', 'see all 23 evaluations')) + `
    <section class="ah-page-section ah-research-intro"><div>${label('fx-1 / reported results')}<h2>results with<br>context.</h2></div><div><p>read the reported fx-1 results alongside the task, dataset, and model version.</p><p>evaluation configurations and methodology will accompany our technical release.</p><a class="ah-inline-link" href="/#benchmarks">see all 23 evaluation rows <span aria-hidden="true">↗</span></a></div></section>
    <section class="ah-page-section">${label('evaluation focus')}<div class="ah-page-section-heading"><h2>financial work.<br>measured by the task.</h2><p>the capabilities we are developing and evaluating for fx-1.</p></div><div class="ah-protocol-list">${capabilities.map(item => `<article><span class="ah-item-number">${item.number}</span><h3>${item.title}</h3><p>${item.description}</p></article>`).join('')}</div></section>
    ${callout('research is a<br>shared discipline.', 'we welcome technical questions, evaluation feedback, and research collaboration.', '/contact?interest=research', 'connect on research')}`);
}

function contactPage(url) {
  const interest = url.searchParams.get('interest') || '';
  const plan = url.searchParams.get('plan') || '';
  const selectedModel = plans.find(item => item.id === plan)?.models || url.searchParams.get('model') || modelProfiles.find(item => item.id === interest)?.name || '';
  const context = [...new Set([interest, selectedModel, plan].filter(Boolean).map(readableEnquiryValue))].join(' / ');
  return wrap(hero('contact / artificial hedge', 'let’s advance<br>the research.', 'tell us what you are working on. model subscriptions, financial research, and integration questions are welcome.') + `
    <section class="ah-contact-grid ah-page-section"><div>${label('01 / enquiry')}<h2>start with<br>your question.</h2><p>send your enquiry to <a href="mailto:advaith@artificialhedge.co">advaith@artificialhedge.co</a>.</p><div class="ah-contact-topics"><span>model subscriptions</span><span>research collaboration</span><span>integration</span><span>dipcatcher waitlist</span></div><p class="ah-contact-product-note">dipcatcher is under development and will release soon. join the waitlist now.</p></div><form class="ah-contact-form" data-ah-contact-form action="https://formsubmit.co/advaith@artificialhedge.co" method="POST"><input type="hidden" name="_subject" value="artificial hedge — website enquiry"><input type="hidden" name="_template" value="table"><input type="text" name="_honey" style="display:none" aria-hidden="true" tabindex="-1" autocomplete="off"><input type="hidden" name="interest" value="${escape(interest)}"><input type="hidden" name="model" value="${escape(selectedModel)}"><input type="hidden" name="plan" value="${escape(plan)}"><p class="ah-contact-context" data-ah-contact-context${context ? '' : ' hidden'}><span>your enquiry</span><span data-ah-contact-context-value>${escape(context)}</span></p><div class="ah-field-pair"><label>name<input name="name" type="text" autocomplete="name" placeholder="your name" required></label><label>work email<input name="email" type="email" autocomplete="email" placeholder="you@company.com" required></label></div><label>organisation <span class="ah-optional">optional</span><input name="organisation" type="text" autocomplete="organization" placeholder="your organisation"></label><label>what would you like to discuss?<textarea name="message" rows="5" placeholder="share your research question, subscription request, or integration requirements…" required></textarea></label><button type="submit" class="ah-page-action">send enquiry<span aria-hidden="true">↗</span></button><p class="ah-form-note">your details are used to respond to your enquiry. <a href="/privacy-policy">privacy policy</a>.</p><div class="ah-form-result" data-ah-contact-status role="status" aria-live="polite" hidden></div></form></section>`);
}

function pricingPage() {
  return wrap(hero('pricing / research preview', 'model subscriptions<br>&amp; API pricing', 'monthly model usage subscriptions for fx-1 and fx-1 lite. API token rates are listed separately.', `${link('#tiers', 'explore subscriptions')}${link('#api-pricing', 'API token rates', true)}`) + `
    <aside class="ah-preview-banner" id="dipcatcher" aria-label="dipcatcher development and waitlist"><span class="ah-page-label">dipcatcher / coming soon</span><p><strong>under development.<br>releasing soon.</strong><span>${dipcatcherBundle}</span></p><div class="ah-preview-banner-side">${link('/contact?interest=dipcatcher', 'join dipcatcher waitlist', true)}<p class="ah-preview-banner-note">join the waitlist now. model subscriptions and API token usage retain their own pricing.</p></div></aside>
    <section class="ah-page-section ah-usage-section"><div>${label('subscriptions + API')}<h2>usage</h2><p>monthly model subscriptions and separate API token rates.</p></div><div class="ah-usage-ledger"><article><span class="ah-item-number">01 / subscriptions</span><h3>choose a usage tier.</h3><p>five monthly subscriptions for financial research and math-heavy workflows. each tier identifies the available model and level of usage.</p></article><article><span class="ah-item-number">02 / API</span><h3>input and output tokens.</h3><p>API usage is priced per 1 million tokens. the rates below are separate from monthly subscription prices; included usage and top-up details will be announced.</p></article></div></section>
    <section class="ah-page-section ah-tiers-section" id="tiers"><div class="ah-tiers-heading"><h2>tiers</h2><p>monthly model usage subscriptions, from economy-optimised research to frontier workflows.</p></div><p class="ah-tier-period">usd / per month</p><div class="ah-tier-list">${plans.map((plan, index) => `<article class="ah-tier${plan.id === 'warp-plus' ? ' is-warp' : ''}"><details><summary><span class="ah-item-number">0${index + 1}</span><span class="ah-tier-name"><strong>${plan.name}</strong><small>${plan.access}</small></span><span class="ah-tier-price">$${plan.price}<sup>*</sup><small>per month</small></span><span class="ah-tier-plus" aria-hidden="true">+</span></summary><div class="ah-tier-details"><p>${plan.copy}</p><dl><div><dt>model</dt><dd>${plan.models}</dd></div><div><dt>subscription</dt><dd>${plan.usage}</dd></div><div><dt>dipcatcher</dt><dd>under development / coming soon</dd></div><div><dt>availability</dt><dd>research preview / waitlist only</dd></div></dl><p class="ah-tier-limit-note">${dipcatcherBundle}</p><p class="ah-tier-limit-note">exact allowances, included usage, and top-up details will be confirmed before launch.</p></div></details><a class="ah-tier-waitlist" href="/contact?interest=model-subscription&amp;model=${encodeURIComponent(plan.models)}&amp;plan=${plan.id}">join waitlist<span aria-hidden="true">↗</span></a></article>`).join('')}</div><div class="ah-pricing-notes"><p>* subject to change. all monthly prices shown are proposed model usage subscription prices in usd.</p><p>economy and extended include fx-1 lite. frontier economy and frontier extended include fx-1. warp+ includes both models with the highest usage limits.</p><p>included model usage and top-up details will be announced. ${dipcatcherBundle}</p><p>warp+ includes planned industry grade compliance tooling and data access. specific coverage and availability are to be confirmed; no certification is implied.</p></div></section>
    <section class="ah-page-section ah-api-pricing-section" id="api-pricing">${label('metered usage / API rates')}<div class="ah-page-section-heading"><h2>API pricing</h2><p>input and output token rates for fx-1 and fx-1 lite, in usd per 1 million tokens.</p></div>${apiRatesTable()}<p class="ah-api-pricing-note">monthly prices are for model usage subscriptions. these rates apply to API token usage; included usage and top-up details will be announced.</p></section>
    ${callout('the frontier<br>is moving.', 'register your preferred model and subscription tier for the research preview.', '/contact?interest=model-subscription', 'join the research preview')}`);
}

function useCasesPage(path) {
  const slug = path.split('/')[2];
  if (slug) {
    const selected = useCases.find(item => item.slug === slug);
    if (!selected) return notFoundPage();
    return wrap(hero(`use cases / ${selected.number}`, selected.title, selected.text, link('/contact?interest=' + selected.slug, 'discuss this workflow')) + `<section class="ah-page-section ah-usecase-question">${label('the workflow')}<h2>${selected.question}</h2></section><section class="ah-page-section"><div class="ah-usecase-flow"><article><span class="ah-item-number">01 / inputs</span><h3>start with context.</h3><p>${selected.input}.</p></article><span class="ah-flow-arrow" aria-hidden="true">→</span><article><span class="ah-item-number">02 / model work</span><h3>reason through it.</h3><p>${selected.focus}.</p></article><span class="ah-flow-arrow" aria-hidden="true">→</span><article><span class="ah-item-number">03 / intended output</span><h3>make it inspectable.</h3><p>${selected.output}.</p></article></div><p class="ah-usecase-status">an illustrative workflow and intended research direction. model behaviour, availability, and integration details remain subject to evaluation.</p></section>${callout('bring the context.<br>shape the question.', 'discuss how your workflow could inform the model research.', '/contact?interest=' + selected.slug, 'discuss a use case')}`);
  }
  return wrap(hero('use cases / financial models', 'from information<br>to understanding.', 'the financial workflows guiding fx-1: research, banking, corporate finance, document intelligence, and autonomous workflows.') + `<section class="ah-page-section"><div class="ah-usecase-list">${useCases.map(item => `<a href="/use-cases/${item.slug}"><span class="ah-item-number">${item.number}</span><h2>${item.title}</h2><p>${item.text}</p><span class="ah-list-arrow" aria-hidden="true">↗</span></a>`).join('')}</div><p class="ah-usecase-status">application areas are illustrative research directions; they are not promises of current model performance or production availability.</p></section>${callout('a question<br>worth exploring?', 'tell us about the financial or quantitative work you want to support.', '/contact?interest=use-case', 'discuss your workflow')}`);
}

function docsPage() {
  return wrap(hero('documentation / model guide', 'start with<br>the models.', 'an introduction to fx-1, fx-1 lite, model subscriptions, and API pricing.') + `<section class="ah-docs-layout ah-page-section"><nav aria-label="documentation sections"><a href="#overview">01 / models</a><a href="#preview-access">02 / subscriptions</a><a href="#api-rates">03 / API rates</a><a href="#evaluation">04 / evaluation</a><a href="#dipcatcher">05 / dipcatcher</a></nav><div><article id="overview">${label('01 / model overview')}<h2>fx-1 &amp; fx-1 lite</h2><p>fx-1 is our State-of-the-Art frontier model for finance and math-heavy tasks, with 3.4T total parameters and ~128B active parameters per token.</p><p>fx-1 lite is our economy-optimised, high-capability model for financial and math-heavy workflows, with 2.4T total parameters and ~49B active parameters per token.</p>${link('/models', 'compare the models', true)}</article><article id="preview-access">${label('02 / model usage subscriptions')}<h2>subscription tiers.</h2><p>economy and extended subscriptions include fx-1 lite. frontier economy and frontier extended include fx-1. warp+ includes both models with the highest usage limits.</p><p>monthly subscriptions and API token rates are separate. exact allowances, included usage, and top-up details will be confirmed.</p>${link('/pricing#tiers', 'monthly subscriptions', true)}</article><article id="api-rates">${label('03 / API token usage')}<h2>input. output.</h2>${apiRatesTable()}<p>these are API token rates, distinct from monthly model usage subscription prices. included usage and top-up details will be announced.</p>${link('/pricing#api-pricing', 'API pricing details', true)}</article><article id="evaluation">${label('04 / evaluation')}<h2>read results in context.</h2><p>reported evaluation results on this website apply to fx-1. no benchmark scores are presented for fx-1 lite. evaluation configurations and methodology will accompany our technical release.</p>${link('/research', 'research notes', true)}</article><article id="dipcatcher">${label('05 / dipcatcher')}<h2>under development.</h2><p>dipcatcher is our State-of-the-Art harness for frontier autonomous trading. it will release soon. join the development waitlist now.</p><p>${dipcatcherBundle} model subscriptions and API token usage retain their own pricing.</p>${link('/contact?interest=dipcatcher', 'join dipcatcher waitlist', true)}</article></div></section>`);
}

function legalPage(terms) {
  const title = terms ? 'terms & conditions' : 'privacy policy';
  return wrap(hero('legal / artificial hedge', title, terms ? 'information about the research preview and use of this website.' : 'how enquiries submitted through this website are handled.') + `<section class="ah-page-section ah-legal-content">${terms ? `
    <article><h2>research preview</h2><p>this website presents artificial hedge’s model research and model usage subscription plans. dipcatcher is under development and will release soon; its development waitlist is open. it does not constitute a production service agreement, an offer to manage assets, or a promise of investment returns.</p></article><article><h2>availability and pricing</h2><p>model subscription enquiries are open. monthly subscription prices, allowances, and planned features are provisional and subject to change. ${dipcatcherBundle} model subscriptions and API token usage retain their own pricing. this website does not collect payments.</p></article><article><h2>research information</h2><p>reported results must be considered with their stated context and limitations. website content is informational and does not replace an independent assessment of a model or a financial decision.</p></article><article><h2>future service terms</h2><p>terms governing model access, licensing, data processing, and any paid service will need to be provided before those services are made available. this page is a preview notice and does not assert a completed legal agreement.</p></article>` : `
    <article><h2>information you submit</h2><p>the contact form sends your name, email, optional organisation, and message. if you arrive from a model subscription or dipcatcher waitlist request, it also includes your selected interest, model, and pricing plan.</p></article><article><h2>enquiry delivery</h2><p>submissions are sent through FormSubmit for delivery to <a href="mailto:advaith@artificialhedge.co">advaith@artificialhedge.co</a>. we use the enquiry information to review and respond to your request.</p></article><article><h2>form service</h2><p>FormSubmit processes the submission and provides spam protection. its handling of information is described in the <a href="https://formsubmit.co/privacy.pdf">FormSubmit privacy policy</a>.</p></article><article><h2>privacy questions</h2><p>contact <a href="mailto:advaith@artificialhedge.co">advaith@artificialhedge.co</a> with questions about an enquiry you have sent.</p></article><article><h2>external destinations</h2><p>links that open another website are governed by that destination’s own policies.</p></article>`}</section>`);
}

function notFoundPage() {
  return wrap(hero('404 / page not found', 'the path<br>ends here.', 'this page is not available. explore the model research or return to the company homepage.', link('/', 'back to home') + link('/models', 'explore fx-1', true)));
}

export function renderPage(path) {
  const url = new URL(path, 'http://localhost');
  const route = url.pathname.replace(/\/$/, '') || '/';
  if (route === '/models') return modelsPage();
  if (route === '/research') return researchPage();
  if (route === '/contact') return contactPage(url);
  if (route === '/pricing') return pricingPage();
  if (route === '/docs') return docsPage();
  if (route === '/privacy-policy') return legalPage(false);
  if (route === '/terms-and-conditions' || route === '/terms-of-service') return legalPage(true);
  if (route === '/use-cases' || route.startsWith('/use-cases/')) return useCasesPage(route);
  return notFoundPage();
}

export function initPages(root = document) {
  // Static prebuilt contact HTML receives its waitlist context on arrival.
  const query = new URLSearchParams(window.location.search);
  root.querySelectorAll('[data-ah-contact-form]').forEach(form => {
    ['interest', 'model', 'plan'].forEach(key => {
      const input = form.elements.namedItem(key);
      if (input && query.has(key)) input.value = query.get(key);
    });
    const selectedPlan = plans.find(item => item.id === form.elements.namedItem('plan')?.value);
    const selectedInterest = form.elements.namedItem('interest')?.value;
    const model = form.elements.namedItem('model');
    if (model) model.value = selectedPlan?.models || query.get('model') || modelProfiles.find(item => item.id === selectedInterest)?.name || model.value;
    const values = ['interest', 'model', 'plan'].map(key => form.elements.namedItem(key)?.value || '').filter(Boolean);
    const context = form.querySelector('[data-ah-contact-context]');
    if (context) {
      context.querySelector('[data-ah-contact-context-value]').textContent = [...new Set(values.map(readableEnquiryValue))].join(' / ');
      context.hidden = values.length === 0;
    }
    let next = form.elements.namedItem('_next');
    if (!next) {
      next = document.createElement('input');
      next.type = 'hidden';
      next.name = '_next';
      form.append(next);
    }
    next.value = new URL('/contact?submitted=1', window.location.origin).href;
    const status = form.querySelector('[data-ah-contact-status]');
    if (status && query.get('submitted') === '1') {
      status.textContent = 'thanks. your enquiry has been submitted.';
      status.hidden = false;
    }
  });
  return () => {};
}
