// ===== Findora — Lost & Found Portal =====

// ===== Sample Data =====
const SAMPLE_ITEMS = [
    {
        id: 1, type: "lost", name: "Black iPhone 15 Pro", category: "electronics",
        location: "library", date: "2026-04-24",
        description: "Lost my iPhone 15 Pro (black, 256GB) near the 2nd floor reading section. Has a clear case with a sticker on the back.",
        reporter: "Aarav Mehta", contact: "aarav.m@campus.edu", image: null
    },
    {
        id: 2, type: "found", name: "Silver House Keys (3 keys)", category: "keys",
        location: "cafeteria", date: "2026-04-24",
        description: "Found a set of 3 silver keys on a red carabiner near the south entrance of the cafeteria.",
        reporter: "Priya Sharma", contact: "priya.s@campus.edu", image: null
    },
    {
        id: 3, type: "lost", name: "Brown Leather Wallet", category: "accessories",
        location: "auditorium", date: "2026-04-23",
        description: "Lost a brown leather bifold wallet (brand: Tommy Hilfiger). Contains college ID and debit card.",
        reporter: "Rohan Gupta", contact: "rohan.g@campus.edu", image: null
    },
    {
        id: 4, type: "found", name: "Blue JBL Earbuds Case", category: "electronics",
        location: "gym", date: "2026-04-23",
        description: "Found a blue JBL earbuds charging case on the bench near the treadmills. Earbuds are inside.",
        reporter: "Sneha Patel", contact: "sneha.p@campus.edu", image: null
    },
    {
        id: 5, type: "lost", name: "College ID Card — Vikram S.", category: "documents",
        location: "classroom", date: "2026-04-22",
        description: "Lost my college ID card, name Vikram Srinivasan, Roll No. CS2024-087. Last seen in Room 302.",
        reporter: "Vikram S.", contact: "+91 98765 12345", image: null
    },
    {
        id: 6, type: "found", name: "Black Laptop Bag (HP)", category: "bags",
        location: "parking", date: "2026-04-22",
        description: "Found a black HP laptop bag near the two-wheeler parking area. Has a charger and notebook inside.",
        reporter: "Ananya Iyer", contact: "ananya.i@campus.edu", image: null
    },
    {
        id: 7, type: "claimed", name: "Ray-Ban Sunglasses", category: "accessories",
        location: "cafeteria", date: "2026-04-20",
        description: "Black frame Ray-Ban sunglasses found near the vending machines. Successfully returned to owner!",
        reporter: "Karan Joshi", contact: "karan.j@campus.edu", image: null
    },
    {
        id: 8, type: "found", name: "Data Structures Textbook", category: "books",
        location: "library", date: "2026-04-21",
        description: "Found a 'Data Structures and Algorithms in C++' textbook on the 3rd floor study table. Name inside: D. Kumar.",
        reporter: "Meera Nair", contact: "meera.n@campus.edu", image: null
    },
    {
        id: 9, type: "lost", name: "Red Hoodie (Nike)", category: "clothing",
        location: "hostel", date: "2026-04-21",
        description: "Left my red Nike hoodie (size M) in the hostel common room. Has my initials 'RK' on the tag.",
        reporter: "Ravi Kumar", contact: "+91 91234 56789", image: null
    },
    {
        id: 10, type: "found", name: "Steel Water Bottle (750ml)", category: "bags",
        location: "lab", date: "2026-04-22",
        description: "Found a steel water bottle with floral stickers in Computer Lab 2. Left on the desk near Window 3.",
        reporter: "Tanya Reddy", contact: "tanya.r@campus.edu", image: null
    },
    {
        id: 11, type: "lost", name: "USB Drive (32GB SanDisk)", category: "electronics",
        location: "lab", date: "2026-04-23",
        description: "Lost a red 32GB SanDisk USB drive in Computer Lab 1. Contains important project files.",
        reporter: "Arjun Nair", contact: "arjun.n@campus.edu", image: null
    },
    {
        id: 12, type: "found", name: "Prescription Glasses", category: "accessories",
        location: "classroom", date: "2026-04-24",
        description: "Found a pair of black-framed prescription glasses in Room 205 after the morning lecture.",
        reporter: "Divya Rao", contact: "divya.r@campus.edu", image: null
    }
];

