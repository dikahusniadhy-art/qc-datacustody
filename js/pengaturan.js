/******************************************************************************
 * PENGATURAN.JS
 * Enterprise Custody Management System
 * Version 1.0.0
 ******************************************************************************/

"use strict";

/* ============================================================================
 * GET MONITORING SETTINGS
 * ========================================================================== */

function getMonitoringSettings() {

    const defaults = {

        expiredThreshold: 30,

        completionTarget: 100,

        autoRefresh: true,

        refreshInterval: 5

    };


    try {

        const raw =
            localStorage.getItem(
                "custody_system_settings"
            );


        if (!raw) {

            return defaults;

        }


        const saved =
            JSON.parse(raw);


        const monitoring =
            saved?.monitoring;


        if (!monitoring) {

            return defaults;

        }


        return {

            expiredThreshold:
                Number(
                    monitoring.expiredThreshold
                ) || 30,

            completionTarget:
                Number(
                    monitoring.completionTarget
                ) || 100,

            autoRefresh:
                monitoring.autoRefresh !== false,

            refreshInterval:
                Number(
                    monitoring.refreshInterval
                ) || 5

        };

    }
    catch (error) {

        console.warn(
            "MONITORING: Gagal membaca monitoring settings:",
            error
        );


        return defaults;

    }

}

/* ============================================================================
 * GLOBAL STATE
 * ========================================================================== */

const Pengaturan = {

    settings: {

        monitoring: {
            expiredThreshold: 30,
            completionTarget: 100,
            autoRefresh: true,
            refreshInterval: 5
        },

        agunan: {
            validateDuplicateAgunan: true,
            validateDuplicateCif: true,
            validateRequiredDocument: true,
            autoFormatData: true
        },

        security: {
            sessionTimeout: 30
        }

    },

    profile: null,

    initialized: false

};


/* ============================================================================
 * STORAGE KEY
 * ========================================================================== */

const SETTINGS_STORAGE_KEY =
    "custody_system_settings";


/* ============================================================================
 * INITIALIZATION
 * ========================================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializePengaturan();

    }
);


/* ============================================================================
 * INITIALIZE
 * ========================================================================== */

async function initializePengaturan() {

    try {

        console.log(
            "PENGATURAN: Initializing..."
        );


        /*
         * ================================================================
         * LOAD SETTINGS
         * ================================================================
         */

        loadSettings();


        /*
         * ================================================================
         * LOAD PROFILE
         * ================================================================
         */

        loadProfile();


        /*
         * ================================================================
         * BIND EVENTS
         * ================================================================
         */

        bindEvents();


        /*
         * ================================================================
         * UPDATE SYSTEM TIME
         * ================================================================
         */

        updateSystemTime();


        /*
         * ================================================================
         * START CLOCK
         * ================================================================
         */

        setInterval(
            updateSystemTime,
            60000
        );


        Pengaturan.initialized =
            true;


        console.log(
            "PENGATURAN: Initialized successfully."
        );

    }
    catch (error) {

        console.error(
            "PENGATURAN INITIALIZATION ERROR:",
            error
        );

    }

}


/* ============================================================================
 * LOAD SETTINGS
 * ========================================================================== */

function loadSettings() {

    try {

        const raw =
            localStorage.getItem(
                SETTINGS_STORAGE_KEY
            );


        if (
            !raw
        ) {

            applySettingsToForm();

            return;

        }


        const saved =
            JSON.parse(
                raw
            );


        /*
         * ================================================================
         * MERGE SETTINGS
         * ================================================================
         */

        Pengaturan.settings =
            mergeSettings(
                Pengaturan.settings,
                saved
            );


        applySettingsToForm();


        console.log(
            "PENGATURAN: Settings loaded."
        );

    }
    catch (error) {

        console.error(
            "PENGATURAN: Gagal load settings:",
            error
        );


        applySettingsToForm();

    }

}


/* ============================================================================
 * MERGE SETTINGS
 * ========================================================================== */

