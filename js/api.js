/******************************************************************************
 * DATA AGUNAN CUSTODY
 * API.JS
 * SECURITY HARDENED
 * Version : 1.1 (Mobile Network Optimized)
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


    /**************************************************************************
     * GENERIC REQUEST
     **************************************************************************/

    async request(
        action,
        data = {}
    ) {

        return await this.post(
            action,
            data
        );

    },


    /**************************************************************************
     * PING
     **************************************************************************/

    async ping() {

        return await this.get(
            "ping"
        );

    },


    /**************************************************************************
     * DASHBOARD
     **************************************************************************/

    async getDashboard() {

        const token =
            this.getToken();


        return await this.get(
            "getDashboard",
            {
                token:
                    token
            }
        );

    },


    /**************************************************************************
     * TOKEN
     **************************************************************************/

    getToken() {

        try {

            if (
                typeof Auth !==
                "undefined" &&
                typeof Auth.getToken ===
                "function"
            ) {

                return Auth.getToken();

            }


            const session =
                localStorage.getItem(
                    "user"
                );


            if (
                !session
            ) {

                return "";

            }


            const parsed =
                JSON.parse(
                    session
                );


            return (
                parsed &&
                parsed.token
            )
                ? parsed.token
                : "";

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
     * MASTER CABANG
     **************************************************************************/

    async getCabang() {

        return await this.get(
            "getCabang",
            {
                token:
                    this.getToken()
            }
        );

    },


    /**************************************************************************
     * MASTER NOTARIS
     **************************************************************************/

    async getNotaris() {

        return await this.get(
            "getNotaris",
            {
                token:
                    this.getToken()
            }
        );

    },


    /**************************************************************************
     * USER
     **************************************************************************/

    async getUser() {

        return await this.get(
            "getUser",
            {
                token:
                    this.getToken()
            }
        );

    },


    /**************************************************************************
     * DATA AGUNAN
     **************************************************************************/

    async getAgunan(
        params = {}
    ) {

        return await this.get(
            "getAgunan",
            {
                ...params,

                token:
                    this.getToken()
            }
        );

    },


    async getAgunanById(
        id
    ) {

        return await this.get(
            "getAgunanById",
            {
                id:
                    id,

                token:
                    this.getToken()
            }
        );

    },


    /**************************************************************************
     * MONITORING
     **************************************************************************/

    async getMonitoring() {

        return await this.get(
            "getMonitoring",
            {
                token:
                    this.getToken()
            }
        );

    },


    /**************************************************************************
     * LAPORAN
     **************************************************************************/

    async getLaporan() {

        return await this.get(
            "getLaporan",
            {
                token:
                    this.getToken()
            }
        );

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
             * WAIT BEFORE POLLING (Diperbesar untuk perangkat HP)
             * =========================================================
             */

            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        1500 // Diubah dari 800ms ke 1500ms agar server GAS punya waktu merespons jaringan seluler
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

                // FIX: Menambahkan Try-Catch khusus di dalam looping
                // agar error jaringan sesaat (di HP) tidak langsung menggagalkan login
                try {
                    result =
                        await this.getLoginStatusJsonp(
                            requestId
                        );
                } catch (pollError) {
                    console.warn(`Polling attempt ${attempt + 1} gagal (masalah jaringan HP):`, pollError.message);
                    
                    if (attempt < 19) {
                        // Jika masih ada sisa percobaan, tunggu 1.5 detik lalu lanjut coba lagi
                        await new Promise(resolve => setTimeout(resolve, 1500));
                        continue;
                    } else {
                        // Jika sudah 20 kali tetap gagal
                        throw pollError;
                    }
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
                    attempt <
                    19
                ) {

                    await new Promise(
                        resolve =>
                            setTimeout(
                                resolve,
                                1000 // Jeda per polling dilonggarkan ke 1 detik
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
                "Timeout saat memproses login. Coba gunakan koneksi internet yang lebih stabil."
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
                                script &&
                                script.parentNode
                            ) {

                                script.parentNode
                                    .removeChild(
                                        script
                                    );

                            }

                        }
                        catch (
                        cleanupError
                        ) {

                            console.warn(
                                "JSONP cleanup error:",
                                cleanupError
                            );

                        }


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


                        if (
                            timeoutId
                        ) {

                            clearTimeout(
                                timeoutId
                            );

                        }

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

                        console.log(
                            "API LOGIN JSONP RESPONSE:",
                            result
                        );


                        cleanup();

                        resolve(
                            result
                        );

                    };


                /*
                 * =====================================================
                 * URL
                 * =====================================================
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

                    cleanup();

                    reject(
                        new Error(
                            "API URL tidak valid."
                        )
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


                url.searchParams.set(
                    "_ts",
                    Date.now()
                );


                /*
                 * =====================================================
                 * SCRIPT
                 * =====================================================
                 */

                const script =
                    document.createElement(
                        "script"
                    );


                script.src =
                    url.toString();


                script.async =
                    true;


                script.onerror =
                    () => {

                        cleanup();

                        reject(
                            new Error(
                                "Gagal mengambil status login."
                            )
                        );

                    };


                /*
                 * =====================================================
                 * TIMEOUT JSONP
                 * =====================================================
                 */

                const timeoutId =
                    setTimeout(
                        () => {

                            cleanup();

                            reject(
                                new Error(
                                    "Timeout saat mengambil status login."
                                )
                            );

                        },
                        15000 // Ditingkatkan menjadi 15 detik agar aman di jaringan 3G/seluler
                    );


                document.body.appendChild(
                    script
                );

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


    async logout() {

        try {

            const token =
                this.getToken();


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


            const result =
                await this.post(
                    "logout",
                    {
                        token:
                            token
                    }
                );


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
                        userData.id || "",

                    username:
                        userData.username || "",

                    password:
                        userData.password || "",

                    nama:
                        userData.nama || "",

                    email:
                        userData.email || "",

                    role:
                        userData.role || "",

                    status:
                        userData.status || ""

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
                        userData.username || "",

                    password:
                        userData.password || "",

                    nama:
                        userData.nama || "",

                    email:
                        userData.email || "",

                    role:
                        userData.role || "",

                    status:
                        userData.status || ""

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
     * MASTER DATA
     ******************************************************************************/

    async getCabangList() {

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
                "API getCabangList ERROR:",
                err
            );


            throw err;

        }

    },


    async getNotarisList() {

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
                "API getNotarisList ERROR:",
                err
            );


            throw err;

        }

    },


    /******************************************************************************
     * DATA AGUNAN
     ******************************************************************************/

    async createAgunan(
        data = {}
    ) {

        try {

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
                "createAgunan",
                {

                    ...data,

                    token:
                        token

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


    async updateAgunan(
        data = {}
    ) {

        try {

            if (
                !data.id
            ) {

                throw new Error(
                    "ID agunan wajib diisi."
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
                "updateAgunan",
                {

                    ...data,

                    token:
                        token

                }
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


    async deleteAgunan(
        id
    ) {

        try {

            if (
                !id
            ) {

                throw new Error(
                    "ID agunan wajib diisi."
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
                "deleteAgunan",
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
                "API deleteAgunan ERROR:",
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
        method = "POST"
    ) {

        try {

            if (
                !action
            ) {

                throw new Error(
                    "Action API wajib diisi."
                );

            }


            if (
                method.toUpperCase() ===
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
    }

};

/******************************************************************************
* API READY
******************************************************************************/

if (
    typeof window !== "undefined"
) {

    window.API =
        API;

}


/******************************************************************************
 * DEBUG
 ******************************************************************************/

console.log(
    "API.JS SECURITY HARDENED 1.1 (MOBILE OPTIMIZED) LOADED"
);
