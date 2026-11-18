// Vue-приложение «Excel · Данные» (перенесено из Laravel+Vue2+Bootstrap).
// Бэкенд PHP заменён браузерным API на localStorage, Excel разбирается через SheetJS.
const { createApp, reactive, ref, computed, onMounted } = Vue;
const { createRouter, createWebHashHistory } = VueRouter;

/* ---------- «База данных» и API (замена Laravel-контроллеров) ---------- */
const KEY = 'xl:db';
const db = Object.assign({ users: [], products: [], logs: [], files: [], tokens: {}, session: null, seq: { u: 1, p: 1, l: 1 } },
  (() => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } })());
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) {} };
const fail = (status, errors, message) => { throw { status, errors, message }; };
const auth = reactive({ user: db.users.find(u => u.id === db.session) || null });
const wait = () => new Promise(r => setTimeout(r, 120));

function log(action, type = null, id = null, old = null, nw = null, user = auth.user) {
  db.logs.push({ id: db.seq.l++, user: user ? { id: user.id, name: user.name } : null, action, model_type: type, model_id: id,
    old_data: old, new_data: nw, ip: '127.0.0.1', created_at: new Date().toISOString() });
  if (db.logs.length > 500) db.logs.shift();
}
const page = (arr, p, per) => ({ data: arr.slice((p - 1) * per, p * per), current_page: p, last_page: Math.max(1, Math.ceil(arr.length / per)), total: arr.length });
const needAuth = () => { if (!auth.user) fail(401); };
const isNum = v => v !== '' && v !== null && v !== undefined && !isNaN(Number(v));

function checkProduct(d, ignoreId, strictQty = true) {
  const e = {};
  if (!String(d.sku ?? '').trim()) e.sku = ['Укажите артикул'];
  else if (String(d.sku).length > 50) e.sku = ['Артикул не длиннее 50 символов'];
  else if (db.products.some(p => p.sku === String(d.sku) && p.id !== ignoreId)) e.sku = ['Такой артикул уже существует'];
  if (!String(d.name ?? '').trim()) e.name = ['Укажите название'];
  if (!isNum(d.price) || Number(d.price) < 0) e.price = ['Цена должна быть числом ≥ 0'];
  const q = d.quantity;
  if (strictQty || (q !== null && q !== undefined && q !== '')) {
    if (!isNum(q) || !Number.isInteger(Number(q)) || Number(q) < 0) e.quantity = ['Количество должно быть целым числом ≥ 0'];
  }
  return e;
}
const clean = d => ({ sku: String(d.sku).trim(), name: String(d.name).trim(), category: d.category ? String(d.category) : null, price: Number(d.price), quantity: Number(d.quantity || 0) });