function mergeSettings(
    defaults,
    saved
) {

    const result = {
        ...defaults
    };


    Object.keys(
        defaults
    ).forEach(
        function (section) {

            if (
                saved &&
                saved[section] &&
                typeof saved[section] === "object"
            ) {

                result[section] = {

                    ...defaults[section],

                    ...saved[section]

                };

            }

        }
    );


    return result;

}


/* ============================================================================
 * SAVE SETTINGS
 * ========================================================================== */

function saveSettings() {

    try {

        localStorage.setItem(
            SETTINGS_STORAGE_KEY,
            JSON.stringify(
                Pengaturan.settings
            )
        );


        console.log(
            "PENGATURAN: Settings saved."
        );


        return true;

    }
    catch (error) {

        console.error(
            "PENGATURAN: Gagal menyimpan settings:",
            error
        );


        showToast(
            "error",
            "Gagal",
            "Pengaturan tidak dapat disimpan."
        );


        return false;

    }

}


/* ============================================================================
 * APPLY SETTINGS TO FORM
 * ========================================================================== */

function applySettingsToForm() {

    const monitoring =
        Pengaturan.settings.monitoring;


    const agunan =
        Pengaturan.settings.agunan;


    const security =
        Pengaturan.settings.security;


    /*
     * ================================================================
     * MONITORING
     * ================================================================
     */

    setValue(
        "expiredThreshold",
        monitoring.expiredThreshold
    );


    setValue(
        "completionTarget",
        monitoring.completionTarget
    );


    setChecked(
        "autoRefresh",
        monitoring.autoRefresh
    );


    setValue(
        "refreshInterval",
        monitoring.refreshInterval
    );


    /*
     * ================================================================
     * AGUNAN
     * ================================================================
     */

    setChecked(
        "validateDuplicateAgunan",
        agunan.validateDuplicateAgunan
    );


    setChecked(
        "validateDuplicateCif",
        agunan.validateDuplicateCif
    );


    setChecked(
        "validateRequiredDocument",
        agunan.validateRequiredDocument
    );


    setChecked(
        "autoFormatData",
        agunan.autoFormatData
    );


    /*
     * ================================================================
     * SECURITY
     * ================================================================
     */

    setValue(
        "sessionTimeout",
        security.sessionTimeout
    );

}


/* ============================================================================
 * LOAD PROFILE
 * ========================================================================== */

function loadProfile() {

    try {

        let session =
            null;


        /*
         * ================================================================
         * AUTH SESSION
         * ================================================================
         */

        if (
            typeof Auth !== "undefined" &&
            typeof Auth.getSession === "function"
        ) {

            try {

                session =
                    Auth.getSession();

            }
            catch (error) {

                console.warn(
                    "PENGATURAN: Auth.getSession gagal:",
                    error
                );

            }

        }


        /*
         * ================================================================
         * FALLBACK SESSION STORAGE
         * ================================================================
         */

        if (
            !session
        ) {

            try {

                const raw =
                    sessionStorage.getItem(
                        "user"
                    );


                if (
                    raw
                ) {

                    session =
                        JSON.parse(
                            raw
                        );

                }

            }
            catch (error) {

                console.warn(
                    "PENGATURAN: sessionStorage gagal:",
                    error
                );

            }

        }


        if (
            !session
        ) {

            console.warn(
                "PENGATURAN: Session tidak ditemukan."
            );


            setProfilePlaceholder();

            return;

        }


        Pengaturan.profile =
            session;


        renderProfile(
            session
        );


        console.log(
            "PENGATURAN: Profile loaded."
        );

    }
    catch (error) {

        console.error(
            "PENGATURAN: loadProfile ERROR:",
            error
        );


        setProfilePlaceholder();

    }

}


/* ============================================================================
 * RENDER PROFILE
 * ========================================================================== */

