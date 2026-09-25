'use strict';

(() => {
  const clips = window.PATCHVLA_ROLLOUTS || [];
  const phaseColors = ['#597ea3', '#be9751', '#72906c', '#896cac', '#b47769', '#589d9b', '#8d8993'];
  const finite = value => typeof value === 'number' && Number.isFinite(value);
  const format = value => finite(value) ? value.toFixed(3) : '—';
  const color = phase => phaseColors[phase] || '#dedbe1';
  const clamp = value => Math.max(0, Math.min(1, value));
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
  function recordedTimeline(clip) {
    const strip = el('div', 'recorded-phase-track');
    strip.setAttribute('role', 'img');
    strip.setAttribute('aria-label', 'Recorded model phase predictions across video time');
    const records = clip.telemetry || [];
    const segments = [];
    function append(start, end, phase) {
      if (end <= start) return;
      const last = segments[segments.length - 1];
      if (last && last.phase === phase && Math.abs(last.end - start) < 0.002) last.end = end;
      else segments.push({start, end, phase});
    }
    if (records.length && records[0].time > 0) append(0, records[0].time, null);
    records.forEach((record, i) => append(record.time, records[i + 1]?.time ?? clip.duration, record.phase));
    segments.forEach(segment => {
      const item = el('span', 'recorded-phase-segment');
      item.style.width = `${(segment.end - segment.start) / clip.duration * 100}%`;
      item.style.backgroundColor = color(segment.phase);
      const name = Number.isInteger(segment.phase) ? clip.phaseLabels[segment.phase] : 'Start';
      item.title = `${name} · ${segment.start.toFixed(2)}–${segment.end.toFixed(2)} s`;
      strip.append(item);
    });
    return strip;
  }
  function makeCard(clip) {
    const card = el('figure', 'rollout-card');
    const caption = el('figcaption', 'rollout-caption');
    const line = el('div', 'card-label-line');
    line.append(el('span', 'task-code', clip.code), el('span', 'success-label', 'Successful rollout'));
    caption.append(line, el('h4', '', clip.title));
    const surface = el('div', 'rollout-surface');
    const video = el('video');
    video.src = clip.src; video.poster = clip.poster;
    video.controls = true; video.muted = true; video.playsInline = true;
    video.preload = 'none'; video.setAttribute('aria-label', `${clip.benchmark}: ${clip.title}`);
    surface.append(video);

    const panel = el('div', 'inline-signals');
    const stats = el('div', 'inline-stats');
    const phaseBox = el('div', 'phase-stat');
    const phase = el('strong', 'inline-phase', '—');
    phaseBox.append(el('span', 'stat-label', 'Predicted phase'), phase);
    const progressBox = el('div', 'progress-stat');
    const progressValue = el('strong', 'inline-progress-value', '—');
    const progressTrack = el('div', 'inline-progress-track');
    const progressBar = el('span'); progressTrack.append(progressBar);
    progressBox.append(el('span', 'stat-label', 'Local progress'), progressValue, progressTrack);
    const criticBox = el('div', 'critic-stat');
    const critic = el('strong', 'inline-critic', '—');
    criticBox.append(el('span', 'stat-label', 'Critic score'), critic);
    stats.append(phaseBox, progressBox, criticBox);

    const historyHeading = el('div', 'inline-row-heading');
    const clock = el('span', 'playback-clock', `0.0 / ${clip.duration.toFixed(1)} s`);
    historyHeading.append(el('span', '', 'Predicted phase over time'), clock);
    const history = el('div', 'phase-history');
    const marker = el('span', 'phase-playhead');
    marker.setAttribute('aria-hidden', 'true');
    history.append(recordedTimeline(clip), marker);
    const legend = el('div', 'inline-phase-legend');
    clip.phaseLabels.forEach((name, i) => {
      const item = el('span', 'phase-legend-item', name);
      item.style.setProperty('--phase-color', color(i));
      legend.append(item);
    });

    panel.append(stats, historyHeading, history, legend);
    card.append(caption, surface, panel);

    let last;
    function update() {
      const time = Math.max(0, video.currentTime || 0);
      clock.textContent = `${time.toFixed(1)} / ${clip.duration.toFixed(1)} s`;
      marker.style.left = `${clamp(time / clip.duration) * 100}%`;
      const record = atTime(clip, time);
      if (record === last) return;
      last = record;
      phase.textContent = record ? clip.phaseLabels[record.phase] : '—';
      phase.style.color = record ? color(record.phase) : '#747079';
      progressValue.textContent = finite(record?.progress) ? `${Math.round(record.progress * 100)}%` : '—';
      progressBar.style.width = `${finite(record?.progress) ? clamp(record.progress) * 100 : 0}%`;
      critic.textContent = format(record?.critic);
      [...legend.children].forEach((item, i) => item.classList.toggle('current-phase', record?.phase === i));
    }
    ['timeupdate', 'seeked', 'loadedmetadata', 'ended'].forEach(event => video.addEventListener(event, update));
    if (video.requestVideoFrameCallback) {
      const onFrame = () => { update(); video.requestVideoFrameCallback(onFrame); };
      video.requestVideoFrameCallback(onFrame);
    }
    video.addEventListener('play', () => {
      document.querySelectorAll('.rollout-grid video').forEach(other => { if (other !== video) other.pause(); });
      update();
    });
    update();
    return card;
  }
  clips.forEach(clip => document.getElementById(clip.benchmark === 'LeHome-Fold' ? 'lehome-gallery' : 'libero-gallery').append(makeCard(clip)));
})();
