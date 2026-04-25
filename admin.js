
const CATEGORY_LABELS = {
    electronics: "Electronics", accessories: "Accessories", documents: "Documents",
    clothing: "Clothing", keys: "Keys", bags: "Bags & Bottles",
    books: "Books & Stationery", other: "Other"
};
const LOCATION_LABELS = {
    library: "Library", cafeteria: "Cafeteria", auditorium: "Auditorium",
    gym: "Gym / Sports", lab: "Computer Lab", classroom: "Classroom",
    parking: "Parking Lot", hostel: "Hostel", other: "Other"
};
const CATEGORY_ICONS = {
    electronics: "fa-laptop", accessories: "fa-gem", documents: "fa-file-alt",
    clothing: "fa-shirt", keys: "fa-key", bags: "fa-bag-shopping",
    books: "fa-book", other: "fa-box"
};


const ADMIN_USER = "admin";
const ADMIN_PASS = "admin123";

let allItems = [];
let selectedIds = new Set();
let confirmCallback = null;


document.addEventListener("DOMContentLoaded", () => {
    
    if (sessionStorage.getItem("findora_admin") === "true") {
        showDashboard();
    }
    initLogin();
    initSidebar();
    initTabs();
    initTableControls();
    initConfirm();
});


function initLogin() {
    const form = document.getElementById("loginForm");
    const toggle = document.getElementById("passToggle");
    const passInput = document.getElementById("adminPass");

    toggle.addEventListener("click", () => {
        const isPass = passInput.type === "password";
        passInput.type = isPass ? "text" : "password";
        toggle.querySelector("i").className = isPass ? "fas fa-eye-slash" : "fas fa-eye";
    });

    form.addEventListener("submit", e => {
        e.preventDefault();
        const user = document.getElementById("adminUser").value.trim();
        const pass = document.getElementById("adminPass").value;
        if (user === ADMIN_USER && pass === ADMIN_PASS) {
            sessionStorage.setItem("findora_admin", "true");
            showDashboard();
        } else {
            document.getElementById("loginError").style.display = "flex";
            document.getElementById("adminPass").value = "";
        }
    });

    document.getElementById("logoutBtn").addEventListener("click", () => {
        sessionStorage.removeItem("findora_admin");
        location.reload();
    });
}

async function showDashboard() {
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("dashboard").style.display = "flex";
    await loadItems();
    renderAll();
    subscribeToChanges();
}

// ===== Supabase Data Layer =====
async function loadItems() {
    const { data, error } = await db.from('items').select('*').order('created_at', { ascending: false });
    if (error) {
        console.error('Error loading items:', error);
        allItems = [];
        return;
    }
    allItems = data || [];
}

function subscribeToChanges() {
    db.channel('admin-items')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, async () => {
            await loadItems();
            renderAll();
        })
        .subscribe();
}


function initSidebar() {
    const sidebar = document.getElementById("sidebar");
    const toggle = document.getElementById("sidebarToggle");
    toggle.addEventListener("click", () => sidebar.classList.toggle("open"));

    
    document.addEventListener("click", e => {
        if (window.innerWidth <= 768 && sidebar.classList.contains("open") &&
            !sidebar.contains(e.target) && e.target !== toggle) {
            sidebar.classList.remove("open");
        }
    });
}


function initTabs() {
    document.querySelectorAll("[data-tab]").forEach(link => {
        link.addEventListener("click", e => {
            e.preventDefault();
            switchTab(link.dataset.tab);
        });
    });
    document.querySelectorAll("[data-goto]").forEach(btn => {
        btn.addEventListener("click", () => switchTab(btn.dataset.goto));
    });
}

function switchTab(tab) {
    document.querySelectorAll(".sidebar-link[data-tab]").forEach(l => l.classList.remove("active"));
    document.querySelector(`.sidebar-link[data-tab="${tab}"]`)?.classList.add("active");
    document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active"));
    document.getElementById(`tab-${tab}`)?.classList.add("active");

    const titles = { overview: "Overview", items: "All Items", claimed: "Claimed Items" };
    document.getElementById("pageTitle").textContent = titles[tab] || "Dashboard";

    // Close mobile sidebar
    document.getElementById("sidebar").classList.remove("open");
    selectedIds.clear();
    renderAll();
}

