// Рекламные блоки (компонент Vue для сайта на CDN). Спокойные, с пометкой «Реклама», без всплывающих окон.
// Реклама окрашена в дымчато-голубой с пунктирной рамкой и пометкой «Реклама», чтобы не путать её с товарами.
// <ad-slot type="banner"></ad-slot>    горизонтальный баннер 728 px
// <ad-slot type="sidebar"></ad-slot>   блок 300 px (боковая колонка)
// <ad-slot type="native"></ad-slot>    карточка в стиле товара (внутри <ul> каталога)
// <ad-slot placeholder size="banner"></ad-slot>   простая заглушка с пунктирной рамкой «Рекламное место»
const AD_CREATIVES = {
  banner:  { brand: 'Ювелирный салон «Серебряная нить»', title: 'Скидка 15% на первую покупку', text: 'Серебро 925, фианиты и жемчуг. Гравировка в подарок.', cta: 'Подробнее', img: 'photo-1704957205327-9fbd44d683b7', bg: 'linear-gradient(135deg,#6f93a3,#c8d6db)' },
  sidebar: { brand: 'Мастерская «Лунный камень»', title: 'Кольца ручной работы', text: 'Золото и серебро, индивидуальный заказ. Доставка по Беларуси.', cta: 'Смотреть', img: 'photo-1608508644127-ba99d7732fee', bg: 'linear-gradient(135deg,#6f93a3,#a8bcc4)' },
  native:  { brand: 'Мастерская «Лунный камень»', title: 'Жемчужные серьги в подарок', text: 'Серьги в подарочной коробке', price: 59, cta: 'Посмотреть', img: 'photo-1748679451184-97ddab571605', bg: 'linear-gradient(135deg,#a8bcc4,#eef3f5)' }
};
const AdSlot = {
  props: {
    type: { type: String, default: 'banner' },
    placeholder: { type: Boolean, default: false },   // true: пунктирная заглушка
    size: { type: String, default: 'banner' },        // для заглушки: banner | sidebar | square
    width: { type: String, default: '' },
    height: { type: String, default: '' },
    label: { type: String, default: 'Рекламное место' },
    ad: { type: Object, default: () => ({}) }          // свои тексты рекламы
  },
  computed: {
    c() { return { ...(AD_CREATIVES[this.type] || AD_CREATIVES.banner), ...this.ad }; },
    imgStyle() { return { backgroundImage: 'url(https://images.unsplash.com/' + this.c.img + '?w=500&q=80&auto=format&fit=crop), ' + this.c.bg }; },
    box() {
      const p = { banner: ['728px', '90px'], sidebar: ['300px', '250px'], square: ['250px', '250px'] };
      const [w, h] = p[this.size] || p.banner;
      return { width: this.width || w, height: this.height || h };
    }
  },
  template: `
  <aside v-if="placeholder" aria-label="Реклама" :style="box"
    class="flex max-w-full flex-col items-center justify-center gap-0.5 rounded-lg border-2 border-dashed border-brand-300 bg-brand-50 text-brand-700 dark:border-brand-500/60 dark:bg-brand-500/10 dark:text-brand-200">
    <span class="text-[11px] uppercase tracking-widest opacity-70">Advertisement</span>
    <span class="text-sm font-medium">{{ label }}</span>
    <span class="text-xs opacity-60">{{ box.width }} × {{ box.height }}</span>
  </aside>

  <aside v-else-if="type === 'banner'" aria-label="Реклама"
    class="ad relative flex w-full max-w-[728px] items-center gap-3 overflow-hidden p-2 pr-3">
    <div class="h-[74px] w-[74px] shrink-0 rounded-lg bg-cover bg-center" :style="imgStyle"></div>
    <div class="min-w-0 flex-1">
      <p class="truncate text-xs text-slate-500">{{ c.brand }}</p>
      <p class="truncate font-semibold">{{ c.title }}</p>
      <p class="hidden truncate text-sm text-slate-500 sm:block">{{ c.text }}</p>
    </div>
    <a href="#" rel="sponsored nofollow" @click.prevent class="btn btn-sm btn-ad shrink-0">{{ c.cta }}</a>
    <span class="absolute right-2 top-0.5 text-[10px] uppercase tracking-wider text-slate-400">Реклама</span>
  </aside>

  <aside v-else-if="type === 'sidebar'" aria-label="Реклама"
    class="ad relative w-full max-w-[300px] overflow-hidden">
    <div class="h-36 bg-cover bg-center" :style="imgStyle"></div>
    <span class="absolute left-2 top-2 rounded bg-white/90 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-slate-500 dark:bg-slate-900/80 dark:text-slate-300">Реклама</span>
    <div class="space-y-1 p-4">
      <p class="text-xs text-slate-500">{{ c.brand }}</p>
      <p class="font-semibold">{{ c.title }}</p>
      <p class="text-sm text-slate-500">{{ c.text }}</p>
      <a href="#" rel="sponsored nofollow" @click.prevent class="btn btn-sm btn-ad mt-2">{{ c.cta }}</a>
    </div>
  </aside>

  <li v-else aria-label="Реклама" class="ad relative flex flex-col gap-2 p-4">
    <div class="aspect-video w-full rounded-xl bg-cover bg-center" :style="imgStyle"></div>
    <span class="absolute left-6 top-6 rounded bg-white/90 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-slate-500 dark:bg-slate-900/80 dark:text-slate-300">Реклама</span>
    <h2 class="font-medium">{{ c.title }}</h2>
    <p class="text-xs text-slate-500">{{ c.brand }} · {{ c.text }}</p>
    <p class="mt-auto text-lg font-bold">{{ c.price }} <span class="byn">Б</span></p>
    <a href="#" rel="sponsored nofollow" @click.prevent class="btn btn-md btn-ad">{{ c.cta }}</a>
  </li>`
};
