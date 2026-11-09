
const API_URL = "api.php";

const addBusinessButton = document.getElementById("add-business-button");
const businessModal = document.getElementById("business-modal");
const modalOverlay = document.getElementById("modal-overlay");
const closeModalButton = document.getElementById("close-modal-button");
const cancelFormButton = document.getElementById("cancel-form-button");

const businessForm = document.getElementById("business-form");
const businessList = document.getElementById("business-list");
const businessSearch = document.getElementById("business-search");
const businessCount = document.getElementById("business-count");

const modalTitle = document.getElementById("modal-title");
const formMessage = document.getElementById("form-message");
const saveBusinessButton = document.getElementById("save-business-button");

const businessIdInput = document.getElementById("business-id");

const itemsContainer = document.getElementById("items-container");
const itemTemplate = document.getElementById("item-template");
const addItemButton = document.getElementById("add-item-button");

const hiringCheckbox = document.getElementById("business-hiring");
const jobSection = document.getElementById("job-section");

let businesses = [];
let editingBusiness = false;

function getValue(id) {
    return document.getElementById(id).value.trim();
}

function setValue(id, value) {
    document.getElementById(id).value = value ?? "";
}

function showMessage(message, type = "error") {
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
}

function clearMessage() {
    formMessage.textContent = "";
    formMessage.className = "form-message";
}

async function apiRequest(url, options = {}) {
    const response = await fetch(url, options);

    let result;

    try {
        result = await response.json();
    } catch {
        throw new Error("The server returned an invalid response. Check your PHP API.");
    }

    if (!response.ok || !result.success) {
        throw new Error(result.message || "Something went wrong.");
    }

    return result;
}

async function loadBusinesses() {
    businessList.textContent = "Loading businesses...";

    try {
        const result = await apiRequest(`${API_URL}?action=list`);

        businesses = result.data || [];

        renderBusinesses();
    } catch (error) {
        businessList.textContent = error.message;
        businessCount.textContent = "0 businesses";
    }
}

function renderBusinesses() {
    const searchTerm = businessSearch.value.trim().toLowerCase();

    const filteredBusinesses = businesses.filter(business => {
        const name = (business.business_name || "").toLowerCase();
        const category = (business.category || "").toLowerCase();
        const address = (business.address || "").toLowerCase();

        return (
            name.includes(searchTerm) ||
            category.includes(searchTerm) ||
            address.includes(searchTerm)
        );
    });

    businessList.replaceChildren();

    businessCount.textContent =
        `${businesses.length} ${businesses.length === 1 ? "business" : "businesses"}`;

    if (filteredBusinesses.length === 0) {
        const emptyMessage = document.createElement("p");

        emptyMessage.className = "empty-message";
        emptyMessage.textContent = businesses.length === 0
            ? "No businesses added yet."
            : "No matching businesses found.";

        businessList.appendChild(emptyMessage);
        return;
    }

    filteredBusinesses.forEach(business => {
        const card = document.createElement("div");
        card.className = "business-card";

        const info = document.createElement("div");
        info.className = "business-card-info";

        const name = document.createElement("h3");
        name.textContent = business.business_name || "Unnamed business";

        const category = document.createElement("p");
        category.textContent = business.category || "No category";

        const address = document.createElement("p");
        address.textContent = business.address || "No address provided";

        info.append(name, category, address);

        const actions = document.createElement("div");
        actions.className = "business-card-actions";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.textContent = "Edit";
        editButton.dataset.editId = business.business_id;

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.dataset.deleteId = business.business_id;

        actions.append(editButton, deleteButton);
        card.append(info, actions);

        businessList.appendChild(card);
    });
}

function openModal() {
    businessModal.hidden = false;

    requestAnimationFrame(() => {
        businessModal.classList.add("active");
        modalOverlay.classList.add("active");
    });

    document.body.classList.add("modal-open");
}

function closeModal() {
    businessModal.classList.remove("active");
    modalOverlay.classList.remove("active");
    document.body.classList.remove("modal-open");

    businessModal.hidden = true;
}

function addItem(data = {}) {
    const item = itemTemplate.content.firstElementChild.cloneNode(true);

    item.querySelector(".item-name").value = data.item_name || "";
    item.querySelector(".item-type").value = data.item_type || "product";
    item.querySelector(".item-price").value = data.price ?? "";
    item.querySelector(".item-photo").value = data.image_path || "";
    item.querySelector(".item-description").value = data.description || "";

    item.querySelector(".remove-item-button").addEventListener("click", () => {
        item.remove();
    });

    itemsContainer.appendChild(item);
}

