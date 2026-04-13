const state = {
    units: [],
    drivers: [],
    map: null,
    markers: {},
    currentView: 'dashboard'
};

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupAuthHandlers();
});

function checkAuth() {
    const session = localStorage.getItem('session');
    if (!session) {
        document.getElementById('modal-login').style.display = 'flex';
    } else {
        document.getElementById('modal-login').style.display = 'none';
        const user = JSON.parse(session);
        document.getElementById('user-display-name').innerText = user.email.split('@')[0].toUpperCase();
        document.getElementById('user-initial').innerText = user.email[0];
        initApp();
    }
}

async function initApp() {
    lucide.createIcons();
    await refreshData();
    setupNavigation();
    initMap();
    renderAll();
    setupFlotaButton();
}

function setupAuthHandlers() {
    document.getElementById('form-login').addEventListener('submit', (e) => {
        e.preventDefault();
        localStorage.setItem('session', JSON.stringify({ email: document.getElementById('login-email').value }));
        window.location.reload();
    });

    document.getElementById('btn-logout').addEventListener('click', () => {
        localStorage.removeItem('session');
        window.location.reload();
    });
}

function initMap() {
    if (state.map) return;
    state.map = L.map('map', { zoomControl: false }).setView([-16.500, -68.120], 14);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(state.map);
}

function setupNavigation() {
    document.querySelectorAll('.nav-link').forEach(btn => {
        if (btn.id === 'btn-logout') return;
        btn.addEventListener('click', () => {
            const viewId = btn.id.replace('btn-', '');
            state.currentView = viewId;
            document.querySelectorAll('section').forEach(s => s.classList.add('hidden'));
            document.getElementById(`view-${viewId}`).classList.remove('hidden');
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            btn.classList.add('active');
            
            const titles = { 'dashboard': 'Monitor Satelital', 'flota': 'Gestión de Camiones', 'personal': 'Panel de Conductores', 'reportes': 'Auditoría Logs' };
            document.getElementById('page-title').innerText = titles[viewId];
            if (viewId === 'dashboard' && state.map) setTimeout(() => state.map.invalidateSize(), 200);
        });
    });
}

async function refreshData() {
    state.units = await ApiService.getTrucks();
    state.drivers = await ApiService.getDrivers();
}

function renderAll() {
    renderTruckList();
    renderFlotaTable();
    renderDriverCards();
    updateMapMarkers();
}

function renderDriverCards() {
    const container = document.getElementById('conductor-cards');
    let html = `
        <div onclick="openModal('modal-conductor')" class="bg-emerald-50 border-2 border-dashed border-emerald-200 p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-emerald-600 cursor-pointer hover:bg-emerald-100 transition-all group">
            <div class="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/20">
                <i data-lucide="plus" class="w-8 h-8"></i>
            </div>
            <span class="font-bold text-xs uppercase tracking-widest text-center">Registrar Conductor</span>
        </div>
    `;
    
    html += state.drivers.map(d => `
        <div class="bg-white p-7 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden hover:border-emerald-200 transition-all">
            <div class="absolute top-0 right-0 p-6 font-mono text-[10px] text-slate-300 font-bold uppercase tracking-widest">CI: ${d.ci}</div>
            <div class="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center mb-5 shadow-lg"><i data-lucide="user"></i></div>
            <h4 class="font-bold text-slate-800 text-lg">${d.name}</h4>
            <p class="text-xs text-slate-400 mb-2 italic uppercase font-semibold">Licencia: ${d.license}</p>
        </div>
    `).join('');
    
    container.innerHTML = html;
    lucide.createIcons();
}

function renderTruckList() {
    document.getElementById('truck-status-list').innerHTML = state.units.map(u => `
        <div class="p-5 bg-white rounded-[1.5rem] border border-slate-100 shadow-sm">
            <div class="flex justify-between font-bold text-sm mb-1 uppercase tracking-tighter"><span>${u.plate}</span><span class="${u.status === 'moving' ? 'text-emerald-500' : 'text-slate-300'} text-[9px] uppercase tracking-widest italic">${u.status}</span></div>
            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">${u.operative_state}</p>
        </div>
    `).join('');
}

function updateMapMarkers() {
    state.units.forEach(u => {
        if (!state.markers[u.id]) state.markers[u.id] = L.marker([u.lat, u.lng]).addTo(state.map);
        else state.markers[u.id].setLatLng([u.lat, u.lng]);
    });
}

function renderFlotaTable() {
    document.getElementById('flota-table-body').innerHTML = state.units.map(u => `
        <tr>
            <td class="font-bold italic uppercase tracking-tighter">${u.plate}</td>
            <td><div class="text-xs font-bold text-slate-700">${u.model}</div><div class="text-[9px] text-slate-400 font-mono">IMEI: ${u.imei}</div></td>
            <td><span class="bg-emerald-50 text-emerald-600 px-4 py-1 rounded-full text-[10px] font-black italic uppercase">${u.operative_state}</span></td>
            <td class="text-right"><button class="p-2 text-slate-200 hover:text-emerald-500 transition-colors"><i data-lucide="edit" class="w-4 h-4"></i></button></td>
        </tr>
    `).join('');
    lucide.createIcons();
}

function setupFlotaButton() {
    const btnAddCamion = document.querySelector('#view-flota button');
    if (btnAddCamion) {
        btnAddCamion.onclick = () => openModal('modal-camion');
    }
}

window.openModal = (id) => {
    const m = document.getElementById(id);
    m.classList.remove('hidden');
    m.style.display = 'flex';
};
window.closeModal = (id) => {
    const m = document.getElementById(id);
    m.style.display = 'none';
};