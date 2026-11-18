// Каталог украшений и бижутерии (цены в белорусских рублях). Общий для index.html и catalog.html.
//
// КАРТИНКИ. У каждого товара своё настоящее фото с Unsplash (бесплатная лицензия), все фото разные,
// а названия подобраны по тому, что изображено на снимке.
// Чтобы поставить своё фото, впишите его в MY_PHOTOS по номеру товара, например: 1: 'img/ring1.jpg'
// Если фото не загрузится (нет интернета), покажется нарисованная картинка того же типа украшения.
const MY_PHOTOS = {
  // 1: 'img/ring1.jpg',
};

const MET = { gold: ['#b9893b', '#f6e0a4'], silver: ['#8e9aa7', '#f4f7fa'], rose: ['#b86f60', '#f6c9ba'] };
const BGS = { a: ['#a4708f', '#e9cfc5'], b: ['#86405c', '#d8b4cc'], c: ['#8fa9b3', '#fdf5f0'], d: ['#bf8fae', '#f3dfd6'], e: ['#6f93a3', '#eef3f5'], f: ['#c9a3b9', '#fbf1f5'] };
const GEMS = { clear: ['#ffffff', '#bcd9f5'], pink: ['#ffd3e3', '#e0679a'], lilac: ['#eadcff', '#9a6fd0'], green: ['#d6f5e6', '#4fae86'], blue: ['#d9e8ff', '#5b8fdc'], red: ['#ffc9d3', '#b8304f'] };

