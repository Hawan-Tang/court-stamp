(function () {
'use strict';
const D = window.DATA, LAWS = window.LAWS;
const KEY = 'tws-game-v1';
const $app = document.getElementById('app');
const LAWN = { org: '法院組織法', civ: '民事訴訟法', crim: '刑事訴訟法' };
const LAWS_SHORT = { '法院組織法': '法組', '民事訴訟法': '民訴', '刑事訴訟法': '刑訴', '法庭旁聽規則': '旁聽', '法庭席位布置規則': '席位', '法庭錄音錄影及其利用保存辦法': '錄音錄影', '臺灣高等法院以下各級法院或分院臨時開庭辦法': '臨時開庭', '法院便民禮民實施要點': '便民', '家事事件法': '家事' };
const SHORT3 = { org: '法組', civ: '民訴', crim: '刑訴' };
const L = 'ABCD';

/* ---------- 索引 ---------- */
const U = {}, Q = {}, Z = {}, T = {}, SQ = {}, IDX = {};
D.units.forEach(u => U[u.id] = u);
D.questions.forEach(q => Q[q.id] = q);
D.cloze.forEach(z => Z[z.id] = z);
D.tf.forEach(t => T[t.id] = t);
D.seqs.forEach(s => SQ[s.id] = s);
for (const n in LAWS) { IDX[n] = {}; LAWS[n].forEach(([k, v]) => { if (k !== 'h') IDX[n][k] = v; }); }
const LV = D.levels, LVI = {}; LV.forEach((l, i) => LVI[l.id] = i);

/* ---------- 儲存 ---------- */
const O = {}; (D.order || []).forEach(o => O[o.id] = o);
function load() { try { const v = JSON.parse(localStorage.getItem(KEY)); if (v && v.r) return v; } catch (e) {} return { r: {}, lv: {}, mute: false, mocks: [], quick: 0 }; }
const ST = load(); ST.lv = ST.lv || {}; ST.mocks = ST.mocks || [];
ST.set = Object.assign({ sound: ST.mute ? false : true, vol: 0.6, vib: true, anim: true, hl: ST.hl === false ? false : true, notes: true, tts: false, ttsRate: 1 }, ST.set || {});
ST.mode = ST.mode || 'all'; ST.goal = ST.goal || 30; ST.gifts = ST.gifts || {};
ST.srs = ST.srs || {}; ST.days = ST.days || {}; ST.coins = ST.coins || 0; ST.owned = ST.owned || ['turtle']; ST.chr = ST.chr || 'turtle';
let GOAL = ST.goal;
const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const dayRec = () => { const k = today(); return ST.days[k] = ST.days[k] || { right: 0, rounds: 0, goal: 0 }; };
const SRS_DAYS = [1, 3, 7, 15, 30, 60];
const retryMs = () => (60 + Math.random() * 240) * 1000;
const SRS_T = { q: 1, z: 1, o: 1 };
function srsUpdate(id, ok) {
  const s = ST.srs[id] || { l: 0, due: 0 };
  if (ok) { s.l = Math.min(s.l + 1, SRS_DAYS.length); s.due = Date.now() + SRS_DAYS[s.l - 1] * 864e5 - 3600e3; }
  else { s.l = 0; s.due = Date.now() + retryMs(); }
  ST.srs[id] = s;
}
const typeOf = id => Q[id] ? 'q' : Z[id] ? 'z' : O[id] ? 'o' : T[id] ? 't' : SQ[id] ? 's' : 'm';
const dueIds = () => Object.keys(ST.srs).filter(id => ST.srs[id].due <= Date.now());
function streak() { let n = 0; const d = new Date(); if (!(ST.days[today()] || {}).rounds) d.setDate(d.getDate() - 1); for (;;) { const k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); if ((ST.days[k] || {}).rounds) { n++; d.setDate(d.getDate() - 1); } else return n; } }
const monthGoals = () => { const m = today().slice(0, 7); return Object.keys(ST.days).filter(k => k.startsWith(m) && ST.days[k].goal).length; };
let goalJustHit = false;
function save() { try { localStorage.setItem(KEY, JSON.stringify(ST)); } catch (e) {} }
function mark(id, ok) {
  const r = ST.r[id] || [0, 0, 0, 0]; if (ok) { r[0]++; r[2] = 1; r[3]++; } else { r[1]++; r[2] = 0; r[3] = 0; } ST.r[id] = r;
  if (SRS_T[typeOf(id)]) srsUpdate(id, ok);
  if (ok) { const d = dayRec(); d.right++; ST.coins++; d.law = d.law || {}; const lw = lawOfId(id); d.law[lw] = (d.law[lw] || 0) + 1; if (d.right >= GOAL && !d.goal) { d.goal = 1; ST.coins += 20; goalJustHit = true; } }
  save();
}
const isWrong = id => { const r = ST.r[id]; return r && r[1] > 0 && r[3] < 2; };

/* ---------- 工具 ---------- */
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const hash = s => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h); };
const NUMRE = /([零一二三四五六七八九十百千萬兩0-9]+)(個月|小時|日|月|年|人|元|次|歲|公分|分鐘)/g;
function lawOf(u) { return U[u].law; }
function artNoKey(no) { const m = no.match(/第(\d+)(?:-(\d+))?/); return m ? (+m[1]) * 100 + (+(m[2] || 0)) : 0; }
function artLines(law, no) {
  const t = (IDX[law] || {})[no]; if (!t) return [];
  if (/^\(\d+\)/.test(t.trim())) { const p = t.split(/\s*\((\d+)\)/).filter(x => x !== ''); const out = []; for (let i = 0; i < p.length; i += 2) out.push('第' + '一二三四五六七八九十'.charAt(+p[i] - 1) + '項　' + (p[i + 1] || '')); return out; }
  return [t];
}
/* ---------- 螢光筆：重點標色＋註釋 ---------- */
const GL = {}; (D.glossary || []).forEach(g => GL[g.t] = g);
const reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const SUBJ = '最高法院|高等法院|地方法院|檢察總長|檢察事務官|檢察官|司法事務官|司法警察官|司法警察|審判長|受命法官|受託法官|法官|書記官|庭務員|法警|通譯|自訴人|告訴人|被害人|辯護人|輔佐人|代理人|當事人|債權人|債務人|被告|證人|鑑定人|旁聽人|法院(?!組織法)';
const KEYW = '不得|應即|始得|但|除外';
const NEG = '錯誤|不正確|不包括|不屬於|不得為|無須';
const HLRE = new RegExp(`(${Object.keys(GL).sort((a, b) => b.length - a.length).map(reEsc).join('|') || '\\uFFFF'})|([零一二三四五六七八九十百千萬兩0-9]+(?:個月|小時|日|月|年|人|元|次|歲|公分|分鐘))|(${SUBJ})|(${NEG})|(${KEYW})`, 'g');
function hlText(s, stem, inBtn) {
  if (!ST.set.hl) return esc(s);
  let out = '', last = 0; HLRE.lastIndex = 0; let m;
  while ((m = HLRE.exec(s))) {
    out += esc(s.slice(last, m.index)); last = HLRE.lastIndex;
    const v = esc(m[0]);
    if (m[1]) out += (inBtn || !ST.set.notes) ? `<span class="gl-s">${v}</span>` : `<button class="gl" data-t="${v}">${v}</button>`;
    else if (m[2]) out += s[m.index - 1] === '第' ? v : `<span class="hl-n">${v}</span>`;
    else if (m[3]) out += `<span class="hl-s">${v}</span>`;
    else if (m[4]) out += stem ? `<span class="hl-neg">${v}</span>` : v;
    else out += v;
  }
  return out + esc(s.slice(last));
}
function glossOf(...texts) { const all = texts.join(' '); return Object.keys(GL).filter(t => all.includes(t)); }
function notesHTML(terms) {
  if (!terms.length || !ST.set.notes) return '';
  return `<div class="notes"><b>註釋</b>${terms.map(t => { const g = GL[t]; return `<div class="note"><span class="term">${esc(t)}</span>${esc(g.n)}${g.law ? `<span class="muted">（${esc(g.law)} ${esc(g.no)}）</span>` : ''}</div>`; }).join('')}</div>`;
}
let pop = null;
function closePop() { if (pop) { pop.remove(); pop = null; } }
document.addEventListener('click', e => {
  const b = e.target.closest('.gl');
  if (!b) { if (pop && !e.target.closest('.pop')) closePop(); return; }
  e.stopPropagation(); closePop();
  const g = GL[b.dataset.t]; if (!g) return;
  pop = document.createElement('div'); pop.className = 'pop'; pop.setAttribute('role', 'dialog');
  pop.innerHTML = `<b>${esc(g.t)}</b><div>${esc(g.n)}</div>${g.law ? `<div class="muted">${esc(g.law)} ${esc(g.no)}</div>` : ''}`;
  document.body.appendChild(pop);
  const r = b.getBoundingClientRect(), pw = Math.min(320, window.innerWidth - 32);
  pop.style.width = pw + 'px';
  pop.style.left = Math.max(16, Math.min(window.innerWidth - pw - 16, r.left + r.width / 2 - pw / 2)) + 'px';
  const below = r.bottom + 8 + pop.offsetHeight < window.innerHeight;
  pop.style.top = (below ? r.bottom + 8 : r.top - pop.offsetHeight - 8) + window.scrollY + 'px';
}, true);
window.addEventListener('scroll', closePop, { passive: true });

function artHTML(law, no, opt) {
  opt = opt || {};
  const ls = artLines(law, no); if (!ls.length) return '<p class="muted">（查無條文）</p>';
  return ls.map(l => {
    if (opt.holes) return '<p>' + esc(l).replace(NUMRE, '<span class="hole"></span>') + '</p>';
    const f = opt.hl ? (x => hlText(x)) : (opt.nums ? (x => esc(x).replace(NUMRE, '<span class="n-hi">$1$2</span>')) : esc);
    if (opt.quote && l.includes(opt.quote)) { const i = l.indexOf(opt.quote); return '<p>' + f(l.slice(0, i)) + '<mark>' + f(opt.quote) + '</mark>' + f(l.slice(i + opt.quote.length)) + '</p>'; }
    return '<p>' + f(l) + '</p>';
  }).join('');
}
function srcHTML(law, no, quote, extraTexts) {
  const terms = glossOf(quote || '', ...(extraTexts || []));
  return `<div class="src"><div class="h"><b>出處</b><span>${esc(law)} ${esc(no)}</span><span class="tag">依條文改編</span></div>${quote ? `<q>${hlText(quote)}</q>` : ''}${notesHTML(terms)}<button class="more">全文</button><div class="full" hidden>${artHTML(law, no, { quote, hl: true })}</div></div>`;
}
function bindSrc(root) { root.querySelectorAll('.src .more').forEach(b => b.onclick = () => { const f = b.nextElementSibling; f.hidden = !f.hidden; b.textContent = f.hidden ? '全文' : '收起'; }); }

