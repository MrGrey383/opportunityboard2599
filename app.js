
/* Event delegation keeps memory stable by using one listener on the parent
 * instead of many on each card. We identify the clicked element with
 * e.target.matches() and locate its card using closest('.opportunity-card').
 */

const state = {
  availableOpportunities: [
    { id: 'opp-1', title: 'Software Engineering Internship at Tech Corp', category: 'internship' },
    { id: 'opp-2', title: 'Research Scholarship in Computer Science', category: 'scholarship' },
    { id: 'opp-3', title: 'Data Science Summer Internship', category: 'internship' },
    { id: 'opp-4', title: 'Merit-Based Academic Scholarship', category: 'scholarship' }
  ],
  savedOpportunities: [],
  currentFilter: 'all'
};


const elements = {
  availableGrid: document.getElementById('availableGrid'),
  savedGrid: document.getElementById('savedGrid'),
  savedCount: document.getElementById('savedCount'),
  opportunityInput: document.getElementById('opportunityInput'),
  addBtn: document.getElementById('addBtn'),
  filterBtns: document.querySelectorAll('.filter-btn'),
  nav: document.querySelector('nav')
};


const STORAGE_KEY = 'opportunityBoard_2599_data';


function init() {
  loadFromStorage();
  render();
  attachEventListeners();
}


function attachEventListeners() {
  // Event delegation for available opportunities (Save buttons)
  elements.availableGrid.addEventListener('click', (e) => {
    if (e.target.classList.contains('save-btn')) {
      const card = e.target.closest('.opportunity-card');
      const id = card.dataset.id;
      saveOpportunity(id);
    }
  });
  
  
  elements.savedGrid.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-btn')) {
      const card = e.target.closest('.opportunity-card');
      const id = card.dataset.id;
      removeOpportunity(id);
    }
  });
  
  
  elements.nav.addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-btn')) {
      const filter = e.target.dataset.filter;
      setFilter(filter);
    }
  });
  

  elements.addBtn.addEventListener('click', addOpportunity);
  
 
  elements.opportunityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addOpportunity();
    }
  });
}


function addOpportunity() {
  const title = elements.opportunityInput.value.trim();
  
 
  if (!title) {
    elements.opportunityInput.focus();
    return;
  }
  
  
  const newOpp = {
    id: `opp-${Date.now()}`,
    title: title,
    category: 'internship'
  };
  
  state.availableOpportunities.push(newOpp);
  
  
  elements.opportunityInput.value = '';
  
  
  render();
  saveToStorage();
}


function saveOpportunity(id) {
  const index = state.availableOpportunities.findIndex(opp => opp.id === id);
  
  if (index !== -1) {
    const opp = state.availableOpportunities.splice(index, 1)[0];
    state.savedOpportunities.push(opp);
    render();
    saveToStorage();
  }
}


function removeOpportunity(id) {
  const index = state.savedOpportunities.findIndex(opp => opp.id === id);
  
  if (index !== -1) {
    const opp = state.savedOpportunities.splice(index, 1)[0];
    state.availableOpportunities.push(opp);
    render();
    saveToStorage();
  }
}


function setFilter(filter) {
  state.currentFilter = filter;
  

  elements.filterBtns.forEach(btn => {
    const isActive = btn.dataset.filter === filter;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive);
  });
  
  render();
}


function filterOpportunities(opportunities) {
  if (state.currentFilter === 'all') {
    return opportunities;
  }
  return opportunities.filter(opp => opp.category === state.currentFilter);
}


function createCard(opportunity, isSaved) {
  const buttonClass = isSaved ? 'remove-btn' : 'save-btn';
  const buttonText = isSaved ? 'Remove' : 'Save';
  const categoryDisplay = opportunity.category.charAt(0).toUpperCase() + 
                        opportunity.category.slice(1);
  
  
  const logoAlt = `${categoryDisplay} logo`;
  const logoSrc = `images/${opportunity.category}.png`;
  
  return `
    <div class="opportunity-card" data-id="${opportunity.id}" role="listitem">
      <img src="${logoSrc}" alt="${logoAlt}" class="opportunity-logo">
      <h3>${escapeHtml(opportunity.title)}</h3>
      <span class="opportunity-category">${categoryDisplay}</span>
      <button class="${buttonClass}" aria-label="${buttonText} ${opportunity.title}">
        ${buttonText}
      </button>
    </div>
  `;
}


function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}


function render() {
  // Filter opportunities
  const filteredAvailable = filterOpportunities(state.availableOpportunities);
  const filteredSaved = filterOpportunities(state.savedOpportunities);
  

  if (filteredAvailable.length === 0) {
    elements.availableGrid.innerHTML = '<div class="empty-state">No opportunities match the current filter</div>';
  } else {
    elements.availableGrid.innerHTML = filteredAvailable
      .map(opp => createCard(opp, false))
      .join('');
  }
  
  
  if (filteredSaved.length === 0) {
    elements.savedGrid.innerHTML = '<div class="empty-state">No saved opportunities yet</div>';
  } else {
    elements.savedGrid.innerHTML = filteredSaved
      .map(opp => createCard(opp, true))
      .join('');
  }
  
  
  elements.savedCount.textContent = state.savedOpportunities.length;
}


function saveToStorage() {
  const data = {
    available: state.availableOpportunities,
    saved: state.savedOpportunities
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}


function loadFromStorage() {
  const stored = localStorage.getItem(STORAGE_KEY);
  
  if (stored) {
    try {
      const data = JSON.parse(stored);
      state.availableOpportunities = data.available || state.availableOpportunities;
      state.savedOpportunities = data.saved || [];
    } catch (e) {
      console.error('Failed to load from storage:', e);
    }
  }
}


init();