// ===== Render Everything =====
function renderAll() {
    renderOverview();
    renderItemsTable();
    renderClaimedTable();
}

// ===== Overview =====
function renderOverview() {
    const total = allItems.length;
    const lost = allItems.filter(i => i.type === "lost").length;
    const found = allItems.filter(i => i.type === "found").length;
    const claimed = allItems.filter(i => i.type === "claimed").length;

    document.getElementById("statTotal").textContent = total;
    document.getElementById("statLost").textContent = lost;
    document.getElementById("statFound").textContent = found;
    document.getElementById("statClaimed").textContent = claimed;

    // Recent items
    const recent = [...allItems].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    const recentList = document.getElementById("recentList");
    if (recent.length === 0) {
        recentList.innerHTML = '<p style="color:var(--text-dim);text-align:center;padding:20px;">No items yet.</p>';
    } else {
        recentList.innerHTML = recent.map(item => {
            const icon = CATEGORY_ICONS[item.category] || "fa-box";
            const badgeClass = item.type === "lost" ? "badge-lost" : item.type === "found" ? "badge-found" : "badge-claimed";
            return `
                <div class="recent-item">
                    <div class="recent-item-icon ${item.type}"><i class="fas ${icon}"></i></div>
                    <div class="recent-item-info">
                        <h4>${escapeHtml(item.name)}</h4>
                        <span>${LOCATION_LABELS[item.location] || item.location} · ${formatDate(item.date)}</span>
                    </div>
                    <span class="recent-item-badge ${badgeClass}">${item.type}</span>
                </div>
            `;
        }).join("");
    }

    // Category breakdown
    const catCounts = {};
    allItems.forEach(i => { catCounts[i.category] = (catCounts[i.category] || 0) + 1; });
    const maxCount = Math.max(...Object.values(catCounts), 1);
    const catContainer = document.getElementById("categoryBreakdown");
    const sortedCats = Object.entries(catCounts).sort((a, b) => b[1] - a[1]);
    if (sortedCats.length === 0) {
        catContainer.innerHTML = '<p style="color:var(--text-dim);text-align:center;padding:20px;">No data.</p>';
    } else {
        catContainer.innerHTML = sortedCats.map(([cat, count]) => `
            <div class="cat-bar-item">
                <div class="cat-bar-header">
                    <span>${CATEGORY_LABELS[cat] || cat}</span>
                    <span>${count}</span>
                </div>
                <div class="cat-bar-track">
                    <div class="cat-bar-fill" style="width:${(count / maxCount) * 100}%"></div>
                </div>
            </div>
        `).join("");
    }
}

// ===== Items Table =====
function getAdminFilters() {
    return {
        search: document.getElementById("adminSearch").value.trim().toLowerCase(),
        status: document.getElementById("adminFilterStatus").value,
        category: document.getElementById("adminFilterCategory").value,
    };
}

