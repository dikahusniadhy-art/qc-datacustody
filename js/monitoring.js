/******************************************************************************
 * MONITORING DATA AGUNAN
 * VERSION : 1.0 ENTERPRISE
 ******************************************************************************/

const MONITORING = {

    /**********************************************************************
     * STATE
     **********************************************************************/
    state: {
        data: [],
        filtered: [],
        page: 1,
        pageSize: 10,
        filter: {
            keyword: "",
            cabang: "",
            status: "",
            dokumen: ""
        }
    },

    /**********************************************************************
     * GET VALUE HELPER (KEBAL HURUF BESAR/KECIL DARI CODE.GS)
     **********************************************************************/
    getValue(item, targetKey) {
        if (!item) return "";
        const target = targetKey.trim().toLowerCase();
        // Mengatasi jika nama header dari sheet berbeda casing
        const foundKey = Object.keys(item).find(k => String(k).trim().toLowerCase() === target);
        return foundKey ? item[foundKey] : "";
    },

    /**********************************************************************
     * INIT
     **********************************************************************/
    async init() {
        await this.loadData();
        this.registerEvent();
        this.loadToday();

        const versionEl = document.getElementById("appVersion");
        if (versionEl && typeof CONFIG !== 'undefined') {
            versionEl.textContent = "Version " + CONFIG.VERSION;
        }
    },

    /**********************************************************************
     * TODAY
     **********************************************************************/
    loadToday() {
        const now = new Date();
        const option = {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric"
        };
        const el = document.getElementById("todayDate");
        if (el) {
            el.textContent = now.toLocaleDateString("id-ID", option);
        }
    },

    showLoading() {
        const loading = document.getElementById("loading");
        if (loading) loading.style.display = "flex";
    },

    hideLoading() {
        const loading = document.getElementById("loading");
        if (loading) loading.style.display = "none";
    },

    /**********************************************************************
     * LOAD DATA
     **********************************************************************/
    async loadData() {
        try {
            this.showLoading();
            const result = await API.getAgunan();

            if (!result.success) {
                alert(result.message);
                return;
            }

            this.state.data = result.data || [];
            this.state.filtered = [...this.state.data];
            this.state.page = 1;

            this.loadCabang();
            this.updateSummary();
            this.updateKPI();
            this.renderTable();
            this.updateLastUpdate();

        } catch (err) {
            console.error(err);
            alert(err.message);
        } finally {
            this.hideLoading();
        }
    },

    updateLastUpdate() {
        const el = document.getElementById("lastUpdate");
        if (!el) return;
        el.innerHTML = "Last Update : " + new Date().toLocaleString("id-ID");
    },

    /**********************************************************************
     * LOAD CABANG
     **********************************************************************/
    loadCabang() {
        const select = document.getElementById("filterCabang");
        if (!select) return;

        select.innerHTML = '<option value="">Semua Cabang</option>';

        const cabang = [
            ...new Set(
                this.state.data
                    .map(x => this.getValue(x, "kode_cabang"))
                    .filter(Boolean)
            )
        ];

        cabang.sort();
        cabang.forEach(item => {
            select.innerHTML += `<option value="${item}">${item}</option>`;
        });
    },

    /**********************************************************************
     * CALCULATE SISA HARI
     **********************************************************************/
    calculateSisaHari(dateStr) {
        if (!dateStr) return null;

        let targetDate;
        const match = String(dateStr).match(/^(\d{4})-(\d{2})-(\d{2})/);

        if (match) {
            targetDate = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
        } else {
            targetDate = new Date(dateStr);
            targetDate.setHours(0, 0, 0, 0);
        }

        if (isNaN(targetDate.getTime())) return null;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return Math.ceil((targetDate.getTime() - today.getTime()) / 86400000);
    },

    /**********************************************************************
     * UPDATE KPI
     **********************************************************************/
    updateKPI() {
        const data = this.state.filtered;
        const total = data.length;

        // Menggunakan getVaule & toUpperCase() agar selaras code.gs
        const lengkap = data.filter(x => String(this.getValue(x, "status_agunan")).trim().toUpperCase() === "A").length;
        const belum = data.filter(x => String(this.getValue(x, "status_agunan")).trim().toUpperCase() === "BL").length;
        const expired = data.filter(x => String(this.getValue(x, "status_agunan")).trim().toUpperCase() === "E").length;

        const soon = data.filter(item => {
            const diff = this.calculateSisaHari(this.getValue(item, "tanggal_expired_appraisal"));
            return diff !== null && diff >= 0 && diff <= 30;
        }).length;

        document.getElementById("kpiTotal").textContent = total;
        document.getElementById("kpiLengkap").textContent = lengkap;
        document.getElementById("kpiBelum").textContent = belum;
        document.getElementById("kpiExpired").textContent = expired;
        document.getElementById("kpiSoon").textContent = soon;

        const toolbar = document.getElementById("toolbarTotal");
        if (toolbar) toolbar.textContent = total;
    },

    /**********************************************************************
     * UPDATE SUMMARY
     **********************************************************************/
    updateSummary() {
        const data = this.state.filtered;
        const total = data.length;

        const lengkap = data.filter(x => String(this.getValue(x, "status_agunan")).trim().toUpperCase() === "A").length;
        const belum = data.filter(x => String(this.getValue(x, "status_agunan")).trim().toUpperCase() === "BL").length;
        const expired = data.filter(x => String(this.getValue(x, "status_agunan")).trim().toUpperCase() === "E").length;
        const nonaktif = data.filter(x => String(this.getValue(x, "status_agunan")).trim().toUpperCase() === "D").length;

        const soon = data.filter(item => {
            const diff = this.calculateSisaHari(this.getValue(item, "tanggal_expired_appraisal"));
            return diff !== null && diff >= 0 && diff <= 30;
        }).length;

        const totalProgress =
            lengkap +
            belum +
            expired;


        const percent =
            totalProgress === 0
                ? 0
                : Math.round(
                    (lengkap / totalProgress) * 100
                );

        const elPercent = document.getElementById("progressPercent");
        if (elPercent) elPercent.textContent = percent + "%";

        const elValue = document.getElementById("progressValue");
        if (elValue) elValue.style.width = percent + "%";

        const elLengkap = document.getElementById("totalLengkap");
        if (elLengkap) elLengkap.textContent = lengkap;

        /*
         * ================================================================
         * KPI NONAKTIF
         * ================================================================
         */
        const elNonaktif = document.getElementById("totalNonaktif");
        if (elNonaktif) { elNonaktif.textContent = nonaktif; }

        const elKpiNonaktif =
            document.getElementById(
                "kpinonaktif"
            );


        if (
            elKpiNonaktif
        ) {

            elKpiNonaktif.textContent =
                nonaktif;

        }

        const elBL = document.getElementById("totalBL");
        if (elBL) elBL.textContent = belum;

        const elExpired = document.getElementById("totalExpired");
        if (elExpired) elExpired.textContent = expired;

        const elSoon = document.getElementById("totalSoon");
        if (elSoon) elSoon.textContent = soon;
    },

    /**********************************************************************
     * BADGE STATUS
     **********************************************************************/
    getBadge(status) {
        switch (String(status).trim().toUpperCase()) {
            case "A":
                return '<span class="badge badge-success">AKTIF</span>';
            case "BL":
                return '<span class="badge badge-bl">BELUM LENGKAP</span>';
            case "E":
                return '<span class="badge badge-warning">EXPIRED</span>';
            case "D":
                return '<span class="badge badge-danger">NON AKTIF</span>';
            default:
                return '<span class="badge badge-info">' + status + '</span>';
        }
    },

    /**********************************************************************
     * PRIORITY
     **********************************************************************/
    getPriority(item) {
        const status = String(this.getValue(item, "status_agunan")).trim().toUpperCase();

        if (status === "E") return '<span class="priority high">HIGH</span>';
        if (status === "BL") return '<span class="priority medium">MEDIUM</span>';
        if (status === "D") return '<span class="priority medium">MEDIUM</span>';
        return '<span class="priority low">LOW</span>';
    },

    /**********************************************************************
     * SISA HARI
     **********************************************************************/
    getRemainingDays(dateStr) {
        const diff = this.calculateSisaHari(dateStr);
        if (diff === null) return "-";
        if (diff < 0) return "<span style='color:#DC2626;font-weight:700'>Expired</span>";
        return diff + " Hari";
    },

    /**********************************************************************
     * PROGRESS
     **********************************************************************/
    getProgress(status) {
        let percent = 100;
        let cls = "success";

        switch (String(status).trim().toUpperCase()) {
            case "A": percent = 100; cls = "success"; break;
            case "BL": percent = 60; cls = "warning"; break;
            case "E": percent = 20; cls = "danger"; break;
            case "D": percent = 0; cls = "danger"; break;
        }

        return `
        <div class="progress-table">
            <div class="progress-track">
                <div class="progress-fill ${cls}" style="width:${percent}%"></div>
            </div>
            <span class="progress-percent">${percent}%</span>
        </div>
        `;
    },

    /**********************************************************************
     * FORMAT DATE
     **********************************************************************/
    formatDate(dateStr) {
        if (!dateStr) return "-";
        const match = String(dateStr).match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (match) return `${match[3]}/${match[2]}/${match[1]}`;
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return "-";
        return d.toLocaleDateString("id-ID");
    },

    /**********************************************************************
     * ROW CLASS
     **********************************************************************/
    getRowClass(item) {
        const status = String(this.getValue(item, "status_agunan")).trim().toUpperCase();

        if (status === "E") return "row-expired";
        if (status === "BL") return "row-bl";

        const diff = this.calculateSisaHari(this.getValue(item, "tanggal_expired_appraisal"));
        if (diff !== null && diff >= 0 && diff <= 30) return "row-warning";

        return "";
    },

    /**********************************************************************
     * RENDER TABLE
     **********************************************************************/
    renderTable() {
        const tbody = document.querySelector("#tblMonitoring tbody");
        if (!tbody) return;

        tbody.innerHTML = "";

        if (this.state.filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="11" style="padding:40px;text-align:center;">
                        Tidak ada data Monitoring.
                    </td>
                </tr>
            `;
            this.updatePageInfo();
            return;
        }

        const start = (this.state.page - 1) * this.state.pageSize;
        const end = start + this.state.pageSize;
        const rows = this.state.filtered.slice(start, end);

        rows.forEach((item, index) => {
            const jenisDokumen = this.getValue(item, "jenis_dokumen");
            const noAgunan = this.getValue(item, "no_agunan");
            const cif = this.getValue(item, "cif_debitur");
            const namaDebitur = this.getValue(item, "nama_pemilik_agunan");
            const cabang = this.getValue(item, "kode_cabang");

            const statusAgunan = String(this.getValue(item, "status_agunan")).trim().toUpperCase();
            const tglExpired = this.getValue(item, "tanggal_expired_appraisal");

            tbody.innerHTML += `
            <tr class="${this.getRowClass(item)}">
                <td>${start + index + 1}</td>
                <td>${jenisDokumen}</td>
                <td>${noAgunan}</td>
                <td>${cif}</td>
                <td>${namaDebitur}</td>
                <td>${cabang}</td>
                <td>${this.getBadge(statusAgunan)}</td>
                <td>${this.formatDate(tglExpired)}</td>
                <td>${this.getRemainingDays(tglExpired)}</td>
                <td>${this.getPriority(item)}</td>
                <td>${this.getProgress(statusAgunan)}</td>
            </tr>
            `;
        });

        this.updatePageInfo();
    },

    /**********************************************************************
     * APPLY FILTER
     **********************************************************************/
    applyFilter() {
        const keyword = this.state.filter.keyword.toLowerCase();
        const cabang = this.state.filter.cabang;
        const status = this.state.filter.status;
        const dokumen = this.state.filter.dokumen;

        this.state.filtered = this.state.data.filter(item => {

            // Ambil semua data via getValue helper agar formatnya pasti dapat
            const itemJenis = String(this.getValue(item, "jenis_dokumen")).trim().toUpperCase();
            const itemNo = String(this.getValue(item, "no_agunan")).toLowerCase();
            const itemCif = String(this.getValue(item, "cif_debitur")).toLowerCase();
            const itemNama = String(this.getValue(item, "nama_pemilik_agunan")).toLowerCase();
            const itemStatusRaw = String(this.getValue(item, "status_agunan")).toLowerCase();
            const itemStatusClean = String(this.getValue(item, "status_agunan")).trim().toUpperCase();
            const itemCabang = String(this.getValue(item, "kode_cabang"));

            const matchKeyword =
                keyword === "" ||
                itemJenis.toLowerCase().includes(keyword) ||
                itemNo.includes(keyword) ||
                itemCif.includes(keyword) ||
                itemNama.includes(keyword) ||
                itemStatusRaw.includes(keyword);

            const matchCabang =
                cabang === "" ||
                itemCabang === cabang;

            // Pencocokan eksak setelah di trim (membuang spasi nyasar)
            const matchStatus =
                status === "" ||
                itemStatusClean === status;

            const matchDokumen =
                dokumen === "" ||
                itemJenis === dokumen;

            return matchKeyword && matchCabang && matchStatus && matchDokumen;
        });

        this.state.page = 1;

        this.updateSummary();
        this.updateKPI();
        this.renderTable();
    },

    /**********************************************************************
     * PAGE INFO
     **********************************************************************/
    updatePageInfo() {
        const totalPage = Math.ceil(this.state.filtered.length / this.state.pageSize);
        const el = document.getElementById("pageInfo");
        if (el) {
            el.textContent = `Page ${this.state.page} of ${totalPage || 1}`;
        }
    },

    /**********************************************************************
     * REGISTER EVENT
     **********************************************************************/
    registerEvent() {
        const txtSearch = document.getElementById("txtSearch");
        if (txtSearch) {
            txtSearch.addEventListener("keyup", e => {
                this.state.filter.keyword = e.target.value;
                this.applyFilter();
            });
        }

        const filterCabang = document.getElementById("filterCabang");
        if (filterCabang) {
            filterCabang.addEventListener("change", e => {
                this.state.filter.cabang = e.target.value;
                this.applyFilter();
            });
        }

        const filterStatus = document.getElementById("filterStatus");
        if (filterStatus) {
            filterStatus.addEventListener("change", e => {
                this.state.filter.status = e.target.value;
                this.applyFilter();
            });
        }

        const filterDokumen = document.getElementById("filterDokumen");
        if (filterDokumen) {
            filterDokumen.addEventListener("change", e => {
                this.state.filter.dokumen = e.target.value;
                this.applyFilter();
            });
        }

        const btnRefresh = document.getElementById("btnRefresh");
        if (btnRefresh) {
            btnRefresh.addEventListener("click", async e => {
                const btn = e.currentTarget;
                btn.disabled = true;
                btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Refreshing...';
                await this.loadData();
                btn.disabled = false;
                btn.innerHTML = '<i class="fa-solid fa-rotate-right"></i> Refresh';
            });
        }

        const btnBack = document.getElementById("btnBack");
        if (btnBack) {
            btnBack.addEventListener("click", () => {
                window.location.href = "../dashboard.html";
            });
        }

        const btnPrev = document.getElementById("btnPrev");
        if (btnPrev) {
            btnPrev.addEventListener("click", () => {
                if (this.state.page > 1) {
                    this.state.page--;
                    this.renderTable();
                }
            });
        }

        const btnNext = document.getElementById("btnNext");
        if (btnNext) {
            btnNext.addEventListener("click", () => {
                const totalPage = Math.ceil(this.state.filtered.length / this.state.pageSize);
                if (this.state.page < totalPage) {
                    this.state.page++;
                    this.renderTable();
                }
            });
        }
    }
};

/**********************************************************************
 * START
 **********************************************************************/
document.addEventListener("DOMContentLoaded", () => {
    MONITORING.init();
});