const CATEGORY_ICONS = {
    electronics: "fa-laptop", accessories: "fa-gem", documents: "fa-file-alt",
    clothing: "fa-shirt", keys: "fa-key", bags: "fa-bag-shopping",
    books: "fa-book", other: "fa-box"
};
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

// ===== State =====
let allItems = [];
let displayCount = 9;

// ===== Init =====
document.addEventListener("DOMContentLoaded", () => {
    loadItems();
    renderItems();
    initNavbar();
    initHeroSearch();
    initFilters();
    initPostModal();
    initDetailModal();
    initCounters();
    initScrollAnimations();
    setDefaultDate();
});

// ===== LocalStorage =====
function loadItems() {
    const stored = localStorage.getItem("findora_items");
    if (stored) {
        allItems = JSON.parse(stored);
    } else {
        allItems = [...SAMPLE_ITEMS];
        saveItems();
    }
}
function saveItems() {
    localStorage.setItem("findora_items", JSON.stringify(allItems));
}

// ===== Navbar =====
function initNavbar() {
    const navbar = document.getElementById("navbar");
    const toggle = document.getElementById("navToggle");
    const links = document.getElementById("navLinks");

    window.addEventListener("scroll", () => {
        navbar.classList.toggle("scrolled", window.scrollY > 50);
    });
    toggle.addEventListener("click", () => {
        links.classList.toggle("open");
        toggle.classList.toggle("active");
    });
    document.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", () => {
            links.classList.remove("open");
            toggle.classList.remove("active");
            document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
            link.classList.add("active");
        });
    });
}

// ===== Hero Search =====
function initHeroSearch() {
    const input = document.getElementById("heroSearch");
    const btn = document.getElementById("heroSearchBtn");

    const doSearch = () => {
        const q = input.value.trim();
        if (q) {
            document.getElementById("filterSearch").value = q;
            applyFilters();
            document.getElementById("items-section").scrollIntoView({ behavior: "smooth" });
        }
    };
    btn.addEventListener("click", doSearch);
    input.addEventListener("keydown", e => { if (e.key === "Enter") doSearch(); });

    document.querySelectorAll(".tag[data-search]").forEach(tag => {
        tag.addEventListener("click", () => {
            input.value = tag.dataset.search;
            doSearch();
        });
    });
}

// ===== Filters =====
function initFilters() {
    ["filterSearch", "filterStatus", "filterCategory", "filterLocation", "filterDate"].forEach(id => {
        document.getElementById(id).addEventListener(id === "filterSearch" ? "input" : "change", applyFilters);
    });
    document.getElementById("clearFilters").addEventListener("click", clearFilters);
    document.getElementById("emptyStateClear").addEventListener("click", clearFilters);
    document.getElementById("loadMoreBtn").addEventListener("click", () => {
        displayCount += 6;
        renderItems();
    });
}

function getFilters() {
    return {
        search: document.getElementById("filterSearch").value.trim().toLowerCase(),
        status: document.getElementById("filterStatus").value,
        category: document.getElementById("filterCategory").value,
        location: document.getElementById("filterLocation").value,
        date: document.getElementById("filterDate").value,
    };
}

function applyFilters() {
    displayCount = 9;
    renderItems();
    renderActiveFilters();
}

function clearFilters() {
    document.getElementById("filterSearch").value = "";
    document.getElementById("filterStatus").value = "all";
    document.getElementById("filterCategory").value = "all";
    document.getElementById("filterLocation").value = "all";
    document.getElementById("filterDate").value = "all";
    displayCount = 9;
    renderItems();
    renderActiveFilters();
}

