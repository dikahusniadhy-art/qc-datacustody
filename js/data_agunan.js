/******************************************************************************
 *
 * DATA AGUNAN CUSTODY
 * FILE      : data_agunan.js
 * VERSION   : 2.0 FINAL
 *
 ******************************************************************************/

const DATA_AGUNAN = {

    /**************************************************************************
     * STATE
     **************************************************************************/
    data: [],
    filterData: [],

    currentPage: 1,
    pageSize: 10,

    sortColumn: "",
    sortAsc: true,

    /**************************************************************************
     * INITIALIZE
     **************************************************************************/
    async init() {

        this.registerEvent();

        // TAMBAHKAN BARIS INI: Sembunyikan tombol HTML yang tidak sesuai akses
        if (typeof Role !== "undefined") {
            Role.renderPermission();
        }

        await this.loadData();

    },

    /**************************************************************************
     * LOAD DATA
     **************************************************************************/
    async loadData() {

        try {

            this.showLoading();

            const result = await API.getAgunan();

            if (!result.success) {

                alert(result.message);

                return;

            }

            this.data = result.data || [];

            this.filterData = [...this.data];

            this.currentPage = 1;

            this.loadKPI();

            this.loadFilterCabang();

            this.loadFilterJenis();

            this.renderTable();

            const lastUpdate = document.getElementById("lastUpdate");

            if (lastUpdate) {

                lastUpdate.textContent =
                    "Last Update : " +
                    new Date().toLocaleString("id-ID");

            }

        }

        catch (err) {

            console.error(err);

            alert(err.message);

        }

        finally {

            this.hideLoading();

        }

    },

    /**************************************************************************
     * LOAD KPI
     **************************************************************************/
    loadKPI() {

        const total = this.data.length;

        const aktif =
            this.data.filter(x => x.status_agunan === "A").length;

        const expired =
            this.data.filter(x => x.status_agunan === "E").length;

        const nonAktif =
            this.data.filter(x => x.status_agunan === "D").length;

        document.getElementById("kpiTotal").textContent = total;

        document.getElementById("kpiAktif").textContent = aktif;

        document.getElementById("kpiExpired").textContent = expired;

        document.getElementById("kpiNonAktif").textContent = nonAktif;
        const totalToolbar = document.getElementById("toolbarTotal");

        if (totalToolbar) {

            totalToolbar.textContent = total;

        }

    },

    /**************************************************************************
 * LOAD FILTER CABANG
 **************************************************************************/
    loadFilterCabang() {

        const select = document.getElementById("filterCabang");

        if (!select) return;

        select.innerHTML =
            '<option value="">Semua Cabang</option>';

        const cabangList = [...new Set(
            this.data
                .map(item => item.kode_cabang)
                .filter(item => item && item.trim() !== "")
        )];

        cabangList
            .sort()
            .forEach(cabang => {

                select.innerHTML += `
                <option value="${cabang}">
                    ${cabang}
                </option>
            `;

            });

    },

    /**************************************************************************
 * LOAD FILTER JENIS
 **************************************************************************/
    loadFilterJenis() {

        const select = document.getElementById("filterJenis");

        if (!select) return;

        select.innerHTML =
            '<option value="">Semua Jenis</option>';

        const jenisList = [...new Set(
            this.data
                .map(item => item.jenis_dokumen)
                .filter(item => item && item.trim() !== "")
        )];

        jenisList
            .sort()
            .forEach(jenis => {

                select.innerHTML += `
                <option value="${jenis}">
                    ${jenis}
                </option>
            `;

            });

    },

    /**************************************************************************
     * RENDER TABLE
     **************************************************************************/
    renderTable() {
        const tbody = document.querySelector("#tblAgunan tbody");
        tbody.innerHTML = "";

        if (this.filterData.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="10" class="empty-data" style="text-align: center; padding: 20px;">
                        Tidak ada data agunan.
                    </td>
                </tr>
            `;
            this.updatePageInfo();
            return;
        }

        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        const pageData = this.filterData.slice(start, end);

        pageData.forEach((item, index) => {
            // 1. Tentukan tombol View (Semua orang punya hak lihat)
            let actionButtons = `
                <button
                    class="btn-view"
                    data-title="View"
                    onclick="DATA_AGUNAN.view('${item.no_agunan}')">
                    <i class="fa-solid fa-eye"></i>
                </button>
            `;

            // 2. Tambahkan tombol Edit jika punya hak akses update
            if (Role.can("update")) {
                actionButtons += `
                <button
                    class="btn-edit"
                    data-title="Edit"
                    onclick="DATA_AGUNAN.edit('${item.no_agunan}')">
                    <i class="fa-solid fa-pen"></i>
                </button>
                `;
            }

            // 3. Tambahkan tombol Delete HANYA jika punya hak akses delete
            if (Role.can("delete")) {
                actionButtons += `
                <button
                    class="btn-delete"
                    data-title="Delete"
                    onclick="DATA_AGUNAN.delete('${item.no_agunan}')">
                    <i class="fa-solid fa-trash"></i>
                </button>
                `;
            }

            // 4. Masukkan baris ke dalam tabel
            tbody.innerHTML += `
                <tr data-id="${item.no_agunan}">
                    <td>${start + index + 1}</td>
                    <td>${item.jenis_dokumen}</td>
                    <td>${item.kode_cabang}</td>
                    <td>${item.no_agunan}</td>
                    <td>${item.cif_debitur}</td>
                    <td>${item.nama_pemilik_agunan}</td>
                    <td>${item.kode_jenis_agunan}</td>
                    <td>${this.getBadgeStatus(item.status_agunan)}</td>
                    <td>${this.formatDate(item.tanggal_expired_appraisal)}</td>
                    <td>
                        <div class="table-action">
                            ${actionButtons}
                        </div>
                    </td>
                </tr>
            `;
        });

        this.updatePageInfo();
    },

    /**************************************************************************
 * BADGE STATUS
 **************************************************************************/
    getBadgeStatus(status) {

        switch (String(status).toUpperCase()) {

            case "A":
                return `<span class="badge badge-success">AKTIF</span>`;

            case "E":
                return `<span class="badge badge-warning">EXPIRED</span>`;

            case "D":
                return `<span class="badge badge-danger">NON AKTIF</span>`;

            case "BL":
                return `<span class="badge badge-bl">BELUM LENGKAP</span>`;

            default:
                return `<span class="badge badge-info">${status || "-"}</span>`;

        }

    },

    /**************************************************************************
         * FORMAT DATE
    **************************************************************************/
    formatDate(value) {
        if (!value) return "-";
        const date = new Date(value);

        // Jika bukan format tanggal valid, kembalikan nilai aslinya
        if (isNaN(date.getTime())) {
            return value;
        }

        // Susun format DD-MM-YYYY
        const d = String(date.getDate()).padStart(2, '0');
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const y = date.getFullYear();

        return `${d}-${m}-${y}`;
    },

    /**************************************************************************
     * SEARCH REALTIME
     **************************************************************************/
    search(keyword) {

        keyword = String(keyword).toLowerCase().trim();

        this.filterData = this.data.filter(item => {

            return (

                String(item.no_agunan || "")
                    .toLowerCase()
                    .includes(keyword)

                ||

                String(item.cif_debitur || "")
                    .toLowerCase()
                    .includes(keyword)

                ||

                String(item.nama_pemilik_agunan || "")
                    .toLowerCase()
                    .includes(keyword)

                ||

                String(item.kode_jenis_agunan || "")
                    .toLowerCase()
                    .includes(keyword)

                ||

                String(item.jenis_pengikatan || "")
                    .toLowerCase()
                    .includes(keyword)

                ||

                String(item.kode_cabang || "")
                    .toLowerCase()
                    .includes(keyword)

            );

        });

        this.currentPage = 1;

        this.renderTable();

    },

    /**************************************************************************
     * FILTER STATUS
     **************************************************************************/
    filterStatus(status) {

        if (!status) {

            this.filterData = [...this.data];

        } else {

            const map = {

                "AKTIF": "A",

                "EXPIRED": "E",

                "NONAKTIF": "D",

                "BELUM LENGKAP": "BL"

            };

            this.filterData = this.data.filter(item =>

                item.status_agunan === map[status]

            );

        }

        this.currentPage = 1;

        this.renderTable();

    },

    /**************************************************************************
     * FILTER CABANG
     **************************************************************************/
    filterCabang(cabang) {

        if (!cabang) {

            this.filterData = [...this.data];

        } else {

            this.filterData = this.data.filter(item =>

                item.kode_cabang === cabang

            );

        }

        this.currentPage = 1;

        this.renderTable();

    },

    /**************************************************************************
     * FILTER JENIS AGUNAN
     **************************************************************************/
    filterJenis(jenis) {

        if (!jenis) {

            this.filterData = [...this.data];

        } else {

            this.filterData = this.data.filter(item =>

                item.jenis_dokumen === jenis

            );

        }

        this.currentPage = 1;

        this.renderTable();

    },

    /**************************************************************************
     * SORT TABLE
     **************************************************************************/
    sortTable(column) {

        if (this.sortColumn === column) {

            this.sortAsc = !this.sortAsc;

        } else {

            this.sortColumn = column;

            this.sortAsc = true;

        }

        this.filterData.sort((a, b) => {

            let x = a[column] ?? "";

            let y = b[column] ?? "";

            x = String(x).toUpperCase();

            y = String(y).toUpperCase();

            if (x < y) return this.sortAsc ? -1 : 1;

            if (x > y) return this.sortAsc ? 1 : -1;

            return 0;

        });

        this.renderTable();

    },

    /**************************************************************************
     * UPDATE PAGE INFO
     **************************************************************************/
    updatePageInfo() {

        const totalPage =

            Math.max(

                1,

                Math.ceil(this.filterData.length / this.pageSize)

            );

        const pageInfo =

            document.getElementById("pageInfo");

        if (pageInfo) {

            pageInfo.innerHTML =

                `Page ${this.currentPage} / ${totalPage}`;

        }

    },

    /**************************************************************************
 * VIEW DETAIL AGUNAN
 **************************************************************************/
    view(no_agunan) {

        const data = this.data.find(item => item.no_agunan === no_agunan);

        if (!data) {

            alert("Data tidak ditemukan.");

            return;

        }

        const modal = document.getElementById("viewModal");
        const body = document.getElementById("modalBody");

        body.innerHTML = `

            <table class="detail-table">
                
                <tr>
                    <th width="240">No Agunan</th>
                    <td>${data.no_agunan}</td>
                </tr>

                <tr>
                    <th>Status Agunan</th>
                    <td>${this.getBadgeStatus(data.status_agunan)}</td>
                </tr>

                <tr>
                    <th>Jenis Dokumen</th>
                    <td>${data.jenis_dokumen}</td>
                </tr>

                <tr>
                    <th>Cabang</th>
                    <td>${data.kode_cabang}</td>
                </tr>

                <tr>
                    <th>CIF Debitur</th>
                    <td>${data.cif_debitur}</td>
                </tr>

                <tr>
                    <th>Nama Debitur</th>
                    <td>${data.nama_pemilik_agunan}</td>
                </tr>

                <tr>
                    <th>Rekening Fasilitas</th>
                    <td>${data.no_rek_fasilitas}</td>
                </tr>

                <tr>
                    <th>Status Dokumen</th>
                    <td>${data.status_dokumen}</td>
                </tr>

                <tr>
                    <th>Kode Jenis Agunan</th>
                    <td>${data.kode_jenis_agunan}</td>
                </tr>

                <tr>
                    <th>Bukti Kepemilikan</th>
                    <td>${data.bukti_kepemilikan}</td>
                </tr>

                <tr>
                    <th>Penyimpanan Agunan</th>
                    <td>${this.formatDate(data.penyimpanan_agunan)}</td>
                </tr>

                <tr>
                    <th>Alamat Agunan</th>
                    <td>${this.formatDate(data.alamat_agunan)}</td>
                </tr>

                <tr>
                    <th>RT / RW</th>
                    <td>${data.rt} / ${data.rw}</td>
                </tr>

                <tr>
                    <th>Kelurahan</th>
                    <td>${data.kelurahan}</td>
                </tr>

                <tr>
                    <th>Kecamatan</th>
                    <td>${data.kecamatan}</td>
                </tr>

                <tr>
                    <th>Kota/Kabupaten</th>
                    <td>${data.kota_kabupaten}</td>
                </tr>

                <tr>
                    <th>Provinsi</th>
                    <td>${data.provinsi} / ${data.kodepos}</td>
                </tr>

                <tr>
                    <th>Nilai NJOP</th>
                    <td>${data.nilai_njop}</td>
                </tr>

                <tr>
                    <th>Tanggal Penilaian Agunan</th>
                    <td>${this.formatDate(data.tanggal_penilaian_agunan)}</td>
                </tr>

                <tr>
                    <th>Jenis Penilaian</th>
                    <td>${data.jenis_penilaian}</td>
                </tr>

                <tr>
                    <th>Tanggal Penilaian Jatuh Tempo</th>
                    <td>${this.formatDate(data.tanggal_penilaian_jatuh_tempo)}</td>
                </tr>

                <tr>
                    <th>Status Paripasu</th>
                    <td>${data.status_paripasu}</td>
                </tr>

                <tr>
                    <th>Persentase Paripasu</th>
                    <td>${data.persentase_paripasu}</td>
                </tr>

                <tr>
                    <th>Joint Account</th>
                    <td>${data.joint_account}</td>
                </tr>

                <tr>
                    <th>Tanggal Awal Asuransi</th>
                    <td>${this.formatDate(data.tanggal_awal_asuransi)}</td>
                </tr>       
                
                <tr>
                    <th>Tanggal Jatuh Tempo Asuransi</th>
                    <td>${this.formatDate(data.tanggal_jatuh_tempo_asuransi)}</td>
                </tr>
                
                <tr>
                    <th>Produk</th>
                    <td>${data.produk}</td>
                </tr>
                
                <tr>
                    <th>Tanggal Pengikatan</th>
                    <td>${this.formatDate(data.tanggal_pengikatan)}</td>
                </tr>

                <tr>
                    <th>Lokasi Dokumen</th>
                    <td>${data.lokasi_document}</td>
                </tr>
                
                <tr>
                    <th>Tanggal Expired Appraisal</th>
                    <td>${this.formatDate(data.tanggal_expired_appraisal)}</td>
                </tr>

                <tr>
                    <th>Asli / Copy</th>
                    <td>${data.asli_copy}</td>
                </tr>

                <tr>
                    <th>Dokumen Description</th>
                    <td>${data.document_description}</td>
                </tr>

                <tr>
                    <th>Digital File</th>
                    <td>

                        <a href="${data.digital_file_link}"
                           target="_blank">

                            ${data.digital_file_link}

                        </a>

                    </td>
                </tr>

                <tr>
                    <th>Catatan Sesuka Bavi Lah</th>
                    <td>${data.catatan_tambahan}</td>
                </tr>

            </table>

        `;

        modal.classList.add("show");

    },

    /**************************************************************************
     * CLOSE MODAL
     **************************************************************************/
    closeModal() {

        document
            .getElementById("viewModal")
            .classList
            .remove("show");

    },

    /**************************************************************************
     * EDIT DATA
     **************************************************************************/
    edit(no_agunan) {

        window.location.href =
            "edit_agunan.html?id=" +
            encodeURIComponent(no_agunan);

    },

    /******************************************************************************
 * DELETE DATA
 ******************************************************************************/

async delete(no_agunan) {

    if (
        !confirm(
            "Yakin ingin menghapus data ini ?"
        )
    ) {

        return;

    }


    try {

        this.showLoading();


        /*
         * DELETE KE BACKEND
         */

        const result =
            await API.deleteAgunan(
                no_agunan
            );


        /*
         * REQUEST TERKIRIM
         */

        if (
            result &&
            result.success === true
        ) {

            /*
             * Tampilkan sukses
             */

            alert(
                "Data berhasil dihapus."
            );


            /*
             * JANGAN reload loadData()
             *
             * Karena GET getAgunan() bisa terkena
             * redirect / 404 setelah POST.
             *
             * Untuk sementara kita refresh halaman
             * secara penuh agar data terbaru tampil.
             */

            window.location.reload();

            return;

        }


        /*
         * GAGAL
         */

        alert(
            result?.message ||
            "Gagal menghapus data."
        );

    }
    catch (err) {

        console.error(
            "DELETE ERROR:",
            err
        );


        alert(
            err.message ||
            "Gagal menghapus data."
        );

    }
    finally {

        this.hideLoading();

    }

},

    /**************************************************************************
     * REGISTER MODAL
     **************************************************************************/
    registerModal() {

        document
            .getElementById("btnCloseModal")
            .addEventListener("click", () => {

                this.closeModal();

            });

        document
            .getElementById("viewModal")
            .addEventListener("click", (e) => {

                if (e.target.id === "viewModal") {

                    this.closeModal();

                }

            });

    },

    /**************************************************************************
     * DOUBLE CLICK ROW
     **************************************************************************/
    registerDoubleClick() {

        const tbody =
            document.querySelector("#tblAgunan tbody");

        tbody.addEventListener("dblclick", (e) => {

            const tr = e.target.closest("tr");

            if (!tr) return;

            const noAgunan =
                tr.dataset.id;

            if (!noAgunan) return;

            this.edit(noAgunan);

        });

    },

    /**************************************************************************
 * TOTAL PAGE
 **************************************************************************/
    getTotalPage() {

        return Math.max(

            1,

            Math.ceil(this.filterData.length / this.pageSize)

        );

    },

    /**************************************************************************
     * CHANGE PAGE
     **************************************************************************/
    changePage(page) {

        const totalPage = this.getTotalPage();

        if (page < 1) page = 1;

        if (page > totalPage) page = totalPage;

        this.currentPage = page;

        this.renderTable();

    },

    /**************************************************************************
     * SHOW LOADING
     **************************************************************************/
    showLoading() {

        const loading = document.getElementById("loading");

        if (loading) {

            loading.classList.add("show");

        }

    },

    /**************************************************************************
     * HIDE LOADING
     **************************************************************************/
    hideLoading() {

        const loading = document.getElementById("loading");

        if (loading) {

            loading.classList.remove("show");

        }

    },

    /**************************************************************************
     * REGISTER EVENT
     **************************************************************************/
    registerEvent() {
        // =====================================================
        // KEMBALI KE DASHBOARD
        // =====================================================

        const btnBack = document.getElementById("btnBack");

        if (btnBack) {

            btnBack.addEventListener("click", () => {

                window.location.href = "../dashboard.html";

            });

        }

        // =====================================================
        // SEARCH
        // =====================================================

        document
            .getElementById("txtSearch")
            .addEventListener("keyup", (e) => {

                this.search(e.target.value);

            });

        // =====================================================
        // REFRESH (Diperbaiki agar terasa gerakannya dan mereset filter)
        // =====================================================

        document
            .getElementById("btnRefresh")
            .addEventListener("click", async (e) => {

                const btn = e.currentTarget;

                btn.disabled = true;

                btn.innerHTML =
                    '<i class="fa-solid fa-spinner fa-spin"></i> Refreshing...';

                // Tambahkan jeda buatan setengah detik (500ms) agar animasi terlihat oleh mata
                await new Promise(resolve => setTimeout(resolve, 500));

                await this.loadData();

                // Kembalikan nilai filter dropdown dan search ke semula
                document.getElementById("txtSearch").value = "";
                document.getElementById("filterStatus").value = "";
                document.getElementById("filterCabang").value = "";
                document.getElementById("filterJenis").value = "";

                btn.innerHTML =
                    '<i class="fa-solid fa-rotate-right"></i> Refresh';

                btn.disabled = false;

            });

        // =====================================================
        // FILTER STATUS
        // =====================================================

        document
            .getElementById("filterStatus")
            .addEventListener("change", (e) => {

                this.filterStatus(e.target.value);

            });

        // =====================================================
        // FILTER CABANG
        // =====================================================

        document
            .getElementById("filterCabang")
            .addEventListener("change", (e) => {

                this.filterCabang(e.target.value);

            });

        // =====================================================
        // FILTER JENIS
        // =====================================================

        document
            .getElementById("filterJenis")
            .addEventListener("change", (e) => {

                this.filterJenis(e.target.value);

            });

        // =====================================================
        // PAGINATION
        // =====================================================

        document
            .getElementById("btnPrev")
            .addEventListener("click", () => {

                this.changePage(

                    this.currentPage - 1

                );

            });

        document
            .getElementById("btnNext")
            .addEventListener("click", () => {

                this.changePage(

                    this.currentPage + 1

                );

            });

        // =====================================================
        // MODAL
        // =====================================================

        this.registerModal();

        // =====================================================
        // DOUBLE CLICK
        // =====================================================

        this.registerDoubleClick();

        // =====================================================
        // TAMBAH AGUNAN
        // =====================================================

        const btnTambah =

            document.getElementById("btnTambah");

        if (btnTambah) {

            btnTambah.addEventListener("click", () => {

                window.location.href = "input.html";

            });

        }

    }

};

/******************************************************************************
 *
 * START APPLICATION
 *
 ******************************************************************************/

document.addEventListener(

    "DOMContentLoaded",

    () => {

        DATA_AGUNAN.init();

    }

);