const api = {
  async user() { return auth.user; },
  async register(m) {
    await wait(); const e = {};
    if (!m.name.trim()) e.name = ['Укажите имя'];
    if (!/^\S+@\S+\.\S+$/.test(m.email)) e.email = ['Некорректный email'];
    else if (db.users.some(u => u.email === m.email.toLowerCase())) e.email = ['Такой email уже зарегистрирован'];
    if (m.password.length < 8) e.password = ['Пароль — минимум 8 символов'];
    else if (m.password !== m.password_confirmation) e.password = ['Пароли не совпадают'];
    if (Object.keys(e).length) fail(422, e);
    const u = { id: db.seq.u++, name: m.name.trim(), email: m.email.toLowerCase(), password: btoa(unescape(encodeURIComponent(m.password))) };
    db.users.push(u); this._login(u); return true;
  },
  _login(u) { db.session = u.id; auth.user = { id: u.id, name: u.name, email: u.email }; log('login', 'User', u.id); save(); },
  async login(m) {
    await wait();
    const u = db.users.find(x => x.email === m.email.trim().toLowerCase());
    if (!u || u.password !== btoa(unescape(encodeURIComponent(m.password)))) fail(422, { email: ['Неверный email или пароль'] });
    this._login(u); return true;
  },
  async logout() { log('logout', 'User', auth.user && auth.user.id); db.session = null; auth.user = null; save(); },
  async forgot(email) {
    await wait();
    const u = db.users.find(x => x.email === email.trim().toLowerCase());
    if (!u) fail(422, { email: ['Пользователь с таким email не найден'] });
    const t = Math.random().toString(36).slice(2) + Date.now().toString(36);
    db.tokens[t] = u.email; save();
    // писем нет — показываем ссылку прямо на странице
    return { link: `#/password/reset/${t}?email=${encodeURIComponent(u.email)}` };
  },
  async reset(m) {
    await wait();
    if (db.tokens[m.token] !== m.email.trim().toLowerCase()) fail(422, { email: ['Ссылка недействительна'] });
    if (m.password.length < 8) fail(422, { password: ['Пароль — минимум 8 символов'] });
    if (m.password !== m.password_confirmation) fail(422, { password: ['Пароли не совпадают'] });
    const u = db.users.find(x => x.email === db.tokens[m.token]);
    u.password = btoa(unescape(encodeURIComponent(m.password))); delete db.tokens[m.token]; this._login(u); return true;
  },
  async products(p, per = 10) { needAuth(); await wait(); return page([...db.products].sort((a, b) => b.id - a.id), p, per); },
  async createProduct(d) {
    needAuth(); await wait(); const e = checkProduct(d); if (Object.keys(e).length) fail(422, e);
    const p = { id: db.seq.p++, ...clean(d) }; db.products.push(p); log('created', 'Product', p.id, null, p); save(); return p;
  },
  async updateProduct(id, d) {
    needAuth(); await wait(); const e = checkProduct(d, id); if (Object.keys(e).length) fail(422, e);
    const p = db.products.find(x => x.id === id), old = { ...p }; Object.assign(p, clean(d));
    log('updated', 'Product', id, old, { ...p }); save(); return { ...p };
  },
  async removeProduct(id) {
    needAuth(); await wait(); const i = db.products.findIndex(x => x.id === id);
    if (i >= 0) { log('deleted', 'Product', id, { ...db.products[i] }); db.products.splice(i, 1); save(); }
  },
  async logs(p, action) { needAuth(); await wait(); return page(db.logs.filter(l => !action || l.action === action).reverse(), p, 10); },
  async upload(file) {
    needAuth(); await wait();
    if (!/\.(xlsx|xls)$/i.test(file.name)) fail(422, { file: ['Допустимые форматы: .xlsx, .xls'] });
    if (file.size > 10 * 1024 * 1024) fail(422, { file: ['Файл больше 10 МБ'] });
    let rows;
    try {
      const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' });
      rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: null }).map(r =>
        Object.fromEntries(Object.entries(r).map(([k, v]) => [String(k).trim().toLowerCase(), v])));
    } catch (e) { fail(422, { file: ['Не удалось прочитать файл Excel'] }); }
    rows.forEach((r, i) => { const e = checkProduct({ ...r, sku: r.sku }, null, false);
      delete e.sku; if (!String(r.sku ?? '').trim()) e.sku = ['Укажите артикул'];
      const first = Object.values(e)[0]; if (first) fail(422, { file: [`Строка ${i + 2}: ${first[0]}`] }); });
    // «транзакция»: сюда доходим только если все строки валидны
    rows.forEach(r => {
      const sku = String(r.sku).trim(), d = clean({ ...r, sku }), ex = db.products.find(p => p.sku === sku);
      if (ex) { const old = { ...ex }; Object.assign(ex, d); log('updated', 'Product', ex.id, old, { ...ex }); }
      else { const p = { id: db.seq.p++, ...d }; db.products.push(p); log('created', 'Product', p.id, null, p); }
    });
    db.files.push({ user_id: auth.user.id, original_name: file.name, rows: rows.length }); save();
    return { rows: rows.length };
  },
};