// Рисует украшение: kind — что нарисовать, metal — металл, gem — цвет камня, bg — цвет фона. Возвращает data-URI картинки 4:3
function jewelryArt(kind, metal, gem, bg) {
  const m = MET[metal] || MET.gold, b = BGS[bg] || BGS.a, g = GEMS[gem] || GEMS.clear;
  const M = 'url(#m)', G = 'url(#g)', rad = Math.PI / 180;
  const f = n => Math.round(n * 10) / 10;
  // огранённый камень
  const gm = (x, y, r) => `<polygon points="${[[x - r, y], [x - r * .6, y - r * .75], [x + r * .6, y - r * .75], [x + r, y], [x, y + r * 1.15]].map(p => f(p[0]) + ',' + f(p[1])).join(' ')}" fill="${G}" stroke="#fff" stroke-opacity=".8" stroke-width="1.5" stroke-linejoin="round"/><path d="M${f(x - r)} ${f(y)}H${f(x + r)}M${f(x - r * .6)} ${f(y - r * .75)}L${f(x - r * .3)} ${f(y)}L${f(x)} ${f(y + r * 1.15)}L${f(x + r * .3)} ${f(y)}L${f(x + r * .6)} ${f(y - r * .75)}" stroke="#fff" stroke-opacity=".55" fill="none"/>`;
  // жемчужина
  const pr = (x, y, r) => `<circle cx="${f(x)}" cy="${f(y)}" r="${r}" fill="url(#p)" stroke="#b9aa9d" stroke-opacity=".5"/><circle cx="${f(x - r * .32)}" cy="${f(y - r * .32)}" r="${f(r * .22)}" fill="#fff" opacity=".9"/>`;
  const star = (cx, cy, R, r) => Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r : R; return f(cx + q * Math.cos(a)) + ',' + f(cy + q * Math.sin(a)); }).join(' ');
  const bz = (a, c, d, t) => [(1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * c[0] + t * t * d[0], (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * c[1] + t * t * d[1]];
  const tg = (a, c, d, t) => Math.atan2(2 * (1 - t) * (c[1] - a[1]) + 2 * t * (d[1] - c[1]), 2 * (1 - t) * (c[0] - a[0]) + 2 * t * (d[0] - c[0])) / rad;
  // цепочка из звеньев вдоль кривой
  const chainLinks = (a, c, d, n, rx, ry, sw) => Array.from({ length: n + 1 }, (_, i) => { const t = i / n, p = bz(a, c, d, t); return `<ellipse cx="${f(p[0])}" cy="${f(p[1])}" rx="${rx}" ry="${ry}" transform="rotate(${f(tg(a, c, d, t))} ${f(p[0])} ${f(p[1])})" fill="none" stroke="${M}" stroke-width="${sw}"/>`; }).join('');
  // цепочка из звеньев вдоль эллипса (браслет)
  const ringLinks = (cx, cy, rx, ry, n, lrx, lry, sw) => Array.from({ length: n }, (_, i) => { const a = i / n * 2 * Math.PI, x = cx + rx * Math.cos(a), y = cy + ry * Math.sin(a), ang = Math.atan2(ry * Math.cos(a), -rx * Math.sin(a)) / rad; return `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${lrx}" ry="${lry}" transform="rotate(${f(ang)} ${f(x)} ${f(y)})" fill="none" stroke="${M}" stroke-width="${sw}"/>`; }).join('');
  const flower = (x, y, s) => [[-.9, 0], [.9, 0], [0, -.9], [0, .9]].map(o => `<circle cx="${f(x + o[0] * s)}" cy="${f(y + o[1] * s)}" r="${s}" fill="${G}" stroke="#fff" stroke-opacity=".7" stroke-width="1.2"/>`).join('') + pr(x, y, f(s * .55));
  const heart = 'M0 55 C-75 0 -45 -45 0 -15 C45 -45 75 0 0 55Z';

  const S = {
    // кольца
    ring: () => `<circle cx="200" cy="180" r="68" fill="none" stroke="${M}" stroke-width="16"/><path d="M170 120H230L218 138H182Z" fill="${M}"/>${gm(200, 98, 27)}`,
    ringmoon: () => `<circle cx="200" cy="182" r="68" fill="none" stroke="${M}" stroke-width="16"/><path d="M165 76A35 35 0 0 0 235 76A41 41 0 0 1 165 76Z" fill="${M}"/>${gm(200, 101, 6)}${gm(178, 95, 4.5)}${gm(222, 95, 4.5)}`,
    band: () => `<circle cx="200" cy="170" r="70" fill="none" stroke="${M}" stroke-width="24"/><circle cx="200" cy="170" r="80" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2"/><circle cx="200" cy="170" r="60" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2"/>`,
    ringleaf: () => `<circle cx="200" cy="182" r="66" fill="none" stroke="${M}" stroke-width="14"/><path d="M200 120C170 116 156 86 172 62C200 70 214 98 200 120Z" fill="${M}"/><path d="M200 120C230 116 244 86 228 62C200 70 186 98 200 120Z" fill="${M}"/><path d="M200 120L174 70M200 120L226 70" stroke="#fff" stroke-opacity=".5" stroke-width="2" fill="none"/>${gm(200, 108, 7)}`,
    // серьги
    hoops: () => [130, 270].map(x => `<circle cx="${x}" cy="152" r="62" fill="none" stroke="${M}" stroke-width="11"/><circle cx="${x}" cy="90" r="7" fill="${M}"/><path d="M${x - 40} 112A52 52 0 0 1 ${x - 20} 100" stroke="#fff" stroke-opacity=".5" stroke-width="3" fill="none"/>`).join(''),
    pearlearr: () => [135, 265].map(x => `<path d="M${x} 36V62" stroke="${M}" stroke-width="5" fill="none"/>${gm(x, 86, 17)}<path d="M${x} 108V132" stroke="${M}" stroke-width="4"/>${pr(x, 168, 34)}`).join(''),
    starstud: () => [130, 270].map(x => `<polygon points="${star(x, 150, 64, 28)}" fill="${M}" stroke="#fff" stroke-opacity=".5" stroke-width="2" stroke-linejoin="round"/>${gm(x, 148, 12)}`).join(''),
    dropearr: () => [140, 260].map(x => `<circle cx="${x}" cy="48" r="10" fill="none" stroke="${M}" stroke-width="4"/><path d="M${x} 58V90" stroke="${M}" stroke-width="4"/><path d="M${x} 88C${x + 42} 140 ${x + 36} 212 ${x} 234C${x - 36} 212 ${x - 42} 140 ${x} 88Z" fill="${G}" stroke="${M}" stroke-width="5"/><ellipse cx="${x - 10}" cy="150" rx="6" ry="28" fill="#fff" opacity=".4"/>`).join(''),
    // колье и подвески
    necklace: () => `<path d="M70 30Q200 260 330 30" fill="none" stroke="${M}" stroke-width="4"/>${[.18, .3, .7, .82].map(t => { const p = bz([70, 30], [200, 260], [330, 30], t); return gm(p[0], p[1], 8); }).join('')}<path d="M200 145V156" stroke="${M}" stroke-width="4"/><circle cx="200" cy="158" r="5" fill="none" stroke="${M}" stroke-width="3"/>${gm(200, 182, 25)}`,
    chain: () => chainLinks([60, 30], [200, 250], [340, 30], 34, 11, 6, 3.5) + `<circle cx="200" cy="145" r="0"/>`,
    heart: () => `<path d="M110 30Q200 150 290 30" fill="none" stroke="${M}" stroke-width="4"/><path d="M200 90V112" stroke="${M}" stroke-width="4"/><circle cx="200" cy="116" r="5" fill="none" stroke="${M}" stroke-width="3"/><g transform="translate(200 168) scale(1.05)"><path d="${heart}" fill="${G}" stroke="${M}" stroke-width="6" stroke-linejoin="round"/><path d="M-40 -10C-30 -28 -14 -30 -6 -22" stroke="#fff" stroke-opacity=".7" stroke-width="5" fill="none" stroke-linecap="round"/></g>`,
    choker: () => `<path d="M70 80Q200 200 330 80" fill="none" stroke="${M}" stroke-width="3"/>${Array.from({ length: 13 }, (_, i) => { const p = bz([70, 80], [200, 200], [330, 80], i / 12); return pr(p[0], p[1], 15); }).join('')}`,
    // браслеты
    chainbr: () => ringLinks(200, 150, 115, 58, 30, 14, 7.5, 4) + `<circle cx="315" cy="150" r="9" fill="none" stroke="${M}" stroke-width="4"/>`,
    charmbr: () => ringLinks(200, 142, 112, 52, 34, 9, 5.5, 3) + [[55, 'h'], [80, 's'], [100, 'g'], [125, 'p']].map(c => { const a = c[0] * rad, x = 200 + 112 * Math.cos(a), y = 142 + 52 * Math.sin(a), cy = y + 26; const sh = c[1] === 'h' ? `<g transform="translate(${f(x)} ${f(cy - 8)}) scale(.4)"><path d="${heart}" fill="${G}" stroke="${M}" stroke-width="8"/></g>` : c[1] === 's' ? `<polygon points="${star(x, cy, 17, 7.5)}" fill="${M}"/>` : c[1] === 'g' ? gm(x, cy - 2, 11) : pr(x, cy, 12); return `<path d="M${f(x)} ${f(y)}V${f(y + 12)}" stroke="${M}" stroke-width="3"/>` + sh; }).join(''),
    bangle: () => `<ellipse cx="200" cy="150" rx="115" ry="62" fill="none" stroke="${M}" stroke-width="26"/><ellipse cx="200" cy="150" rx="115" ry="52" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="3"/><polyline points="${Array.from({ length: 29 }, (_, i) => { const a = (12 + i * 5.5) * rad; return f(200 + 115 * Math.cos(a)) + ',' + f(150 + 62 * Math.sin(a) + 6 * Math.sin(i * 1.3)); }).join(' ')}" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`,
    // бижутерия
    brooch: () => `<ellipse cx="141" cy="126" rx="64" ry="16" transform="rotate(-18 141 126)" fill="${G}" fill-opacity=".8" stroke="${M}" stroke-width="3"/><ellipse cx="259" cy="126" rx="64" ry="16" transform="rotate(18 259 126)" fill="${G}" fill-opacity=".8" stroke="${M}" stroke-width="3"/><ellipse cx="148" cy="158" rx="52" ry="13" transform="rotate(-8 148 158)" fill="${G}" fill-opacity=".8" stroke="${M}" stroke-width="3"/><ellipse cx="252" cy="158" rx="52" ry="13" transform="rotate(8 252 158)" fill="${G}" fill-opacity=".8" stroke="${M}" stroke-width="3"/><rect x="192" y="100" width="16" height="148" rx="8" fill="${M}"/><path d="M193 130H207M193 150H207M193 170H207M194 190H206M196 210H204" stroke="#fff" stroke-opacity=".5" stroke-width="2"/>${gm(200, 84, 13)}`,
    hairclip: () => `<rect x="50" y="108" width="300" height="72" rx="36" fill="${M}"/><rect x="62" y="186" width="276" height="10" rx="5" fill="${M}"/><path d="M80 186V200M110 186V200M140 186V200M170 186V200M200 186V200M230 186V200M260 186V200M290 186V200M320 186V200" stroke="${M}" stroke-width="3"/>${[92, 128, 164, 200, 236, 272, 308].map((x, i) => gm(x, 140, i % 2 ? 11 : 14)).join('')}`,
    set: () => `<path d="M120 20Q200 130 280 20" fill="none" stroke="${M}" stroke-width="3.5"/><path d="M200 75V128" stroke="${M}" stroke-width="3.5"/>${flower(200, 156, 19)}` + [72, 328].map(x => `<circle cx="${x}" cy="62" r="8" fill="none" stroke="${M}" stroke-width="3.5"/><path d="M${x} 70V160" stroke="${M}" stroke-width="3"/>${flower(x, 184, 13)}`).join('')
  };

  const ZOOM = { ring: 1.25, ringmoon: 1.25, band: 1.3, ringleaf: 1.2, starstud: 1.1, hoops: 1.1, heart: 1.1 };
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${b[0]}"/><stop offset="1" stop-color="${b[1]}"/></linearGradient>
<linearGradient id="m" gradientUnits="userSpaceOnUse" x1="60" y1="30" x2="340" y2="270"><stop offset="0" stop-color="${m[0]}"/><stop offset=".5" stop-color="${m[1]}"/><stop offset="1" stop-color="${m[0]}"/></linearGradient>
<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${g[0]}"/><stop offset="1" stop-color="${g[1]}"/></linearGradient>
<radialGradient id="p" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff"/><stop offset=".6" stop-color="#f1e6dc"/><stop offset="1" stop-color="#cdbfb4"/></radialGradient>
<filter id="s" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#2b1d24" flood-opacity=".3"/></filter>
</defs><rect width="400" height="300" fill="url(#bg)"/><circle cx="335" cy="35" r="90" fill="#fff" opacity=".08"/><circle cx="55" cy="285" r="70" fill="#fff" opacity=".08"/><g filter="url(#s)" transform="translate(200 140) scale(${ZOOM[kind] || 1}) translate(-200 -140)">${(S[kind] || S.ring)()}</g></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

let _id = 0;
const PH = id => 'https://images.unsplash.com/photo-' + id + '?w=800&q=80&auto=format&fit=crop';
// photo — id фото Unsplash; art = [что рисовать, металл, цвет камня, фон] — запасная картинка; specs — строки для окна товара
const mk = (cat, name, price, tags, photo, art, short, full, specs) => {
  _id++;
  const drawn = jewelryArt(art[0], art[1], art[2], art[3]);
  return { id: _id, cat, name, price, tags, short, full, specs, art: drawn, img: MY_PHOTOS[_id] || PH(photo) };
};
const JEWELRY = [
  // Кольца
  mk('Кольца', 'Кольцо ручной работы, серебро', 89, ['Хит'], '1620968867360-5cda83d2bffd', ['ring', 'silver', 'clear', 'a'],
    'Серебряное кольцо с матовой фактурой, сделанное вручную.',
    'Кольцо из серебра с мягкой матовой фактурой. Каждое изделие делается вручную и немного отличается от другого, поэтому у вас будет единственное в своём роде украшение.',
    [['Материал', 'Серебро 925'], ['Отделка', 'Матовая, ручная работа'], ['Размеры', '15–19']]),
  mk('Кольца', 'Обручальные кольца, серебро и золото', 120, ['Хит'], '1615655114865-4cc1bda5901e', ['band', 'silver', 'clear', 'a'],
    'Пара гладких обручальных колец: серебристое и золотистое.',
    'Пара классических гладких колец в двух цветах металла. Закруглённая внутренняя сторона делает их удобными на каждый день. Гравировку можно заказать отдельно.',
    [['Материал', 'Серебро 925, позолота'], ['Ширина', '3 мм'], ['Размеры', '15–22']]),
  mk('Кольца', 'Кольцо, позолота', 45, ['Скидка'], '1617038260897-41a1f14a8ca0', ['ring', 'gold', 'clear', 'c'],
    'Тонкое позолоченное кольцо на каждый день.',
    'Тонкое кольцо без вставок с ровным слоем позолоты. Легко сочетается с другими кольцами и золотыми цепочками, а в комплекте идёт мешочек для хранения.',
    [['Материал', 'Латунь с позолотой'], ['Ширина', '2 мм'], ['Размеры', '16–19']]),
  mk('Кольца', 'Обручальное кольцо «Весна», серебро', 98, ['Новинка'], '1562616261-7bb659f860ed', ['band', 'silver', 'clear', 'f'],
    'Гладкое серебряное обручальное кольцо в классическом стиле.',
    'Классическое обручальное кольцо из серебра с зеркальной полировкой. Хорошо смотрится и на церемонии, и на свадебных фото среди цветов.',
    [['Материал', 'Серебро 925'], ['Ширина', '4 мм'], ['Размеры', '15–22']]),

  // Серьги
  mk('Серьги', 'Серьги-кольца с фианитами, позолота', 78, ['Хит'], '1619203451989-53f6d2ca0e57', ['hoops', 'gold', 'clear', 'b'],
    'Позолоченные серьги-кольца с дорожкой из фианитов.',
    'Круглые серьги-кольца из позолоченного металла, по которым идёт ряд мелких фианитов. Лёгкие, с надёжной застёжкой, подойдут и на каждый день, и на вечер.',
    [['Материал', 'Серебро 925, позолота'], ['Вставки', 'Фианиты'], ['Диаметр', '25 мм']]),
  mk('Серьги', 'Серьги с жемчугом', 72, ['Новинка', 'Хит'], '1682822749969-61a63203c501', ['pearlearr', 'silver', 'clear', 'd'],
    'Классические серьги с белым жемчугом.',
    'Аккуратные серьги с белыми жемчужинами. Лёгкие, красиво обрамляют лицо и подходят и к вечернему образу, и к деловому.',
    [['Материал', 'Серебро 925'], ['Вставки', 'Культивированный жемчуг'], ['Размер жемчужины', '8 мм']]),
  mk('Серьги', 'Серьги-гвоздики с фианитом', 29, ['Скидка'], '1622584940190-0cedd29ebaa8', ['starstud', 'silver', 'clear', 'e'],
    'Небольшие серьги-гвоздики с блестящим камнем.',
    'Компактные гвоздики с прозрачным фианитом в высокой оправе. Удобны на каждый день и не мешают носить телефон и наушники.',
    [['Материал', 'Сплав с родиевым покрытием'], ['Вставка', 'Фианит'], ['Размер', '6 мм']]),
  mk('Серьги', 'Серьги с красными камнями, позолота', 55, ['Новинка'], '1653227907864-560dce4c252d', ['dropearr', 'gold', 'red', 'a'],
    'Позолоченные серьги с красными камнями.',
    'Насыщенные красные камни в золотистой оправе делают серьги главным акцентом образа. Хорошо смотрятся с собранными волосами и открытой шеей.',
    [['Материал', 'Латунь с позолотой'], ['Вставки', 'Красные кристаллы'], ['Длина', '4 см']]),

  // Колье и подвески
  mk('Колье и подвески', 'Подвеска с жемчужиной и фианитом', 52, ['Скидка', 'Хит'], '1682629846138-7db022565bd5', ['heart', 'rose', 'clear', 'f'],
    'Подвеска с жемчужиной и сверкающим камнем.',
    'Небольшая подвеска: белая жемчужина и фианит в одной оправе. Продаётся на цепочке, хороший подарок на день рождения.',
    [['Материал', 'Серебро 925'], ['Вставки', 'Жемчуг, фианит'], ['Длина цепочки', '40 + 5 см']]),
  mk('Колье и подвески', 'Жемчужное колье', 135, ['Хит'], '1595345705177-ffe090eb0784', ['choker', 'gold', 'clear', 'a'],
    'Колье из ровных белых жемчужин.',
    'Нить из одинаковых белых жемчужин с надёжным замком. Колье мягко ложится на шею и подходит к вечернему платью и к простой белой рубашке.',
    [['Материал', 'Культивированный жемчуг, серебро'], ['Размер жемчужин', '7 мм'], ['Длина', '45 см']]),
  mk('Колье и подвески', 'Комплект с розовым жемчугом: колье и серьги', 118, ['Новинка'], '1654699991494-892326ee8171', ['necklace', 'rose', 'pink', 'c'],
    'Колье и серьги из розового жемчуга.',
    'Нежный комплект из колье и парных серег с розовым жемчугом. Можно носить вместе или по отдельности, а в подарочной коробке всё уже лежит парой.',
    [['Материал', 'Розовый жемчуг, серебро'], ['Состав', 'Колье + серьги'], ['Длина колье', '42 + 5 см']]),
  mk('Колье и подвески', 'Колье из бусин, золото и серебро', 41, ['Новинка'], '1586115180241-b3e4f01ed837', ['necklace', 'silver', 'blue', 'e'],
    'Колье из золотистых и серебристых бусин.',
    'Лёгкое колье из мелких бусин двух цветов металла. Подходит к любой одежде и хорошо смотрится вместе с тонкой цепочкой.',
    [['Материал', 'Металл, бусины'], ['Цвет', 'Золото и серебро'], ['Длина', '45 см']]),

  // Браслеты
  mk('Браслеты', 'Парные браслеты, позолота', 79, ['Новинка'], '1728381031272-ba3f537feadd', ['bangle', 'gold', 'clear', 'a'],
    'Два позолоченных браслета в паре.',
    'Пара золотистых браслетов, которые можно носить вместе или по одному. Форма держится, а размер подходит на руки среднего объёма.',
    [['Материал', 'Латунь с позолотой'], ['Состав', '2 браслета'], ['Диаметр', '60 мм']]),
  mk('Браслеты', 'Браслет с фианитами, позолота', 62, ['Хит'], '1611598935678-c88dca238fce', ['chainbr', 'gold', 'clear', 'd'],
    'Золотистый браслет, усыпанный фианитами.',
    'Тонкий браслет с дорожкой из фианитов, которые красиво блестят на свету. Носится отдельно или вместе с часами.',
    [['Материал', 'Серебро 925, позолота'], ['Вставки', 'Фианиты'], ['Длина', '17 + 3 см']]),
  mk('Браслеты', 'Браслеты из бусин, золото и серебро', 36, ['Скидка'], '1626784215013-13322cb0e471', ['charmbr', 'silver', 'lilac', 'c'],
    'Браслеты из мелких бусин для сочетания друг с другом.',
    'Набор эластичных браслетов из золотистых и серебристых бусин. Хорошо смотрятся вместе, а один браслет подойдёт и к часам.',
    [['Материал', 'Металл, бусины'], ['Застёжка', 'Эластичная нить'], ['Обхват', '16–19 см']]),

  // Бижутерия
  mk('Бижутерия', 'Брошь с жемчужиной', 22, ['Хит'], '1676496220343-1585b0cdcc3f', ['brooch', 'gold', 'green', 'b'],
    'Брошь с крупной жемчужиной в золотистой оправе.',
    'Брошь с жемчужиной в центре и тонкой металлической оправой. Крепится булавкой с надёжным замком на лацкан, шарф или сумку.',
    [['Материал', 'Сплав, имитация жемчуга'], ['Застёжка', 'Булавка с замком'], ['Размер', '4 × 4 см']]),
  mk('Бижутерия', 'Украшение из бусин «Сирень»', 34, ['Новинка', 'Хит'], '1588891805983-fee12d508e31', ['set', 'silver', 'lilac', 'd'],
    'Золотистые и сиреневые бусины на одной нити.',
    'Украшение из золотистых металлических и сиреневых бусин. Яркий акцент к светлой одежде, а в подарочной коробке лежит как готовый подарок.',
    [['Материал', 'Металл, стеклянные бусины'], ['Цвет', 'Золото и сирень'], ['Упаковка', 'Подарочная коробка']]),
  mk('Бижутерия', 'Жемчужная нить с золотой застёжкой', 41, ['Новинка'], '1704957205218-d436eac4c607', ['choker', 'silver', 'clear', 'f'],
    'Нить белого жемчуга с золотистой застёжкой.',
    'Нить из белых жемчужин с золотистой застёжкой. Подойдёт к вечернему образу и как нежный подарок.',
    [['Материал', 'Имитация жемчуга, позолота'], ['Размер жемчужин', '6 мм'], ['Длина', '40 + 5 см']])
];

// Если фото не загрузилось, подставляем нарисованную картинку
function jewelryImgError(e, item) { const el = e.target; if (el.dataset.fb || !item) return; el.dataset.fb = '1'; el.src = item.art; }

// Окно товара: полная картинка, описание, характеристики. Использование: <product-modal :item="sel" @close="sel = null"></product-modal>
const ProductModal = {
  props: { item: { type: Object, default: null } },
  emits: ['close'],
  watch: {
    item(v) {
      const d = this.$refs.d;
      document.documentElement.style.overflow = v ? 'hidden' : '';
      if (v && !d.open) d.showModal();
      if (!v && d.open) d.close();
    }
  },
  methods: {
    backdrop(e) { if (e.target === this.$refs.d) this.$emit('close'); },
    err(e, it) { jewelryImgError(e, it); }
  },
  template: `
  <dialog ref="d" @close="$emit('close')" @click="backdrop" aria-labelledby="pm-title"
    class="modal m-auto max-h-[92vh] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto rounded-2xl border border-brand-200 bg-brand-50 p-0 text-slate-900 shadow-2xl backdrop:bg-slate-900/60 backdrop:backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
    <div v-if="item" class="grid md:grid-cols-2">
      <img :src="item.img" :alt="item.name" @error="err($event, item)" class="aspect-[4/3] w-full object-cover md:aspect-auto md:h-full md:min-h-[22rem]">
      <div class="relative flex flex-col gap-3 p-6">
        <button type="button" @click="$emit('close')" aria-label="Закрыть" class="btn btn-ghost btn-sm absolute right-3 top-3"><i class="ic ic-x"></i></button>
        <p class="flex flex-wrap gap-1 pr-10"><span v-for="t in item.tags" :key="t" class="badge badge-warning">{{ t }}</span><span class="badge bg-slate-100 dark:bg-slate-700">{{ item.cat }}</span></p>
        <h2 id="pm-title" class="text-2xl font-bold">{{ item.name }}</h2>
        <p class="text-sm leading-6 text-slate-600 dark:text-slate-300">{{ item.full }}</p>
        <dl class="divide-y divide-slate-200 text-sm dark:divide-slate-700">
          <div v-for="s in item.specs" :key="s[0]" class="flex justify-between gap-4 py-1.5"><dt class="text-slate-500">{{ s[0] }}</dt><dd class="text-right font-medium">{{ s[1] }}</dd></div>
        </dl>
        <p class="mt-auto pt-2 text-3xl font-bold">{{ item.price }} <span class="byn">Б</span></p>
        <button type="button" class="btn btn-primary btn-md">В корзину</button>
      </div>
    </div>
  </dialog>`
};