function renderProfile(
    profile
) {

    const username =
        profile.username ||
        profile.user ||
        "-";


    const nama =
        profile.nama ||
        profile.name ||
        username ||
        "-";


    const email =
        profile.email ||
        "-";


    const role =
        profile.role ||
        "-";


    const status =
        profile.status ||
        "AKTIF";


    const lastLogin =
        profile.lastLogin ||
        profile.last_login ||
        profile.timestamp ||
        "-";


    setText(
        "profileName",
        nama
    );


    setText(
        "profileUsername",
        username
    );


    setText(
        "profileEmail",
        email
    );


    setText(
        "profileRole",
        String(role).toUpperCase()
    );


    setText(
        "profileStatus",
        String(status).toUpperCase()
    );


    setText(
        "profileLastLogin",
        formatDateTime(
            lastLogin
        )
    );


    /*
     * ================================================================
     * AVATAR INITIAL
     * ================================================================
     */

    const avatar =
        document.getElementById(
            "profileAvatar"
        );


    if (
        avatar
    ) {

        const initial =
            String(nama)
                .trim()
                .charAt(0)
                .toUpperCase();


        if (
            initial
        ) {

            avatar.innerHTML =
                escapeHtml(
                    initial
                );

        }

    }

}


/* ============================================================================
 * PROFILE PLACEHOLDER
 * ========================================================================== */

function setProfilePlaceholder() {

    setText(
        "profileName",
        "-"
    );


    setText(
        "profileUsername",
        "-"
    );


    setText(
        "profileEmail",
        "-"
    );


    setText(
        "profileRole",
        "-"
    );


    setText(
        "profileStatus",
        "-"
    );


    setText(
        "profileLastLogin",
        "-"
    );

}


/* ============================================================================
 * BIND EVENTS
 * ========================================================================== */

function bindEvents() {


    /*
     * ================================================================
     * MONITORING
     * ================================================================
     */

    const btnSaveMonitoring =
        document.getElementById(
            "btnSaveMonitoring"
        );


    if (
        btnSaveMonitoring
    ) {

        btnSaveMonitoring.addEventListener(
            "click",
            saveMonitoringSettings
        );

    }


    /*
     * ================================================================
     * AGUNAN
     * ================================================================
     */

    const btnSaveAgunan =
        document.getElementById(
            "btnSaveAgunan"
        );


    if (
        btnSaveAgunan
    ) {

        btnSaveAgunan.addEventListener(
            "click",
            saveAgunanSettings
        );

    }


    /*
     * ================================================================
     * SECURITY
     * ================================================================
     */

    const btnSaveSecurity =
        document.getElementById(
            "btnSaveSecurity"
        );


    if (
        btnSaveSecurity
    ) {

        btnSaveSecurity.addEventListener(
            "click",
            saveSecuritySettings
        );

    }


    /*
     * ================================================================
     * PROFILE REFRESH
     * ================================================================
     */

    const btnRefreshProfile =
        document.getElementById(
            "btnRefreshProfile"
        );


    if (
        btnRefreshProfile
    ) {

        btnRefreshProfile.addEventListener(
            "click",
            function () {

                loadProfile();


                showToast(
                    "success",
                    "Berhasil",
                    "Profil berhasil diperbarui."
                );

            }
        );

    }


    /*
     * ================================================================
     * CHANGE PASSWORD
     * ================================================================
     */

    const btnChangePassword =
        document.getElementById(
            "btnChangePassword"
        );


    if (
        btnChangePassword
    ) {

        btnChangePassword.addEventListener(
            "click",
            openPasswordModal
        );

    }


    const closePasswordModalButton =
        document.getElementById(
            "closePasswordModal"
        );


    if (
        closePasswordModalButton
    ) {

        closePasswordModalButton.addEventListener(
            "click",
            closePasswordModal
        );

    }


    const cancelPassword =
        document.getElementById(
            "cancelPassword"
        );


    if (
        cancelPassword
    ) {

        cancelPassword.addEventListener(
            "click",
            closePasswordModal
        );

    }


    const changePasswordForm =
        document.getElementById(
            "changePasswordForm"
        );


    if (
        changePasswordForm
    ) {

        changePasswordForm.addEventListener(
            "submit",
            handleChangePassword
        );

    }


    /*
     * ================================================================
     * PASSWORD TOGGLE
     * ================================================================
     */

    document
        .querySelectorAll(
            ".password-toggle"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        togglePassword(
                            button
                        );

                    }
                );

            }
        );


    /*
     * ================================================================
     * ACTIVITY LOG
     * ================================================================
     */

    const btnActivityLog =
        document.getElementById(
            "btnActivityLog"
        );


    if (
        btnActivityLog
    ) {

        btnActivityLog.addEventListener(
            "click",
            openActivityLog
        );

    }


    const closeActivityLog =
        document.getElementById(
            "closeActivityLogModal"
        );


    if (
        closeActivityLog
    ) {

        closeActivityLog.addEventListener(
            "click",
            closeActivityLogModal
        );

    }


    const btnRefreshActivity =
        document.getElementById(
            "btnRefreshActivity"
        );


    if (
        btnRefreshActivity
    ) {

        btnRefreshActivity.addEventListener(
            "click",
            loadActivityLog
        );

    }


    const activitySearch =
        document.getElementById(
            "activitySearch"
        );


    if (
        activitySearch
    ) {

        activitySearch.addEventListener(
            "input",
            filterActivityLog
        );

    }


    /*
     * ================================================================
     * MODAL CLICK OUTSIDE
     * ================================================================
     */

    const passwordModal =
        document.getElementById(
            "changePasswordModal"
        );


    if (
        passwordModal
    ) {

        passwordModal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    passwordModal
                ) {

                    closePasswordModal();

                }

            }
        );

    }


    const activityModal =
        document.getElementById(
            "activityLogModal"
        );


    if (
        activityModal
    ) {

        activityModal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    activityModal
                ) {

                    closeActivityLogModal();

                }

            }
        );

    }

}