/* ---------- Общие куски ---------- */
function useForm() {
  const s = reactive({ errors: {}, message: '', loading: false });
  const err = f => (s.errors[f] ? s.errors[f][0] : '');
  async function send(fn) {
    s.loading = true; s.errors = {}; s.message = '';
    try { return (await fn()) || true; }
    catch (e) { if (e.status === 422) s.errors = e.errors || {}; else s.message = 'Ошибка сервера'; return false; }
    finally { s.loading = false; }
  }
  return { s, err, send };
}
const fmtDate = v => new Date(v).toLocaleString('ru-RU');
const FieldList = {
  props: ['fields', 'model', 'form'],
  template: `<div v-for="f in fields" :key="f.k" class="mb-3"><label class="mb-1 block text-sm font-medium">{{ f.l }}</label>
    <input :type="f.t" class="input" v-model="model[f.k]" :aria-invalid="!!form.s.errors[f.k]" @keyup.enter="$emit('enter')">
    <p v-if="form.err(f.k)" class="mt-1 text-xs text-danger">{{ form.err(f.k) }}</p></div>`,
};
const Modal = {
  props: { wide: Boolean },
  emits: ['close'],
  template: `<div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4" @click.self="$emit('close')">
    <div class="card max-h-[90vh] w-full overflow-y-auto" :class="wide ? 'max-w-3xl' : 'max-w-md'" role="dialog" aria-modal="true">
      <div class="mb-3 flex items-center justify-between"><h3 class="text-lg font-bold"><slot name="title"/></h3>
        <button class="btn btn-ghost btn-sm" aria-label="Закрыть" @click="$emit('close')"><i class="ic ic-x"></i></button></div>
      <slot/><div class="mt-4 flex justify-end gap-2"><slot name="footer"><button class="btn btn-secondary btn-md" @click="$emit('close')">Закрыть</button></slot></div>
    </div></div>`,
};
// замена vue-json-compare: построчное сравнение старых и новых данных
const JsonCompare = {
  props: ['oldData', 'newData'],
  setup(p) {
    const rows = computed(() => [...new Set([...Object.keys(p.oldData), ...Object.keys(p.newData)])].map(k => {
      const a = p.oldData[k], b = p.newData[k]; return { k, a, b, changed: JSON.stringify(a) !== JSON.stringify(b) }; }));
    return { rows };
  },
  template: `<div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="text-left text-slate-500"><th class="p-2">Поле</th><th class="p-2">Было</th><th class="p-2">Стало</th></tr></thead>
    <tbody><tr v-for="r in rows" :key="r.k" class="border-t border-slate-200 dark:border-slate-700" :class="r.changed && 'bg-peach-100 dark:bg-peach-200/10'">
      <td class="p-2 font-medium">{{ r.k }}</td><td class="p-2" :class="r.changed && 'text-danger'">{{ r.a ?? '—' }}</td><td class="p-2" :class="r.changed && 'text-success'">{{ r.b ?? '—' }}</td></tr></tbody></table></div>`,
};

/* ---------- Компоненты ---------- */
const FileUpload = {
  components: { Modal },
  emits: ['uploaded'],
  setup(_, { emit }) {
    const dragging = ref(false), loading = ref(false), error = ref(''), success = ref(''), input = ref(null);
    function handle(files) {
      success.value = '';
      if (files.length !== 1) return (error.value = 'Загрузите ровно один файл.');
      const f = files[0];
      if (!/\.(xlsx|xls)$/i.test(f.name)) return (error.value = `Файл «${f.name}» не является файлом Excel.`);
      upload(f);
    }
    async function upload(f) {
      loading.value = true;
      try { const d = await api.upload(f); success.value = `Файл загружен, обработано строк: ${d.rows}`; emit('uploaded'); }
      catch (e) {
        error.value = e.status === 401 ? 'Для загрузки файла необходимо войти в систему.'
          : e.status === 422 ? (e.errors.file || [e.message])[0] : 'Ошибка при загрузке файла.';
      } finally { loading.value = false; }
    }
    const onSelect = e => { handle(e.target.files); e.target.value = ''; };
    const onDrop = e => { dragging.value = false; handle(e.dataTransfer.files); };
    return { dragging, loading, error, success, input, onSelect, onDrop };
  },
  template: `<div>
    <div class="cursor-pointer rounded-2xl border-2 border-dashed px-4 py-12 text-center transition" tabindex="0" role="button"
      :class="dragging ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10' : 'border-slate-300 hover:border-brand-500 dark:border-slate-600'"
      @click="input.click()" @keyup.enter="input.click()" @dragover.prevent="dragging = true" @dragleave.prevent="dragging = false" @drop.prevent="onDrop">
      <input ref="input" type="file" class="hidden" accept=".xlsx,.xls" @change="onSelect">
      <p v-if="loading" class="animate-pulse">Загрузка…</p>
      <template v-else><h3 class="text-lg font-semibold">Перетащите Excel-файл сюда</h3><p class="body">или нажмите, чтобы выбрать файл (.xlsx, .xls)</p></template>
    </div>
    <p v-if="success" class="alert alert-success mt-3">{{ success }}</p>
    <modal v-if="error" @close="error = ''"><template #title>Ошибка загрузки</template><p>{{ error }}</p>
      <p class="body mt-2">Допустимые форматы: <b>.xlsx</b>, <b>.xls</b> (Microsoft Excel).</p></modal></div>`,
};

