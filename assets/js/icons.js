/* أيقونات الواجهة (خطية) + رسوم المنتجات التوضيحية — كلها SVG داخلي لسرعة قصوى */

const UI = {
  home:'<path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V20h13V9.5"/><path d="M9.5 20v-5.5h5V20"/>',
  cart:'<circle cx="9.5" cy="20" r="1.4"/><circle cx="17.5" cy="20" r="1.4"/><path d="M2.5 3.5h2.6l2.2 11a1.6 1.6 0 0 0 1.6 1.3h8.6a1.6 1.6 0 0 0 1.6-1.3l1.4-7.2H6.2"/>',
  grid:'<rect x="3" y="3" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2"/>',
  phone:'<path d="M21 16.9v2.6a1.8 1.8 0 0 1-2 1.8 17.6 17.6 0 0 1-7.7-2.7 17.3 17.3 0 0 1-5.3-5.3A17.6 17.6 0 0 1 3.3 5.6 1.8 1.8 0 0 1 5.1 3.6h2.6a1.8 1.8 0 0 1 1.8 1.6c.1 1 .3 1.9.6 2.8a1.8 1.8 0 0 1-.4 1.9l-1.1 1.1a14 14 0 0 0 5.3 5.3l1.1-1.1a1.8 1.8 0 0 1 1.9-.4c.9.3 1.8.5 2.8.6a1.8 1.8 0 0 1 1.6 1.8z"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',
  heart:'<path d="M12 20.5s-7.8-4.6-7.8-10A4.4 4.4 0 0 1 12 7.4a4.4 4.4 0 0 1 7.8 3.1c0 5.4-7.8 10-7.8 10z"/>',
  menu:'<path d="M3.5 6.5h17M3.5 12h17M3.5 17.5h17"/>',
  close:'<path d="m6 6 12 12M18 6 6 18"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  minus:'<path d="M5 12h14"/>',
  trash:'<path d="M4 7h16"/><path d="M9.5 7V5.2A1.2 1.2 0 0 1 10.7 4h2.6a1.2 1.2 0 0 1 1.2 1.2V7"/><path d="M6.5 7v12.3A1.7 1.7 0 0 0 8.2 21h7.6a1.7 1.7 0 0 0 1.7-1.7V7"/><path d="M10.5 11v6M13.5 11v6"/>',
  whatsapp:'<path d="M20.4 11.6A8.4 8.4 0 0 1 7.9 19l-4.4 1.2 1.2-4.3A8.4 8.4 0 1 1 20.4 11.6z"/><path d="M9 8.7c.2-.5.5-.5.8-.5h.6c.2 0 .4 0 .6.5l.7 1.7c.1.3 0 .5-.1.7l-.4.5c-.1.2-.2.4 0 .7a6.6 6.6 0 0 0 2.9 2.4c.3.1.5.1.7-.1l.5-.6c.2-.2.4-.2.6-.1l1.6.8c.3.1.4.3.4.5a1.9 1.9 0 0 1-1.3 1.6 3.4 3.4 0 0 1-2.4-.3 10.5 10.5 0 0 1-5.1-4.6 3.7 3.7 0 0 1-.5-2.1A2.3 2.3 0 0 1 9 8.7z"/>',
  facebook:'<path d="M14.5 8.5h2.3V5.2h-2.6c-2.4 0-3.9 1.5-3.9 4v2.1H8v3.3h2.3V21h3.4v-6.4h2.4l.4-3.3h-2.8V9.6c0-.7.3-1.1.8-1.1z"/>',
  instagram:'<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17" cy="7" r="1.1" fill="currentColor" stroke="none"/>',
  tiktok:'<path d="M15 3.5c.4 2.3 1.8 3.7 4.1 3.9v3c-1.5.1-2.9-.3-4.1-1.1v5.9a5.6 5.6 0 1 1-5.6-5.6c.3 0 .6 0 .9.1v3.1a2.6 2.6 0 1 0 1.8 2.5V3.5z"/>',
  telegram:'<path d="M21 4.5 2.9 11.4c-.7.3-.7 1.2 0 1.4l4.5 1.5 1.7 5.1c.2.6 1 .8 1.4.3l2.5-2.6 4.6 3.4c.5.4 1.3.1 1.4-.6L21.9 5.6c.2-.8-.5-1.4-1.2-1.1z"/><path d="m7.4 14.3 10-7.5-6.8 8.2"/>',
  location:'<path d="M12 21s7-5.7 7-11a7 7 0 1 0-14 0c0 5.3 7 11 7 11z"/><circle cx="12" cy="10" r="2.7"/>',
  clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  chevron:'<path d="m15 5-6 7 6 7"/>',
  chevronDown:'<path d="m5 9 7 6 7-6"/>',
  check:'<path d="m5 12.5 4.5 4.5L19 7"/>',
  star:'<path d="m12 3.8 2.6 5.3 5.9.8-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.9l5.9-.8z"/>',
  truck:'<path d="M2.5 6.5h11v10h-11z"/><path d="M13.5 10h3.8l3.2 3v3.5h-7z"/><circle cx="7" cy="18.5" r="1.8"/><circle cx="17" cy="18.5" r="1.8"/>',
  shield:'<path d="M12 3.2 4.8 6v6c0 4.3 3 7.6 7.2 8.8 4.2-1.2 7.2-4.5 7.2-8.8V6z"/><path d="m9 12 2.2 2.2L15.4 10"/>',
  bolt:'<path d="M13.5 3 5 13.5h5.5L10 21l8.5-10.5H13z"/>',
  filter:'<path d="M3.5 6h17M6.5 12h11M10 18h4"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>',
  box:'<path d="m12 3 8 4.3v9.4L12 21l-8-4.3V7.3z"/><path d="M4 7.3 12 12l8-4.7M12 12v9"/>',
  edit:'<path d="M4 20.2h4.2L19.4 9a2.3 2.3 0 0 0 0-3.3l-1.1-1.1a2.3 2.3 0 0 0-3.3 0L4 15.8z"/><path d="m13.8 6 4.2 4.2"/>',
  copy:'<rect x="8.5" y="8.5" width="12" height="12" rx="2.5"/><path d="M15.5 5.5A2 2 0 0 0 13.7 4H6a2.5 2.5 0 0 0-2.5 2.5V14a2 2 0 0 0 1.5 1.8"/>',
  headset:'<path d="M4.5 15v-3a7.5 7.5 0 0 1 15 0v3"/><rect x="2.5" y="13.5" width="4" height="6" rx="2"/><rect x="17.5" y="13.5" width="4" height="6" rx="2"/><path d="M19.5 19.5A2.5 2.5 0 0 1 17 22h-2"/>',
  tag:'<path d="M11.6 3.5H20v8.4l-8.3 8.3a1.7 1.7 0 0 1-2.4 0l-6-6a1.7 1.7 0 0 1 0-2.4z"/><circle cx="16.2" cy="7.3" r="1.4"/>'
};

