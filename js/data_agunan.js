/******************************************************************************
 *
 * DATA AGUNAN CUSTODY
 * FILE      : data_agunan.js
 * VERSION   : 1.0 FINAL
 *
 ******************************************************************************/

const DATA_AGUNAN = {

    /**************************************************************************
     * STATE
     **************************************************************************/

    /*
     * ================================================================
     * MASTER DATA
     * ================================================================
     *
     * Seluruh data yang diterima dari API.
     *
     * Contoh:
     * 1.500 data
     */

    data: [],


    /*
     * ================================================================
     * FILTER DATA
     * ================================================================
     *
     * Data setelah:
     *
     * - Search
     * - Status
     * - Cabang
     * - Jenis Dokumen
     * - Sorting
     *
     * Pagination TIDAK mengubah data ini.
     */

    filterData: [],


    /*
     * ================================================================
     * PAGINATION
     * ================================================================
     */

    currentPage: 1,

    pageSize: 100,


    /*
     * ================================================================
     * SORTING
     * ================================================================
     */

    sortColumn: "",

    sortAsc: true,


    /*
     * ================================================================
     * SEARCH DEBOUNCE
     * ================================================================
     */

    searchTimer: null,


    /*
     * ================================================================
     * FILTER STATE
     * ================================================================
     */

    filters: {

        search: "",

        status: "",

        cabang: "",

        jenis: ""

    },

    /*
 * ================================================================
 * INITIALIZATION
 * ================================================================
 */

    async init() {

        console.log(
            "DATA_AGUNAN: Initializing..."
        );


        /*
         * ============================================================
         * REGISTER EVENT
         * ============================================================
         */

        this.registerEvent();


        /*
         * ============================================================
         * REGISTER MODAL EVENT
         * ============================================================
         */

        this.registerModal();


        /*
         * ============================================================
         * ROLE / PERMISSION
         * ============================================================
         */



        /*
         * ============================================================
         * LOAD DATA
         * ============================================================
         */

        await this.loadData();

    },

    /**************************************************************************
     * LOAD DATA
     **************************************************************************/

    async loadData() {

        console.log(
            "DATA_AGUNAN: Loading data..."
        );


        /*
         * ================================================================
         * LOADING STATE
         * ================================================================
         */

        this.setLoading(
            true
        );


        try {

            /*
             * ============================================================
             * API REQUEST
             * ============================================================
             */

            const response =
                await API.getAgunan();


            console.log(
                "DATA_AGUNAN API RESPONSE:",
                response
            );


            /*
             * ============================================================
             * VALIDASI RESPONSE
             * ============================================================
             */

            if (
                !response ||
                response.success !== true
            ) {

                throw new Error(
                    response?.message ||
                    "Gagal mengambil data agunan."
                );

            }


            /*
             * ============================================================
             * NORMALISASI DATA
             * ============================================================
             */

            const rows =
                Array.isArray(
                    response.data
                )
                    ? response.data
                    : [];

            /*
             * ============================================================
             * MASTER DATA
             * ============================================================
             */

            this.data =
                rows;

            console.log(
                "DATA_AGUNAN SAMPLE ROW:",
                this.data[0]
            );


            /*
             * ============================================================
             * FILTER DATA
             * ============================================================
             *
             * Pada saat pertama kali load,
             * seluruh data ditampilkan.
             */

            this.filterData =
                [
                    ...this.data
                ];


            /*
             * ============================================================
             * LOAD FILTER OPTIONS
             * ============================================================
             */

            this.loadFilterCabang();
            this.loadFilterJenis();

            /*
             * ============================================================
             * RESET TABLE STATE
             * ============================================================
             */

            this.currentPage =
                1;

            this.sortColumn =
                "";

            this.sortAsc =
                true;


            /*
             * ============================================================
             * LOG DATA
             * ============================================================
             */

            console.log(
                "DATA_AGUNAN TOTAL DATA:",
                this.data.length
            );


            /*
             * ============================================================
             * UPDATE KPI
             * ============================================================
             */

            this.loadKPI();


            /*
             * ============================================================
             * RENDER TABLE
             * ============================================================
             */

            this.renderTable();


            /*
             * ============================================================
             * UPDATE PAGE INFO
             * ============================================================
             */

            if (
                typeof this.updatePageInfo ===
                "function"
            ) {

                this.updatePageInfo();

            }


            /*
             * ============================================================
             * UPDATE PAGE NUMBERS
             * ============================================================
             */

            if (
                typeof this.renderPageNumbers ===
                "function"
            ) {

                this.renderPageNumbers();

            }


            /*
             * ============================================================
             * UPDATE SORT INDICATOR
             * ============================================================
             */

            if (
                typeof this.updateSortIndicators ===
                "function"
            ) {

                this.updateSortIndicators();

            }


            /*
             * ============================================================
             * SUCCESS
             * ============================================================
             */

            console.log(
                "DATA_AGUNAN: Data loaded successfully."
            );


        }
        catch (
        error
        ) {

            console.error(
                "DATA_AGUNAN LOAD ERROR:",
                error
            );


            /*
             * ============================================================
             * RESET DATA
             * ============================================================
             */

            this.data =
                [];

            this.filterData =
                [];

            this.currentPage =
                1;


            /*
             * ============================================================
             * RESET TABLE
             * ============================================================
             */

            this.renderTable();


            /*
             * ============================================================
             * ERROR MESSAGE
             * ============================================================
             */

            this.showError(
                error.message ||
                "Gagal mengambil data agunan."
            );

        }
        finally {

            /*
             * ============================================================
             * STOP LOADING
             * ============================================================
             */

            this.setLoading(
                false
            );

        }

    },

    /**************************************************************************
 * SET LOADING STATE
 **************************************************************************/

    setLoading(
        loading
    ) {

        /*
         * ================================================================
         * REFRESH BUTTON
         * ================================================================
         */

        const refreshButton =
            document.getElementById(
                "btnRefresh"
            );


        if (
            refreshButton
        ) {

            if (
                loading
            ) {

                refreshButton.disabled =
                    true;

                refreshButton.innerHTML =
                    `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Loading...
                `;

            }
            else {

                refreshButton.disabled =
                    false;

                refreshButton.innerHTML =
                    `
                <i class="fa-solid fa-rotate-right"></i>
                Refresh
                `;

            }

        }


        /*
         * ================================================================
         * TABLE LOADING
         * ================================================================
         */

        const tbody =
            document.querySelector(
                "#dataTable tbody"
            );


        if (
            loading &&
            tbody
        ) {

            tbody.innerHTML =
                `
            <tr>

                <td
                    colspan="100%"
                    class="table-loading"
                >

                    <div class="table-loading-content">

                        <i
                            class="fa-solid
                                   fa-spinner
                                   fa-spin"
                        ></i>

                        <span>
                            Memuat data...
                        </span>

                    </div>

                </td>

            </tr>
            `;

        }

    },

    /**************************************************************************
 * SHOW DATA ERROR
 **************************************************************************/

    showError(
        message
    ) {

        const tbody =
            document.querySelector(
                "#dataTable tbody"
            );


        if (
            !tbody
        ) {

            return;

        }


        tbody.innerHTML =
            `
        <tr>

            <td
                colspan="100%"
                class="table-error"
            >

                <div class="table-error-content">

                    <i
                        class="fa-solid
                               fa-triangle-exclamation"
                    ></i>

                    <span>
                        ${this.escapeHtml(
                message ||
                "Gagal memuat data."
            )}
                    </span>

                </div>

            </td>

        </tr>
        `;

    },

    /**************************************************************************
 * SEARCH REALTIME
 **************************************************************************/

    search(keyword) {

        /*
         * ================================================================
         * SIMPAN KEYWORD
         * ================================================================
         */

        this.filters.search =
            String(
                keyword || ""
            )
                .trim();


        /*
         * ================================================================
         * CLEAR TIMER SEBELUMNYA
         * ================================================================
         */

        if (
            this.searchTimer
        ) {

            clearTimeout(
                this.searchTimer
            );

        }


        /*
         * ================================================================
         * DEBOUNCE
         * ================================================================
         *
         * Tunggu 250ms setelah user berhenti mengetik.
         */

        this.searchTimer =
            setTimeout(
                () => {

                    this.applyFilters();

                },
                250
            );

    },

    /**************************************************************************
 * FILTER STATUS
 **************************************************************************/

    filterStatus(
        status
    ) {

        this.filters.status =
            String(
                status || ""
            )
                .trim();


        this.applyFilters();

    },

    /**************************************************************************
 * FILTER CABANG
 **************************************************************************/

    filterCabang(
        cabang
    ) {

        this.filters.cabang =
            String(
                cabang || ""
            )
                .trim();


        this.applyFilters();

    },

    /**************************************************************************
     * FILTER JENIS DOKUMEN
     **************************************************************************/

    filterJenis(
        jenis
    ) {

        this.filters.jenis =
            String(
                jenis || ""
            )
                .trim();


        this.applyFilters();

    },

    /**************************************************************************
 * REGISTER EVENT
 **************************************************************************/

    registerEvent() {

        /*
         * ================================================================
         * KEMBALI KE DASHBOARD
         * ================================================================
         */

        const btnBack =
            document.getElementById(
                "btnBack"
            );


        if (
            btnBack
        ) {

            btnBack.addEventListener(
                "click",
                () => {

                    window.location.href =
                        "../dashboard.html";

                }
            );

        }


        /*
         * ================================================================
         * SEARCH
         * ================================================================
         */

        const txtSearch =
            document.getElementById(
                "txtSearch"
            );


        if (
            txtSearch
        ) {

            txtSearch.addEventListener(
                "input",
                event => {

                    this.search(
                        event.target.value
                    );

                }
            );

        }


        /*
         * ================================================================
         * REFRESH
         * ================================================================
         */

        const btnRefresh =
            document.getElementById(
                "btnRefresh"
            );


        if (
            btnRefresh
        ) {

            btnRefresh.addEventListener(
                "click",
                async () => {

                    /*
                     * ============================================================
                     * AMBIL DATA TERBARU
                     * ============================================================
                     */

                    await this.loadData();


                    /*
                     * ============================================================
                     * RESET VIEW
                     * ============================================================
                     */

                    this.refreshView();

                }
            );

        }


        /*
         * ================================================================
         * FILTER STATUS
         * ================================================================
         */

        const filterStatus =
            document.getElementById(
                "filterStatus"
            );


        if (
            filterStatus
        ) {

            filterStatus.addEventListener(
                "change",
                event => {

                    this.filterStatus(
                        event.target.value
                    );

                }
            );

        }


        /*
         * ================================================================
         * FILTER CABANG
         * ================================================================
         */

        const filterCabang =
            document.getElementById(
                "filterCabang"
            );


        if (
            filterCabang
        ) {

            filterCabang.addEventListener(
                "change",
                event => {

                    this.filterCabang(
                        event.target.value
                    );

                }
            );

        }


        /*
         * ================================================================
         * FILTER JENIS
         * ================================================================
         */

        const filterJenis =
            document.getElementById(
                "filterJenis"
            );


        if (
            filterJenis
        ) {

            filterJenis.addEventListener(
                "change",
                event => {

                    this.filterJenis(
                        event.target.value
                    );

                }
            );

        }


        /*
         * ================================================================
         * PREVIOUS
         * ================================================================
         */

        const btnPrev =
            document.getElementById(
                "btnPrev"
            );


        if (
            btnPrev
        ) {

            btnPrev.addEventListener(
                "click",
                () => {

                    this.changePage(
                        this.currentPage - 1
                    );

                }
            );

        }


        /*
         * ================================================================
         * NEXT
         * ================================================================
         */

        const btnNext =
            document.getElementById(
                "btnNext"
            );


        if (
            btnNext
        ) {

            btnNext.addEventListener(
                "click",
                () => {

                    this.changePage(
                        this.currentPage + 1
                    );

                }
            );

        }

        /*
         * ================================================================
         * PAGE SIZE
         * ================================================================
         */

        const pageSizeSelect =
            document.getElementById(
                "pageSizeSelect"
            );


        if (
            pageSizeSelect
        ) {

            pageSizeSelect.addEventListener(
                "change",
                event => {

                    this.changePageSize(
                        event.target.value
                    );

                }
            );

        }


        /*
* ================================================================
* MODAL
* ================================================================
*/

        this.registerModal();


        /*
         * ================================================================
         * DOUBLE CLICK
         * ================================================================
         */

        this.registerDoubleClick();


        /*
         * ================================================================
         * TABLE ACTION
         * ================================================================
         */

        this.registerTableAction();


        /*
         * ================================================================
         * SORT EVENT
         * ================================================================
         */

        this.registerSortEvents();


        /*
         * ================================================================
         * TAMBAH AGUNAN
         * ================================================================
         */

        const btnTambah =
            document.getElementById(
                "btnTambah"
            );


        if (
            btnTambah
        ) {

            btnTambah.addEventListener(
                "click",
                () => {

                    window.location.href =
                        "input.html";

                }
            );

        }

    },

    /**************************************************************************
 * RESET TABLE STATE
 **************************************************************************/

    resetTableState() {

        /*
         * ================================================================
         * PAGINATION
         * ================================================================
         */

        this.currentPage =
            1;


        /*
         * ================================================================
         * PAGE SIZE
         * ================================================================
         *
         * Default = 100 data per halaman.
         */

        this.pageSize =
            100;


        /*
         * ================================================================
         * SORTING
         * ================================================================
         */

        this.sortColumn =
            "";

        this.sortAsc =
            true;


        /*
         * ================================================================
         * FILTER STATE
         * ================================================================
         */

        this.filters = {

            search: "",

            status: "",

            cabang: "",

            jenis: ""

        };


        /*
         * ================================================================
         * SEARCH TIMER
         * ================================================================
         */

        if (
            this.searchTimer
        ) {

            clearTimeout(
                this.searchTimer
            );

            this.searchTimer =
                null;

        }

    },

    /**************************************************************************
 * RESET FILTER UI
 **************************************************************************/

    resetFilterUI() {

        /*
         * ================================================================
         * SEARCH
         * ================================================================
         */

        const txtSearch =
            document.getElementById(
                "txtSearch"
            );


        if (
            txtSearch
        ) {

            txtSearch.value =
                "";

        }


        /*
         * ================================================================
         * STATUS
         * ================================================================
         */

        const filterStatus =
            document.getElementById(
                "filterStatus"
            );


        if (
            filterStatus
        ) {

            filterStatus.value =
                "";

        }


        /*
         * ================================================================
         * CABANG
         * ================================================================
         */

        const filterCabang =
            document.getElementById(
                "filterCabang"
            );


        if (
            filterCabang
        ) {

            filterCabang.value =
                "";

        }


        /*
         * ================================================================
         * JENIS DOKUMEN
         * ================================================================
         */

        const filterJenis =
            document.getElementById(
                "filterJenis"
            );


        if (
            filterJenis
        ) {

            filterJenis.value =
                "";

        }

    },

    /**************************************************************************
 * REFRESH VIEW
 **************************************************************************/

    refreshView() {

        /*
         * ================================================================
         * RESET STATE
         * ================================================================
         */

        this.resetTableState();


        /*
         * ================================================================
         * RESET FILTER UI
         * ================================================================
         */

        this.resetFilterUI();


        /*
         * ================================================================
         * RESET FILTER DATA
         * ================================================================
         */

        this.filterData =
            [
                ...this.data
            ];


        /*
         * ================================================================
         * UPDATE KPI
         * ================================================================
         */

        this.loadKPI();


        /*
         * ================================================================
         * RENDER TABLE
         * ================================================================
         */

        this.renderTable();


        /*
         * ================================================================
         * UPDATE PAGINATION INFO
         * ================================================================
         */

        if (
            typeof this.updatePageInfo ===
            "function"
        ) {

            this.updatePageInfo();

        }


        /*
         * ================================================================
         * UPDATE PAGE NUMBER
         * ================================================================
         */

        if (
            typeof this.renderPageNumbers ===
            "function"
        ) {

            this.renderPageNumbers();

        }


        /*
         * ================================================================
         * UPDATE SORT INDICATOR
         * ================================================================
         */

        if (
            typeof this.updateSortIndicators ===
            "function"
        ) {

            this.updateSortIndicators();

        }


        /*
         * ================================================================
         * SCROLL TABLE KE ATAS
         * ================================================================
         */

        const tableContainer =
            document.querySelector(
                ".table-container"
            );


        if (
            tableContainer
        ) {

            tableContainer.scrollTo({

                top: 0,

                behavior: "smooth"

            });

        }

    },

    /**************************************************************************
 * LOAD FILTER CABANG
 **************************************************************************/

    loadFilterCabang() {

        const select =
            document.getElementById(
                "filterCabang"
            );


        if (
            !select
        ) {

            return;

        }


        /*
         * ================================================================
         * RESET OPTION
         * ================================================================
         */

        select.innerHTML =
            `
            <option value="">
                Semua Cabang
            </option>
            `;


        /*
         * ================================================================
         * AMBIL CABANG DARI SELURUH DATA
         * ================================================================
         */

        const cabangList =
            [
                ...new Set(

                    this.data
                        .map(
                            item =>
                                String(
                                    item?.kode_cabang ??
                                    ""
                                )
                                    .trim()
                        )
                        .filter(
                            value =>
                                value !== ""
                        )

                )
            ];


        /*
         * ================================================================
         * SORT
         * ================================================================
         */

        cabangList.sort(
            (
                a,
                b
            ) =>
                a.localeCompare(
                    b,
                    "id",
                    {
                        sensitivity:
                            "base"
                    }
                )
        );


        /*
         * ================================================================
         * MASUKKAN KE DROPDOWN
         * ================================================================
         */

        cabangList.forEach(
            cabang => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    cabang;


                option.textContent =
                    cabang;


                select.appendChild(
                    option
                );

            }
        );


        console.log(
            "DATA_AGUNAN FILTER CABANG:",
            cabangList
        );

    },

    /**************************************************************************
 * LOAD FILTER JENIS DOKUMEN
 **************************************************************************/

    loadFilterJenis() {

        const select =
            document.getElementById(
                "filterJenis"
            );


        if (
            !select
        ) {

            return;

        }


        /*
         * ================================================================
         * RESET OPTION
         * ================================================================
         */

        select.innerHTML =
            `
            <option value="">
                Semua Jenis
            </option>
            `;


        /*
         * ================================================================
         * AMBIL JENIS DOKUMEN DARI SELURUH DATA
         * ================================================================
         */

        const jenisList =
            [
                ...new Set(

                    this.data
                        .map(
                            item =>
                                String(
                                    item?.jenis_dokumen ??
                                    ""
                                )
                                    .trim()
                        )
                        .filter(
                            value =>
                                value !== ""
                        )

                )
            ];


        /*
         * ================================================================
         * SORT
         * ================================================================
         */

        jenisList.sort(
            (
                a,
                b
            ) =>
                a.localeCompare(
                    b,
                    "id",
                    {
                        sensitivity:
                            "base"
                    }
                )
        );


        /*
         * ================================================================
         * MASUKKAN KE DROPDOWN
         * ================================================================
         */

        jenisList.forEach(
            jenis => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    jenis;


                option.textContent =
                    jenis;


                select.appendChild(
                    option
                );

            }
        );


        console.log(
            "DATA_AGUNAN FILTER JENIS:",
            jenisList
        );

    },

    /**************************************************************************
 * RENDER TABLE
 **************************************************************************/

    renderTable() {

        /*
         * ================================================================
         * AMBIL TBODY
         * ================================================================
         */

        const tbody =
            document.querySelector(
                "#dataTable tbody"
            );


        /*
         * Jika tbody tidak ditemukan,
         * hentikan proses.
         */

        if (
            !tbody
        ) {

            console.warn(
                "DATA_AGUNAN: #dataTable tbody tidak ditemukan."
            );

            return;

        }


        /*
         * ================================================================
         * NORMALISASI DATA
         * ================================================================
         */

        const data =
            Array.isArray(
                this.filterData
            )
                ? this.filterData
                : [];


        /*
         * ================================================================
         * TOTAL DATA
         * ================================================================
         */

        const totalData =
            data.length;


        /*
         * ================================================================
         * PAGE SIZE
         * ================================================================
         */

        const pageSize =
            Number(
                this.pageSize
            ) > 0
                ? Number(
                    this.pageSize
                )
                : 100;


        /*
         * ================================================================
         * TOTAL PAGE
         * ================================================================
         */

        const totalPage =
            Math.max(
                1,
                Math.ceil(
                    totalData /
                    pageSize
                )
            );


        /*
         * ================================================================
         * VALIDASI CURRENT PAGE
         * ================================================================
         */

        if (
            this.currentPage < 1
        ) {

            this.currentPage =
                1;

        }


        if (
            this.currentPage >
            totalPage
        ) {

            this.currentPage =
                totalPage;

        }


        /*
         * ================================================================
         * EMPTY DATA
         * ================================================================
         */

        if (
            totalData === 0
        ) {

            tbody.innerHTML =
                `
            <tr>

                <td
                    colspan="100%"
                    class="table-empty"
                >

                    <div class="table-empty-content">

                        <i
                            class="fa-solid
                                   fa-folder-open"
                        ></i>

                        <div>

                            <strong>
                                Tidak ada data
                            </strong>

                            <span>
                                Tidak ditemukan data
                                sesuai filter yang dipilih.
                            </span>

                        </div>

                    </div>

                </td>

            </tr>
            `;


            /*
             * Update pagination walaupun
             * tidak ada data.
             */

            this.updatePageInfo();


            if (
                typeof this.renderPageNumbers ===
                "function"
            ) {

                this.renderPageNumbers();

            }


            return;

        }


        /*
         * ================================================================
         * HITUNG RANGE DATA
         * ================================================================
         */

        const start =
            (
                this.currentPage -
                1
            ) *
            pageSize;


        const end =
            Math.min(
                start +
                pageSize,
                totalData
            );


        /*
         * ================================================================
         * AMBIL DATA UNTUK HALAMAN AKTIF
         * ================================================================
         *
         * HANYA DATA INI YANG DIRENDER.
         */

        const pageData =
            data.slice(
                start,
                end
            );


        /*
         * ================================================================
         * BUILD HTML SEKALIGUS
         * ================================================================
         *
         * Jangan menggunakan:
         *
         * tbody.innerHTML += ...
         *
         * berulang kali.
         *
         * Kita build satu string,
         * kemudian inject satu kali.
         */

        let html =
            "";


        pageData.forEach(
            (
                item,
                index
            ) => {

                /*
                 * ========================================================
                 * NOMOR ROW GLOBAL
                 * ========================================================
                 *
                 * Page 1:
                 * 1 - 100
                 *
                 * Page 2:
                 * 101 - 200
                 */

                const rowNumber =
                    start +
                    index +
                    1;


                /*
                 * ========================================================
                 * ACTION BUTTON
                 * ========================================================
                 */

                let actionHtml =
                    "";


                if (
                    typeof this.renderActionButton ===
                    "function"
                ) {

                    actionHtml =
                        this.renderActionButton(
                            item
                        );

                }


                /*
                 * ========================================================
                 * BUILD ROW
                 * ========================================================
                 */

                html +=
                    `
                <tr
                        data-no-agunan="${this.escapeHtml(
                        item.no_agunan
                    )}"
                >

                    <td class="text-center">
                        ${rowNumber}
                    </td>

                    <td>
                        ${this.escapeHtml(
                        item.jenis_dokumen
                    )}
                    </td>

                    <td>
                        ${this.escapeHtml(
                        item.kode_cabang
                    )}
                    </td>

                    <td>
                        ${this.escapeHtml(
                        item.no_agunan
                    )}
                    </td>

                    <td>
                        ${this.escapeHtml(
                        item.cif_debitur
                    )}
                    </td>

                    <td>
                        ${this.escapeHtml(
                        item.nama_pemilik_agunan
                    )}
                    </td>

                    <td>
                        ${this.escapeHtml(
                        item.kode_jenis_agunan
                    )}
                    </td>

                    <td>
                        ${this.getStatusBadge(
                        item.status_agunan
                    )}
                    </td>

                    <td>
                        ${this.renderAppraisalIndicator(
                        item.tanggal_expired_appraisal
                    )}
                    </td>

                    <td>
                        ${actionHtml}
                    </td>

                </tr>
                `;

            }
        );


        /*
         * ================================================================
         * INJECT SEKALI
         * ================================================================
         */

        tbody.innerHTML =
            html;


        /*
         * ================================================================
         * UPDATE PAGINATION
         * ================================================================
         */

        this.updatePageInfo();


        if (
            typeof this.renderPageNumbers ===
            "function"
        ) {

            this.renderPageNumbers();

        }

    },

    /**************************************************************************
 * ESCAPE HTML
 **************************************************************************/

    escapeHtml(
        value
    ) {

        if (
            value === null ||
            value === undefined
        ) {

            return "";

        }


        return String(
            value
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

    },

    /**************************************************************************
 * STATUS BADGE
 **************************************************************************/

    getStatusBadge(
        status
    ) {

        const value =
            String(
                status || ""
            )
                .trim()
                .toUpperCase();


        let label =
            value;


        let className =
            "status-default";


        switch (
        value
        ) {

            case "A":

                label =
                    "AKTIF";

                className =
                    "status-active";

                break;


            case "E":

                label =
                    "EXPIRED";

                className =
                    "status-expired";

                break;


            case "D":

                label =
                    "NONAKTIF";

                className =
                    "status-inactive";

                break;


            case "BL":

                label =
                    "BELUM LENGKAP";

                className =
                    "status-incomplete";

                break;

        }


        return `
        <span
            class="status-badge ${className}"
        >
            ${this.escapeHtml(label)}
        </span>
    `;

    },

    /**************************************************************************
     * GET TOTAL PAGE
     **************************************************************************/

    getTotalPage() {

        /*
         * ================================================================
         * TOTAL DATA
         * ================================================================
         */

        const totalData =
            Array.isArray(
                this.filterData
            )
                ? this.filterData.length
                : 0;


        /*
         * ================================================================
         * PAGE SIZE
         * ================================================================
         */

        const pageSize =
            Number(
                this.pageSize
            ) > 0
                ? Number(
                    this.pageSize
                )
                : 100;


        /*
         * ================================================================
         * TOTAL PAGE
         * ================================================================
         */

        return Math.max(
            1,
            Math.ceil(
                totalData /
                pageSize
            )
        );

    },

    /**************************************************************************
     * CHANGE PAGE
     **************************************************************************/

    changePage(
        page
    ) {

        /*
         * ================================================================
         * TOTAL PAGE
         * ================================================================
         */

        const totalPage =
            this.getTotalPage();


        /*
         * ================================================================
         * NORMALIZE PAGE
         * ================================================================
         */

        let targetPage =
            Number(
                page
            );


        if (
            !Number.isFinite(
                targetPage
            )
        ) {

            return;

        }


        targetPage =
            Math.floor(
                targetPage
            );


        /*
         * ================================================================
         * BATASI RANGE
         * ================================================================
         */

        if (
            targetPage < 1
        ) {

            targetPage =
                1;

        }


        if (
            targetPage >
            totalPage
        ) {

            targetPage =
                totalPage;

        }


        /*
         * ================================================================
         * JIKA HALAMAN SAMA
         * ================================================================
         */

        if (
            targetPage ===
            this.currentPage
        ) {

            return;

        }


        /*
         * ================================================================
         * UPDATE CURRENT PAGE
         * ================================================================
         */

        this.currentPage =
            targetPage;


        /*
         * ================================================================
         * RENDER TABLE
         * ================================================================
         */

        this.renderTable();


        /*
         * ================================================================
         * UPDATE PAGE INFO
         * ================================================================
         */

        this.updatePageInfo();


        /*
         * ================================================================
         * UPDATE PAGE NUMBERS
         * ================================================================
         */

        if (
            typeof this.renderPageNumbers ===
            "function"
        ) {

            this.renderPageNumbers();

        }


        /*
         * ================================================================
         * SCROLL TABLE KE ATAS
         * ================================================================
         */

        const tableContainer =
            document.querySelector(
                ".table-container"
            );


        if (
            tableContainer
        ) {

            tableContainer.scrollTo({

                top: 0,

                behavior: "smooth"

            });

        }

    },

    /**************************************************************************
     * RENDER PAGE NUMBERS
     **************************************************************************/

    renderPageNumbers() {

        /*
         * ================================================================
         * CONTAINER
         * ================================================================
         */

        const container =
            document.getElementById(
                "pageNumbers"
            );


        /*
         * Jika element belum tersedia,
         * jangan menyebabkan error.
         */

        if (
            !container
        ) {

            return;

        }


        /*
         * ================================================================
         * TOTAL DATA
         * ================================================================
         */

        const totalData =
            Array.isArray(
                this.filterData
            )
                ? this.filterData.length
                : 0;


        /*
         * ================================================================
         * TOTAL PAGE
         * ================================================================
         */

        const totalPage =
            this.getTotalPage();


        /*
         * ================================================================
         * CLEAR
         * ================================================================
         */

        container.innerHTML =
            "";


        /*
         * ================================================================
         * JIKA TIDAK ADA DATA
         * ================================================================
         */

        if (
            totalData === 0
        ) {

            return;

        }


        /*
         * ================================================================
         * MAX VISIBLE PAGE
         * ================================================================
         *
         * Contoh:
         *
         * 1 2 3 4 5 ... 15
         *
         */

        const maxVisible =
            5;


        /*
         * ================================================================
         * HELPER BUAT BUTTON
         * ================================================================
         */

        const createPageButton =
            (
                page,
                active = false
            ) => {

                const button =
                    document.createElement(
                        "button"
                    );


                button.type =
                    "button";


                button.className =
                    "page-number" +
                    (
                        active
                            ? " active"
                            : ""
                    );


                button.textContent =
                    page;


                button.addEventListener(
                    "click",
                    () => {

                        this.changePage(
                            page
                        );

                    }
                );


                return button;

            };


        /*
         * ================================================================
         * TOTAL PAGE <= 5
         * ================================================================
         */

        if (
            totalPage <=
            maxVisible
        ) {

            for (
                let page = 1;
                page <= totalPage;
                page++
            ) {

                container.appendChild(
                    createPageButton(
                        page,
                        page ===
                        this.currentPage
                    )
                );

            }


            return;

        }


        /*
         * ================================================================
         * PAGE 1
         * ================================================================
         */

        container.appendChild(
            createPageButton(
                1,
                this.currentPage === 1
            )
        );


        /*
         * ================================================================
         * CURRENT PAGE RANGE
         * ================================================================
         */

        let startPage =
            Math.max(
                2,
                this.currentPage - 1
            );


        let endPage =
            Math.min(
                totalPage - 1,
                this.currentPage + 1
            );


        /*
         * ================================================================
         * ELLIPSIS AWAL
         * ================================================================
         */

        if (
            startPage > 2
        ) {

            const dots =
                document.createElement(
                    "span"
                );


            dots.className =
                "page-ellipsis";


            dots.textContent =
                "...";


            container.appendChild(
                dots
            );

        }


        /*
         * ================================================================
         * PAGE RANGE
         * ================================================================
         */

        for (
            let page = startPage;
            page <= endPage;
            page++
        ) {

            container.appendChild(
                createPageButton(
                    page,
                    page ===
                    this.currentPage
                )
            );

        }


        /*
         * ================================================================
         * ELLIPSIS AKHIR
         * ================================================================
         */

        if (
            endPage <
            totalPage - 1
        ) {

            const dots =
                document.createElement(
                    "span"
                );


            dots.className =
                "page-ellipsis";


            dots.textContent =
                "...";


            container.appendChild(
                dots
            );

        }


        /*
         * ================================================================
         * LAST PAGE
         * ================================================================
         */

        container.appendChild(
            createPageButton(
                totalPage,
                this.currentPage ===
                totalPage
            )
        );

    },

    /**************************************************************************
 * CHANGE PAGE SIZE
 **************************************************************************/

    changePageSize(
        value
    ) {

        /*
         * ================================================================
         * NORMALIZE
         * ================================================================
         */

        const newSize =
            Number(
                value
            );


        /*
         * ================================================================
         * VALIDASI
         * ================================================================
         */

        const allowedSizes = [
            50,
            100,
            250,
            500
        ];


        if (
            !allowedSizes.includes(
                newSize
            )
        ) {

            return;

        }


        /*
         * ================================================================
         * UPDATE PAGE SIZE
         * ================================================================
         */

        this.pageSize =
            newSize;


        /*
         * ================================================================
         * KEMBALI PAGE 1
         * ================================================================
         */

        this.currentPage =
            1;


        /*
         * ================================================================
         * RENDER
         * ================================================================
         */

        this.renderTable();


        this.updatePageInfo();


        this.renderPageNumbers();


        /*
         * ================================================================
         * SCROLL KE ATAS
         * ================================================================
         */

        const tableContainer =
            document.querySelector(
                ".table-container"
            );


        if (
            tableContainer
        ) {

            tableContainer.scrollTo({

                top: 0,

                behavior: "smooth"

            });

        }

    },

    /**************************************************************************
 * NORMALIZE SORT VALUE
 **************************************************************************/

    normalizeSortValue(
        value
    ) {

        /*
         * ================================================================
         * NULL / UNDEFINED
         * ================================================================
         */

        if (
            value === null ||
            value === undefined
        ) {

            return "";

        }


        /*
         * ================================================================
         * STRING
         * ================================================================
         */

        return String(
            value
        )
            .trim()
            .toLowerCase();

    },

    /**************************************************************************
 * REGISTER SORT EVENT
 **************************************************************************/

    registerSortEvents() {

        const headers =
            document.querySelectorAll(
                "#dataTable thead th[data-sort]"
            );


        headers.forEach(
            header => {

                header.addEventListener(
                    "click",
                    () => {

                        const column =
                            header.dataset.sort;


                        this.sortTable(
                            column
                        );

                    }
                );

            }
        );

    },

    /**************************************************************************
 * UPDATE SORT INDICATOR
 **************************************************************************/

    updateSortIndicators() {

        const headers =
            document.querySelectorAll(
                "#dataTable thead th[data-sort]"
            );


        headers.forEach(
            header => {

                /*
                 * ============================================================
                 * COLUMN
                 * ============================================================
                 */

                const column =
                    header.dataset.sort;


                /*
                 * ============================================================
                 * REMOVE CLASS
                 * ============================================================
                 */

                header.classList.remove(
                    "sort-active",
                    "sort-asc",
                    "sort-desc"
                );


                /*
                 * ============================================================
                 * REMOVE ICON LAMA
                 * ============================================================
                 */

                const oldIcon =
                    header.querySelector(
                        ".sort-icon"
                    );


                if (
                    oldIcon
                ) {

                    oldIcon.remove();

                }


                /*
                 * ============================================================
                 * COLUMN AKTIF
                 * ============================================================
                 */

                if (
                    column !==
                    this.sortColumn
                ) {

                    return;

                }


                /*
                 * ============================================================
                 * CLASS AKTIF
                 * ============================================================
                 */

                header.classList.add(
                    "sort-active"
                );


                header.classList.add(
                    this.sortAsc
                        ? "sort-asc"
                        : "sort-desc"
                );


                /*
                 * ============================================================
                 * ICON
                 * ============================================================
                 */

                const icon =
                    document.createElement(
                        "i"
                    );


                icon.className =
                    this.sortAsc
                        ? "fa-solid fa-arrow-up sort-icon"
                        : "fa-solid fa-arrow-down sort-icon";


                header.appendChild(
                    icon
                );

            }
        );

    },

    /**************************************************************************
 * APPLY ALL FILTERS
 **************************************************************************/

    applyFilters() {

        /*
         * ================================================================
         * NORMALIZE FILTER
         * ================================================================
         */

        const search =
            String(
                this.filters.search || ""
            )
                .toLowerCase()
                .trim();


        const status =
            String(
                this.filters.status || ""
            )
                .toUpperCase()
                .trim();


        const cabang =
            String(
                this.filters.cabang || ""
            )
                .toUpperCase()
                .trim();


        const jenis =
            String(
                this.filters.jenis || ""
            )
                .toUpperCase()
                .trim();


        /*
         * ================================================================
         * STATUS MAP
         * ================================================================
         */

        const statusMap = {

            "AKTIF":
                "A",

            "EXPIRED":
                "E",

            "NONAKTIF":
                "D",

            "BELUM LENGKAP":
                "BL"

        };


        const statusCode =
            statusMap[status] || "";


        /*
         * ================================================================
         * FILTER DARI MASTER DATA
         * ================================================================
         *
         * SELALU mulai dari this.data.
         *
         * Jangan menggunakan this.filterData sebagai
         * sumber filter berikutnya.
         */

        this.filterData =
            this.data.filter(
                item => {

                    /*
                     * ====================================================
                     * SEARCH
                     * ====================================================
                     */

                    const searchableText = [

                        item.no_agunan,

                        item.cif_debitur,

                        item.nama_pemilik_agunan,

                        item.kode_jenis_agunan,

                        item.jenis_pengikatan,

                        item.kode_cabang,

                        item.jenis_dokumen,

                        item.status_agunan

                    ]
                        .map(
                            value =>
                                String(
                                    value || ""
                                )
                                    .toLowerCase()
                        )
                        .join(" ");


                    const matchSearch =
                        !search ||
                        searchableText.includes(
                            search
                        );


                    /*
                     * ====================================================
                     * STATUS
                     * ====================================================
                     */

                    const matchStatus =
                        !statusCode ||
                        String(
                            item.status_agunan || ""
                        )
                            .toUpperCase()
                            .trim() ===
                        statusCode;


                    /*
                     * ====================================================
                     * CABANG
                     * ====================================================
                     */

                    const matchCabang =
                        !cabang ||
                        String(
                            item.kode_cabang || ""
                        )
                            .toUpperCase()
                            .trim() ===
                        cabang;


                    /*
                     * ====================================================
                     * JENIS DOKUMEN
                     * ====================================================
                     */

                    const matchJenis =
                        !jenis ||
                        String(
                            item.jenis_dokumen || ""
                        )
                            .toUpperCase()
                            .trim() ===
                        jenis;


                    /*
                     * ====================================================
                     * AND LOGIC
                     * ====================================================
                     */

                    return (
                        matchSearch &&
                        matchStatus &&
                        matchCabang &&
                        matchJenis
                    );

                }
            );


        /*
         * ================================================================
         * RE-APPLY SORT
         * ================================================================
         *
         * Jika user sebelumnya sudah melakukan sorting,
         * filter baru tetap menggunakan sorting tersebut.
         */

        if (
            this.sortColumn
        ) {

            this.applyCurrentSort();

        }


        /*
         * ================================================================
         * RESET PAGE
         * ================================================================
         */

        this.currentPage =
            1;


        /*
         * ================================================================
         * UPDATE KPI
         * ================================================================
         */

        this.loadKPI();


        /*
         * ================================================================
         * RENDER
         * ================================================================
     */

        this.renderTable();


        /*
         * ================================================================
         * PAGE INFO
         * ================================================================
         */

        this.updatePageInfo();


        /*
         * ================================================================
         * PAGE NUMBERS
         * ================================================================
         */

        if (
            typeof this.renderPageNumbers ===
            "function"
        ) {

            this.renderPageNumbers();

        }


        /*
         * ================================================================
         * SORT INDICATOR
         * ================================================================
         */

        if (
            typeof this.updateSortIndicators ===
            "function"
        ) {

            this.updateSortIndicators();

        }

    },

    /**************************************************************************
 * APPLY CURRENT SORT
 **************************************************************************/

    applyCurrentSort() {

        /*
         * ================================================================
         * VALIDASI
         * ================================================================
         */

        if (
            !this.sortColumn ||
            !Array.isArray(
                this.filterData
            )
        ) {

            return;

        }


        /*
         * ================================================================
         * SORT FILTER DATA
         * ================================================================
         */

        this.filterData.sort(
            (
                a,
                b
            ) => {

                const valueA =
                    this.normalizeSortValue(
                        a?.[
                        this.sortColumn
                        ]
                    );


                const valueB =
                    this.normalizeSortValue(
                        b?.[
                        this.sortColumn
                        ]
                    );


                /*
                 * ========================================================
                 * EMPTY VALUE
                 * ========================================================
                 */

                if (
                    valueA === "" &&
                    valueB !== ""
                ) {

                    return 1;

                }


                if (
                    valueA !== "" &&
                    valueB === ""
                ) {

                    return -1;

                }


                /*
                 * ========================================================
                 * COMPARE
                 * ========================================================
                 */

                let result =
                    0;


                if (
                    valueA <
                    valueB
                ) {

                    result =
                        -1;

                }
                else if (
                    valueA >
                    valueB
                ) {

                    result =
                        1;

                }


                /*
                 * ========================================================
                 * ASC / DESC
                 * ========================================================
                 */

                return this.sortAsc
                    ? result
                    : -result;

            }
        );

    },

    /**************************************************************************
 * SORT TABLE
 **************************************************************************/

    sortTable(
        column
    ) {

        /*
         * ================================================================
         * VALIDASI
         * ================================================================
         */

        if (
            !column
        ) {

            return;

        }


        /*
         * ================================================================
         * TOGGLE SORT
         * ================================================================
         */

        if (
            this.sortColumn ===
            column
        ) {

            this.sortAsc =
                !this.sortAsc;

        }
        else {

            this.sortColumn =
                column;

            this.sortAsc =
                true;

        }


        /*
         * ================================================================
         * APPLY SORT
         * ================================================================
         */

        this.applyCurrentSort();


        /*
         * ================================================================
         * RESET PAGE
         * ================================================================
         */

        this.currentPage =
            1;


        /*
         * ================================================================
         * RENDER
         * ================================================================
         */

        this.renderTable();


        this.updatePageInfo();


        if (
            typeof this.renderPageNumbers ===
            "function"
        ) {

            this.renderPageNumbers();

        }


        /*
         * ================================================================
         * SORT INDICATOR
         * ================================================================
         */

        this.updateSortIndicators();


        /*
         * ================================================================
         * SCROLL TABLE TO TOP
         * ================================================================
         */

        const tableContainer =
            document.querySelector(
                ".table-container"
            );


        if (
            tableContainer
        ) {

            tableContainer.scrollTo({

                top: 0,

                behavior: "smooth"

            });

        }

    },

    /**************************************************************************
     * LOAD KPI
     **************************************************************************/

    loadKPI() {

        /*
         * ================================================================
         * DATA YANG SEDANG DITAMPILKAN
         * ================================================================
         */

        const data =
            Array.isArray(
                this.filterData
            )
                ? this.filterData
                : [];


        /*
         * ================================================================
         * TOTAL
         * ================================================================
         */

        const total =
            data.length;


        /*
         * ================================================================
         * STATUS
         * ================================================================
         */

        let aktif = 0;
        let expired = 0;
        let nonAktif = 0;
        let belumLengkap = 0;


        data.forEach(
            item => {

                const status =
                    String(
                        item.status_agunan || ""
                    )
                        .trim()
                        .toUpperCase();


                switch (
                status
                ) {

                    case "A":
                        aktif++;
                        break;

                    case "E":
                        expired++;
                        break;

                    case "D":
                        nonAktif++;
                        break;

                    case "BL":
                        belumLengkap++;
                        break;

                }

            }
        );


        /*
         * ================================================================
         * UPDATE KPI UTAMA
         * ================================================================
         */

        this.setKPIValue(
            "kpiTotal",
            total
        );


        this.setKPIValue(
            "kpiAktif",
            aktif
        );


        this.setKPIValue(
            "kpiExpired",
            expired
        );


        this.setKPIValue(
            "kpiNonAktif",
            nonAktif
        );


        this.setKPIValue(
            "kpiBelumlengkap",
            belumLengkap
        );


        /*
         * ================================================================
         * UPDATE TOTAL TOOLBAR
         * ================================================================
         */

        const toolbarTotal =
            document.getElementById(
                "toolbarTotal"
            );


        if (
            toolbarTotal
        ) {

            toolbarTotal.textContent =
                total.toLocaleString(
                    "id-ID"
                );

        }


        /*
         * ================================================================
         * UPDATE LAST UPDATE
         * ================================================================
         */

        const lastUpdate =
            document.getElementById(
                "lastUpdate"
            );


        if (
            lastUpdate
        ) {

            const now =
                new Date();


            lastUpdate.textContent =
                "Last Update : " +
                now.toLocaleString(
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
                            "2-digit",

                        second:
                            "2-digit"
                    }
                );

        }


        /*
         * ================================================================
         * DEBUG
         * ================================================================
         */

        console.log(
            "DATA_AGUNAN KPI:",
            {
                total:
                    total,

                aktif:
                    aktif,

                expired:
                    expired,

                nonAktif:
                    nonAktif,

                belumLengkap:
                    belumLengkap
            }
        );

    },

    /**************************************************************************
 * SET KPI VALUE
 **************************************************************************/

    setKPIValue(
        elementId,
        value
    ) {

        const element =
            document.getElementById(
                elementId
            );


        /*
         * Element tidak ada →
         * jangan menyebabkan error.
         */

        if (
            !element
        ) {

            return;

        }


        /*
         * ================================================================
         * FORMAT NUMBER
         * ================================================================
         */

        const number =
            Number(
                value
            ) || 0;


        element.textContent =
            number.toLocaleString(
                "id-ID"
            );

    },

    /**************************************************************************
 * GET TABLE SUMMARY
 **************************************************************************/

    getTableSummary() {

        const totalData =
            Array.isArray(
                this.filterData
            )
                ? this.filterData.length
                : 0;


        const totalPage =
            this.getTotalPage();


        if (
            totalData === 0
        ) {

            return {

                totalData: 0,

                totalPage: 0,

                currentPage: 0,

                start: 0,

                end: 0,

                pageSize:
                    this.pageSize

            };

        }


        const currentPage =
            Math.min(
                Math.max(
                    1,
                    this.currentPage
                ),
                totalPage
            );


        const start =
            (
                currentPage -
                1
            ) *
            this.pageSize +
            1;


        const end =
            Math.min(
                currentPage *
                this.pageSize,
                totalData
            );


        return {

            totalData:

                totalData,

            totalPage:

                totalPage,

            currentPage:

                currentPage,

            start:

                start,

            end:

                end,

            pageSize:

                this.pageSize

        };

    },

    /**************************************************************************
 * UPDATE PAGE INFO
 **************************************************************************/

    updatePageInfo() {

        /*
         * ================================================================
         * ELEMENT
         * ================================================================
         */

        const pageInfo =
            document.getElementById(
                "pageInfo"
            );


        if (
            !pageInfo
        ) {

            return;

        }


        /*
         * ================================================================
         * SUMMARY
         * ================================================================
         */

        const summary =
            this.getTableSummary();


        /*
         * ================================================================
         * EMPTY
         * ================================================================
         */

        if (
            summary.totalData ===
            0
        ) {

            pageInfo.textContent =
                "0 data";


        }
        else {

            pageInfo.textContent =
                `${summary.start}-${summary.end} dari ${summary.totalData} data`;

        }


        /*
         * ================================================================
         * PREVIOUS
         * ================================================================
         */

        const btnPrev =
            document.getElementById(
                "btnPrev"
            );


        if (
            btnPrev
        ) {

            btnPrev.disabled =
                summary.totalData === 0 ||
                summary.currentPage <= 1;

        }


        /*
         * ================================================================
         * NEXT
         * ================================================================
         */

        const btnNext =
            document.getElementById(
                "btnNext"
            );


        if (
            btnNext
        ) {

            btnNext.disabled =
                summary.totalData === 0 ||
                summary.currentPage >=
                summary.totalPage;

        }

    },

    /**************************************************************************
 * GET TABLE COLUMN COUNT
 **************************************************************************/

    getTableColumnCount() {

        const headers =
            document.querySelectorAll(
                "#dataTable thead th"
            );


        if (
            headers.length > 0
        ) {

            return headers.length;

        }


        return 1;

    },

    /**************************************************************************
 * VIEW DATA
 **************************************************************************/

    async viewData(
        noAgunan
    ) {

        /*
         * ================================================================
         * VALIDASI NO AGUNAN
         * ================================================================
         */

        if (
            noAgunan === null ||
            noAgunan === undefined ||
            String(noAgunan).trim() === ""
        ) {

            console.warn(
                "VIEW DATA: No Agunan tidak valid."
            );

            return;

        }


        /*
         * ================================================================
         * CARI DATA BERDASARKAN NO AGUNAN
         * ================================================================
         */

        const item =
            this.data.find(
                row =>
                    String(
                        row.no_agunan ?? ""
                    ).trim() ===
                    String(
                        noAgunan
                    ).trim()
            );


        /*
         * ================================================================
         * DATA TIDAK DITEMUKAN
         * ================================================================
         */

        if (
            !item
        ) {

            console.warn(
                "VIEW DATA: No Agunan tidak ditemukan.",
                noAgunan
            );

            return;

        }


        /*
         * ================================================================
         * BUKA MODAL
         * ================================================================
         */

        this.openDetailModal(
            item
        );

    },

    /**************************************************************************
     * EDIT DATA
     **************************************************************************/

    editData(
        noAgunan
    ) {

        /*
         * ================================================================
         * VALIDASI NO AGUNAN
         * ================================================================
         */

        const target =
            String(
                noAgunan ?? ""
            ).trim();


        if (
            !target
        ) {

            console.warn(
                "EDIT DATA: No Agunan tidak valid."
            );

            return;

        }


        /*
         * ================================================================
         * VALIDASI PERMISSION
         * ================================================================
         */

        if (
            typeof Role !== "undefined" &&
            typeof Role.can === "function"
        ) {

            if (
                !Role.can(
                    "update"
                )
            ) {

                console.warn(
                    "EDIT DATA: Permission denied."
                );

                return;

            }

        }


        /*
         * ================================================================
         * CARI DATA BERDASARKAN NO AGUNAN
         * ================================================================
         */

        const item =
            this.data.find(
                row =>
                    String(
                        row.no_agunan ?? ""
                    ).trim() ===
                    target
            );


        /*
         * ================================================================
         * DATA TIDAK DITEMUKAN
         * ================================================================
         */

        if (
            !item
        ) {

            console.warn(
                "EDIT DATA: No Agunan tidak ditemukan:",
                target
            );

            return;

        }


        /*
         * ================================================================
         * DEBUG
         * ================================================================
         */

        console.log(
            "DATA_AGUNAN EDIT:",
            target
        );


        /*
         * ================================================================
         * REDIRECT KE HALAMAN EDIT
         * ================================================================
         *
         * PENTING:
         *
         * BUKAN input.html
         *
         * HARUS edit_agunan.html
         *
         * ================================================================
         */

        window.location.href =
            `edit_agunan.html?id=${encodeURIComponent(
                target
            )}`;

    },

    /**************************************************************************
     * DELETE DATA
     **************************************************************************/

    async deleteData(
        noAgunan
    ) {

        /*
         * ================================================================
         * PERMISSION
         * ================================================================
         */

        if (
            typeof Role !== "undefined" &&
            typeof Role.can === "function"
        ) {

            if (
                !Role.can(
                    "delete"
                )
            ) {

                console.warn(
                    "DELETE DATA: Permission denied."
                );

                return;

            }

        }


        /*
         * ================================================================
         * VALIDASI NO AGUNAN
         * ================================================================
         */

        const target =
            String(
                noAgunan ?? ""
            ).trim();


        if (
            !target
        ) {

            console.warn(
                "DELETE DATA: No Agunan tidak valid."
            );

            return;

        }


        /*
         * ================================================================
         * CARI DATA
         * ================================================================
         */

        const item =
            this.data.find(
                row =>
                    String(
                        row.no_agunan ?? ""
                    ).trim() ===
                    target
            );


        /*
         * ================================================================
         * DATA TIDAK DITEMUKAN
         * ================================================================
         */

        if (
            !item
        ) {

            console.warn(
                "DELETE DATA: No Agunan tidak ditemukan:",
                target
            );

            return;

        }


        /*
         * ================================================================
         * KONFIRMASI
         * ================================================================
         */

        const nama =
            item?.nama_pemilik_agunan ||
            target;


        const confirmed =
            window.confirm(
                `Apakah Anda yakin ingin menghapus data "${nama}" dengan No Agunan "${target}"?`
            );


        if (
            !confirmed
        ) {

            return;

        }


        /*
         * ================================================================
         * LOADING
         * ================================================================
         */

        this.setLoading(
            true
        );


        try {

            /*
             * ============================================================
             * API DELETE
             * ============================================================
             *
             * PENTING:
             *
             * JANGAN menggunakan:
             *
             * API.post("deleteAgunan")
             *
             * Karena API.post() menggunakan no-cors.
             *
             * Gunakan:
             *
             * API.deleteAgunan()
             *
             * karena function tersebut sudah menangani:
             *
             * 1. POST deleteAgunan
             * 2. Tunggu backend
             * 3. GET getAgunanById
             * 4. Verifikasi data benar-benar hilang
             *
             * ============================================================
             */

            const response =
                await API.deleteAgunan(
                    target
                );


            /*
             * ============================================================
             * DEBUG RESPONSE
             * ============================================================
             */

            console.log(
                "DATA_AGUNAN DELETE RESPONSE:",
                response
            );


            /*
             * ============================================================
             * VALIDASI HASIL DELETE
             * ============================================================
             */

            if (
                !response ||
                response.success !== true
            ) {

                throw new Error(
                    response?.message ||
                    "Data gagal dihapus."
                );

            }


            /*
             * ============================================================
             * HAPUS DARI MASTER DATA
             * ============================================================
             *
             * HANYA dilakukan setelah API.deleteAgunan()
             * menyatakan DELETE sudah berhasil diverifikasi.
             *
             * ============================================================
             */

            this.data =
                this.data.filter(
                    row =>
                        String(
                            row.no_agunan ?? ""
                        ).trim() !==
                        target
                );


            /*
             * ============================================================
             * APPLY ULANG FILTER
             * ============================================================
             */

            this.applyFilters();


            /*
             * ============================================================
             * NORMALISASI CURRENT PAGE
             * ============================================================
             */

            const totalPage =
                this.getTotalPage();


            if (
                this.currentPage >
                totalPage
            ) {

                this.currentPage =
                    totalPage;

            }


            if (
                this.currentPage < 1
            ) {

                this.currentPage =
                    1;

            }


            /*
             * ============================================================
             * RENDER ULANG TABLE
             * ============================================================
             */

            this.renderTable();


            /*
             * ============================================================
             * UPDATE PAGINATION
             * ============================================================
             */

            this.updatePageInfo();


            if (
                typeof this.renderPageNumbers ===
                "function"
            ) {

                this.renderPageNumbers();

            }


            /*
             * ============================================================
             * SUCCESS MESSAGE
             * ============================================================
             */

            if (
                typeof Toast !== "undefined" &&
                typeof Toast.success === "function"
            ) {

                Toast.success(
                    `Data Agunan ${target} berhasil dihapus.`
                );

            }
            else {

                console.log(
                    `Data Agunan ${target} berhasil dihapus.`
                );

            }


            /*
             * ============================================================
             * DEBUG FINAL
             * ============================================================
             */

            console.log(
                "DATA_AGUNAN: DELETE VERIFIED SUCCESS:",
                target
            );

        }
        catch (
        error
        ) {

            /*
             * ============================================================
             * ERROR
             * ============================================================
             */

            console.error(
                "DATA_AGUNAN DELETE ERROR:",
                error
            );


            /*
             * ============================================================
             * ERROR MESSAGE
             * ============================================================
             */

            if (
                typeof Toast !== "undefined" &&
                typeof Toast.error === "function"
            ) {

                Toast.error(
                    error.message ||
                    "Gagal menghapus data."
                );

            }
            else {

                alert(
                    error.message ||
                    "Gagal menghapus data."
                );

            }

        }
        finally {

            /*
             * ============================================================
             * STOP LOADING
             * ============================================================
             */

            this.setLoading(
                false
            );

        }

    },

    /**************************************************************************
     * OPEN DETAIL MODAL
     **************************************************************************/

    openDetailModal(
        item
    ) {

        /*
         * ================================================================
         * VALIDASI
         * ================================================================
         */

        if (
            !item
        ) {

            console.warn(
                "DETAIL: Data tidak tersedia."
            );

            return;

        }


        /*
         * ================================================================
         * AMBIL MODAL
         * ================================================================
         */

        const modal =
            document.getElementById(
                "detailModal"
            );

        const body =
            document.getElementById(
                "modalBody"
            );


        if (
            !modal ||
            !body
        ) {

            console.warn(
                "DETAIL: Modal atau modalBody tidak ditemukan."
            );

            return;

        }


        /*
         * ================================================================
         * HELPER VALUE
         * ================================================================
         */

        const val =
            value => {

                if (
                    value === null ||
                    value === undefined ||
                    String(value).trim() === ""
                ) {

                    return "-";

                }

                return this.escapeHtml
                    ? this.escapeHtml(
                        String(value)
                    )
                    : String(value);

            };


        /*
         * ================================================================
         * HELPER DATE
         * ================================================================
         */

        const date =
            value => {

                if (
                    value === null ||
                    value === undefined ||
                    String(value).trim() === ""
                ) {

                    return "-";

                }

                return val(
                    value
                );

            };


        /*
         * ================================================================
         * HELPER DETAIL ITEM
         * ================================================================
         */

        const detailItem =
            (
                label,
                value,
                className = ""
            ) => {

                return `
                <div class="detail-item ${className}">

                    <span class="detail-label">
                        ${label}
                    </span>

                    <div class="detail-value">
                        ${value}
                    </div>

                </div>
            `;

            };


        /*
         * ================================================================
         * STATUS AGUNAN
         * ================================================================
         */

        let statusAgunan =
            val(
                item.status_agunan
            );


        if (
            typeof this.getStatusBadge ===
            "function"
        ) {

            statusAgunan =
                this.getStatusBadge(
                    item.status_agunan
                );

        }


        /*
         * ================================================================
         * DIGITAL FILE
         * ================================================================
         */

        let digitalFile =
            "-";


        if (
            item.digital_file_link
        ) {

            const link =
                String(
                    item.digital_file_link
                ).trim();


            if (
                /^https?:\/\//i.test(
                    link
                )
            ) {

                digitalFile = `
                <a
                    href="${this.escapeHtml(link)}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="detail-link"
                >

                    <i class="fa-solid fa-arrow-up-right-from-square"></i>

                    Buka Digital File

                </a>
            `;

            }
            else {

                digitalFile =
                    val(
                        link
                    );

            }

        }


        /*
         * ================================================================
         * BUILD DETAIL
         * ================================================================
         *
         * URUTAN DIBUAT SAMA DENGAN KOLOM SPREADSHEET
         *
         * ================================================================
         */

        body.innerHTML = `

        <div class="detail-grid">


            <!-- ===================================================== -->
            <!-- 01. TIMESTAMP -->
            <!-- ===================================================== -->

            ${detailItem(
            "Timestamp",
            date(item.timestamp)
        )}


            <!-- ===================================================== -->
            <!-- 02. JENIS DOKUMEN -->
            <!-- ===================================================== -->

            ${detailItem(
            "Jenis Dokumen",
            val(item.jenis_dokumen)
        )}


            <!-- ===================================================== -->
            <!-- 03. KODE CABANG -->
            <!-- ===================================================== -->

            ${detailItem(
            "Kode Cabang",
            val(item.kode_cabang)
        )}


            <!-- ===================================================== -->
            <!-- 04. CIF DEBITUR -->
            <!-- ===================================================== -->

            ${detailItem(
            "CIF Debitur",
            val(item.cif_debitur)
        )}


            <!-- ===================================================== -->
            <!-- 05. NAMA PEMILIK AGUNAN -->
            <!-- ===================================================== -->

            ${detailItem(
            "Nama Pemilik Agunan",
            val(item.nama_pemilik_agunan),
            "detail-wide"
        )}


            <!-- ===================================================== -->
            <!-- 06. NO REK FASILITAS -->
            <!-- ===================================================== -->

            ${detailItem(
            "No Rekening Fasilitas",
            val(item.no_rek_fasilitas)
        )}


            <!-- ===================================================== -->
            <!-- 07. NO AGUNAN -->
            <!-- ===================================================== -->

            ${detailItem(
            "No Agunan",
            val(item.no_agunan),
            "detail-highlight"
        )}


            <!-- ===================================================== -->
            <!-- 08. STATUS DOKUMEN -->
            <!-- ===================================================== -->

            ${detailItem(
            "Status Dokumen",
            val(item.status_dokumen)
        )}


            <!-- ===================================================== -->
            <!-- 09. KODE JENIS AGUNAN -->
            <!-- ===================================================== -->

            ${detailItem(
            "Kode Jenis Agunan",
            val(item.kode_jenis_agunan)
        )}


            <!-- ===================================================== -->
            <!-- 10. BUKTI KEPEMILIKAN -->
            <!-- ===================================================== -->

            ${detailItem(
            "Bukti Kepemilikan",
            val(item.bukti_kepemilikan)
        )}


            <!-- ===================================================== -->
            <!-- 11. PENYIMPANAN AGUNAN -->
            <!-- ===================================================== -->

            ${detailItem(
            "Penyimpanan Agunan",
            val(item.penyimpanan_agunan),
            "detail-wide"
        )}


            <!-- ===================================================== -->
            <!-- 12. ALAMAT AGUNAN -->
            <!-- ===================================================== -->

            ${detailItem(
            "Alamat Agunan",
            val(item.alamat_agunan),
            "detail-wide"
        )}


            <!-- ===================================================== -->
            <!-- 13. RT -->
            <!-- ===================================================== -->

            ${detailItem(
            "RT",
            val(item.rt)
        )}


            <!-- ===================================================== -->
            <!-- 14. RW -->
            <!-- ===================================================== -->

            ${detailItem(
            "RW",
            val(item.rw)
        )}


            <!-- ===================================================== -->
            <!-- 15. KELURAHAN -->
            <!-- ===================================================== -->

            ${detailItem(
            "Kelurahan",
            val(item.kelurahan)
        )}


            <!-- ===================================================== -->
            <!-- 16. KECAMATAN -->
            <!-- ===================================================== -->

            ${detailItem(
            "Kecamatan",
            val(item.kecamatan)
        )}


            <!-- ===================================================== -->
            <!-- 17. KOTA / KABUPATEN -->
            <!-- ===================================================== -->

            ${detailItem(
            "Kota / Kabupaten",
            val(item.kota_kabupaten)
        )}


            <!-- ===================================================== -->
            <!-- 18. PROVINSI -->
            <!-- ===================================================== -->

            ${detailItem(
            "Provinsi",
            val(item.provinsi)
        )}


            <!-- ===================================================== -->
            <!-- 19. KODEPOS -->
            <!-- ===================================================== -->

            ${detailItem(
            "Kodepos",
            val(item.kodepos)
        )}


            <!-- ===================================================== -->
            <!-- 20. NILAI NJOP -->
            <!-- ===================================================== -->

            ${detailItem(
            "Nilai NJOP",
            val(item.nilai_njop),
            "detail-highlight"
        )}


            <!-- ===================================================== -->
            <!-- 21. TANGGAL PENILAIAN AGUNAN -->
            <!-- ===================================================== -->

            ${detailItem(
            "Tanggal Penilaian Agunan",
            date(item.tanggal_penilaian_agunan)
        )}


            <!-- ===================================================== -->
            <!-- 22. JENIS PENILAIAN -->
            <!-- ===================================================== -->

            ${detailItem(
            "Jenis Penilaian",
            val(item.jenis_penilaian)
        )}


            <!-- ===================================================== -->
            <!-- 23. TANGGAL PENILAIAN JATUH TEMPO -->
            <!-- ===================================================== -->

            ${detailItem(
            "Tanggal Penilaian Jatuh Tempo",
            date(item.tanggal_penilaian_jatuh_tempo)
        )}


            <!-- ===================================================== -->
            <!-- 24. STATUS PARIPASU -->
            <!-- ===================================================== -->

            ${detailItem(
            "Status Paripasu",
            val(item.status_paripasu)
        )}


            <!-- ===================================================== -->
            <!-- 25. PERSENTASE PARIPASU -->
            <!-- ===================================================== -->

            ${detailItem(
            "Persentase Paripasu",
            val(item.persentase_paripasu)
        )}


            <!-- ===================================================== -->
            <!-- 26. JOINT ACCOUNT -->
            <!-- ===================================================== -->

            ${detailItem(
            "Joint Account",
            val(item.joint_account)
        )}


            <!-- ===================================================== -->
            <!-- 27. AGUNAN ASURANSI -->
            <!-- ===================================================== -->

            ${detailItem(
            "Agunan Asuransi",
            val(item.agunan_asuransi)
        )}


            <!-- ===================================================== -->
            <!-- 28. TANGGAL AWAL ASURANSI -->
            <!-- ===================================================== -->

            ${detailItem(
            "Tanggal Awal Asuransi",
            date(item.tanggal_awal_asuransi)
        )}


            <!-- ===================================================== -->
            <!-- 29. TANGGAL JATUH TEMPO ASURANSI -->
            <!-- ===================================================== -->

            ${detailItem(
            "Tanggal Jatuh Tempo Asuransi",
            date(item.tanggal_jatuh_tempo_asuransi)
        )}


            <!-- ===================================================== -->
            <!-- 30. PRODUK -->
            <!-- ===================================================== -->

            ${detailItem(
            "Produk",
            val(item.produk)
        )}


            <!-- ===================================================== -->
            <!-- 31. TANGGAL PENGIKATAN -->
            <!-- ===================================================== -->

            ${detailItem(
            "Tanggal Pengikatan",
            date(item.tanggal_pengikatan)
        )}


            <!-- ===================================================== -->
            <!-- 32. LOKASI DOCUMENT -->
            <!-- ===================================================== -->

            ${detailItem(
            "Lokasi Document",
            val(item.lokasi_document),
            "detail-wide"
        )}


            <!-- ===================================================== -->
            <!-- 33. TANGGAL EXPIRED APPRAISAL -->
            <!-- ===================================================== -->

            ${detailItem(
            "Tanggal Expired Appraisal",
            date(item.tanggal_expired_appraisal)
        )}


            <!-- ===================================================== -->
            <!-- 34. ASLI / COPY -->
            <!-- ===================================================== -->

            ${detailItem(
            "Asli / Copy",
            val(item.asli_copy)
        )}


            <!-- ===================================================== -->
            <!-- 35. STATUS AGUNAN -->
            <!-- ===================================================== -->

            ${detailItem(
            "Status Agunan",
            statusAgunan
        )}


            <!-- ===================================================== -->
            <!-- 36. DOCUMENT DESCRIPTION -->
            <!-- ===================================================== -->

            ${detailItem(
            "Document Description",
            val(item.document_description),
            "detail-wide"
        )}


            <!-- ===================================================== -->
            <!-- 37. DIGITAL FILE LINK -->
            <!-- ===================================================== -->

            <div class="detail-item detail-wide">

                <span class="detail-label">
                    Digital File Link
                </span>

                <div class="detail-value">
                    ${digitalFile}
                </div>

            </div>


            <!-- ===================================================== -->
            <!-- 38. CATATAN TAMBAHAN -->
            <!-- ===================================================== -->

            ${detailItem(
            "Catatan Tambahan",
            val(item.catatan_tambahan),
            "detail-wide"
        )}

        </div>

    `;


        /*
         * ================================================================
         * SHOW MODAL
         * ================================================================
         */

        modal.classList.add(
            "show"
        );


        modal.style.display =
            "flex";


        /*
         * ================================================================
         * DEBUG
         * ================================================================
         */

        console.log(
            "DATA_AGUNAN: Detail modal opened:",
            item.no_agunan
        );

    },

    /**************************************************************************
     * CLOSE DETAIL MODAL
     **************************************************************************/

    closeDetailModal() {

        const modal =
            document.getElementById(
                "detailModal"
            );


        if (
            !modal
        ) {

            console.warn(
                "DETAIL MODAL tidak ditemukan."
            );

            return;

        }


        /*
         * ================================================================
         * HAPUS STATUS MODAL
         * ================================================================
         */

        modal.classList.remove(
            "show"
        );


        /*
         * ================================================================
         * PAKSA HILANG
         * ================================================================
         */

        modal.style.display =
            "none";


        /*
         * ================================================================
         * BERSIHKAN ISI
         * ================================================================
         */

        const body =
            document.getElementById(
                "modalBody"
            );


        if (
            body
        ) {

            body.innerHTML =
                "";

        }


        console.log(
            "DATA_AGUNAN: Detail modal closed."
        );

    },

    /**************************************************************************
 * APPRAISAL MONITORING
 **************************************************************************/

    getAppraisalStatus(
        tanggal
    ) {

        /*
         * ================================================================
         * VALIDASI TANGGAL
         * ================================================================
         */

        if (
            !tanggal
        ) {

            return {

                status:
                    "BELUM ADA",

                className:
                    "appraisal-missing",

                days:
                    null

            };

        }


        const date =
            new Date(
                tanggal
            );


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return {

                status:
                    "BELUM ADA",

                className:
                    "appraisal-missing",

                days:
                    null

            };

        }


        /*
         * ================================================================
         * NORMALISASI HARI
         * ================================================================
         */

        const today =
            new Date();

        today.setHours(
            0,
            0,
            0,
            0
        );


        date.setHours(
            0,
            0,
            0,
            0
        );


        const diff =
            date.getTime() -
            today.getTime();


        const days =
            Math.ceil(
                diff /
                (
                    1000 *
                    60 *
                    60 *
                    24
                )
            );


        /*
         * ================================================================
         * STATUS
         * ================================================================
         */

        if (
            days < 0
        ) {

            return {

                status:
                    "EXPIRED",

                className:
                    "appraisal-expired",

                days:
                    days

            };

        }


        if (
            days <= 30
        ) {

            return {

                status:
                    "SEGERA EXPIRED",

                className:
                    "appraisal-warning",

                days:
                    days

            };

        }


        return {

            status:
                "VALID",

            className:
                "appraisal-valid",

            days:
                days

        };

    },

    /**************************************************************************
 * RENDER APPRAISAL INDICATOR
 **************************************************************************/

    renderAppraisalIndicator(
        tanggal
    ) {

        const result =
            this.getAppraisalStatus(
                tanggal
            );


        /*
         * ================================================================
         * TANGGAL DISPLAY
         * ================================================================
         */

        let displayDate =
            "-";


        if (
            tanggal
        ) {

            const date =
                new Date(
                    tanggal
                );


            if (
                !Number.isNaN(
                    date.getTime()
                )
            ) {

                displayDate =
                    date.toLocaleDateString(
                        "id-ID",
                        {
                            day:
                                "2-digit",

                            month:
                                "2-digit",

                            year:
                                "numeric"
                        }
                    );

            }

        }


        /*
         * ================================================================
         * LABEL TAMBAHAN
         * ================================================================
         */

        let detail =
            "";


        if (
            result.days !== null
        ) {

            if (
                result.days < 0
            ) {

                detail =
                    `Lewat ${Math.abs(result.days)} hari`;

            }
            else if (
                result.days === 0
            ) {

                detail =
                    "Hari ini";

            }
            else {

                detail =
                    `${result.days} hari lagi`;

            }

        }


        return `
        <div class="appraisal-indicator ${result.className}">

            <div class="appraisal-date">
                ${this.escapeHtml(displayDate)}
            </div>

            <div class="appraisal-status">
                ${this.escapeHtml(result.status)}
            </div>

            ${detail
                ? `
                        <div class="appraisal-detail">
                            ${this.escapeHtml(detail)}
                        </div>
                    `
                : ""
            }

        </div>
    `;

    },

    /**************************************************************************
 * REGISTER MODAL EVENT
 **************************************************************************/

    registerModal() {

        /*
        * ================================================================
        * CLOSE BUTTON
        * ================================================================
        */

        const btnClose =
            document.getElementById(
                "btnCloseDetail"
            );


        if (
            btnClose
        ) {

            btnClose.addEventListener(
                "click",
                () => {

                    this.closeDetailModal();

                }
            );

        }


        /*
        * ================================================================
        * CLICK OUTSIDE MODAL
        * ================================================================
    */

        const modal =
            document.getElementById(
                "detailModal"
            );


        if (
            modal
        ) {

            modal.addEventListener(
                "click",
                event => {

                    if (
                        event.target ===
                        modal
                    ) {

                        this.closeDetailModal();

                    }

                }
            );

        }


        /*
        * ================================================================
        * ESCAPE
        * ================================================================
        */

        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Escape"
                ) {

                    this.closeDetailModal();

                }

            }
        );

    },

    /**************************************************************************
 * REGISTER DOUBLE CLICK
 **************************************************************************/

    registerDoubleClick() {

        const tbody =
            document.querySelector(
                "#dataTable tbody"
            );


        if (
            !tbody
        ) {

            return;

        }


        tbody.addEventListener(
            "dblclick",
            event => {

                const row =
                    event.target.closest(
                        "tr[data-no-agunan]"
                    );


                if (
                    !row
                ) {

                    return;

                }

                const noAgunan =
                    row.dataset.noAgunan;

                if (!noAgunan) {
                    return;
                }

                this.viewData(
                    noAgunan
                );

            }
        );

    },

    /**************************************************************************
     * RENDER ACTION BUTTON
     **************************************************************************/

    renderActionButton(
        item
    ) {

        const noAgunan =
            item?.no_agunan;


        /*
         * ================================================================
         * VALIDASI ID
         * ================================================================
         */

        if (
            noAgunan === null ||
            noAgunan === undefined ||
            String(noAgunan).trim() === ""
        ) {

            return "";

        }

        /*
     * ================================================================
     * ACTION BUTTON
     * ================================================================
     */

        return `
        <div class="table-actions">

            <!-- VIEW -->
            <button
                type="button"
                class="btn-action btn-view"
                data-action="view"
                data-no-agunan="${this.escapeHtml(noAgunan)}"
                title="View"
            >
                <i class="fa-solid fa-eye"></i>
            </button>

            <!-- EDIT -->
            <button
                type="button"
                class="btn-action btn-edit"
                data-action="edit"
                data-no-agunan="${this.escapeHtml(noAgunan)}"
                title="Edit"
            >
                <i class="fa-solid fa-pen"></i>
            </button>


            <!-- DELETE -->
            <button
                type="button"
                class="btn-action btn-delete"
                data-action="delete"
                data-no-agunan="${this.escapeHtml(noAgunan)}"
                title="Delete"
            >
                <i class="fa-solid fa-trash"></i>
            </button>

        </div>
    `;

    },

    /**************************************************************************
 * REGISTER TABLE ACTION
 **************************************************************************/

    registerTableAction() {

        const tbody =
            document.querySelector(
                "#dataTable tbody"
            );


        if (
            !tbody
        ) {

            return;

        }


        tbody.addEventListener(
            "click",
            event => {

                const button =
                    event.target.closest(
                        "[data-action]"
                    );


                if (
                    !button
                ) {

                    return;

                }


                event.stopPropagation();


                const action =
                    button.dataset.action;


                const noAgunan =
                    button.dataset.noAgunan;

                if (
                    !noAgunan
                ) {

                    return;

                }

                /*
                 * ============================================================
                 * VIEW
                 * ============================================================
                 */

                if (
                    action ===
                    "view"
                ) {

                    this.viewData(noAgunan);

                    return;

                }


                /*
                 * ============================================================
                 * EDIT
                 * ============================================================
                 */

                if (
                    action ===
                    "edit"
                ) {

                    this.editData(noAgunan);

                    return;

                }


                /*
                 * ============================================================
                 * DELETE
                 * ============================================================
                 */

                if (
                    action ===
                    "delete"
                ) {

                    this.deleteData(noAgunan);

                    return;

                }

            }
        );
    }
};