function renderActiveFilters() {
    const f = getFilters();
    const container = document.getElementById("activeFilters");
    container.innerHTML = "";
    if (f.search) addFilterTag(container, `"${f.search}"`, () => { document.getElementById("filterSearch").value = ""; applyFilters(); });
    if (f.status !== "all") addFilterTag(container, f.status, () => { document.getElementById("filterStatus").value = "all"; applyFilters(); });
    if (f.category !== "all") addFilterTag(container, CATEGORY_LABELS[f.category] || f.category, () => { document.getElementById("filterCategory").value = "all"; applyFilters(); });
    if (f.location !== "all") addFilterTag(container, LOCATION_LABELS[f.location] || f.location, () => { document.getElementById("filterLocation").value = "all"; applyFilters(); });
    if (f.date !== "all") {
        const labels = { today: "Today", week: "This Week", month: "This Month" };
        addFilterTag(container, labels[f.date], () => { document.getElementById("filterDate").value = "all"; applyFilters(); });
    }
}

function addFilterTag(container, text, onRemove) {
    const tag = document.createElement("span");
    tag.className = "active-filter-tag";
    tag.innerHTML = `${text} <button aria-label="Remove filter">&times;</button>`;
    tag.querySelector("button").addEventListener("click", onRemove);
    container.appendChild(tag);
}

