(() => {
  const tabs = [...document.querySelectorAll('[data-tour]')];
  const panel = document.getElementById('tour-panel');
  if (!tabs.length || !panel) return;
  const screens = {
    calendar: { number:'01 / 05', title:'Every day has a place.', text:'A salary on Monday. Dinner on Friday. Start with a date and give your income and expenses a place in the month. Your calendar brings it all together.', note:'Expected income, unexpected income and expenses. Separate, simple and easy to find.', file:'01-income-calendar.png', alt:'Cally Income screen showing an October calendar and monthly income totals.' },
    entry: { number:'02 / 05', title:'A few taps. Back to your day.', text:'Choose a day, enter an amount and add a category or payment method if you want. Cally keeps the small details together, without turning them into a big task.', note:'Add your own income sources. Delete an entry with a tap, with a moment to undo.', file:'03-add-expense.png', alt:'Cally Add Expense sheet with an amount, optional categories and payment methods.' },
    overview: { number:'03 / 05', title:'See what you kept.', text:'Income, spending and the difference between them. Bring the month into focus with your net and savings rate, or switch to a year for a wider view.', note:'Compare periods and see your totals, daily averages and spending patterns.', file:'02-net-and-savings.png', alt:'Cally Overview showing monthly net, income, expenses and savings rate.' },
    spending: { number:'04 / 05', title:'Follow the little things.', text:'Groceries, bills, a coffee on the way home. See how your spending adds up by category and payment method, so the details make sense at a glance.', note:'Your entries create the picture. Cally does not connect to your bank account.', file:'04-spending-categories.png', alt:'Cally spending breakdown with categories, amounts and percentages.' },
    flow: { number:'05 / 05', title:'Notice the rhythm.', text:'Some days bring money in. Others take it out. The cash-flow chart puts those moments side by side, across a month or a full year.', note:'Tap a bar in the app for a closer look at that day or month.', file:'05-cash-flow.png', alt:'Cally cash-flow chart showing incoming and outgoing amounts across October.' }
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
