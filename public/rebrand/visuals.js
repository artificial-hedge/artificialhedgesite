const benchmarks = [
  { name: 'Finance Agent v2', category: 'finance', value: '63.5', metric: 'score' },
  { name: 'FinanceBench', category: 'finance', value: '100', metric: 'score' },
  { name: 'Tau cube banking', category: 'finance', value: 'supported', metric: 'coverage' },
  { name: 'CorpFin v2', category: 'finance', value: 'evaluated', metric: 'coverage' },
  { name: 'GDPval-AA v2', category: 'workflows', value: '1732', metric: 'Elo' },
  { name: 'OmniDoc Bench', category: 'documents', value: '98', metric: 'score' },
  { name: 'GPQA Diamond', category: 'reasoning', value: '97.3%', metric: 'percentage' },
  { name: 'CritPt', category: 'reasoning', value: '27.3', metric: 'score' },
  { name: 'AA-LCR', category: 'reasoning', value: '76.4', metric: 'score' },
  { name: 'HLE-Full', category: 'reasoning', value: '45.7', metric: 'score' },
  { name: 'HLE-Full + dipcatcher', category: 'reasoning', value: '61.0', metric: 'score' },
  { name: 'BrowseComp', category: 'research', value: '95.5', metric: 'score' },
  { name: 'DeepSearchQA (F1)', category: 'research', value: '97.2', metric: 'F1 score' },
  { name: 'ResearchRubrics', category: 'research', value: '83.5', metric: 'score' },
  { name: 'Toolathlon-Verified', category: 'tools', value: '81.7', metric: 'score' },
  { name: 'MCPMark-Verified', category: 'tools', value: '96.2', metric: 'score' },
  { name: 'MCP-Atlas', category: 'tools', value: '89.9', metric: 'score' },
  { name: 'AutomationBench', category: 'workflows', value: '44.2', metric: 'score' },
  { name: 'JobBench', category: 'workflows', value: '62.0', metric: 'score' },
  { name: 'AA-Briefcase', category: 'workflows', value: '1663', metric: 'Elo' },
  { name: "Agents' Last Exam", category: 'workflows', value: '30.0', metric: 'score' },
  { name: 'APEX-Agents', category: 'workflows', value: '45.1', metric: 'score' },
  { name: 'Harvey Lab-AA', category: 'workflows', value: '100', metric: 'score' },
];

const categories = [
  ['all', 'all evaluations'],
  ['finance', 'finance'],
  ['reasoning', 'reasoning'],
  ['documents', 'documents'],
  ['research', 'research'],
  ['tools', 'tool use'],
  ['workflows', 'workflows'],
];

const domainLabels = {
  finance: 'financial reasoning',
  reasoning: 'general reasoning',
  documents: 'document intelligence',
  research: 'research & retrieval',
  tools: 'tool use',
  workflows: 'autonomous workflows',
};

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]);
}

function architectureItem(label, detail) {
  return `<li><span>${label}</span><small>${detail}</small></li>`;
}

