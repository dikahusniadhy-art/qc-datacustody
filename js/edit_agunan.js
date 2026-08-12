/******************************************************************************
 *
 * EDIT DATA AGUNAN CUSTODY
 * FILE      : edit_agunan.js
 * VERSION   : 2.0 TIMEZONE FIX
 *
 ******************************************************************************/

const EDIT_AGUNAN = {

    /**********************************************************************
     * STATE
     **********************************************************************/
    id: null,
    data: null,
    loading: false,

    /**********************************************************************
     * INIT
     **********************************************************************/
    async init() {
        this.id = this.getParameter("id");

        if (!this.id) {
            alert("Nomor Agunan tidak ditemukan.");
            window.location.href = "data_agunan.html";
            return;
        }

        await this.loadData();
        this.registerEvent();
    },

    /**********************************************************************
     * GET URL PARAMETER
     **********************************************************************/
    getParameter(name) {
        const params = new URLSearchParams(window.location.search);
        return params.get(name);
    },

    /**********************************************************************
     * SHOW LOADING
     **********************************************************************/
    showLoading() {
        this.loading = true;
        const loading = document.getElementById("loading");
        if (loading) {
            loading.style.display = "flex";
        }
    },

    /**********************************************************************
     * HIDE LOADING
     **********************************************************************/
    hideLoading() {
        this.loading = false;
        const loading = document.getElementById("loading");
        if (loading) {
            loading.style.display = "none";
        }
    },

    /******************************************************************************
 * LOAD DATA
 ******************************************************************************/

    async loadData() {

        try {

            this.showLoading();


            /*
             * ID NO AGUNAN DARI URL
             */

            const noAgunan =
                String(
                    this.id || ""
                ).trim();


            /*
             * VALIDASI ID
             */

            if (!noAgunan) {

                alert(
                    "Nomor Agunan tidak ditemukan."
                );

                window.location.href =
                    "data_agunan.html";

                return;

            }


            console.log(
                "EDIT AGUNAN ID:",
                noAgunan
            );


            /*
             * AMBIL 1 DATA SAJA
             *
             * Tidak lagi menggunakan:
             *
             * API.getAgunan()
             *
             * karena itu mengambil seluruh data.
             */

            const result =
                await API.getAgunanById(
                    noAgunan
                );


            console.log(
                "EDIT AGUNAN RESPONSE:",
                result
            );


            /*
             * RESPONSE ERROR
             */

            if (
                !result ||
                !result.success
            ) {

                alert(
                    result?.message ||
                    "Data Agunan tidak ditemukan."
                );

                window.location.href =
                    "data_agunan.html";

                return;

            }


            /*
             * SIMPAN DATA
             */

            this.data =
                result.data;


            /*
             * VALIDASI DATA
             */

            if (
                !this.data
            ) {

                alert(
                    "Data Agunan tidak ditemukan."
                );

                window.location.href =
                    "data_agunan.html";

                return;

            }


            /*
             * ISI FORM
             */

            this.fillForm();

        }
        catch (err) {

            console.error(
                "EDIT AGUNAN LOAD ERROR:",
                err
            );


            alert(
                err.message ||
                "Gagal mengambil data agunan."
            );

        }
        finally {

            this.hideLoading();

        }

    },

    /**********************************************************************
     * FORMAT DATE FOR HTML INPUT
     *
     * Backend / Google Sheet (Format Indonesia):
     * dd/MM/yyyy -> contoh: 17/08/2026
     *
     * HTML input date (Wajib Standar ISO Date):
     * yyyy-MM-dd -> contoh: 2026-08-17
     **********************************************************************/
    formatDateForInput(value) {
        if (value === null || value === undefined || value === "") {
            return "";
        }

        const str = String(value).trim();

        /******************************************************************
         * FORMAT yyyy-MM-dd
         * Contoh: 2026-08-17 (Sering dikembalikan oleh backend API kita)
         ******************************************************************/
        let match = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
        if (match) {
            const year = match[1];
            const month = match[2].padStart(2, "0");
            const day = match[3].padStart(2, "0");
            return year + "-" + month + "-" + day;
        }

        /******************************************************************
         * FORMAT dd/MM/yyyy (Standar Indonesia)
         * Contoh: 17/08/2026
         ******************************************************************/
        match = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (match) {
            const day = match[1].padStart(2, "0");
            const month = match[2].padStart(2, "0");
            const year = match[3];

            return year + "-" + month + "-" + day;
        }

        /******************************************************************
         * FORMAT ISO
         * Contoh: 2026-08-17T00:00:00.000Z
         **********************************************************************/
        match = str.match(/^(\d{4})-(\d{2})-(\d{2})T/);
        if (match) {
            // FIX: Parse kembali ke format Date agar kembali ke zona waktu lokal
            const d = new Date(str);
            if (!isNaN(d.getTime())) {
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, "0");
                const day = String(d.getDate()).padStart(2, "0");
                return year + "-" + month + "-" + day;
            }
        }

        console.warn("Format tanggal tidak dikenali:", value);
        return "";
    },

    /**********************************************************************
     * FILL FORM
     **********************************************************************/
    fillForm() {
        Object.keys(this.data).forEach(key => {
            const el = document.getElementById(key);
            if (!el) return;

            let value = this.data[key];

            if (value === null || value === undefined) {
                value = "";
            }

            /**************************************************************
             * DATE
             **************************************************************/
            if (el.type === "date") {
                el.value = this.formatDateForInput(value);
                return;
            }

            /**************************************************************
             * CHECKBOX
             **************************************************************/
            if (el.type === "checkbox") {
                el.checked = (value === true || value === "Y" || value === "1");
                return;
            }

            /**************************************************************
             * RADIO
             **************************************************************/
            if (el.type === "radio") {
                if (el.value == value) {
                    el.checked = true;
                }
                return;
            }

            /**************************************************************
             * NORMAL
             **************************************************************/
            el.value = value;
        });

        /******************************************************************
         * INFO
         ******************************************************************/
        const info = document.getElementById("editInfo");
        if (info) {
            info.innerHTML = "No Agunan : <b>" + this.data.no_agunan + "</b>";
        }

        /******************************************************************
         * LAST UPDATE
         ******************************************************************/
        const lastUpdate = document.getElementById("lastUpdate");
        if (lastUpdate && this.data.timestamp) {
            lastUpdate.innerHTML = this.data.timestamp;
        }
    },

    /**********************************************************************
     * COLLECT FORM DATA
     **********************************************************************/
    collectFormData() {
        const form = document.getElementById("formAgunan");
        const formData = new FormData(form);
        const data = {};

        formData.forEach((value, key) => {
            data[key] = typeof value === "string" ? value.trim() : value;
        });

        /**************************************************************
         * USER LOGIN
         **************************************************************/
        const user = Auth.getUser();
        data.username = user?.username || user?.user_id || user?.email || user?.nama || "";

        return data;
    },

    /**********************************************************************
     * VALIDASI
     **********************************************************************/
    validate(data) {
        const required = [
            { key: "jenis_dokumen", label: "Jenis Dokumen" },
            { key: "kode_cabang", label: "Kode Cabang" },
            { key: "cif_debitur", label: "CIF Debitur" },
            { key: "nama_pemilik_agunan", label: "Nama Pemilik Agunan" },
            { key: "no_rek_fasilitas", label: "Nomor Rekening Fasilitas" },
            { key: "no_agunan", label: "Nomor Agunan" },
            { key: "kode_jenis_agunan", label: "Jenis Agunan" },
            { key: "status_agunan", label: "Status Agunan" }
        ];

        for (const item of required) {
            if (!data[item.key] || String(data[item.key]).trim() === "") {
                alert(item.label + " wajib diisi.");
                const el = document.getElementById(item.key);
                if (el) {
                    el.focus();
                }
                return false;
            }
        }

        return true;
    },

    /**********************************************************************
     * FORMAT DATA
     **********************************************************************/
    formatData(data) {
        const dateFields = [
            "tanggal_penilaian_agunan",
            "tanggal_penilaian_jatuh_tempo",
            "tanggal_awal_asuransi",
            "tanggal_jatuh_tempo_asuransi",
            "tanggal_pengikatan",
            "tanggal_expired_appraisal"
        ];

        Object.keys(data).forEach(key => {
            if (data[key] === null || data[key] === undefined) {
                data[key] = "";
                return;
            }

            if (typeof data[key] === "string") {
                data[key] = data[key].trim();
            }

            /*
             * DATE ONLY
             * Jangan menggunakan new Date().toISOString()
             * karena dapat menyebabkan tanggal mundur 1 hari (timezone shift).
             */
            if (dateFields.includes(key)) {
                const value = String(data[key]).trim();
                if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                    data[key] = value;
                }
            }
        });

        return data;
    },

    /**********************************************************************
     * KONFIRMASI UPDATE
     **********************************************************************/
    confirmUpdate() {
        return confirm("Apakah Anda yakin ingin memperbarui data agunan ini?");
    },

    /**********************************************************************
     * SET BUTTON LOADING
     **********************************************************************/
    setButtonLoading(status = true) {
        const btn = document.getElementById("btnUpdate");
        if (!btn) return;

        btn.disabled = status;

        if (status) {
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Updating...';
        } else {
            btn.innerHTML = '<i class="fa-solid fa-save"></i> Update Data';
        }
    },

    /**********************************************************************
     * RESET FORM
     **********************************************************************/
    resetForm() {
        const form = document.getElementById("formAgunan");
        if (form) {
            form.reset();
        }
    },

    /**********************************************************************
     * UPDATE DATA
     **********************************************************************/
    async updateData() {
        try {

            let data = this.collectFormData();

            data = this.formatData(data);

            if (!this.validate(data)) {
                return;
            }

            if (!this.confirmUpdate()) {
                return;
            }

            this.showLoading();
            this.setButtonLoading(true);

            // FIX:
            // Kirim ID asli + data form
            const result = await API.updateAgunan(
                this.id,
                data
            );

            if (!result.success) {
                alert(
                    result.message ||
                    "Update data gagal."
                );
                return;
            }

            alert(
                "Data Agunan berhasil diperbarui."
            );

            window.location.href =
                "data_agunan.html";

        } catch (err) {

            console.error(err);

            alert(
                err.message ||
                "Terjadi kesalahan saat update data."
            );

        } finally {

            this.hideLoading();

            this.setButtonLoading(false);
        }
    },

    /**********************************************************************
     * REGISTER EVENT
     **********************************************************************/
    registerEvent() {

        // =====================================================
        // FORM SUBMIT
        // =====================================================
        const form = document.getElementById("formAgunan");
        if (form) {
            form.addEventListener("submit", (e) => {
                e.preventDefault();
                this.updateData();
            });
        }

        // =====================================================
        // BUTTON KEMBALI
        // =====================================================
        const btnCancel = document.getElementById("btnCancel");
        if (btnCancel) {
            btnCancel.addEventListener("click", () => {
                if (confirm("Batalkan perubahan dan kembali ke Data Agunan ?")) {
                    window.location.href = "data_agunan.html";
                }
            });
        }

        // =====================================================
        // ENTER = SUBMIT
        // =====================================================
        document.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && e.ctrlKey) {
                e.preventDefault();
                this.updateData();
            }
        });
    }
};

/******************************************************************************
 * DOM READY
 ******************************************************************************/
document.addEventListener("DOMContentLoaded", () => {
    EDIT_AGUNAN.init();
});