const RecordModal = {
  components: { Modal, FieldList },
  props: { record: Object },
  emits: ['close', 'saved'],
  setup(p, { emit }) {
    const form = useForm();
    const fields = [{ k: 'sku', l: 'Артикул', t: 'text' }, { k: 'name', l: 'Название', t: 'text' }, { k: 'category', l: 'Категория', t: 'text' },
      { k: 'price', l: 'Цена', t: 'number' }, { k: 'quantity', l: 'Количество', t: 'number' }];
    const model = reactive({ sku: '', name: '', category: '', price: 0, quantity: 0, ...(p.record || {}) });
    async function save() {
      const d = await form.send(() => p.record ? api.updateProduct(p.record.id, model) : api.createProduct(model));
      if (d) emit('saved', { data: d, isNew: !p.record });
    }
    return { form, fields, model, save };
  },
  template: `<modal @close="$emit('close')"><template #title>{{ record ? 'Редактирование записи' : 'Новая запись' }}</template>
    <field-list :fields="fields" :model="model" :form="form" @enter="save"/>
    <p v-if="form.s.message" class="alert alert-error">{{ form.s.message }}</p>
    <template #footer><button class="btn btn-secondary btn-md" @click="$emit('close')">Отмена</button>
      <button class="btn btn-primary btn-md" :disabled="form.s.loading" @click="save">{{ record ? 'Сохранить' : 'Добавить' }}</button></template></modal>`,
};

/* ---------- Страницы ---------- */
const HomePage = {
  components: { FileUpload },
  template: `<div><h1 class="h2 mb-2">Загрузка данных из Excel</h1>
    <p class="body mb-4">Колонки файла: <code class="rounded bg-slate-200 px-1 dark:bg-slate-700">sku, name, category, price, quantity</code>. Записи с существующим <code class="rounded bg-slate-200 px-1 dark:bg-slate-700">sku</code> будут обновлены.</p>
    <file-upload/></div>`,
};

// общая «загрузить ещё» логика для списков
function usePaged(fetcher) {
  const items = ref([]), pg = ref(0), last = ref(1), total = ref(0), loading = ref(false);
  async function load(reset = false) {
    if (reset) { items.value = []; pg.value = 0; last.value = 1; }
    if (pg.value >= last.value) return;
    loading.value = true;
    try { const d = await fetcher(pg.value + 1); items.value.push(...d.data); pg.value = d.current_page; last.value = d.last_page; total.value = d.total; }
    finally { loading.value = false; }
  }
  return { items, pg, last, total, loading, load };
}