function clearJobFields() {
    setValue("job-title", "");
    setValue("job-description", "");
    setValue("job-requirements", "");
    setValue("job-responsibilities", "");
    setValue("job-qualifications", "");
    setValue("job-time", "");
    setValue("job-location", "");
    setValue("job-salary", "");
    setValue("job-schedule", "");
    setValue("apply-call", "");
    setValue("apply-email", "");
    setValue("apply-visit", "");
    setValue("apply-other", "");

    hiringCheckbox.checked = false;
    jobSection.hidden = true;
}

function clearBusinessForm() {
    businessForm.reset();

    businessIdInput.value = "";

    itemsContainer.replaceChildren();

    clearJobFields();
    clearMessage();

    editingBusiness = false;

    addItem();
}

function createNewBusiness() {
    clearBusinessForm();

    modalTitle.textContent = "Add Business";
    saveBusinessButton.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Business';

    openModal();
}

function formatApplicationProcess(value) {
    const otherInstructions = [];

    (value || "").split(/\r?\n/).forEach(line => {
        const separator = line.indexOf(":");

        if (separator === -1) {
            otherInstructions.push(line);
            return;
        }

        const label = line.slice(0, separator).trim().toLowerCase();
        const content = line.slice(separator + 1).trim();

        if (!content) {
            return;
        }

        if (label === "call") {
            setValue("apply-call", content);
        } else if (
            label === "send your resume to" ||
            label === "email"
        ) {
            setValue("apply-email", content);
        } else if (
            label === "visit the shop" ||
            label === "visit"
        ) {
            setValue("apply-visit", content);
        } else if (label === "other") {
            setValue("apply-other", content);
        } else {
            otherInstructions.push(line);
        }
    });

    if (otherInstructions.length > 0) {
        setValue(
            "apply-other",
            [getValue("apply-other"), ...otherInstructions].filter(Boolean).join("\n")
        );
    }
}

function normalizeCategory(category) {
    const value = (category || "").toLowerCase();

    if (
        value === "product" ||
        value === "products" ||
        value === "food and beverages"
    ) {
        return "product";
    }

    if (value === "service" || value === "services") {
        return "service";
    }

    return "";
}

function fillBusinessForm(business, items, job) {
    setValue("business-id", business.business_id);

    setValue("business-name", business.business_name);
    setValue("business-category", normalizeCategory(business.category));
    setValue("business-about", business.shop_info);

    setValue("business-email", business.contact_email);
    setValue("business-facebook", business.contact_facebook);
    setValue("business-number", business.contact_number);
    setValue("business-website", business.website);

    setValue("business-hours", business.operating_hours);
    setValue("business-open-time", business.open_time);
    setValue("business-close-time", business.close_time);

    setValue("business-address", business.address);
    setValue("business-map", business.map_embed_code);

    setValue("business-profile", business.profile_image);
    setValue("business-cover", business.main_image);
    setValue("business-photo-2", business.sub_image_1);
    setValue("business-photo-3", business.sub_image_2);
    setValue("business-photo-4", business.sub_image_3);
    setValue("business-photo-5", business.sub_image_4);

    itemsContainer.replaceChildren();

    if (Array.isArray(items) && items.length > 0) {
        items.forEach(item => addItem(item));
    } else {
        addItem();
    }

    clearJobFields();

    if (job && job.job_id) {
        hiringCheckbox.checked = true;
        jobSection.hidden = false;

        setValue("job-title", job.job_title);
        setValue("job-description", job.job_description);
        setValue("job-requirements", job.requirements);
        setValue("job-responsibilities", job.responsibilities);
        setValue("job-qualifications", job.qualifications);
        setValue("job-time", job.employment_type);
        setValue("job-location", job.location);
        setValue("job-salary", job.salary);
        setValue("job-schedule", job.schedule);

        formatApplicationProcess(job.how_to_apply);
    }
}

async function editBusiness(id) {
    clearMessage();

    try {
        const result = await apiRequest(
            `${API_URL}?action=get&id=${encodeURIComponent(id)}`
        );

        const data = result.data;

        if (!data || !data.business_id) {
            throw new Error("Business information could not be found.");
        }

        clearBusinessForm();

        fillBusinessForm(
            data,
            data.items || [],
            data.job || null
        );

        editingBusiness = true;

        modalTitle.textContent = "Edit Business";
        saveBusinessButton.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Update Business';

        openModal();

    } catch (error) {
        alert(error.message);
    }
}

function collectItems() {
    const itemCards = itemsContainer.querySelectorAll(".item-card");

    return Array.from(itemCards)
        .map(card => ({
            item_name: card.querySelector(".item-name").value.trim(),
            item_type: card.querySelector(".item-type").value,
            price: card.querySelector(".item-price").value.trim(),
            image_path: card.querySelector(".item-photo").value.trim(),
            description: card.querySelector(".item-description").value.trim()
        }))
        .filter(item => item.item_name !== "");
}