/* ============================================================================
 * SAVE MONITORING
 * ========================================================================== */

function saveMonitoringSettings() {

    const expiredThreshold =
        getNumber(
            "expiredThreshold",
            30
        );


    const completionTarget =
        getNumber(
            "completionTarget",
            100
        );


    const refreshInterval =
        getNumber(
            "refreshInterval",
            5
        );


    /*
     * ================================================================
     * VALIDATION
     * ================================================================
     */

    if (
        expiredThreshold < 1 ||
        expiredThreshold > 365
    ) {

        showToast(
            "error",
            "Validasi",
            "Batas expired harus antara 1 sampai 365 hari."
        );

        return;

    }


    if (
        completionTarget < 0 ||
        completionTarget > 100
    ) {

        showToast(
            "error",
            "Validasi",
            "Target kelengkapan harus antara 0 sampai 100%."
        );

        return;

    }


    if (
        refreshInterval < 1 ||
        refreshInterval > 60
    ) {

        showToast(
            "error",
            "Validasi",
            "Interval refresh harus antara 1 sampai 60 menit."
        );

        return;

    }


    Pengaturan.settings.monitoring = {

        expiredThreshold:
            expiredThreshold,

        completionTarget:
            completionTarget,

        autoRefresh:
            getChecked(
                "autoRefresh"
            ),

        refreshInterval:
            refreshInterval

    };


    if (
        saveSettings()
    ) {

        showToast(
            "success",
            "Berhasil",
            "Pengaturan monitoring berhasil disimpan."
        );

    }

}


/* ============================================================================
 * SAVE AGUNAN
 * ========================================================================== */

function saveAgunanSettings() {

    Pengaturan.settings.agunan = {

        validateDuplicateAgunan:
            getChecked(
                "validateDuplicateAgunan"
            ),

        validateDuplicateCif:
            getChecked(
                "validateDuplicateCif"
            ),

        validateRequiredDocument:
            getChecked(
                "validateRequiredDocument"
            ),

        autoFormatData:
            getChecked(
                "autoFormatData"
            )

    };


    if (
        saveSettings()
    ) {

        showToast(
            "success",
            "Berhasil",
            "Konfigurasi agunan berhasil disimpan."
        );

    }

}


