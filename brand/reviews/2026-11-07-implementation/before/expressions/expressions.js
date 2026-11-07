(() => {
  'use strict';
  const catalogue = window.HEYNAG_EXPRESSIONS;
  if (!catalogue) return;
  const groups = catalogue.groups;
  const states = groups.flatMap(group => group.states.map(state => ({ ...state, group })));
  const byId = new Map(states.map(state => [state.id, state]));
  const select = document.getElementById('state-select');
  const buttons = new Map();
  let current = 'thinking';
  let galleryTheme = 'day';

  function paint(element, state, theme) {
    element.style.backgroundImage = `url("${state.group[theme]}")`;
    element.style.backgroundPosition = `${(state.cell % 3) * 50}% ${Math.floor(state.cell / 3) * 100}%`;
    element.setAttribute('aria-label', `${state.label}, ${theme === 'day' ? 'daylight' : 'night'} treatment`);
  }
  function choose(id, navigate = false) {
    const state = byId.get(id);
    if (!state) return;
    current = id;
    select.value = id;
    document.getElementById('state-name').textContent = state.label;
    document.getElementById('state-group').textContent = state.group.title;
    for (const [field, element] of [['face','face-note'],['body','body-note'],['detail','detail-note'],['motion','motion-note'],['contrast','contrast-note']]) document.getElementById(element).textContent = state[field];
    paint(document.getElementById('day-sprite'), state, 'day');
    paint(document.getElementById('night-sprite'), state, 'night');
    paint(document.getElementById('small-day'), state, 'day');
    paint(document.getElementById('small-night'), state, 'night');
    for (const [key, button] of buttons) button.setAttribute('aria-pressed', String(key === id));
    document.getElementById('announcement').textContent = `${state.label}. Light and dark examples updated.`;
    document.documentElement.dataset.expression = id;
    if (navigate) document.getElementById('state-name').focus();
  }

  for (const group of groups) {
    const optgroup = document.createElement('optgroup');
    optgroup.label = group.title;
    const section = document.createElement('section'); section.className = 'emotion-group';
    const title = document.createElement('h3'); title.textContent = group.title; section.append(title);
    const grid = document.createElement('div'); grid.className = 'emotion-grid'; section.append(grid);
    for (const original of group.states) {
      const state = byId.get(original.id);
      const option = document.createElement('option'); option.value = state.id; option.textContent = state.label; optgroup.append(option);
      const button = document.createElement('button'); button.type = 'button'; button.className = 'emotion-button day'; button.dataset.state = state.id; button.setAttribute('aria-label', `View ${state.label}`); button.setAttribute('aria-pressed','false');
      const sprite = document.createElement('span'); sprite.className = 'sprite'; sprite.setAttribute('aria-hidden','true'); paint(sprite,state,'day');
      const label = document.createElement('span'); label.className='label'; label.textContent=state.label;
      button.append(sprite,label); button.addEventListener('click',() => choose(state.id,true)); grid.append(button); buttons.set(state.id,button);
    }
    select.append(optgroup); document.getElementById('groups').append(section);
  }
  select.addEventListener('change',() => choose(select.value));
  document.getElementById('previous').addEventListener('click',() => choose(states[(states.findIndex(s=>s.id===current)+states.length-1)%states.length].id));
  document.getElementById('next').addEventListener('click',() => choose(states[(states.findIndex(s=>s.id===current)+1)%states.length].id));
  for (const radio of document.querySelectorAll('[name="gallery-theme"]')) radio.addEventListener('change',() => {
    galleryTheme=radio.value;
    for (const [id,button] of buttons) { button.classList.toggle('night',galleryTheme==='night'); button.classList.toggle('day',galleryTheme==='day'); paint(button.querySelector('.sprite'),byId.get(id),galleryTheme); }
  });
  choose(current);
  const sources = [...new Set(groups.flatMap(group=>[group.day,group.night]))];
  window.expressionAssets = { ready:false, failures:[] };
  Promise.all(sources.map(src=>new Promise(resolve=>{const image=new Image();image.onload=()=>resolve();image.onerror=()=>{window.expressionAssets.failures.push(src);resolve();};image.src=src;}))).then(()=>{window.expressionAssets.ready=true;});
})();