/* رسوم المنتجات — viewBox 0 0 120 120
   c1 = لون العلامة، c2 = لون فاتح منه، c3 = رصاصي، c4 = رصاصي فاتح */
const ART = {
  bulb:`<path class="c2" d="M60 20a26 26 0 0 1 16 46.5c-2.4 1.9-3.6 4-3.9 7H47.9c-.3-3-1.5-5.1-3.9-7A26 26 0 0 1 60 20z"/><path class="c1" d="M60 30a16 16 0 0 1 10 28.5c-1.5 1.2-2.2 2.5-2.4 4.3H52.4c-.2-1.8-.9-3.1-2.4-4.3A16 16 0 0 1 60 30z" opacity=".55"/><rect class="c3" x="47" y="78" width="26" height="7" rx="3.5"/><rect class="c3" x="49" y="88" width="22" height="6" rx="3"/><path class="c4" d="M53 99h14v3a5 5 0 0 1-5 5h-4a5 5 0 0 1-5-5z"/><g class="ln"><path d="M60 8v7M28 22l5 5M92 22l-5 5M14 55h7M99 55h7"/></g>`,
  spot:`<ellipse class="c4" cx="60" cy="34" rx="34" ry="9"/><path class="c3" d="M26 34h68v6a10 10 0 0 1-10 10H36a10 10 0 0 1-10-10z"/><ellipse class="c1" cx="60" cy="40" rx="21" ry="6"/><path class="c2" d="M39 42 26 104h68L81 42a21 6 0 0 1-42 0z" opacity=".38"/><ellipse class="c2" cx="60" cy="104" rx="34" ry="8" opacity=".55"/>`,
  panelLight:`<rect class="c3" x="14" y="26" width="92" height="68" rx="10"/><rect class="c2" x="21" y="33" width="78" height="54" rx="6"/><rect class="c1" x="30" y="42" width="60" height="36" rx="4" opacity=".45"/><g class="ln"><path d="M38 52h44M38 60h44M38 68h30"/></g>`,
  chandelier:`<path class="ln" d="M60 14v16M32 44v12M60 44v16M88 44v12"/><rect class="c4" x="44" y="6" width="32" height="9" rx="4"/><rect class="c3" x="24" y="34" width="72" height="10" rx="5"/><path class="c1" d="M18 56h28l-7 26H25z"/><path class="c1" d="M74 56h28l-7 26H81z"/><path class="c2" d="M45 60h30l-9 30H54z"/><g class="ln"><path d="M22 90h20M78 90h20M52 98h16"/></g>`,
  wallLight:`<rect class="c3" x="16" y="30" width="12" height="60" rx="5"/><path class="c1" d="M28 44h44a16 16 0 0 1 16 16v0a16 16 0 0 1-16 16H28z"/><path class="c2" d="M88 34c8 4 14 12 16 22M88 86c8-4 14-12 16-22" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" opacity=".5"/><circle class="c2" cx="60" cy="60" r="9" opacity=".7"/>`,
  magnetic:`<rect class="c3" x="8" y="20" width="104" height="16" rx="5"/><rect class="c4" x="14" y="25" width="92" height="6" rx="3"/><rect class="c1" x="24" y="36" width="20" height="30" rx="5"/><path class="c2" d="M24 66h20l9 30H15z"/><rect class="c1" x="68" y="36" width="34" height="14" rx="6"/><path class="c2" d="M68 50h34l5 22H63z"/>`,
  strip:`<rect class="c3" x="6" y="42" width="108" height="28" rx="7"/><g class="c1">${[0,1,2,3,4,5].map(i=>`<rect x="${14+i*17}" y="49" width="12" height="14" rx="3"/>`).join('')}</g><path class="c2" d="M6 70h108v10a7 7 0 0 1-7 7H13a7 7 0 0 1-7-7z"/><g class="ln"><path d="M22 36v-9M60 36v-9M98 36v-9"/></g>`,
  profile:`<rect class="c4" x="10" y="28" width="100" height="14" rx="6"/><path class="c3" d="M10 42h100v26a8 8 0 0 1-8 8H18a8 8 0 0 1-8-8z"/><rect class="c2" x="22" y="48" width="76" height="16" rx="8"/><g class="c1">${[0,1,2,3,4].map(i=>`<circle cx="${34+i*13}" cy="56" r="5"/>`).join('')}</g><g class="ln"><path d="M18 88h84"/></g>`,
  bracket:`<rect class="c3" x="18" y="22" width="12" height="76" rx="4"/><rect class="c3" x="26" y="52" width="52" height="10" rx="5"/><path class="ln" d="M30 30 74 54"/><path class="c1" d="M74 40h30l-6 34H80z"/><circle class="c2" cx="89" cy="80" r="9" opacity=".7"/>`,
  floodlight:`<path class="c3" d="M22 26h76a6 6 0 0 1 6 6v40a6 6 0 0 1-6 6H22a6 6 0 0 1-6-6V32a6 6 0 0 1 6-6z"/><rect class="c2" x="24" y="34" width="72" height="36" rx="4"/><g class="c1" opacity=".5">${[0,1,2,3].map(i=>`<rect x="${28+i*18}" y="38" width="14" height="28" rx="2"/>`).join('')}</g><path class="c4" d="M52 78h16v10H52z"/><path class="c3" d="M34 96h52v8H34z" rx="4"/>`,
  cableRoll:`<circle class="c3" cx="60" cy="60" r="42"/><circle class="c4" cx="60" cy="60" r="32"/><circle class="c1" cx="60" cy="60" r="22"/><circle class="c2" cx="60" cy="60" r="12"/><circle cx="60" cy="60" r="5" fill="#fff"/><g class="ln"><path d="M60 18v10M102 60H92M60 102V92M18 60h10"/></g>`,
  wire:`<g transform="rotate(-8 60 60)"><rect class="c1" x="2" y="30" width="78" height="24" rx="12"/><path class="c5" d="M80 35h24a7 7 0 0 1 0 14H80z"/><rect class="c3" x="2" y="66" width="78" height="24" rx="12"/><path class="c5" d="M80 71h24a7 7 0 0 1 0 14H80z"/><g class="ln"><path d="M88 42h10M88 78h10"/></g></g>`,
  breaker:`<rect class="c4" x="34" y="16" width="52" height="88" rx="8"/><rect class="c3" x="34" y="16" width="52" height="22" rx="8"/><rect class="c1" x="46" y="44" width="28" height="26" rx="5"/><path class="c2" d="M52 48h16v10H52z"/><g class="ln"><path d="M60 16v-8M60 112v-8M42 82h36M42 92h36"/></g>`,
  ats:`<rect class="c4" x="14" y="24" width="92" height="72" rx="10"/><rect class="c3" x="22" y="32" width="76" height="24" rx="5"/><path class="c1" d="M30 38h26v12H30z"/><circle class="c1" cx="42" cy="76" r="12"/><circle class="c2" cx="78" cy="76" r="12"/><g class="ln"><path d="M42 68v8M78 68v8M64 38h26M64 46h18"/></g>`,
  board:`<rect class="c3" x="12" y="20" width="96" height="80" rx="10"/><rect class="c4" x="20" y="28" width="80" height="64" rx="6"/><g class="c1">${[0,1,2].map(r=>[0,1,2,3].map(i=>`<rect x="${28+i*16}" y="${36+r*20}" width="10" height="14" rx="2"/>`).join('')).join('')}</g><g class="ln"><path d="M20 60h80"/></g>`,
  relay:`<rect class="c4" x="26" y="20" width="68" height="60" rx="8"/><rect class="c1" x="34" y="28" width="52" height="26" rx="4"/><path class="c2" d="M40 34h40v14H40z" opacity=".6"/><g class="c3">${[0,1,2,3].map(i=>`<rect x="${34+i*16}" y="80" width="6" height="20" rx="3"/>`).join('')}</g><g class="ln"><path d="M34 64h52"/></g>`,
  indicator:`<circle class="c3" cx="60" cy="56" r="34"/><circle class="c1" cx="60" cy="56" r="24"/><circle class="c2" cx="60" cy="56" r="14" opacity=".8"/><circle cx="53" cy="49" r="5" fill="#fff" opacity=".6"/><rect class="c4" x="48" y="88" width="24" height="16" rx="4"/><g class="ln"><path d="M60 12v8M96 30l-6 5M24 30l6 5"/></g>`,
  protector:`<rect class="c4" x="24" y="12" width="72" height="96" rx="12"/><rect class="c3" x="32" y="24" width="56" height="34" rx="6"/><path class="c1" d="M40 32h40v18H40z"/><g class="ln"><path d="M46 41h6M56 41h6M66 41h6"/></g><rect class="c2" x="32" y="68" width="56" height="28" rx="6"/><circle class="c1" cx="60" cy="82" r="7"/><g class="ln"><path d="M84 16h4M84 104h4"/></g>`,
  junction:`<rect class="c3" x="20" y="20" width="80" height="80" rx="14"/><rect class="c4" x="30" y="30" width="60" height="60" rx="8"/><circle class="c1" cx="60" cy="60" r="16"/><path class="c2" d="M52 60h16M60 52v16" stroke="#fff" stroke-width="4" stroke-linecap="round"/><g class="c3"><rect x="4" y="50" width="18" height="20" rx="6"/><rect x="98" y="50" width="18" height="20" rx="6"/><rect x="50" y="2" width="20" height="18" rx="6"/></g>`,
  conduit:`<rect class="c3" x="4" y="34" width="66" height="34" rx="17"/><rect class="c4" x="12" y="42" width="52" height="18" rx="9"/><rect class="c1" x="62" y="26" width="20" height="50" rx="9"/><rect class="c3" x="80" y="34" width="34" height="34" rx="17"/><rect class="c4" x="88" y="42" width="20" height="18" rx="9"/><g class="ln"><path d="M20 86h80"/></g>`,
  tray:`<path class="c3" d="M10 40h100v12H10z"/><path class="c4" d="M10 52h10v40H10zM100 52h10v40h-10z"/><g class="c1">${[0,1,2,3,4].map(i=>`<rect x="${22+i*17}" y="58" width="10" height="26" rx="3"/>`).join('')}</g><g class="ln"><path d="M10 92h100"/></g>`,
  blade:`<path class="c3" d="M22 62 76 8l14 14-54 54H22z" rx="4"/><path class="c4" d="M32 62 76 18l6 6-44 44z"/><path class="c1" d="M16 76h44l14 14-14 14H16a6 6 0 0 1-6-6V82a6 6 0 0 1 6-6z"/><g class="ln"><path d="M26 90h22"/></g>`,
  screw:`<g transform="rotate(12 60 60)"><path class="c3" d="M22 8h34v14a7 7 0 0 1-7 7H29a7 7 0 0 1-7-7z"/><path class="ln" d="M30 16h18"/><path class="c5" d="M28 29h22l-11 80z"/><g class="ln"><path d="M27 42h24M29 56h20M31 70h16M33 84h12"/></g><path class="c1" d="M74 26h26v54a13 13 0 0 1-26 0z"/><g class="ln"><path d="M74 42h26M74 58h26M74 74h26"/></g></g>`,
  helmet:`<path class="c1" d="M60 18a34 34 0 0 1 34 34v22H26V52a34 34 0 0 1 34-34z"/><path class="c2" d="M60 18a12 34 0 0 1 12 34v22H48V52a12 34 0 0 1 12-34z" opacity=".5"/><rect class="c3" x="12" y="74" width="96" height="14" rx="7"/><g class="ln"><path d="M34 96h52"/></g>`,
  screwdriver:`<g transform="translate(0,14) rotate(-30 60 60)"><path class="c1" d="M54 18h28a13 13 0 0 1 13 13v24a13 13 0 0 1-13 13H54z"/><g class="ln"><path d="M64 26v34M74 26v34M84 26v34"/></g><rect class="c3" x="40" y="34" width="16" height="18" rx="4"/><rect class="c4" x="8" y="37" width="34" height="12" rx="3"/><rect class="c3" x="2" y="38" width="8" height="10" rx="2"/></g>`,
  plier:`<path class="c3" d="M40 6h14l12 44H52z"/><path class="c3" d="M80 6H66L54 50h14z"/><circle class="c4" cx="60" cy="56" r="12"/><circle class="c3" cx="60" cy="56" r="4.5"/><path class="c1" d="M50 64h12L46 112H28z"/><path class="c1" d="M70 64H58l16 48h18z"/>`,
  multimeter:`<rect class="c4" x="24" y="14" width="72" height="82" rx="12"/><rect class="c3" x="32" y="24" width="56" height="26" rx="5"/><path class="c1" d="M38 30h44v14H38z"/><circle class="c1" cx="60" cy="70" r="16"/><path d="M60 58v12" stroke="#fff" stroke-width="4" stroke-linecap="round"/><g class="c3"><circle cx="40" cy="96" r="5"/><circle cx="80" cy="96" r="5"/></g><g class="ln"><path d="M40 101c-8 6-14 10-24 11M80 101c8 6 14 10 24 11"/></g>`,
  drill:`<path class="c1" d="M18 30h54a10 10 0 0 1 10 10v18a10 10 0 0 1-10 10H18z" rx="8"/><path class="c3" d="M82 40h16v18H82z"/><rect class="c4" x="96" y="42" width="18" height="14" rx="7"/><path class="c1" d="M30 68h24l-6 36H36z"/><path class="c3" d="M28 104h30v8H28z" rx="4"/><g class="ln"><path d="M100 49h12"/></g>`,
  socket:`<rect class="c4" x="18" y="18" width="84" height="84" rx="16"/><circle class="c3" cx="60" cy="60" r="30"/><circle class="c2" cx="60" cy="60" r="24"/><g class="c1"><rect x="44" y="50" width="8" height="20" rx="4"/><rect x="68" y="50" width="8" height="20" rx="4"/><rect x="54" y="34" width="12" height="7" rx="3.5"/></g>`,
  extension:`<rect class="c4" x="30" y="26" width="76" height="34" rx="10"/><g class="c1">${[0,1,2].map(i=>`<circle cx="${48+i*22}" cy="43" r="9"/>`).join('')}</g><path class="ln" d="M30 43H18a12 12 0 0 0-12 12v28a12 12 0 0 0 12 12h18" fill="none" stroke-width="7"/><rect class="c3" x="34" y="84" width="26" height="18" rx="6"/><g class="ln"><path d="M42 90v6M52 90v6"/></g>`,
  satellite:`<path class="c4" d="M92 16A66 66 0 0 0 22 86a48 48 0 0 1 70-70z"/><path class="c2" d="M84 28A50 50 0 0 0 34 78a36 36 0 0 1 50-50z" opacity=".6"/><rect class="c1" x="52" y="46" width="16" height="16" rx="5"/><path class="ln" d="M60 62 44 88M30 100h56"/><path class="c3" d="M40 96h40v8H40z" rx="4"/>`,
  exhaust:`<rect class="c3" x="12" y="12" width="96" height="96" rx="16"/><rect class="c4" x="22" y="22" width="76" height="76" rx="10"/><g class="c1"><path d="M60 34c14 0 22 8 22 18s-10 8-14 4-8-22-8-22z"/><path d="M86 60c0 14-8 22-18 22s-8-10-4-14 22-8 22-8z"/><path d="M60 86c-14 0-22-8-22-18s10-8 14-4 8 22 8 22z"/><path d="M34 60c0-14 8-22 18-22s8 10 4 14-22 8-22 8z"/></g><circle class="c3" cx="60" cy="60" r="8"/>`,
  fan:`<rect class="c4" x="44" y="4" width="32" height="9" rx="4"/><rect class="c3" x="55" y="12" width="10" height="30" rx="5"/><g class="c1"><ellipse cx="60" cy="42" rx="12" ry="24"/><ellipse cx="60" cy="42" rx="12" ry="24" transform="rotate(120 60 70)"/><ellipse cx="60" cy="42" rx="12" ry="24" transform="rotate(240 60 70)"/></g><circle class="c3" cx="60" cy="70" r="15"/><circle class="c4" cx="60" cy="70" r="7"/>`,
  pump:`<rect class="c1" x="20" y="40" width="52" height="46" rx="12"/><circle class="c2" cx="46" cy="63" r="15" opacity=".7"/><circle cx="46" cy="63" r="6" fill="#fff" opacity=".8"/><rect class="c3" x="72" y="50" width="30" height="26" rx="6"/><rect class="c4" x="40" y="24" width="18" height="18" rx="6"/><path class="c3" d="M14 86h84v12H14z" rx="5"/><g class="ln"><path d="M102 58h10M102 68h10"/></g>`,
  doorbell:`<rect class="c4" x="34" y="10" width="52" height="100" rx="16"/><circle class="c1" cx="60" cy="42" r="18"/><circle class="c2" cx="60" cy="42" r="9"/><rect class="c3" x="44" y="72" width="32" height="8" rx="4"/><rect class="c3" x="44" y="86" width="32" height="8" rx="4"/><g class="ln"><path d="M96 30c6 8 6 22 0 30M104 22c10 12 10 34 0 46"/></g>`,
  battery:`<rect class="c3" x="24" y="20" width="72" height="86" rx="12"/><rect class="c4" x="32" y="30" width="56" height="66" rx="7"/><rect class="c1" x="40" y="52" width="40" height="36" rx="5"/><path class="c2" d="M40 40h40v10H40z" opacity=".7"/><g class="c3"><rect x="34" y="6" width="18" height="14" rx="5"/><rect x="68" y="6" width="18" height="14" rx="5"/></g><path d="M62 58 52 74h8l-2 12 12-18h-8z" fill="#fff"/>`
};

/* مولّدات SVG */
function icon(name, cls) {
  const d = UI[name] || UI.box;
  return `<svg class="ic ${cls || ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"
    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
}
function art(name) {
  const d = ART[name] || ART.box || ART.junction;
  return `<svg class="art" viewBox="0 0 120 120" aria-hidden="true">${d}</svg>`;
}
