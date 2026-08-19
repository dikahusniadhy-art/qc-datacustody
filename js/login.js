/******************************************************************************
 *
 * login.js
 * DATA AGUNAN CUSTODY
 * LOGIN CLIENT
 * SECURITY HARDENED 1.0
 *
 ******************************************************************************/

"use strict";


/******************************************************************************
 * LOGIN INITIALIZATION
 ******************************************************************************/

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initLogin();

    }
);


/******************************************************************************
 * INIT LOGIN
 ******************************************************************************/

function initLogin() {

    /*
     * Jika sudah login, langsung ke dashboard.
     */

    try {

        if (
            typeof Auth !== "undefined" &&
            Auth.isLogin()
        ) {

            redirectToDashboard();

            return;

        }

    }
    catch (err) {

        console.warn(
            "Auth check:",
            err
        );

    }


    /*
     * Ambil form.
     */

    const form =
        document.getElementById(
            "loginForm"
        );


    if (!form) {

        console.error(
            "Element #loginForm tidak ditemukan."
        );

        return;

    }


    /*
     * Submit login.
     */

    form.addEventListener(
        "submit",
        handleLogin
    );


    /*
     * Enter pada username/password
     * otomatis ditangani oleh submit form.
     */


    /*
     * Toggle password jika element tersedia.
     */

    initPasswordToggle();


    /*
     * Clear error saat user mulai mengetik.
     */

    initInputEvents();

}


/******************************************************************************
 * HANDLE LOGIN
 ******************************************************************************/

async function handleLogin(event) {

    event.preventDefault();


    /*
     * Ambil element.
     */

    const usernameInput =
        document.getElementById(
            "username"
        );

    const passwordInput =
        document.getElementById(
            "password"
        );


    if (
        !usernameInput ||
        !passwordInput
    ) {

        showLoginError(
            "Form login tidak lengkap."
        );

        return;

    }


    const username =
        String(
            usernameInput.value || ""
        ).trim();

    const password =
        String(
            passwordInput.value || ""
        );


    /*
     * Validasi frontend.
     */

    if (!username) {

        showLoginError(
            "Username wajib diisi."
        );

        usernameInput.focus();

        return;

    }


    if (!password) {

        showLoginError(
            "Password wajib diisi."
        );

        passwordInput.focus();

        return;

    }


    /*
     * Loading state.
     */

    setLoginLoading(
        true
    );

    clearLoginMessage();


    try {

        /*
         * Auth.login()
         *
         * Auth akan:
         *
         * 1. Memanggil API.login()
         * 2. Menerima token
         * 3. Menyimpan session
         */

        const result =
            await Auth.login(
                username,
                password
            );


        /*
         * Login gagal.
         */

        if (
            !result ||
            !result.success
        ) {

            showLoginError(

                result &&
                    result.message

                    ? result.message

                    : "Username atau password salah."

            );

            passwordInput.value = "";

            passwordInput.focus();

            return;

        }


        /*
         * Pastikan token benar-benar
         * tersimpan.
         */

        const session =
            Auth.getSession();


        if (
            !session ||
            !session.token
        ) {

            console.error(
                "Login response tidak mempunyai token.",
                result
            );

            Auth.clear();


            showLoginError(
                "Login gagal: session token tidak diterima."
            );

            return;

        }


        /*
         * Pastikan user aktif.
         */

        if (
            session.status &&
            String(
                session.status
            ).toUpperCase() !==
            "AKTIF"
        ) {

            Auth.clear();


            showLoginError(
                "User tidak aktif."
            );

            return;

        }


        /*
         * Login berhasil.
         */

        showLoginSuccess(
            "Login berhasil. Mengalihkan..."
        );


        /*
         * Sedikit delay agar user
         * melihat status berhasil.
         */

        setTimeout(
            function () {

                redirectToDashboard();

            },
            300
        );

    }
    catch (err) {

        console.error(
            "LOGIN ERROR:",
            err
        );


        showLoginError(

            err &&
                err.message

                ? err.message

                : "Terjadi kesalahan saat login."

        );

    }
    finally {

        setLoginLoading(
            false
        );

    }

}


/******************************************************************************
 * REDIRECT DASHBOARD
 ******************************************************************************/

function redirectToDashboard() {

    let dashboardPage =
        "dashboard.html";


    /*
     * Jika login.html berada di folder /aksi,
     * dashboard biasanya berada di parent.
     */

    const path =
        String(
            window.location.pathname ||
            ""
        );


    if (
        path.indexOf("/aksi/") !== -1
    ) {

        dashboardPage =
            "../dashboard.html";

    }


    /*
     * Jika CONFIG mempunyai DASHBOARD_PAGE,
     * gunakan konfigurasi tersebut.
     */

    if (
        typeof CONFIG !== "undefined" &&
        CONFIG.DASHBOARD_PAGE
    ) {

        dashboardPage =
            CONFIG.DASHBOARD_PAGE;

    }


    window.location.href =
        dashboardPage;

}


