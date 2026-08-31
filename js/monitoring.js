/******************************************************************************
 *
 * MONITORING DATA AGUNAN
 * QUALITY CONTROL & AUDIT CONTROL TOWER
 *
 * VERSION : 7A.0
 *
 * DATA SOURCE :
 * API.getAgunanById()
 *
 * CATATAN :
 * - Tidak mengubah API / code.gs
 * - QC completeness dihitung dari field DATA_AGUNAN
 * - status_agunan TIDAK digunakan sebagai indikator kelengkapan
 *
 ******************************************************************************/

const MONITORING = {

    /**************************************************************************
     * CONFIG
     **************************************************************************/

    config: {

        pageSize: 10,

        appraisalWarningDays: 30,

        insuranceWarningDays: 30,

        /*
         * FIELD CORE QC
         *
         * Field-field ini digunakan untuk menghitung
         * kelengkapan dasar data custody.
         */

        requiredFields: [

            "jenis_dokumen",

            "kode_cabang",

            "cif_debitur",

            "nama_pemilik_agunan",

            "no_rek_fasilitas",

            "no_agunan",

            "status_dokumen",

            "kode_jenis_agunan",

            "bukti_kepemilikan",

            "penyimpanan_agunan",

            "alamat_agunan",

            "kelurahan",

            "kecamatan",

            "kota_kabupaten",

            "provinsi",

            "kodepos",

            "tanggal_penilaian_agunan",

            "jenis_penilaian",

            "tanggal_pengikatan",

            "lokasi_document",

            "asli_copy",

            "status_agunan"

        ]

    },


    /**************************************************************************
     * STATE
     **************************************************************************/

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


    /**************************************************************************
     * INIT
     **************************************************************************/

    async init() {

        console.log(
            "=================================================="
        );

        console.log(
            "MONITORING 7A: INITIALIZING..."
        );

        console.log(
            "QUALITY CONTROL & AUDIT CONTROL TOWER"
        );

        console.log(
            "=================================================="
        );


        /*
         * PAGE SIZE
         */

        this.state.pageSize =
            this.config.pageSize;


        /*
         * EVENT
         */

        this.registerEvent();

        this.registerQCControlTower();

        this.registerQCFindingModal();

        /*
         * TODAY
         */

        this.loadToday();


        /*
         * VERSION
         */

        const versionEl =
            document.getElementById(
                "appVersion"
            );


        if (
            versionEl &&
            typeof CONFIG !== "undefined"
        ) {

            versionEl.textContent =
                "Monitoring 7A • " +
                CONFIG.VERSION;

        }


        /*
         * LOAD DATA
         */

        await this.loadData();
    },

    /**************************************************************************
     * GET VALUE
     *
     * Aman terhadap perbedaan uppercase/lowercase header.
     **************************************************************************/

    getValue(
        item,
        targetKey
    ) {

        if (
            !item
        ) {

            return "";

        }


        const target =
            String(
                targetKey || ""
            )
                .trim()
                .toLowerCase();


        const key =
            Object.keys(
                item
            ).find(
                function (
                    currentKey
                ) {

                    return String(
                        currentKey || ""
                    )
                        .trim()
                        .toLowerCase() ===
                        target;

                }
            );


        if (
            !key
        ) {

            return "";

        }


        return item[key];

    },


    /**************************************************************************
     * NORMALIZE STRING
     **************************************************************************/

    normalize(
        value
    ) {

        return String(
            value === null ||
                value === undefined
                ? ""
                : value
        )
            .trim();

    },


    /**************************************************************************
     * IS EMPTY
     **************************************************************************/

    isEmpty(
        value
    ) {

        return this.normalize(
            value
        ) === "";

    },


    /**************************************************************************
     * TODAY
     **************************************************************************/

    loadToday() {

        const now =
            new Date();


        const option = {

            weekday:
                "long",

            day:
                "2-digit",

            month:
                "long",

            year:
                "numeric"

        };


        const el =
            document.getElementById(
                "todayDate"
            );


        if (
            el
        ) {

            el.textContent =
                now.toLocaleDateString(
                    "id-ID",
                    option
                );

        }

    },


    /**************************************************************************
     * LOADING
     **************************************************************************/

    showLoading() {

        const loading =
            document.getElementById(
                "loading"
            );


        if (
            loading
        ) {

            loading.style.display =
                "flex";

        }

    },


    hideLoading() {

        const loading =
            document.getElementById(
                "loading"
            );


        if (
            loading
        ) {

            loading.style.display =
                "none";

        }

    },


    /**************************************************************************
     * LOAD DATA
     **************************************************************************/
    async loadData() {

        this.showLoading();


        try {

            console.log(
                "MONITORING 7A: Loading DATA_AGUNAN..."
            );


            /*
             * ================================================================
             * DATA SOURCE
             * ================================================================
             *
             * Tetap menggunakan API.getAgunanById().
             */

            const result =
                await API.getAgunan();


            console.log(
                "MONITORING 7A API RESPONSE:",
                result
            );


            if (
                !result ||
                result.success !== true
            ) {

                throw new Error(
                    result?.message ||
                    "Gagal mengambil data agunan."
                );

            }

            /*
             * ================================================================
             * NORMALIZE DATA
             * ================================================================
             */
            this.state.data =
                Array.isArray(
                    result.data
                )
                    ? result.data
                    : [];


            this.state.filtered =
                [
                    ...this.state.data
                ];


            this.state.page =
                1;


            console.log(
                "MONITORING 7A TOTAL DATA:",
                this.state.data.length
            );


            /*
             * ================================================================
             * MASTER FILTER
             * ================================================================
             */

            this.loadCabang();


            /*
             * ================================================================
             * CALCULATE
             * ================================================================
             */

            this.updateSummary();

            this.updateKPI();

            /*
             * ================================================================
             * TABLE
             * ================================================================
             */

            this.renderTable();

            /*
            * ================================================================
            * QC CONTROL TOWER
            * ================================================================
            */

            this.renderQCControlTower();

            /*
             * ================================================================
             * LAST UPDATE
             * ================================================================
             */

            this.updateLastUpdate();


            console.log(
                "MONITORING 7A: Data loaded successfully."
            );

        }
        catch (
        err
        ) {

            console.error(
                "MONITORING 7A LOAD ERROR:",
                err
            );


            this.state.data =
                [];

            this.state.filtered =
                [];


            this.updateSummary();

            this.updateKPI();

            this.renderTable();


            alert(
                err.message ||
                "Gagal memuat data monitoring."
            );

        }
        finally {

            this.hideLoading();

        }

    },


    /**************************************************************************
     * LAST UPDATE
     **************************************************************************/

    updateLastUpdate() {

        const el =
            document.getElementById(
                "lastUpdate"
            );


        if (
            !el
        ) {

            return;

        }


        el.textContent =
            "Last Update : " +
            new Date().toLocaleString(
                "id-ID"
            );

    },


    /**************************************************************************
     * LOAD CABANG
     **************************************************************************/

    loadCabang() {

        const select =
            document.getElementById(
                "filterCabang"
            );


        if (
            !select
        ) {

            return;

        }


        select.innerHTML =
            '<option value="">Semua Cabang</option>';


        const cabang =
            [
                ...new Set(
                    this.state.data
                        .map(
                            item =>
                                this.normalize(
                                    this.getValue(
                                        item,
                                        "kode_cabang"
                                    )
                                )
                        )
                        .filter(
                            value =>
                                value !== ""
                        )
                )
            ];


        cabang.sort(
            function (
                a,
                b
            ) {

                return a.localeCompare(
                    b,
                    "id"
                );

            }
        );


        cabang.forEach(
            item => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    item;


                option.textContent =
                    item;


                select.appendChild(
                    option
                );

            }
        );

    },


    /**************************************************************************
     * PARSE DATE
     *
     * Mendukung:
     * - Date object
     * - yyyy-MM-dd
     * - yyyy-MM-dd HH:mm:ss
     * - dd/MM/yyyy
     **************************************************************************/

    parseDate(
        value
    ) {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {

            return null;

        }


        if (
            Object.prototype
                .toString
                .call(value) ===
            "[object Date]"
        ) {

            const date =
                new Date(
                    value.getTime()
                );


            if (
                isNaN(
                    date.getTime()
                )
            ) {

                return null;

            }


            date.setHours(
                0,
                0,
                0,
                0
            );


            return date;

        }


        const str =
            String(
                value
            )
                .trim();


        /*
         * yyyy-MM-dd
         */

        let match =
            str.match(
                /^(\d{4})-(\d{2})-(\d{2})/
            );


        if (
            match
        ) {

            const date =
                new Date(
                    Number(
                        match[1]
                    ),
                    Number(
                        match[2]
                    ) - 1,
                    Number(
                        match[3]
                    )
                );


            if (
                !isNaN(
                    date.getTime()
                )
            ) {

                date.setHours(
                    0,
                    0,
                    0,
                    0
                );


                return date;

            }

        }


        /*
         * dd/MM/yyyy
         */

        match =
            str.match(
                /^(\d{1,2})\/(\d{1,2})\/(\d{4})/
            );


        if (
            match
        ) {

            const date =
                new Date(
                    Number(
                        match[3]
                    ),
                    Number(
                        match[2]
                    ) - 1,
                    Number(
                        match[1]
                    )
                );


            if (
                !isNaN(
                    date.getTime()
                )
            ) {

                date.setHours(
                    0,
                    0,
                    0,
                    0
                );


                return date;

            }

        }


        /*
         * LAST RESORT
         */

        const fallback =
            new Date(
                str
            );


        if (
            isNaN(
                fallback.getTime()
            )
        ) {

            return null;

        }


        fallback.setHours(
            0,
            0,
            0,
            0
        );


        return fallback;

    },


    /**************************************************************************
     * CALCULATE SISA HARI
     **************************************************************************/

    calculateSisaHari(
        dateValue
    ) {

        const targetDate =
            this.parseDate(
                dateValue
            );


        if (
            !targetDate
        ) {

            return null;

        }


        const today =
            new Date();


        today.setHours(
            0,
            0,
            0,
            0
        );


        return Math.ceil(
            (
                targetDate.getTime() -
                today.getTime()
            ) /
            86400000
        );

    },


    /**************************************************************************
     * APPRAISAL STATUS
     **************************************************************************/

    getAppraisalStatus(
        item
    ) {

        const raw =
            this.getValue(
                item,
                "tanggal_expired_appraisal"
            );


        if (
            this.isEmpty(
                raw
            )
        ) {

            return {

                code:
                    "MISSING",

                label:
                    "BELUM ADA",

                days:
                    null

            };

        }


        const days =
            this.calculateSisaHari(
                raw
            );


        if (
            days === null
        ) {

            return {

                code:
                    "INVALID",

                label:
                    "TANGGAL INVALID",

                days:
                    null

            };

        }


        if (
            days < 0
        ) {

            return {

                code:
                    "EXPIRED",

                label:
                    "EXPIRED",

                days:
                    days

            };

        }


        if (
            days <=
            this.config.appraisalWarningDays
        ) {

            return {

                code:
                    "WARNING",

                label:
                    "SEGERA EXPIRED",

                days:
                    days

            };

        }


        return {

            code:
                "VALID",

            label:
                "VALID",

            days:
                days

        };

    },


    /**************************************************************************
     * INSURANCE STATUS
     **************************************************************************/

    getInsuranceStatus(
        item
    ) {

        const insured =
            this.normalize(
                this.getValue(
                    item,
                    "agunan_asuransi"
                )
            )
                .toUpperCase();


        /*
         * Jika tidak ada indikasi asuransi,
         * dianggap tidak diasuransikan.
         */

        if (
            !insured ||
            insured === "TIDAK" ||
            insured === "NO" ||
            insured === "N"
        ) {

            return {

                code:
                    "NOT_INSURED",

                label:
                    "TIDAK DIASURANSIKAN",

                days:
                    null

            };

        }


        const expiry =
            this.getValue(
                item,
                "tanggal_jatuh_tempo_asuransi"
            );


        if (
            this.isEmpty(
                expiry
            )
        ) {

            return {

                code:
                    "MISSING_DATE",

                label:
                    "TGL ASURANSI KOSONG",

                days:
                    null

            };

        }


        const days =
            this.calculateSisaHari(
                expiry
            );


        if (
            days === null
        ) {

            return {

                code:
                    "INVALID",

                label:
                    "TANGGAL INVALID",

                days:
                    null

            };

        }


        if (
            days < 0
        ) {

            return {

                code:
                    "EXPIRED",

                label:
                    "ASURANSI EXPIRED",

                days:
                    days

            };

        }


        if (
            days <=
            this.config.insuranceWarningDays
        ) {

            return {

                code:
                    "WARNING",

                label:
                    "SEGERA JATUH TEMPO",

                days:
                    days

            };

        }


        return {

            code:
                "VALID",

            label:
                "ASURANSI VALID",

            days:
                days

        };

    },


    /**************************************************************************
     * FIELD COMPLETENESS
     **************************************************************************/

    getMissingFields(
        item
    ) {

        const missing =
            [];


        this.config.requiredFields.forEach(
            field => {

                if (
                    this.isEmpty(
                        this.getValue(
                            item,
                            field
                        )
                    )
                ) {

                    missing.push(
                        field
                    );

                }

            }
        );


        /*
         * ================================================================
         * CONDITIONAL ASURANSI
         * ================================================================
         */

        const insured =
            this.normalize(
                this.getValue(
                    item,
                    "agunan_asuransi"
                )
            )
                .toUpperCase();


        if (
            insured &&
            insured !== "TIDAK" &&
            insured !== "NO" &&
            insured !== "N"
        ) {

            [
                "tanggal_awal_asuransi",
                "tanggal_jatuh_tempo_asuransi"
            ]
                .forEach(
                    field => {

                        if (
                            this.isEmpty(
                                this.getValue(
                                    item,
                                    field
                                )
                            )
                        ) {

                            missing.push(
                                field
                            );

                        }

                    }
                );

        }


        return missing;

    },


    /**************************************************************************
     * QUALITY SCORE
     **************************************************************************/

    getQualityScore(
        item
    ) {

        const fields =
            this.config.requiredFields;


        if (
            fields.length === 0
        ) {

            return 100;

        }


        let filled =
            0;


        fields.forEach(
            field => {

                if (
                    !this.isEmpty(
                        this.getValue(
                            item,
                            field
                        )
                    )
                ) {

                    filled++;

                }

            }
        );


        return Math.round(
            (
                filled /
                fields.length
            ) *
            100
        );

    },


    /**************************************************************************
     * QUALITY LEVEL
     **************************************************************************/

    getQualityLevel(
        score
    ) {

        const value =
            Number(
                score
            ) || 0;


        if (
            value >= 95
        ) {

            return "EXCELLENT";

        }


        if (
            value >= 85
        ) {

            return "GOOD";

        }


        if (
            value >= 70
        ) {

            return "WARNING";

        }


        return "CRITICAL";

    },


    /**************************************************************************
     * ROW QUALITY
     **************************************************************************/

    getRowQuality(
        item
    ) {

        const score =
            this.getQualityScore(
                item
            );


        const missing =
            this.getMissingFields(
                item
            );


        const appraisal =
            this.getAppraisalStatus(
                item
            );


        const insurance =
            this.getInsuranceStatus(
                item
            );


        return {

            score:
                score,

            level:
                this.getQualityLevel(
                    score
                ),

            missing:
                missing,

            appraisal:
                appraisal,

            insurance:
                insurance

        };

    },


    /**************************************************************************
     * PRIORITY
     *
     * PRIORITY QC:
     *
     * CRITICAL :
     * - Status expired
     * - Appraisal expired
     * - Quality < 70
     *
     * HIGH :
     * - Appraisal ≤ 30 hari
     * - Insurance expired
     * - Quality 70-84
     *
     * MEDIUM :
     * - Belum lengkap
     * - Insurance ≤ 30 hari
     * - Quality 85-94
     *
     * LOW :
     * - Kondisi relatif aman
     **************************************************************************/

    getPriority(
        item
    ) {

        const status =
            this.normalize(
                this.getValue(
                    item,
                    "status_agunan"
                )
            )
                .toUpperCase();


        const quality =
            this.getRowQuality(
                item
            );


        /*
         * CRITICAL
         */

        if (
            status === "E" ||
            quality.appraisal.code ===
            "EXPIRED" ||
            quality.insurance.code ===
            "EXPIRED" ||
            quality.score < 70
        ) {

            return {

                code:
                    "CRITICAL",

                label:
                    "CRITICAL"

            };

        }


        /*
         * HIGH
         */

        if (
            quality.appraisal.code ===
            "WARNING" ||
            quality.insurance.code ===
            "WARNING" ||
            quality.score < 85
        ) {

            return {

                code:
                    "HIGH",

                label:
                    "HIGH"

            };

        }


        /*
         * MEDIUM
         */

        if (
            status === "BL" ||
            quality.insurance.code ===
            "NOT_INSURED" ||
            quality.score < 95
        ) {

            return {

                code:
                    "MEDIUM",

                label:
                    "MEDIUM"

            };

        }


        /*
         * LOW
         */

        return {

            code:
                "LOW",

            label:
                "LOW"

        };

    },

    /**************************************************************************
 * QC FINDING ENGINE
 *
 * STEP 7B
 **************************************************************************/

    buildQCFindings(
        item
    ) {

        const findings = [];


        /*
         * ================================================================
         * BASIC INFORMATION
         * ================================================================
         */
        const noAgunan =
            this.normalize(
                this.getValue(
                    item,
                    "no_agunan"
                )
            );

        const cif =
            this.normalize(
                this.getValue(
                    item,
                    "cif_debitur"
                )
            );

        const cabang =
            this.normalize(
                this.getValue(
                    item,
                    "kode_cabang"
                )
            );

        const jenisDokumen =
            this.normalize(
                this.getValue(
                    item,
                    "jenis_dokumen"
                )
            );

        /*
         * ================================================================
         * FINDING HELPER
         * ================================================================
         */
        const addFinding =
            (
                area,
                severity,
                field,
                message,
                detail = ""
            ) => {

                findings.push({
                    jenis_dokumen:
                        jenisDokumen,

                    no_agunan:
                        noAgunan,

                    cif_debitur:
                        cif,

                    kode_cabang:
                        cabang,

                    area:
                        area,

                    severity:
                        severity,

                    field:
                        field,

                    message:
                        message,

                    detail:
                        detail

                });

            };


        /*
         * ================================================================
         * IDENTITY
         * ================================================================
         */

        if (
            this.isEmpty(
                this.getValue(
                    item,
                    "cif_debitur"
                )
            )
        ) {

            addFinding(
                "IDENTITY",
                "CRITICAL",
                "cif_debitur",
                "CIF Debitur kosong"
            );

        }


        if (
            this.isEmpty(
                this.getValue(
                    item,
                    "nama_pemilik_agunan"
                )
            )
        ) {

            addFinding(
                "IDENTITY",
                "CRITICAL",
                "nama_pemilik_agunan",
                "Nama pemilik agunan kosong"
            );

        }


        if (
            this.isEmpty(
                this.getValue(
                    item,
                    "no_rek_fasilitas"
                )
            )
        ) {

            addFinding(
                "IDENTITY",
                "HIGH",
                "no_rek_fasilitas",
                "Nomor rekening fasilitas kosong"
            );

        }


        /*
         * ================================================================
         * DOCUMENT
         * ================================================================
         */

        if (
            this.isEmpty(
                this.getValue(
                    item,
                    "jenis_dokumen"
                )
            )
        ) {

            addFinding(
                "DOCUMENT",
                "HIGH",
                "jenis_dokumen",
                "Jenis dokumen belum diisi"
            );

        }


        if (
            this.isEmpty(
                this.getValue(
                    item,
                    "status_dokumen"
                )
            )
        ) {

            addFinding(
                "DOCUMENT",
                "HIGH",
                "status_dokumen",
                "Status dokumen belum diisi"
            );

        }


        if (
            this.isEmpty(
                this.getValue(
                    item,
                    "bukti_kepemilikan"
                )
            )
        ) {

            addFinding(
                "DOCUMENT",
                "HIGH",
                "bukti_kepemilikan",
                "Bukti kepemilikan kosong"
            );

        }


        if (
            this.isEmpty(
                this.getValue(
                    item,
                    "asli_copy"
                )
            )
        ) {

            addFinding(
                "DOCUMENT",
                "MEDIUM",
                "asli_copy",
                "Status Asli / Copy belum diisi"
            );

        }


        /*
         * ================================================================
         * LOCATION
         * ================================================================
         */

        if (
            this.isEmpty(
                this.getValue(
                    item,
                    "alamat_agunan"
                )
            )
        ) {

            addFinding(
                "LOCATION",
                "HIGH",
                "alamat_agunan",
                "Alamat agunan kosong"
            );

        }


        if (
            this.isEmpty(
                this.getValue(
                    item,
                    "kelurahan"
                )
            )
        ) {

            addFinding(
                "LOCATION",
                "MEDIUM",
                "kelurahan",
                "Kelurahan belum diisi"
            );

        }


        if (
            this.isEmpty(
                this.getValue(
                    item,
                    "kecamatan"
                )
            )
        ) {

            addFinding(
                "LOCATION",
                "MEDIUM",
                "kecamatan",
                "Kecamatan belum diisi"
            );

        }


        if (
            this.isEmpty(
                this.getValue(
                    item,
                    "kota_kabupaten"
                )
            )
        ) {

            addFinding(
                "LOCATION",
                "MEDIUM",
                "kota_kabupaten",
                "Kota/Kabupaten belum diisi"
            );

        }


        if (
            this.isEmpty(
                this.getValue(
                    item,
                    "provinsi"
                )
            )
        ) {

            addFinding(
                "LOCATION",
                "MEDIUM",
                "provinsi",
                "Provinsi belum diisi"
            );

        }


        /*
         * ================================================================
         * APPRAISAL
         * ================================================================
         */

        const appraisal =
            this.getAppraisalStatus(
                item
            );


        if (
            appraisal.code ===
            "EXPIRED"
        ) {

            addFinding(
                "APPRAISAL",
                "CRITICAL",
                "tanggal_expired_appraisal",
                "Appraisal telah expired",
                `${Math.abs(
                    appraisal.days
                )} hari telah lewat`
            );

        }


        else if (
            appraisal.code ===
            "WARNING"
        ) {

            addFinding(
                "APPRAISAL",
                "HIGH",
                "tanggal_expired_appraisal",
                "Appraisal segera expired",
                `${appraisal.days} hari lagi`
            );

        }


        else if (
            appraisal.code ===
            "MISSING"
        ) {

            addFinding(
                "APPRAISAL",
                "HIGH",
                "tanggal_expired_appraisal",
                "Tanggal expired appraisal belum tersedia"
            );

        }


        else if (
            appraisal.code ===
            "INVALID"
        ) {

            addFinding(
                "APPRAISAL",
                "CRITICAL",
                "tanggal_expired_appraisal",
                "Tanggal expired appraisal tidak valid"
            );

        }


        if (
            this.isEmpty(
                this.getValue(
                    item,
                    "tanggal_penilaian_agunan"
                )
            )
        ) {

            addFinding(
                "APPRAISAL",
                "HIGH",
                "tanggal_penilaian_agunan",
                "Tanggal penilaian agunan kosong"
            );

        }


        if (
            this.isEmpty(
                this.getValue(
                    item,
                    "jenis_penilaian"
                )
            )
        ) {

            addFinding(
                "APPRAISAL",
                "MEDIUM",
                "jenis_penilaian",
                "Jenis penilaian belum diisi"
            );

        }


        /*
         * ================================================================
         * INSURANCE
         * ================================================================
         */

        const insurance =
            this.getInsuranceStatus(
                item
            );


        if (
            insurance.code ===
            "EXPIRED"
        ) {

            addFinding(
                "INSURANCE",
                "CRITICAL",
                "tanggal_jatuh_tempo_asuransi",
                "Asuransi telah expired",
                `${Math.abs(
                    insurance.days
                )} hari telah lewat`
            );

        }


        else if (
            insurance.code ===
            "WARNING"
        ) {

            addFinding(
                "INSURANCE",
                "HIGH",
                "tanggal_jatuh_tempo_asuransi",
                "Asuransi segera jatuh tempo",
                `${insurance.days} hari lagi`
            );

        }


        else if (
            insurance.code ===
            "MISSING_DATE"
        ) {

            addFinding(
                "INSURANCE",
                "HIGH",
                "tanggal_jatuh_tempo_asuransi",
                "Tanggal jatuh tempo asuransi kosong"
            );

        }


        else if (
            insurance.code ===
            "NOT_INSURED"
        ) {

            addFinding(
                "INSURANCE",
                "MEDIUM",
                "agunan_asuransi",
                "Agunan belum diasuransikan"
            );

        }


        /*
         * ================================================================
         * BINDING
         * ================================================================
         */

        if (
            this.isEmpty(
                this.getValue(
                    item,
                    "tanggal_pengikatan"
                )
            )
        ) {

            addFinding(
                "BINDING",
                "HIGH",
                "tanggal_pengikatan",
                "Tanggal pengikatan kosong"
            );

        }


        if (
            this.isEmpty(
                this.getValue(
                    item,
                    "status_paripasu"
                )
            )
        ) {

            addFinding(
                "BINDING",
                "MEDIUM",
                "status_paripasu",
                "Status paripasu belum diisi"
            );

        }


        /*
         * ================================================================
         * DIGITAL CUSTODY
         * ================================================================
         */

        if (
            this.isEmpty(
                this.getValue(
                    item,
                    "lokasi_document"
                )
            )
        ) {

            addFinding(
                "DIGITAL CUSTODY",
                "HIGH",
                "lokasi_document",
                "Lokasi dokumen belum diisi"
            );

        }


        if (
            this.isEmpty(
                this.getValue(
                    item,
                    "digital_file_link"
                )
            )
        ) {

            addFinding(
                "DIGITAL CUSTODY",
                "HIGH",
                "digital_file_link",
                "Digital file link belum tersedia"
            );

        }


        /*
         * ================================================================
         * STATUS
         * ================================================================
         */

        const statusAgunan =
            this.normalize(
                this.getValue(
                    item,
                    "status_agunan"
                )
            )
                .toUpperCase();


        if (
            !statusAgunan
        ) {

            addFinding(
                "STATUS",
                "CRITICAL",
                "status_agunan",
                "Status agunan kosong"
            );

        }


        /*
         * ================================================================
         * RETURN
         * ================================================================
         */

        return findings;

    },

    /**************************************************************************
 * BUILD ALL QC FINDINGS
 **************************************************************************/

    buildAllQCFindings() {

        const findings = [];


        const data =
            Array.isArray(
                this.state.filtered
            )
                ? this.state.filtered
                : [];


        data.forEach(
            item => {

                const rowFindings =
                    this.buildQCFindings(
                        item
                    );


                findings.push(
                    ...rowFindings
                );

            }
        );


        /*
         * ================================================================
         * SORT BY SEVERITY
         * ================================================================
         */

        const severityOrder = {

            CRITICAL:
                1,

            HIGH:
                2,

            MEDIUM:
                3,

            LOW:
                4

        };


        findings.sort(
            (
                a,
                b
            ) => {

                const severityA =
                    severityOrder[
                    a.severity
                    ] ||
                    99;


                const severityB =
                    severityOrder[
                    b.severity
                    ] ||
                    99;


                if (
                    severityA !==
                    severityB
                ) {

                    return (
                        severityA -
                        severityB
                    );

                }


                return String(
                    a.no_agunan || ""
                )
                    .localeCompare(
                        String(
                            b.no_agunan || ""
                        )
                    );

            }
        );


        return findings;

    },

    /**************************************************************************
 * QC FINDING SUMMARY
 **************************************************************************/

    getQCFindingSummary() {

        const findings =
            this.buildAllQCFindings();


        const summary = {

            total:
                findings.length,

            critical:
                0,

            high:
                0,

            medium:
                0,

            low:
                0

        };


        findings.forEach(
            finding => {

                switch (
                finding.severity
                ) {

                    case "CRITICAL":

                        summary.critical++;

                        break;


                    case "HIGH":

                        summary.high++;

                        break;


                    case "MEDIUM":

                        summary.medium++;

                        break;


                    case "LOW":

                        summary.low++;

                        break;

                }

            }
        );


        return {

            summary:
                summary,

            findings:
                findings

        };

    },

    /**************************************************************************
 * QC CONTROL TOWER — STEP 7C
 **************************************************************************/


    /******************************************************************************
     * RENDER QC CONTROL TOWER
     ******************************************************************************/

    renderQCControlTower() {

        const result =
            this.getQCFindingSummary();


        const summary =
            result.summary;


        const findings =
            result.findings || [];


        /*
         * ================================================================
         * SEVERITY KPI
         * ================================================================
         */

        this.setText(
            "qcTotalFindings",
            summary.total
        );


        this.setText(
            "qcCritical",
            summary.critical
        );


        this.setText(
            "qcHigh",
            summary.high
        );


        this.setText(
            "qcMedium",
            summary.medium
        );


        this.setText(
            "qcLow",
            summary.low
        );


        /*
         * ================================================================
         * AREA
         * ================================================================
         */

        this.renderQCAreas(
            findings
        );


        /*
         * ================================================================
         * FINDINGS
         * ================================================================
         */

        this.renderQCFindings(
            findings
        );

    },


    /******************************************************************************
     * RENDER QC AREA
     ******************************************************************************/

    renderQCAreas(
        findings
    ) {

        const container =
            document.getElementById(
                "qcAreaGrid"
            );


        if (
            !container
        ) {

            return;

        }


        const areaMap = {};


        findings.forEach(
            finding => {

                const area =
                    String(
                        finding.area ||
                        "OTHER"
                    )
                        .trim()
                        .toUpperCase();


                if (
                    !areaMap[area]
                ) {

                    areaMap[area] = {

                        total:
                            0,

                        critical:
                            0,

                        high:
                            0,

                        medium:
                            0,

                        low:
                            0

                    };

                }


                areaMap[area].total++;


                switch (
                finding.severity
                ) {

                    case "CRITICAL":

                        areaMap[area].critical++;

                        break;


                    case "HIGH":

                        areaMap[area].high++;

                        break;


                    case "MEDIUM":

                        areaMap[area].medium++;

                        break;


                    case "LOW":

                        areaMap[area].low++;

                        break;

                }

            }
        );


        const areas =
            Object.keys(
                areaMap
            )
                .sort(
                    (
                        a,
                        b
                    ) =>
                        areaMap[b].total -
                        areaMap[a].total
                );


        if (
            areas.length === 0
        ) {

            container.innerHTML = `
            <div class="qc-empty-state">
                <i class="fa-solid fa-circle-check"></i>
                <strong>Tidak ada finding</strong>
                <span>Semua data dalam kondisi baik.</span>
            </div>
        `;

            return;

        }


        container.innerHTML =
            areas.map(
                area => {

                    const data =
                        areaMap[area];


                    return `

                    <button
                        type="button"
                        class="qc-area-card"
                        data-qc-area="${this.escapeHtml(area)}">

                        <div class="qc-area-name">

                            <strong>
                                ${this.escapeHtml(area)}
                            </strong>

                            <span class="qc-area-count">
                                ${data.total}
                            </span>

                        </div>


                        <div class="qc-area-breakdown">

                            ${data.critical > 0
                            ? `
                                        <span class="qc-mini-badge critical">
                                            C ${data.critical}
                                        </span>
                                    `
                            : ""
                        }

                            ${data.high > 0
                            ? `
                                        <span class="qc-mini-badge high">
                                            H ${data.high}
                                        </span>
                                    `
                            : ""
                        }

                            ${data.medium > 0
                            ? `
                                        <span class="qc-mini-badge medium">
                                            M ${data.medium}
                                        </span>
                                    `
                            : ""
                        }

                            ${data.low > 0
                            ? `
                                        <span class="qc-mini-badge low">
                                            L ${data.low}
                                        </span>
                                    `
                            : ""
                        }

                        </div>

                    </button>

                `;

                }
            )
                .join(
                    ""
                );


        /*
         * ================================================================
         * REGISTER AREA CLICK
         * ================================================================
         */

        container
            .querySelectorAll(
                "[data-qc-area]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            const area =
                                button.dataset.qcArea;


                            this.filterQCFindings(
                                {
                                    area:
                                        area
                                }
                            );

                        }
                    );

                }
            );

    },


    /******************************************************************************
     * RENDER QC FINDINGS
     ******************************************************************************/

    renderQCFindings(
        findings
    ) {

        const tbody =
            document.getElementById(
                "qcFindingsBody"
            );

        const empty =
            document.getElementById(
                "qcEmptyState"
            );

        const table =
            document.getElementById(
                "qcFindingsTable"
            );

        const count =
            document.getElementById(
                "qcVisibleCount"
            );

        if (
            !tbody
        ) {

            return;

        }

        tbody.innerHTML =
            "";

        if (
            !findings.length
        ) {

            if (
                table
            ) {

                table.style.display =
                    "none";
            }

            if (
                empty
            ) {

                empty.style.display =
                    "block";

            }

            if (
                count
            ) {

                count.textContent =
                    "0 Findings";

            }

            return;

        }

        if (
            table
        ) {

            table.style.display =
                "";

        }

        if (
            empty
        ) {

            empty.style.display =
                "none";

        }

        if (
            count
        ) {

            count.textContent =
                findings.length +
                " Findings";
        }

        tbody.innerHTML =
            findings.map(
                (
                    finding,
                    index
                ) => {

                    const severity =
                        String(
                            finding.severity ||
                            "LOW"
                        )
                            .toLowerCase();


                    return `

                    <tr
                        class="qc-finding-row"
                        data-qc-finding-index="${index}"
                        title="Klik untuk melihat detail finding"
                    >

                        <td>

                            <span
                                class="qc-finding-badge ${severity}">

                                ${this.escapeHtml(
                        finding.severity ||
                        "-"
                    )}

                            </span>

                        </td>

                        <td>
                            ${this.escapeHtml(
                        finding.jenis_dokumen ||
                        "-"
                    )}
                        </td>

                        <td>
                            ${this.escapeHtml(
                        finding.no_agunan ||
                        "-"
                    )}
                        </td>

                        <td>
                            ${this.escapeHtml(
                        finding.cif_debitur ||
                        "-"
                    )}
                        </td>

                        <td>
                            ${this.escapeHtml(
                        finding.kode_cabang ||
                        "-"
                    )}
                        </td>

                        <td>

                            <span class="qc-area-label">

                                ${this.escapeHtml(
                        finding.area ||
                        "-"
                    )}

                            </span>

                        </td>


                        <td>
                            ${this.escapeHtml(
                        finding.field ||
                        "-"
                    )}
                        </td>


                        <td>
                            ${this.escapeHtml(
                        finding.message ||
                        "-"
                    )}
                        </td>


                        <td>
                            ${this.escapeHtml(
                        finding.detail ||
                        "-"
                    )}
                        </td>

                    </tr>

                    `;

                }
            )
                .join(
                    ""
                );


        /*
         * ================================================================
         * REGISTER FINDING ROW CLICK
         * ================================================================
         */

        tbody
            .querySelectorAll(
                ".qc-finding-row"
            )
            .forEach(
                row => {

                    row.addEventListener(
                        "click",
                        () => {

                            const index =
                                Number(
                                    row.dataset.qcFindingIndex
                                );


                            if (
                                Number.isNaN(
                                    index
                                )
                            ) {

                                console.warn(
                                    "QC FINDING: Index tidak valid."
                                );

                                return;

                            }


                            const finding =
                                findings[index];


                            if (
                                !finding
                            ) {

                                console.warn(
                                    "QC FINDING: Data finding tidak ditemukan.",
                                    index
                                );

                                return;

                            }


                            this.openQCFindingDetail(
                                finding
                            );

                        }
                    );

                }
            );

    },

    /******************************************************************************
     * FILTER QC FINDINGS
     ******************************************************************************/

    filterQCFindings(
        filter = {}
    ) {

        const result =
            this.getQCFindingSummary();


        let findings =
            result.findings || [];


        /*
         * ================================================================
         * SEVERITY
         * ================================================================
         */

        if (
            filter.severity
        ) {

            findings =
                findings.filter(
                    finding =>
                        String(
                            finding.severity ||
                            ""
                        )
                            .toUpperCase() ===
                        String(
                            filter.severity
                        )
                            .toUpperCase()
                );

        }


        /*
         * ================================================================
         * AREA
         * ================================================================
         */

        if (
            filter.area
        ) {

            findings =
                findings.filter(
                    finding =>
                        String(
                            finding.area ||
                            ""
                        )
                            .toUpperCase() ===
                        String(
                            filter.area
                        )
                            .toUpperCase()
                );

        }


        /*
         * ================================================================
         * RENDER
         * ================================================================
         */

        this.renderQCFindings(
            findings
        );


        /*
         * ================================================================
         * ACTIVE FILTER TEXT
         * ================================================================
         */

        const active =
            document.getElementById(
                "qcActiveFilter"
            );


        const text =
            document.getElementById(
                "qcActiveFilterText"
            );


        const description =
            document.getElementById(
                "qcFindingDescription"
            );


        const filters = [];


        if (
            filter.severity
        ) {

            filters.push(
                String(
                    filter.severity
                )
                    .toUpperCase()
            );

        }


        if (
            filter.area
        ) {

            filters.push(
                String(
                    filter.area
                )
                    .toUpperCase()
            );

        }


        if (
            filters.length
        ) {

            if (
                active
            ) {

                active.style.display =
                    "flex";

            }


            if (
                text
            ) {

                text.textContent =
                    filters.join(
                        " / "
                    );

            }


            if (
                description
            ) {

                description.textContent =
                    "Finding berdasarkan filter aktif";

            }

        }
        else {

            if (
                active
            ) {

                active.style.display =
                    "none";

            }


            if (
                description
            ) {

                description.textContent =
                    "Semua temuan QC";

            }

        }


        /*
         * ================================================================
         * ACTIVE CARD
         * ================================================================
         */

        document
            .querySelectorAll(
                ".qc-severity-card"
            )
            .forEach(
                card => {

                    card.classList.remove(
                        "active"
                    );

                    if (
                        filter.severity &&
                        card.dataset.severity ===
                        filter.severity
                    ) {

                        card.classList.add(
                            "active"
                        );

                    }

                }
            );

        document
            .querySelectorAll(
                ".qc-area-card"
            )
            .forEach(
                card => {

                    card.classList.remove(
                        "active"
                    );

                    if (
                        filter.area &&
                        card.dataset.qcArea ===
                        filter.area
                    ) {

                        card.classList.add(
                            "active"
                        );

                    }

                }
            );

    },


    /******************************************************************************
     * REGISTER QC CONTROL TOWER
     ******************************************************************************/

    registerQCControlTower() {

        /*
         * ================================================================
         * SEVERITY CARDS
         * ================================================================
         */

        const severityCards =
            document.querySelectorAll(
                ".qc-severity-card"
            );


        severityCards.forEach(
            card => {

                card.addEventListener(
                    "click",
                    () => {

                        const severity =
                            card.dataset.severity;


                        this.filterQCFindings(
                            {
                                severity:
                                    severity
                            }
                        );

                    }
                );

            }
        );


        /*
         * ================================================================
         * RESET BUTTON
         * ================================================================
         */

        const reset =
            document.getElementById(
                "qcResetFilter"
            );


        if (
            reset
        ) {

            reset.addEventListener(
                "click",
                () => {

                    this.filterQCFindings();

                }
            );

        }

        /*
         * ================================================================
         * CLEAR FILTER
         * ================================================================
         */

        const clear =
            document.getElementById(
                "qcClearFilter"
            );


        if (
            clear
        ) {

            clear.addEventListener(
                "click",
                () => {

                    this.filterQCFindings();

                }
            );

        }

    },

    /**************************************************************************
     * BADGE STATUS
     **************************************************************************/

    getBadge(
        status
    ) {

        switch (
        String(
            status || ""
        )
            .trim()
            .toUpperCase()
        ) {

            case "A":

                return `
                    <span class="badge badge-success">
                        AKTIF
                    </span>
                `;


            case "BL":

                return `
                    <span class="badge badge-bl">
                        BELUM LENGKAP
                    </span>
                `;


            case "E":

                return `
                    <span class="badge badge-warning">
                        EXPIRED
                    </span>
                `;


            case "D":

                return `
                    <span class="badge badge-danger">
                        NON AKTIF
                    </span>
                `;


            default:

                return `
                    <span class="badge badge-info">
                        ${this.escapeHtml(
                    status || "-"
                )}
                    </span>
                `;

        }

    },


    /**************************************************************************
     * PRIORITY BADGE
     **************************************************************************/

    getPriorityBadge(
        item
    ) {

        const priority =
            this.getPriority(
                item
            );


        const classMap = {

            CRITICAL:
                "high",

            HIGH:
                "high",

            MEDIUM:
                "medium",

            LOW:
                "low"

        };


        const cls =
            classMap[
            priority.code
            ] ||
            "low";


        return `
            <span class="priority ${cls}">
                ${priority.label}
            </span>
        `;

    },


    /**************************************************************************
     * REMAINING DAYS
     **************************************************************************/

    getRemainingDays(
        dateValue
    ) {

        const days =
            this.calculateSisaHari(
                dateValue
            );


        if (
            days === null
        ) {

            return "-";

        }


        if (
            days < 0
        ) {

            return `
                <span
                    style="
                        color:#DC2626;
                        font-weight:700;
                    "
                >
                    ${Math.abs(days)} Hari Lewat
                </span>
            `;

        }


        if (
            days === 0
        ) {

            return `
                <span
                    style="
                        color:#DC2626;
                        font-weight:700;
                    "
                >
                    Hari Ini
                </span>
            `;

        }


        return `
            <span>
                ${days} Hari
            </span>
        `;

    },


    /**************************************************************************
     * FORMAT DATE
     **************************************************************************/

    formatDate(
        dateValue
    ) {

        const date =
            this.parseDate(
                dateValue
            );


        if (
            !date
        ) {

            return "-";

        }


        return date.toLocaleDateString(
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

    },

    /**************************************************************************
     * UPDATE SUMMARY
     **************************************************************************/

    updateSummary() {

        const data =
            this.state.filtered;


        const total =
            data.length;


        let lengkap =
            0;

        let belum =
            0;

        let expired =
            0;

        let nonaktif =
            0;

        let soon =
            0;


        data.forEach(
            item => {

                const status =
                    this.normalize(
                        this.getValue(
                            item,
                            "status_agunan"
                        )
                    )
                        .toUpperCase();


                const quality =
                    this.getRowQuality(
                        item
                    );


                /*
                 * STATUS AGUNAN
                 */

                if (
                    status === "A"
                ) {

                    lengkap++;

                }


                if (
                    status === "BL"
                ) {

                    belum++;

                }


                if (
                    status === "E"
                ) {

                    expired++;

                }


                if (
                    status === "D"
                ) {

                    nonaktif++;

                }


                /*
                 * APPRAISAL WARNING
                 */

                if (
                    quality.appraisal.code ===
                    "WARNING"
                ) {

                    soon++;

                }

            }
        );


        /*
         * ================================================================
         * PROGRESS QC
         * ================================================================
         *
         * Bukan lagi:
         *
         * status A / total
         *
         * tetapi rata-rata quality score.
         */

        const relevantTotal =
            lengkap +
            belum +
            expired;


        const qualityPercent =
            relevantTotal === 0
                ? 0
                : Math.round(
                    (
                        lengkap /
                        relevantTotal
                    ) *
                    100
                );


        /*
         * PROGRESS
         */

        const elPercent =
            document.getElementById(
                "progressPercent"
            );


        if (
            elPercent
        ) {

            elPercent.textContent =
                qualityPercent +
                "%";

        }


        const elValue =
            document.getElementById(
                "progressValue"
            );


        if (
            elValue
        ) {

            elValue.style.width =
                qualityPercent +
                "%";

        }


        /*
         * PRIORITY SUMMARY
         */

        this.setText(
            "totalLengkap",
            lengkap
        );


        this.setText(
            "totalBL",
            belum
        );


        this.setText(
            "totalSoon",
            soon
        );


        this.setText(
            "totalExpired",
            expired
        );


        this.setText(
            "totalNonaktif",
            nonaktif
        );

        /*
 * ================================================================
 * QC FINDING ENGINE — STEP 7B
 * ================================================================
 */

        const qcFinding =
            this.getQCFindingSummary();

        console.log(
            "MONITORING 7B QC FINDINGS:",
            qcFinding.summary
        );

        console.table(
            qcFinding.summary
        );

        console.log(
            "MONITORING 7B ALL FINDINGS:",
            qcFinding.findings
        );

        console.table(
            qcFinding.findings
        );

        console.log(
            "MONITORING 7A SUMMARY:",
            {

                total:
                    total,

                aktif:
                    lengkap,

                belumLengkap:
                    belum,

                expired:
                    expired,

                nonaktif:
                    nonaktif,

                appraisalSoon:
                    soon,

                qcCompleteness:
                    qualityPercent

            }
        );

    },


    /**************************************************************************
     * UPDATE KPI
     **************************************************************************/

    updateKPI() {

        const data =
            this.state.filtered;


        const total =
            data.length;


        let lengkap =
            0;

        let belum =
            0;

        let expired =
            0;

        let nonaktif =
            0;

        let soon =
            0;


        let totalQuality =
            0;


        data.forEach(
            item => {

                const status =
                    this.normalize(
                        this.getValue(
                            item,
                            "status_agunan"
                        )
                    )
                        .toUpperCase();


                if (
                    status === "A"
                ) {

                    lengkap++;

                }


                if (
                    status === "BL"
                ) {

                    belum++;

                }


                if (
                    status === "E"
                ) {

                    expired++;

                }


                if (
                    status === "D"
                ) {

                    nonaktif++;

                }


                const appraisal =
                    this.getAppraisalStatus(
                        item
                    );


                if (
                    appraisal.code ===
                    "WARNING"
                ) {

                    soon++;

                }


                totalQuality +=
                    this.getQualityScore(
                        item
                    );

            }
        );


        const quality =
            total === 0
                ? 0
                : Math.round(
                    totalQuality /
                    total
                );


        this.setText(
            "kpiTotal",
            total
        );


        this.setText(
            "kpiLengkap",
            lengkap
        );


        this.setText(
            "kpiBelum",
            belum
        );


        this.setText(
            "kpiSoon",
            soon
        );


        this.setText(
            "kpiExpired",
            expired
        );


        this.setText(
            "kpinonaktif",
            nonaktif
        );


        /*
         * TOOLBAR
         */

        this.setText(
            "toolbarTotal",
            total
        );


        console.log(
            "MONITORING 7A KPI:",
            {

                total:
                    total,

                lengkap:
                    lengkap,

                belum:
                    belum,

                soon:
                    soon,

                expired:
                    expired,

                nonaktif:
                    nonaktif,

                quality:
                    quality

            }
        );

    },


    /**************************************************************************
     * SET TEXT
     **************************************************************************/

    setText(
        elementId,
        value
    ) {

        const el =
            document.getElementById(
                elementId
            );


        if (
            !el
        ) {

            return;

        }


        el.textContent =
            Number(
                value
            ).toLocaleString(
                "id-ID"
            );

    },


    /**************************************************************************
     * ROW CLASS
     **************************************************************************/

    getRowClass(
        item
    ) {

        const quality =
            this.getRowQuality(
                item
            );


        const priority =
            this.getPriority(
                item
            );


        if (
            priority.code ===
            "CRITICAL"
        ) {

            return "row-expired";

        }


        if (
            priority.code ===
            "HIGH"
        ) {

            return "row-warning";

        }


        if (
            quality.score < 95
        ) {

            return "row-bl";

        }


        return "";

    },


    /**************************************************************************
     * RENDER PROGRESS
     **************************************************************************/

    getProgress(
        item
    ) {

        const quality =
            this.getRowQuality(
                item
            );


        const percent =
            quality.score;


        let cls =
            "success";


        if (
            percent < 70
        ) {

            cls =
                "danger";

        }
        else if (
            percent < 95
        ) {

            cls =
                "warning";

        }


        return `
            <div class="progress-table">

                <div class="progress-track">

                    <div
                        class="progress-fill ${cls}"
                        style="
                            width:${percent}%;
                        "
                    ></div>

                </div>

                <span class="progress-percent">
                    ${percent}%
                </span>

            </div>
        `;

    },


    /**************************************************************************
     * RENDER TABLE
     **************************************************************************/

    renderTable() {

        const tbody =
            document.querySelector(
                "#tblMonitoring tbody"
            );


        if (
            !tbody
        ) {

            return;

        }


        tbody.innerHTML =
            "";


        if (
            this.state.filtered.length === 0
        ) {

            tbody.innerHTML = `
                <tr>

                    <td
                        colspan="11"
                        style="
                            padding:40px;
                            text-align:center;
                        "
                    >

                        Tidak ada data monitoring.

                    </td>

                </tr>
            `;


            this.updatePageInfo();

            return;

        }


        const start =
            (
                this.state.page -
                1
            ) *
            this.state.pageSize;


        const end =
            start +
            this.state.pageSize;


        const rows =
            this.state.filtered.slice(
                start,
                end
            );


        rows.forEach(
            (
                item,
                index
            ) => {

                const jenisDokumen =
                    this.getValue(
                        item,
                        "jenis_dokumen"
                    );


                const noAgunan =
                    this.getValue(
                        item,
                        "no_agunan"
                    );


                const cif =
                    this.getValue(
                        item,
                        "cif_debitur"
                    );


                const namaDebitur =
                    this.getValue(
                        item,
                        "nama_pemilik_agunan"
                    );


                const cabang =
                    this.getValue(
                        item,
                        "kode_cabang"
                    );


                const statusAgunan =
                    this.normalize(
                        this.getValue(
                            item,
                            "status_agunan"
                        )
                    )
                        .toUpperCase();


                const expiredDate =
                    this.getValue(
                        item,
                        "tanggal_expired_appraisal"
                    );


                tbody.innerHTML += `

                    <tr
                        class="${this.getRowClass(
                    item
                )}"
                    >

                        <td>
                            ${start +
                    index +
                    1
                    }
                        </td>


                        <td>
                            ${this.escapeHtml(
                        jenisDokumen
                    )}
                        </td>


                        <td>
                            ${this.escapeHtml(
                        noAgunan
                    )}
                        </td>


                        <td>
                            ${this.escapeHtml(
                        cif
                    )}
                        </td>


                        <td>
                            ${this.escapeHtml(
                        namaDebitur
                    )}
                        </td>


                        <td>
                            ${this.escapeHtml(
                        cabang
                    )}
                        </td>


                        <td>
                            ${this.getBadge(
                        statusAgunan
                    )}
                        </td>


                        <td>
                            ${this.formatDate(
                        expiredDate
                    )}
                        </td>


                        <td>
                            ${this.getRemainingDays(
                        expiredDate
                    )}
                        </td>


                        <td>
                            ${this.getPriorityBadge(
                        item
                    )}
                        </td>


                        <td>
                            ${this.getProgress(
                        item
                    )}
                        </td>

                    </tr>

                `;

            }
        );


        this.updatePageInfo();

    },


    /**************************************************************************
     * APPLY FILTER
     **************************************************************************/

    applyFilter() {

        const keyword =
            this.normalize(
                this.state.filter.keyword
            )
                .toLowerCase();


        const cabang =
            this.normalize(
                this.state.filter.cabang
            )
                .toUpperCase();


        const status =
            this.normalize(
                this.state.filter.status
            )
                .toUpperCase();


        const dokumen =
            this.normalize(
                this.state.filter.dokumen
            )
                .toUpperCase();


        this.state.filtered =
            this.state.data.filter(
                item => {

                    const itemJenis =
                        this.normalize(
                            this.getValue(
                                item,
                                "jenis_dokumen"
                            )
                        )
                            .toUpperCase();


                    const itemNo =
                        this.normalize(
                            this.getValue(
                                item,
                                "no_agunan"
                            )
                        )
                            .toLowerCase();


                    const itemCif =
                        this.normalize(
                            this.getValue(
                                item,
                                "cif_debitur"
                            )
                        )
                            .toLowerCase();


                    const itemNama =
                        this.normalize(
                            this.getValue(
                                item,
                                "nama_pemilik_agunan"
                            )
                        )
                            .toLowerCase();


                    const itemStatus =
                        this.normalize(
                            this.getValue(
                                item,
                                "status_agunan"
                            )
                        )
                            .toUpperCase();


                    const itemCabang =
                        this.normalize(
                            this.getValue(
                                item,
                                "kode_cabang"
                            )
                        )
                            .toUpperCase();


                    const searchable =
                        [

                            itemJenis,

                            itemNo,

                            itemCif,

                            itemNama,

                            itemStatus,

                            itemCabang

                        ]
                            .join(" ")
                            .toLowerCase();


                    const matchKeyword =
                        keyword === "" ||
                        searchable.includes(
                            keyword
                        );


                    const matchCabang =
                        cabang === "" ||
                        itemCabang ===
                        cabang;


                    const matchStatus =
                        status === "" ||
                        itemStatus ===
                        status;


                    const matchDokumen =
                        dokumen === "" ||
                        itemJenis ===
                        dokumen;


                    return (
                        matchKeyword &&
                        matchCabang &&
                        matchStatus &&
                        matchDokumen
                    );

                }
            );


        this.state.page =
            1;


        /*
         * UPDATE SEMUA KOMPONEN
         */

        this.updateSummary();

        this.updateKPI();

        this.renderTable();

        this.renderQCControlTower();

        console.log(
            "MONITORING 7A FILTER:",
            {

                keyword:
                    keyword,

                cabang:
                    cabang,

                status:
                    status,

                dokumen:
                    dokumen,

                result:
                    this.state.filtered.length

            }
        );

    },


    /**************************************************************************
     * PAGE INFO
     **************************************************************************/

    updatePageInfo() {

        const total =
            this.state.filtered.length;


        const totalPage =
            Math.max(
                1,
                Math.ceil(
                    total /
                    this.state.pageSize
                )
            );


        const page =
            Math.min(
                Math.max(
                    1,
                    this.state.page
                ),
                totalPage
            );


        this.state.page =
            page;


        const el =
            document.getElementById(
                "pageInfo"
            );


        if (
            el
        ) {

            el.textContent =
                `Page ${page} of ${totalPage}`;

        }

    },


    /**************************************************************************
     * REGISTER EVENT
     **************************************************************************/

    registerEvent() {

        /*
         * SEARCH
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

                    this.state.filter.keyword =
                        event.target.value;


                    this.applyFilter();

                }
            );

        }


        /*
         * CABANG
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

                    this.state.filter.cabang =
                        event.target.value;


                    this.applyFilter();

                }
            );

        }


        /*
         * STATUS
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

                    this.state.filter.status =
                        event.target.value;


                    this.applyFilter();

                }
            );

        }


        /*
         * JENIS DOKUMEN
         */

        const filterDokumen =
            document.getElementById(
                "filterDokumen"
            );


        if (
            filterDokumen
        ) {

            filterDokumen.addEventListener(
                "change",
                event => {

                    this.state.filter.dokumen =
                        event.target.value;


                    this.applyFilter();

                }
            );

        }


        /*
         * REFRESH
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
                async event => {

                    const btn =
                        event.currentTarget;


                    btn.disabled =
                        true;


                    const original =
                        btn.innerHTML;


                    btn.innerHTML =
                        `
                            <i class="
                                fa-solid
                                fa-spinner
                                fa-spin
                            "></i>
                            Refreshing...
                        `;


                    try {

                        await this.loadData();

                    }
                    finally {

                        btn.disabled =
                            false;


                        btn.innerHTML =
                            original;

                    }

                }
            );

        }


        /*
         * BACK
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
         * PREVIOUS
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

                    if (
                        this.state.page >
                        1
                    ) {

                        this.state.page--;

                        this.renderTable();

                    }

                }
            );

        }


        /*
         * NEXT
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

                    const totalPage =
                        Math.max(
                            1,
                            Math.ceil(
                                this.state.filtered.length /
                                this.state.pageSize
                            )
                        );


                    if (
                        this.state.page <
                        totalPage
                    ) {

                        this.state.page++;

                        this.renderTable();

                    }

                }
            );

        }

    },

    /**************************************************************************
 * STEP 7D.3
 * OPEN QC FINDING DETAIL
 *
 * READ ONLY
 *
 * Flow:
 *
 * Audit Finding
 *      ↓
 * No Agunan
 *      ↓
 * getAgunanById
 *      ↓
 * Full DATA_AGUNAN Profile
 *
 * Tidak ada CREATE / UPDATE / DELETE.
 **************************************************************************/

    async openQCFindingDetail(
        finding
    ) {

        /*
         * ================================================================
         * VALIDASI FINDING
         * ================================================================
         */

        if (
            !finding
        ) {

            console.warn(
                "QC FINDING DETAIL: Finding tidak tersedia."
            );

            return;

        }


        /*
         * ================================================================
         * MODAL
         * ================================================================
         */

        const modal =
            document.getElementById(
                "qcFindingModal"
            );


        if (
            !modal
        ) {

            console.warn(
                "QC FINDING DETAIL: Modal tidak ditemukan."
            );

            return;

        }


        /*
         * ================================================================
         * ACTIVE FINDING
         * ================================================================
         */

        this.activeQCFinding =
            finding;


        /*
         * ================================================================
         * FIELD HELPER
         * ================================================================
         */

        const setText =
            (
                id,
                value
            ) => {

                const element =
                    document.getElementById(
                        id
                    );


                if (
                    !element
                ) {

                    return;

                }


                element.textContent =
                    value === null ||
                        value === undefined ||
                        String(value).trim() === ""
                        ? "-"
                        : String(value);

            };


        /*
         * ================================================================
         * DATE FORMATTER
         * ================================================================
         */

        const formatAuditDate =
            (
                value
            ) => {

                if (
                    value === null ||
                    value === undefined
                ) {

                    return "-";

                }


                const raw =
                    String(
                        value
                    ).trim();


                if (
                    !raw ||
                    raw === "-"
                ) {

                    return "-";

                }


                /*
                 * ISO DATE
                 *
                 * YYYY-MM-DD
                 */

                const isoMatch =
                    raw.match(
                        /^(\d{4})-(\d{2})-(\d{2})/
                    );


                if (
                    isoMatch
                ) {

                    return (
                        isoMatch[3] +
                        "-" +
                        isoMatch[2] +
                        "-" +
                        isoMatch[1]
                    );

                }


                /*
                 * DATE OBJECT / OTHER VALID DATE
                 */

                const date =
                    new Date(
                        raw
                    );


                if (
                    !Number.isNaN(
                        date.getTime()
                    )
                ) {

                    const day =
                        String(
                            date.getDate()
                        ).padStart(
                            2,
                            "0"
                        );


                    const month =
                        String(
                            date.getMonth() + 1
                        ).padStart(
                            2,
                            "0"
                        );


                    const year =
                        date.getFullYear();


                    return (
                        day +
                        "-" +
                        month +
                        "-" +
                        year
                    );

                }


                return raw;

            };


        /*
         * ================================================================
         * NUMBER FORMATTER
         * ================================================================
         */

        const formatAuditNumber =
            (
                value
            ) => {

                if (
                    value === null ||
                    value === undefined
                ) {

                    return "-";

                }


                const raw =
                    String(
                        value
                    ).trim();


                if (
                    !raw ||
                    raw === "-"
                ) {

                    return "-";

                }


                const number =
                    Number(
                        raw.replace(
                            /[^0-9.-]/g,
                            ""
                        )
                    );


                if (
                    Number.isNaN(
                        number
                    )
                ) {

                    return raw;

                }


                return number.toLocaleString(
                    "id-ID"
                );

            };


        /*
         * ================================================================
         * FINDING HEADER
         * ================================================================
         */

        setText(
            "qcDetailSeverity",
            finding.severity
        );


        setText(
            "qcDetailArea",
            finding.area
        );


        /*
         * ================================================================
         * IDENTITAS DARI FINDING
         * ================================================================
         *
         * Ditampilkan langsung terlebih dahulu
         * sebelum API detail selesai.
         */

        setText(
            "qcJenisDokumen",
            finding.jenis_dokumen
        );

        setText(
            "qcDetailNoAgunan",
            finding.no_agunan
        );

        setText(
            "qcDetailCif",
            finding.cif_debitur
        );

        setText(
            "qcDetailCabang",
            finding.kode_cabang
        );


        /*
         * ================================================================
         * FINDING
         * ================================================================
         */

        setText(
            "qcDetailField",
            finding.field
        );


        setText(
            "qcDetailFinding",
            finding.message
        );


        setText(
            "qcDetailDescription",
            finding.detail
        );


        /*
         * ================================================================
         * TAMPILKAN MODAL
         * ================================================================
         *
         * Modal dibuka terlebih dahulu.
         * Data master kemudian dimuat secara async.
         */

        modal.classList.add(
            "show"
        );


        modal.setAttribute(
            "aria-hidden",
            "false"
        );


        document.body.style.overflow =
            "hidden";


        /*
         * ================================================================
         * LOADING PROFILE
         * ================================================================
         */

        const loadingFields = [

            "qcDetailNama",
            "qcDetailRekening",
            "qcDetailProduk",
            "qcDetailStatus",
            "qcDetailJenisDokumen",
            "qcDetailBuktiKepemilikan",
            "qcDetailPenyimpanan",
            "qcDetailAsliCopy",
            "qcDetailLokasiDocument",
            "qcDetailDocumentDescription",
            "qcDetailNjop",
            "qcDetailTanggalPenilaian",
            "qcDetailJenisPenilaian",
            "qcDetailPenilaianJatuhTempo",
            "qcDetailTanggalPengikatan",
            "qcDetailStatusAgunan",
            "qcDetailAgunanAsuransi",
            "qcDetailAwalAsuransi",
            "qcDetailJatuhTempoAsuransi",
            "qcDetailStatusParipasu",
            "qcDetailPersentaseParipasu",
            "qcDetailJointAccount",
            "qcDetailAlamat",
            "qcDetailRt",
            "qcDetailRw",
            "qcDetailKelurahan",
            "qcDetailKecamatan",
            "qcDetailKota",
            "qcDetailProvinsi",
            "qcDetailKodepos",
            "qcDetailExpiredAppraisal",
            "qcDetailCatatan"

        ];


        loadingFields.forEach(
            id => {

                setText(
                    id,
                    "Memuat..."
                );

            }
        );


        /*
         * ================================================================
         * DIGITAL EVIDENCE LOADING
         * ================================================================
         */

        const digitalFileElement =
            document.getElementById(
                "qcDetailDigitalFile"
            );


        if (
            digitalFileElement
        ) {

            digitalFileElement.innerHTML = `
            <span class="qc-evidence-empty">
                Memuat evidence...
            </span>
        `;

        }


        /*
         * ================================================================
         * NORMALIZE MASTER VALUE
         * ================================================================
         */

        let agunan =
            null;


        try {

            /*
             * ============================================================
             * PRIORITY 1
             * GET DETAIL LANGSUNG DARI API
             * ============================================================
             *
             * Jangan menggunakan API.getAgunanById()
             * karena wrapper API saat ini menggunakan parameter:
             *
             * id
             *
             * sedangkan backend meminta:
             *
             * no_agunan
             *
             * Oleh karena itu kita gunakan API.get()
             * secara langsung.
             */

            if (
                typeof API !==
                "undefined" &&
                typeof API.get ===
                "function"
            ) {

                const noAgunan =
                    String(
                        finding.no_agunan || ""
                    ).trim();


                if (
                    noAgunan
                ) {

                    console.log(
                        "MONITORING 7D: Loading detail agunan:",
                        noAgunan
                    );


                    const response =
                        await API.get(
                            "getAgunanById",
                            {
                                no_agunan:
                                    noAgunan,

                                token:
                                    typeof API.getToken ===
                                        "function"
                                        ? API.getToken()
                                        : ""
                            }
                        );


                    console.log(
                        "MONITORING 7D: Detail API response:",
                        response
                    );


                    if (
                        response &&
                        response.success === true &&
                        response.data
                    ) {

                        agunan =
                            response.data;

                    }

                }

            }

        }
        catch (
        error
        ) {

            console.warn(
                "MONITORING 7D: API detail gagal, menggunakan fallback master data.",
                error
            );

        }


        /*
         * ================================================================
         * PRIORITY 2 — FALLBACK STATE DATA
         * ================================================================
         *
         * Jika API detail gagal, kita tetap coba mencari
         * dari data yang sudah dimuat monitoring.
         */

        if (
            !agunan
        ) {

            const masterData =
                Array.isArray(
                    this.state?.data
                )
                    ? this.state.data
                    : [];


            const findingNoAgunan =
                this.normalize(
                    finding.no_agunan
                ).toUpperCase();


            agunan =
                masterData.find(
                    item => {

                        const itemNoAgunan =
                            this.normalize(
                                this.getValue(
                                    item,
                                    "no_agunan"
                                )
                            ).toUpperCase();


                        return (
                            itemNoAgunan ===
                            findingNoAgunan
                        );

                    }
                ) || null;

        }


        /*
         * ================================================================
         * GET MASTER VALUE
         * ================================================================
         */

        const getAgunanValue =
            (
                field
            ) => {

                if (
                    !agunan
                ) {

                    return "-";

                }


                /*
                 * Gunakan getValue()
                 * agar case-insensitive terhadap header.
                 */

                if (
                    typeof this.getValue ===
                    "function"
                ) {

                    const value =
                        this.getValue(
                            agunan,
                            field
                        );


                    if (
                        value !== null &&
                        value !== undefined &&
                        String(value).trim() !== ""
                    ) {

                        return value;

                    }


                    return "-";

                }


                /*
                 * Fallback direct access
                 */

                const value =
                    agunan[field];


                if (
                    value === null ||
                    value === undefined ||
                    String(value).trim() === ""
                ) {

                    return "-";

                }


                return value;

            };


        /*
         * ================================================================
         * DATA AGUNAN TIDAK DITEMUKAN
         * ================================================================
         */

        if (
            !agunan
        ) {

            console.warn(
                "MONITORING 7D: Data agunan tidak ditemukan:",
                finding.no_agunan
            );


            loadingFields.forEach(
                id => {

                    setText(
                        id,
                        "-"
                    );

                }
            );


            if (
                digitalFileElement
            ) {

                digitalFileElement.innerHTML = `
                <span class="qc-evidence-empty">
                    Evidence tidak tersedia
                </span>
            `;

            }


            console.log(
                "MONITORING 7D: Finding detail opened.",
                finding
            );


            return;

        }


        /*
         * ================================================================
         * MASTER DATA — IDENTITAS
         * ================================================================
         */

        setText(
            "qcDetailNama",
            getAgunanValue(
                "nama_pemilik_agunan"
            )
        );


        setText(
            "qcDetailRekening",
            getAgunanValue(
                "no_rek_fasilitas"
            )
        );


        setText(
            "qcDetailProduk",
            getAgunanValue(
                "produk"
            )
        );


        setText(
            "qcDetailStatus",
            getAgunanValue(
                "status_agunan"
            )
        );


        /*
         * ================================================================
         * DOCUMENT & CUSTODY
         * ================================================================
         */

        setText(
            "qcDetailJenisDokumen",
            getAgunanValue(
                "jenis_dokumen"
            )
        );


        setText(
            "qcDetailBuktiKepemilikan",
            getAgunanValue(
                "bukti_kepemilikan"
            )
        );


        setText(
            "qcDetailPenyimpanan",
            getAgunanValue(
                "penyimpanan_agunan"
            )
        );


        setText(
            "qcDetailAsliCopy",
            getAgunanValue(
                "asli_copy"
            )
        );


        setText(
            "qcDetailLokasiDocument",
            getAgunanValue(
                "lokasi_document"
            )
        );


        setText(
            "qcDetailDocumentDescription",
            getAgunanValue(
                "document_description"
            )
        );


        /*
         * ================================================================
         * PENILAIAN & PENGIKATAN
         * ================================================================
         */

        setText(
            "qcDetailNjop",
            formatAuditNumber(
                getAgunanValue(
                    "nilai_njop"
                )
            )
        );

        setText(
            "qcDetailValue",
            formatAuditNumber(
                getAgunanValue(
                    "nilai_njop"
                )
            )
        );

        setText(
            "qcDetailTanggalPenilaian",
            formatAuditDate(
                getAgunanValue(
                    "tanggal_penilaian_agunan"
                )
            )
        );


        setText(
            "qcDetailJenisPenilaian",
            getAgunanValue(
                "jenis_penilaian"
            )
        );


        setText(
            "qcDetailPenilaianJatuhTempo",
            formatAuditDate(
                getAgunanValue(
                    "tanggal_penilaian_jatuh_tempo"
                )
            )
        );

        setText(
            "qcDetailTanggalPengikatan",
            formatAuditDate(
                getAgunanValue(
                    "tanggal_pengikatan"
                )
            )
        );


        setText(
            "qcDetailStatusAgunan",
            getAgunanValue(
                "status_agunan"
            )
        );

        /*
         * ================================================================
         * ASURANSI & PARIPASU
         * ================================================================
         */
        setText(
            "qcDetailAgunanAsuransi",
            getAgunanValue(
                "agunan_asuransi"
            )
        );

        setText(
            "qcDetailAwalAsuransi",
            formatAuditDate(
                getAgunanValue(
                    "tanggal_awal_asuransi"
                )
            )
        );

        setText(
            "qcDetailJatuhTempoAsuransi",
            formatAuditDate(
                getAgunanValue(
                    "tanggal_jatuh_tempo_asuransi"
                )
            )
        );

        setText(
            "qcDetailStatusParipasu",
            getAgunanValue(
                "status_paripasu"
            )
        );

        setText(
            "qcDetailPersentaseParipasu",
            getAgunanValue(
                "persentase_paripasu"
            )
        );

        setText(
            "qcDetailJointAccount",
            getAgunanValue(
                "joint_account"
            )
        );

        /*
         * ================================================================
         * LOKASI AGUNAN
         * ================================================================
         */

        setText(
            "qcDetailAlamat",
            getAgunanValue(
                "alamat_agunan"
            )
        );


        setText(
            "qcDetailRt",
            getAgunanValue(
                "rt"
            )
        );


        setText(
            "qcDetailRw",
            getAgunanValue(
                "rw"
            )
        );


        setText(
            "qcDetailKelurahan",
            getAgunanValue(
                "kelurahan"
            )
        );


        setText(
            "qcDetailKecamatan",
            getAgunanValue(
                "kecamatan"
            )
        );


        setText(
            "qcDetailKota",
            getAgunanValue(
                "kota_kabupaten"
            )
        );


        setText(
            "qcDetailProvinsi",
            getAgunanValue(
                "provinsi"
            )
        );


        setText(
            "qcDetailKodepos",
            getAgunanValue(
                "kodepos"
            )
        );


        /*
         * ================================================================
         * CATATAN
         * ================================================================
         */

        setText(
            "qcDetailExpiredAppraisal",
            formatAuditDate(
                getAgunanValue(
                    "tanggal_expired_appraisal"
                )
            )
        );


        setText(
            "qcDetailCatatan",
            getAgunanValue(
                "catatan_tambahan"
            )
        );


        /*
         * ================================================================
         * STATUS HEADER
         * ================================================================
         */

        setText(
            "qcDetailStatus",
            getAgunanValue(
                "status_agunan"
            )
        );


        /*
         * ================================================================
         * DIGITAL EVIDENCE
         * ================================================================
         */

        if (
            digitalFileElement
        ) {

            const digitalFile =
                getAgunanValue(
                    "digital_file_link"
                );


            if (
                digitalFile === "-"
            ) {

                digitalFileElement.innerHTML = `
                <span class="qc-evidence-empty">
                    Evidence tidak tersedia
                </span>
            `;

            }
            else {

                let safeUrl =
                    "";


                try {

                    const parsedUrl =
                        new URL(
                            String(
                                digitalFile
                            ).trim()
                        );


                    if (
                        parsedUrl.protocol ===
                        "http:" ||
                        parsedUrl.protocol ===
                        "https:"
                    ) {

                        safeUrl =
                            parsedUrl.href;

                    }

                }
                catch (
                error
                ) {

                    console.warn(
                        "QC EVIDENCE: URL tidak valid.",
                        digitalFile
                    );

                }


                if (
                    safeUrl
                ) {

                    digitalFileElement.innerHTML = `

                    <a
                        class="qc-evidence-link"
                        href="${this.escapeHtml(
                        safeUrl
                    )}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >

                        <i class="fa-solid fa-file-arrow-up"></i>

                        Buka Evidence

                        <i class="fa-solid fa-arrow-up-right-from-square"></i>

                    </a>

                `;

                }
                else {

                    digitalFileElement.innerHTML = `

                    <span class="qc-evidence-empty">
                        Evidence tidak valid
                    </span>

                `;

                }

            }

        }


        /*
         * ================================================================
         * FINAL LOG
         * ================================================================
         */

        console.log(
            "MONITORING 7D: Finding detail opened.",
            {
                finding:
                    finding,

                agunan:
                    agunan
            }
        );

    },

    /**************************************************************************
     * CLOSE QC FINDING DETAIL
     **************************************************************************/

    closeQCFindingDetail() {

        const modal =
            document.getElementById(
                "qcFindingModal"
            );


        if (
            !modal
        ) {

            return;

        }

        modal.classList.remove(
            "show"
        );

        modal.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.style.overflow =
            "";

        this.activeQCFinding =
            null;


        console.log(
            "MONITORING 7D: Finding detail closed."
        );

    },


    /**************************************************************************
     * REGISTER QC FINDING MODAL
     **************************************************************************/

    registerQCFindingModal() {

        const modal =
            document.getElementById(
                "qcFindingModal"
            );


        if (
            !modal
        ) {

            console.warn(
                "QC FINDING MODAL tidak ditemukan."
            );

            return;

        }


        /*
         * ================================================================
         * CLOSE BUTTON
         * ================================================================
         */

        const btnClose =
            document.getElementById(
                "qcFindingModalClose"
            );


        if (
            btnClose
        ) {

            btnClose.addEventListener(
                "click",
                () => {

                    this.closeQCFindingDetail();

                }
            );

        }


        /*
         * ================================================================
         * CANCEL BUTTON
         * ================================================================
         */

        const btnCancel =
            document.getElementById(
                "qcFindingModalCancel"
            );


        if (
            btnCancel
        ) {

            btnCancel.addEventListener(
                "click",
                () => {

                    this.closeQCFindingDetail();

                }
            );

        }


        /*
         * ================================================================
         * OVERLAY
         * ================================================================
         */

        const overlay =
            modal.querySelector(
                ".qc-finding-modal-overlay"
            );


        if (
            overlay
        ) {

            overlay.addEventListener(
                "click",
                () => {

                    this.closeQCFindingDetail();

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
                    event.key === "Escape" &&
                    modal.classList.contains("show")
                ) {

                    this.closeQCFindingDetail();

                }

            }
        );


        /*
         * ================================================================
         * VIEW DATA AGUNAN
         * ================================================================
         */
        const btnViewData =
            document.getElementById(
                "qcFindingModalViewData"
            );


        if (
            btnViewData
        ) {

            btnViewData.addEventListener(
                "click",
                () => {

                    /*
                     * Tidak redirect ke:
                     *
                     * input.html
                     * edit_agunan.html
                     * data_agunan.html
                     *
                     * Monitoring tetap READ-ONLY.
                     */

                    const finding =
                        this.activeQCFinding;


                    if (
                        !finding
                    ) {

                        console.warn(
                            "QC FINDING: Active finding tidak tersedia."
                        );

                        return;

                    }

                    console.log(
                        "MONITORING READ-ONLY: Profil agunan sedang ditampilkan.",
                        finding.no_agunan
                    );

                    /*
                     * Fokus kembali ke profil agunan
                     * di dalam modal.
                     */

                    const profileSection =
                        document.querySelector(
                            "#qcFindingModal .qc-detail-section"
                        );


                    if (
                        profileSection
                    ) {

                        profileSection.scrollIntoView({
                            behavior: "smooth",
                            block: "start"
                        });

                    }

                }
            );

        }

        console.log(
            "MONITORING 7D: QC finding modal registered."
        );

    },

    /**************************************************************************
     * ESCAPE HTML
     **************************************************************************/

    escapeHtml(
        value
    ) {

        return String(
            value === null ||
                value === undefined
                ? ""
                : value
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

};

/******************************************************************************
 * START
 ******************************************************************************/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        MONITORING.init();

    }
);