function filterAdminItems() {
    const f = getAdminFilters();
    return allItems.filter(item => {
        if (f.search && !item.name.toLowerCase().includes(f.search) && !item.reporter.toLowerCase().includes(f.search)) return false;
        if (f.status !== "all" && item.type !== f.status) return false;
        if (f.category !== "all" && item.category !== f.category) return false;
        return true;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
}

function renderItemsTable() {
    const items = filterAdminItems();
    const tbody = document.getElementById("adminTableBody");
    const empty = document.getElementById("tableEmpty");
    const countEl = document.getElementById("itemCount");

    countEl.textContent = `${items.length} item${items.length !== 1 ? "s" : ""}`;

    if (items.length === 0) {
        tbody.innerHTML = "";
        empty.style.display = "block";
        return;
    }
    empty.style.display = "none";

    tbody.innerHTML = items.map(item => {
        const badgeClass = item.type === "lost" ? "badge-lost" : item.type === "found" ? "badge-found" : "badge-claimed";
        const checked = selectedIds.has(item.id) ? "checked" : "";
        return `
            <tr data-id="${item.id}">
                <td><input type="checkbox" class="row-check" data-id="${item.id}" ${checked}></td>
                <td class="table-item-name">${escapeHtml(item.name)}</td>
                <td><span class="table-badge ${badgeClass}">${item.type}</span></td>
                <td>${CATEGORY_LABELS[item.category] || item.category}</td>
                <td>${LOCATION_LABELS[item.location] || item.location}</td>
                <td>${formatDate(item.date)}</td>
                <td>${escapeHtml(item.reporter)}</td>
                <td>
                    <div class="action-btns">
                        ${item.type !== "claimed" ? `<button class="action-btn success" title="Mark Claimed" onclick="adminMarkClaimed(${item.id})"><i class="fas fa-check"></i></button>` : ""}
                        <button class="action-btn danger" title="Delete" onclick="adminDeleteItem(${item.id})"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");

    updateBulkBtn();
}

// ===== Claimed Table =====
function renderClaimedTable() {
    const search = document.getElementById("claimedSearch").value.trim().toLowerCase();
    const items = allItems.filter(i => i.type === "claimed" && (!search || i.name.toLowerCase().includes(search) || i.reporter.toLowerCase().includes(search)))
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    const tbody = document.getElementById("claimedTableBody");
    const empty = document.getElementById("claimedEmpty");
    const countEl = document.getElementById("claimedCount");

    countEl.textContent = `${items.length} item${items.length !== 1 ? "s" : ""}`;

    if (items.length === 0) {
        tbody.innerHTML = "";
        empty.style.display = "block";
        return;
    }
    empty.style.display = "none";

    tbody.innerHTML = items.map(item => {
        const checked = selectedIds.has(item.id) ? "checked" : "";
        return `
            <tr data-id="${item.id}">
                <td><input type="checkbox" class="row-check-claimed" data-id="${item.id}" ${checked}></td>
                <td class="table-item-name">${escapeHtml(item.name)}</td>
                <td>${CATEGORY_LABELS[item.category] || item.category}</td>
                <td>${LOCATION_LABELS[item.location] || item.location}</td>
                <td>${formatDate(item.date)}</td>
                <td>${escapeHtml(item.reporter)}</td>
                <td>
                    <div class="action-btns">
                        <button class="action-btn danger" title="Delete" onclick="adminDeleteItem(${item.id})"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}

// ===== Table Controls =====
function initTableControls() {
    // Search & filters
    document.getElementById("adminSearch").addEventListener("input", () => renderItemsTable());
    document.getElementById("adminFilterStatus").addEventListener("change", () => renderItemsTable());
    document.getElementById("adminFilterCategory").addEventListener("change", () => renderItemsTable());
    document.getElementById("claimedSearch").addEventListener("input", () => renderClaimedTable());

    // Select all
    document.getElementById("selectAll").addEventListener("change", function () {
        const checks = document.querySelectorAll(".row-check");
        checks.forEach(c => {
            c.checked = this.checked;
            const id = parseInt(c.dataset.id);
            this.checked ? selectedIds.add(id) : selectedIds.delete(id);
        });
        updateBulkBtn();
    });
    document.getElementById("selectAllClaimed").addEventListener("change", function () {
        const checks = document.querySelectorAll(".row-check-claimed");
        checks.forEach(c => {
            c.checked = this.checked;
            const id = parseInt(c.dataset.id);
            this.checked ? selectedIds.add(id) : selectedIds.delete(id);
        });
        updateBulkClaimedBtn();
    });

    // Row checkboxes (delegated)
    document.getElementById("adminTableBody").addEventListener("change", e => {
        if (e.target.classList.contains("row-check")) {
            const id = parseInt(e.target.dataset.id);
            e.target.checked ? selectedIds.add(id) : selectedIds.delete(id);
            updateBulkBtn();
        }
    });
    document.getElementById("claimedTableBody").addEventListener("change", e => {
        if (e.target.classList.contains("row-check-claimed")) {
            const id = parseInt(e.target.dataset.id);
            e.target.checked ? selectedIds.add(id) : selectedIds.delete(id);
            updateBulkClaimedBtn();
        }
    });

    // Bulk delete
    document.getElementById("bulkDeleteBtn").addEventListener("click", () => {
        const count = selectedIds.size;
        if (!count) return;
        showConfirm(`Delete ${count} item${count > 1 ? "s" : ""}?`, "This will permanently remove the selected items.", async () => {
            try {
                const ids = [...selectedIds];
                const { error } = await db.from('items').delete().in('id', ids);
                if (error) throw error;
                selectedIds.clear();
                await loadItems();
                renderAll();
                showToast(`${count} item${count > 1 ? "s" : ""} deleted.`, "success");
            } catch (err) {
                console.error(err);
                showToast("Failed to delete items.", "error");
            }
        });
    });
    document.getElementById("bulkDeleteClaimedBtn").addEventListener("click", () => {
        const count = selectedIds.size;
        if (!count) return;
        showConfirm(`Delete ${count} claimed item${count > 1 ? "s" : ""}?`, "This will permanently remove the selected items.", async () => {
            try {
                const ids = [...selectedIds];
                const { error } = await db.from('items').delete().in('id', ids);
                if (error) throw error;
                selectedIds.clear();
                await loadItems();
                renderAll();
                showToast(`${count} item${count > 1 ? "s" : ""} deleted.`, "success");
            } catch (err) {
                console.error(err);
                showToast("Failed to delete items.", "error");
            }
        });
    });

    // Clear all claimed
    document.getElementById("clearAllClaimed").addEventListener("click", () => {
        const claimed = allItems.filter(i => i.type === "claimed");
        if (!claimed.length) { showToast("No claimed items to remove.", "error"); return; }
        showConfirm(`Remove all ${claimed.length} claimed items?`, "This will permanently delete all items marked as claimed.", async () => {
            try {
                const { error } = await db.from('items').delete().eq('type', 'claimed');
                if (error) throw error;
                await loadItems();
                renderAll();
                showToast("All claimed items removed.", "success");
            } catch (err) {
                console.error(err);
                showToast("Failed to remove claimed items.", "error");
            }
        });
    });
}

function updateBulkBtn() {
    document.getElementById("bulkDeleteBtn").disabled = selectedIds.size === 0;
}
function updateBulkClaimedBtn() {
    document.getElementById("bulkDeleteClaimedBtn").disabled = selectedIds.size === 0;
}

// ===== Item Actions =====
async function adminDeleteItem(id) {
    const item = allItems.find(i => i.id === id);
    if (!item) return;
    showConfirm(`Delete "${item.name}"?`, "This item will be permanently removed.", async () => {
        try {
            const { error } = await db.from('items').delete().eq('id', id);
            if (error) throw error;
            selectedIds.delete(id);
            await loadItems();
            renderAll();
            showToast("Item deleted.", "success");
        } catch (err) {
            console.error(err);
            showToast("Failed to delete item.", "error");
        }
    });
}

async function adminMarkClaimed(id) {
    try {
        const item = allItems.find(i => i.id === id);
        const { error } = await db.from('items').update({ type: 'claimed' }).eq('id', id);
        if (error) throw error;
        await loadItems();
        renderAll();
        showToast(`"${item?.name}" marked as claimed.`, "success");
    } catch (err) {
        console.error(err);
        showToast("Failed to update item.", "error");
    }
}

// ===== Confirm Dialog =====
function initConfirm() {
    document.getElementById("confirmCancel").addEventListener("click", closeConfirm);
    document.getElementById("confirmModal").addEventListener("click", e => {
        if (e.target === e.currentTarget) closeConfirm();
    });
    document.getElementById("confirmOk").addEventListener("click", () => {
        if (confirmCallback) confirmCallback();
        closeConfirm();
    });
}

function showConfirm(title, msg, callback) {
    document.getElementById("confirmTitle").textContent = title;
    document.getElementById("confirmMsg").textContent = msg;
    confirmCallback = callback;
    document.getElementById("confirmModal").classList.add("active");
}

function closeConfirm() {
    document.getElementById("confirmModal").classList.remove("active");
    confirmCallback = null;
}

// ===== Toast =====
function showToast(msg, type = "success") {
    const container = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas ${type === "success" ? "fa-check-circle" : "fa-exclamation-circle"}"></i><p>${msg}</p>`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = "0"; toast.style.transform = "translateX(100%)"; setTimeout(() => toast.remove(), 400); }, 3000);
}

// ===== Utilities =====
function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}
