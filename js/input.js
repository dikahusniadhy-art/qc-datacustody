/******************************************************************************
 *
 * DATA AGUNAN CUSTODY
 * FILE      : input.js
 * VERSION   : 1.0 FINAL
 *
 ******************************************************************************/

document.addEventListener("DOMContentLoaded", initialize);

/******************************************************************************
 * INITIALIZE
 ******************************************************************************/

async function initialize() {

    try {

        if (!Auth.check()) {
            return;
        }

        loadUser();

        bindEvent();

        await loadMaster();

        generateNoAgunan();

    }

    catch (err) {

        console.error(err);

        Helper.error(err.message);

    }

}

/******************************************************************************
 * LOAD USER LOGIN
 ******************************************************************************/

function loadUser() {

    const user = Auth.getUser();

    if (!user) return;

    const username = document.getElementById("username");

    if (username) {

        username.textContent = user.nama;

    }

}

/******************************************************************************
 * BIND EVENT
 ******************************************************************************/

function bindEvent() {

    const form = document.getElementById("formAgunan");

    if (form) {

        form.addEventListener("submit", submitForm);

    }

    const btnReset = document.getElementById("btnReset");

    if (btnReset) {

        btnReset.addEventListener("click", resetForm);

    }

}

/******************************************************************************
 * LOAD MASTER
 ******************************************************************************/

async function loadMaster() {

    await Promise.all([

        loadCabang()

    ]);

}

/******************************************************************************
 * LOAD CABANG
 ******************************************************************************/

async function loadCabang() {

    try {

        const result = await API.getCabang();

        if (!result.success) {

            return;

        }

        const select = document.getElementById("kode_cabang");

        if (!select) {

            return;

        }

        select.innerHTML =

            '<option value="">-- Pilih Cabang --</option>';

        result.data.forEach(item => {

            const option = document.createElement("option");

            option.value = item.kode;

            option.textContent =
                item.kode + " - " + item.cabang;

            select.appendChild(option);

        });

    }

    catch (err) {

        console.error(err);

    }

}

/******************************************************************************
 * GENERATE NOMOR AGUNAN
 ******************************************************************************/

function generateNoAgunan() {

    const input = document.getElementById("no_agunan");

    if (!input) return;

    if (input.value !== "") return;

    const now = new Date();

    const nomor =

        "AGN" +

        now.getFullYear() +

        String(now.getMonth() + 1).padStart(2, "0") +

        String(now.getDate()).padStart(2, "0") +

        String(now.getHours()).padStart(2, "0") +

        String(now.getMinutes()).padStart(2, "0") +

        String(now.getSeconds()).padStart(2, "0");

    input.value = nomor;

}

/******************************************************************************
 * SUBMIT FORM
 ******************************************************************************/

async function submitForm(e) {

    e.preventDefault();

    try {

        const btn = document.getElementById("btnSimpan");

        btn.disabled = true;

        btn.innerHTML =
            '<i class="fa fa-spinner fa-spin"></i> Menyimpan...';

        const data = collectData();

        const valid = validate(data);

        if (!valid.success) {

            Helper.error(valid.message);

            btn.disabled = false;

            btn.innerHTML =
                '<i class="fa fa-save"></i> Simpan Data Agunan';

            return;

        }

        await saveData(data);

        btn.disabled = false;

        btn.innerHTML =
            '<i class="fa fa-save"></i> Simpan Data Agunan';

    }

    catch (err) {

        console.error(err);

        Helper.error(err.message);

        const btn = document.getElementById("btnSimpan");

        btn.disabled = false;

        btn.innerHTML =
            '<i class="fa fa-save"></i> Simpan Data Agunan';

    }

}

/******************************************************************************
 * COLLECT DATA
 ******************************************************************************/

function collectData() {

    const form = document.getElementById("formAgunan");

    const fd = new FormData(form);

    const data = {};

    fd.forEach((value, key) => {

        data[key] = String(value).trim();

    });

    /*****************************************************
     * USER LOGIN
     *****************************************************/
    const user = Auth.getUser();

    data.username =

        user?.username ||

        user?.user_id ||

        user?.email ||

        user?.nama ||

        "";

    return data;

}

/******************************************************************************
 * VALIDATE
 ******************************************************************************/

function validate(data) {

    const required = [

        {
            key: "kode_cabang",
            label: "Kode Cabang"
        },

        {
            key: "cif_debitur",
            label: "Nomor CIF"
        },

        {
            key: "nama_pemilik_agunan",
            label: "Nama Pemilik Agunan"
        },

        {
            key: "no_agunan",
            label: "Nomor Agunan"
        },

        {
            key: "no_rek_fasilitas",
            label: "No Rekening Fasilitas"
        },

        {
            key: "status_agunan",
            label: "Status Agunan"
        },

        {
            key: "kode_jenis_agunan",
            label: "Jenis Agunan"
        },

        {
            key: "bukti_kepemilikan",
            label: "Bukti Kepemilikan"
        },

        {
            key: "alamat_agunan",
            label: "Alamat Agunan"
        },

        {
            key: "jenis_dokumen",
            label: "Jenis Dokumen"
        },

        {
            key: "status_dokumen",
            label: "Status Dokumen"
        },

        {
            key: "penyimpanan_agunan",
            label: "Penyimpanan Agunan"
        },

        {
            key: "jenis_penilaian",
            label: "Jenis Penilaian"
        },

        {
            key: "produk",
            label: "Produk"
        }

    ];

    for (const item of required) {

        if (!data[item.key]) {

            return {

                success: false,

                message: item.label + " wajib diisi."

            };

        }

    }

    return {

        success: true

    };

}

