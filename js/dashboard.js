/******************************************************************************
 *
 * DATA AGUNAN CUSTODY
 * FILE      : dashboard.js
 * VERSION   : 2.0 FINAL
 * AUTHOR    : Dika Andrian Husniadhy
 *
 ******************************************************************************/

const Dashboard = {

    dashboardData: null,

    chart: null,

    autoRefresh: null,

    /******************************************************************************
 * INIT - FAST BOOT
 ******************************************************************************/

async init() {

    try {

        /*
         * LOGIN CHECK
         */

        if (!Auth.isLogin()) {

            window.location.href =
                "login.html";

            return;

        }


        /*
         * VERSION
         */

        const version =
            document.getElementById(
                "appVersion"
            );

        if (version) {

            version.textContent =
                `Version ${CONFIG.VERSION}`;

        }


        /*
         * LOAD USER IMMEDIATELY
         *
         * Tidak perlu menunggu API.
         */

        this.loadUser();


        /*
         * ROLE UI IMMEDIATELY
         */

        if (
            typeof Role !== "undefined"
        ) {

            Role.renderSidebar();
            Role.renderPermission();

        }


        /*
         * LOAD DASHBOARD IN BACKGROUND
         *
         * Jangan await.
         *
         * Ini membuat halaman langsung terasa
         * responsif.
         */

        this.loadDashboard(
            false
        );


        console.log(
            "Dashboard initialized."
        );

    }
    catch (err) {

        console.error(
            "Dashboard init error:",
            err
        );

        Helper.error(
            err.message ||
            "Gagal menginisialisasi dashboard."
        );

    }

},

    /**************************************************************************
     * LOAD USER
     **************************************************************************/
    loadUser() {

        const user = Auth.getUser();

        if (!user) return;

        const username = document.getElementById("username");
        const role = document.getElementById("role");
        const avatar = document.getElementById("avatar");

        if (username) {

            username.textContent = user.nama;

        }

        if (role) {

            role.textContent = user.role;

        }

        if (avatar) {

            avatar.textContent =
                user.nama.substring(0, 1).toUpperCase();

        }

    },

    /**************************************************************************
    * LOAD DASHBOARD
    **************************************************************************/
    async loadDashboard(showLoading = true) {

        try {

            if (showLoading) {
                Helper.showLoading("Memuat Dashboard...");
            }

            const result =
                await API.getDashboard();

            console.log(
                "===== DASHBOARD API ====="
            );

            console.log(result);

            console.log(
                "DATA DASHBOARD:",
                result.data
            );

            console.log(
                "TOTAL AGUNAN:",
                result.data?.totalAgunan
            );

            if (showLoading) {
                Helper.hideLoading();
            }

            if (!result || result.success !== true) {

                Helper.error(
                    result?.message ||
                    "Gagal mengambil data dashboard."
                );

                return;
            }

            this.dashboardData =
                result.data || {};

            this.loadKPI();

            this.loadProgress();

            this.loadChart();

            this.loadLatest();

            this.loadExpired();

            this.loadLoginHistory();

            this.loadActivityLog();

            this.loadApproval();

        }

        catch (err) {

            if (showLoading) {
                Helper.hideLoading();
            }

            console.error(
                "DASHBOARD ERROR:",
                err
            );

            Helper.error(
                err.message ||
                "Gagal memuat dashboard."
            );

        }

    },

    /**************************************************************************
     * LOAD KPI
     **************************************************************************/
    loadKPI() {

        const data =
            this.dashboardData || {};

        console.log(
            "RENDER KPI:",
            data
        );

        document.getElementById("kpiTotal").textContent =
            Helper.number(
                Number(data.totalAgunan || 0)
            );

        document.getElementById("kpiLengkap").textContent =
            Helper.number(
                Number(data.dokumenLengkap || 0)
            );

        document.getElementById("kpiBelum").textContent =
            Helper.number(
                Number(data.belumLengkap || 0)
            );

        document.getElementById("kpiExpired").textContent =
            Helper.number(
                Number(data.expired || 0)
            );

    },

    /**************************************************************************
     * LOAD PROGRESS BAR
     **************************************************************************/
    loadProgress() {

        const data = this.dashboardData;

        if (!data) return;

        const total = Number(data.totalAgunan || 0);

        if (total === 0) {

            document.getElementById("progressLengkap").style.width = "0%";
            document.getElementById("progressBelum").style.width = "0%";
            document.getElementById("progressExpired").style.width = "0%";
            document.getElementById("progressTidakAktif").style.width = "0%";

            return;

        }

        const lengkap =
            (Number(data.dokumenLengkap || 0) / total) * 100;

        const belum =
            (Number(data.belumLengkap || 0) / total) * 100;

        const expired =
            (Number(data.expired || 0) / total) * 100;

        const tidakAktif =
            (Number(data.tidakAktif || 0) / total) * 100;

        document.getElementById("progressLengkap").style.width =
            lengkap.toFixed(0) + "%";
        document.getElementById("progressBelum").style.width =
            belum.toFixed(0) + "%";
        document.getElementById("progressExpired").style.width =
            expired.toFixed(0) + "%";
        document.getElementById("progressTidakAktif").style.width =
            tidakAktif.toFixed(0) + "%";

    },

    /**************************************************************************
     * LOAD CHART
     **************************************************************************/
    loadChart() {

        const data = this.dashboardData;

        if (!data) return;

        const canvas = document.getElementById("chartMonitoring");

        if (!canvas) return;

        if (this.chart) {

            this.chart.destroy();

        }

        const lengkap = Number(data.dokumenLengkap || 0);
        const belum = Number(data.belumLengkap || 0);
        const expired = Number(data.expired || 0);
        const tidakAktif = Number(data.tidakAktif || 0);

        this.chart = new Chart(canvas, {

            type: "doughnut",

            data: {

                labels: [

                    "Dokumen Lengkap",

                    "Belum Lengkap",

                    "Expired",

                    "Tidak Aktif"

                ],

                datasets: [{

                    data: [

                        lengkap,
                        belum,
                        expired,
                        tidakAktif,

                    ],

                    backgroundColor: [

                        "#10B981",
                        "#F59E0B",
                        "#EF4444",
                        "#000000"

                    ],

                    borderWidth: 1

                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {

                        position: "bottom"

                    }

                }

            }

        });

    },

    /**************************************************************************
     * LOAD ALERT EXPIRED
     **************************************************************************/
    loadAlert() {

        const data = this.dashboardData;

        if (!data) return;

        const expired = Number(data.expired || 0);

        const info = document.getElementById("expiredInfo");

        if (!info) return;

        if (expired === 0) {

            info.innerHTML =
                "Tidak ada dokumen yang akan expired.";

        }

        else {

            info.innerHTML =
                "<b>" +
                expired +
                "</b> dokumen memerlukan perhatian.";

        }

    },

    /**************************************************************************
     * LOAD DATA AGUNAN TERBARU
     **************************************************************************/
    loadLatest() {

        const tbody = document.getElementById("tblLatest");

        if (!tbody) return;

        tbody.innerHTML = "";

        const data = this.dashboardData.latestAgunan || [];

        if (data.length === 0) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center">
                        Belum ada data
                    </td>
                </tr>
            `;

            return;

        }

        data.forEach((item, index) => {

            tbody.innerHTML += `

                <tr>

                    <td>${index + 1}</td>

                    <td>${item.no_agunan || "-"}</td>
                    <td>${item.jenis_dokumen || "-"}</td>
                    <td>${item.cif_debitur || "-"}</td>
                    <td>${item.nama_pemilik_agunan || "-"}</td>
                    <td>${item.status || "-"}</td>
                    <td>${item.tanggal_expired_appraisal || "-"}</td>

                </tr>

            `;

        });

    },

    /**************************************************************************
    * LOAD DOKUMEN EXPIRED
    **************************************************************************/
    loadExpired() {

        const tbody = document.getElementById("tblExpired");

        if (!tbody) return;

        tbody.innerHTML = "";

        const data = this.dashboardData.expiredDocument || [];

        if (data.length === 0) {

            tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center">
                    Tidak ada dokumen yang akan expired
                </td>
            </tr>
        `;

            return;

        }

        data.forEach((item, index) => {

            let badge = "success";
            let statusHari = item.sisa_hari;

            if (item.sisa_hari <= 0) {

                badge = "danger";
                statusHari = "Expired";

            } else if (item.sisa_hari <= 7) {

                badge = "warning";

            }

            tbody.innerHTML += `

            <tr>

                <td>${index + 1}</td>

                <td>${item.no_agunan || "-"}</td>

                <td>${item.jenis_dokumen || "-"}</td>

                <td>${item.cif_debitur || "-"}</td>

                <td>${item.nama_pemilik_agunan || "-"}</td>

                <td>${item.status_agunan || "-"}</td>

                <td>${item.tanggal_expired_appraisal || "-"}</td>


                <td>

                    <span class="badge ${badge}">

                        ${statusHari}

                    </span>

                </td>

            </tr>

        `;

        });

    },

    /**************************************************************************
     * LOAD LOGIN HISTORY
     **************************************************************************/
    loadLoginHistory() {

        const tbody = document.getElementById("tblLogin");

        if (!tbody) return;

        tbody.innerHTML = "";

        const data = this.dashboardData.loginHistory || [];

        if (data.length === 0) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center">
                        Belum ada riwayat login
                    </td>
                </tr>
            `;

            return;

        }

        data.forEach((item, index) => {

            tbody.innerHTML += `

                <tr>

                    <td>${index + 1}</td>

                    <td>${item.username || "-"}</td>

                    <td>${item.nama || "-"}</td>

                    <td>${Helper.datetime(item.loginTime)}</td>

                    <td>${item.status || "-"}</td>

                </tr>

            `;

        });

    },

    /**************************************************************************
     * LOAD TIMELINE
     **************************************************************************/
    loadTimeline() {

        const timeline = document.getElementById("timeline");

        if (!timeline) return;

        timeline.innerHTML = "";

        const data = this.dashboardData.timeline || [];

        if (data.length === 0) {

            timeline.innerHTML =
                "<li>Tidak ada aktivitas.</li>";

            return;

        }

        data.forEach(item => {

            timeline.innerHTML += `

                <li>

                    <strong>${item.judul}</strong><br>

                    <small>${item.waktu}</small>

                </li>

            `;

        });

    },

    /**************************************************************************
     * LOAD ACTIVITY LOG
     **************************************************************************/
    loadActivityLog() {
        const activityLog = document.getElementById("activityLog");
        if (!activityLog) return;

        activityLog.innerHTML = "";
        const data = this.dashboardData.timeline || [];

        if (data.length === 0) {
            activityLog.innerHTML = "<div style='color:gray;'>Tidak ada aktivitas pengguna terbaru.</div>";
            return;
        }

        // Bikin tampilan list tanpa bullet dan ada garis pemisahnya
        let html = "<ul style='padding-left: 0; list-style: none; margin: 0;'>";

        data.forEach(item => {
            // PERBAIKAN: Format tanggal menggunakan Helper.datetime
            const formatWaktu = item.waktu ? Helper.datetime(item.waktu) : "-";

            html += `
                <li style='margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;'>
                    <div style='display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;'>
                        <strong style='color: var(--primary-dark); font-size: 14px;'>
                            <i class="fa-solid fa-user-tie"></i> ${item.username || "-"}
                        </strong>
                        <span style='font-size: 11px; font-weight: bold; background: #e0e7ff; color: #4338ca; padding: 3px 8px; border-radius: 12px;'>
                            ${item.activity || "-"}
                        </span>
                    </div>
                    <div style='font-size: 13px; color: #475569; margin-bottom: 5px;'>
                        ${item.detail || "-"}
                    </div>
                    <div style='color: #94a3b8; font-size: 11px;'>
                        <i class="fa-regular fa-clock"></i> ${formatWaktu}
                    </div>
                </li>
            `;
        });

        html += "</ul>";
        activityLog.innerHTML = html;
    },
    /**************************************************************************
     * LOAD APPROVAL
     **************************************************************************/
    loadApproval() {

        const approval = document.getElementById("approvalList");

        if (!approval) return;

        approval.innerHTML = "";

        const data = this.dashboardData.approvalQueue || [];

        if (data.length === 0) {

            approval.innerHTML =
                "<div>Tidak ada approval.</div>";

            return;

        }

        data.forEach(item => {

            approval.innerHTML += `

                <div class="approval-item">

                    <b>${item.nama}</b>

                    <br>

                    <small>${item.keterangan}</small>

                </div>

            `;

        });

    },

    /**************************************************************************
    * REFRESH DASHBOARD
    **************************************************************************/
    async refresh() {

        try {

            await this.loadDashboard(true);

            Helper.success("Dashboard berhasil diperbarui.");

        }

        catch (err) {

            console.error(err);

            Helper.error("Refresh gagal.");

        }

    },

    /**************************************************************************
     * LOGOUT
     **************************************************************************/
    /**************************************************************************
     * LOGOUT
     **************************************************************************/
    async logout() {

        if (!confirm("Logout dari sistem?")) {
            return;
        }

        try {

            await Auth.logout();

        }
        catch (err) {

            console.error(
                "Dashboard logout error:",
                err
            );

            try {

                Auth.clear();

            }
            catch (clearError) {

                console.error(
                    "Clear session error:",
                    clearError
                );

            }

            window.location.href =
                "login.html";

        }

    }

};


/******************************************************************************
 * LOGOUT BUTTON EVENT
 ******************************************************************************/

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const btnLogout =
            document.getElementById("btnLogout");

        if (!btnLogout) {

            console.warn(
                "Tombol Logout #btnLogout tidak ditemukan."
            );

            return;

        }

        btnLogout.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                Dashboard.logout();

            }
        );

    }
);
