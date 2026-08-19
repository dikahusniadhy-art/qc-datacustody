/* =========================================================
   CUSTODY - USER MANAGEMENT
   user.js
========================================================= */

"use strict";


/* =========================================================
   GLOBAL STATE
========================================================= */

const UserPage = {

    data: [],

    filteredData: [],

    currentPage: 1,

    pageSize: 10,

    editMode: false,

    pendingAction: null,

    selectedUserId: null

};


/* =========================================================
   DOM HELPER
========================================================= */

const $ = (selector) => {

    return document.querySelector(selector);

};


const $$ = (selector) => {

    return document.querySelectorAll(selector);

};


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initializeUserPage();

});


function initializeUserPage() {

    bindEvents();

    loadUsers();

}


/* =========================================================
   EVENT BINDING
========================================================= */

function bindEvents() {


    /* ADD USER */

    $("#btnAddUser")?.addEventListener(
        "click",
        () => openAddModal()
    );


    /* CLOSE MODAL */

    $("#btnCloseModal")?.addEventListener(
        "click",
        closeUserModal
    );


    $("#btnCancel")?.addEventListener(
        "click",
        closeUserModal
    );


    /* REFRESH */

    $("#btnRefresh")?.addEventListener(
        "click",
        () => loadUsers()
    );


    /* SEARCH */

    $("#searchUser")?.addEventListener(
        "input",
        handleFilter
    );


    /* ROLE */

    $("#filterRole")?.addEventListener(
        "change",
        handleFilter
    );


    /* STATUS */

    $("#filterStatus")?.addEventListener(
        "change",
        handleFilter
    );


    /* FORM */

    $("#userForm")?.addEventListener(
        "submit",
        handleSubmit
    );


    /* PASSWORD */

    $("#togglePassword")?.addEventListener(
        "click",
        togglePassword
    );


    /* PAGINATION */

    $("#btnPrev")?.addEventListener(
        "click",
        previousPage
    );


    $("#btnNext")?.addEventListener(
        "click",
        nextPage
    );


    /* CONFIRM */

    $("#btnConfirmCancel")?.addEventListener(
        "click",
        closeConfirmModal
    );


    $("#btnConfirm")?.addEventListener(
        "click",
        executePendingAction
    );


    /* TOAST */

    $("#toastClose")?.addEventListener(
        "click",
        hideToast
    );


    /* CLOSE MODAL CLICK OUTSIDE */

    $("#userModal")?.addEventListener(
        "click",
        function (event) {

            if (event.target === this) {

                closeUserModal();

            }

        }
    );


    $("#confirmModal")?.addEventListener(
        "click",
        function (event) {

            if (event.target === this) {

                closeConfirmModal();

            }

        }
    );


    /* ESC */

    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Escape") {

                closeUserModal();

                closeConfirmModal();

            }

        }
    );

}


/* =========================================================
   LOAD USERS
========================================================= */

async function loadUsers() {

    showLoading();

    try {

        console.log(
            "USER PAGE: Memanggil API.getUser()..."
        );


        /*
         * ==================================================
         * CALL API
         * ==================================================
         */

        const response =
            await API.getUser();


        console.log(
            "USER PAGE: Response getUser:",
            response
        );


        /*
         * ==================================================
         * VALIDATE RESPONSE
         * ==================================================
         */

        if (!response) {

            throw new Error(
                "Response API kosong."
            );

        }


        if (
            response.success !== true
        ) {

            throw new Error(
                response.message ||
                "Gagal mengambil data user."
            );

        }


        /*
         * ==================================================
         * DATA
         * ==================================================
         */

        const data =
            Array.isArray(
                response.data
            )
                ? response.data
                : [];


        console.log(
            "USER PAGE: Jumlah user:",
            data.length
        );


        /*
         * ==================================================
         * NORMALIZE
         * ==================================================
         */

        UserPage.data =
            normalizeUserData(
                data
            );


        UserPage.filteredData =
            [
                ...UserPage.data
            ];


        UserPage.currentPage =
            1;


        /*
         * ==================================================
         * UPDATE UI
         * ==================================================
         */

        updateKPI();

        renderTable();


        /*
         * ==================================================
         * SUCCESS
         * ==================================================
         */

        console.log(
            "USER PAGE: Data berhasil ditampilkan."
        );

    }


    catch (error) {

        console.error(
            "USER PAGE: loadUsers ERROR:",
            error
        );


        UserPage.data =
            [];

        UserPage.filteredData =
            [];


        updateKPI();


        const tbody =
            $("#userTableBody");


        if (tbody) {

            tbody.innerHTML = `

                <tr>

                    <td
                        colspan="8"
                        style="
                            text-align:center;
                            padding:40px;
                            color:#EF4444;
                        "
                    >

                        <strong>
                            Gagal memuat data user
                        </strong>

                        <br>

                        <small>
                            ${escapeHTML(
                error.message ||
                "Unknown error"
            )}
                        </small>

                    </td>

                </tr>

            `;

        }


        const empty =
            $("#emptyState");


        if (empty) {

            empty.style.display =
                "none";

        }


        showToast(
            "error",
            "Gagal",
            error.message ||
            "Data user gagal dimuat."
        );

    }

}