// ===== Render Items =====
function filterItems() {
    const f = getFilters();
    const now = new Date();
    return allItems.filter(item => {
        if (f.search && !item.name.toLowerCase().includes(f.search) && !item.description.toLowerCase().includes(f.search) && !item.category.toLowerCase().includes(f.search)) return false;
        if (f.status !== "all" && item.type !== f.status) return false;
        if (f.category !== "all" && item.category !== f.category) return false;
        if (f.location !== "all" && item.location !== f.location) return false;
        if (f.date !== "all") {
            const d = new Date(item.date);
            const diffDays = (now - d) / (1000 * 60 * 60 * 24);
            if (f.date === "today" && diffDays > 1) return false;
            if (f.date === "week" && diffDays > 7) return false;
            if (f.date === "month" && diffDays > 30) return false;
        }
        return true;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
}

function renderItems() {
    const filtered = filterItems();
    const grid = document.getElementById("itemsGrid");
    const emptyState = document.getElementById("emptyState");
    const loadWrap = document.getElementById("loadMoreWrap");
    const visible = filtered.slice(0, displayCount);

    grid.innerHTML = "";
    if (filtered.length === 0) {
        emptyState.style.display = "block";
        loadWrap.style.display = "none";
        return;
    }
    emptyState.style.display = "none";
    loadWrap.style.display = filtered.length > displayCount ? "block" : "none";

    visible.forEach((item, i) => {
        const card = document.createElement("div");
        card.className = "item-card";
        card.style.animationDelay = `${i * 0.06}s`;
        card.dataset.id = item.id;

        const badgeClass = item.type === "lost" ? "badge-lost" : item.type === "found" ? "badge-found" : "badge-claimed";
        const icon = CATEGORY_ICONS[item.category] || "fa-box";
        const dateStr = formatDate(item.date);

        card.innerHTML = `
            <div class="item-card-image">
                ${item.image ? `<img src="${item.image}" alt="${item.name}">` : `<i class="fas ${icon} placeholder-icon"></i>`}
                <span class="item-badge ${badgeClass}">${item.type}</span>
            </div>
            <div class="item-card-body">
                <h3>${escapeHtml(item.name)}</h3>
                <div class="item-meta">
                    <span><i class="fas fa-layer-group"></i> ${CATEGORY_LABELS[item.category] || item.category}</span>
                    <span><i class="fas fa-location-dot"></i> ${LOCATION_LABELS[item.location] || item.location}</span>
                    <span><i class="fas fa-calendar"></i> ${dateStr}</span>
                </div>
                <div class="item-card-footer">
                    <span class="reporter"><i class="fas fa-user"></i> ${escapeHtml(item.reporter)}</span>
                    <span class="view-btn">View <i class="fas fa-arrow-right"></i></span>
                </div>
            </div>
        `;
        card.addEventListener("click", () => showDetail(item.id));
        grid.appendChild(card);
    });
}

// ===== Detail Modal =====
function initDetailModal() {
    document.getElementById("closeDetailModal").addEventListener("click", () => {
        document.getElementById("detailModal").classList.remove("active");
        document.body.style.overflow = "";
    });
    document.getElementById("detailModal").addEventListener("click", e => {
        if (e.target === e.currentTarget) {
            e.currentTarget.classList.remove("active");
            document.body.style.overflow = "";
        }
    });
}

function showDetail(id) {
    const item = allItems.find(i => i.id === id);
    if (!item) return;
    const body = document.getElementById("detailBody");
    const badgeClass = item.type === "lost" ? "badge-lost" : item.type === "found" ? "badge-found" : "badge-claimed";
    const icon = CATEGORY_ICONS[item.category] || "fa-box";

    body.innerHTML = `
        <div class="detail-image">
            ${item.image ? `<img src="${item.image}" alt="${item.name}">` : `<i class="fas ${icon} placeholder-icon"></i>`}
        </div>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
            <span class="item-badge ${badgeClass}" style="position:static;">${item.type}</span>
            <h3 style="font-size:1.15rem;">${escapeHtml(item.name)}</h3>
        </div>
        <div class="detail-info">
            <div class="detail-row"><i class="fas fa-layer-group"></i><span><strong>Category:</strong> ${CATEGORY_LABELS[item.category]}</span></div>
            <div class="detail-row"><i class="fas fa-location-dot"></i><span><strong>Location:</strong> ${LOCATION_LABELS[item.location]}</span></div>
            <div class="detail-row"><i class="fas fa-calendar"></i><span><strong>Date:</strong> ${formatDate(item.date)}</span></div>
            ${item.description ? `<div class="detail-row"><i class="fas fa-align-left"></i><span><strong>Details:</strong> ${escapeHtml(item.description)}</span></div>` : ""}
        </div>
        <div class="detail-contact">
            <h4><i class="fas fa-user-circle"></i> Reported by</h4>
            <p><strong>${escapeHtml(item.reporter)}</strong><br>${escapeHtml(item.contact)}</p>
        </div>
        ${item.type !== "claimed" ? `<button class="btn btn-primary btn-full" style="margin-top:16px;" onclick="markClaimed(${item.id})"><i class="fas fa-check-circle"></i> Mark as Claimed</button>` : ""}
    `;
    document.getElementById("detailTitle").textContent = item.type === "lost" ? "Lost Item" : item.type === "found" ? "Found Item" : "Claimed Item";
    document.getElementById("detailModal").classList.add("active");
    document.body.style.overflow = "hidden";
}

function markClaimed(id) {
    const item = allItems.find(i => i.id === id);
    if (item) {
        item.type = "claimed";
        saveItems();
        renderItems();
        document.getElementById("detailModal").classList.remove("active");
        document.body.style.overflow = "";
        showToast("Item marked as claimed! 🎉", "success");
    }
}

// ===== Post Modal =====
function initPostModal() {
    const modal = document.getElementById("postModal");
    const openBtns = document.querySelectorAll("#openPostModal");
    const closeBtn = document.getElementById("closePostModal");
    const form = document.getElementById("postForm");
    const fileArea = document.getElementById("fileUploadArea");
    const fileInput = document.getElementById("itemImage");
    const preview = document.getElementById("imagePreview");
    const previewImg = document.getElementById("previewImg");
    const removeImg = document.getElementById("removeImage");

    openBtns.forEach(btn => btn.addEventListener("click", () => {
        modal.classList.add("active");
        document.body.style.overflow = "hidden";
    }));
    closeBtn.addEventListener("click", () => {
        modal.classList.remove("active");
        document.body.style.overflow = "";
    });
    modal.addEventListener("click", e => {
        if (e.target === modal) { modal.classList.remove("active"); document.body.style.overflow = ""; }
    });

    // Image upload
    fileArea.addEventListener("click", () => fileInput.click());
    fileArea.addEventListener("dragover", e => { e.preventDefault(); fileArea.style.borderColor = "var(--primary)"; });
    fileArea.addEventListener("dragleave", () => { fileArea.style.borderColor = ""; });
    fileArea.addEventListener("drop", e => {
        e.preventDefault(); fileArea.style.borderColor = "";
        if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener("change", () => { if (fileInput.files.length) handleFile(fileInput.files[0]); });
    removeImg.addEventListener("click", () => {
        fileInput.value = "";
        preview.style.display = "none";
        fileArea.style.display = "";
        previewImg.src = "";
    });

    function handleFile(file) {
        if (!file.type.startsWith("image/")) return;
        const reader = new FileReader();
        reader.onload = e => {
            previewImg.src = e.target.result;
            preview.style.display = "block";
            fileArea.style.display = "none";
        };
        reader.readAsDataURL(file);
    }

    // Submit
    form.addEventListener("submit", e => {
        e.preventDefault();
        const name = document.getElementById("itemName").value.trim();
        const category = document.getElementById("itemCategory").value;
        const location = document.getElementById("itemLocation").value;
        const date = document.getElementById("itemDate").value;
        const reporter = document.getElementById("reporterName").value.trim();
        const contact = document.getElementById("reporterContact").value.trim();

        if (!name || !category || !location || !date || !reporter || !contact) {
            showToast("Please fill all required fields.", "error");
            return;
        }

        const newItem = {
            id: Date.now(),
            type: document.querySelector('input[name="itemType"]:checked').value,
            name, category, location, date,
            description: document.getElementById("itemDescription").value.trim(),
            reporter, contact,
            image: previewImg.src || null,
        };
        allItems.unshift(newItem);
        saveItems();
        renderItems();

        form.reset();
        preview.style.display = "none";
        fileArea.style.display = "";
        previewImg.src = "";
        modal.classList.remove("active");
        document.body.style.overflow = "";
        showToast("Item reported successfully! ✅", "success");
        document.getElementById("items-section").scrollIntoView({ behavior: "smooth" });
    });
}

function setDefaultDate() {
    const d = new Date();
    document.getElementById("itemDate").value = d.toISOString().split("T")[0];
}

// ===== Toast =====
function showToast(msg, type = "success") {
    const container = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas ${type === "success" ? "fa-check-circle" : "fa-exclamation-circle"}"></i><p>${msg}</p>`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = "0"; toast.style.transform = "translateX(100%)"; setTimeout(() => toast.remove(), 400); }, 3500);
}

// ===== Counters Animation =====
function initCounters() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.querySelectorAll("[data-count]").forEach(el => {
                    animateCounter(el, parseInt(el.dataset.count));
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    document.querySelectorAll(".hero-stats, .stats-grid").forEach(el => observer.observe(el));
}

function animateCounter(el, target) {
    let current = 0;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => {
        current += step;
        if (current >= target) { current = target; clearInterval(timer); }
        el.textContent = current.toLocaleString();
    }, 25);
}

// ===== Scroll Animations =====
function initScrollAnimations() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("animate-in");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll(".step-card, .stat-card, .section-header").forEach(el => {
        el.style.opacity = "0";
        el.style.transform = "translateY(30px)";
        el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
        observer.observe(el);
    });
}

// Add animation class
document.head.insertAdjacentHTML("beforeend", `<style>.animate-in{opacity:1!important;transform:translateY(0)!important;}</style>`);

// ===== Utilities =====
function formatDate(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    if (diff < 7) return `${diff} days ago`;
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}
