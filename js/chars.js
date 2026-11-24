/* 法庭動物角色：純 SVG 程式繪製。window.CHARS.svg(id, mood, opts) → SVG 字串
   mood: 'idle' | 'happy' | 'sad' */
(function () {
  const INK = '#2A2320';
  const SW = 3.2;
  const line = `stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round" stroke-linecap="round"`;

  function eyes(mood, x1, x2, y, light) {
    const fill = INK;
    if (mood === 'happy') {
      return [x1, x2].map(x => `<path d="M${x - 4.5} ${y + 1.5} Q${x} ${y - 4.5} ${x + 4.5} ${y + 1.5}" fill="none" stroke="${light ? '#fff' : INK}" stroke-width="3.2" stroke-linecap="round"/>`).join('');
    }
    let s = '';
    [x1, x2].forEach(x => {
      if (light) s += `<ellipse cx="${x}" cy="${y}" rx="5.6" ry="6.4" fill="#fff"/>`;
      s += `<ellipse cx="${x}" cy="${y + (mood === 'sad' ? 1 : 0)}" rx="3.6" ry="${mood === 'sad' ? 3.8 : 4.6}" fill="${fill}"/>`;
      s += `<circle cx="${x + 1.3}" cy="${y - 1.6}" r="1.4" fill="#fff"/>`;
    });
    if (mood === 'sad') {
      s += `<path d="M${x1 - 6} ${y - 9} L${x1 + 4} ${y - 6.5}" ${line} fill="none" stroke="${light ? '#fff' : INK}"/>`;
      s += `<path d="M${x2 + 6} ${y - 9} L${x2 - 4} ${y - 6.5}" ${line} fill="none" stroke="${light ? '#fff' : INK}"/>`;
    }
    return s;
  }
  function mouth(mood, x, y, light) {
    const c = light ? '#fff' : INK;
    if (mood === 'happy') return `<path d="M${x - 5.5} ${y - 1} Q${x} ${y + 8} ${x + 5.5} ${y - 1} Z" fill="#8E2F2F" stroke="${c}" stroke-width="2.4" stroke-linejoin="round"/>`;
    if (mood === 'sad') return `<path d="M${x - 4} ${y + 3} Q${x} ${y - 1.5} ${x + 4} ${y + 3}" fill="none" stroke="${c}" stroke-width="2.6" stroke-linecap="round"/>`;
    return `<path d="M${x - 4} ${y} Q${x} ${y + 3.5} ${x + 4} ${y}" fill="none" stroke="${c}" stroke-width="2.6" stroke-linecap="round"/>`;
  }
  const blush = (x1, x2, y) => `<ellipse cx="${x1}" cy="${y}" rx="4.6" ry="2.6" fill="#F08F8F" opacity=".65"/><ellipse cx="${x2}" cy="${y}" rx="4.6" ry="2.6" fill="#F08F8F" opacity=".65"/>`;
  const shadow = `<ellipse cx="60" cy="115" rx="30" ry="4" fill="#000" opacity=".12"/>`;
  const feet = c => `<ellipse cx="48" cy="110" rx="8" ry="4.6" fill="${c}" ${line}/><ellipse cx="72" cy="110" rx="8" ry="4.6" fill="${c}" ${line}/>`;
  const robe = (c, trim) => `<path d="M33 110 L36 84 Q38 74 50 72 L70 72 Q82 74 84 84 L87 110 Q60 115 33 110 Z" fill="${c}" ${line}/>` +
    (trim ? `<path d="M50 73 L60 92 L70 73" fill="none" stroke="${trim}" stroke-width="4.5" stroke-linejoin="round"/><path d="M60 92 L60 110" stroke="${trim}" stroke-width="3"/>` : '');

  const DEF = {
    turtle: {
      name: '烏龜', role: '庭務員', price: 0,
      draw: m => shadow + feet('#8DBE7B') +
        `<ellipse cx="60" cy="92" rx="30" ry="21" fill="#7A6A3E" ${line}/>` +
        `<path d="M40 84 L50 80 L60 84 L70 80 L80 84 M45 98 L55 94 L65 98 L75 94" fill="none" stroke="#5B4E2A" stroke-width="2.4" stroke-linejoin="round"/>` +
        `<ellipse cx="60" cy="96" rx="17" ry="14" fill="#EAD9A2" ${line}/>` +
        `<path d="M53 73 L60 90 L67 73" fill="none" stroke="#2C4A8C" stroke-width="2.6"/><rect x="54" y="88" width="12" height="9" rx="1.5" fill="#fff" stroke="#2C4A8C" stroke-width="2"/><rect x="56.5" y="90.5" width="7" height="2" fill="#2C4A8C"/>` +
        `<circle cx="60" cy="48" r="29" fill="#9CCB8A" ${line}/>` +
        `<path d="M44 30 Q48 27 52 30 M68 30 Q72 27 76 30" fill="none" stroke="#7DB06C" stroke-width="2.4" stroke-linecap="round"/>` +
        eyes(m, 49, 71, 50) + blush(42, 78, 58) + mouth(m, 60, 60) +
        `<g transform="rotate(10 96 88)"><rect x="86" y="76" width="18" height="24" rx="2" fill="#F5ECD6" ${line}/><rect x="91" y="72" width="8" height="6" rx="1.5" fill="#B8B8B8" ${line}/><path d="M90 85 H100 M90 90 H100 M90 95 H96" stroke="#8A7E66" stroke-width="2" stroke-linecap="round"/></g>`
    },
    bear: {
      name: '台灣黑熊', role: '審判長', price: 120,
      draw: m => shadow + feet('#2B2B33') + robe('#233A80', '#6E9BF2') +
        `<path d="M51 73 L60 84 L69 73" fill="#F3F0E6"/>` +
        `<circle cx="34" cy="24" r="10" fill="#2B2B33" ${line}/><circle cx="86" cy="24" r="10" fill="#2B2B33" ${line}/><circle cx="34" cy="24" r="4.5" fill="#555563"/><circle cx="86" cy="24" r="4.5" fill="#555563"/>` +
        `<circle cx="60" cy="48" r="29" fill="#2B2B33" ${line}/>` +
        `<ellipse cx="60" cy="60" rx="13" ry="9.5" fill="#D8B38A" ${line}/><ellipse cx="60" cy="55.5" rx="4.4" ry="3.2" fill="${INK}"/>` +
        eyes(m, 48, 72, 46, true) + mouth(m, 60, 63) +
        `<g transform="rotate(-25 95 84)"><rect x="93" y="78" width="5" height="26" rx="2" fill="#9A6236" ${line}/><rect x="84" y="70" width="23" height="11" rx="3" fill="#7B4A27" ${line}/></g>`
    },
    leopard: {
      name: '石虎', role: '檢察官', price: 120,
      draw: m => shadow + feet('#D4AC73') + robe('#2A2A30', '#8C5CC4') +
        `<path d="M33 30 L36 8 L52 22 Z" fill="#C79A5E" ${line}/><path d="M87 30 L84 8 L68 22 Z" fill="#C79A5E" ${line}/><circle cx="39" cy="19" r="2.6" fill="#fff"/><circle cx="81" cy="19" r="2.6" fill="#fff"/>` +
        `<circle cx="60" cy="48" r="29" fill="#D9B27A" ${line}/>` +
        `<path d="M53 21 L54.5 34 M60 20 L60 33 M67 21 L65.5 34" stroke="#5A4026" stroke-width="2.6" stroke-linecap="round"/>` +
        `<path d="M42 44 Q46 40 52 42 M78 44 Q74 40 68 42" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>` +
        `<circle cx="38" cy="58" r="1.8" fill="#5A4026"/><circle cx="43" cy="64" r="1.8" fill="#5A4026"/><circle cx="82" cy="58" r="1.8" fill="#5A4026"/><circle cx="77" cy="64" r="1.8" fill="#5A4026"/>` +
        `<ellipse cx="60" cy="61" rx="10" ry="7" fill="#F6EBDA"/><path d="M57 56 L63 56 L60 59.5 Z" fill="#D9777B" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>` +
        eyes(m, 48, 72, 49) + mouth(m, 60, 63) +
        `<rect x="84" y="80" width="20" height="26" rx="2" fill="#3F6FB8" ${line} transform="rotate(8 94 93)"/><path d="M89 88 H100 M89 93 H100" stroke="#fff" stroke-width="2" transform="rotate(8 94 93)"/>`
    },
    owl: {
      name: '貓頭鷹', role: '書記官', price: 100,
      draw: m => shadow + feet('#E2A13B') + robe('#1F1F24', '#4A4A52') +
        `<path d="M34 30 L38 12 L50 24 Z M86 30 L82 12 L70 24 Z" fill="#8A6A48" ${line}/>` +
        `<circle cx="60" cy="48" r="29" fill="#A07E5A" ${line}/>` +
        `<path d="M40 62 Q60 74 80 62" fill="none" stroke="#8A6A48" stroke-width="2.4"/>` +
        `<circle cx="49" cy="48" r="12" fill="#F1E4CC" ${line}/><circle cx="71" cy="48" r="12" fill="#F1E4CC" ${line}/>` +
        eyes(m, 49, 71, 48) +
        `<circle cx="49" cy="48" r="9" fill="none" stroke="#B48A2C" stroke-width="2.2"/><circle cx="71" cy="48" r="9" fill="none" stroke="#B48A2C" stroke-width="2.2"/><path d="M58 47 H62" stroke="#B48A2C" stroke-width="2.2"/>` +
        `<path d="M56 58 L64 58 L60 65 Z" fill="#E2A13B" ${line}/>` +
        `<rect x="84" y="82" width="18" height="22" rx="2" fill="#fff" ${line} transform="rotate(-6 93 93)"/><path d="M98 70 L88 96" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><path d="M98 70 L101 66" stroke="#C0392B" stroke-width="4" stroke-linecap="round"/>`
    },
    shiba: {
      name: '柴犬', role: '法警', price: 100,
      draw: m => shadow + feet('#E39A4F') +
        `<path d="M33 110 L36 84 Q38 74 50 72 L70 72 Q82 74 84 84 L87 110 Q60 115 33 110 Z" fill="#2A3B6B" ${line}/><circle cx="60" cy="86" r="2.2" fill="#E5C25A"/><circle cx="60" cy="96" r="2.2" fill="#E5C25A"/><path d="M42 82 L52 82" stroke="#E5C25A" stroke-width="3"/>` +
        `<path d="M34 34 L36 12 L52 24 Z M86 34 L84 12 L68 24 Z" fill="#E39A4F" ${line}/><path d="M38 28 L39 17 L47 24 Z M82 28 L81 17 L73 24 Z" fill="#F7D9B5"/>` +
        `<circle cx="60" cy="50" r="28" fill="#E39A4F" ${line}/>` +
        `<path d="M36 56 Q40 76 60 77 Q80 76 84 56 Q74 52 60 58 Q46 52 36 56 Z" fill="#FFF3E2"/>` +
        `<circle cx="51" cy="42" r="2" fill="#FFF3E2"/><circle cx="69" cy="42" r="2" fill="#FFF3E2"/>` +
        `<ellipse cx="60" cy="59" rx="4.6" ry="3.4" fill="${INK}"/>` +
        eyes(m, 49, 71, 50) + blush(41, 79, 62) + mouth(m, 60, 65) +
        `<path d="M34 30 Q60 6 86 30 Z" fill="#1F2E5A" ${line}/><rect x="31" y="27" width="58" height="7" rx="3.5" fill="#141F40" ${line}/><path d="M60 14 L63 19 L60 23 L57 19 Z" fill="#E5C25A"/>`
    },
    magpie: {
      name: '台灣藍鵲', role: '通譯', price: 150,
      draw: m => shadow + feet('#D8432F') +
        `<path d="M30 100 Q8 108 4 92 Q16 96 30 92 Z" fill="#2D6FD0" ${line}/><path d="M6 93 Q10 98 15 96" stroke="#fff" stroke-width="3" fill="none"/>` +
        `<path d="M33 110 L36 84 Q38 74 50 72 L70 72 Q82 74 84 84 L87 110 Q60 115 33 110 Z" fill="#2D6FD0" ${line}/><path d="M48 80 Q60 92 72 80 L74 108 Q60 112 46 108 Z" fill="#EEF3FA"/>` +
        `<circle cx="60" cy="48" r="28" fill="#1E2430" ${line}/>` +
        `<circle cx="49" cy="49" r="7.4" fill="#F2C94C"/><circle cx="71" cy="49" r="7.4" fill="#F2C94C"/>` +
        eyes(m, 49, 71, 49) +
        `<path d="M54 58 L66 58 L60 70 Z" fill="#E2452F" ${line}/>` +
        `<path d="M32 46 Q32 16 60 16 Q88 16 88 46" fill="none" stroke="#9AA3AE" stroke-width="4"/><rect x="26" y="40" width="9" height="15" rx="4" fill="#5B6474" ${line}/><rect x="85" y="40" width="9" height="15" rx="4" fill="#5B6474" ${line}/><path d="M31 55 Q34 68 46 68" fill="none" stroke="#5B6474" stroke-width="2.6"/><circle cx="47" cy="68" r="3" fill="#5B6474"/>`
    },
    egret: {
      name: '白鷺鷥', role: '律師', price: 150,
      draw: m => shadow + feet('#2A2320') + robe('#1C1C21', '#F4F4F0') +
        `<path d="M62 20 Q70 4 84 8 Q74 12 70 22" fill="#fff" ${line}/>` +
        `<circle cx="60" cy="48" r="28" fill="#FBFBF7" ${line}/>` +
        eyes(m, 50, 70, 47) + blush(43, 77, 56) +
        `<path d="M58 55 L84 62 L58 64 Z" fill="#E8B730" ${line}/><path d="M76 60 L84 62 L76 63" fill="${INK}"/>` +
        (m === 'happy' ? `<path d="M50 66 Q55 70 60 66" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>` : '') +
        `<rect x="84" y="84" width="22" height="16" rx="3" fill="#7A4E2B" ${line}/><path d="M91 84 Q95 78 99 84" fill="none" stroke="${INK}" stroke-width="2.6"/>`
    },
    deer: {
      name: '梅花鹿', role: '證人', price: 180,
      draw: m => shadow + feet('#8A5730') +
        `<path d="M33 110 L36 84 Q38 74 50 72 L70 72 Q82 74 84 84 L87 110 Q60 115 33 110 Z" fill="#3A9A8A" ${line}/><path d="M52 73 L60 82 L68 73" fill="none" stroke="#2C7A6D" stroke-width="3"/>` +
        `<path d="M84 86 Q96 74 98 56" fill="none" stroke="#B9763F" stroke-width="7" stroke-linecap="round"/><path d="M84 86 Q96 74 98 56" fill="none" stroke="${INK}" stroke-width="${SW}" stroke-linecap="round" opacity="0"/><circle cx="98" cy="52" r="6.5" fill="#B9763F" ${line}/>` +
        `<path d="M44 22 L40 6 M40 12 L34 8 M76 22 L80 6 M80 12 L86 8" stroke="#6B4A2B" stroke-width="4" stroke-linecap="round"/>` +
        `<ellipse cx="30" cy="40" rx="11" ry="5.5" fill="#B9763F" ${line} transform="rotate(-20 30 40)"/><ellipse cx="90" cy="40" rx="11" ry="5.5" fill="#B9763F" ${line} transform="rotate(20 90 40)"/>` +
        `<circle cx="60" cy="49" r="27" fill="#C4844A" ${line}/>` +
        `<circle cx="47" cy="33" r="2.4" fill="#FFF4E2"/><circle cx="56" cy="29" r="2" fill="#FFF4E2"/><circle cx="70" cy="31" r="2.4" fill="#FFF4E2"/><circle cx="76" cy="38" r="1.8" fill="#FFF4E2"/>` +
        `<ellipse cx="60" cy="63" rx="11" ry="8" fill="#F3DFC6"/><ellipse cx="60" cy="58.5" rx="3.8" ry="2.8" fill="${INK}"/>` +
        eyes(m, 49, 71, 49) + blush(41, 79, 58) + mouth(m, 60, 66)
    },
  };

  function svg(id, mood, opts) {
    const d = DEF[id] || DEF.turtle; opts = opts || {};
    return `<svg class="${opts.cls || 'chr'}" viewBox="0 0 120 120" aria-hidden="true">${d.draw(mood || 'idle')}</svg>`;
  }
  window.CHARS = { list: Object.keys(DEF).map(k => ({ id: k, name: DEF[k].name, role: DEF[k].role, price: DEF[k].price })), svg };
})();