/* ============================================================================
 * SAVE SECURITY
 * ========================================================================== */

function saveSecuritySettings() {

    const sessionTimeout =
        getNumber(
            "sessionTimeout",
            30
        );


    if (
        sessionTimeout < 5 ||
        sessionTimeout > 480
    ) {

        showToast(
            "error",
            "Validasi",
            "Session timeout harus antara 5 sampai 480 menit."
        );

        return;

    }


    Pengaturan.settings.security = {

        sessionTimeout:
            sessionTimeout

    };


    if (
        saveSettings()
    ) {

        showToast(
            "success",
            "Berhasil",
            "Pengaturan security berhasil disimpan."
        );

    }

}


/* ============================================================================
 * CHANGE PASSWORD
 * ========================================================================== */

function openPasswordModal() {

    const modal =
        document.getElementById(
            "changePasswordModal"
        );


    if (
        !modal
    ) {

        return;

    }


    const form =
        document.getElementById(
            "changePasswordForm"
        );


    if (
        form
    ) {

        form.reset();

    }


    hidePasswordMessage();


    modal.hidden =
        false;


    setTimeout(
        function () {

            const input =
                document.getElementById(
                    "currentPassword"
                );


            if (
                input
            ) {

                input.focus();

            }

        },
        50
    );

}


function closePasswordModal() {

    const modal =
        document.getElementById(
            "changePasswordModal"
        );


    if (
        modal
    ) {

        modal.hidden =
            true;

    }


    hidePasswordMessage();

}


/* ============================================================================
 * HANDLE CHANGE PASSWORD
 * ========================================================================== */

async function handleChangePassword(
    event
) {

    event.preventDefault();


    const currentPassword =
        getValue(
            "currentPassword"
        );


    const newPassword =
        getValue(
            "newPassword"
        );


    const confirmPassword =
        getValue(
            "confirmPassword"
        );


    /*
     * ================================================================
     * VALIDATION
     * ================================================================
     */

    if (
        !currentPassword
    ) {

        showPasswordMessage(
            "error",
            "Password saat ini wajib diisi."
        );

        return;

    }


    if (
        newPassword.length < 8
    ) {

        showPasswordMessage(
            "error",
            "Password baru minimal 8 karakter."
        );

        return;

    }


    if (
        newPassword !==
        confirmPassword
    ) {

        showPasswordMessage(
            "error",
            "Konfirmasi password tidak sama."
        );

        return;

    }


    if (
        currentPassword ===
        newPassword
    ) {

        showPasswordMessage(
            "error",
            "Password baru harus berbeda dari password lama."
        );

        return;

    }


    const button =
        document.getElementById(
            "btnSubmitPassword"
        );


    setButtonLoading(
        button,
        true
    );


    try {

        /*
         * ============================================================
         * API CHANGE PASSWORD
         * ============================================================
         *
         * Gunakan API.changePassword jika tersedia.
         */

        if (
            typeof API === "undefined"
        ) {

            throw new Error(
                "API tidak tersedia."
            );

        }


        if (
            typeof API.changePassword !==
            "function"
        ) {

            throw new Error(
                "API.changePassword belum tersedia."
            );

        }


        const result =
            await API.changePassword(
                {
                    currentPassword:
                        currentPassword,

                    newPassword:
                        newPassword
                }
            );


        if (
            !result ||
            result.success !== true
        ) {

            throw new Error(
                result?.message ||
                "Gagal mengubah password."
            );

        }


        showPasswordMessage(
            "success",
            "Password berhasil diubah."
        );


        showToast(
            "success",
            "Berhasil",
            "Password berhasil diperbarui."
        );


        setTimeout(
            function () {

                closePasswordModal();

            },
            1200
        );

    }
    catch (error) {

        console.error(
            "PENGATURAN: Change password ERROR:",
            error
        );


        showPasswordMessage(
            "error",
            error.message ||
            "Gagal mengubah password."
        );

    }
    finally {

        setButtonLoading(
            button,
            false
        );

    }

}


