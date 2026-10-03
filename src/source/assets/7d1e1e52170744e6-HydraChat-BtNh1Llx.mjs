import{t as e}from"./rolldown-runtime.Dh6celcD.mjs";import{E as t,V as n,_ as r,a as i,b as a,c as o,o as s,s as c,u as l,y as u,z as d}from"./react.DdAQygU4.mjs";import{T as f,Z as p,c as m,j as h}from"./framer.skpqtHad.mjs";function g(e){let{workerUrl:t=`https://soft-shadow-7711.donaldtton.workers.dev`,accent:o=`#FF571A`,contactUrl:s=`https://hydradb.com/contact`,demoUrl:d=`https://cal.com/nish-sri/book-a-demo`,revealDelay:p=4,revealScroll:m=400,greeting:h=`Hi! I'm the HydraDB assistant. Ask me anything about the product, benchmarks, use cases, or getting started.`}=e,g=f.current()===f.canvas,[_,v]=r(!1),[y,b]=r(``),[x,S]=r(!1),[C,w]=r(!1),[T,E]=r(g),[D,O]=r(!1),[k,A]=r([{role:`assistant`,content:h}]),j=a(null),M=a(null),N=a(k);u(()=>{w(!0)},[]),u(()=>{N.current=k},[k]),u(()=>{j.current&&(j.current.scrollTop=j.current.scrollHeight)},[k,x,_]),u(()=>{if(g||typeof document>`u`)return;function e(){let e=!1;return document.querySelectorAll(`iframe`).forEach(t=>{if(((t.className||``)+` `+(t.getAttribute(`name`)||``)+` `+(t.id||``)).toLowerCase().indexOf(`intercom`)===-1||t.id===`intercom-frame`)return;let r=n.getComputedStyle(t);if(r.display===`none`||r.visibility===`hidden`||r.opacity===`0`)return;let i=t.getBoundingClientRect();i.width>120&&i.height>200&&(e=!0)}),e}let t=!1,r=null;function i(){let n=e();n!==t&&(t=n,O(n),n?(r&&=(clearTimeout(r),null),v(!1)):r=setTimeout(()=>v(!0),260))}i();let a=setInterval(i,250);return()=>{clearInterval(a),r&&clearTimeout(r)}},[g]),u(()=>{if(!(g||n===void 0)&&_&&typeof n.Intercom==`function`)try{n.Intercom(`hide`)}catch{}},[_,g]),u(()=>{if(g||n===void 0||typeof document>`u`)return;function e(){document.querySelectorAll(`iframe`).forEach(e=>{let t=((e.className||``)+` `+(e.getAttribute(`name`)||``)+` `+(e.id||``)).toLowerCase();t.indexOf(`intercom`)!==-1&&t.indexOf(`messenger`)===-1&&e.id!==`intercom-frame`&&e.style.setProperty(`display`,`none`,`important`)}),document.querySelectorAll(`.intercom-lightweight-app, .intercom-launcher, .intercom-launcher-frame, [class*="intercom"][class*="notification" i]`).forEach(e=>{e.style.setProperty(`display`,`none`,`important`)})}e();let t=new MutationObserver(()=>e());t.observe(document.body,{childList:!0,subtree:!0});let r=setInterval(e,800);return()=>{t.disconnect(),clearInterval(r)}},[g]),u(()=>{if(g){E(!0);return}if(n===void 0)return;let e=!1;function t(){e||(e=!0,E(!0),i())}function r(){n.scrollY>m&&t()}function i(){clearTimeout(a),n.removeEventListener(`scroll`,r)}let a=setTimeout(t,Math.max(0,p)*1e3);return n.addEventListener(`scroll`,r,{passive:!0}),r(),i},[g,p,m]),u(()=>{if(!_||g||n===void 0)return;function e(e){return M.current&&M.current.contains(e)}function t(t){if(!e(t.target))return;let n=j.current;if(n&&n.contains(t.target)){let e=t.deltaMode===1?16:1;n.scrollTop+=t.deltaY*e}t.preventDefault(),t.stopPropagation()}function r(t){if(!e(t.target))return;let n=j.current;n&&n.contains(t.target)||(t.preventDefault(),t.stopPropagation())}return n.addEventListener(`wheel`,t,{capture:!0,passive:!1}),n.addEventListener(`touchmove`,r,{capture:!0,passive:!1}),()=>{n.removeEventListener(`wheel`,t,!0),n.removeEventListener(`touchmove`,r,!0)}},[_,g]);function P(){let e=[...N.current].reverse().find(e=>e.role===`user`),t=e?`Hi — I was chatting with the site assistant and could use more help.

My question: ${e.content}`:`Hi — I'd like to talk to someone on the HydraDB team.`;if(n!==void 0&&typeof n.Intercom==`function`)try{return v(!1),O(!0),n.Intercom(`startConversation`,t),!0}catch{try{return n.Intercom(`showNewMessage`,t),n.Intercom(`show`),!0}catch{}}return A(e=>[...e,{role:`assistant`,content:`I'm connecting you with our team — you can also reach us directly at ${s}.`}]),!1}async function F(){let e=y.trim();if(!e||x||g)return;let n=[...k,{role:`user`,content:e}];A(n),b(``),S(!0);try{let e=await(await fetch(t,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({messages:n.map(e=>({role:e.role,content:e.content}))})})).json(),r=e.reply||(e.error?`Something went wrong. Please try again.`:``)||`Sorry, I couldn't generate a response.`,i=!!e.escalate,a=e.action===`book_demo`;A([...n,{role:`assistant`,content:r,action:a?`book_demo`:void 0}]),i&&!a&&setTimeout(()=>P(),600)}catch{A([...n,{role:`assistant`,content:`I couldn't reach the server just now — please try again in a moment.`}])}finally{S(!1)}}function I(e){e.key===`Enter`&&!e.shiftKey&&(e.preventDefault(),F())}let L=T&&!D,R=_&&L,z=l(`div`,{className:`hydra-chat`,children:[c(`style`,{dangerouslySetInnerHTML:{__html:`
    .hydra-chat *, .hydra-chat *::before, .hydra-chat *::after { box-sizing: border-box; }
    /* First-line CSS defense (the JS watcher is the reliable one). */
    .intercom-lightweight-app,
    .intercom-lightweight-app-launcher,
    .intercom-launcher,
    .intercom-launcher-frame,
    #intercom-launcher-frame,
    .intercom-notifications-frame,
    [class*="intercom"][class*="notification"] { display: none !important; }
    .hydra-chat {
      --hc-accent: ${o};
      --hc-mono: "Geist Pixel Square","Geist Mono","JetBrains Mono",ui-monospace,monospace;
      --hc-sans: "Aeonik TRIAL Regular","Aeonik","Inter",system-ui,sans-serif;
      position: fixed; right: 24px; bottom: 24px; z-index: 2147483000;
      font-family: var(--hc-sans);
    }
    .hydra-chat__bubble {
      position: relative;
      width: 56px; height: 56px; border-radius: 100px; border: none;
      background: var(--hc-accent); color: #fff; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 8px 30px rgba(0,0,0,0.45);
      transition: opacity .35s ease, transform .35s cubic-bezier(.16,.84,.44,1);
    }
    .hydra-chat__bubble.is-hidden {
      opacity: 0; transform: translateY(14px) scale(.85); pointer-events: none;
    }
    .hydra-chat__bubble.is-shown { opacity: 1; transform: none; }
    .hydra-chat__bubble.is-shown:hover { transform: translateY(-2px); }
    @keyframes hcPanelIn {
      from { opacity: 0; transform: translateY(16px) scale(.96); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    .hydra-chat__panel {
      position: absolute; right: 0; bottom: 72px; width: 370px; max-width: calc(100vw - 32px);
      height: 540px; max-height: calc(100vh - 120px);
      background: #000; border: 1px solid rgba(255,255,255,0.12); border-radius: 14px;
      display: flex; flex-direction: column; overflow: hidden; overscroll-behavior: contain;
      box-shadow: 0 24px 60px rgba(0,0,0,0.55);
      transform-origin: bottom right;
      animation: hcPanelIn .34s cubic-bezier(.16,.84,.44,1) both;
    }
    .hydra-chat__head {
      padding: 14px 16px 14px 18px; border-bottom: 1px solid rgba(255,255,255,0.1);
      display: flex; align-items: center; gap: 10px; flex: 0 0 auto;
    }
    .hydra-chat__dot { width: 8px; height: 8px; border-radius: 100px; background: var(--hc-accent); flex: 0 0 auto; }
    .hydra-chat__title {
      font-family: var(--hc-mono); font-size: 14px; font-weight: 500; color: #fff;
      letter-spacing: 0.02em; margin: 0;
    }
    .hydra-chat__human {
      margin-left: auto; background: none; border: 1px solid rgba(255,255,255,0.18);
      color: rgba(255,255,255,0.8); cursor: pointer; font-size: 11px; font-family: var(--hc-sans);
      border-radius: 8px; padding: 5px 9px; white-space: nowrap;
    }
    .hydra-chat__human:hover { border-color: var(--hc-accent); color: #fff; }
    .hydra-chat__x {
      background: none; border: none; color: rgba(255,255,255,0.5);
      cursor: pointer; font-size: 20px; line-height: 1; padding: 2px 4px; flex: 0 0 auto;
    }
    .hydra-chat__x:hover { color: #fff; }
    .hydra-chat__body {
      flex: 1 1 auto; min-height: 0; overflow-y: auto; overscroll-behavior: contain;
      -webkit-overflow-scrolling: touch;
      padding: 18px; display: flex; flex-direction: column; gap: 12px;
    }
    .hydra-chat__row { display: flex; }
    .hydra-chat__row.user { justify-content: flex-end; }
    .hydra-chat__msg {
      max-width: 82%; padding: 10px 13px; border-radius: 12px; font-size: 14px; line-height: 1.5;
      white-space: pre-wrap; word-wrap: break-word;
    }
    .hydra-chat__msg.assistant { background: #141414; color: rgba(255,255,255,0.92); border: 1px solid rgba(255,255,255,0.08); }
    .hydra-chat__msg.user { background: var(--hc-accent); color: #fff; }
    .hydra-chat__cta {
      display: inline-flex; align-items: center; gap: 6px; margin-top: 10px;
      background: var(--hc-accent); color: #fff; text-decoration: none;
      font-size: 13px; font-weight: 500; padding: 8px 12px; border-radius: 8px;
    }
    .hydra-chat__cta:hover { filter: brightness(1.08); }
    .hydra-chat__typing { display: flex; gap: 4px; padding: 4px 2px; }
    .hydra-chat__typing span {
      width: 6px; height: 6px; border-radius: 100px; background: rgba(255,255,255,0.5);
      animation: hcblink 1.2s infinite ease-in-out;
    }
    .hydra-chat__typing span:nth-child(2) { animation-delay: .2s; }
    .hydra-chat__typing span:nth-child(3) { animation-delay: .4s; }
    @keyframes hcblink { 0%,80%,100%{opacity:.25} 40%{opacity:1} }
    .hydra-chat__foot {
      padding: 12px; border-top: 1px solid rgba(255,255,255,0.1); display: flex; gap: 8px; align-items: flex-end; flex: 0 0 auto;
    }
    .hydra-chat__input {
      flex: 1; resize: none; background: #0e0e0e; color: #fff; border: 1px solid rgba(255,255,255,0.14);
      border-radius: 10px; padding: 10px 12px; font-family: var(--hc-sans); font-size: 14px; line-height: 1.4;
      max-height: 120px; outline: none;
    }
    .hydra-chat__input:focus { border-color: var(--hc-accent); }
    .hydra-chat__send {
      background: var(--hc-accent); color: #fff; border: none; border-radius: 10px; cursor: pointer;
      width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; flex: 0 0 auto;
    }
    .hydra-chat__send:disabled { opacity: .5; cursor: default; }
    @media (max-width: 809px) {
      .hydra-chat { right: max(12px, env(safe-area-inset-right)); bottom: max(12px, env(safe-area-inset-bottom)); }
      .hydra-chat__bubble { width: 44px; height: 44px; }
      .hydra-chat__panel { bottom: 56px; width: calc(100vw - 24px); max-width: 370px; max-height: calc(100dvh - 100px); }
    }
    @media (prefers-reduced-motion: reduce) {
      .hydra-chat__bubble { transition: none; }
      .hydra-chat__panel { animation: none; }
    }
    .hydra-chat__body::-webkit-scrollbar { width: 8px; }
    .hydra-chat__body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 8px; }
    `}}),R&&l(`div`,{className:`hydra-chat__panel`,ref:M,children:[l(`div`,{className:`hydra-chat__head`,children:[c(`span`,{className:`hydra-chat__dot`}),c(`p`,{className:`hydra-chat__title`,children:`HydraDB Assistant`}),c(`button`,{className:`hydra-chat__human`,onClick:()=>P(),children:`Talk to a human`}),c(`button`,{className:`hydra-chat__x`,onClick:()=>v(!1),"aria-label":`Close chat`,children:`×`})]}),l(`div`,{className:`hydra-chat__body`,ref:j,children:[k.map((e,t)=>c(`div`,{className:`hydra-chat__row ${e.role}`,children:l(`div`,{className:`hydra-chat__msg ${e.role}`,children:[e.content,e.action===`book_demo`&&c(`div`,{children:c(`a`,{className:`hydra-chat__cta`,href:d,target:`_blank`,rel:`noopener noreferrer`,children:`Book a demo →`})})]})},t)),x&&c(`div`,{className:`hydra-chat__row assistant`,children:c(`div`,{className:`hydra-chat__msg assistant`,children:l(`div`,{className:`hydra-chat__typing`,children:[c(`span`,{}),c(`span`,{}),c(`span`,{})]})})})]}),l(`div`,{className:`hydra-chat__foot`,children:[c(`textarea`,{className:`hydra-chat__input`,rows:1,placeholder:`Ask about HydraDB…`,value:y,onChange:e=>b(e.target.value),onKeyDown:I}),c(`button`,{className:`hydra-chat__send`,onClick:F,disabled:x||!y.trim(),"aria-label":`Send`,children:c(`svg`,{width:`18`,height:`18`,viewBox:`0 0 24 24`,fill:`none`,children:c(`path`,{d:`M4 12l16-8-6 16-3-6-7-2z`,fill:`#fff`})})})]})]}),c(`button`,{className:`hydra-chat__bubble ${L?`is-shown`:`is-hidden`}`,onClick:()=>v(e=>!e),"aria-label":`Open chat`,"aria-hidden":!L,tabIndex:L?0:-1,children:R?c(`svg`,{width:`22`,height:`22`,viewBox:`0 0 24 24`,fill:`none`,children:c(`path`,{d:`M6 6l12 12M18 6L6 18`,stroke:`#fff`,strokeWidth:`2`,strokeLinecap:`round`})}):c(`svg`,{width:`24`,height:`24`,viewBox:`0 0 24 24`,fill:`none`,children:c(`path`,{d:`M4 5h16v11H8l-4 4V5z`,stroke:`#fff`,strokeWidth:`2`,strokeLinejoin:`round`})})})]});return g?z:C&&typeof document<`u`?i(z,document.body):null}var _=e((()=>{d(),o(),t(),s(),p(),h(g,{workerUrl:{type:m.String,title:`Worker URL`,defaultValue:`https://soft-shadow-7711.donaldtton.workers.dev`},accent:{type:m.Color,title:`Accent`,defaultValue:`#FF571A`},contactUrl:{type:m.String,title:`Contact URL`,defaultValue:`https://hydradb.com/contact`},demoUrl:{type:m.String,title:`Demo booking URL`,defaultValue:`https://cal.com/nish-sri/book-a-demo`},revealDelay:{type:m.Number,title:`Reveal delay (s)`,defaultValue:4,min:0,max:30,step:1,displayStepper:!0},revealScroll:{type:m.Number,title:`Reveal scroll (px)`,defaultValue:400,min:0,max:3e3,step:50,displayStepper:!0},greeting:{type:m.String,title:`Greeting`,displayTextArea:!0,defaultValue:`Hi! I'm the HydraDB assistant. Ask me anything about the product, benchmarks, use cases, or getting started.`}})}));export{_ as n,g as t};
//# sourceMappingURL=HydraChat.BtNh1Llx.mjs.map