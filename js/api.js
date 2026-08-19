/******************************************************************************
 *
 * api.js
 * DATA AGUNAN CUSTODY
 * SECURITY HARDENED API CLIENT
 * VERSION : 1.0
 *
 ******************************************************************************/

"use strict";

/******************************************************************************
 * API CLIENT
 ******************************************************************************/

const API = {

    /**************************************************************************
     * CONFIG
     **************************************************************************/

    getUrl() {

        if (
            typeof CONFIG !== "undefined" &&
            CONFIG.API_URL
        ) {
            return CONFIG.API_URL;
        }

        throw new Error(
            "CONFIG.API_URL belum dikonfigurasi."
        );

    },


    /**************************************************************************
     * SESSION / TOKEN
     **************************************************************************/

    getSession() {

        try {

            if (
                typeof CONFIG === "undefined" ||
                !CONFIG.SESSION_KEY
            ) {
                return null;
            }

            const raw =
                sessionStorage.getItem(
                    CONFIG.SESSION_KEY
                );

            if (!raw) {
                return null;
            }

            return JSON.parse(raw);

        }
        catch (err) {

            console.error(
                "API.getSession:",
                err
            );

            return null;

        }

    },


    getToken() {

        const session =
            this.getSession();

        return session &&
            session.token
            ? session.token
            : "";

    },


    /**************************************************************************
     * SESSION ERROR
     **************************************************************************/

    handleAuthError(result) {

        if (!result) {
            return false;
        }

        const message =
            String(
                result.message || ""
            ).toUpperCase();

        if (
            message.indexOf(
                "SESSION_EXPIRED"
            ) !== -1 ||
            message.indexOf(
                "ACCESS_DENIED"
            ) !== -1 ||
            message.indexOf(
                "UNAUTHORIZED"
            ) !== -1
        ) {

            /*
             * ACCESS_DENIED tidak langsung
             * menghapus session karena user
             * mungkin masih login tetapi memang
             * tidak memiliki permission.
             */

            if (
                message.indexOf(
                    "SESSION_EXPIRED"
                ) !== -1 ||
                message.indexOf(
                    "UNAUTHORIZED"
                ) !== -1
            ) {

                this.clearSession();

                if (
                    typeof location !==
                    "undefined"
                ) {

                    const loginPage =
                        this.getLoginPage();

                    location.href =
                        loginPage;

                }

            }

            return true;

        }

        return false;

    },


    clearSession() {

        try {

            if (
                typeof CONFIG !== "undefined" &&
                CONFIG.SESSION_KEY
            ) {

                sessionStorage.removeItem(
                    CONFIG.SESSION_KEY
                );

            }

        }
        catch (err) {

            console.error(
                "API.clearSession:",
                err
            );

        }

    },


    getLoginPage() {

        /*
         * Root:
         * login.html
         *
         * Folder aksi:
         * ../login.html
         */

        if (
            typeof CONFIG !== "undefined" &&
            CONFIG.LOGIN_PAGE
        ) {

            return CONFIG.LOGIN_PAGE;

        }

        const path =
            String(
                window.location.pathname ||
                ""
            );

        if (
            path.indexOf("/aksi/") !== -1
        ) {

            return "../login.html";

        }

        return "login.html";

    },


    /**************************************************************************
     * BUILD GET URL
     **************************************************************************/

    buildGetUrl(
        action,
        params = {}
    ) {

        const url =
            new URL(
                this.getUrl()
            );

        url.searchParams.set(
            "action",
            action
        );

        /*
         * Ambil server-side session token.
         */

        const token =
            this.getToken();

        if (token) {

            url.searchParams.set(
                "token",
                token
            );

        }

        /*
         * Parameter tambahan.
         */

        Object.keys(
            params || {}
        ).forEach(
            key => {

                const value =
                    params[key];

                if (
                    value !== undefined &&
                    value !== null
                ) {

                    url.searchParams.set(
                        key,
                        value
                    );

                }

            }
        );

        /*
         * Cache buster.
         */

        url.searchParams.set(
            "_ts",
            Date.now()
        );

        return url.toString();

    },


    /******************************************************************************
     * GET REQUEST
     ******************************************************************************/

    async get(
        action,
        params = {}
    ) {

        const url =
            this.buildGetUrl(
                action,
                params
            );

        try {

            const response =
                await fetch(
                    url,
                    {
                        method: "GET",
                        cache: "no-store",
                        redirect: "follow"
                    }
                );


            const text =
                await response.text();


            /*
             * HTTP ERROR
             */

            if (!response.ok) {

                console.error(
                    "API GET HTTP ERROR:",
                    response.status,
                    text
                );

                throw new Error(
                    "HTTP " +
                    response.status +
                    " saat memanggil " +
                    action
                );

            }


            /*
             * PARSE JSON
             */

            let result;

            try {

                result =
                    JSON.parse(
                        text
                    );

            }
            catch (err) {

                console.error(
                    "API RESPONSE BUKAN JSON:",
                    text
                );

                throw new Error(
                    "Response API tidak valid."
                );

            }


            /*
             * AUTH ERROR
             */

            this.handleAuthError(
                result
            );


            return result;

        }
        catch (err) {

            console.error(
                "API GET ERROR:",
                action,
                err
            );

            throw err;

        }

    },
    /**************************************************************************
     * POST REQUEST
     *
     * Google Apps Script menerima:
     *
     * e.parameter
     *
     * sehingga payload dikirim sebagai:
     *
     * application/x-www-form-urlencoded
     **************************************************************************/

    async post(
        action,
        data = {}
    ) {

        const url =
            this.getUrl();

        const form =
            new URLSearchParams();

        /*
         * Action
         */

        form.append(
            "action",
            action
        );

        /*
         * Server-side session token
         */

        const token =
            this.getToken();

        if (token) {

            form.append(
                "token",
                token
            );

        }

        /*
         * Payload
         */

        Object.keys(
            data || {}
        ).forEach(
            key => {

                const value =
                    data[key];

                if (
                    value === undefined ||
                    value === null
                ) {

                    return;

                }

                /*
                 * Jika object / array,
                 * serialisasi menjadi JSON.
                 */

                if (
                    typeof value === "object"
                ) {

                    form.append(
                        key,
                        JSON.stringify(value)
                    );

                }
                else {

                    form.append(
                        key,
                        String(value)
                    );

                }

            }
        );

        try {

            const response =
                await fetch(
                    url,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/x-www-form-urlencoded;charset=UTF-8"
                        },

                        body:
                            form.toString(),

                        cache:
                            "no-store"
                    }
                );

            const text =
                await response.text();

            let result;

            try {

                result =
                    JSON.parse(text);

            }
            catch (err) {

                console.error(
                    "API POST RESPONSE:",
                    text
                );

                throw new Error(
                    "Response API tidak valid."
                );

            }

            this.handleAuthError(
                result
            );

            return result;

        }
        catch (err) {

            console.error(
                "API POST ERROR:",
                action,
                err
            );

            throw err;

        }

    },


    /******************************************************************************
 * LOGIN
 * GET version
 *
 * Digunakan agar login dapat membaca response
 * Google Apps Script dari GitHub Pages.
 ******************************************************************************/
    async login(
        username,
        password
    ) {

        try {

            const url =
                new URL(
                    this.getUrl()
                );


            url.searchParams.set(
                "action",
                "login"
            );


            url.searchParams.set(
                "username",
                String(
                    username || ""
                )
            );


            url.searchParams.set(
                "password",
                String(
                    password || ""
                )
            );


            url.searchParams.set(
                "_ts",
                String(
                    Date.now()
                )
            );


            console.log(
                "API LOGIN URL:",
                url.toString()
            );


            const response =
                await fetch(
                    url.toString(),
                    {
                        method: "GET",
                        cache: "no-store"
                    }
                );


            console.log(
                "API LOGIN STATUS:",
                response.status
            );


            console.log(
                "API LOGIN REDIRECTED:",
                response.redirected
            );


            const text =
                await response.text();


            let result;


            try {

                result =
                    JSON.parse(
                        text
                    );

            }
            catch (err) {

                console.error(
                    "LOGIN RESPONSE:",
                    text
                );

                throw new Error(
                    "Response login API tidak valid."
                );

            }


            console.log(
                "API LOGIN RESPONSE:",
                result
            );


            return result;

        }
        catch (err) {

            console.error(
                "API LOGIN ERROR:",
                err
            );

            throw err;

        }

    },

    /**************************************************************************
     * LOGOUT
     **************************************************************************/

    async logout() {

        try {

            const token =
                this.getToken();

            if (token) {

                const result =
                    await this.post(
                        "logout"
                    );

                this.clearSession();

                return result;

            }

            this.clearSession();

            return {
                success: true,

                message:
                    "Logout berhasil."
            };

        }
        catch (err) {

            /*
             * Session lokal tetap dihapus
             * meskipun server tidak dapat
             * dihubungi.
             */

            this.clearSession();

            console.error(
                "API LOGOUT ERROR:",
                err
            );

            return {

                success: false,

                message:
                    "Logout lokal berhasil, tetapi server tidak dapat dihubungi."

            };

        }

    },


    /**************************************************************************
     * DASHBOARD
     **************************************************************************/

    async getDashboard() {

        return await this.get(
            "getDashboard"
        );

    },


    /**************************************************************************
     * MASTER CABANG
     **************************************************************************/

    async getCabang() {

        return await this.get(
            "getCabang"
        );

    },


    /**************************************************************************
     * MASTER NOTARIS
     **************************************************************************/

    async getNotaris() {

        return await this.get(
            "getNotaris"
        );

    },


    /**************************************************************************
     * MASTER USER
     **************************************************************************/

    async getUser() {

        return await this.get(
            "getUser"
        );

    },

    /******************************************************************************
 * USER MANAGEMENT
 ******************************************************************************/

    /**
     * CREATE USER
     *
     * GitHub Pages / localhost
     * POST menggunakan no-cors karena
     * Google Apps Script tidak memberikan CORS header.
     */
    async createUser(
        data = {}
    ) {

        const url =
            this.getUrl();

        const form =
            new URLSearchParams();


        form.append(
            "action",
            "createUser"
        );


        const token =
            this.getToken();

        if (token) {

            form.append(
                "token",
                token
            );

        }


        Object.keys(
            data || {}
        ).forEach(
            key => {

                const value =
                    data[key];

                if (
                    value === undefined ||
                    value === null
                ) {

                    return;

                }

                form.append(
                    key,
                    String(value)
                );

            }
        );


        try {

            await fetch(
                url,
                {
                    method: "POST",

                    mode: "no-cors",

                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded;charset=UTF-8"
                    },

                    body:
                        form.toString(),

                    cache:
                        "no-store"
                }
            );


            return {
                success: true,
                sent: true,
                message:
                    "Request create user telah dikirim."
            };

        }
        catch (err) {

            console.error(
                "API CREATE USER ERROR:",
                err
            );

            throw err;

        }

    },


    /******************************************************************************
     * UPDATE USER
     ******************************************************************************/

    async updateUser(
        data = {}
    ) {

        const url =
            this.getUrl();

        const form =
            new URLSearchParams();


        form.append(
            "action",
            "updateUser"
        );


        const token =
            this.getToken();

        if (token) {

            form.append(
                "token",
                token
            );

        }


        Object.keys(
            data || {}
        ).forEach(
            key => {

                const value =
                    data[key];

                if (
                    value === undefined ||
                    value === null
                ) {

                    return;

                }

                form.append(
                    key,
                    String(value)
                );

            }
        );


        try {

            await fetch(
                url,
                {
                    method: "POST",

                    mode: "no-cors",

                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded;charset=UTF-8"
                    },

                    body:
                        form.toString(),

                    cache:
                        "no-store"
                }
            );


            return {
                success: true,
                sent: true,
                message:
                    "Request update user telah dikirim."
            };

        }
        catch (err) {

            console.error(
                "API UPDATE USER ERROR:",
                err
            );

            throw err;

        }

    },


    /******************************************************************************
     * UPDATE USER STATUS
     ******************************************************************************/

    async updateUserStatus(
        data = {}
    ) {

        const url =
            this.getUrl();

        const form =
            new URLSearchParams();


        form.append(
            "action",
            "updateUserStatus"
        );


        const token =
            this.getToken();

        if (token) {

            form.append(
                "token",
                token
            );

        }


        Object.keys(
            data || {}
        ).forEach(
            key => {

                const value =
                    data[key];

                if (
                    value === undefined ||
                    value === null
                ) {

                    return;

                }

                form.append(
                    key,
                    String(value)
                );

            }
        );


        try {

            await fetch(
                url,
                {
                    method: "POST",

                    mode: "no-cors",

                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded;charset=UTF-8"
                    },

                    body:
                        form.toString(),

                    cache:
                        "no-store"
                }
            );


            return {
                success: true,
                sent: true,
                message:
                    "Request perubahan status user telah dikirim."
            };

        }
        catch (err) {

            console.error(
                "API UPDATE USER STATUS ERROR:",
                err
            );

            throw err;

        }

    },


    /******************************************************************************
     * DELETE USER
     ******************************************************************************/

    async deleteUser(
        id
    ) {

        const url =
            this.getUrl();

        const form =
            new URLSearchParams();


        form.append(
            "action",
            "deleteUser"
        );


        const token =
            this.getToken();

        if (token) {

            form.append(
                "token",
                token
            );

        }


        form.append(
            "id",
            String(id)
        );


        try {

            await fetch(
                url,
                {
                    method: "POST",

                    mode: "no-cors",

                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded;charset=UTF-8"
                    },

                    body:
                        form.toString(),

                    cache:
                        "no-store"
                }
            );


            return {
                success: true,
                sent: true,
                message:
                    "Request delete user telah dikirim."
            };

        }
        catch (err) {

            console.error(
                "API DELETE USER ERROR:",
                err
            );

            throw err;

        }

    },


    /**************************************************************************
 * DATA AGUNAN
 **************************************************************************/

    async getAgunan(
        params = {}
    ) {

        return await this.get(
            "getAgunan",
            params
        );

    },


    /**************************************************************************
     * DETAIL DATA AGUNAN
     *
     * Digunakan oleh halaman edit_agunan.html
     *
     * Request:
     * action=getAgunanById
     * no_agunan=XXXX
     **************************************************************************/

    async getAgunanById(
        noAgunan
    ) {

        if (
            noAgunan === undefined ||
            noAgunan === null ||
            String(noAgunan).trim() === ""
        ) {

            throw new Error(
                "NO AGUNAN wajib diisi."
            );

        }

        return await this.get(
            "getAgunanById",
            {
                no_agunan:
                    String(noAgunan).trim()
            }
        );

    },


    /******************************************************************************
    * INSERT AGUNAN
    *
    * Google Apps Script Web App + GitHub/localhost
    * POST response dapat terkena CORS.
    *
    * Oleh karena itu INSERT dikirim menggunakan fetch
    * tanpa mencoba membaca response.
    ******************************************************************************/

    async insertAgunan(
        data = {}
    ) {

        const url =
            this.getUrl();

        const form =
            new URLSearchParams();


        /*
         * ACTION
         */

        form.append(
            "action",
            "insertAgunan"
        );


        /*
         * TOKEN
         */

        const token =
            this.getToken();

        if (token) {

            form.append(
                "token",
                token
            );

        }


        /*
         * DATA
         */

        Object.keys(
            data || {}
        ).forEach(
            key => {

                const value =
                    data[key];

                if (
                    value === undefined ||
                    value === null
                ) {

                    return;

                }

                form.append(
                    key,
                    String(value)
                );

            }
        );


        /*
         * KIRIM REQUEST
         *
         * no-cors:
         * browser tidak membaca response,
         * tetapi request tetap dikirim.
         */

        try {

            await fetch(
                url,
                {
                    method: "POST",

                    mode: "no-cors",

                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded;charset=UTF-8"
                    },

                    body:
                        form.toString(),

                    cache:
                        "no-store"
                }
            );


            /*
             * Karena response tidak dapat dibaca,
             * return status "sent".
             *
             * Konfirmasi sebenarnya dilakukan
             * oleh input.js melalui GET verification.
             */

            return {
                success: true,
                sent: true,
                message:
                    "Request penyimpanan telah dikirim."
            };

        }
        catch (err) {

            console.error(
                "API INSERT ERROR:",
                err
            );

            throw err;

        }

    },


    /******************************************************************************
  * UPDATE AGUNAN
  *
  * Google Apps Script Web App + GitHub Pages
  *
  * POST response dapat terkena CORS.
  *
  * Oleh karena itu UPDATE dikirim menggunakan fetch
  * mode: "no-cors" tanpa mencoba membaca response.
  *
  * Signature tetap:
  *
  * API.updateAgunan(id, data)
  *
  ******************************************************************************/

    async updateAgunan(
        id,
        data = {}
    ) {

        /*
         * PAYLOAD
         */

        const payload = {

            ...data,

            no_agunan:
                data.no_agunan ||
                id

        };


        /*
         * URL
         */

        const url =
            this.getUrl();


        /*
         * FORM
         */

        const form =
            new URLSearchParams();


        /*
         * ACTION
         */

        form.append(
            "action",
            "updateAgunan"
        );


        /*
         * TOKEN
         */

        const token =
            this.getToken();

        if (token) {

            form.append(
                "token",
                token
            );

        }


        /*
         * DATA
         */

        Object.keys(
            payload || {}
        ).forEach(
            key => {

                const value =
                    payload[key];


                if (
                    value === undefined ||
                    value === null
                ) {

                    return;

                }


                if (
                    typeof value === "object"
                ) {

                    form.append(
                        key,
                        JSON.stringify(
                            value
                        )
                    );

                }
                else {

                    form.append(
                        key,
                        String(value)
                    );

                }

            }
        );


        /*
         * KIRIM REQUEST
         *
         * no-cors:
         * browser tidak membaca response,
         * tetapi request tetap dikirim.
         */

        try {

            await fetch(
                url,
                {
                    method: "POST",

                    mode: "no-cors",

                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded;charset=UTF-8"
                    },

                    body:
                        form.toString(),

                    cache:
                        "no-store"
                }
            );


            /*
             * Response server tidak dibaca.
             *
             * Request dianggap terkirim.
             */

            return {

                success: true,

                sent: true,

                message:
                    "Request update telah dikirim."

            };

        }
        catch (err) {

            console.error(
                "API UPDATE ERROR:",
                err
            );

            throw err;

        }

    },


    /**************************************************************************
     * DELETE AGUNAN
     *
     * Existing frontend:
     *
     * API.deleteAgunan(noAgunan)
     **************************************************************************/

    async deleteAgunan(
        noAgunan
    ) {

        /*
         * VALIDASI
         */

        const target =
            String(
                noAgunan || ""
            ).trim();


        if (!target) {

            throw new Error(
                "NO AGUNAN wajib diisi."
            );

        }


        /*
         * URL
         */

        const url =
            this.getUrl();


        /*
         * FORM
         */

        const form =
            new URLSearchParams();


        /*
         * ACTION
         */

        form.append(
            "action",
            "deleteAgunan"
        );


        /*
         * TOKEN
         */

        const token =
            this.getToken();

        if (token) {

            form.append(
                "token",
                token
            );

        }


        /*
         * NO AGUNAN
         */

        form.append(
            "no_agunan",
            target
        );


        /*
         * REQUEST
         */

        try {

            await fetch(
                url,
                {
                    method: "POST",

                    mode: "no-cors",

                    headers: {

                        "Content-Type":
                            "application/x-www-form-urlencoded;charset=UTF-8"

                    },

                    body:
                        form.toString(),

                    cache:
                        "no-store"

                }
            );


            /*
             * RESPONSE TIDAK DIBACA
             */

            return {

                success: true,

                sent: true,

                message:
                    "Request penghapusan telah dikirim."

            };

        }
        catch (err) {

            console.error(
                "API DELETE ERROR:",
                err
            );

            throw err;

        }

    },


    /**************************************************************************
     * DUPLICATE NO AGUNAN
     **************************************************************************/

    async checkDuplicateAgunan(
        noAgunan
    ) {

        return await this.get(
            "checkDuplicateAgunan",
            {

                no_agunan:
                    noAgunan

            }
        );

    },


    /**************************************************************************
     * DUPLICATE CIF
     **************************************************************************/

    async checkDuplicateCIF(
        cif
    ) {

        return await this.get(
            "checkDuplicateCIF",
            {

                cif_debitur:
                    cif

            }
        );

    },


    /**************************************************************************
     * MONITORING
     **************************************************************************/

    async getMonitoring() {

        return await this.get(
            "getMonitoring"
        );

    },


    /**************************************************************************
 * LAPORAN
 **************************************************************************/
    async getLaporan(
        params = {}
    ) {

        return await this.get(
            "getLaporan",
            params
        );

    },


    /**************************************************************************
     * REQUEST PASSWORD RESET
     **************************************************************************/
    async requestPasswordReset(
        username,
        email
    ) {

        return await this.get(
            "requestPasswordReset",
            {

                username:
                    String(
                        username || ""
                    ).trim(),

                email:
                    String(
                        email || ""
                    ).trim()
            }
        );

    },


    /**************************************************************************
     * CONFIRM PASSWORD RESET
     **************************************************************************/
    async confirmPasswordReset(
        data = {}
    ) {

        const url =
            this.getUrl();

        const form =
            new URLSearchParams();


        form.append(
            "action",
            "confirmPasswordReset"
        );


        const payload =
            data || {};


        Object.keys(
            payload
        ).forEach(
            key => {

                const value =
                    payload[key];


                if (
                    value === undefined ||
                    value === null
                ) {

                    return;

                }


                form.append(
                    key,
                    String(value)
                );

            }
        );


        try {

            await fetch(
                url,
                {
                    method:
                        "POST",

                    mode:
                        "no-cors",

                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded;charset=UTF-8"
                    },

                    body:
                        form.toString(),

                    cache:
                        "no-store"
                }
            );


            return {
                success:
                    true,

                sent:
                    true,

                message:
                    "Request reset password telah dikirim."
            };

        }
        catch (err) {

            console.error(
                "API CONFIRM PASSWORD RESET ERROR:",
                err
            );

            throw err;

        }

    },

    async getResetStatus(
        requestId
    ) {

        return await this.get(
            "getResetStatus",
            {
                request_id:
                    requestId
            }
        );

    }

};

/******************************************************************************
 * COMPATIBILITY HELPERS
 *
 * Untuk file lama yang mungkin menggunakan:
 *
 * API.request(...)
 ******************************************************************************/

API.request =
    async function (
        action,
        data = {},
        method = "GET"
    ) {

        if (
            String(method)
                .toUpperCase() ===
            "POST"
        ) {

            return await API.post(
                action,
                data
            );

        }

        return await API.get(
            action,
            data
        );

    };


/******************************************************************************
 * DEBUG
 ******************************************************************************/

console.log(
    "API.JS SECURITY HARDENED 1.0 LOADED"
);