export function renderArchitecture() {
  return `<section class="fxv-section fxv-architecture" id="architecture" aria-labelledby="fxv-architecture-title">
    <div class="fxv-section-heading">
      <p class="fxv-kicker">-- architecture</p>
      <h2 id="fxv-architecture-title">from source<br>to financial reasoning.</h2>
      <p class="fxv-intro">two models at the core. financial context in, research and workflows out.</p>
    </div>
    <figure class="fxv-architecture-figure">
      <div class="fxv-figure-bar"><span>system map / fx-1 family</span><span>illustrative architecture</span></div>
      <div class="fxv-pipeline">
        <div class="fxv-stage fxv-stage--source">
          <div class="fxv-stage-heading"><span class="fxv-stage-number">01</span><span>source / context</span></div>
          <h3>financial context</h3>
          <ul class="fxv-source-list">
            ${architectureItem('filings & statements', 'companies · segments · periods')}
            ${architectureItem('market & economic data', 'prices · curves · macro context')}
            ${architectureItem('research & documents', 'text · tables · references')}
          </ul>
          <p class="fxv-stage-footer"><span class="fxv-pixel-square"></span> structured inputs</p>
        </div>
        <div class="fxv-stage fxv-stage--model">
          <div class="fxv-stage-heading"><span class="fxv-stage-number">02</span><span>model / reasoning</span></div>
          <div class="fxv-model-options">
            <div class="fxv-model-core"><span class="fxv-model-tag">primary / frontier finance + math</span><div class="fxv-model-core-body"><h3>fx-1</h3><dl><div><dt>total parameters</dt><dd>3.4T</dd></div><div><dt>active / token</dt><dd>~128B</dd></div></dl></div></div>
            <div class="fxv-model-core fxv-model-core--lite"><span class="fxv-model-tag">economy optimised / finance + math</span><div class="fxv-model-core-body"><h3>fx-1 lite</h3><dl><div><dt>total parameters</dt><dd>2.4T</dd></div><div><dt>active / token</dt><dd>~49B</dd></div></dl></div></div>
          </div>
          <ol class="fxv-model-steps"><li><span>01</span> extract & normalize</li><li><span>02</span> reason & calculate</li><li><span>03</span> validate & cite</li></ol>
          <p class="fxv-stage-footer"><span class="fxv-pixel-square"></span> model interface</p>
        </div>
        <div class="fxv-stage fxv-stage--output">
          <div class="fxv-stage-heading"><span class="fxv-stage-number">03</span><span>output / application</span></div>
          <h3>research to workflows</h3>
          <ul class="fxv-output-list">
            ${architectureItem('financial research', 'source-linked analysis')}
            ${architectureItem('quantitative workflows', 'executable research logic')}
            ${architectureItem('decision support', 'scenarios & assumptions')}
          </ul>
          <p class="fxv-stage-footer"><span class="fxv-pixel-square"></span> reviewable outputs</p>
        </div>
      </div>
      <div class="fxv-orchestration">
        <div class="fxv-orchestration-label"><span class="fxv-rail-index">04 / planned orchestration</span><h3>dipcatcher</h3><span class="fxv-development-status">under development / releasing soon</span><p>the planned harness around the model.</p><p class="fxv-preview-note">when available, bundled free with model subscriptions until the research preview ends on <time datetime="2026-12-12">december 12, 2026</time>.</p><a class="fxv-waitlist-link" href="/contact?interest=dipcatcher">join dipcatcher waitlist <span aria-hidden="true">↗</span></a></div>
        <ol class="fxv-orchestration-flow" aria-label="planned dipcatcher workflow"><li>context</li><li>tool use</li><li>execution</li><li>review</li></ol>
      </div>
      <figcaption class="fxv-figure-caption">a connected research workflow with planned dipcatcher orchestration.</figcaption>
    </figure>
  </section>`;
}

function featuredResult(name, detail) {
  const result = benchmarks.find(row => row.name === name);
  return `<div class="fxv-featured-result"><span class="fxv-readout-label">${detail}</span><div class="fxv-readout-value">${result.value}<span>${result.metric === 'Elo' ? 'Elo' : 'score'}</span></div><p>${result.name}</p></div>`;
}

function benchmarkRow(row, index) {
  return `<tr data-fxv-category="${row.category}">
    <th scope="row"><span class="fxv-row-index">${String(index + 1).padStart(2, '0')}</span><span>${escapeHTML(row.name)}</span></th>
    <td class="fxv-domain">${escapeHTML(domainLabels[row.category])}</td>
    <td class="fxv-result${row.metric === 'coverage' ? ' fxv-result--coverage' : ''}">${escapeHTML(row.value)}${row.metric === 'Elo' ? '<small class="fxv-mobile-unit">Elo</small>' : ''}</td>
    <td class="fxv-metric">${escapeHTML(row.metric)}</td>
  </tr>`;
}