/* =========================================================
   GOOGLE SCRIPT WRAPPER
========================================================= */

function callGoogleScript(functionName, ...args) {

    return new Promise(
        (resolve, reject) => {

            google.script.run

                .withSuccessHandler(
                    resolve
                )

                .withFailureHandler(
                    reject
                )

            [functionName](...args);

        }
    );

}


/* =========================================================
   NORMALIZE DATA
========================================================= */

function normalizeUserData(data) {

    if (!Array.isArray(data)) {

        return [];

    }


    return data.map(
        (row, index) => {

            return {

                id:
                    row.id ??
                    index + 1,

                username:
                    row.username ??
                    "",

                nama:
                    row.nama ??
                    "",

                email:
                    row.email ??
                    "",

                role:
                    row.role ??
                    "USER",

                status:
                    row.status ??
                    "AKTIF",

                timestamp:
                    row.timestamp ??
                    ""

            };

        }
    );

}


/* =========================================================
   KPI
========================================================= */

function updateKPI() {

    const total =
        UserPage.data.length;


    const active =
        UserPage.data.filter(
            user =>
                normalizeStatus(user.status) ===
                "AKTIF"
        ).length;


    const inactive =
        UserPage.data.filter(
            user =>
                normalizeStatus(user.status) ===
                "NONAKTIF"
        ).length;


    const admin =
        UserPage.data.filter(
            user =>
                normalizeRole(user.role) ===
                "ADMIN"
        ).length;


    setText(
        "#totalUser",
        total
    );

    setText(
        "#activeUser",
        active
    );

    setText(
        "#inactiveUser",
        inactive
    );

    setText(
        "#adminUser",
        admin
    );

}


/* =========================================================
   FILTER
========================================================= */

function handleFilter() {

    const keyword =
        (
            $("#searchUser")?.value ||
            ""
        )
            .trim()
            .toLowerCase();


    const role =
        (
            $("#filterRole")?.value ||
            ""
        )
            .toUpperCase();


    const status =
        (
            $("#filterStatus")?.value ||
            ""
        )
            .toUpperCase();


    UserPage.filteredData =
        UserPage.data.filter(
            user => {


                /*
                 * SEARCH
                 */

                const searchText = [

                    user.username,

                    user.nama,

                    user.email

                ]
                    .join(" ")
                    .toLowerCase();


                const matchKeyword =
                    !keyword ||
                    searchText.includes(
                        keyword
                    );


                /*
                 * ROLE
                 */

                const matchRole =
                    !role ||
                    normalizeRole(
                        user.role
                    ) === role;


                /*
                 * STATUS
                 */

                const matchStatus =
                    !status ||
                    normalizeStatus(
                        user.status
                    ) === status;


                return (

                    matchKeyword &&
                    matchRole &&
                    matchStatus

                );

            }
        );


    UserPage.currentPage = 1;

    renderTable();

}


/* =========================================================
   RENDER TABLE
========================================================= */