/* ============================================================================
 * PASSWORD TOGGLE
 * ========================================================================== */

function togglePassword(
    button
) {

    const targetId =
        button.dataset.target;


    const input =
        document.getElementById(
            targetId
        );


    if (
        !input
    ) {

        return;

    }


    const icon =
        button.querySelector(
            "i"
        );


    if (
        input.type ===
        "password"
    ) {

        input.type =
            "text";


        if (
            icon
        ) {

            icon.className =
                "fa-solid fa-eye-slash";

        }

    }
    else {

        input.type =
            "password";


        if (
            icon
        ) {

            icon.className =
                "fa-solid fa-eye";

        }

    }

}


/* ============================================================================
 * PASSWORD MESSAGE
 * ========================================================================== */

function showPasswordMessage(
    type,
    message
) {

    const element =
        document.getElementById(
            "passwordMessage"
        );


    if (
        !element
    ) {

        return;

    }


    element.className =
        "password-message " +
        type;


    element.textContent =
        message;


    element.hidden =
        false;

}


function hidePasswordMessage() {

    const element =
        document.getElementById(
            "passwordMessage"
        );


    if (
        element
    ) {

        element.hidden =
            true;

        element.textContent =
            "";

        element.className =
            "password-message";

    }

}


/* ============================================================================
 * ACTIVITY LOG
 * ========================================================================== */

function openActivityLog() {

    const modal =
        document.getElementById(
            "activityLogModal"
        );


    if (
        !modal
    ) {

        return;

    }


    modal.hidden =
        false;


    loadActivityLog();

}


function closeActivityLogModal() {

    const modal =
        document.getElementById(
            "activityLogModal"
        );


    if (
        modal
    ) {

        modal.hidden =
            true;

    }

}


/* ============================================================================
 * LOAD ACTIVITY LOG
 * ========================================================================== */

async function loadActivityLog() {

    const body =
        document.getElementById(
            "activityLogBody"
        );


    if (
        !body
    ) {

        return;

    }


    body.innerHTML = `

        <tr>

            <td
                colspan="4"
                class="empty-state"
            >

                <i class="fa-solid fa-spinner fa-spin"></i>

                <span>
                    Memuat activity log...
                </span>

            </td>

        </tr>

    `;


    try {

        /*
         * ================================================================
         * API ACTIVITY LOG
         * ================================================================
         *
         * Belum memaksakan endpoint baru.
         *
         * Jika API.getActivityLog tersedia,
         * gunakan endpoint tersebut.
         */

        if (
            typeof API !== "undefined" &&
            typeof API.getActivityLog ===
            "function"
        ) {

            const result =
                await API.getActivityLog();


            const data =
                result?.data ||
                [];


            renderActivityLog(
                data
            );


            return;

        }


        /*
         * ================================================================
         * FALLBACK
         * ================================================================
         */

        body.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    class="empty-state"
                >

                    <i class="fa-solid fa-circle-info"></i>

                    <span>
                        Activity Log API belum tersedia.
                    </span>

                </td>

            </tr>

        `;

    }
    catch (error) {

        console.error(
            "PENGATURAN: Activity Log ERROR:",
            error
        );


        body.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    class="empty-state"
                >

                    <i class="fa-solid fa-triangle-exclamation"></i>

                    <span>
                        Gagal memuat activity log.
                    </span>

                </td>

            </tr>

        `;

    }

}


/* ============================================================================
 * RENDER ACTIVITY LOG
 * ========================================================================== */

