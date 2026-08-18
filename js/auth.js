/******************************************************************************
 *
 * auth.js
 * DATA AGUNAN CUSTODY
 * AUTHENTICATION CLIENT
 * SECURITY HARDENED 1.0
 *
 ******************************************************************************/

"use strict";


/******************************************************************************
 * AUTH OBJECT
 ******************************************************************************/

const Auth = {

    /**************************************************************************
     * CONFIG
     **************************************************************************/

    getSessionKey() {

        if (
            typeof CONFIG !== "undefined" &&
            CONFIG.SESSION_KEY
        ) {

            return CONFIG.SESSION_KEY;

        }

        return "user";

    },


    getLoginPage() {

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
     * GET SESSION
     **************************************************************************/

    getSession() {

        try {

            const raw =
                sessionStorage.getItem(
                    this.getSessionKey()
                );

            if (!raw) {
                return null;
            }

            const session =
                JSON.parse(raw);

            if (
                !session ||
                typeof session !== "object"
            ) {

                return null;

            }

            return session;

        }
        catch (err) {

            console.error(
                "Auth.getSession:",
                err
            );

            return null;

        }

    },


    /**************************************************************************
     * GET USER
     *
     * Dipertahankan agar kompatibel dengan
     * dashboard.js / input.js / halaman lainnya.
     **************************************************************************/

    getUser() {

        return this.getSession();

    },


    /**************************************************************************
     * ALIAS USER
     **************************************************************************/

    user() {

        return this.getSession();

    },


    /**************************************************************************
     * GET TOKEN
     **************************************************************************/

    getToken() {

        const session =
            this.getSession();

        if (
            !session ||
            !session.token
        ) {

            return "";

        }

        return String(
            session.token
        );

    },


    /**************************************************************************
     * CHECK LOGIN
     *
     * PERHATIAN:
     *
     * Ini hanya pemeriksaan lokal.
     * Security sebenarnya tetap berada
     * di backend code.gs melalui token.
     **************************************************************************/

    isLogin() {

        const session =
            this.getSession();

        if (!session) {
            return false;
        }

        /*
         * Token wajib ada.
         */

        if (
            !session.token ||
            String(
                session.token
            ).trim() === ""
        ) {

            return false;

        }

        /*
         * Username wajib ada.
         */

        if (
            !session.username ||
            String(
                session.username
            ).trim() === ""
        ) {

            return false;

        }

        return true;

    },


    /**************************************************************************
     * CHECK
     *
     * Dipakai oleh halaman internal:
     *
     * Auth.check();
     **************************************************************************/

    check() {

        if (
            this.isLogin()
        ) {

            return true;

        }

        this.redirectToLogin();

        return false;

    },


    /**************************************************************************
     * REDIRECT LOGIN
     **************************************************************************/

    redirectToLogin() {

        try {

            this.clear();

        }
        catch (err) {

            console.error(
                "Auth.redirectToLogin:",
                err
            );

        }

        const loginPage =
            this.getLoginPage();

        window.location.href =
            loginPage;

    },


    /**************************************************************************
     * LOGIN
     **************************************************************************/

    async login(
        username,
        password
    ) {

        username =
            String(
                username || ""
            ).trim();

        password =
            String(
                password || ""
            );

        if (!username) {

            return {

                success: false,

                message:
                    "Username wajib diisi."

            };

        }

        if (!password) {

            return {

                success: false,

                message:
                    "Password wajib diisi."

            };

        }


        try {

            const result =
                await API.login(
                    username,
                    password
                );


            if (
                !result ||
                !result.success
            ) {

                return (
                    result || {

                        success: false,

                        message:
                            "Login gagal."

                    }
                );

            }


            /*
             * Backend harus mengembalikan:
             *
             * result.data.token
             */

            const data =
                result.data || {};


            if (
                !data.token
            ) {

                console.error(
                    "LOGIN BERHASIL TETAPI TOKEN TIDAK ADA.",
                    result
                );

                return {

                    success: false,

                    message:
                        "Login gagal: token session tidak diterima dari server."

                };

            }


            /*
             * Simpan session.
             *
             * Token berasal dari server.
             */

            const session = {

                token:
                    data.token,

                username:
                    data.username ||
                    username,

                nama:
                    data.nama ||
                    "",

                email:
                    data.email ||
                    "",

                role:
                    data.role ||
                    "VIEWER",

                status:
                    data.status ||
                    "AKTIF",

                login_time:
                    data.login_time ||
                    new Date().toISOString(),

                last_activity:
                    Date.now()

            };


            sessionStorage.setItem(

                this.getSessionKey(),

                JSON.stringify(
                    session
                )

            );


            /*
             * Simpan timestamp aktivitas
             * hanya untuk kebutuhan UI.
             *
             * Backend tetap menjadi
             * sumber keamanan session.
             */

            try {

                localStorage.setItem(
                    "LAST_ACTIVITY",
                    String(
                        Date.now()
                    )
                );

            }
            catch (err) {

                console.warn(
                    "LAST_ACTIVITY gagal disimpan.",
                    err
                );

            }


            return {

                success: true,

                message:
                    result.message ||
                    "Login berhasil.",

                data:
                    session

            };

        }
        catch (err) {

            console.error(
                "Auth.login:",
                err
            );

            return {

                success: false,

                message:
                    err.message ||
                    "Tidak dapat terhubung ke server."

            };

        }

    },


    /**************************************************************************
     * LOGOUT
     **************************************************************************/

    async logout() {

        try {

            if (
                typeof API !== "undefined" &&
                typeof API.logout ===
                    "function"
            ) {

                await API.logout();

            }

        }
        catch (err) {

            console.warn(
                "Server logout gagal:",
                err
            );

        }
        finally {

            this.clear();

            this.redirectToLogin();

        }

    },


    /**************************************************************************
     * CLEAR SESSION
     **************************************************************************/

    clear() {

        try {

            sessionStorage.removeItem(
                this.getSessionKey()
            );

        }
        catch (err) {

            console.error(
                "Auth.clear sessionStorage:",
                err
            );

        }


        try {

            localStorage.removeItem(
                "LAST_ACTIVITY"
            );

        }
        catch (err) {

            console.error(
                "Auth.clear localStorage:",
                err
            );

        }

    },


    /**************************************************************************
     * REFRESH ACTIVITY
     *
     * Ini bukan perpanjangan server session.
     * Token server tetap mempunyai TTL sendiri.
     **************************************************************************/

    refreshActivity() {

        const session =
            this.getSession();

        if (!session) {
            return;
        }

        session.last_activity =
            Date.now();

        try {

            sessionStorage.setItem(

                this.getSessionKey(),

                JSON.stringify(
                    session
                )

            );

        }
        catch (err) {

            console.error(
                "Auth.refreshActivity:",
                err
            );

        }

        try {

            localStorage.setItem(
                "LAST_ACTIVITY",
                String(
                    Date.now()
                )
            );

        }
        catch (err) {

            console.warn(
                "Auth.refreshActivity localStorage:",
                err
            );

        }

    },


    /**************************************************************************
     * GET ROLE
     **************************************************************************/

    getRole() {

        const user =
            this.getUser();

        if (
            !user ||
            !user.role
        ) {

            return "";

        }

        return String(
            user.role
        ).toUpperCase();

    },


    /**************************************************************************
     * GET USERNAME
     **************************************************************************/

    getUsername() {

        const user =
            this.getUser();

        return user &&
               user.username
            ? String(
                user.username
              )
            : "";

    },


    /**************************************************************************
     * GET NAME
     **************************************************************************/

    getName() {

        const user =
            this.getUser();

        return user &&
               user.nama
            ? String(
                user.nama
              )
            : "";

    },


    /**************************************************************************
     * GET EMAIL
     **************************************************************************/

    getEmail() {

        const user =
            this.getUser();

        return user &&
               user.email
            ? String(
                user.email
              )
            : "";

    },


    /**************************************************************************
     * STATUS
     **************************************************************************/

    isActive() {

        const user =
            this.getUser();

        if (!user) {
            return false;
        }

        return String(
            user.status || ""
        ).toUpperCase() ===
        "AKTIF";

    },


    /**************************************************************************
     * INITIALIZE ACTIVITY TRACKING
     **************************************************************************/

    initActivityTracking() {

        const events = [

            "click",
            "mousemove",
            "keydown",
            "scroll",
            "touchstart"

        ];


        const handler =
            () => {

                if (
                    this.isLogin()
                ) {

                    this.refreshActivity();

                }

            };


        events.forEach(
            eventName => {

                document.addEventListener(
                    eventName,
                    handler,
                    {
                        passive: true
                    }
                );

            }
        );

    },


    /**************************************************************************
     * LOCAL SESSION TIMEOUT
     *
     * Ini hanya UX safeguard.
     *
     * Server tetap mempunyai
     * session TTL sendiri.
     **************************************************************************/

    checkLocalTimeout() {

        const session =
            this.getSession();

        if (!session) {
            return false;
        }

        /*
         * Default 30 menit.
         */

        const timeoutMinutes =
            (
                typeof CONFIG !==
                "undefined" &&
                CONFIG.SESSION_TIMEOUT
            )
                ? Number(
                    CONFIG.SESSION_TIMEOUT
                  )
                : 30;


        if (
            !timeoutMinutes ||
            timeoutMinutes <= 0
        ) {

            return true;

        }


        const lastActivity =
            Number(
                session.last_activity ||
                session.login_time ||
                0
            );


        if (!lastActivity) {

            return true;

        }


        /*
         * login_time dari backend
         * bisa berupa string tanggal,
         * sehingga fallback ke LAST_ACTIVITY.
         */

        const storedActivity =
            Number(
                localStorage.getItem(
                    "LAST_ACTIVITY"
                ) || 0
            );


        const activity =
            storedActivity ||
            lastActivity;


        const elapsed =
            Date.now() -
            activity;


        const timeoutMs =
            timeoutMinutes *
            60 *
            1000;


        if (
            elapsed >= timeoutMs
        ) {

            this.clear();

            return false;

        }

        return true;

    },


    /**************************************************************************
     * VALIDATE CURRENT SESSION
     **************************************************************************/

    validate() {

        if (
            !this.isLogin()
        ) {

            return false;

        }

        if (
            !this.isActive()
        ) {

            this.clear();

            return false;

        }

        /*
         * Jangan menggunakan local timeout
         * sebagai satu-satunya security.
         *
         * Ini hanya menjaga UX browser.
         */

        if (
            !this.checkLocalTimeout()
        ) {

            this.clear();

            return false;

        }

        return true;

    }

};


/******************************************************************************
 * GLOBAL ACTIVITY TRACKING
 ******************************************************************************/

document.addEventListener(
    "DOMContentLoaded",
    function () {

        try {

            Auth.initActivityTracking();

        }
        catch (err) {

            console.error(
                "Auth activity initialization:",
                err
            );

        }

    }
);


/******************************************************************************
 * AUTO CHECK SESSION
 *
 * Tidak memanggil API secara terus-menerus.
 * Backend akan memvalidasi token setiap kali
 * API protected dipanggil.
 ******************************************************************************/

setInterval(
    function () {

        try {

            if (
                Auth.isLogin()
            ) {

                if (
                    !Auth.checkLocalTimeout()
                ) {

                    Auth.redirectToLogin();

                }

            }

        }
        catch (err) {

            console.error(
                "Auth session monitor:",
                err
            );

        }

    },
    60 * 1000
);


/******************************************************************************
 * EXPORT / DEBUG
 ******************************************************************************/

console.log(
    "AUTH.JS SECURITY HARDENED 3.0 LOADED"
);