export function renderHarnessComparison() {
  const results = [
    { label: 'fx-1', value: '45.7', width: 57.125 },
    { label: 'fx-1 + dipcatcher', value: '61.0', width: 76.25 },
  ];
  return `<figure class="fxv-harness-comparison" aria-labelledby="fxv-comparison-title">
    <div class="fxv-comparison-heading"><div><p class="fxv-kicker">-- model + harness</p><h3 id="fxv-comparison-title">HLE-Full</h3></div><p>same evaluation.<br>two reported results.</p></div>
    <div class="fxv-score-plot">
      ${results.map((result, index) => `<div class="fxv-score-row"><span class="fxv-score-label">${result.label}</span><div class="fxv-score-track" aria-hidden="true"><div class="fxv-score-bar${index ? ' fxv-score-bar--harness' : ''}" style="width:${result.width}%"></div></div><span class="fxv-score-readout">${result.value}<small>score</small></span></div>`).join('')}
      <div class="fxv-score-axis" aria-hidden="true"><span class="fxv-axis-label">score</span><div class="fxv-axis-ticks"><span>0</span><span>20</span><span>40</span><span>60</span><span>80</span></div></div>
    </div>
    <figcaption><span>reported HLE-Full scores · fx-1 / 45.7 · fx-1 + dipcatcher / 61.0</span><span class="fxv-comparison-note">dipcatcher is under development and releasing soon.</span></figcaption>
  </figure>`;
}

export function renderBenchmarks() {
  return `<section class="fxv-section fxv-benchmarks" id="benchmarks" aria-labelledby="fxv-benchmarks-title">
    <div class="fxv-section-heading">
      <p class="fxv-kicker">-- evaluations</p>
      <h2 id="fxv-benchmarks-title">fx-1<br>benchmark results.</h2>
      <p class="fxv-intro">fx-1 evaluations across financial reasoning, research, tool use and autonomous work. explore the reported results.</p>
    </div>
    <div class="fxv-featured-results" aria-label="featured evaluation results">
      ${featuredResult('Finance Agent v2', 'financial agents')}
      ${featuredResult('FinanceBench', 'financial reasoning')}
      ${featuredResult('GDPval-AA v2', 'professional work')}
    </div>
    ${renderHarnessComparison()}
    <div class="fxv-benchmark-ledger" data-fxv-ledger>
      <div class="fxv-ledger-heading"><span>evaluation ledger / fx-1</span><span>reported results / research preview</span></div>
      <div class="fxv-filters" role="group" aria-label="filter evaluations by area">${categories.map(([key, label]) => `<button type="button" data-fxv-filter="${key}" aria-pressed="${key === 'all'}" aria-controls="fxv-benchmark-table">${label}<span>${key === 'all' ? benchmarks.length : benchmarks.filter(row => row.category === key).length}</span></button>`).join('')}</div>
      <div class="fxv-table-scroll" role="region" aria-label="benchmark evaluation ledger" tabindex="0">
        <table id="fxv-benchmark-table"><caption class="fxv-visually-hidden">fx-1 reported evaluation results with their individual measures</caption><thead><tr><th scope="col">evaluation</th><th scope="col">area</th><th scope="col">fx-1</th><th scope="col">measure</th></tr></thead><tbody>${benchmarks.map(benchmarkRow).join('')}</tbody></table>
      </div>
      <div class="fxv-ledger-footer"><p><span data-fxv-visible-count>${benchmarks.length}</span> fx-1 evaluations shown</p><p>fx-1 results · scores, percentages and Elo ratings use different scales.</p></div>
      <p class="fxv-visually-hidden" data-fxv-filter-status role="status" aria-live="polite"></p>
    </div>
  </section>`;
}

export function initVisuals(root = document) {
  root.querySelectorAll('[data-fxv-ledger]').forEach(ledger => {
    if (ledger.dataset.fxvInitialized) return;
    ledger.dataset.fxvInitialized = 'true';
    const filters = Array.from(ledger.querySelectorAll('[data-fxv-filter]'));
    const rows = Array.from(ledger.querySelectorAll('[data-fxv-category]'));
    ledger.addEventListener('click', event => {
      const button = event.target.closest('[data-fxv-filter]');
      if (!button || !ledger.contains(button)) return;
      const filter = button.dataset.fxvFilter;
      filters.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      let visible = 0;
      rows.forEach(row => {
        row.hidden = filter !== 'all' && row.dataset.fxvCategory !== filter;
        if (!row.hidden) visible += 1;
      });
      ledger.querySelector('[data-fxv-visible-count]').textContent = visible;
      const label = categories.find(([key]) => key === filter)?.[1] || filter;
      ledger.querySelector('[data-fxv-filter-status]').textContent = `${visible} ${label} evaluations shown`;
    });
  });
}