function renderTable() {

    const tbody =
        $("#userTableBody");


    const emptyState =
        $("#emptyState");


    if (!tbody) {

        return;

    }


    const total =
        UserPage.filteredData.length;


    if (total === 0) {

        tbody.innerHTML = "";

        if (emptyState) {

            emptyState.style.display =
                "block";

        }

        updatePagination();

        return;

    }


    if (emptyState) {

        emptyState.style.display =
            "none";

    }


    const start =
        (
            UserPage.currentPage - 1
        ) *
        UserPage.pageSize;


    const end =
        Math.min(
            start +
            UserPage.pageSize,
            total
        );


    const pageData =
        UserPage.filteredData.slice(
            start,
            end
        );


    tbody.innerHTML =
        pageData
            .map(
                (user, index) =>
                    createUserRow(
                        user,
                        start + index + 1
                    )
            )
            .join("");


    updatePagination();

}


/* =========================================================
   CREATE TABLE ROW
========================================================= */

function createUserRow(
    user,
    number
) {

    const role =
        normalizeRole(
            user.role
        );


    const status =
        normalizeStatus(
            user.status
        );


    const initials =
        getInitials(
            user.nama ||
            user.username
        );


    const timestamp =
        formatTimestamp(
            user.timestamp
        );


    const roleClass =
        getRoleClass(role);


    const statusClass =
        status === "AKTIF"
            ? "badge-active"
            : "badge-inactive";


    const toggleIcon =
        status === "AKTIF"
            ? "⏸"
            : "▶";


    const toggleTitle =
        status === "AKTIF"
            ? "Nonaktifkan"
            : "Aktifkan";


    return `

        <tr>

            <td class="col-number">
                ${number}
            </td>


            <td>

                <div class="username-cell">

                    <div class="user-avatar">
                        ${escapeHTML(initials)}
                    </div>

                    <div>

                        <div class="username">
                            ${escapeHTML(
        user.username
    )}
                        </div>

                    </div>

                </div>

            </td>


            <td>

                <div class="user-name">
                    ${escapeHTML(
        user.nama
    )}
                </div>

            </td>


            <td>

                <span class="email">
                    ${escapeHTML(
        user.email
    )}
                </span>

            </td>


            <td>

                <span
                    class="badge ${roleClass}">

                    ${escapeHTML(role)}

                </span>

            </td>


            <td>

                <span
                    class="badge ${statusClass}">

                    ${escapeHTML(status)}

                </span>

            </td>


            <td>

                <span class="email">

                    ${escapeHTML(timestamp)}

                </span>

            </td>


            <td class="col-action">

                <div class="action-buttons">


                    <button
                        type="button"
                        class="action-btn action-edit"
                        title="Edit User"
                        onclick="editUser('${escapeAttribute(user.id)}')">

                        ✎

                    </button>


                    <button
                        type="button"
                        class="action-btn action-toggle"
                        title="${toggleTitle}"
                        onclick="toggleUserStatus('${escapeAttribute(user.id)}')">

                        ${toggleIcon}

                    </button>


                    <button
                        type="button"
                        class="action-btn action-delete"
                        title="Hapus User"
                        onclick="deleteUser('${escapeAttribute(user.id)}')">

                        🗑

                    </button>

                </div>

            </td>

        </tr>

    `;

}


/* =========================================================
   ADD USER
========================================================= */

function openAddModal() {

    UserPage.editMode = false;

    $("#modalTitle").textContent =
        "Tambah User";


    $("#saveButtonText").textContent =
        "Simpan User";


    $("#userForm").reset();


    $("#userId").value = "";


    $("#status").value =
        "AKTIF";


    $("#password").required =
        true;


    $("#passwordHint").textContent =
        "Minimal 8 karakter";


    $("#userModal").classList.add(
        "show"
    );


    setTimeout(
        () => {
            $("#username")?.focus();
        },
        100
    );

}


/* =========================================================
   EDIT USER
========================================================= */