const DataPage = {
  components: { RecordModal },
  setup() {
    const L = usePaged(p => api.products(p, 10)), modal = ref(false), editing = ref(null);
    onMounted(() => L.load(true));
    const open = p => { editing.value = p; modal.value = true; };
    function saved({ data, isNew }) { modal.value = false; if (isNew) L.load(true); else L.items.value = L.items.value.map(i => (i.id === data.id ? data : i)); }
    async function remove(p) {
      if (!confirm(`Удалить «${p.name}»?`)) return;
      await api.removeProduct(p.id); L.items.value = L.items.value.filter(i => i.id !== p.id); L.total.value--;
    }
    return { ...L, modal, editing, open, saved, remove };
  },
  template: `<div><div class="mb-4 flex items-center justify-between"><h1 class="h2">Товары <small class="body">({{ items.length }} из {{ total }})</small></h1>
      <button class="btn btn-primary btn-md" @click="open(null)">+ Добавить</button></div>
    <div class="card overflow-x-auto p-0"><table class="w-full text-sm"><thead class="bg-slate-100 text-left dark:bg-slate-700"><tr>
      <th class="p-3">Артикул</th><th class="p-3">Название</th><th class="p-3">Категория</th><th class="p-3 text-right">Цена</th><th class="p-3 text-right">Кол-во</th><th class="p-3"></th></tr></thead>
      <tbody><tr v-for="p in items" :key="p.id" class="border-t border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/40">
        <td class="p-3">{{ p.sku }}</td><td class="p-3">{{ p.name }}</td><td class="p-3">{{ p.category }}</td>
        <td class="p-3 text-right">{{ p.price }}</td><td class="p-3 text-right">{{ p.quantity }}</td>
        <td class="space-x-1 whitespace-nowrap p-3 text-right"><button class="btn btn-secondary btn-sm" @click="open(p)">Изменить</button><button class="btn btn-danger btn-sm" @click="remove(p)">Удалить</button></td></tr>
      <tr v-if="!items.length && !loading"><td colspan="6" class="p-6 text-center text-slate-500">Нет данных — загрузите Excel на главной или добавьте запись</td></tr></tbody></table></div>
    <div class="mt-4 text-center"><button v-if="pg < last" class="btn btn-secondary btn-md" :disabled="loading" @click="load()">Загрузить ещё</button></div>
    <record-modal v-if="modal" :record="editing" @close="modal = false" @saved="saved"/></div>`,
};

const LogsPage = {
  components: { Modal, JsonCompare },
  setup() {
    const action = ref(''), selected = ref(null), actions = ['created', 'updated', 'deleted', 'login', 'logout'];
    const L = usePaged(p => api.logs(p, action.value));
    onMounted(() => L.load(true));
    const badge = a => ({ created: 'badge-success', updated: 'badge-warning', deleted: 'badge-error' }[a] || 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200');
    return { ...L, action, actions, selected, badge, fmtDate };
  },
  template: `<div><div class="mb-4 flex items-center justify-between gap-2"><h1 class="h2">История действий</h1>
      <select class="input w-auto" v-model="action" @change="load(true)" aria-label="Фильтр"><option value="">Все действия</option><option v-for="a in actions" :key="a" :value="a">{{ a }}</option></select></div>
    <div class="card overflow-x-auto p-0"><table class="w-full text-sm"><thead class="bg-slate-100 text-left dark:bg-slate-700"><tr>
      <th class="p-3">Дата</th><th class="p-3">Пользователь</th><th class="p-3">Действие</th><th class="p-3">Объект</th><th class="p-3">IP</th><th class="p-3"></th></tr></thead>
      <tbody><tr v-for="l in items" :key="l.id" class="border-t border-slate-200 dark:border-slate-700">
        <td class="whitespace-nowrap p-3">{{ fmtDate(l.created_at) }}</td><td class="p-3">{{ l.user ? l.user.name : '—' }}</td>
        <td class="p-3"><span class="badge" :class="badge(l.action)">{{ l.action }}</span></td>
        <td class="p-3">{{ l.model_type }} <span v-if="l.model_id">#{{ l.model_id }}</span></td><td class="p-3">{{ l.ip }}</td>
        <td class="p-3 text-right"><button v-if="l.old_data || l.new_data" class="btn btn-secondary btn-sm" @click="selected = l">Сравнить</button></td></tr>
      <tr v-if="!items.length && !loading"><td colspan="6" class="p-6 text-center text-slate-500">Записей нет</td></tr></tbody></table></div>
    <div class="mt-4 text-center"><button v-if="pg < last" class="btn btn-secondary btn-md" :disabled="loading" @click="load()">Загрузить ещё</button></div>
    <modal v-if="selected" wide @close="selected = null"><template #title>{{ selected.action }} · {{ selected.model_type }} #{{ selected.model_id }}</template>
      <json-compare :old-data="selected.old_data || {}" :new-data="selected.new_data || {}"/></modal></div>`,
};

// Вход / регистрация / восстановление / сброс — одна фабрика, чтобы не дублировать разметку
const authPage = ({ title, fields, button, run, extra = '', init }) => ({
  components: { FieldList },
  setup() {
    const form = useForm(), model = reactive(init ? init() : {}), done = ref('');
    async function submit() {
      const r = await form.send(() => run(model));
      if (r) { if (r.link) done.value = r.link; else router.push('/data'); }
    }
    return { form, model, fields, submit, done };
  },
  template: `<div class="mx-auto max-w-md"><div class="card"><h1 class="h2 mb-4">${title}</h1>
    <p v-if="form.s.message" class="alert alert-error mb-3">{{ form.s.message }}</p>
    <p v-if="done" class="alert alert-success mb-3">Письмо не отправляется (нет сервера). Перейдите по <a class="font-semibold underline" :href="done">ссылке для сброса пароля</a>.</p>
    <field-list :fields="fields" :model="model" :form="form" @enter="submit"/>${extra}
    <button class="btn btn-primary btn-md" :disabled="form.s.loading" @click="submit">${button}</button></div></div>`,
});
const F = (k, l, t = 'text') => ({ k, l, t });
const LoginPage = authPage({ title: 'Вход', button: 'Войти', fields: [F('email', 'Email', 'email'), F('password', 'Пароль', 'password')],
  init: () => ({ email: '', password: '' }), run: m => api.login(m),
  extra: `<router-link class="mb-3 block text-sm text-brand-600 hover:underline" to="/password/reset">Забыли пароль?</router-link>` });
const RegisterPage = authPage({ title: 'Регистрация', button: 'Зарегистрироваться',
  fields: [F('name', 'Имя'), F('email', 'Email', 'email'), F('password', 'Пароль', 'password'), F('password_confirmation', 'Повторите пароль', 'password')],
  init: () => ({ name: '', email: '', password: '', password_confirmation: '' }), run: m => api.register(m) });
const ForgotPage = authPage({ title: 'Восстановление пароля', button: 'Отправить ссылку', fields: [F('email', 'Email', 'email')],
  init: () => ({ email: '' }), run: m => api.forgot(m.email) });
const ResetPage = authPage({ title: 'Новый пароль', button: 'Сменить пароль',
  fields: [F('email', 'Email', 'email'), F('password', 'Новый пароль', 'password'), F('password_confirmation', 'Повторите пароль', 'password')],
  init: () => ({ token: router.currentRoute.value.params.token, email: router.currentRoute.value.query.email || '', password: '', password_confirmation: '' }),
  run: m => api.reset(m) });

/* ---------- Роутер и корневой компонент ---------- */
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: HomePage },
    { path: '/login', component: LoginPage, meta: { guest: true } },
    { path: '/register', component: RegisterPage, meta: { guest: true } },
    { path: '/password/reset', component: ForgotPage, meta: { guest: true } },
    { path: '/password/reset/:token', component: ResetPage, meta: { guest: true } },
    { path: '/data', component: DataPage, meta: { auth: true } },
    { path: '/logs', component: LogsPage, meta: { auth: true } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
});
router.beforeEach(to => {
  if (to.meta.auth && !auth.user) return '/login';
  if (to.meta.guest && auth.user) return '/data';
});

