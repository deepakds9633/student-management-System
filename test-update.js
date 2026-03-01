async function test() {
    try {
        console.log("Logging in...");
        const loginRes = await fetch("http://localhost:8080/api/auth/signin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: "admin",
                password: "admin"
            })
        });
        const text = await loginRes.text();
        console.log("Response text:", text);
        const loginData = JSON.parse(text);

        console.log("Login success! Token:", loginData.token.substring(0, 20) + "...");

        console.log("Updating profile...");
        const updateRes = await fetch("http://localhost:8080/api/profile", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + loginData.token
            },
            body: JSON.stringify({
                username: "admin",
                email: "admin@test.com"
            })
        });

        const updateData = await updateRes.text();
        if (!updateRes.ok) {
            console.error("UPDATE FAILED:");
            console.error(updateRes.status);
            console.error(updateData);
        } else {
            console.log("Update success!", updateData);
        }
    } catch (e) {
        console.error("ERROR:");
        console.error(e.message);
    }
}

test();