/******************************************************************************
 * LOGIN LOADING
 ******************************************************************************/

function setLoginLoading(
    loading
) {

    const button =
        document.getElementById(
            "btnLogin"
        );


    const spinner =
        document.getElementById(
            "loginSpinner"
        );


    const buttonText =
        document.getElementById(
            "loginBtnText"
        );


    const icon =
        document.getElementById(
            "loginIcon"
        );


    /*
     * DISABLE BUTTON
     */

    if (button) {

        button.disabled =
            Boolean(
                loading
            );

    }


    /*
     * SPINNER
     */

    if (spinner) {

        spinner.style.display =
            loading
                ? "inline-flex"
                : "none";

    }


    /*
     * LOGIN ICON
     */

    if (icon) {

        icon.style.display =
            loading
                ? "none"
                : "inline-block";

    }


    /*
     * BUTTON TEXT
     */

    if (buttonText) {

        buttonText.textContent =
            loading
                ? "MEMPROSES..."
                : "LOGIN KE SISTEM";

    }

}


/******************************************************************************
 * LOGIN ERROR
 ******************************************************************************/

function showLoginError(
    message
) {

    const error =
        document.getElementById(
            "loginError"
        );


    const errorMessage =
        document.getElementById(
            "loginErrorMessage"
        );


    if (errorMessage) {

        errorMessage.textContent =
            message || "Login gagal.";

    }


    if (error) {

        error.style.display =
            "block";

    }
    else {

        /*
         * Fallback jika login.html
         * belum mempunyai #loginError.
         */

        console.error(
            "LOGIN ERROR:",
            message
        );

        alert(
            message ||
            "Login gagal."
        );

    }

}


/******************************************************************************
 * LOGIN SUCCESS
 ******************************************************************************/

function showLoginSuccess(
    message
) {

    const success =
        document.getElementById(
            "loginSuccess"
        );


    const successMessage =
        document.getElementById(
            "loginSuccessMessage"
        );


    if (successMessage) {

        successMessage.textContent =
            message ||
            "Login berhasil.";

    }


    if (success) {

        success.style.display =
            "block";

        return;

    }


    /*
     * Jika element success tidak ada,
     * tidak perlu alert.
     */

}


/******************************************************************************
 * CLEAR MESSAGE
 ******************************************************************************/

function clearLoginMessage() {

    const error =
        document.getElementById(
            "loginError"
        );


    const success =
        document.getElementById(
            "loginSuccess"
        );


    if (error) {

        error.style.display =
            "none";

    }


    if (success) {

        success.style.display =
            "none";

    }

}


/******************************************************************************
 * PASSWORD TOGGLE
 ******************************************************************************/

function initPasswordToggle() {

    const password =
        document.getElementById(
            "password"
        );


    const toggle =
        document.getElementById(
            "togglePassword"
        );


    if (
        !password ||
        !toggle
    ) {

        return;

    }


    toggle.addEventListener(
        "click",
        function () {

            const isPassword =
                password.type ===
                "password";


            password.type =
                isPassword
                    ? "text"
                    : "password";


            /*
             * Jika toggle berupa icon,
             * update accessibility.
             */

            toggle.setAttribute(
                "aria-label",
                isPassword
                    ? "Sembunyikan password"
                    : "Tampilkan password"
            );

        }
    );

}


/******************************************************************************
 * INPUT EVENTS
 ******************************************************************************/

function initInputEvents() {

    const username =
        document.getElementById(
            "username"
        );

    const password =
        document.getElementById(
            "password"
        );


    const clear =
        function () {

            const error =
                document.getElementById(
                    "loginError"
                );

            if (error) {

                error.style.display =
                    "none";

            }

        };


    if (username) {

        username.addEventListener(
            "input",
            clear
        );

    }


    if (password) {

        password.addEventListener(
            "input",
            clear
        );

    }

}


/******************************************************************************
 * PREVENT MULTIPLE LOGIN
 ******************************************************************************/

window.addEventListener(
    "pageshow",
    function () {

        try {

            setLoginLoading(
                false
            );

        }
        catch (err) {

            console.warn(
                "pageshow:",
                err
            );

        }

    }
);


/******************************************************************************
 * DEBUG
 ******************************************************************************/

console.log(
    "LOGIN.JS SECURITY HARDENED 1.0 LOADED"
);
