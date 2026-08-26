/******************************************************************************
 * DATA AGUNAN CUSTODY
 * API.JS
 * SECURITY HARDENED
 * Version : 1.0 CLEANED
 ******************************************************************************/

const API = {

    /**************************************************************************
     * GET API URL
     **************************************************************************/

    getUrl() {

        if (
            typeof CONFIG === "undefined" ||
            !CONFIG.API_URL
        ) {

            throw new Error(
                "CONFIG.API_URL belum tersedia."
            );

        }

        return CONFIG.API_URL;

    },


    /**************************************************************************
     * GET
     **************************************************************************/

    async get(
        action,
        params = {}
    ) {

        try {

            const url =
                new URL(
                    this.getUrl()
                );


            url.searchParams.set(
                "action",
                action
            );


            /*
             * Tambahkan parameter
             */
            Object.keys(
                params
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
                            String(value)
                        );

                    }

                }
            );


            /*
             * Cache busting
             */
            url.searchParams.set(
                "_ts",
                Date.now()
            );


            console.log(
                "API GET:",
                action,
                url.toString()
            );


            const response =
                await fetch(
                    url.toString(),
                    {
                        method:
                            "GET",

                        cache:
                            "no-store"
                    }
                );


            if (
                !response.ok
            ) {

                const text =
                    await response.text();

                console.error(
                    "API GET HTTP ERROR:",
                    response.status,
                    text
                );


                throw new Error(
                    `HTTP ${response.status} saat memanggil ${action}`
                );

            }


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
                    "API GET RESPONSE:",
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
                "API GET ERROR:",
                action,
                err
            );


            throw err;

        }

    },


    /**************************************************************************
     * POST
     **************************************************************************/

    async post(
        action,
        data = {}
    ) {

        try {

            const url =
                this.getUrl();


            const form =
                new URLSearchParams();


            form.append(
                "action",
                action
            );


            /*
             * Tambahkan data
             */
            Object.keys(
                data
            ).forEach(
                key => {

                    const value =
                        data[key];

                    if (
                        value !== undefined &&
                        value !== null
                    ) {

                        form.append(
                            key,
                            String(value)
                        );

                    }

                }
            );


            console.log(
                "API POST:",
                action
            );


            /*
             * no-cors
             *
             * Digunakan agar GitHub Pages
             * dapat mengirim request ke
             * Google Apps Script.
             */
            const response =
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


            /*
             * no-cors menghasilkan opaque response.
             *
             * Kita tidak dapat membaca
             * response server.
             */
            return {

                success:
                    true,

                sent:
                    true,

                action:
                    action,

                message:
                    `Request ${action} telah dikirim.`

            };

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


    /**************************************************************************
     * AUTH ERROR HANDLER
     **************************************************************************/

    handleAuthError(
        result
    ) {

        if (
            !result
        ) {

            return;

        }


        /*
         * Token/session invalid
         */
        if (
            result.message ===
            "SESSION_EXPIRED" ||
            result.message ===
            "UNAUTHORIZED" ||
            result.message ===
            "TOKEN_INVALID"
        ) {

            console.warn(
                "API AUTH ERROR:",
                result.message
            );


            if (
                typeof Auth !==
                "undefined" &&
                typeof Auth.clear ===
                "function"
            ) {

                Auth.clear();

            }

        }

    },

    /******************************************************************************
     * PASSWORD RESET
     *
     * Flow:
     * 1. requestPasswordReset -> GET
     * 2. Backend membuat request_id sendiri
     * 3. Frontend menerima request_id
     * 4. confirmPasswordReset -> POST
     * 5. getResetStatus -> GET
     *
     * IMPORTANT:
     * Jangan membuat request_id reset di frontend.
     ******************************************************************************/

    async requestPasswordReset(
        username,
        email
    ) {

        try {

            username =
                String(
                    username || ""
                ).trim();


            email =
                String(
                    email || ""
                ).trim();


            if (
                !username ||
                !email
            ) {

                throw new Error(
                    "Username dan Email wajib diisi."
                );

            }


            /*
             * Backend membuat request_id sendiri.
             */
            const result =
                await this.get(
                    "requestPasswordReset",
                    {
                        username:
                            username,

                        email:
                            email
                    }
                );


            if (
                !result ||
                result.success !== true
            ) {

                throw new Error(
                    result?.message ||
                    "Gagal mengirim kode reset password."
                );

            }


            /*
             * request_id WAJIB berasal dari server.
             */
            if (
                !result.data ||
                !result.data.request_id
            ) {

                throw new Error(
                    "Request ID reset password tidak diterima dari server."
                );

            }


            console.log(
                "API RESET REQUEST ID:",
                result.data.request_id
            );


            return result;

        }
        catch (err) {

            console.error(
                "API requestPasswordReset ERROR:",
                err
            );


            throw err;

        }

    },


    /**************************************************************************
     * CONFIRM PASSWORD RESET
     **************************************************************************/

    async confirmPasswordReset(
        data = {}
    ) {

        try {

            const requestId =
                String(
                    data.request_id || ""
                ).trim();


            const otp =
                String(
                    data.otp || ""
                ).trim();


            const password =
                String(
                    data.password || ""
                );


            if (
                !requestId
            ) {

                throw new Error(
                    "Request ID reset password tidak tersedia."
                );

            }


            if (
                !otp
            ) {

                throw new Error(
                    "OTP wajib diisi."
                );

            }


            if (
                !password
            ) {

                throw new Error(
                    "Password baru wajib diisi."
                );

            }


            /*
             * Backend confirmPasswordReset
             * memproses OTP dan password.
             */
            return await this.post(
                "confirmPasswordReset",
                {
                    request_id:
                        requestId,

                    otp:
                        otp,

                    password:
                        password
                }
            );

        }
        catch (err) {

            console.error(
                "API confirmPasswordReset ERROR:",
                err
            );


            throw err;

        }

    },


    /**************************************************************************
     * GET RESET STATUS
     **************************************************************************/

    async getResetStatus(
        requestId
    ) {

        try {

            requestId =
                String(
                    requestId || ""
                ).trim();


            if (
                !requestId
            ) {

                throw new Error(
                    "Request ID wajib diisi."
                );

            }


            const result =
                await this.get(
                    "getResetStatus",
                    {
                        request_id:
                            requestId
                    }
                );


            return result;

        }
        catch (err) {

            console.error(
                "API getResetStatus ERROR:",
                err
            );


            throw err;

        }

    },


    /******************************************************************************
     * LOGIN
     ******************************************************************************/

    async login(
        username,
        password
    ) {

        try {

            /*
             * =========================================================
             * VALIDATION
             * =========================================================
             */

            username =
                String(
                    username || ""
                ).trim();


            password =
                String(
                    password || ""
                );


            if (
                !username
            ) {

                throw new Error(
                    "Username wajib diisi."
                );

            }


            if (
                !password
            ) {

                throw new Error(
                    "Password wajib diisi."
                );

            }


            /*
             * =========================================================
             * REQUEST ID
             * =========================================================
             */

            const requestId =
                "req_" +
                Date.now() +
                "_" +
                Math.random()
                    .toString(36)
                    .substring(2, 12);


            console.log(
                "API LOGIN REQUEST:",
                {
                    username:
                        username,

                    requestId:
                        requestId
                }
            );


            /*
             * =========================================================
             * LOGIN ASYNC
             * =========================================================
             */

            const loginResult =
                await this.post(
                    "loginAsync",
                    {
                        username:
                            username,

                        password:
                            password,

                        request_id:
                            requestId
                    }
                );


            if (
                !loginResult ||
                loginResult.success !== true
            ) {

                throw new Error(
                    loginResult?.message ||
                    "Gagal mengirim proses login."
                );

            }


            /*
             * =========================================================
             * WAIT BEFORE POLLING
             * =========================================================
             */

            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        1500
                    )
            );


            /*
             * =========================================================
             * POLLING RESULT
             * =========================================================
             */

            for (
                let attempt = 0;
                attempt < 20;
                attempt++
            ) {

                console.log(
                    "API LOGIN POLLING:",
                    {
                        attempt:
                            attempt + 1,

                        requestId:
                            requestId
                    }
                );


                let result;


                /*
                 * =====================================================
                 * JSONP REQUEST
                 * =====================================================
                 */

                try {

                    result =
                        await this.getLoginStatusJsonp(
                            requestId
                        );

                }
                catch (
                pollError
                ) {

                    console.warn(
                        "API LOGIN POLLING ERROR:",
                        pollError
                    );


                    if (
                        attempt >= 19
                    ) {

                        throw pollError;

                    }


                    await new Promise(
                        resolve =>
                            setTimeout(
                                resolve,
                                1500
                            )
                    );


                    continue;

                }


                console.log(
                    "API LOGIN STATUS:",
                    result
                );


                /*
                 * =====================================================
                 * HASIL SUDAH TERSEDIA
                 * =====================================================
                 */

                if (
                    result &&
                    result.message !==
                    "PROCESSING"
                ) {

                    if (
                        result.success !== true
                    ) {

                        throw new Error(
                            result.message ||
                            "Username atau password salah."
                        );

                    }


                    return result;

                }


                /*
                 * =====================================================
                 * MASIH PROCESSING
                 * =====================================================
                 */

                if (
                    attempt < 19
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
             * =========================================================
             * TIMEOUT
             * =========================================================
             */

            throw new Error(
                "Timeout saat memproses login."
            );

        }
        catch (err) {

            console.error(
                "API LOGIN ERROR:",
                err
            );


            throw err;

        }

    },


    /******************************************************************************
 * GET LOGIN STATUS - JSONP
 * MOBILE SAFE VERSION
 ******************************************************************************/

    getLoginStatusJsonp(
        requestId
    ) {

        return new Promise(
            (
                resolve,
                reject
            ) => {

                if (
                    !requestId
                ) {

                    reject(
                        new Error(
                            "Request ID login tidak tersedia."
                        )
                    );

                    return;

                }


                /*
                 * =====================================================
                 * CONFIG
                 * =====================================================
                 */

                const MAX_RETRY = 3;

                const TIMEOUT_MS = 15000;

                const RETRY_DELAY = 800;


                let attempt = 0;

                let completed = false;

                let currentScript = null;

                let timeoutId = null;

                let retryTimer = null;


                /*
                 * =====================================================
                 * SAFE REQUEST ID
                 * =====================================================
                 */

                const safeRequestId =
                    String(
                        requestId
                    )
                        .replace(
                            /[^a-zA-Z0-9_]/g,
                            "_"
                        );


                const callbackName =
                    "__custodyLoginCallback_" +
                    safeRequestId;


                /*
                 * =====================================================
                 * CLEANUP
                 * =====================================================
                 */

                const cleanup =
                    () => {

                        try {

                            if (
                                timeoutId
                            ) {

                                clearTimeout(
                                    timeoutId
                                );

                                timeoutId =
                                    null;

                            }

                        }
                        catch (
                        timeoutError
                        ) {

                            console.warn(
                                "Login JSONP timeout cleanup error:",
                                timeoutError
                            );

                        }


                        try {

                            if (
                                retryTimer
                            ) {

                                clearTimeout(
                                    retryTimer
                                );

                                retryTimer =
                                    null;

                            }

                        }
                        catch (
                        retryError
                        ) {

                            console.warn(
                                "Login JSONP retry cleanup error:",
                                retryError
                            );

                        }


                        try {

                            if (
                                currentScript &&
                                currentScript.parentNode
                            ) {

                                currentScript
                                    .parentNode
                                    .removeChild(
                                        currentScript
                                    );

                            }

                        }
                        catch (
                        scriptError
                        ) {

                            console.warn(
                                "Login JSONP script cleanup error:",
                                scriptError
                            );

                        }


                        currentScript =
                            null;

                    };


                /*
                 * =====================================================
                 * FINAL CLEANUP
                 * ===================================================== */

                const finalCleanup =
                    () => {

                        cleanup();


                        try {

                            delete window[
                                callbackName
                            ];

                        }
                        catch (
                        callbackError
                        ) {

                            window[
                                callbackName
                            ] =
                                undefined;

                        }

                    };


                /*
                 * =====================================================
                 * SUCCESS
                 * ===================================================== */

                const finishSuccess =
                    (
                        result
                    ) => {

                        if (
                            completed
                        ) {

                            return;

                        }


                        completed =
                            true;


                        console.log(
                            "API LOGIN JSONP RESPONSE:",
                            result
                        );


                        finalCleanup();


                        resolve(
                            result
                        );

                    };


                /*
                 * =====================================================
                 * FINAL ERROR
                 * ===================================================== */

                const finishError =
                    (
                        message
                    ) => {

                        if (
                            completed
                        ) {

                            return;

                        }


                        completed =
                            true;


                        finalCleanup();


                        reject(
                            new Error(
                                message
                            )
                        );

                    };


                /*
                 * =====================================================
                 * CALLBACK
                 * =====================================================
                 */

                window[
                    callbackName
                ] =
                    (
                        result
                    ) => {

                        finishSuccess(
                            result
                        );

                    };


                /*
                 * =====================================================
                 * LOAD ATTEMPT
                 * =====================================================
                 */

                const loadAttempt =
                    () => {

                        if (
                            completed
                        ) {

                            return;

                        }


                        attempt++;


                        console.log(
                            "API LOGIN STATUS ATTEMPT:",
                            attempt,
                            "/",
                            MAX_RETRY
                        );


                        cleanup();


                        /*
                         * =================================================
                         * CREATE SCRIPT
                         * =================================================
                         */

                        const script =
                            document.createElement(
                                "script"
                            );


                        currentScript =
                            script;


                        /*
                         * =================================================
                         * BUILD URL
                         * =================================================
                         */

                        let url;


                        try {

                            url =
                                new URL(
                                    this.getUrl()
                                );

                        }
                        catch (
                        urlError
                        ) {

                            finishError(
                                "API URL tidak valid."
                            );

                            return;

                        }


                        url.searchParams.set(
                            "action",
                            "getLoginStatus"
                        );


                        url.searchParams.set(
                            "request_id",
                            requestId
                        );


                        url.searchParams.set(
                            "callback",
                            callbackName
                        );


                        /*
                         * Cache buster.
                         *
                         * Sangat penting untuk mobile/browser
                         * agar response tidak menggunakan cache lama.
                         */

                        url.searchParams.set(
                            "_ts",
                            Date.now()
                        );


                        console.log(
                            "API LOGIN STATUS URL:",
                            url.toString()
                        );


                        /*
                         * =================================================
                         * SCRIPT ATTRIBUTES
                         * =================================================
                         */

                        script.src =
                            url.toString();


                        script.async =
                            true;


                        script.type =
                            "text/javascript";


                        /*
                         * =================================================
                         * SUCCESS LOAD
                         *
                         * JSONP callback tetap menjadi sumber
                         * keberhasilan utama.
                         * =================================================
                         */

                        script.onload =
                            () => {

                                console.log(
                                    "API LOGIN JSONP SCRIPT LOADED:",
                                    attempt
                                );

                            };


                        /*
                         * =================================================
                         * LOAD ERROR
                         * =================================================
                         */

                        script.onerror =
                            () => {

                                if (
                                    completed
                                ) {

                                    return;

                                }


                                console.warn(
                                    "API LOGIN JSONP NETWORK ERROR:",
                                    attempt,
                                    "/",
                                    MAX_RETRY
                                );


                                cleanup();


                                /*
                                 * Masih ada kesempatan retry.
                                 */

                                if (
                                    attempt <
                                    MAX_RETRY
                                ) {

                                    retryTimer =
                                        setTimeout(
                                            () => {

                                                loadAttempt();

                                            },
                                            RETRY_DELAY
                                        );

                                    return;

                                }


                                /*
                                 * Semua retry gagal.
                                 */

                                finishError(
                                    "Gagal mengambil status login. Periksa koneksi internet."
                                );

                            };


                        /*
                         * =================================================
                         * TIMEOUT
                         * =================================================
                         */

                        timeoutId =
                            setTimeout(
                                () => {

                                    if (
                                        completed
                                    ) {

                                        return;

                                    }


                                    console.warn(
                                        "API LOGIN JSONP TIMEOUT:",
                                        attempt,
                                        "/",
                                        MAX_RETRY
                                    );


                                    cleanup();


                                    /*
                                     * Retry jika masih tersedia.
                                     */

                                    if (
                                        attempt <
                                        MAX_RETRY
                                    ) {

                                        retryTimer =
                                            setTimeout(
                                                () => {

                                                    loadAttempt();

                                                },
                                                RETRY_DELAY
                                            );

                                        return;

                                    }


                                    /*
                                     * Semua percobaan timeout.
                                     */

                                    finishError(
                                        "Timeout saat mengambil status login. Periksa koneksi internet."
                                    );

                                },
                                TIMEOUT_MS
                            );


                        /*
                         * =================================================
                         * APPEND SCRIPT
                         * =================================================
                         */

                        try {

                            document.body.appendChild(
                                script
                            );

                        }
                        catch (
                        appendError
                        ) {

                            console.error(
                                "API LOGIN JSONP APPEND ERROR:",
                                appendError
                            );


                            cleanup();


                            if (
                                attempt <
                                MAX_RETRY
                            ) {

                                retryTimer =
                                    setTimeout(
                                        () => {

                                            loadAttempt();

                                        },
                                        RETRY_DELAY
                                    );

                            }
                            else {

                                finishError(
                                    "Gagal memulai pemeriksaan status login."
                                );

                            }

                        }

                    };


                /*
                 * =====================================================
                 * START
                 * =====================================================
                 */

                loadAttempt();

            }
        );

    },

    /******************************************************************************
     * SESSION
     ******************************************************************************/

    async getSession() {

        try {

            const token =
                this.getToken();


            if (
                !token
            ) {

                return {

                    success:
                        false,

                    message:
                        "SESSION_EXPIRED",

                    data:
                        null

                };

            }


            return await this.get(
                "getSession",
                {
                    token:
                        token
                }
            );

        }
        catch (err) {

            console.error(
                "API getSession ERROR:",
                err
            );


            throw err;

        }

    },


    /******************************************************************************
     * LOGOUT
     ******************************************************************************/

    async logout() {

        try {

            const token =
                this.getToken();


            /*
             * Tidak ada session.
             */
            if (
                !token
            ) {

                return {

                    success:
                        true,

                    message:
                        "Logout berhasil."

                };

            }


            /*
             * Logout ke server.
             */
            const result =
                await this.post(
                    "logout",
                    {
                        token:
                            token
                    }
                );


            /*
             * Hapus session browser.
             */
            try {

                localStorage.removeItem(
                    "user"
                );

            }
            catch (
            storageError
            ) {

                console.warn(
                    "Gagal menghapus localStorage:",
                    storageError
                );

            }


            return result;

        }
        catch (err) {

            console.error(
                "API LOGOUT ERROR:",
                err
            );


            /*
             * Walaupun server error,
             * session lokal tetap dihapus.
             */
            try {

                localStorage.removeItem(
                    "user"
                );

            }
            catch (
            storageError
            ) {

                console.warn(
                    "Gagal menghapus localStorage:",
                    storageError
                );

            }


            throw err;

        }

    },


    /******************************************************************************
     * USER MANAGEMENT
     ******************************************************************************/

    /**************************************************************************
     * CREATE USER
     **************************************************************************/

    async createUser(
        userData
    ) {

        try {

            if (
                !userData
            ) {

                throw new Error(
                    "Data user tidak tersedia."
                );

            }


            const token =
                this.getToken();


            if (
                !token
            ) {

                throw new Error(
                    "Session tidak tersedia."
                );

            }


            return await this.post(
                "createUser",
                {

                    token:
                        token,

                    id:
                        userData.id ||
                        "",

                    username:
                        userData.username ||
                        "",

                    password:
                        userData.password ||
                        "",

                    nama:
                        userData.nama ||
                        "",

                    email:
                        userData.email ||
                        "",

                    role:
                        userData.role ||
                        "",

                    status:
                        userData.status ||
                        ""

                }
            );

        }
        catch (err) {

            console.error(
                "API createUser ERROR:",
                err
            );


            throw err;

        }

    },


    /**************************************************************************
     * UPDATE USER
     **************************************************************************/

    async updateUser(
        userData
    ) {

        try {

            if (
                !userData
            ) {

                throw new Error(
                    "Data user tidak tersedia."
                );

            }


            if (
                !userData.id
            ) {

                throw new Error(
                    "ID user wajib diisi."
                );

            }


            const token =
                this.getToken();


            if (
                !token
            ) {

                throw new Error(
                    "Session tidak tersedia."
                );

            }


            return await this.post(
                "updateUser",
                {

                    token:
                        token,

                    id:
                        userData.id,

                    username:
                        userData.username ||
                        "",

                    password:
                        userData.password ||
                        "",

                    nama:
                        userData.nama ||
                        "",

                    email:
                        userData.email ||
                        "",

                    role:
                        userData.role ||
                        "",

                    status:
                        userData.status ||
                        ""

                }
            );

        }
        catch (err) {

            console.error(
                "API updateUser ERROR:",
                err
            );


            throw err;

        }

    },


    /**************************************************************************
     * UPDATE USER STATUS
     **************************************************************************/

    async updateUserStatus(
        userData
    ) {

        try {

            if (
                !userData
            ) {

                throw new Error(
                    "Data status user tidak tersedia."
                );

            }


            if (
                !userData.id
            ) {

                throw new Error(
                    "ID user wajib diisi."
                );

            }


            if (
                !userData.status
            ) {

                throw new Error(
                    "Status user wajib diisi."
                );

            }


            const token =
                this.getToken();


            if (
                !token
            ) {

                throw new Error(
                    "Session tidak tersedia."
                );

            }


            return await this.post(
                "updateUserStatus",
                {

                    token:
                        token,

                    id:
                        userData.id,

                    status:
                        userData.status

                }
            );

        }
        catch (err) {

            console.error(
                "API updateUserStatus ERROR:",
                err
            );


            throw err;

        }

    },


    /**************************************************************************
     * DELETE USER
     **************************************************************************/

    async deleteUser(
        id
    ) {

        try {

            if (
                !id
            ) {

                throw new Error(
                    "ID user wajib diisi."
                );

            }


            const token =
                this.getToken();


            if (
                !token
            ) {

                throw new Error(
                    "Session tidak tersedia."
                );

            }


            return await this.post(
                "deleteUser",
                {

                    token:
                        token,

                    id:
                        id

                }
            );

        }
        catch (err) {

            console.error(
                "API deleteUser ERROR:",
                err
            );


            throw err;

        }

    },

    /******************************************************************************
     * USER
     ******************************************************************************/

    async getUser() {

        try {

            const token =
                this.getToken();


            if (!token) {

                throw new Error(
                    "Session tidak tersedia."
                );

            }


            console.log(
                "API GET USER: Memanggil endpoint getUser..."
            );


            console.log(
                "API GET USER: Token tersedia:",
                Boolean(token)
            );


            return await this.get(
                "getUser",
                {
                    token:
                        token
                }
            );

        }
        catch (err) {

            console.error(
                "API getUser ERROR:",
                err
            );

            throw err;

        }

    },

    /**************************************************************************
     * GET CABANG
     **************************************************************************/

    async getCabang() {

        try {

            return await this.get(
                "getCabang",
                {
                    token:
                        this.getToken()
                }
            );

        }
        catch (err) {

            console.error(
                "API getCabang ERROR:",
                err
            );


            throw err;

        }

    },

    /**************************************************************************
     * GET CABANG LIST
     *
     * Alias agar kompatibel dengan halaman lama.
     **************************************************************************/

    async getCabangList() {

        try {

            return await this.getCabang();

        }
        catch (err) {

            console.error(
                "API getCabangList ERROR:",
                err
            );


            throw err;

        }

    },


    /**************************************************************************
     * GET NOTARIS
     **************************************************************************/

    async getNotaris() {

        try {

            return await this.get(
                "getNotaris",
                {
                    token:
                        this.getToken()
                }
            );

        }
        catch (err) {

            console.error(
                "API getNotaris ERROR:",
                err
            );


            throw err;

        }

    },


    /**************************************************************************
     * GET NOTARIS LIST
     *
     * Alias kompatibilitas.
     **************************************************************************/

    async getNotarisList() {

        try {

            return await this.getNotaris();

        }
        catch (err) {

            console.error(
                "API getNotarisList ERROR:",
                err
            );


            throw err;

        }

    },


    /******************************************************************************
     * DATA AGUNAN
     ******************************************************************************/

    /**************************************************************************
     * GET DATA AGUNAN
     **************************************************************************/

    async getAgunan(
        params = {}
    ) {

        try {

            return await this.get(
                "getAgunan",
                {

                    ...params,

                    token:
                        this.getToken()

                }
            );

        }
        catch (err) {

            console.error(
                "API getAgunan ERROR:",
                err
            );


            throw err;

        }

    },


    /**************************************************************************
     * GET DATA AGUNAN BY ID
     **************************************************************************/
    async getAgunanById(
        noAgunan
    ) {

        const target =
            String(
                noAgunan || ""
            ).trim();

        if (!target) {

            throw new Error(
                "NO AGUNAN wajib diisi."
            );

        }

        return await this.get(
            "getAgunanById",
            {
                no_agunan:
                    target,

                token:
                    this.getToken()
            }
        );

    },

    /**************************************************************************
     * CREATE / INSERT DATA AGUNAN
     **************************************************************************/

    async createAgunan(
        data = {}
    ) {

        try {

            return await this.post(
                "insertAgunan",
                {

                    ...data,

                    token:
                        this.getToken()

                }
            );

        }
        catch (err) {

            console.error(
                "API createAgunan ERROR:",
                err
            );


            throw err;

        }

    },


    /**************************************************************************
     * INSERT AGUNAN
     *
     * Alias kompatibilitas.
     **************************************************************************/

    async insertAgunan(
        data = {}
    ) {

        try {

            return await this.createAgunan(
                data
            );

        }
        catch (err) {

            console.error(
                "API insertAgunan ERROR:",
                err
            );


            throw err;

        }

    },


    /**************************************************************************
     * UPDATE DATA AGUNAN
     **************************************************************************/
    async updateAgunan(
        id,
        data = {}
    ) {

        try {

            /*
             * =========================================================
             * NORMALIZE NO AGUNAN
             * =========================================================
             */

            const noAgunan =
                String(
                    data.no_agunan ||
                    id ||
                    ""
                ).trim();


            /*
             * =========================================================
             * VALIDATION
             * =========================================================
             */

            if (
                !noAgunan
            ) {

                throw new Error(
                    "NO AGUNAN wajib diisi."
                );

            }


            /*
             * =========================================================
             * TOKEN
             * =========================================================
             */

            const token =
                this.getToken();


            if (
                !token
            ) {

                throw new Error(
                    "Session tidak tersedia."
                );

            }


            /*
             * =========================================================
             * PAYLOAD
             * =========================================================
             *
             * Backend membutuhkan:
             *
             * no_agunan
             *
             * Bukan:
             *
             * id
             */

            const payload = {

                ...data,

                no_agunan:
                    noAgunan,

                token:
                    token

            };


            /*
             * =========================================================
             * REQUEST
             * =========================================================
             */

            console.log(
                "API UPDATE AGUNAN:",
                payload
            );


            return await this.post(
                "updateAgunan",
                payload
            );

        }
        catch (err) {

            console.error(
                "API updateAgunan ERROR:",
                err
            );


            throw err;

        }

    },

    /**************************************************************************
 * DELETE DATA AGUNAN
 **************************************************************************/

    async deleteAgunan(
        noAgunan
    ) {

        try {

            /*
             * =========================================================
             * NORMALIZE NO AGUNAN
             * =========================================================
             */

            noAgunan =
                String(
                    noAgunan || ""
                ).trim();


            /*
             * =========================================================
             * VALIDATION
             * =========================================================
             */

            if (
                !noAgunan
            ) {

                throw new Error(
                    "NO AGUNAN wajib diisi."
                );

            }


            /*
             * =========================================================
             * TOKEN
             * =========================================================
             */

            const token =
                this.getToken();


            if (
                !token
            ) {

                throw new Error(
                    "Session tidak tersedia."
                );

            }


            /*
             * =========================================================
             * PAYLOAD
             * =========================================================
             */

            const payload = {

                token:
                    token,

                no_agunan:
                    noAgunan

            };


            /*
             * =========================================================
             * DEBUG
             * =========================================================
             */

            console.log(
                "API DELETE AGUNAN:",
                payload
            );


            /*
             * =========================================================
             * REQUEST KE APPS SCRIPT
             * =========================================================
             *
             * POST menggunakan no-cors.
             *
             * Artinya browser tidak dapat membaca
             * response dari Apps Script.
             *
             * Tetapi request tetap dikirim ke server.
             * =========================================================
             */

            const result =
                await this.post(
                    "deleteAgunan",
                    payload
                );


            /*
             * =========================================================
             * RESULT
             * =========================================================
             */

            return result;

        }
        catch (err) {

            console.error(
                "API deleteAgunan ERROR:",
                err
            );


            throw err;

        }

    },

    /**************************************************************************
     * CHECK DUPLICATE AGUNAN
     **************************************************************************/

    async checkDuplicateAgunan(
        noAgunan
    ) {

        try {

            noAgunan =
                String(
                    noAgunan || ""
                ).trim();


            if (
                !noAgunan
            ) {

                throw new Error(
                    "NO AGUNAN wajib diisi."
                );

            }


            return await this.get(
                "checkDuplicateAgunan",
                {

                    no_agunan:
                        noAgunan,

                    token:
                        this.getToken()

                }
            );

        }
        catch (err) {

            console.error(
                "API checkDuplicateAgunan ERROR:",
                err
            );


            throw err;

        }

    },


    /**************************************************************************
     * CHECK DUPLICATE CIF
     **************************************************************************/

    async checkDuplicateCIF(
        cif
    ) {

        try {

            cif =
                String(
                    cif || ""
                ).trim();


            if (
                !cif
            ) {

                throw new Error(
                    "CIF wajib diisi."
                );

            }


            return await this.get(
                "checkDuplicateCIF",
                {

                    cif_debitur:
                        cif,

                    token:
                        this.getToken()

                }
            );

        }
        catch (err) {

            console.error(
                "API checkDuplicateCIF ERROR:",
                err
            );


            throw err;

        }

    },


    /******************************************************************************
     * MONITORING
     ******************************************************************************/

    async getMonitoring(
        params = {}
    ) {

        try {

            return await this.get(
                "getMonitoring",
                {

                    ...params,

                    token:
                        this.getToken()

                }
            );

        }
        catch (err) {

            console.error(
                "API getMonitoring ERROR:",
                err
            );


            throw err;

        }

    },


    /******************************************************************************
     * LAPORAN
     ******************************************************************************/

    async getLaporan(
        params = {}
    ) {

        try {

            return await this.get(
                "getLaporan",
                {

                    ...params,

                    token:
                        this.getToken()

                }
            );

        }
        catch (err) {

            console.error(
                "API getLaporan ERROR:",
                err
            );


            throw err;

        }

    },


    /******************************************************************************
     * DASHBOARD
     ******************************************************************************/

    async getDashboard(
        params = {}
    ) {

        try {

            return await this.get(
                "getDashboard",
                {

                    ...params,

                    token:
                        this.getToken()

                }
            );

        }
        catch (err) {

            console.error(
                "API getDashboard ERROR:",
                err
            );


            throw err;

        }

    },


    /******************************************************************************
     * GENERIC ACTION
     ******************************************************************************/

    async call(
        action,
        data = {},
        method = "GET"
    ) {

        try {

            if (
                !action
            ) {

                throw new Error(
                    "Action API wajib diisi."
                );

            }


            const normalizedMethod =
                String(
                    method || "GET"
                ).toUpperCase();


            if (
                normalizedMethod ===
                "GET"
            ) {

                return await this.get(
                    action,
                    {

                        ...data,

                        token:
                            data.token ||
                            this.getToken()

                    }
                );

            }


            return await this.post(
                action,
                {

                    ...data,

                    token:
                        data.token ||
                        this.getToken()

                }
            );

        }
        catch (err) {

            console.error(
                "API call ERROR:",
                action,
                err
            );


            throw err;

        }

    },

    /******************************************************************************
    * TOKEN / SESSION
    * FINAL SESSION STORAGE FIX
    ******************************************************************************/

    getToken() {

        try {

            /*
             * =========================================================
             * 1. PRIORITAS AUTH.JS
             * =========================================================
             */

            if (
                typeof Auth !== "undefined" &&
                typeof Auth.getToken === "function"
            ) {

                try {

                    const authToken =
                        String(
                            Auth.getToken() || ""
                        ).trim();


                    if (
                        authToken
                    ) {

                        console.log(
                            "API getToken: token dari Auth."
                        );

                        return authToken;

                    }

                }
                catch (authError) {

                    console.warn(
                        "API getToken: Auth.getToken gagal:",
                        authError
                    );

                }

            }


            /*
             * =========================================================
             * 2. SESSION STORAGE
             *
             * auth.js menyimpan session di:
             *
             * sessionStorage["user"]
             * =========================================================
             */

            try {

                const sessionRaw =
                    sessionStorage.getItem(
                        "user"
                    );


                if (
                    sessionRaw
                ) {

                    const session =
                        JSON.parse(
                            sessionRaw
                        );


                    if (
                        session &&
                        session.token
                    ) {

                        const token =
                            String(
                                session.token
                            ).trim();


                        if (
                            token
                        ) {

                            console.log(
                                "API getToken: token dari sessionStorage."
                            );


                            return token;

                        }

                    }

                }

            }
            catch (sessionError) {

                console.warn(
                    "API getToken: sessionStorage error:",
                    sessionError
                );

            }


            /*
             * =========================================================
             * 3. FALLBACK LOCAL STORAGE
             *
             * Untuk kompatibilitas dengan versi lama.
             * =========================================================
             */

            try {

                const localRaw =
                    localStorage.getItem(
                        "user"
                    );


                if (
                    localRaw
                ) {

                    const session =
                        JSON.parse(
                            localRaw
                        );


                    if (
                        session &&
                        session.token
                    ) {

                        const token =
                            String(
                                session.token
                            ).trim();


                        if (
                            token
                        ) {

                            console.log(
                                "API getToken: token dari localStorage."
                            );


                            return token;

                        }

                    }

                }

            }
            catch (localError) {

                console.warn(
                    "API getToken: localStorage error:",
                    localError
                );

            }


            /*
             * =========================================================
             * 4. SESSION TIDAK DITEMUKAN
             * =========================================================
             */

            console.warn(
                "API getToken: SESSION TIDAK DITEMUKAN."
            );


            return "";

        }
        catch (err) {

            console.error(
                "API getToken ERROR:",
                err
            );


            return "";

        }

    },

    /**************************************************************************
     * SLEEP
     **************************************************************************/

    sleep(
        milliseconds
    ) {

        return new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    milliseconds
                )
        );

    },


    /**************************************************************************
     * GET CURRENT USER
     *
     * Alias helper untuk kompatibilitas.
     **************************************************************************/

    async getCurrentUser() {

        try {

            return await this.getUser();

        }
        catch (err) {

            console.error(
                "API getCurrentUser ERROR:",
                err
            );


            throw err;

        }

    },


    /**************************************************************************
     * CHECK SESSION
     **************************************************************************/

    async checkSession() {

        try {

            const token =
                this.getToken();


            if (
                !token
            ) {

                return {

                    success:
                        false,

                    message:
                        "SESSION_EXPIRED",

                    data:
                        null

                };

            }


            return await this.getSession();

        }
        catch (err) {

            console.error(
                "API checkSession ERROR:",
                err
            );


            return {

                success:
                    false,

                message:
                    err.message ||
                    "Gagal memeriksa session.",

                data:
                    null

            };

        }

    },


    /**************************************************************************
     * GENERIC REQUEST
     *
     * Compatibility wrapper.
     *
     * GET  -> this.get()
     * POST -> this.post()
     **************************************************************************/

    async request(
        action,
        data = {},
        method = "GET"
    ) {

        try {

            const normalizedMethod =
                String(
                    method || "GET"
                )
                    .toUpperCase();


            if (
                normalizedMethod ===
                "GET"
            ) {

                return await this.get(
                    action,
                    data
                );

            }


            return await this.post(
                action,
                data
            );

        }
        catch (err) {

            console.error(
                "API request ERROR:",
                action,
                err
            );


            throw err;

        }

    },


    /**************************************************************************
     * GENERIC CALL
     *
     * Alias tambahan agar kompatibel dengan
     * script halaman lain.
     **************************************************************************/

    async execute(
        action,
        data = {},
        method = "GET"
    ) {

        return await this.request(
            action,
            data,
            method
        );

    }


};


/******************************************************************************
 * GLOBAL EXPORT
 ******************************************************************************/

if (
    typeof window !==
    "undefined"
) {

    window.API =
        API;

}


/******************************************************************************
 * DEBUG
 ******************************************************************************/

console.log(
    "API.JS SECURITY HARDENED 1.0 CLEANED LOADED"
);
