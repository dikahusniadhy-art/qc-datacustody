/******************************************************************************
 * DATA AGUNAN CUSTODY
 * ROLE BASED ACCESS CONTROL (RBAC)
 * Version : 3.0
 ******************************************************************************/

/******************************************************************************
 * ROLE CONFIGURATION
 ******************************************************************************/

const ROLES = {

    /**********************************************************************
     * ADMIN
     **********************************************************************/
    ADMIN: {

        menu: [

            "dashboard",
            "data",
            "approval",
            "monitoring",
            "laporan",
            "user_management",
            "pengaturan"

        ],

        permission: {

            create: true,

            read: true,

            update: true,

            delete: true,

            approve: true,

            export: true,

            user_management: true

        }

    },


    /**********************************************************************
     * MAKER
     **********************************************************************/
    MAKER: {

        menu: [

            "dashboard",
            "data",
            "monitoring",
            "input"

        ],

        permission: {

            create: true,

            read: true,

            update: true,

            delete: false,

            approve: false,

            export: false,

            user_management: false

        }

    },


    /**********************************************************************
     * CHECKER
     **********************************************************************/
    CHECKER: {

        menu: [

            "dashboard",

            "data",

            "approval",

            "monitoring",

            "laporan"

        ],

        permission: {

            create: false,

            read: true,

            update: false,

            delete: false,

            approve: true,

            export: true,

            user_management: false

        }

    },


    /**********************************************************************
     * VIEWER
     **********************************************************************/
    VIEWER: {

        menu: [

            "dashboard",

            "monitoring",

            "laporan"

        ],

        permission: {

            create: false,

            read: true,

            update: false,

            delete: false,

            approve: false,

            export: true,

            user_management: false

        }

    }

};


/******************************************************************************
 * ROLE ENGINE
 ******************************************************************************/

const Role = {

    /**********************************************************************
     * GET CURRENT USER
     **********************************************************************/
    getUser() {

        try {

            if (
                typeof Auth === "undefined" ||
                typeof Auth.getUser !== "function"
            ) {

                console.error(
                    "Role: Auth.getUser() tidak tersedia."
                );

                return null;

            }

            return Auth.getUser();

        }
        catch (error) {

            console.error(
                "Role.getUser ERROR:",
                error
            );

            return null;

        }

    },


    /**********************************************************************
     * GET ROLE USER
     **********************************************************************/
    getRole() {

        const user =
            this.getUser();

        if (!user) {

            return null;

        }

        return String(
            user.role || ""
        )
            .trim()
            .toUpperCase();

    },


    /**********************************************************************
     * GET CONFIG ROLE
     **********************************************************************/
    getConfig() {

        const role =
            this.getRole();

        if (!role) {

            return null;

        }

        return ROLES[role] || null;

    },


    /**********************************************************************
     * CHECK ROLE
     **********************************************************************/
    is(role) {

        const currentRole =
            this.getRole();

        if (!currentRole) {

            return false;

        }

        return (
            currentRole ===
            String(role)
                .trim()
                .toUpperCase()
        );

    },


    /**********************************************************************
     * IS ADMIN
     **********************************************************************/
    isAdmin() {

        return this.is("ADMIN");

    },


    /**********************************************************************
     * IS MAKER
     **********************************************************************/
    isMaker() {

        return this.is("MAKER");

    },


    /**********************************************************************
     * IS CHECKER
     **********************************************************************/
    isChecker() {

        return this.is("CHECKER");

    },


    /**********************************************************************
     * IS VIEWER
     **********************************************************************/
    isViewer() {

        return this.is("VIEWER");

    },


    /**********************************************************************
     * HAS PERMISSION
     **********************************************************************/
    can(permission) {

        const config =
            this.getConfig();

        if (
            !config ||
            !config.permission
        ) {

            return false;

        }

        return (
            config.permission[
            permission
            ] === true
        );

    },


    /**********************************************************************
     * CREATE
     **********************************************************************/
    canCreate() {

        return this.can("create");

    },


    /**********************************************************************
     * READ
     **********************************************************************/
    canRead() {

        return this.can("read");

    },


    /**********************************************************************
     * UPDATE
     **********************************************************************/
    canUpdate() {

        return this.can("update");

    },


    /**********************************************************************
     * DELETE
     **********************************************************************/
    canDelete() {

        return this.can("delete");

    },


    /**********************************************************************
     * APPROVE
     **********************************************************************/
    canApprove() {

        return this.can("approve");

    },


    /**********************************************************************
     * EXPORT
     **********************************************************************/
    canExport() {

        return this.can("export");

    },


    /**********************************************************************
     * USER MANAGEMENT
     **********************************************************************/
    canManageUsers() {

        return this.can(
            "user_management"
        );

    },


    /**********************************************************************
     * HAS MENU
     **********************************************************************/
    hasMenu(menu) {

        const config =
            this.getConfig();

        if (
            !config ||
            !Array.isArray(config.menu)
        ) {

            return false;

        }

        return config.menu.includes(
            menu
        );

    },


    /**********************************************************************
     * RENDER SIDEBAR
     **********************************************************************/
    renderSidebar() {

        const config =
            this.getConfig();

        if (!config) {

            console.warn(
                "Role.renderSidebar: role tidak ditemukan."
            );

            return;

        }

        document
            .querySelectorAll(
                "[data-menu]"
            )
            .forEach(item => {

                const menu =
                    item.dataset.menu;

                if (
                    config.menu.includes(
                        menu
                    )
                ) {

                    item.style.display = "";

                }
                else {

                    item.style.display =
                        "none";

                }

            });

    },


    /**********************************************************************
     * RENDER PERMISSION
     **********************************************************************/
    renderPermission() {

        document
            .querySelectorAll(
                "[data-permission]"
            )
            .forEach(item => {

                const permission =
                    item.dataset.permission;

                if (
                    this.can(
                        permission
                    )
                ) {

                    item.style.display =
                        "";

                }
                else {

                    item.style.display =
                        "none";

                }

            });

    },


    /**********************************************************************
     * APPLY RBAC
     **********************************************************************/
    apply() {

        this.renderSidebar();

        this.renderPermission();

    },


    /**********************************************************************
     * DEBUG
     **********************************************************************/
    debug() {

        const user =
            this.getUser();

        const role =
            this.getRole();

        console.log(
            "========================================"
        );

        console.log(
            "           RBAC DEBUG"
        );

        console.log(
            "========================================"
        );

        console.log(
            "USER     :",
            user
        );

        console.log(
            "ROLE     :",
            role
        );

        console.log(
            "CONFIG   :",
            this.getConfig()
        );

        console.log(
            "CREATE   :",
            this.canCreate()
        );

        console.log(
            "READ     :",
            this.canRead()
        );

        console.log(
            "UPDATE   :",
            this.canUpdate()
        );

        console.log(
            "DELETE   :",
            this.canDelete()
        );

        console.log(
            "APPROVE  :",
            this.canApprove()
        );

        console.log(
            "EXPORT   :",
            this.canExport()
        );

        console.log(
            "USER MGMT:",
            this.canManageUsers()
        );

        console.log(
            "========================================"
        );

    }

};


/******************************************************************************
 * FREEZE CONFIGURATION
 ******************************************************************************/

Object.freeze(ROLES);


/******************************************************************************
 * GLOBAL EXPORT
 ******************************************************************************/

window.ROLES = ROLES;

window.Role = Role;


/******************************************************************************
 * LOADED
 ******************************************************************************/

console.log(
    "ROLES.JS SECURITY HARDENED 3.0 LOADED"
);
