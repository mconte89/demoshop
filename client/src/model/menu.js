import M from "../strings"

export default [    
    {
        icon: "zmdi zmdi-home",
        text: "Home",
        href: "/#/",
    },
    {
        icon: "zmdi zmdi-shield-security",
        text: M("security"),
        roles: ["admin"],
        children: [
            {
                icon: "zmdi zmdi-accounts-alt",
                text: M("users"),
                href: "/#/entities/user?grid=users",
                // permissions: ["user:list"]
            },
            {
                icon: "zmdi zmdi-key",
                text: M("roles"),
                href: "/#/entities/role?grid=roles",
                // permissions: ["role:list"]
            }
            // ,{
            //     icon: "zmdi zmdi-accounts-alt",
            //     text: M("entityRevisionSettings"),
            //     href: "/#/entities/single/revisionSettings",
            //     permissions: ["entityRevisionSettings:edit"]
            // }
        ]
    },
    {
        icon: "zmdi zmdi-store",
        text: M("store"),
        roles: ["admin"],
        children: [
            {
                icon: "zmdi zmdi-wrench",
                text: M("products"),
                href: "/#/entities/product?grid=products",
                // permissions: ["user:list"]
            },
            {
                icon: "zmdi zmdi-label",
                text: M("categories"),
                href: "/#/entities/category?grid=categories",
                // permissions: ["user:list"]
            },

        ]
    },
    {
        icon: "zmdi zmdi-settings",
        text: M("settings"),
        roles: ["admin"],
        href: "/#/"
    },
]