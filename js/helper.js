/******************************************************************************
 * DATA AGUNAN CUSTODY
 * HELPER ENGINE
 * Version : 1.0
 ******************************************************************************/

const Helper = {

    /**************************************************************************
     * FORMAT RUPIAH
     **************************************************************************/
    rupiah(number = 0) {

        return new Intl.NumberFormat(CONFIG.LOCALE, {

            style: "currency",

            currency: CONFIG.CURRENCY,

            minimumFractionDigits: 0

        }).format(number);

    },

    /**************************************************************************
     * FORMAT ANGKA
     **************************************************************************/
    number(number = 0) {

        return new Intl.NumberFormat(CONFIG.LOCALE).format(number);

    },

    /**************************************************************************
     * FORMAT TANGGAL
     **************************************************************************/
    date(date) {

        if (!date) return "-";

        return new Date(date).toLocaleDateString(

            CONFIG.LOCALE

        );

    },

    /**************************************************************************
     * FORMAT DATETIME
     **************************************************************************/
    datetime(date) {

        if (!date) return "-";

        return new Date(date).toLocaleString(

            CONFIG.LOCALE

        );

    },

    /**************************************************************************
     * TRIM STRING
     **************************************************************************/
    trim(value) {

        return String(value).trim();

    },

    /**************************************************************************
     * KOSONG ?
     **************************************************************************/
    empty(value) {

        return (

            value === null ||

            value === undefined ||

            value === ""

        );

    },

    /**************************************************************************
     * LOADING SHOW
     **************************************************************************/
    showLoading(text = "Loading...") {

        let loading = document.getElementById("loading");

        if (!loading) {

            loading = document.createElement("div");

            loading.id = "loading";

            loading.innerHTML = `

                <div class="loading-box">

                    <div class="spinner"></div>

                    <div>${text}</div>

                </div>

            `;

            document.body.appendChild(loading);

        }

        loading.style.display = "flex";

    },

    /**************************************************************************
     * LOADING HIDE
     **************************************************************************/
    hideLoading() {

        const loading = document.getElementById("loading");

        if (loading) {

            loading.style.display = "none";

        }

    },

    /**************************************************************************
     * SUCCESS
     **************************************************************************/
    success(message) {

        alert("✅ " + message);

    },

    /**************************************************************************
     * ERROR
     **************************************************************************/
    error(message) {

        alert("❌ " + message);

    },

    /**************************************************************************
     * INFO
     **************************************************************************/
    info(message) {

        alert("ℹ️ " + message);

    },

    /**************************************************************************
     * CONFIRM
     **************************************************************************/
    confirm(message) {

        return confirm(message);

    },

    /**************************************************************************
     * RANDOM ID
     **************************************************************************/
    uuid() {

        return Date.now().toString(36)

            +

            Math.random().toString(36).substring(2);

    },

    /**************************************************************************
     * COPY TEXT
     **************************************************************************/
    async copy(text) {

        await navigator.clipboard.writeText(text);

    },

    /**************************************************************************
     * DOWNLOAD JSON
     **************************************************************************/
    download(filename, object) {

        const data = JSON.stringify(

            object,

            null,

            2

        );

        const blob = new Blob(

            [data],

            {

                type: "application/json"

            }

        );

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");

        a.href = url;

        a.download = filename;

        a.click();

        URL.revokeObjectURL(url);

    }

};

function closeModal() {

    document
        .getElementById("modal")
        .classList.remove("show");

}

/******************************************************************************
 * FREEZE
 ******************************************************************************/

Object.freeze(Helper);
