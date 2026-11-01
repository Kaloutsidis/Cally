(() => {
  const tabs = [...document.querySelectorAll('[data-tour]')];
  const panel = document.getElementById('tour-panel');
  if (!tabs.length || !panel) return;
  const screens = {
    calendar: { number:'01 / 05', title:'Every day has a place.', text:'A salary on Monday. Dinner on Friday. Start with a date and give your income and expenses a place in the month. Your calendar brings it all together.', note:'Expected income, unexpected income and expenses. Separate, simple and easy to find.', file:'01-income-calendar.webp', alt:'Cally Income screen showing an October calendar and monthly income totals.' },
    entry: { number:'02 / 05', title:'A few taps. Back to your day.', text:'Choose a day, enter an amount and add a category or payment method if you want. Cally keeps the small details together, without turning them into a big task.', note:'Add your own income sources. Delete an entry with a tap, with a moment to undo.', file:'03-day-entry.webp', alt:'Cally Add Expense sheet with an amount, optional categories and payment methods.' },
    budgets: { number:'03 / 05', title:'Budgets with Cally Premium.', text:'Give the month a limit, then make room for groceries, meals and the things that matter to you. Monthly and category bars show what you have spent and what is left.', note:'Budgets are a Cally Premium feature. Your personal entries stay in your own calendar.', file:'05-premium-budgets.webp', alt:'Cally Premium monthly budgets showing total spending and grocery, food and transport limits.' },
    year: { number:'04 / 05', title:'Your year with Cally Premium.', text:'Step back from the day to see the whole year. Income, expenses and profit or loss bring each month into perspective, with your yearly total above them.', note:'The month overview is free. Cally Premium adds the full-year view.', file:'06-premium-year.webp', alt:'Cally Premium year overview showing yearly income, expenses, profit and monthly results.' },
    sync: { number:'05 / 05', title:'Pick up where you left off.', text:'Sign in with Apple, Google or an email code. Your personal entries sync to your account, ready for the next iPhone you sign in to.', note:'Sync is included on Free. Premium adds a black app icon and a choice of banners, shown here.', file:'07-account-and-sync.webp', alt:'Cally Settings showing the sample account synced, an active Premium plan and app icon and banner choices.' }
  };
  function select(tab, focus = false) {
    const screen = screens[tab.dataset.tour];
    if (!screen) return;
    tabs.forEach(item => { const active = item === tab; item.setAttribute('aria-selected', String(active)); item.tabIndex = active ? 0 : -1; });
    document.getElementById('tour-number').textContent = screen.number;
    document.getElementById('tour-title').textContent = screen.title;
    document.getElementById('tour-description').textContent = screen.text;
    document.getElementById('tour-note').textContent = screen.note;
    const image = document.getElementById('tour-screen');
    image.src = `assets/screens/${screen.file}`; image.alt = screen.alt;
    panel.setAttribute('aria-labelledby', tab.id);
    if (focus) tab.focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { event.preventDefault(); select(tabs[next], true); }
    });
  });
})();
