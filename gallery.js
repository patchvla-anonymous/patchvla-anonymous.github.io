'use strict';

(() => {
  const clips = window.PATCHVLA_ROLLOUTS || [];
  const phaseColors = ['#597ea3', '#be9751', '#72906c', '#896cac', '#b47769', '#589d9b', '#8d8993'];
  const modal = document.getElementById('rollout-dialog');
  const detailVideo = document.getElementById('detail-video');
  const byId = (id) => document.getElementById(id);
  const finite = (value) => typeof value === 'number' && Number.isFinite(value);
  const format = (value) => finite(value) ? value.toFixed(3) : '—';
  const color = (phase) => phaseColors[Math.abs(phase || 0) % phaseColors.length];
  let detailClip, trigger, detailRecord;

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function atTime(clip, time) {
    const records = clip.telemetry || [];
    let low = 0, high = records.length - 1, found = -1;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (records[mid].time <= time + 0.001) { found = mid; low = mid + 1; }
      else high = mid - 1;
    }
    return found < 0 ? null : records[found];
  }
  function phaseName(clip, record) {
    return record && Number.isInteger(record.phase) ? (clip.phaseLabels?.[record.phase] || `Phase ${record.phase + 1}`) : 'Initializing';
  }
  function makeCard(clip) {
    const card = el('figure', 'rollout-card');
    const surface = el('div', 'rollout-surface');
    const video = el('video');
    video.src = clip.src; video.poster = clip.poster;
    video.controls = true; video.muted = true; video.playsInline = true;
    video.preload = 'none'; video.setAttribute('aria-label', `${clip.benchmark}: ${clip.title}`);
    const signals = el('div', 'card-signals');
    const phase = el('span', 'card-phase', 'Predicted phase');
    const critic = el('span', 'card-critic', 'Critic —');
    signals.append(phase, critic);
    surface.append(video);
    const caption = el('figcaption');
    const line = el('div', 'card-label-line');
    line.append(el('span', 'task-code', clip.code), el('span', 'success-label', 'Successful rollout'));
    caption.append(line, el('h4', '', clip.title));
    const expand = el('button', 'expand-rollout', 'Expand & inspect ↗');
    expand.type = 'button'; expand.setAttribute('aria-label', `Expand ${clip.title}`);
    caption.append(expand);
    card.append(surface, signals, caption);
    let last;
    function update() {
      const record = atTime(clip, video.currentTime);
      if (record === last) return;
      last = record;
      phase.textContent = record ? phaseName(clip, record) : 'Initializing';
      phase.style.setProperty('--phase-color', record ? color(record.phase) : '#8d8993');
      critic.textContent = `Critic ${format(record?.critic)}`;
    }
    ['timeupdate', 'seeked', 'loadedmetadata'].forEach(event => video.addEventListener(event, update));
    if (video.requestVideoFrameCallback) {
      const onFrame = () => { update(); video.requestVideoFrameCallback(onFrame); };
      video.requestVideoFrameCallback(onFrame);
    }
    video.addEventListener('play', () => {
      document.querySelectorAll('.rollout-grid video').forEach(other => { if (other !== video) other.pause(); });
      update();
    });
    expand.addEventListener('click', () => {
      trigger = expand;
      detailClip = clip; detailRecord = undefined;
      document.querySelectorAll('video').forEach(v => v.pause());
      byId('rollout-dialog-title').textContent = clip.title;
      byId('rollout-dialog-benchmark').textContent = `${clip.benchmark} / ${clip.code}`;
      detailVideo.src = clip.src; detailVideo.poster = clip.poster;
      detailVideo.currentTime = video.currentTime;
      byId('detail-search').textContent = clip.searchLabel || '';
      byId('detail-signal-note').textContent = clip.signalNote || 'Model predictions are held until the next recorded replanning step.';
      const strip = byId('detail-phase-strip');
      strip.replaceChildren();
      (clip.phaseLabels || []).forEach((label, i) => {
        const item = el('span', 'phase-legend-item', label);
        item.style.setProperty('--phase-color', color(i));
        strip.append(item);
      });
      modal.showModal(); updateDetail();
      detailVideo.play().catch(() => {});
    });
    // Show the first recorded prediction on the paused poster only if it is valid at t=0.
    update();
    return card;
  }
  function drawHistory(clip, time) {
    const svg = byId('critic-history');
    const records = (clip.telemetry || []).filter(r => r.time <= time && finite(r.critic));
    const duration = detailVideo.duration || clip.duration || 1;
    const coords = records.map(r => [8 + Math.min(1, r.time / duration) * 284, 63 - Math.max(0, Math.min(1, r.critic)) * 52]);
    const ns = 'http://www.w3.org/2000/svg';
    svg.replaceChildren();
    function add(tag, attrs, text) {
      const node = document.createElementNS(ns, tag);
      Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
      if (text) node.textContent = text;
      svg.append(node);
    }
    add('path', {d:'M8 11H292 M8 63H292', stroke:'#e2dfe6', fill:'none'});
    if (coords.length) {
      const d = coords.map(([x,y], i) => i ? `H${x.toFixed(2)}V${y.toFixed(2)}` : `M${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
      add('path', {d, stroke:'#70509a', 'stroke-width':'2', fill:'none'});
      const [cx,cy] = coords[coords.length - 1];
      add('circle',{cx,cy,r:3,fill:'#70509a'});
    }
    add('text',{x:8,y:75,fill:'#747079','font-size':8},'Recorded critic history');
  }
  function updateDetail() {
    if (!detailClip || !modal.open) return;
    const record = atTime(detailClip, detailVideo.currentTime);
    drawHistory(detailClip, detailVideo.currentTime);
    if (record === detailRecord) return;
    detailRecord = record;
    byId('detail-phase').textContent = phaseName(detailClip, record);
    byId('detail-phase').style.color = color(record?.phase);
    byId('detail-progress-value').textContent = finite(record?.progress) ? `${Math.round(record.progress * 100)}%` : '—';
    byId('detail-progress-bar').style.width = `${finite(record?.progress) ? Math.max(0,Math.min(100,record.progress*100)) : 0}%`;
    byId('detail-critic').textContent = format(record?.critic);
    let forecast = byId('detail-forecast');
    if (!forecast) {
      forecast = el('div', 'detail-forecast'); forecast.id = 'detail-forecast';
      byId('detail-phase-strip').before(forecast);
    }
    forecast.replaceChildren();
    if (record?.forecastPhase?.length) {
      forecast.append(el('p', 'forecast-label', 'Selected candidate · phase forecast'));
      const ribbon = el('div', 'forecast-ribbon');
      record.forecastPhase.forEach((phase, i) => {
        const segment = el('span'); segment.style.background = color(phase);
        segment.title = `Action offset ${i + 1}: ${detailClip.phaseLabels[phase] || phase}`;
        ribbon.append(segment);
      });
      forecast.append(ribbon, el('p', 'forecast-axis', 'Action offset →'));
    }
    const candidates = byId('candidate-scores');
    candidates.replaceChildren();
    (record?.candidates || []).forEach((score, index) => {
      if (!finite(score)) return;
      const bar = el('div', 'candidate-bar' + (index === record.selected ? ' is-selected' : ''));
      bar.style.setProperty('--score', Math.max(0, Math.min(1, score)));
      bar.title = `C${index + 1}: ${score.toFixed(5)}${index === record.selected ? ' · selected' : ''}`;
      bar.setAttribute('aria-label', bar.title);
      candidates.append(bar);
    });
    candidates.hidden = !(record?.candidates?.length);
    document.querySelector('#rollout-dialog .candidate-heading').hidden = candidates.hidden;
    byId('detail-phase-strip').querySelectorAll('span').forEach((node, index) => node.classList.toggle('current-phase', record?.phase === index));
  }
  clips.forEach(clip => byId(clip.benchmark === 'LeHome-Fold' ? 'lehome-gallery' : 'libero-gallery').append(makeCard(clip)));
  ['timeupdate','seeked','loadedmetadata'].forEach(event => detailVideo.addEventListener(event, updateDetail));
  if (detailVideo.requestVideoFrameCallback) {
    const onDetailFrame = () => { updateDetail(); detailVideo.requestVideoFrameCallback(onDetailFrame); };
    detailVideo.requestVideoFrameCallback(onDetailFrame);
  }
  byId('close-rollout').addEventListener('click', () => modal.close());
  modal.addEventListener('close', () => { detailVideo.pause(); trigger?.focus(); });
  modal.addEventListener('click', event => {
    if (event.target !== modal) return;
    const b = modal.getBoundingClientRect();
    if (event.clientX < b.left || event.clientX > b.right || event.clientY < b.top || event.clientY > b.bottom) modal.close();
  });
})();