/******************************************************************************
 * SAVE DATA
 ******************************************************************************/

async function saveData(
    data
) {

    Helper.showLoading(
        "Menyimpan Data..."
    );


    try {

        /*
         * ==========================================================
         * VALIDASI NO AGUNAN
         * ==========================================================
         */

        const noAgunan =
            String(
                data?.no_agunan || ""
            ).trim();


        if (
            !noAgunan
        ) {

            throw new Error(
                "NO AGUNAN tidak ditemukan."
            );

        }


        /*
         * ==========================================================
         * DEBUG
         * ==========================================================
         */

        console.log(
            "========== INSERT AGUNAN =========="
        );

        console.log(
            "NO AGUNAN:",
            noAgunan
        );

        console.log(
            "INSERT DATA:",
            data
        );


        /*
         * ==========================================================
         * INSERT
         * ==========================================================
         */

        const result =
            await API.insertAgunan(
                data
            );


        console.log(
            "INSERT RESPONSE:",
            result
        );


        /*
         * ==========================================================
         * VALIDASI REQUEST
         * ==========================================================
         *
         * API POST menggunakan no-cors.
         *
         * Jadi response success dari POST hanya berarti
         * request sudah dikirim.
         *
         * Kita belum menganggap data berhasil sebelum
         * dilakukan VERIFY ke backend.
         *
         * ==========================================================
         */

        if (
            !result ||
            result.success !== true
        ) {

            throw new Error(
                result?.message ||
                "Data gagal dikirim ke server."
            );

        }


        /*
         * ==========================================================
         * TUNGGU BACKEND
         * ==========================================================
         *
         * Beri waktu Apps Script menyelesaikan appendRow().
         *
         * ==========================================================
         */

        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    1500
                )
        );


        /*
         * ==========================================================
         * VERIFY INSERT
         * ==========================================================
         */

        console.log(
            "VERIFY INSERT:",
            noAgunan
        );


        let verify =
            null;


        let verified =
            false;


        /*
         * ==========================================================
         * RETRY VERIFY
         * ==========================================================
         *
         * Maksimal 5 kali.
         *
         * Ini untuk mengantisipasi Apps Script masih memproses
         * appendRow ketika GET pertama dilakukan.
         *
         * ==========================================================
         */

        for (
            let attempt = 1;
            attempt <= 5;
            attempt++
        ) {

            try {

                console.log(
                    "INSERT VERIFY ATTEMPT:",
                    attempt,
                    noAgunan
                );


                verify =
                    await API.getAgunanById(
                        noAgunan
                    );


                console.log(
                    "INSERT VERIFY RESPONSE:",
                    verify
                );


                /*
                 * ====================================================
                 * DATA DITEMUKAN
                 * ====================================================
                 */

                if (
                    verify &&
                    verify.success === true &&
                    verify.data
                ) {

                    const verifiedNoAgunan =
                        String(
                            verify.data.no_agunan ||
                            ""
                        ).trim();


                    if (
                        verifiedNoAgunan ===
                        noAgunan
                    ) {

                        verified =
                            true;

                        break;

                    }

                }

            }
            catch (
            verifyError
            ) {

                console.warn(
                    "INSERT VERIFY ERROR:",
                    attempt,
                    verifyError
                );

            }


            /*
             * ========================================================
             * TUNGGU SEBELUM RETRY
             * ========================================================
             */

            if (
                attempt < 5
            ) {

                await new Promise(
                    resolve =>
                        setTimeout(
                            resolve,
                            1000
                        )
                );

            }

        }


        /*
         * ==========================================================
         * VERIFY GAGAL
         * ==========================================================
         */

        if (
            !verified
        ) {

            throw new Error(
                `Data sudah dikirim tetapi belum dapat diverifikasi di Spreadsheet. No Agunan: ${noAgunan}`
            );

        }


        /*
         * ==========================================================
         * INSERT VERIFIED
         * ==========================================================
         */

        console.log(
            "INSERT VERIFIED:",
            noAgunan
        );


        /*
         * ==========================================================
         * SUCCESS
         * ==========================================================
         */

        Helper.hideLoading();


        Helper.success(
            "Data berhasil disimpan."
        );


        /*
         * ==========================================================
         * RESET FORM
         * ==========================================================
         */

        resetForm();


        /*
         * ==========================================================
         * GENERATE NO AGUNAN BARU
         * ==========================================================
         */

        generateNoAgunan();

    }
    catch (
    err
    ) {

        Helper.hideLoading();


        console.error(
            "SAVE DATA ERROR:",
            err
        );


        Helper.error(
            err.message ||
            "Gagal menyimpan data."
        );

    }

}