function editUser(id) {

    const user =
        findUser(id);


    if (!user) {

        showToast(
            "error",
            "Error",
            "Data user tidak ditemukan."
        );

        return;

    }


    UserPage.editMode = true;


    $("#modalTitle").textContent =
        "Edit User";


    $("#saveButtonText").textContent =
        "Update User";


    $("#userId").value =
        user.id;


    $("#username").value =
        user.username;


    $("#nama").value =
        user.nama;


    $("#email").value =
        user.email;


    $("#role").value =
        normalizeRole(
            user.role
        );


    $("#status").value =
        normalizeStatus(
            user.status
        );


    /*
     * Password tidak ditampilkan
     * ketika edit.
     */

    $("#password").value = "";

    $("#password").required =
        false;


    $("#passwordHint").textContent =
        "Kosongkan jika password tidak ingin diubah";


    $("#userModal").classList.add(
        "show"
    );

}


/* =========================================================
   CLOSE USER MODAL
========================================================= */

function closeUserModal() {

    $("#userModal")?.classList.remove(
        "show"
    );

    $("#userForm")?.reset();

    UserPage.editMode = false;

}

/* =========================================================
   SUBMIT
========================================================= */
async function handleSubmit(event) {

    event.preventDefault();

    const username =
        $("#username").value.trim();

    const password =
        $("#password").value;

    const nama =
        $("#nama").value.trim();

    const email =
        $("#email").value.trim();

    const role =
        $("#role").value;

    const status =
        $("#status").value;

    /*
     * VALIDATION
     */

    if (!username) {

        showToast(
            "warning",
            "Validasi",
            "Username wajib diisi."
        );

        return;
    }

    /*
     * CREATE:
     * Password wajib minimal 8 karakter.
     *
     * EDIT:
     * Password boleh kosong,
     * artinya password tidak diubah.
     */
    if (
        !UserPage.editMode &&
        password.length < 8
    ) {

        showToast(
            "warning",
            "Validasi",
            "Password minimal 8 karakter."
        );

        return;
    }

    if (!nama) {

        showToast(
            "warning",
            "Validasi",
            "Nama wajib diisi."
        );

        return;
    }

    if (!email) {

        showToast(
            "warning",
            "Validasi",
            "Email wajib diisi."
        );

        return;
    }

    if (!role) {

        showToast(
            "warning",
            "Validasi",
            "Role wajib dipilih."
        );

        return;
    }

    /*
     * ID WAJIB ADA SAAT EDIT
     */
    const userId =
        $("#userId").value.trim();

    if (
        UserPage.editMode &&
        !userId
    ) {

        showToast(
            "error",
            "Error",
            "ID user tidak ditemukan. Silakan buka Edit User kembali."
        );

        return;
    }

    const userData = {

        id:
            userId,

        username:
            username,

        password:
            password,

        nama:
            nama,

        email:
            email,

        role:
            role,

        status:
            status
    };

    console.log(
        "USER PAGE: Submit User:",
        userData
    );

    setSaveLoading(true);

    try {

        let result;

        /*
         * ========================================================
         * EDIT USER
         * ========================================================
         */
        if (
            UserPage.editMode
        ) {

            console.log(
                "USER PAGE: Update User:",
                userData
            );

            result =
                await updateUserAPI(
                    userData
                );

            /*
             * Karena API menggunakan no-cors,
             * result.success hanya berarti request
             * berhasil dikirim.
             */
            if (
                !result ||
                result.success !== true
            ) {

                throw new Error(
                    result?.message ||
                    "Request update user gagal dikirim."
                );
            }

            /*
             * ====================================================
             * VERIFIKASI DATA SETELAH UPDATE
             * ====================================================
             */
            await loadUsers();

            const updatedUser =
                findUser(
                    userId
                );

            if (
                !updatedUser
            ) {

                throw new Error(
                    "User tidak ditemukan setelah proses update."
                );
            }

            /*
             * Cocokkan hasil dengan input form.
             */
            const usernameOK =
                String(
                    updatedUser.username || ""
                ).trim()
                ===
                username;

            const namaOK =
                String(
                    updatedUser.nama || ""
                ).trim()
                ===
                nama;

            const emailOK =
                String(
                    updatedUser.email || ""
                ).trim()
                ===
                email;

            const roleOK =
                String(
                    updatedUser.role || ""
                ).trim()
                    .toUpperCase()
                ===
                String(
                    role || ""
                ).trim()
                    .toUpperCase();

            const statusOK =
                String(
                    updatedUser.status || ""
                ).trim()
                    .toUpperCase()
                ===
                String(
                    status || ""
                ).trim()
                    .toUpperCase();

            /*
             * Jika salah satu tidak cocok,
             * update dianggap gagal.
             */
            if (
                !usernameOK ||
                !namaOK ||
                !emailOK ||
                !roleOK ||
                !statusOK
            ) {

                console.error(
                    "USER PAGE: Verifikasi update gagal.",
                    {
                        expected: {
                            id:
                                userId,

                            username:
                                username,

                            nama:
                                nama,

                            email:
                                email,

                            role:
                                role,

                            status:
                                status
                        },

                        actual:
                            updatedUser
                    }
                );

                throw new Error(
                    "Data user belum berubah di Spreadsheet."
                );
            }

            /*
             * SUCCESS
             */
            closeUserModal();

            showToast(
                "success",
                "Berhasil",
                "Data user berhasil diperbarui."
            );

            return;
        }

        /*
         * ========================================================
         * CREATE USER
         * ========================================================
         */
        result =
            await createUserAPI(
                userData
            );

        if (
            !result ||
            result.success !== true
        ) {

            throw new Error(
                result?.message ||
                "Request tambah user gagal dikirim."
            );
        }

        /*
         * Refresh data
         */
        await loadUsers();

        /*
         * Verifikasi user benar-benar masuk.
         */
        const createdUser =
            findUser(
                userData.username
            );

        if (
            !createdUser
        ) {

            throw new Error(
                "User belum ditemukan di Spreadsheet setelah proses tambah."
            );
        }

        closeUserModal();

        showToast(
            "success",
            "Berhasil",
            "User baru berhasil ditambahkan."
        );

    }
    catch (error) {

        console.error(
            "handleSubmit:",
            error
        );

        showToast(
            "error",
            "Gagal",
            error.message ||
            "Data user gagal disimpan."
        );

    }
    finally {

        setSaveLoading(
            false
        );
    }
}