function renderActivityLog(
    data
) {

    const body =
        document.getElementById(
            "activityLogBody"
        );


    if (
        !body
    ) {

        return;

    }


    if (
        !Array.isArray(data) ||
        data.length === 0
    ) {

        body.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    class="empty-state"
                >

                    <i class="fa-solid fa-clock-rotate-left"></i>

                    <span>
                        Belum ada data aktivitas.
                    </span>

                </td>

            </tr>

        `;


        return;

    }


    body.innerHTML =
        data.map(
            function (item) {

                const timestamp =
                    item.timestamp ||
                    item.Timestamps ||
                    "-";


                const username =
                    item.username ||
                    item.user ||
                    "-";


                const action =
                    item.action ||
                    item.activity ||
                    "-";


                const description =
                    item.description ||
                    item.message ||
                    "-";


                return `

                    <tr>

                        <td>
                            ${escapeHtml(
                    formatDateTime(
                        timestamp
                    )
                )}
                        </td>

                        <td>
                            ${escapeHtml(
                    username
                )}
                        </td>

                        <td>
                            ${escapeHtml(
                    action
                )}
                        </td>

                        <td>
                            ${escapeHtml(
                    description
                )}
                        </td>

                    </tr>

                `;

            }
        )
            .join("");

}


/* ============================================================================
 * FILTER ACTIVITY LOG
 * ========================================================================== */

function filterActivityLog() {

    const input =
        document.getElementById(
            "activitySearch"
        );


    const query =
        String(
            input?.value ||
            ""
        )
            .trim()
            .toLowerCase();


    const rows =
        document.querySelectorAll(
            "#activityLogBody tr"
        );


    rows.forEach(
        function (row) {

            if (
                !query
            ) {

                row.style.display =
                    "";

                return;

            }


            const text =
                row.textContent
                    .toLowerCase();


            row.style.display =
                text.includes(
                    query
                )
                    ? ""
                    : "none";

        }
    );

}


/* ============================================================================
 * SYSTEM TIME
 * ========================================================================== */

function updateSystemTime() {

    const now =
        new Date();


    const formatted =
        formatDateTime(
            now
        );


    setText(
        "lastUpdate",
        "Last Update: " +
        formatted
    );


    setText(
        "settingsLastChecked",
        "Checked: " +
        formatted
    );

}


/* ============================================================================
 * DOM HELPERS
 * ========================================================================== */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (
        element
    ) {

        element.textContent =
            value ??
            "-";

    }

}


function setValue(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (
        element
    ) {

        element.value =
            value;

    }

}


function getValue(
    id
) {

    const element =
        document.getElementById(
            id
        );


    return element
        ? String(
            element.value ||
            ""
        ).trim()
        : "";

}


function setChecked(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (
        element
    ) {

        element.checked =
            Boolean(
                value
            );

    }

}


function getChecked(
    id
) {

    const element =
        document.getElementById(
            id
        );


    return Boolean(
        element?.checked
    );

}


function getNumber(
    id,
    fallback
) {

    const value =
        Number(
            getValue(
                id
            )
        );


    return Number.isFinite(
        value
    )
        ? value
        : fallback;

}


/* ============================================================================
 * BUTTON LOADING
 * ========================================================================== */

function setButtonLoading(
    button,
    loading
) {

    if (
        !button
    ) {

        return;

    }


    if (
        loading
    ) {

        if (
            !button.dataset.originalHtml
        ) {

            button.dataset.originalHtml =
                button.innerHTML;

        }


        button.disabled =
            true;


        button.innerHTML = `

            <i class="fa-solid fa-spinner fa-spin"></i>

            Memproses...

        `;

    }
    else {

        button.disabled =
            false;


        if (
            button.dataset.originalHtml
        ) {

            button.innerHTML =
                button.dataset.originalHtml;

        }

    }

}


/* ============================================================================
 * TOAST
 * ========================================================================== */

function showToast(
    type,
    title,
    message
) {

    /*
     * ================================================================
     * GUNAKAN TOAST GLOBAL JIKA SUDAH ADA
     * ================================================================
     */

    if (
        typeof window.showToast ===
        "function" &&
        window.showToast !==
        showToast
    ) {

        try {

            window.showToast(
                type,
                title,
                message
            );

            return;

        }
        catch (error) {

            console.warn(
                "Global toast gagal:",
                error
            );

        }

    }


    /*
     * ================================================================
     * FALLBACK TOAST
     * ================================================================
     */

    let container =
        document.getElementById(
            "settingsToastContainer"
        );


    if (
        !container
    ) {

        container =
            document.createElement(
                "div"
            );


        container.id =
            "settingsToastContainer";


        container.style.position =
            "fixed";


        container.style.right =
            "22px";


        container.style.bottom =
            "22px";


        container.style.zIndex =
            "10000";


        container.style.display =
            "flex";


        container.style.flexDirection =
            "column";


        container.style.gap =
            "10px";


        document.body.appendChild(
            container
        );

    }


    const toast =
        document.createElement(
            "div"
        );


    const icon =
        type === "success"
            ? "fa-circle-check"
            : type === "error"
                ? "fa-circle-exclamation"
                : "fa-circle-info";


    const iconColor =
        type === "success"
            ? "#10B981"
            : type === "error"
                ? "#EF4444"
                : "#2F6FD3";


    toast.style.minWidth =
        "300px";


    toast.style.maxWidth =
        "420px";


    toast.style.padding =
        "14px 16px";


    toast.style.background =
        "#FFFFFF";


    toast.style.border =
        "1px solid #E2E8F0";


    toast.style.borderRadius =
        "12px";


    toast.style.boxShadow =
        "0 12px 30px rgba(15,23,42,.12)";


    toast.style.display =
        "flex";


    toast.style.alignItems =
        "flex-start";


    toast.style.gap =
        "11px";


    toast.innerHTML = `

        <i
            class="fa-solid ${icon}"
            style="
                color:${iconColor};
                font-size:18px;
                margin-top:2px;
            "
        ></i>

        <div>

            <strong
                style="
                    display:block;
                    color:#172033;
                    font-size:13px;
                    margin-bottom:3px;
                "
            >
                ${escapeHtml(title)}
            </strong>

            <span
                style="
                    color:#64748B;
                    font-size:11px;
                    line-height:1.4;
                "
            >
                ${escapeHtml(message)}
            </span>

        </div>

    `;


    container.appendChild(
        toast
    );


    setTimeout(
        function () {

            toast.style.opacity =
                "0";

            toast.style.transform =
                "translateY(8px)";

            toast.style.transition =
                "all .2s ease";


            setTimeout(
                function () {

                    toast.remove();

                },
                220
            );

        },
        3200
    );

}


/* ============================================================================
 * DATE FORMAT
 * ========================================================================== */

function formatDateTime(
    value
) {

    if (
        !value
    ) {

        return "-";

    }


    try {

        const date =
            value instanceof Date
                ? value
                : new Date(
                    value
                );


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return String(
                value
            );

        }


        return new Intl.DateTimeFormat(
            "id-ID",
            {
                day:
                    "2-digit",

                month:
                    "2-digit",

                year:
                    "numeric",

                hour:
                    "2-digit",

                minute:
                    "2-digit"
            }
        ).format(
            date
        );

    }
    catch (error) {

        return String(
            value
        );

    }

}


/* ============================================================================
 * HTML ESCAPE
 * ========================================================================== */

function escapeHtml(
    value
) {

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

/* ============================================================================
 * PUBLIC MONITORING SETTINGS
 * ========================================================================== */

window.getMonitoringSettings = function () {

    const settings =
        Pengaturan?.settings?.monitoring;

    if (!settings) {

        return {
            expiredThreshold: 30,
            completionTarget: 100,
            autoRefresh: true,
            refreshInterval: 5
        };

    }

    return {

        expiredThreshold:
            Number(
                settings.expiredThreshold
            ) || 30,

        completionTarget:
            Number(
                settings.completionTarget
            ) || 100,

        autoRefresh:
            settings.autoRefresh !== false,

        refreshInterval:
            Number(
                settings.refreshInterval
            ) || 5

    };

};

/* ============================================================================
 * EXPORT DEBUG
 * ========================================================================== */

window.Pengaturan =
    Pengaturan;


console.log(
    "PENGATURAN.JS ENTERPRISE 1.0 LOADED"
);