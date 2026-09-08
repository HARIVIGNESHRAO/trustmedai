"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OAuthSuccess() {

    const router = useRouter();

    useEffect(() => {

        const params = new URLSearchParams(window.location.search);

        const token = params.get("token");

        const role = params.get("role");

        if (token) {

            localStorage.setItem("token", token);

            if (role) {
                localStorage.setItem("role", role);
            }

            if (role === "ROLE_ADMIN") {

                router.push("/admin");

            } else {

                router.push("/dashboard");

            }

        } else {

            router.push("/login");

        }

    }, [router]);

    return <h2>Signing you in...</h2>;
}