/* =========================================================
   CREATE API
========================================================= */

async function createUserAPI(
    userData
) {

    if (
        typeof API ===
        "undefined"
    ) {

        throw new Error(
            "API tidak tersedia."
        );

    }


    if (
        typeof API.createUser !==
        "function"
    ) {

        throw new Error(
            "API.createUser tidak tersedia."
        );

    }


    return await API.createUser(
        userData
    );

}


/* =========================================================
   UPDATE API
========================================================= */
async function updateUserAPI(userData) {

    if (
        typeof API === "undefined" ||
        typeof API.updateUser !== "function"
    ) {

        throw new Error(
            "API.updateUser tidak tersedia."
        );
    }

    return await API.updateUser(
        userData
    );
}


/* =========================================================
   TOGGLE STATUS
========================================================= */

function toggleUserStatus(id) {

    const user =
        findUser(id);


    if (!user) {

        return;

    }


    const currentStatus =
        normalizeStatus(
            user.status
        );


    const newStatus =
        currentStatus === "AKTIF"
            ? "NONAKTIF"
            : "AKTIF";


    UserPage.pendingAction =
        async function () {

            await changeUserStatus(
                id,
                newStatus
            );

        };


    const actionText =
        newStatus === "AKTIF"
            ? "mengaktifkan"
            : "menonaktifkan";


    $("#confirmMessage").textContent =
        `Apakah Anda yakin ingin ${actionText} user "${user.username}"?`;


    $("#confirmModal").classList.add(
        "show"
    );

}

/* =========================================================
   CHANGE STATUS
========================================================= */

