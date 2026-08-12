// ======================================================
// pengaturan.js
// Data Agunan Custody
// ======================================================

const Setting = {

    defaultConfig: {

        appName: "DATA AGUNAN CUSTODY",

        version: CONFIG.VERSION,

        theme: "light",

        primaryColor: "#9400D3",

        autoRefresh: true,

        refreshInterval: 60

    },

    config: {},

    // =============================================
    // INIT
    // =============================================

    init() {

        this.load();

        this.showAppInfo();

        this.showUser();

        this.bindEvent();

        this.applyTheme();

    },

    // =============================================
    // LOAD
    // =============================================

    load() {

        const data = localStorage.getItem("setting");

        if (data) {

            this.config = JSON.parse(data);

        } else {

            this.config = { ...this.defaultConfig };

        }

    },

    // =============================================
    // SAVE
    // =============================================

    save() {

        localStorage.setItem(

            "setting",

            JSON.stringify(this.config)

        );

        this.applyTheme();

        alert("Pengaturan berhasil disimpan.");

    },

    // =============================================
    // APP INFO
    // =============================================

    showAppInfo() {

        document.getElementById("appName").textContent =
            this.config.appName;

        document.getElementById("version").textContent =
            this.config.version;

    },

    // =============================================
    // USER INFO
    // =============================================

    showUser() {

        const user = Auth.getUser();

        if (!user) return;

        document.getElementById("username").textContent =
            user.nama;

        document.getElementById("role").textContent =
            user.role;

    },

    // =============================================
    // APPLY THEME
    // =============================================

    applyTheme() {

        document.documentElement.style.setProperty(

            "--primary",

            this.config.primaryColor

        );

        if (this.config.theme === "dark") {

            document.body.classList.add("dark");

        } else {

            document.body.classList.remove("dark");

        }

    },

    // =============================================
    // EVENT
    // =============================================

    bindEvent() {

        const btnSave = document.getElementById("btnSave");

        if (btnSave) {

            btnSave.onclick = () => {

                this.config.theme =
                    document.getElementById("theme").value;

                this.config.primaryColor =
                    document.getElementById("primaryColor").value;

                this.config.autoRefresh =
                    document.getElementById("autoRefresh").checked;

                this.config.refreshInterval =
                    Number(document.getElementById("refreshInterval").value);

                this.save();

            };

        }

        const btnReset = document.getElementById("btnReset");

        if (btnReset) {

            btnReset.onclick = () => this.reset();

        }

        const btnLogout = document.getElementById("btnLogout");

        if (btnLogout) {

            btnLogout.onclick = () => Auth.logout();

        }

    },

    // =============================================
    // RESET
    // =============================================

    reset() {

        if (!confirm("Reset semua pengaturan?")) return;

        this.config = { ...this.defaultConfig };

        localStorage.removeItem("setting");

        location.reload();

    }

};

// ======================================================
// START
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

    if (!Auth.isLogin()) {

        location.href = "../login.html";

        return;

    }

    Setting.init();

});