function collectApplicationProcess() {
    const instructions = [
        {
            label: "Call",
            value: getValue("apply-call")
        },
        {
            label: "Send your resume to",
            value: getValue("apply-email")
        },
        {
            label: "Visit the shop",
            value: getValue("apply-visit")
        },
        {
            label: "Other",
            value: getValue("apply-other")
        }
    ];

    return instructions
        .filter(instruction => instruction.value)
        .map(instruction => `${instruction.label}: ${instruction.value}`)
        .join("\n");
}

function collectBusinessData() {
    return {
        business_name: getValue("business-name"),
        category: getValue("business-category"),
        shop_info: getValue("business-about"),

        contact_email: getValue("business-email"),
        contact_facebook: getValue("business-facebook"),
        contact_number: getValue("business-number"),
        website: getValue("business-website"),

        operating_hours: getValue("business-hours"),
        open_time: getValue("business-open-time"),
        close_time: getValue("business-close-time"),

        address: getValue("business-address"),
        map_embed_code: getValue("business-map"),

        profile_image: getValue("business-profile"),
        main_image: getValue("business-cover"),
        sub_image_1: getValue("business-photo-2"),
        sub_image_2: getValue("business-photo-3"),
        sub_image_3: getValue("business-photo-4"),
        sub_image_4: getValue("business-photo-5")
    };
}

function collectJobData() {
    return {
        job_title: getValue("job-title"),
        job_description: getValue("job-description"),
        requirements: getValue("job-requirements"),
        responsibilities: getValue("job-responsibilities"),
        qualifications: getValue("job-qualifications"),
        employment_type: getValue("job-time"),
        location: getValue("job-location"),
        salary: getValue("job-salary"),
        schedule: getValue("job-schedule"),
        how_to_apply: collectApplicationProcess()
    };
}

async function saveBusiness(event) {
    event.preventDefault();

    clearMessage();

    const business = collectBusinessData();

    if (!business.business_name) {
        showMessage("Please enter the business name.");
        return;
    }

    if (!business.category) {
        showMessage("Please select a business category.");
        return;
    }

    if (!business.shop_info) {
        showMessage("Please enter the business description.");
        return;
    }

    if (!business.address) {
        showMessage("Please enter the business address.");
        return;
    }

    const hiring = hiringCheckbox.checked;
    const job = collectJobData();

    if (hiring && !job.job_title) {
        showMessage("Please enter the job position.");
        return;
    }

    if (hiring && !job.job_description) {
        showMessage("Please enter the job description.");
        return;
    }

    const payload = {
        action: "save",
        business_id: businessIdInput.value || null,
        business,
        items: collectItems(),
        hiring,
        job
    };

    saveBusinessButton.disabled = true;
    saveBusinessButton.textContent = editingBusiness ? "Updating..." : "Saving...";

    try {
        const result = await apiRequest(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        closeModal();

        await loadBusinesses();

        alert(result.message || "Business saved successfully.");

    } catch (error) {
        showMessage(error.message);

    } finally {
        saveBusinessButton.disabled = false;

        saveBusinessButton.innerHTML = editingBusiness
            ? '<i class="fa-solid fa-floppy-disk"></i> Update Business'
            : '<i class="fa-solid fa-floppy-disk"></i> Save Business';
    }
}

async function deleteBusiness(id) {
    const business = businesses.find(
        item => String(item.business_id) === String(id)
    );

    const name = business?.business_name || "this business";

    if (!confirm(`Are you sure you want to delete ${name}? This will also remove its saved items and job information.`)) {
        return;
    }

    try {
        const result = await apiRequest(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                action: "delete",
                business_id: id
            })
        });

        await loadBusinesses();

        alert(result.message || "Business deleted successfully.");

    } catch (error) {
        alert(error.message);
    }
}

addBusinessButton.addEventListener("click", createNewBusiness);

closeModalButton.addEventListener("click", closeModal);
cancelFormButton.addEventListener("click", closeModal);
modalOverlay.addEventListener("click", closeModal);

addItemButton.addEventListener("click", () => addItem());

hiringCheckbox.addEventListener("change", () => {
    jobSection.hidden = !hiringCheckbox.checked;
});

businessForm.addEventListener("submit", saveBusiness);

businessSearch.addEventListener("input", renderBusinesses);

businessList.addEventListener("click", event => {
    const editButton = event.target.closest("[data-edit-id]");
    const deleteButton = event.target.closest("[data-delete-id]");

    if (editButton) {
        editBusiness(editButton.dataset.editId);
    }

    if (deleteButton) {
        deleteBusiness(deleteButton.dataset.deleteId);
    }
});

loadBusinesses();