/******************************************************************************
 * RESET FORM
 ******************************************************************************/

function resetForm() {

    const form = document.getElementById("formAgunan");

    if (!form) return;

    form.reset();

}

/******************************************************************************
 * AFTER SAVE
 ******************************************************************************/

function afterSave() {

    resetForm();

    generateNoAgunan();

    const firstInput = document.getElementById("kode_cabang");

    if (firstInput) {

        firstInput.focus();

    }

}

/******************************************************************************
 * AUTO UPPERCASE
 ******************************************************************************/

document.addEventListener("input", function (e) {

    if (

        e.target.matches(

            "#nama_pemilik_agunan," +

            "#kelurahan," +

            "#kecamatan," +

            "#kota_kabupaten," +

            "#provinsi"

        )

    ) {

        e.target.value = e.target.value.toUpperCase();

    }

});

/******************************************************************************
 * FORMAT NILAI NJOP
 ******************************************************************************/

document.addEventListener("input", function (e) {

    if (e.target.id !== "nilai_njop") {

        return;

    }

    let angka =

        e.target.value

            .replace(/\D/g, "");

    if (angka === "") {

        e.target.value = "";

        return;

    }

    e.target.value =

        Number(angka)

            .toLocaleString("id-ID");

});

/******************************************************************************
 * COPY DIGITAL LINK
 ******************************************************************************/

async function copyLink() {

    const link =

        document.getElementById(

            "digital_file_link"

        );

    if (!link) return;

    if (link.value === "") {

        Helper.info(

            "Link masih kosong."

        );

        return;

    }

    await navigator.clipboard.writeText(

        link.value

    );

    Helper.success(

        "Link berhasil disalin."

    );

}

/******************************************************************************
 * PREVIEW DIGITAL LINK
 ******************************************************************************/

function openLink() {

    const link =

        document.getElementById(

            "digital_file_link"

        );

    if (!link) return;

    if (link.value === "") {

        Helper.info(

            "Link masih kosong."

        );

        return;

    }

    window.open(

        link.value,

        "_blank"

    );

}

/******************************************************************************
 * LOAD DATA AGUNAN
 ******************************************************************************/

async function loadData() {

    try {

        const result = await API.getAgunan();

        if (!result.success) {

            return;

        }

        renderTable(result.data);

    }

    catch (err) {

        console.error(err);

    }

}

/******************************************************************************
 * RENDER TABLE
 ******************************************************************************/

function renderTable(data) {

    const tbody = document.getElementById("tableBody");

    if (!tbody) {

        return;

    }

    tbody.innerHTML = "";

    if (!data || data.length === 0) {

        tbody.innerHTML = `

        <tr>

            <td colspan="6" style="text-align:center">

                Belum ada data.

            </td>

        </tr>

        `;

        return;

    }

    data.forEach((item, index) => {

        tbody.innerHTML += `

        <tr>

            <td>${index + 1}</td>

            <td>${item.kode_cabang ?? ""}</td>

            <td>${item.cif_debitur ?? ""}</td>

            <td>${item.nama_pemilik_agunan ?? ""}</td>

            <td>${item.no_agunan ?? ""}</td>

            <td>

                <button

                    class="btn btn-danger"

                    onclick="deleteData('${item.no_agunan}')">

                    Hapus

                </button>

            </td>

        </tr>

        `;

    });

}

/******************************************************************************
 * DELETE DATA
 ******************************************************************************/

async function deleteData(noAgunan) {

    const yes = confirm(

        "Hapus data agunan ini ?"

    );

    if (!yes) {

        return;

    }

    try {

        Helper.showLoading(

            "Menghapus Data..."

        );

        const result =

            await API.deleteAgunan(

                noAgunan

            );

        Helper.hideLoading();

        if (!result.success) {

            Helper.error(

                result.message

            );

            return;

        }

        Helper.success(

            "Data berhasil dihapus."

        );

        loadData();

    }

    catch (err) {

        Helper.hideLoading();

        console.error(err);

        Helper.error(

            "Gagal menghapus data."

        );

    }

}

/******************************************************************************
 * REFRESH
 ******************************************************************************/

async function refreshData() {

    await loadData();

}

/******************************************************************************
 * CLEAR TABLE
 ******************************************************************************/

function clearTable() {

    const tbody =

        document.getElementById(

            "tableBody"

        );

    if (!tbody) return;

    tbody.innerHTML = "";

}

/******************************************************************************
 * RELOAD
 ******************************************************************************/

async function reload() {

    clearTable();

    await loadData();

}

/******************************************************************************
 * LOGOUT
 ******************************************************************************/

async function logout() {

    await Auth.logout();

}

/******************************************************************************
 * END OF FILE
 ******************************************************************************/

console.log(

    "INPUT.JS VERSION 1.0 FINAL LOADED"

);
