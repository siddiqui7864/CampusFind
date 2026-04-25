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

let allItems = [];
let displayCount = 9;

document.addEventListener("DOMContentLoaded", () => {
    loadItems();
    initNavbar();
    initHeroSearch();
    initFilters();
    initPostModal();
    initDetailModal();
    initCounters();
    initScrollAnimations();
    setDefaultDate();
    subscribeRealtime();
});

async function loadItems() {
    try {
        const { data, error } = await supabase
            .from('items')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        allItems = data || [];
        renderItems();
    } catch (err) {
        console.error('Error loading items:', err);
        showToast('Failed to load items. Please refresh.', 'error');
    }
}

function subscribeRealtime() {
    supabase
        .channel('public:items')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, () => {
            loadItems();
        })
        .subscribe();
}

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

function filterItems() {
    const f = getFilters();
    const now = new Date();
    return allItems.filter(item => {
        if (f.search && !item.name.toLowerCase().includes(f.search) && !(item.description || '').toLowerCase().includes(f.search) && !item.category.toLowerCase().includes(f.search)) return false;
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

function getImageSrc(image) {
    if (!image) return null;
    if (image.startsWith('data:') || image.startsWith('http')) return image;
    const { data } = supabase.storage.from('item-images').getPublicUrl(image);
    return data.publicUrl;
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
        const imageSrc = getImageSrc(item.image);

        card.innerHTML = `
            <div class="item-card-image">
                ${imageSrc ? `<img src="${imageSrc}" alt="${item.name}">` : `<i class="fas ${icon} placeholder-icon"></i>`}
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
    const imageSrc = getImageSrc(item.image);

    body.innerHTML = `
        <div class="detail-image">
            ${imageSrc ? `<img src="${imageSrc}" alt="${item.name}">` : `<i class="fas ${icon} placeholder-icon"></i>`}
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

async function markClaimed(id) {
    try {
        const { error } = await supabase.from('items').update({ type: 'claimed' }).eq('id', id);
        if (error) throw error;
        document.getElementById("detailModal").classList.remove("active");
        document.body.style.overflow = "";
        showToast("Item marked as claimed! 🎉", "success");
        await loadItems();
    } catch (err) {
        console.error('Error marking claimed:', err);
        showToast('Failed to update item.', 'error');
    }
}

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
    let selectedFile = null;

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
        selectedFile = null;
        preview.style.display = "none";
        fileArea.style.display = "";
        previewImg.src = "";
    });

    function handleFile(file) {
        if (!file.type.startsWith("image/")) return;
        selectedFile = file;
        const reader = new FileReader();
        reader.onload = e => {
            previewImg.src = e.target.result;
            preview.style.display = "block";
            fileArea.style.display = "none";
        };
        reader.readAsDataURL(file);
    }

    form.addEventListener("submit", async e => {
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

        const submitBtn = document.getElementById("submitPost");
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

        try {
            let imagePath = null;
            if (selectedFile) {
                const fileExt = selectedFile.name.split('.').pop();
                const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
                const { error: uploadError } = await supabase.storage.from('item-images').upload(fileName, selectedFile);
                if (uploadError) throw uploadError;
                imagePath = fileName;
            }

            const newItem = {
                type: document.querySelector('input[name="itemType"]:checked').value,
                name, category, location, date,
                description: document.getElementById("itemDescription").value.trim(),
                reporter, contact,
                image: imagePath,
            };

            const { error } = await supabase.from('items').insert([newItem]);
            if (error) throw error;

            form.reset();
            selectedFile = null;
            preview.style.display = "none";
            fileArea.style.display = "";
            previewImg.src = "";
            modal.classList.remove("active");
            document.body.style.overflow = "";
            showToast("Item reported successfully! ✅", "success");
            document.getElementById("items-section").scrollIntoView({ behavior: "smooth" });
            await loadItems();
        } catch (err) {
            console.error('Error submitting item:', err);
            showToast('Failed to submit. Please try again.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Report';
        }
    });
}

function setDefaultDate() {
    const d = new Date();
    document.getElementById("itemDate").value = d.toISOString().split("T")[0];
}

function showToast(msg, type = "success") {
    const container = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas ${type === "success" ? "fa-check-circle" : "fa-exclamation-circle"}"></i><p>${msg}</p>`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = "0"; toast.style.transform = "translateX(100%)"; setTimeout(() => toast.remove(), 400); }, 3500);
}

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

document.head.insertAdjacentHTML("beforeend", `<style>.animate-in{opacity:1!important;transform:translateY(0)!important;}</style>`);

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