async function changeUserStatus(
    id,
    status
) {

    try {

        console.log(
            "USER PAGE: Update status user:",
            {
                id,
                status
            }
        );


        /*
         * =====================================================
         * PAYLOAD
         * =====================================================
         */
        const payload = {

            id:
                id,

            status:
                status

        };


        /*
         * =====================================================
         * PASTIKAN API TERSEDIA
         * =====================================================
         */
        if (
            typeof API === "undefined"
        ) {

            throw new Error(
                "API tidak tersedia."
            );

        }


        if (
            typeof API.updateUserStatus !==
            "function"
        ) {

            throw new Error(
                "API.updateUserStatus tidak tersedia."
            );

        }


        /*
         * =====================================================
         * KIRIM KE API
         * =====================================================
         */
        const result =
            await API.updateUserStatus(
                payload
            );


        console.log(
            "USER PAGE: Response update status:",
            result
        );


        /*
         * API no-cors:
         * success = request berhasil dikirim.
         */
        if (
            !result ||
            result.success !== true
        ) {

            throw new Error(
                result?.message ||
                "Request perubahan status gagal dikirim."
            );

        }


        /*
         * =====================================================
         * UPDATE UI LOKAL SEGERA
         * =====================================================
         */
        const user =
            findUser(
                id
            );


        if (
            user
        ) {

            user.status =
                status;

        }


        /*
         * Update filtered data juga.
         */
        const filteredUser =
            UserPage.filteredData.find(
                item =>
                    String(item.id) ===
                    String(id)
            );


        if (
            filteredUser
        ) {

            filteredUser.status =
                status;

        }


        /*
         * Refresh UI.
         */
        updateKPI();

        renderTable();


        /*
         * =====================================================
         * CLOSE CONFIRMATION
         * =====================================================
         */
        closeConfirmModal();


        /*
         * =====================================================
         * SUCCESS
         * =====================================================
         */
        showToast(
            "success",
            "Berhasil",
            `Status user berhasil diubah menjadi ${status}.`
        );


        /*
         * =====================================================
         * SINKRONISASI DENGAN SERVER
         * =====================================================
         */
        setTimeout(
            async () => {

                try {

                    await loadUsers();

                }
                catch (err) {

                    console.error(
                        "Refresh status user gagal:",
                        err
                    );

                }

            },
            700
        );

    }
    catch (error) {

        console.error(
            "changeUserStatus:",
            error
        );


        closeConfirmModal();


        showToast(
            "error",
            "Gagal",
            error.message ||
            "Status user gagal diubah."
        );

    }

}

/* =========================================================
   DELETE USER
========================================================= */

function deleteUser(id) {

    const user =
        findUser(id);


    if (!user) {

        return;

    }


    UserPage.pendingAction =
        async function () {

            await executeDeleteUser(
                id
            );

        };


    $("#confirmMessage").textContent =
        `Apakah Anda yakin ingin menghapus user "${user.username}"? Data yang dihapus tidak dapat dikembalikan.`;


    $("#confirmModal").classList.add(
        "show"
    );

}


/* =========================================================
   EXECUTE DELETE
========================================================= */

async function executeDeleteUser(id) {

    try {

        /*
         * =====================================================
         * DELETE LANGSUNG KE API
         * =====================================================
         */
        const result =
            await API.deleteUser(
                id
            );


        /*
         * API menggunakan no-cors.
         * Jadi success di sini berarti request
         * berhasil dikirim ke server.
         */
        if (
            !result ||
            result.success !== true
        ) {

            throw new Error(
                result?.message ||
                "Request hapus user gagal dikirim."
            );

        }


        /*
         * =====================================================
         * HAPUS DARI STATE UI LANGSUNG
         * =====================================================
         */
        UserPage.data =
            UserPage.data.filter(
                user =>
                    String(user.id) !==
                    String(id)
            );


        UserPage.filteredData =
            UserPage.filteredData.filter(
                user =>
                    String(user.id) !==
                    String(id)
            );


        /*
         * =====================================================
         * PASTIKAN PAGINATION VALID
         * =====================================================
         */
        const totalPages =
            getTotalPages();


        if (
            UserPage.currentPage >
            totalPages
        ) {

            UserPage.currentPage =
                totalPages;

        }


        /*
         * =====================================================
         * UPDATE UI
         * =====================================================
         */
        updateKPI();

        renderTable();


        /*
         * =====================================================
         * TUTUP KONFIRMASI
         * =====================================================
         */
        closeConfirmModal();


        /*
         * =====================================================
         * NOTIFIKASI
         * =====================================================
         */
        showToast(
            "success",
            "Berhasil",
            "User berhasil dihapus."
        );


        /*
         * =====================================================
         * SINKRONISASI ULANG DENGAN SERVER
         * =====================================================
         *
         * Tunggu sebentar agar Apps Script selesai
         * menulis ke Spreadsheet.
         */
        setTimeout(
            async () => {

                try {

                    await loadUsers();

                }
                catch (err) {

                    console.error(
                        "Refresh setelah delete gagal:",
                        err
                    );

                }

            },
            700
        );

    }
    catch (error) {

        console.error(
            "executeDeleteUser:",
            error
        );


        closeConfirmModal();


        showToast(
            "error",
            "Gagal",
            error.message ||
            "User gagal dihapus."
        );

    }

}