/* ---------- 音效 ---------- */
/* 音效：Web Audio 合成，不需要音檔 */
let ac = null, noiseBuf = null;
function ctx() {
  if (!ac) { ac = new (window.AudioContext || window.webkitAudioContext)(); try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {} }
  if (ac.state !== 'running') { try { ac.resume(); } catch (e) {} }
  return ac;
}
let master = null;
function outNode(a) {
  if (!master) { const comp = a.createDynamicsCompressor(); comp.threshold.value = -20; comp.knee.value = 12; comp.ratio.value = 4; master = a.createGain(); master.gain.value = 2.2; master.connect(comp).connect(a.destination); }
  return master;
}
function tone(seq) {
  if (!ST.set.sound) return;
  try {
    const a = ctx(), t = a.currentTime;
    seq.forEach(([f, d, st, type, vol, f2]) => {
      const o = a.createOscillator(), g = a.createGain();
      o.type = type || 'triangle'; o.frequency.setValueAtTime(f, t + st);
      if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + st + d);
      g.gain.setValueAtTime(0.0001, t + st); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, (vol || 0.18) * ST.set.vol), t + st + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + st + d);
      o.connect(g).connect(outNode(a)); o.start(t + st); o.stop(t + st + d + 0.03);
    });
  } catch (e) {}
}
function noise(d, freq, vol, st) {
  if (!ST.set.sound) return;
  try {
    const a = ctx(), t = a.currentTime + (st || 0);
    if (!noiseBuf) { noiseBuf = a.createBuffer(1, a.sampleRate * 0.5, a.sampleRate); const ch = noiseBuf.getChannelData(0); for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1; }
    const src = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
    src.buffer = noiseBuf; f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = 1.2;
    g.gain.setValueAtTime(Math.max(0.0002, vol * ST.set.vol), t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    src.connect(f).connect(g).connect(outNode(a)); src.start(t); src.stop(t + d + 0.02);
  } catch (e) {}
}
let comboNow = 0;
const semi = n => Math.pow(2, n / 12);
/* 柔和的撥弦音：基音＋八度泛音，快速衰減 */
function pluck(f, st, vol, dur) {
  if (!ST.set.sound) return;
  try {
    const a = ctx(), t = a.currentTime + (st || 0), d = dur || .5, v = Math.max(0.0002, (vol || .14) * ST.set.vol);
    const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2200; lp.Q.value = 0.3; lp.connect(outNode(a));
    [[1, 1], [2, .22]].forEach(([m, k]) => {
      const o = a.createOscillator(), g = a.createGain(); o.type = 'sine'; o.frequency.value = f * m;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v * k, t + .018); g.gain.exponentialRampToValueAtTime(0.0001, t + d / m);
      o.connect(g).connect(lp); o.start(t); o.stop(t + d + .05);
    });
  } catch (e) {}
}
/* 按鈕音「泡泡」：正弦波往上滑音，很短 */
const sTap = () => {
  if (!ST.set.sound) return;
  try {
    const a = ctx(), t = a.currentTime, o = a.createOscillator(), g = a.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(420, t); o.frequency.exponentialRampToValueAtTime(1150, t + .06);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(.0002, .3 * ST.set.vol), t + .006); g.gain.exponentialRampToValueAtTime(.0001, t + .075);
    o.connect(g).connect(outNode(a)); o.start(t); o.stop(t + .1);
  } catch (e) {}
};
function bell(f, st, vol, dur) {
  if (!ST.set.sound) return;
  try {
    const a = ctx(), t = a.currentTime + (st || 0), v = Math.max(0.0002, vol * ST.set.vol);
    [[1, 1, dur], [2.76, .18, dur * .45], [5.4, .06, dur * .25]].forEach(([m, k, d]) => {
      const o = a.createOscillator(), g = a.createGain(); o.type = 'sine'; o.frequency.value = f * m;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v * k, t + .005); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(g).connect(outNode(a)); o.start(t); o.stop(t + d + .05);
    });
  } catch (e) {}
}
const sOk = () => { const k = semi(Math.max(0, Math.min(comboNow - 1, 4)) * 2); bell(784 * k, 0, .28, .9); bell(1175 * k, .11, .26, 1.3); if (comboNow && comboNow % 5 === 0) bell(1568, .26, .16, 1.4); };
const sBad = () => { if (!ST.set.sound) return; try { const a = ctx(), lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 700; lp.connect(outNode(a)); [[233, 0], [196, .13]].forEach(([f, st]) => { const t = a.currentTime + st, o = a.createOscillator(), g = a.createGain(); o.type = 'triangle'; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * .92, t + .12); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(.5 * ST.set.vol, t + .01); g.gain.exponentialRampToValueAtTime(0.0001, t + .14); o.connect(g).connect(lp); o.start(t); o.stop(t + .18); }); } catch (e) {} };
const sStamp = () => { tone([[140, .22, 0, 'sine', .4, 70]]); };
const sCoin = () => { pluck(880, 0, .2, .5); pluck(1175, .08, .18, .7); };
const sFlip = () => noise(.14, 900, .12);
const sPlace = () => pluck(698, 0, .18, .35);
const sWin = () => { [392, 494, 587, 784].forEach((f, i) => pluck(f, i * .1, .24, 1)); };
const buzzSoft = () => {};
/* 朗讀：瀏覽器內建語音 */
const TTS_OK = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
let ttsVoice = null, ttsBtn = null;
function pickVoice() { try { const vs = speechSynthesis.getVoices(); ttsVoice = vs.find(v => /zh[-_]TW/i.test(v.lang)) || vs.find(v => /zh[-_](HK|Hant)/i.test(v.lang)) || vs.find(v => /^zh/i.test(v.lang)) || null; } catch (e) {} }
if (TTS_OK) { pickVoice(); try { speechSynthesis.onvoiceschanged = pickVoice; } catch (e) {} }
const ttsNorm = t => String(t || '').replace(/\(\d+\)/g, '').replace(/第(\d+)-(\d+)條/g, '第$1條之$2').replace(/[「」＿_]/g, '').replace(/\s+/g, ' ');
let ttsTimer = 0, ttsSeq = 0;
function stopSpeak() { clearTimeout(ttsTimer); ttsSeq++; if (!TTS_OK) return; try { speechSynthesis.cancel(); } catch (e) {} if (ttsBtn) ttsBtn.classList.remove('on'); }
/* 延遲朗讀：換題或再朗讀時會取消，舊的不會插進來 */
function speakLater(get, btnId, ms) { clearTimeout(ttsTimer); const seq = ttsSeq; ttsTimer = setTimeout(() => { if (seq === ttsSeq) speak(get(), document.getElementById(btnId)); }, ms); }
function speak(text, btn) {
  if (!TTS_OK || !text) return;
  const busy = speechSynthesis.speaking || speechSynthesis.pending; stopSpeak();
  const seq = ttsSeq;
  // iOS 剛取消就馬上念會念壞，停一下再念
  if (busy) { ttsTimer = setTimeout(() => { if (seq === ttsSeq) say(text, btn); }, 120); return; }
  say(text, btn);
}
function say(text, btn) {
  try {
    const u = new SpeechSynthesisUtterance(ttsNorm(text));
    u.lang = ttsVoice ? ttsVoice.lang : 'zh-TW'; if (ttsVoice) u.voice = ttsVoice; u.rate = ST.set.ttsRate || 1;
    ttsBtn = btn || null; if (ttsBtn) ttsBtn.classList.add('on');
    u.onend = u.onerror = () => { if (ttsBtn === btn && btn) btn.classList.remove('on'); };
    speechSynthesis.speak(u);
  } catch (e) {}
}
const SPEAKER = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" stroke="none"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>';
const buzz = ms => { if (!ST.set.vib) return; try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} };
document.addEventListener('pointerdown', e => { if (e.target.closest('.btn,.opt,.tile,.start,.tfb,.pc,.mi,.chip,.mode,.tabs a,.seg a,.slot,.charcard,.icon-btn,.seqpool button,.go,.mtab,.side,.fbtn,.sw')) sTap(); }, true);
const GEAR = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.4 13a7.6 7.6 0 0 0 0-2l2.1-1.6-2-3.5-2.5 1a7.3 7.3 0 0 0-1.7-1L15 3.3h-4l-.4 2.6a7.3 7.3 0 0 0-1.7 1l-2.5-1-2 3.5L6.6 11a7.6 7.6 0 0 0 0 2l-2.1 1.6 2 3.5 2.5-1a7.3 7.3 0 0 0 1.7 1l.4 2.6h4l.4-2.6a7.3 7.3 0 0 0 1.7-1l2.5 1 2-3.5zM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z" transform="translate(-1 0)"/></svg>';
function applyAnim() { document.body.classList.toggle('noanim', !ST.set.anim); }
applyAnim();
document.getElementById('setBtn').innerHTML = GEAR;
document.getElementById('setBtn').onclick = () => openSettings();
document.getElementById('logo').innerHTML = CHARS.svg('turtle', 'idle', { cls: 'logochr', head: true });
function openSettings() {
  closePop();
  const old = document.getElementById('sheet'); if (old) old.remove();
  const sw = (k, label, sub) => `<label class="srow"><span><b>${label}</b>${sub ? `<small>${sub}</small>` : ''}</span><input type="checkbox" class="sw" data-k="${k}" ${ST.set[k] ? 'checked' : ''}></label>`;
  const el = document.createElement('div'); el.id = 'sheet'; el.className = 'sheet-wrap';
  el.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-label="設定"><div class="grab"></div><div class="shead"><span></span><h2>設定</h2><button class="sdone" id="sclose">完成</button></div>
    <div class="sgroup">${sw('sound', '音效')}<label class="srow vol ${ST.set.sound ? '' : 'off'}"><span><b>音量</b></span><input type="range" id="vol" min="0" max="1" step="0.05" value="${ST.set.vol}"></label>${sw('vib', '震動', '答錯時手機震一下')}${sw('anim', '動畫', '角色動作、紙花、滑入效果')}</div>
    <div class="sgroup">${sw('hl', '螢光筆標色', '數字、主體、例外字上色')}${sw('notes', '註釋', '專有名詞可以點開解釋')}</div>
    ${TTS_OK ? `<div class="sgroup">${sw('tts', '自動朗讀', '題目出現時念題目，答完念條文')}<label class="srow"><span><b>語速</b></span><input type="range" id="ttsRate" min="0.6" max="1.6" step="0.1" value="${ST.set.ttsRate || 1}"></label></div>` : ''}
    </div>`;
  document.body.appendChild(el);
  const close = () => { el.classList.add('out'); setTimeout(() => el.remove(), 200); if (!document.body.classList.contains('playing')) route(); };
  el.addEventListener('click', e => { if (e.target === el) close(); });
  document.getElementById('sclose').onclick = close;
  el.querySelectorAll('.sw').forEach(c => c.onchange = () => { ST.set[c.dataset.k] = c.checked; save(); applyAnim(); el.querySelector('.vol').classList.toggle('off', !ST.set.sound); if (c.dataset.k === 'sound' && c.checked) sOk(); });
    const tr = document.getElementById('ttsRate'); if (tr) { tr.oninput = () => { ST.set.ttsRate = +tr.value; save(); }; tr.onchange = () => speak('每日目標三十題'); }
  const v = document.getElementById('vol'); v.oninput = () => { ST.set.vol = +v.value; save(); }; v.onchange = () => sOk();
}

/* ---------- 印章 ---------- */
function stampSVG(text, seed, cls) {
  const rot = (hash(seed) % 30) - 15;
  const ta = 'fill="currentColor" font-weight="900" text-anchor="middle" style="font-family:var(--f-stamp)"';
  const t = text.length === 2 ? `<text x="50" y="47" font-size="27" ${ta}>${esc(text[0])}</text><text x="50" y="76" font-size="27" ${ta}>${esc(text[1])}</text>` : `<text x="50" y="60" font-size="22" ${ta}>${esc(text)}</text>`;
  return `<svg class="${cls || 'stamp'}" viewBox="0 0 100 100" style="transform:rotate(${rot}deg)" aria-hidden="true"><g filter="url(#ink)"><circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" stroke-width="5"/><circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" stroke-width="1.6"/>${t}</g></svg>`;
}
function starsHTML(n) { return `<div class="stars">${[1, 2, 3].map(i => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}</div>`; }

/* ---------- 路由 ---------- */
let cleanup = null;
function setTab(v) {
  document.querySelectorAll('.tabs a').forEach(a => a.classList.toggle('on', a.dataset.v === v || (v === 'wrong' && a.dataset.v === 'modes') || ((v === 'numbers' || v === 'laws') && a.dataset.v === 'lookup')));
  const n = dueIds().length, a = document.querySelector('.tabs a[data-v="home"]'); let d = a && a.querySelector('.dot');
  if (!a) return;
  if (n) { if (!d) { d = document.createElement('span'); d.className = 'dot'; a.appendChild(d); } d.textContent = n > 99 ? '99+' : n; } else if (d) d.remove();
}
function reset() { stopSpeak(); if (cleanup) { cleanup(); cleanup = null; } closePop(); document.querySelectorAll('.dock').forEach(d => d.remove()); document.body.classList.remove('playing'); window.scrollTo(0, 0); }
function route() {
  reset();
  const h = (location.hash || '#home').slice(1);
  const views = { home: vHome, map: vMap, modes: vModes, chars: vChars, lookup: vNumbers, wrong: vWrong, numbers: vNumbers, laws: vLaws };
  const v = views[h] ? h : 'home';
  setTab(v);
  views[v]();
}
window.addEventListener('hashchange', route);
document.querySelectorAll('.tabs a').forEach(a => a.addEventListener('click', e => { if (location.hash === a.getAttribute('href')) { e.preventDefault(); route(); } }));
function goTab(v) { if (location.hash === '#' + v) route(); else location.hash = '#' + v; }
function dock(html) { const d = document.createElement('div'); d.className = 'dock'; d.innerHTML = `<div class="in">${html}</div>`; document.body.appendChild(d); return d; }

/* ---------- 紙花 ---------- */
function confetti(el, n) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const r = el.getBoundingClientRect(), box = document.createElement('div'); box.className = 'confetti';
  box.style.left = (r.left + r.width / 2) + 'px'; box.style.top = (r.top + r.height / 2 + window.scrollY) + 'px';
  const cols = ['var(--verm)', 'var(--indigo)', 'var(--gold)', 'var(--ok)'];
  for (let i = 0; i < n; i++) { const p = document.createElement('i'); const a = Math.random() * Math.PI * 2, d = 40 + Math.random() * 70; p.style.setProperty('--x', Math.cos(a) * d + 'px'); p.style.setProperty('--y', (Math.sin(a) * d - 30) + 'px'); p.style.setProperty('--r', (Math.random() * 540 - 270) + 'deg'); p.style.background = cols[i % 4]; p.style.animationDelay = (Math.random() * 60) + 'ms'; box.appendChild(p); }
  document.body.appendChild(box); setTimeout(() => box.remove(), 1000);
}

/* ========== 今日學習 ========== */
const ROUND = 15;
function buildSession() {
  const now = Date.now(), inMode = id => ST.mode === 'all' || lawOfId(id) === ST.mode;
  const due = Object.keys(ST.srs).filter(id => ST.srs[id].due <= now && (Q[id] || Z[id] || O[id]) && inMode(id)).sort((a, b) => ST.srs[a].due - ST.srs[b].due).slice(0, 8).map(id => ({ t: typeOf(id), id }));
  const fresh = [];
  for (const lv of LV) { if (ST.mode !== 'all' && lawOf(lv.unit) !== ST.mode) continue; for (const [t, id] of lv.items) { if (fresh.length >= ROUND) break; if (!ST.r[id] && !fresh.some(x => x.id === id)) fresh.push({ t, id }); } if (fresh.length >= ROUND) break; }
  const out = []; let a = 0, b = 0;
  while (out.length < ROUND && (a < due.length || b < fresh.length)) { if (a < due.length && (out.length % 2 === 0 || b >= fresh.length)) out.push(due[a++]); else if (b < fresh.length) out.push(fresh[b++]); }
  if (out.length < ROUND) { const weak = shuffle(D.questions.filter(q => inMode(q.id) && !out.some(x => x.id === q.id))).slice(0, ROUND - out.length).map(q => ({ t: 'q', id: q.id })); out.push(...weak); }
  return out;
}
function startSession() { reset(); goalJustHit = false; runItems(buildSession(), { session: true, back: () => goTab('home') }); }
const COIN = '<svg class="ic" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="var(--verm)" stroke-width="2.6"/><circle cx="12" cy="12" r="5.5" fill="none" stroke="var(--verm)" stroke-width="1.4"/></svg>';
const FLAME = '<svg class="ic" viewBox="0 0 24 24"><path d="M12 2c1 4 5 5.5 5 11a5 5 0 0 1-10 0c0-2.5 1.2-4 2.2-5 .3 1.7 1 2.6 2 3-.6-3.4.4-6.5.8-9z" fill="#F08A24"/><path d="M12 13c.6 1.5 2.4 2 2.4 4a2.4 2.4 0 0 1-4.8 0c0-1.3.9-2.3 2.4-4z" fill="#FFD23F"/></svg>';
const MODES = [
  { k: 'all', t: '綜合學習', tab: '綜合', c: 'var(--indigo)' },
  { k: 'org', t: '法院組織法', tab: '法組', c: 'var(--c-org)' },
  { k: 'civ', t: '民事訴訟法', tab: '民訴', c: 'var(--c-civ)' },
  { k: 'crim', t: '刑事訴訟法', tab: '刑訴', c: 'var(--c-crim)' },
];
const dkey = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
function weekDays() { const d = new Date(); const dow = (d.getDay() + 6) % 7; d.setDate(d.getDate() - dow); return [...Array(7)].map((_, i) => { const x = new Date(d); x.setDate(d.getDate() + i); return dkey(x); }); }
function gauge(p) {
  const r = 44, c = 2 * Math.PI * r, arc = c * 0.75, v = Math.min(1, p);
  return `<svg class="gauge" viewBox="0 0 110 110"><circle cx="55" cy="55" r="${r}" fill="none" stroke="var(--faint)" stroke-width="9" stroke-linecap="round" stroke-dasharray="${arc} ${c}" transform="rotate(135 55 55)"/><circle cx="55" cy="55" r="${r}" fill="none" stroke="var(--indigo)" stroke-width="9" stroke-linecap="round" stroke-dasharray="${arc * v} ${c}" transform="rotate(135 55 55)"/><text x="55" y="62" text-anchor="middle" font-size="25" font-weight="900" fill="currentColor">${Math.round(v * 100)}<tspan font-size="12" dx="1">%</tspan></text></svg>`;
}
function vHome() {
  const d = ST.days[today()] || { right: 0 }, wk = weekDays(), tk = today(), st = streak();
  const m = MODES.find(x => x.k === ST.mode) || MODES[0];
  const hit = d.right >= GOAL;
  const allR = Object.values(ST.r).reduce((a, r) => [a[0] + r[0], a[1] + r[1]], [0, 0]);
  const acc = allR[0] + allR[1] ? Math.round(allR[0] / (allR[0] + allR[1]) * 100) : null;
  const wkDone = wk.every(k => (ST.days[k] || {}).rounds);
  const days7 = [...Array(7)].map((_, i) => { const x = new Date(); x.setDate(x.getDate() - 6 + i); return { k: dkey(x), w: '日一二三四五六'[x.getDay()], v: (ST.days[dkey(x)] || {}).law || {} }; });
  const max = Math.max(10, ...days7.map(x => (x.v.org || 0) + (x.v.civ || 0) + (x.v.crim || 0)));
  $app.innerHTML = `
  <section class="streakcard">
    <span class="bigflame">${FLAME}</span>
    <div class="sc-main"><div class="sc-t">連續學習 <b class="num">${st}</b> 天</div>
      <div class="week">${wk.map((k, i) => { const on = (ST.days[k] || {}).rounds; const isT = k === tk; if (i === 6 && !on) return `<span class="wd gift ${isT ? 'today' : ''}">${GIFT}</span>`; return `<span class="wd ${on ? 'on' : ''} ${isT ? 'today' : ''}">${on ? stampSVG('讀', k, 'wstamp') : '一二三四五六日'[i]}</span>`; }).join('')}</div>
    </div>
  </section>
  <section class="maincard" style="--mc:${m.c}">
    ${hit ? `<span class="ribbon">${TROPHY}</span>` : ''}
    <div class="mtabs">${MODES.map(x => `<button class="mtab ${x.k === ST.mode ? 'on' : ''}" data-m="${x.k}" style="--tc:${x.c}">${x.tab}</button>`).join('')}<button class="mtab gear" id="mset" aria-label="設定">${GEAR}</button></div>
    <div class="mc-in">
      <button class="hero-chr" id="hc" aria-label="${esc((CHARS.list.find(c => c.id === ST.chr) || {}).name || '')}">${CHARS.svg(ST.chr, 'idle')}</button>
      ${acc !== null ? `<a class="acc" href="#wrong">答對率 ${acc}% ›</a>` : ''}
      <div class="mc-row"><div><h2>${m.t}</h2><div class="goal">每日目標 <b class="num">${GOAL}</b> 題 <button class="goaledit" id="goalEdit" aria-label="修改每日目標"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg></button></div></div>${gauge(d.right / GOAL)}</div>
      <button class="start" id="st">${hit ? '★ 額外學習' : '開始學習'}</button>
    </div>
  </section>
  <section class="infocard"><a class="ic-h" href="#map"><h2>學習資訊</h2><span>›</span></a>
    <div class="legend"><span style="--c:var(--c-org)">法組</span><span style="--c:var(--c-civ)">民訴</span><span style="--c:var(--c-crim)">刑訴</span></div>
    <div class="bars7">${days7.map(x => `<div class="b7"><div class="stack">${['crim', 'civ', 'org'].map(k => x.v[k] ? `<i style="height:${x.v[k] / max * 100}%;background:var(--c-${k})"></i>` : '').join('')}</div><span>${x.w}</span></div>`).join('')}</div>
  </section>`;
  if (wkDone && !ST.gifts[wk[0]]) { ST.gifts[wk[0]] = 1; ST.coins += 50; save(); setTimeout(() => { sCoin(); confetti(document.querySelector('.week'), 24); }, 300); }
  document.getElementById('st').onclick = startSession;
  $app.querySelectorAll('.mtab[data-m]').forEach(b => b.onclick = () => { ST.mode = b.dataset.m; save(); vHome(); });
  document.getElementById('mset').onclick = openSettings;
  document.getElementById('goalEdit').onclick = () => { const opts = [20, 30, 50, 80]; ST.goal = opts[(opts.indexOf(ST.goal) + 1) % opts.length]; GOAL = ST.goal; const dd = ST.days[today()]; if (dd && dd.goal && dd.right < GOAL) dd.goal = 0; save(); vHome(); };
  const hc = document.getElementById('hc');
  hc.onclick = () => { hc.innerHTML = CHARS.svg(ST.chr, 'happy'); hc.classList.remove('jump'); void hc.offsetWidth; hc.classList.add('jump'); pluck(523, 0, .1, .5); pluck(659, .09, .1, .6); setTimeout(() => { hc.innerHTML = CHARS.svg(ST.chr, 'idle'); }, 900); };
}
const GIFT = '<svg viewBox="0 0 24 24"><rect x="3.5" y="9" width="17" height="11.5" rx="2" fill="#F2994A"/><rect x="2.5" y="7" width="19" height="4.5" rx="1.5" fill="#F7B267"/><rect x="10.8" y="7" width="2.4" height="13.5" fill="#FFE08A"/><path d="M12 7c-2-4-6-3-4.5-.5M12 7c2-4 6-3 4.5-.5" fill="none" stroke="#FFE08A" stroke-width="2" stroke-linecap="round"/></svg>';
const TROPHY = '<svg viewBox="0 0 24 24"><path d="M7 4h10v5a5 5 0 0 1-10 0z" fill="#fff"/><path d="M7 6H4a3 3 0 0 0 3.5 4M17 6h3a3 3 0 0 1-3.5 4" fill="none" stroke="#fff" stroke-width="1.8"/><rect x="10.6" y="13.5" width="2.8" height="3.5" fill="#fff"/><rect x="8" y="17" width="8" height="3" rx="1" fill="#fff"/></svg>';
function answerHTML(quote, extra) {
  const terms = glossOf(quote || '', ...(extra || []));
  return `<div class="ans"><q>${hlText(quote || '')}</q>${notesHTML(terms)}</div>`;
}
function sessionEnd(S, opt) {
  const d = dayRec(); d.rounds++; ST.coins += 5; save(); setTimeout(sCoin, 450);
  const hit = goalJustHit; goalJustHit = false;
  sWin(); setTab('');
  $app.innerHTML = `<div class="end">
    <div class="endchr jump">${CHARS.svg(ST.chr, 'happy')}</div>
    <div class="score">${S.right}<small> / ${S.answered}</small></div>
    <div class="gain">${COIN}<b>+${S.right + 5}${hit ? ' +20' : ''}</b></div>
    ${gauge(d.right / GOAL)}
    ${hit ? `<span class="ribbon big pop">${TROPHY}</span>` : ''}
  </div>
  <div class="btns"><button class="btn" id="again">再一輪</button><button class="btn ghost" id="home">首頁</button></div>`;
  if (hit) setTimeout(() => { sStamp(); sWin(); }, 400);
  document.getElementById('again').onclick = startSession;
  document.getElementById('home').onclick = () => goTab('home');
}

/* ========== 角色 ========== */
function vChars() {
  $app.innerHTML = `<div class="chead"><h1>角色</h1><span class="pill">${COIN}<b class="num">${ST.coins}</b></span></div><div class="chargrid">${CHARS.list.map(c => {
    const own = ST.owned.includes(c.id), on = ST.chr === c.id, can = ST.coins >= c.price;
    return `<button class="charcard ${on ? 'on' : ''} ${own ? '' : 'locked'}" data-c="${c.id}">${CHARS.svg(c.id, on ? 'happy' : 'idle')}<b>${esc(c.name)}</b><span class="rl">${esc(c.role)}</span>${own ? (on ? '<span class="tagon">使用中</span>' : '<span class="tagbuy own">使用</span>') : `<span class="tagbuy ${can ? '' : 'no'}">${COIN}${c.price}</span>`}</button>`;
  }).join('')}</div>`;
  $app.querySelectorAll('.charcard').forEach(b => b.onclick = () => {
    const c = CHARS.list.find(x => x.id === b.dataset.c);
    if (ST.owned.includes(c.id)) { ST.chr = c.id; save(); pluck(587, 0, .1, .5); vChars(); return; }
    if (ST.coins >= c.price) { ST.coins -= c.price; ST.owned.push(c.id); ST.chr = c.id; save(); sCoin(); setTimeout(sWin, 150); vChars(); const nc = $app.querySelector(`.charcard[data-c="${c.id}"]`); nc && confetti(nc, 24); const n = $app.querySelector(`.charcard[data-c="${c.id}"]`); n && n.classList.add('jump'); return; }
    b.classList.add('shake'); sBad(); setTimeout(() => b.classList.remove('shake'), 400);
  });
}
function lookupSeg(v) { return `<div class="seg"><a href="#numbers" class="${v === 'numbers' ? 'on' : ''}">數字表</a><a href="#laws" class="${v === 'laws' ? 'on' : ''}">條文</a></div>`; }

/* ========== 集章冊 ========== */
const unlocked = i => i === 0 || !!ST.lv[LV[i - 1].id];
function curIndex() { for (let i = 0; i < LV.length; i++) if (!ST.lv[LV[i].id]) return i; return -1; }
function vMap() {
  const done = LV.filter(l => ST.lv[l.id]).length;
  const pct = k => { const ls = LV.filter(l => lawOf(l.unit) === k); return ls.length ? Math.round(ls.filter(l => ST.lv[l.id]).length / ls.length * 100) : 0; };
  const ci = curIndex(), cur = ci >= 0 ? LV[ci] : null;
  let h = `<section class="hero"><div class="count">${done}<small> / ${LV.length}</small></div><div class="bars">${['org', 'civ', 'crim'].map(k => `<div class="bar-row"><span>${SHORT3[k]}</span><span class="track"><i style="width:${pct(k)}%"></i></span><span class="num muted">${pct(k)}%</span></div>`).join('')}</div></section>`;
  if (cur) h += `<button class="go" id="go"><span class="mini">${esc(cur.stamp)}</span><div><b>${done ? '繼續學習' : '開始學習'}</b><span>${esc(U[cur.unit].title)}${cur.of > 1 ? ' ' + cur.n + '/' + cur.of : ''}</span></div></button>`;
  D.stages.forEach(([k, t, ids]) => {
    const ls = LV.filter(l => ids.includes(l.unit)); if (!ls.length) return;
    const dn = ls.filter(l => ST.lv[l.id]).length;
    h += `<section class="book"><header><span class="k">${k}</span><h2>${t}</h2><span class="c">${dn}/${ls.length}</span></header><div class="slots">` +
      ls.map(l => {
        const i = LVI[l.id], rec = ST.lv[l.id], st = rec ? 'done' : (i === ci ? 'cur' : (unlocked(i) ? 'open' : 'lock'));
        const inner = rec ? stampSVG(l.stamp, l.id) : (st === 'cur' || st === 'open' ? `<b>${esc(l.stamp)}</b>` : '');
        return `<button class="slot ${st}" data-l="${l.id}" ${st === 'lock' ? 'disabled aria-disabled="true"' : ''} aria-label="${esc(U[l.unit].title)} ${l.n}"><span class="ring">${inner}</span>${starsHTML(rec ? rec.s : 0)}<span class="lbl">${esc(U[l.unit].title)}${l.of > 1 ? ' ' + l.n : ''}</span></button>`;
      }).join('') + `</div></section>`;
  });
  $app.innerHTML = h;
  const g = document.getElementById('go'); if (g) g.onclick = () => playLevel(cur.id);
  $app.querySelectorAll('.slot:not(.lock)').forEach(b => b.onclick = () => playLevel(b.dataset.l));
  if (cur) { const c = $app.querySelector('.slot.cur'); c && setTimeout(() => c.scrollIntoView({ block: 'center', behavior: 'smooth' }), 400); }
}

/* ========== 關卡 ========== */
function playLevel(id) {
  reset(); document.body.classList.add('playing');
  const lv = LV[LVI[id]];
  readCards(lv.arts.map(([law, no]) => ({ law, no })), {
    back: () => goTab('map'),
    done: () => runItems(lv.items.map(([t, i]) => ({ t, id: i })), { level: lv, back: () => goTab('map') })
  });
}

/* ---------- 條文卡 ---------- */
function readCards(cards, opt) {
  let i = 0; const again = [];
  const draw = () => {
    window.scrollTo(0, 0);
    const c = cards[i];
    $app.innerHTML = `<div class="ph"><button class="icon-btn" id="x" aria-label="離開">${XICON}</button><span class="track"><i style="width:${i / cards.length * 100}%"></i></span><span class="meta num">${i + 1}/${cards.length}</span></div>
    <div class="cardstage"><div class="fcard" id="fc" role="button" tabindex="0" aria-label="翻面">
      <div class="face front"><div class="meta"><span class="lawtag">${LAWS_SHORT[c.law] || ''}</span>${esc(c.law)}</div><div class="no">${esc(c.no)}</div><div class="tx">${artHTML(c.law, c.no, { holes: true })}</div></div>
      <div class="face back"><div class="meta"><span class="lawtag">${LAWS_SHORT[c.law] || ''}</span>${esc(c.law)}</div><div class="no">${esc(c.no)}</div><div class="tx">${artHTML(c.law, c.no, { hl: true })}</div></div>
    </div></div>
    <div class="dots">${cards.map((_, k) => `<i class="${k <= i ? 'on' : ''}"></i>`).join('')}</div>`;
    const fc = document.getElementById('fc');
    const fit = () => { const fs = fc.querySelectorAll('.face'); let hmax = 0; fs.forEach(f => { f.style.position = 'relative'; hmax = Math.max(hmax, f.scrollHeight); f.style.position = ''; }); fc.style.minHeight = Math.max(300, hmax) + 'px'; };
    fit();
    const flip = () => { sFlip(); fc.classList.toggle('flip'); nx.disabled = false; nx.classList.remove('ghost'); };
    fc.onclick = flip; fc.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } };
    document.getElementById('x').onclick = opt.back;
    document.querySelectorAll('.dock').forEach(d => d.remove());
    const last = i === cards.length - 1;
    dock(`${opt.repeat ? '<button class="btn ghost" id="ag">再看一次</button>' : (i > 0 ? '<button class="btn ghost" id="pv">上一張</button>' : '')}<button class="btn ${fc.classList.contains('flip') ? '' : 'ghost'}" id="nx">${last ? (opt.doneLabel || '挑戰') : (opt.repeat ? '記住了' : '下一張')}</button>`);
    const nx = document.getElementById('nx');
    nx.onclick = () => { if (last && !again.length) { document.querySelectorAll('.dock').forEach(d => d.remove()); opt.done(); } else { if (last) { cards = cards.concat(again.splice(0)); } i++; draw(); } };
    const pv = document.getElementById('pv'); if (pv) pv.onclick = () => { i--; draw(); };
    const ag = document.getElementById('ag'); if (ag) ag.onclick = () => { again.push(c); if (last) { cards = cards.concat(again.splice(0)); } i++; draw(); };
  };
  draw();
}

/* ---------- 題目執行器 ---------- */
const XICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
function lawOfId(id) {
  const u = Q[id] ? Q[id].unit : Z[id] ? Z[id].unit : O[id] ? O[id].unit : T[id] ? T[id].unit : SQ[id] ? SQ[id].unit : (id.split('-')[0]);
  return U[u] ? U[u].law : 'org';
}
const LAWTAB = { org: '法組', civ: '民訴', crim: '刑訴' };
function runItems(items, opt) {
  if (cleanup) { cleanup(); cleanup = null; }
  document.body.classList.add('playing');
  const S = { i: 0, right: 0, combo: 0, best: 0, answered: 0, done: false, reveal: null };
  const pending = [];
  S.hist = []; let viewIdx = null;
  function snap() { const f = document.querySelector('.qfoot'); S.hist[S.i] = { app: $app.innerHTML, foot: f ? f.innerHTML : '', sayA: S.sayA }; }
  function bindStatic(sayA, live) {
    const x = document.getElementById('x'); if (x) x.onclick = opt.back;
    const qs = document.getElementById('qset'); if (qs) qs.onclick = openSettings;
    const sp = document.getElementById('qsp'); if (sp) sp.onclick = () => { if (sp.classList.contains('on')) { stopSpeak(); return; } speak(sayA, sp); };
    const pk = document.getElementById('peek'); if (pk) { pk.disabled = false; pk.onclick = () => { const f = document.getElementById('full'); if (f) { f.hidden = !f.hidden; if (!f.hidden) f.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } }; }
    const nb = document.querySelector('.qfoot .nextbtn'); if (nb) nb.onclick = () => live ? slide(1, () => { viewIdx = null; next(); }) : nav(1);
    const orb = document.getElementById('orb'); if (orb) { orb.disabled = !live; orb.onclick = live ? (() => { viewIdx = null; next(); }) : null; }
    bindSrc($app);
  }
  function showHist(i) {
    const h = S.hist[i]; if (!h) return false;
    stopSpeak(); window.scrollTo(0, 0); closePop();
    $app.innerHTML = h.app; $app.classList.add('static');
    document.querySelectorAll('.dock').forEach(d => d.remove());
    const d = document.createElement('div'); d.className = 'dock qfoot static'; d.innerHTML = h.foot; document.body.appendChild(d);
    const live = i === S.i;
    if (!live) { const nb = d.querySelector('.nextbtn span'); if (nb) nb.textContent = '下一題'; }
    bindStatic(h.sayA, live);
    return true;
  }
  function toast(msg) {
    document.querySelectorAll('.toast').forEach(t => t.remove());
    const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t);
    setTimeout(() => t.classList.add('out'), 1100); setTimeout(() => t.remove(), 1500);
  }
  /* 換題動畫：舊卡往外滑出，新卡從另一側滑進來 */
  let sliding = false;
  const W = () => Math.max(320, window.innerWidth);
  function slide(dir, fn) {
    if (sliding) return; const c = qcardEl();
    if (!c || matchMedia('(prefers-reduced-motion: reduce)').matches) { fn(); return; }
    sliding = true;
    const cur = new DOMMatrix(getComputedStyle(c).transform).m41 || 0, out = -dir * (W() + 40);
    const ms = Math.max(110, Math.min(220, Math.abs(out - cur) / W() * 220));
    c.style.transition = `transform ${ms}ms cubic-bezier(.4,0,1,1), opacity ${ms}ms`; c.style.transform = `translateX(${out}px) rotate(${-dir * 4}deg)`; c.style.opacity = '0';
    setTimeout(() => {
      fn(); sliding = false;
      const n = qcardEl(); if (!n) return;
      n.style.transition = 'none'; n.style.transform = `translateX(${dir * W() * .6}px)`; n.style.opacity = '0'; void n.offsetWidth;
      n.style.transition = 'transform .34s cubic-bezier(.2,.9,.25,1.05), opacity .2s'; n.style.transform = ''; n.style.opacity = '';
      setTimeout(() => { if (n.isConnected) { n.style.transition = ''; } }, 380);
    }, ms);
  }
  function bounce() { const c = qcardEl(); if (!c) return; c.style.transition = 'transform .45s cubic-bezier(.3,1.6,.5,1)'; c.style.transform = ''; }
  function canNav(dir) {
    if (dir > 0) return viewIdx !== null || S.done;
    const cur = viewIdx === null ? S.i : viewIdx; return cur > 0 && !!S.hist[cur - 1];
  }
  function nav(dir) {
    if (!document.querySelector('.qcard') || sliding) return;
    if (!canNav(dir)) {
      bounce();
      const c = qcardEl(); setTimeout(() => { c.style.transition = ''; c.classList.remove('shake'); void c.offsetWidth; c.classList.add('shake'); }, 60);
      if (dir > 0) { toast('還沒作答'); buzz(40); pluck(392, 0, .12, .25); }
      return;
    }
    slide(dir, () => {
      if (dir > 0) {
        if (viewIdx !== null) {
          viewIdx++;
          if (viewIdx >= S.i) { viewIdx = null; $app.classList.remove('static'); if (!(S.done && showHist(S.i))) draw(); }
          else showHist(viewIdx);
        } else next();
      } else { const cur = viewIdx === null ? S.i : viewIdx; viewIdx = cur - 1; showHist(viewIdx); }
    });
  }
  let tx = null, ty = null, lx = 0, ly = 0, horiz = null, t0 = 0, okDir = 0;
  const qcardEl = () => document.querySelector('.qslide') || document.querySelector('.qcard');
  const tStart = e => { if (sliding || e.touches.length > 1 || e.target.closest('.tfcard,.sheet-wrap,input,.toast,.lawbox')) { tx = null; return; } const p = e.touches[0]; tx = lx = p.clientX; ty = ly = p.clientY; horiz = null; t0 = Date.now(); };
  const tMove = e => {
    if (tx === null) return; const p = e.touches[0]; lx = p.clientX; ly = p.clientY;
    const dx = lx - tx, dy = ly - ty;
    if (horiz === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) horiz = Math.abs(dx) > Math.abs(dy);
    if (horiz) {
      const c = qcardEl(); if (!c) return;
      const dir = dx < 0 ? 1 : -1, ok = canNav(dir);
      // 能換題就跟手，不能換就越拉越緊
      const x = ok ? dx : Math.sign(dx) * 40 * (1 - Math.exp(-Math.abs(dx) / 90));
      c.style.transition = 'none'; c.style.transform = `translateX(${x}px) rotate(${ok ? x / W() * 6 : 0}deg)`;
    }
  };
  const tEnd = () => {
    if (tx === null) return; const dx = lx - tx, dy = ly - ty, dt = Date.now() - t0; tx = null;
    if (!horiz) return;
    const fast = dt < 260 && Math.abs(dx) > 30;
    if ((Math.abs(dx) > Math.min(90, W() * .22) || fast) && Math.abs(dx) > Math.abs(dy) * 1.2) nav(dx < 0 ? 1 : -1);
    else bounce();
  };
  const kd = e => { if (document.getElementById('sheet') || !document.querySelector('.qcard') || document.querySelector('.tfcard')) return; if (e.key === 'ArrowRight') nav(1); else if (e.key === 'ArrowLeft') nav(-1); };
  document.addEventListener('touchstart', tStart, { passive: true }); document.addEventListener('touchmove', tMove, { passive: true }); document.addEventListener('touchend', tEnd, { passive: true }); document.addEventListener('touchcancel', tEnd, { passive: true }); document.addEventListener('keydown', kd);
  cleanup = () => { document.removeEventListener('touchstart', tStart); document.removeEventListener('touchmove', tMove); document.removeEventListener('touchend', tEnd); document.removeEventListener('touchcancel', tEnd); document.removeEventListener('keydown', kd); $app.classList.remove('static'); };
  const next = () => {
    if (!S.done) return; stopSpeak(); viewIdx = null; document.querySelectorAll('.dock').forEach(d => d.remove()); S.i++;
    const now = Date.now(), ready = pending.filter(p => p.at <= now);
    ready.forEach(p => { pending.splice(pending.indexOf(p), 1); items.splice(S.i, 0, p.it); });
    if (S.i >= items.length && pending.length) { pending.sort((a, b) => a.at - b.at); items.push(...pending.splice(0).map(p => p.it)); }
    S.i < items.length ? draw() : finish();
  };
  const top = () => {
    const tot = items.length + pending.length, pct = S.i / tot * 100;
    return `<div class="qtop"><button class="icon-btn" id="x" aria-label="離開"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg></button>
      <div class="qbar"><span class="qflame ${S.combo > 1 ? 'hot' : ''}" id="qf">${S.combo > 1 ? `<b>${S.combo}</b>` : FLAME}</span><span class="qtrack"><i style="width:${pct}%"></i><em class="num">${S.i}/${tot}</em></span><span class="qstar">★</span></div>
      <button class="icon-btn" id="qset" aria-label="設定">${GEAR}</button></div>`;
  };
  const card = (it, tab, body) => {
    const fresh = !ST.r[it.id];
    return top() + `<section class="qcard"><span class="qtab">${esc(tab)}</span><span class="qbadge ${fresh ? 'new' : 'rev'}">${fresh ? 'New' : '複習'}</span><div class="qbody">${body}</div>${TTS_OK ? `<button class="qspeak" id="qsp" aria-label="朗讀">${SPEAKER}</button>` : ''}<div class="qsrc" id="qs"></div></section>`;
  };
  function foot() {
    const d = document.createElement('div'); d.className = 'dock qfoot';
    d.innerHTML = `<div class="in"><button class="fbtn ghost" id="peek"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5 5 11-11"/></svg><span>查看答案</span></button><button class="fbtn primary" id="art" hidden></button></div>`;
    document.body.appendChild(d);
    document.getElementById('peek').onclick = () => { if (!S.done && S.reveal) S.reveal(); };
  }
  function result(ok, src) {
    if (S.done) return; S.done = true;
    const it = items[S.i];
    mark(it.id, ok); S.answered++;
    if (ok) { S.right++; S.combo++; S.best = Math.max(S.best, S.combo); comboNow = S.combo; sOk(); } else { S.combo = 0; comboNow = 0; sBad(); buzz(120); }
    if (!ok && opt.session && (it.retry || 0) < 2) pending.push({ at: Date.now() + retryMs(), it: { t: it.t, id: it.id, retry: (it.retry || 0) + 1 } });
    const qf = document.getElementById('qf'); if (qf) { qf.className = 'qflame' + (S.combo > 1 ? ' hot pop' : ''); qf.innerHTML = S.combo > 1 ? `<b>${S.combo}</b>` : FLAME; }
    const orb = document.getElementById('orb'), mc = document.getElementById('mc');
    if (ok) { const qc = document.querySelector('.qcard'); if (qc) confetti(qc, S.combo >= 5 ? 22 : 12); }
    const peek = document.getElementById('peek'), art0 = document.getElementById('art');
    if (art0) { art0.hidden = false; art0.className = 'fbtn primary nextbtn'; art0.innerHTML = `<span>${S.i + 1 < items.length + pending.length ? '下一題' : '完成'}</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>`; art0.onclick = () => slide(1, next); art0.setAttribute('aria-label', '下一題'); art0.focus({ preventScroll: true }); }
    if (peek) { if (src && src.full) { peek.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5M9 8h6M9 12h4"/></svg><span>條文</span>'; peek.classList.add('art'); peek.onclick = () => { const f = document.getElementById('full'); if (f) { f.hidden = !f.hidden; if (!f.hidden) f.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } }; } else peek.disabled = true; }
    setTimeout(snap, 0);
    if (src) {
      S.sayA = src.tts || '';
      if (ST.set.tts && S.sayA) speakLater(() => S.sayA, 'qsp', 600);
      const qs = document.getElementById('qs'); if (qs) qs.textContent = src.label;
      const ex = document.getElementById('ex'); if (ex && src.html) { ex.innerHTML = src.html; bindSrc(ex); }
      if (src.full && ex) ex.insertAdjacentHTML('beforeend', `<div class="fullart" id="full" hidden>${src.full}</div>`);
    }
  }
  const srcOf = (law, no, quote, extra) => ({ tts: `${law}${no}。${quote || ''}`, label: `出處　${law} ${no}`, html: answerHTML(quote, extra), full: `<div class="fh">${esc(law)} ${esc(no)}</div>${artHTML(law, no, { quote, hl: true })}` });
  function draw() {
    window.scrollTo(0, 0); S.done = false; S.reveal = null; S.say = null; S.sayA = ''; $app.classList.remove('static');
    document.querySelectorAll('.dock').forEach(d => d.remove());
    const it = items[S.i];
    ({ q: drawQ, z: drawZ, t: drawT, m: drawM, s: drawS, o: drawO })[it.t](it);
    // 題目卡＋選項＋解答包在一起，滑動時整塊一起動（上方進度列不動）
    const wrap = document.createElement('div'); wrap.className = 'qslide';
    [...$app.children].filter(n => !n.classList.contains('qtop')).forEach(n => wrap.appendChild(n));
    $app.appendChild(wrap);
    foot();
    const sp = document.getElementById('qsp');
    if (sp) { sp.onclick = () => { if (sp.classList.contains('on')) { stopSpeak(); return; } speak(S.done ? S.sayA : (S.say && S.say()), sp); }; if (ST.set.tts && S.say) speakLater(() => S.say(), 'qsp', 250); }
    document.getElementById('x').onclick = opt.back;
    document.getElementById('qset').onclick = openSettings;
  }
  function markO(b) { b.insertAdjacentHTML('beforeend', '<span class="mk ok" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6 12.5l4 4 8-9" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></span>'); }
  function markX(b) { b.insertAdjacentHTML('beforeend', '<span class="mk no" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 7l10 10M17 7L7 17" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg></span>'); b.classList.add('shake'); }
  function choose(bs, ck, k) { bs.forEach(x => x.disabled = true); bs.forEach((x, i) => { if (i === ck) { x.classList.add('right'); markO(x); } else if (i === k) { x.classList.add('wrong'); markX(x); } else x.classList.add('dim'); }); }
  function drawQ(it) {
    const q = Q[it.id], perm = shuffle([0, 1, 2, 3]);
    $app.innerHTML = card(it, LAWTAB[lawOfId(it.id)] + (q.ex ? '・' + q.ex + '考題' : ''), `<p class="qtext">${hlText(q.q, true)}</p>`) +
      `<div class="opts">${perm.map((p, k) => `<button class="opt" data-k="${k}"><span class="L">${L[k]}</span><span>${esc(q.opts[p])}</span></button>`).join('')}</div><div id="ex"></div>`;
    const bs = [...$app.querySelectorAll('.opt')], ck = perm.indexOf(q.ans);
    const go = k => { choose(bs, ck, k); const sr = srcOf(q.law, q.no, q.quote, [q.q, q.opts[q.ans]]); if (q.ex) sr.label = `${q.ex}考題　依現行 ${q.law} ${q.no}`; result(k === ck, sr); };
    bs.forEach(b => b.onclick = () => go(+b.dataset.k));
    S.say = () => q.q + '。' + perm.map((p, k) => L[k] + '，' + q.opts[p]).join('。');
    S.reveal = () => go(-1);
  }
  function drawZ(it) {
    const z = Z[it.id];
    $app.innerHTML = card(it, LAWTAB[lawOfId(it.id)], `<div class="cloze">${hlText(z.pre)}<span class="blank" id="bl">　</span>${hlText(z.post)}</div>`) +
      `<div class="numopts">${z.opts.map((o, k) => `<button class="opt" data-k="${k}">${esc(o)}</button>`).join('')}</div><div id="ex"></div>`;
    const bs = [...$app.querySelectorAll('.opt')], bl = document.getElementById('bl');
    const go = k => { const ok = k === z.ans; choose(bs, z.ans, k); bl.textContent = z.opts[z.ans]; bl.classList.add(ok ? 'filled' : 'bad'); result(ok, srcOf(z.law, z.no, z.quote)); };
    bs.forEach(b => b.onclick = () => go(+b.dataset.k));
    S.say = () => z.pre + '，空格，' + z.post + '。選項：' + z.opts.join('、');
    S.reveal = () => go(-1);
  }
  function drawT(it) {
    const t = T[it.id];
    $app.innerHTML = card(it, LAWTAB[lawOfId(it.id)], `<div class="tfcard" id="tc"><div>${hlText(t.s)}</div></div>`) +
      `<div class="tfbtns"><button class="tfb x" data-v="0" aria-label="錯">${TF_X}</button><button class="tfb o" data-v="1" aria-label="對">${TF_O}</button></div><div id="ex"></div>`;
    const go = v => { const ok = v === t.ok; const tc = document.getElementById('tc'); tc.classList.add(t.ok ? 'yes' : 'no'); if (!ok) tc.classList.add('shake'); $app.querySelectorAll('.tfb').forEach(b => b.disabled = true); result(ok, srcOf(t.law, t.no, t.quote)); };
    tfBind(document.getElementById('tc'), go);
    S.say = () => t.s + '。這句話對還是錯？';
    S.reveal = () => go(null);
  }
  function drawM(it) {
    const set = D.matches[it.id]; const left = shuffle(set.map((p, i) => ({ i, s: p.a }))), right = shuffle(set.map((p, i) => ({ i, s: p.b })));
    $app.innerHTML = card(it, '配對', `<div class="match"><div class="col">${left.map(x => `<button class="mi a" data-i="${x.i}">${esc(x.s)}</button>`).join('')}</div><div class="col">${right.map(x => `<button class="mi b" data-i="${x.i}">${esc(x.s)}</button>`).join('')}</div></div>`) + `<div id="ex"></div>`;
    let sel = null, errs = 0, got = 0;
    S.say = () => '請把左右兩邊配對。';
    const src = () => ({ tts: set.map(p => p.a + '，' + p.b).join('。'), label: '出處　' + [...new Set(set.map(p => p.law + ' ' + p.no))].join('、'), html: `<div class="ans">${set.map(p => `<div>${esc(p.a)}　<b class="hl-n">${esc(p.b)}</b></div>`).join('')}</div>` });
    const pick = b => {
      if (b.classList.contains('ok') || S.done) return;
      if (!sel || sel.classList.contains(b.classList.contains('a') ? 'a' : 'b')) { $app.querySelectorAll('.mi.sel').forEach(x => x.classList.remove('sel')); sel = b; b.classList.add('sel'); return; }
      const a = sel; sel = null; a.classList.remove('sel');
      if (a.dataset.i === b.dataset.i) { a.classList.add('ok'); b.classList.add('ok'); got++; sPlace(); if (got === set.length) result(errs <= 1, src()); }
      else { errs++; [a, b].forEach(x => { x.classList.add('err', 'shake'); setTimeout(() => x.classList.remove('err', 'shake'), 400); }); sBad(); buzz(60); }
    };
    $app.querySelectorAll('.mi').forEach(b => b.onclick = () => pick(b));
    S.reveal = () => { $app.querySelectorAll('.mi').forEach(x => x.classList.add('ok')); result(false, src()); };
  }
  function drawS(it) {
    const s = SQ[it.id]; const pool = shuffle(s.steps.map((t, i) => ({ t, i })));
    $app.innerHTML = card(it, '排序', `<p class="qtext">${esc(s.title)}</p><div class="seqslots">${s.steps.map((_, i) => `<div class="seqslot ${i === 0 ? 'next' : ''}" data-i="${i}"></div>`).join('')}</div>`) + `<div class="seqpool">${pool.map(x => `<button data-i="${x.i}">${esc(x.t)}</button>`).join('')}</div><div id="ex"></div>`;
    let n = 0, errs = 0; const slots = [...$app.querySelectorAll('.seqslot')];
    S.say = () => s.title + '。請排出順序。';
    const src = () => ({ tts: s.title + '：' + s.steps.join('，接著，'), label: `出處　${s.law} ${s.nos.join('、')}`, html: '', full: s.nos.map(no => `<div class="fh">${esc(s.law)} ${esc(no)}</div>${artHTML(s.law, no, { hl: true })}`).join('') });
    $app.querySelectorAll('.seqpool button').forEach(b => b.onclick = () => {
      if (S.done) return;
      if (+b.dataset.i === n) { slots[n].textContent = b.textContent; slots[n].classList.remove('next'); slots[n].classList.add('f'); b.remove(); n++; sPlace(); if (slots[n]) slots[n].classList.add('next'); if (n === s.steps.length) result(errs <= 1, src()); }
      else { errs++; b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 400); sBad(); buzz(60); }
    });
    S.reveal = () => { s.steps.forEach((t, i) => { slots[i].textContent = t; slots[i].classList.add('f'); slots[i].classList.remove('next'); }); $app.querySelector('.seqpool').innerHTML = ''; result(false, src()); };
  }
  function drawO(it) {
    const o = O[it.id]; const cards = shuffle(o.parts.map((t, i) => ({ t, i })).concat([{ t: o.x, i: -1 }]));
    $app.innerHTML = card(it, LAWTAB[lawOfId(it.id)], `<div class="build" id="bd">${o.parts.map(() => '<span class="slotc"></span>').join('')}</div>`) +
      `<div class="cardpool">${cards.map(c => `<button class="pc" data-i="${c.i}">${hlText(c.t, false, true)}</button>`).join('')}</div><div id="ex"></div>`;
    S.say = () => '請把條文排出正確順序。';
    let n = 0, errs = 0; const slots = [...$app.querySelectorAll('.slotc')]; slots[0].classList.add('next');
    $app.querySelectorAll('.pc').forEach(b => b.onclick = () => {
      if (S.done) return;
      if (+b.dataset.i === n) { slots[n].innerHTML = b.innerHTML; slots[n].classList.remove('next'); slots[n].classList.add('f'); b.remove(); n++; sPlace(); if (slots[n]) slots[n].classList.add('next');
        if (n === o.parts.length) { $app.querySelectorAll('.pc').forEach(x => x.classList.add('out')); result(errs <= 1, srcOf(o.law, o.no, o.quote)); } }
      else { errs++; b.classList.add('err', 'shake'); setTimeout(() => b.classList.remove('err', 'shake'), 420); sBad(); buzz(60); }
    });
    S.reveal = () => { o.parts.forEach((p, i) => { slots[i].innerHTML = hlText(p, false, true); slots[i].classList.add('f'); slots[i].classList.remove('next'); }); $app.querySelectorAll('.pc').forEach(x => x.classList.add('out')); result(false, srcOf(o.law, o.no, o.quote)); };
  }
  function finish() {
    const n = items.length, pct = S.right / Math.max(1, S.answered || n), lv = opt.level;
    if (opt.session) { sessionEnd(S, opt); return; }
    if (lv && pct >= 0.7 && !ST.lv[lv.id]) { ST.coins += 10; save(); }
    if (!lv) { // 一般練習
      sWin();
      const wrong = items.filter(it => (it.t === 'q' || it.t === 'z' || it.t === 't') && ST.r[it.id] && ST.r[it.id][2] === 0);
      $app.innerHTML = `<div class="end"><div class="score">${S.right}<small> / ${n}</small></div>${S.best > 2 ? `<div class="meta num">連對 ${S.best}</div>` : ''}</div><div class="btns">${wrong.length ? `<button class="btn" id="rw">再做錯的 ${wrong.length} 題</button>` : ''}<button class="btn ${wrong.length ? 'ghost' : ''}" id="bk">返回</button></div>`;
      const rw = document.getElementById('rw'); if (rw) rw.onclick = () => runItems(wrong, opt);
      document.getElementById('bk').onclick = opt.back; return;
    }
    const pass = pct >= 0.7, stars = pct >= 0.95 ? 3 : pct >= 0.85 ? 2 : 1;
    const prev = ST.lv[lv.id];
    if (pass) { ST.lv[lv.id] = { s: Math.max(stars, prev ? prev.s : 0), b: Math.max(Math.round(pct * 100), prev ? prev.b : 0) }; save(); }
    const ni = LVI[lv.id] + 1, nextLv = LV[ni];
    $app.innerHTML = `<div class="end">${pass ? stampSVG(lv.stamp, lv.id, 'bigstamp slam') : `<svg class="bigstamp miss" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="6 6"/></svg>`}
      ${pass ? starsHTML(stars) : ''}<div class="score">${S.right}<small> / ${n}</small></div></div>
      <div class="btns">${pass && nextLv ? `<button class="btn" id="nl">下一關</button>` : ''}<button class="btn ${pass && nextLv ? 'ghost' : ''}" id="ag">再一次</button><button class="btn ghost" id="bk">集章冊</button></div>`;
    if (pass) { setTimeout(() => { sStamp(); buzz(40); }, 120); setTimeout(sWin, 500); } else sBad();
    const nl = document.getElementById('nl'); if (nl) nl.onclick = () => playLevel(nextLv.id);
    document.getElementById('ag').onclick = () => runItems(shuffle(items), opt);
    document.getElementById('bk').onclick = () => goTab('map');
  }
  draw();
}
const TF_X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
const TF_O = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><circle cx="12" cy="12" r="7.5"/></svg>';
function tfBind(card, cb) {
  let x0 = null, dx = 0, done = false;
  const bx = document.querySelector('.tfb.x'), bo = document.querySelector('.tfb.o');
  const commit = v => { if (done) return; done = true; card.style.transform = ''; bx.classList.remove('lean'); bo.classList.remove('lean'); cb(v); };
  bx.onclick = () => commit(false); bo.onclick = () => commit(true);
  card.addEventListener('pointerdown', e => { if (done || e.target.closest('.gl')) return; x0 = e.clientX; dx = 0; card.classList.add('dragging'); card.setPointerCapture(e.pointerId); });
  card.addEventListener('pointermove', e => { if (x0 === null || done) return; dx = e.clientX - x0; card.style.transform = `translateX(${dx}px) rotate(${dx / 18}deg)`; bx.classList.toggle('lean', dx < -40); bo.classList.toggle('lean', dx > 40); });
  const end = () => { if (x0 === null) return; x0 = null; card.classList.remove('dragging'); if (Math.abs(dx) > 80) commit(dx > 0); else { card.style.transform = ''; bx.classList.remove('lean'); bo.classList.remove('lean'); } };
  card.addEventListener('pointerup', end); card.addEventListener('pointercancel', end);
  const key = e => { if (done) { document.removeEventListener('keydown', key); return; } if (e.key === 'ArrowLeft') commit(false); if (e.key === 'ArrowRight') commit(true); };
  document.addEventListener('keydown', key);
}

/* ========== 學法 ========== */
let FILTER = 'all';
const inFilter = unit => FILTER === 'all' || lawOf(unit) === FILTER;
const MODE_ICONS = {
  card: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="3" y="6" width="13" height="15" rx="2"/><path d="M8 3h11a2 2 0 0 1 2 2v13"/></svg>',
  cloze: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 8h5M16 8h5M3 15h9"/><rect x="9" y="5" width="6" height="6" rx="1.5"/><rect x="13" y="12" width="8" height="6" rx="1.5"/></svg>',
  quick: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M10 2h4"/></svg>',
  match: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="2" y="4" width="7" height="5" rx="1.5"/><rect x="2" y="15" width="7" height="5" rx="1.5"/><rect x="15" y="4" width="7" height="5" rx="1.5"/><rect x="15" y="15" width="7" height="5" rx="1.5"/><path d="M9 6.5l6 11M9 17.5l6-11"/></svg>',
  order: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 5l1-1v4M3.5 12.5a1.2 1.2 0 1 1 2 1L3.5 15H6M3.5 17h2a1 1 0 0 1 0 2h-2"/></svg>',
  mock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M5 3h10l4 4v14H5z"/><path d="M9 10h6M9 14h6M9 18h3"/></svg>',
};
function vModes() {
  const qn = D.questions.filter(q => inFilter(q.unit)).length;
  $app.innerHTML = `<h1>學法</h1><div class="chips">${[['all', '三法'], ['org', '法組'], ['civ', '民訴'], ['crim', '刑訴']].map(([k, t]) => `<button class="chip ${FILTER === k ? 'on' : ''}" data-f="${k}">${t}</button>`).join('')}</div>
  <div class="modes">
   <button class="mode" data-m="card">${MODE_ICONS.card}<b>條文卡翻牌</b><span>20 張</span></button>
   <button class="mode" data-m="cloze">${MODE_ICONS.cloze}<b>挖空填數字</b><span>15 題</span></button>
   <button class="mode" data-m="quick">${MODE_ICONS.quick}<b>限時是非快答</b><span>60 秒${ST.quick ? '・最佳 ' + ST.quick : ''}</span></button>
   <button class="mode" data-m="match">${MODE_ICONS.match}<b>配對</b><span>3 組</span></button>
   <button class="mode" data-m="order">${MODE_ICONS.order}<b>流程排序</b><span>${D.seqs.filter(s => inFilter(s.unit)).length} 組</span></button>
   <button class="mode" data-m="rand">${MODE_ICONS.mock}<b>隨機選擇題</b><span>20 題・共 ${qn} 題</span></button>
   <button class="mode" data-m="wrongbook">${MODE_ICONS.mock.replace('M9 10h6M9 14h6M9 18h3', 'M9.5 11l5 5M14.5 11l-5 5')}<b>錯題本</b><span>${wrongIds().length} 題</span></button>
  </div>
  ${(() => { const g = {}; D.questions.filter(q => q.ex).forEach(q => { const k = q.ex + '|' + (q.id.includes('-ORG-') ? '法院組織法大意' : '民刑訴大意'); (g[k] = g[k] || []).push(q.id); }); const ks = Object.keys(g).sort().reverse(); return ks.length ? `<section style="display:flex;flex-direction:column;gap:10px"><h2>歷屆試題</h2><div class="pastgrid">${ks.map(k => { const [y, t] = k.split('|'); const done = g[k].filter(id => ST.r[id]).length; return `<button class="mode pastbtn" data-past="${k}"><b>${y}</b><span>${t}</span><span class="num">${done}/${g[k].length}</span></button>`; }).join('')}</div></section>` : ''; })()}
  <section style="display:flex;flex-direction:column;gap:10px"><h2>模擬考</h2>
   <button class="mode" data-m="mock1" style="min-height:0"><b>法院組織法大意</b><span>50 題・60 分鐘・每題 2 分</span></button>
   <button class="mode" data-m="mock2" style="min-height:0"><b>民事訴訟法大意與刑事訴訟法大意</b><span>民訴 25＋刑訴 25・60 分鐘</span></button>
   ${ST.mocks.length ? `<div class="list">${ST.mocks.slice(-6).reverse().map(m => `<div class="row"><div><div>${esc(m.t)}</div><div class="r">${esc(m.d)}</div></div><b class="num" style="font-size:20px">${m.s}</b></div>`).join('')}</div>` : ''}
  </section>`;
  $app.querySelectorAll('.chip').forEach(b => b.onclick = () => { FILTER = b.dataset.f; vModes(); });
  $app.querySelectorAll('.pastbtn').forEach(b => b.onclick = e => { e.stopPropagation(); reset(); const [y, t] = b.dataset.past.split('|'); const ids = D.questions.filter(q => q.ex === y && (t === '法院組織法大意') === q.id.includes('-ORG-')).map(q => q.id).sort(); runItems(ids.map(id => ({ t: 'q', id })), { back: () => goTab('modes') }); });
  const back = () => goTab('modes');
  $app.querySelectorAll('.mode[data-m]').forEach(b => b.onclick = () => {
    reset(); const m = b.dataset.m;
    if (m === 'card') { const seen = new Set(), cards = []; shuffle(D.questions.filter(q => inFilter(q.unit))).forEach(q => { const k = q.law + q.no; if (!seen.has(k)) { seen.add(k); cards.push({ law: q.law, no: q.no }); } }); document.body.classList.add('playing'); readCards(cards.slice(0, 20), { back, done: back, repeat: true, doneLabel: '完成' }); }
    else if (m === 'cloze') runItems(shuffle(D.cloze.filter(z => inFilter(z.unit))).slice(0, 15).map(z => ({ t: 'z', id: z.id })), { back });
    else if (m === 'quick') quickTF();
    else if (m === 'match') { const ks = shuffle(Object.keys(D.matches).filter(k => inFilter(k.split('-')[0]))).slice(0, 3); runItems(ks.map(k => ({ t: 'm', id: k })), { back }); }
    else if (m === 'order') runItems(shuffle(D.seqs.filter(s => inFilter(s.unit))).map(s => ({ t: 's', id: s.id })), { back });
    else if (m === 'wrongbook') { goTab('wrong'); return; }
    else if (m === 'rand') runItems(shuffle(D.questions.filter(q => inFilter(q.unit))).slice(0, 20).map(q => ({ t: 'q', id: q.id })), { back });
    else if (m === 'mock1') mockStart('法院組織法大意', weighted(D.questions.filter(q => lawOf(q.unit) === 'org'), 50));
    else if (m === 'mock2') mockStart('民事訴訟法大意與刑事訴訟法大意', [...weighted(D.questions.filter(q => lawOf(q.unit) === 'civ'), 25), ...weighted(D.questions.filter(q => lawOf(q.unit) === 'crim'), 25)]);
  });
}
function weighted(pool, n) { return pool.map(q => ({ q, k: Math.pow(Math.random(), 1 / (U[q.unit].pri || 1)) })).sort((a, b) => b.k - a.k).slice(0, n).map(x => x.q); }

/* ---------- 限時快答 ---------- */
function quickTF() {
  document.body.classList.add('playing');
  const deck = shuffle(D.tf.filter(t => inFilter(t.unit))); let i = 0, right = 0, combo = 0, best = 0; const missed = [];
  const end = Date.now() + 60000;
  const draw = () => {
    const t = deck[i % deck.length];
    $app.innerHTML = `<div class="ph"><button class="icon-btn" id="x" aria-label="離開">${XICON}</button><span class="timer" id="tm">60</span><span class="sp"></span><span class="combo" id="cb">${combo > 1 ? combo : ''}</span><b class="num" style="font-size:20px">${right}</b></div>
    <div class="tfwrap"><div class="tfcard" id="tc"><div>${hlText(t.s)}</div></div><div class="tfbtns"><button class="tfb x" aria-label="錯">${TF_X}</button><button class="tfb o" aria-label="對">${TF_O}</button></div></div>`;
    document.getElementById('x').onclick = () => goTab('modes');
    tick();
    tfBind(document.getElementById('tc'), v => {
      const ok = v === t.ok; mark(t.id, ok); const tc = document.getElementById('tc'); tc.classList.add(t.ok ? 'yes' : 'no');
      if (ok) { right++; combo++; best = Math.max(best, combo); sOk(); } else { combo = 0; missed.push(t); sBad(); buzz(80); tc.classList.add('shake'); }
      setTimeout(() => { i++; if (Date.now() < end) draw(); }, ok ? 220 : 650);
    });
  };
  const tick = () => { const left = Math.max(0, Math.ceil((end - Date.now()) / 1000)); const tm = document.getElementById('tm'); if (tm) { tm.textContent = left; tm.classList.toggle('low', left <= 10); } };
  const timer = setInterval(() => { tick(); if (Date.now() >= end) { clearInterval(timer); over(); } }, 250);
  cleanup = () => clearInterval(timer);
  const over = () => {
    if (right > (ST.quick || 0)) { ST.quick = right; save(); }
    sWin();
    $app.innerHTML = `<div class="end"><div class="score">${right}</div><div class="meta num">${best > 2 ? '連對 ' + best + '・' : ''}最佳 ${ST.quick}</div></div>
    <div class="btns"><button class="btn" id="ag">再一次</button><button class="btn ghost" id="bk">學法</button></div>
    ${missed.length ? `<section style="display:flex;flex-direction:column;gap:12px"><h2>答錯 ${missed.length}</h2>${missed.map(t => `<div style="display:flex;flex-direction:column;gap:6px"><div style="font-weight:700">${t.ok ? '○' : '✕'}　${esc(t.s)}</div>${srcHTML(t.law, t.no, t.quote)}</div>`).join('')}</section>` : ''}`;
    bindSrc($app);
    document.getElementById('ag').onclick = () => { reset(); quickTF(); };
    document.getElementById('bk').onclick = () => goTab('modes');
  };
  draw();
}

/* ---------- 模擬考 ---------- */
function mockStart(title, list) {
  document.body.classList.add('playing');
  const M = { items: list.map(q => ({ q, perm: shuffle([0, 1, 2, 3]) })), ans: list.map(() => -1), i: 0, end: Date.now() + 3600e3 };
  const fmt = ms => { ms = Math.max(0, ms); return String(Math.floor(ms / 60000)).padStart(2, '0') + ':' + String(Math.floor(ms % 60000 / 1000)).padStart(2, '0'); };
  const d = dock('<button class="btn ghost" id="pv">上一題</button><button class="btn" id="sb">交卷</button>');
  const draw = () => {
    window.scrollTo(0, 0);
    const { q, perm } = M.items[M.i];
    $app.innerHTML = `<div class="ph"><button class="icon-btn" id="x" aria-label="放棄">${XICON}</button><span class="timer" id="tm">${fmt(M.end - Date.now())}</span><span class="sp"></span><span class="meta num">${M.ans.filter(a => a >= 0).length} / ${M.items.length}</span></div>
    <div class="meta num">第 ${M.i + 1} 題</div><p class="qtext">${hlText(q.q, true)}</p>
    <div class="opts">${perm.map((p, k) => `<button class="opt ${M.ans[M.i] === k ? 'sel' : ''}" data-k="${k}"><span class="L">(${L[k]})</span><span>${esc(q.opts[p])}</span></button>`).join('')}</div>
    <div class="sheet">${M.items.map((_, i) => `<button class="${M.ans[i] >= 0 ? 'f' : ''} ${i === M.i ? 'cur' : ''}" data-i="${i}">${i + 1}</button>`).join('')}</div><div id="cf"></div>`;
    document.getElementById('x').onclick = () => confirmBox('放棄這次模擬考？', '放棄', () => goTab('modes'));
    $app.querySelectorAll('.opt').forEach(b => b.onclick = () => { M.ans[M.i] = +b.dataset.k; if (M.i < M.items.length - 1) M.i++; draw(); });
    $app.querySelectorAll('.sheet button').forEach(b => b.onclick = () => { M.i = +b.dataset.i; draw(); });
  };
  const confirmBox = (msg, yes, fn) => { const cf = document.getElementById('cf'); cf.innerHTML = `<div class="src" style="border-color:var(--verm)"><p style="margin:0">${esc(msg)}</p><div class="btns"><button class="btn" id="y">${yes}</button><button class="btn ghost" id="n">繼續作答</button></div></div>`; document.getElementById('y').onclick = fn; document.getElementById('n').onclick = () => cf.innerHTML = ''; cf.scrollIntoView({ behavior: 'smooth' }); };
  document.getElementById('pv').onclick = () => { if (M.i > 0) { M.i--; draw(); } };
  document.getElementById('sb').onclick = () => { const left = M.ans.filter(a => a < 0).length; left ? confirmBox(`還有 ${left} 題沒作答，確定交卷？`, '交卷', submit) : submit(); };
  const timer = setInterval(() => { const left = M.end - Date.now(), t = document.getElementById('tm'); if (t) { t.textContent = fmt(left); t.classList.toggle('low', left < 300e3); } if (left <= 0) submit(); }, 1000);
  cleanup = () => clearInterval(timer);
  function submit() {
    clearInterval(timer); cleanup = null; d.remove(); let right = 0;
    M.items.forEach((it, i) => { const ok = M.ans[i] === it.perm.indexOf(it.q.ans); if (ok) right++; mark(it.q.id, ok); });
    const score = right * 2, dt = new Date();
    ST.mocks.push({ t: title, s: score, d: `${dt.getMonth() + 1}/${dt.getDate()} ${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}` }); save();
    sWin(); setTab('');
    const wrong = M.items.map((it, i) => ({ it, i })).filter(({ it, i }) => M.ans[i] !== it.perm.indexOf(it.q.ans));
    $app.innerHTML = `<div class="end"><div class="score">${score}</div><div class="meta">${esc(title)}・答對 ${right} / ${M.items.length}</div></div>
    <div class="sheet">${M.items.map((it, i) => `<button class="${M.ans[i] === it.perm.indexOf(it.q.ans) ? 'o' : 'x'}" data-i="${i}">${i + 1}</button>`).join('')}</div>
    <div class="btns"><button class="btn" id="bk">學法</button></div>
    ${wrong.length ? `<section style="display:flex;flex-direction:column;gap:14px"><h2>答錯 ${wrong.length}</h2>${wrong.map(({ it, i }) => { const c = it.perm.indexOf(it.q.ans), a = M.ans[i]; return `<div id="w${i}" style="display:flex;flex-direction:column;gap:6px"><div class="meta">第 ${i + 1} 題</div><div style="font-weight:700">${esc(it.q.q)}</div><div style="color:var(--ok);font-weight:700">(${L[c]}) ${esc(it.q.opts[it.q.ans])}</div>${a >= 0 ? `<div style="color:var(--verm);text-decoration:line-through">(${L[a]}) ${esc(it.q.opts[it.perm[a]])}</div>` : '<div class="muted">未作答</div>'}${srcHTML(it.q.law, it.q.no, it.q.quote)}</div>`; }).join('')}</section>` : ''}`;
    bindSrc($app);
    document.getElementById('bk').onclick = () => goTab('modes');
    $app.querySelectorAll('.sheet button.x').forEach(b => b.onclick = () => { const e = document.getElementById('w' + b.dataset.i); e && e.scrollIntoView({ behavior: 'smooth' }); });
  }
  draw();
}

/* ========== 錯題 ========== */
function wrongIds() { return Object.keys(ST.r).filter(id => (Q[id] || Z[id]) && isWrong(id)); }
function vWrong() {
  const ids = wrongIds();
  if (!ids.length) { $app.innerHTML = `<h1>錯題</h1><div class="empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h11l3 3v13H5z"/><path d="M9 13l2 2 4-4"/></svg><p class="muted">答錯的題目會收在這裡，連續答對兩次才會移出。</p></div>`; return; }
  const items = ids.map(id => Q[id] ? { t: 'q', id, u: Q[id].unit, s: Q[id].q, law: Q[id].law, no: Q[id].no } : { t: 'z', id, u: Z[id].unit, s: Z[id].pre + '＿＿' + Z[id].post, law: Z[id].law, no: Z[id].no });
  const by = {}; items.forEach(x => (by[lawOf(x.u)] = by[lawOf(x.u)] || []).push(x));
  $app.innerHTML = `<h1>錯題 <span class="muted num" style="font-size:18px">${ids.length}</span></h1><div class="btns"><button class="btn" id="all">全部重刷</button></div>
  ${['org', 'civ', 'crim'].filter(k => by[k]).map(k => `<section style="display:flex;flex-direction:column;gap:8px"><h2>${LAWN[k]} <span class="muted num" style="font-size:15px">${by[k].length}</span></h2><div class="list">${by[k].map(x => `<div class="row"><div><div style="font-size:15px">${esc(x.s)}</div><div class="r">${esc(x.law)} ${esc(x.no)}</div></div><span class="r num">✕${ST.r[x.id][1]}</span></div>`).join('')}</div><button class="btn ghost wide" data-k="${k}">只刷${LAWN[k]}</button></section>`).join('')}`;
  const back = () => goTab('wrong');
  document.getElementById('all').onclick = () => runItems(shuffle(items), { back });
  $app.querySelectorAll('[data-k]').forEach(b => b.onclick = () => runItems(shuffle(by[b.dataset.k]), { back }));
}

/* ========== 數字表 ========== */
let NUMQ = '', COVER = false;
function vNumbers() {
  $app.innerHTML = lookupSeg('numbers') + `<div class="tools"><input id="ns" class="search" type="search" placeholder="搜尋，例如：上訴、羈押、小額" value="${esc(NUMQ)}"><label class="toggle"><input type="checkbox" id="nc" ${COVER ? 'checked' : ''}>遮住答案</label></div><div id="nl" style="display:flex;flex-direction:column;gap:22px"></div>`;
  const draw = () => {
    const g = {}; D.numbers.forEach(x => { if (NUMQ && !(x.item + x.value + x.no).includes(NUMQ)) return; (g[x.law] = g[x.law] || []).push(x); });
    document.getElementById('nl').innerHTML = Object.keys(LAWS).filter(l => g[l]).map(l => `<section><h2 style="margin-bottom:8px">${esc(l)}</h2><div class="list ${COVER ? 'cover' : ''}">${g[l].sort((a, b) => artNoKey(a.no) - artNoKey(b.no)).map(x => `<button class="row nrow"><span>${esc(x.item)}</span><span class="v">${esc(x.value)}</span><span class="a">${esc(x.no)}</span></button>`).join('')}</div></section>`).join('') || '<div class="empty muted">沒有符合的項目</div>';
    document.querySelectorAll('.nrow').forEach(b => b.onclick = () => b.classList.toggle('show'));
  };
  document.getElementById('ns').oninput = e => { NUMQ = e.target.value.trim(); draw(); };
  document.getElementById('nc').onchange = e => { COVER = e.target.checked; draw(); };
  draw();
}

/* ========== 條文 ========== */
let LAWSEL = '法院組織法', LAWQ = '';
function vLaws() {
  $app.innerHTML = lookupSeg('laws') + `<div class="tools"><select id="ls" class="search">${Object.keys(LAWS).map(n => `<option ${n === LAWSEL ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select><input id="lq" class="search" type="search" placeholder="搜尋條文文字" value="${esc(LAWQ)}"></div><div class="lawbox" id="lb"></div>`;
  const draw = () => {
    let h = ''; (LAWS[LAWSEL] || []).forEach(([k, v]) => { if (k === 'h') { if (!LAWQ) h += `<h3>${esc(v)}</h3>`; return; } if (LAWQ && !(k + v).includes(LAWQ)) return; let b = artHTML(LAWSEL, k, { nums: true }); if (LAWQ) b = b.split(esc(LAWQ)).join('<mark>' + esc(LAWQ) + '</mark>'); h += `<div class="a"><b>${esc(k)}</b>${b}</div>`; });
    document.getElementById('lb').innerHTML = h || '<div class="empty muted">沒有符合的條文</div>';
  };
  document.getElementById('ls').onchange = e => { LAWSEL = e.target.value; draw(); };
  let tm; document.getElementById('lq').oninput = e => { clearTimeout(tm); tm = setTimeout(() => { LAWQ = e.target.value.trim(); draw(); }, 200); };
  draw();
}

route();
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) { const had = !!navigator.serviceWorker.controller; let done = false; navigator.serviceWorker.addEventListener('controllerchange', () => { if (had && !done) { done = true; location.reload(); } }); navigator.serviceWorker.register('sw.js').then(r => r.update()).catch(() => {}); }
})();