const App = {
  setup() {
    async function logout() { await api.logout(); router.push('/login'); }
    return { auth, logout };
  },
  template: `<div><div class="border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"><div class="mx-auto flex max-w-6xl flex-wrap items-center gap-1 px-4 py-2 text-sm">
      <span class="mr-3 font-bold text-brand-600">Excel · Данные</span>
      <router-link class="rounded-md px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700" active-class="bg-brand-50 font-semibold text-brand-700 dark:bg-brand-500/20" exact-active-class="" to="/">Главная</router-link>
      <template v-if="auth.user">
        <router-link class="rounded-md px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700" active-class="bg-brand-50 font-semibold text-brand-700 dark:bg-brand-500/20" to="/data">Данные</router-link>
        <router-link class="rounded-md px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700" active-class="bg-brand-50 font-semibold text-brand-700 dark:bg-brand-500/20" to="/logs">История</router-link>
        <span class="ml-auto text-slate-500">{{ auth.user.name }}</span><button class="btn btn-secondary btn-sm" @click="logout">Выход</button></template>
      <template v-else><router-link class="ml-auto rounded-md px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700" to="/login">Вход</router-link>
        <router-link class="btn btn-primary btn-sm" to="/register">Регистрация</router-link></template></div></div>
    <main class="mx-auto max-w-6xl px-4 py-6"><router-view/></main></div>`,
};
createApp(App).use(router).mount('#app');
