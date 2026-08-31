/******************************************************************************
 * RESET PASSWORD
 * DATA AGUNAN CUSTODY
 ******************************************************************************/

const ResetPassword = {

    step: 1,

    init() {

        console.log(
            "RESET PASSWORD.JS LOADED"
        );


        this.form =
            document.getElementById(
                "resetPasswordForm"
            );

        this.username =
            document.getElementById(
                "username"
            );

        this.email =
            document.getElementById(
                "email"
            );

        this.otp =
            document.getElementById(
                "otp"
            );

        this.requestId =
            document.getElementById(
                "requestId"
            );

        this.otpGroup =
            document.getElementById(
                "otpGroup"
            );

        this.newPassword =
            document.getElementById(
                "newPassword"
            );

        this.confirmPassword =
            document.getElementById(
                "confirmPassword"
            );

        this.btnSubmit =
            document.getElementById(
                "btnResetPassword"
            );

        this.message =
            document.getElementById(
                "resetMessage"
            );


        this.toggleNewPassword =
            document.getElementById(
                "toggleNewPassword"
            );

        this.toggleConfirmPassword =
            document.getElementById(
                "toggleConfirmPassword"
            );


        if (
            !this.form
        ) {

            console.error(
                "resetPasswordForm tidak ditemukan."
            );

            return;

        }


        this.form.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                this.submit();

            }
        );


        this.initPasswordToggle(
            this.newPassword,
            this.toggleNewPassword
        );


        this.initPasswordToggle(
            this.confirmPassword,
            this.toggleConfirmPassword
        );

    },


    initPasswordToggle(
        input,
        toggle
    ) {

        if (
            !input ||
            !toggle
        ) {

            return;

        }


        const icon =
            toggle.querySelector(
                "i"
            );


        toggle.addEventListener(
            "click",
            () => {

                const visible =
                    input.type ===
                    "text";


                input.type =
                    visible
                        ? "password"
                        : "text";


                if (icon) {

                    icon.classList.toggle(
                        "fa-eye",
                        visible
                    );

                    icon.classList.toggle(
                        "fa-eye-slash",
                        !visible
                    );

                }

            }
        );

    },


    validatePassword(
        password
    ) {

        const value =
            String(
                password || ""
            );


        if (
            value.length < 8
        ) {

            return {
                valid:
                    false,

                message:
                    "Password minimal 8 karakter."
            };

        }


        if (
            !/[A-Z]/.test(value)
        ) {

            return {
                valid:
                    false,

                message:
                    "Password harus memiliki huruf besar."
            };

        }


        if (
            !/[a-z]/.test(value)
        ) {

            return {
                valid:
                    false,

                message:
                    "Password harus memiliki huruf kecil."
            };

        }


        if (
            !/[0-9]/.test(value)
        ) {

            return {
                valid:
                    false,

                message:
                    "Password harus memiliki angka."
            };

        }


        if (
            !/[^A-Za-z0-9]/.test(value)
        ) {

            return {
                valid:
                    false,

                message:
                    "Password harus memiliki karakter khusus."
            };

        }


        return {
            valid:
                true,

            message:
                "OK"
        };

    },


    async submit() {

        try {

            this.clearMessage();

            const username =
                String(
                    this.username?.value ||
                    ""
                ).trim();

            const email =
                String(
                    this.email?.value ||
                    ""
                ).trim()
                    .toLowerCase();


            /*
             * STEP 1
             */
            if (
                this.step === 1
            ) {

                await this.requestOtp(
                    username,
                    email
                );

                return;

            }


            /*
             * STEP 2
             */
            await this.confirmReset();

        }
        catch (err) {

            console.error(
                "RESET PASSWORD ERROR:",
                err
            );


            this.showMessage(
                err.message ||
                "Gagal memproses reset password.",
                "error"
            );

        }
        finally {

            this.setLoading(
                false
            );

        }

    },


    async requestOtp(
        username,
        email
    ) {

        if (!username) {

            throw new Error(
                "Username wajib diisi."
            );

        }


        if (!email) {

            throw new Error(
                "Email wajib diisi."
            );

        }


        this.setLoading(
            true
        );


        const result =
            await API.requestPasswordReset(
                username,
                email
            );


        if (
            !result ||
            result.success !== true
        ) {

            throw new Error(
                result?.message ||
                "Gagal meminta OTP."
            );

        }


        const requestId =
            result?.data?.request_id;


        if (!requestId) {

            throw new Error(
                "Request ID reset tidak diterima."
            );

        }


        this.requestId.value =
            requestId;


        this.step =
            2;


        /*
         * Tampilkan OTP
         */
        this.otpGroup.hidden =
            false;


        /*
         * Field username/email
         * dikunci supaya konsisten
         * dengan request pertama.
         */
        this.username.readOnly =
            true;

        this.email.readOnly =
            true;


        this.btnSubmit.innerHTML =
            '<i class="fa-solid fa-key"></i> Konfirmasi Reset Password';


        this.showMessage(
            result.message ||
            "Kode OTP telah dikirim ke email Anda.",
            "success"
        );


        this.otp.focus();

    },


    async confirmReset() {

        const requestId =
            String(
                this.requestId?.value ||
                ""
            ).trim();


        const otp =
            String(
                this.otp?.value ||
                ""
            ).trim();


        const newPassword =
            String(
                this.newPassword?.value ||
                ""
            );


        const confirmPassword =
            String(
                this.confirmPassword?.value ||
                ""
            );


        if (
            !requestId
        ) {

            throw new Error(
                "Request reset tidak valid."
            );

        }


        if (
            !/^\d{6}$/.test(otp)
        ) {

            throw new Error(
                "OTP harus terdiri dari 6 digit."
            );

        }


        const passwordValidation =
            this.validatePassword(
                newPassword
            );


        if (
            !passwordValidation.valid
        ) {

            throw new Error(
                passwordValidation.message
            );

        }


        if (
            newPassword !==
            confirmPassword
        ) {

            throw new Error(
                "Konfirmasi password tidak sama."
            );

        }


        this.setLoading(
            true
        );


        /*
         * POST no-cors.
         */
        const sent =
            await API.confirmPasswordReset({

                request_id:
                    requestId,

                otp:
                    otp,

                password:
                    newPassword

            });


        if (
            !sent ||
            sent.success !== true
        ) {

            throw new Error(
                "Request reset password gagal dikirim."
            );

        }


        /*
         * Tunggu backend menyelesaikan request.
         */
        this.showMessage(
            "Memproses reset password...",
            "success"
        );


        const result =
            await this.waitForResetStatus(
                requestId
            );


        if (
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Reset password gagal."
            );

        }


        this.showMessage(
            "Password berhasil direset. Mengalihkan ke login...",
            "success"
        );


        this.form.reset();


        setTimeout(
            () => {

                window.location.href =
                    "login.html";

            },
            1800
        );

    },


    async waitForResetStatus(
        requestId
    ) {

        const maxAttempts =
            15;


        for (
            let i = 0;
            i < maxAttempts;
            i++
        ) {

            await this.sleep(
                1000
            );


            const result =
                await API.getResetStatus(
                    requestId
                );


            if (
                result &&
                result.data &&
                result.data.status ===
                "PROCESSING"
            ) {

                continue;

            }


            return {

                success:
                    result?.success === true,

                message:
                    result?.message ||
                    "Reset password gagal."

            };

        }


        return {

            success:
                false,

            message:
                "Server tidak memberikan konfirmasi reset password dalam waktu yang ditentukan."

        };

    },


    sleep(
        ms
    ) {

        return new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    ms
                )
        );

    },


    setLoading(
        loading
    ) {

        if (
            !this.btnSubmit
        ) {

            return;

        }


        this.btnSubmit.disabled =
            loading;


        if (
            loading
        ) {

            this.btnSubmit.dataset.originalText =
                this.btnSubmit.innerHTML;


            this.btnSubmit.innerHTML =
                '<i class="fa-solid fa-spinner fa-spin"></i> Memproses...';

        }
        else {

            this.btnSubmit.innerHTML =
                this.btnSubmit.dataset.originalText ||
                '<i class="fa-solid fa-key"></i> Reset Password';

        }

    },


    showMessage(
        message,
        type = "error"
    ) {

        if (!this.message) {

            return;

        }


        this.message.textContent =
            message;

        this.message.className =
            "reset-message " +
            type;

        this.message.hidden =
            false;

    },


    clearMessage() {

        if (!this.message) {
            return;
        }

        this.message.textContent = "";
        this.message.hidden = true;
        this.message.className = "reset-message";

    }

};


/******************************************************************************
 * INITIALIZE
 ******************************************************************************/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        ResetPassword.init();

    }
);