/* =========================================================
   CONFIRM ACTION
========================================================= */

async function executePendingAction() {

    if (
        typeof UserPage.pendingAction !==
        "function"
    ) {

        closeConfirmModal();

        return;

    }


    const action =
        UserPage.pendingAction;


    UserPage.pendingAction =
        null;


    try {

        await action();

    }

    catch (error) {

        console.error(
            error
        );

    }

}


/* =========================================================
   CLOSE CONFIRM
========================================================= */

function closeConfirmModal() {

    $("#confirmModal")?.classList.remove(
        "show"
    );

    UserPage.pendingAction =
        null;

}


/* =========================================================
   PASSWORD TOGGLE
========================================================= */

function togglePassword() {

    const input =
        $("#password");


    const button =
        $("#togglePassword");


    if (
        !input ||
        !button
    ) {

        return;

    }


    if (
        input.type ===
        "password"
    ) {

        input.type =
            "text";

        button.textContent =
            "🙈";

    }

    else {

        input.type =
            "password";

        button.textContent =
            "👁";

    }

}


/* =========================================================
   PAGINATION
========================================================= */

function previousPage() {

    if (
        UserPage.currentPage >
        1
    ) {

        UserPage.currentPage--;

        renderTable();

    }

}


function nextPage() {

    const totalPages =
        getTotalPages();


    if (
        UserPage.currentPage <
        totalPages
    ) {

        UserPage.currentPage++;

        renderTable();

    }

}


function getTotalPages() {

    return Math.max(
        1,
        Math.ceil(
            UserPage.filteredData.length /
            UserPage.pageSize
        )
    );

}


function updatePagination() {

    const total =
        UserPage.filteredData.length;


    const totalPages =
        getTotalPages();


    const current =
        UserPage.currentPage;


    const start =
        total === 0
            ? 0
            : (
                (current - 1) *
                UserPage.pageSize
            ) + 1;


    const end =
        Math.min(
            current *
            UserPage.pageSize,
            total
        );


    setText(
        "#showingFrom",
        start
    );


    setText(
        "#showingTo",
        end
    );


    setText(
        "#showingTotal",
        total
    );


    setText(
        "#pageInfo",
        `${current} / ${totalPages}`
    );


    const prev =
        $("#btnPrev");


    const next =
        $("#btnNext");


    if (prev) {

        prev.disabled =
            current <= 1;

    }


    if (next) {

        next.disabled =
            current >= totalPages;

    }

}


/* =========================================================
   FIND USER
========================================================= */

function findUser(id) {

    return UserPage.data.find(
        user =>
            String(user.id) ===
            String(id)
    );

}


/* =========================================================
   ROLE
========================================================= */

function normalizeRole(role) {

    return String(
        role ||
        "USER"
    )
        .trim()
        .toUpperCase();

}


function getRoleClass(role) {

    switch (
    normalizeRole(role)
    ) {

        case "ADMIN":
            return "badge-role-admin";
        case "CHECKER":
            return "badge-role-checker";
        case "VIEWER":
            return "badge-role-viewer";
        case "MAKER":
            return "badge-role-maker";

        // default:
        //     return "badge-role-user";
        // case "SUPERVISOR":
        //     return "badge-role-supervisor";
    }
}


