import{t as e}from"./rolldown-runtime.Dh6celcD.mjs";async function t(e,t,i){let a=r[e],o=a?await a(t,i):void 0,s={bodyEnd:[],bodyStart:[],headEnd:[],headStart:[]};for(let t of n){if(t.pageIds&&!t.pageIds.has(e))continue;let n=t.code(o);n&&s[t.placement].push({...t,code:n})}return s}var n,r,i,a;e((()=>{n=[{code:e=>`<script>\r
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group identify setPersonProperties setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags resetGroups onFeatureFlags addFeatureFlagsHandler onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);\r
    posthog.init('phc_qH6psLVjkWQFAGSmTJoKkpVG9Tj5KUqzULfAn9mYdg79', {\r
        api_host: 'https://us.i.posthog.com',\r
        defaults: '2026-01-30'\r
        cross_subdomain_cookie: true\r
    })\r
<\/script>`,id:`K62BUbE6O`,loadMode:`always`,name:`PostHog Analytics`,placement:`bodyEnd`},{code:e=>`<script>
(function () {
  var UTM_KEYS = ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid','fbclid'];
  var COOKIE_NAME = 'hydra_first_touch_utm';
  var COOKIE_DAYS = 90;
  var APP_HOST_RE = /^(https?:)?\\/\\/(app|dashboard)\\.hydradb\\.com/i;

  function getCookie(name) {
    var m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : null;
  }
  function setCookie(name, value, days) {
    var d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = name + '=' + encodeURIComponent(value) +
      '; expires=' + d.toUTCString() + '; path=/; domain=.hydradb.com; SameSite=Lax';
  }

  var params = new URLSearchParams(window.location.search);
  var current = {};
  UTM_KEYS.forEach(function (k) { if (params.get(k)) current[k] = params.get(k); });
  if (Object.keys(current).length && !getCookie(COOKIE_NAME)) {
    setCookie(COOKIE_NAME, JSON.stringify(current), COOKIE_DAYS);
  }

  function paramsToAppend() {
    if (Object.keys(current).length) return current;
    var stored = getCookie(COOKIE_NAME);
    return stored ? JSON.parse(stored) : null;
  }

  function tagLinks() {
    var toAppend = paramsToAppend();
    if (!toAppend) return;
    document.querySelectorAll('a[href]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href || a.dataset.utmTagged === '1' || !APP_HOST_RE.test(href)) return;
      try {
        var url = new URL(href, window.location.origin);
        Object.keys(toAppend).forEach(function (k) {
          if (!url.searchParams.has(k)) url.searchParams.set(k, toAppend[k]);
        });
        a.setAttribute('href', url.toString());
        a.dataset.utmTagged = '1';
      } catch (e) {}
    });
  }

  tagLinks();
  new MutationObserver(tagLinks).observe(document.documentElement, { childList: true, subtree: true });
})();
<\/script>`,id:`lCs0zhH0c`,loadMode:`always`,name:`UTM Passthrough`,placement:`bodyEnd`},{code:e=>`<!-- Start of Reo Javascript -->
<script type="text/javascript">
  !function(){var e,t,n;e="ae8681b2493282e",t=function(){Reo.init({clientID:"ae8681b2493282e", enableThirdPartyTracking: true})},(n=document.createElement("script")).src="https://static.reo.dev/"+e+"/reo.js",n.defer=!0,n.onload=t,document.head.appendChild(n)}();
<\/script>
<!-- End of Reo Javascript -->`,id:`hGuwxcb7O`,loadMode:`always`,name:`Reo.dev Analytics`,placement:`bodyEnd`}],r={},i={bodyEnd:[`K62BUbE6O`,`dcbKJP8Vn`,`lCs0zhH0c`,`hGuwxcb7O`],bodyStart:[],headEnd:[`lXf8BuozM`,`Z5GN7fLee`],headStart:[`IukaT6VoO`]},a={exports:{getSnippets:{type:`function`,annotations:{framerContractVersion:`1`}},snippetsSorting:{type:`variable`,annotations:{framerContractVersion:`1`}},__FramerMetadata__:{type:`variable`}}}}))();export{a as __FramerMetadata__,t as getSnippets,i as snippetsSorting};
//# sourceMappingURL=eRvDxNVcwfeK5KnVIpdtgKBXVlR6X4iguklpUg-VCBg._6Fb5PRq.mjs.map