/* =========================================================
   STATUS
========================================================= */

function normalizeStatus(status) {

    const value =
        String(
            status ||
            "AKTIF"
        )
            .trim()
            .toUpperCase();


    if (
        value === "ACTIVE" ||
        value === "AKTIF" ||
        value === "1"
    ) {

        return "AKTIF";

    }


    return "NONAKTIF";

}


/* =========================================================
   INITIALS
========================================================= */

function getInitials(name) {

    if (!name) {

        return "U";

    }


    const words =
        String(name)
            .trim()
            .split(/\s+/);


    if (words.length === 1) {

        return words[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        words[0][0] +
        words[words.length - 1][0]
    ).toUpperCase();

}


/* =========================================================
   TIMESTAMP
========================================================= */

function formatTimestamp(value) {

    if (!value) {

        return "-";

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(value);

    }


    return new Intl.DateTimeFormat(
        "id-ID",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    ).format(date);

}


/* =========================================================
   SAVE LOADING
========================================================= */

function setSaveLoading(
    loading
) {

    const button =
        $("#btnSaveUser");


    const text =
        $("#saveButtonText");


    if (!button) {

        return;

    }


    button.disabled =
        loading;


    if (loading) {

        text.textContent =
            "Menyimpan...";

    }

    else {

        text.textContent =
            UserPage.editMode
                ? "Update User"
                : "Simpan User";

    }

}


/* =========================================================
   LOADING TABLE
========================================================= */

function showLoading() {

    const tbody =
        $("#userTableBody");


    const empty =
        $("#emptyState");


    if (empty) {

        empty.style.display =
            "none";

    }


    if (tbody) {

        tbody.innerHTML = `

            <tr class="loading-row">

                <td colspan="8">

                    <div class="loading-container">

                        <div class="spinner"></div>

                        <span>
                            Memuat data user...
                        </span>

                    </div>

                </td>

            </tr>

        `;

    }

}


/* =========================================================
   TOAST
========================================================= */

function showToast(
    type,
    title,
    message
) {

    const toast =
        $("#toast");


    const icon =
        $("#toastIcon");


    const titleElement =
        $("#toastTitle");


    const messageElement =
        $("#toastMessage");


    if (!toast) {

        return;

    }


    titleElement.textContent =
        title;


    messageElement.textContent =
        message;


    if (
        type === "error"
    ) {

        icon.textContent =
            "×";

        icon.style.background =
            "var(--danger-light)";

        icon.style.color =
            "var(--danger)";

    }

    else if (
        type === "warning"
    ) {

        icon.textContent =
            "!";

        icon.style.background =
            "var(--warning-light)";

        icon.style.color =
            "var(--warning)";

    }

    else {

        icon.textContent =
            "✓";

        icon.style.background =
            "var(--success-light)";

        icon.style.color =
            "var(--success)";

    }


    toast.classList.add(
        "show"
    );


    clearTimeout(
        window.userToastTimer
    );


    window.userToastTimer =
        setTimeout(
            hideToast,
            4000
        );

}


function hideToast() {

    $("#toast")?.classList.remove(
        "show"
    );

}


/* =========================================================
   TEXT
========================================================= */

function setText(
    selector,
    value
) {

    const element =
        $(selector);


    if (element) {

        element.textContent =
            value;

    }

}


/* =========================================================
   SECURITY / HTML ESCAPE
========================================================= */

function escapeHTML(value) {

    return String(
        value ??
        ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


function escapeAttribute(value) {

    return String(
        value ??
        ""
    )
        .replace(
            /\\/g,
            "\\\\"
        )
        .replace(
            /'/g,
            "\\'"
        );

}
/* =========================================================
   GLOBAL FUNCTIONS
   Supaya onclick HTML bisa mengakses function
========================================================= */

window.editUser =
    editUser;

window.toggleUserStatus =
    toggleUserStatus;

window.deleteUser =
    deleteUser;


/* =========================================================
   EXPORT
========================================================= */

window.UserPage =
    UserPage;
