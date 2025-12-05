
async function testWebhook() {
    const url = "http://localhost:5678/webhook/live-jobs";
    const payload = {
        role: "Software Engineer",
        location: "United States",
        resume: {
            personalInfo: { fullName: "Test User" },
            skills: [{ name: "JavaScript" }, { name: "React" }],
            summary: "Experienced developer"
        }
    };

    console.log("🚀 Sending request to:", url);
    console.log("📦 Payload:", JSON.stringify(payload, null, 2));

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

        const start = Date.now();
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        const duration = (Date.now() - start) / 1000;

        console.log(`\n✅ Status: ${response.status} ${response.statusText} (${duration.toFixed(2)}s)`);

        if (response.ok) {
            const data = await response.json();
            console.log("\n📄 Response Data:");
            console.log(JSON.stringify(data, null, 2));

            if (data.results) {
                console.log(`\n✨ Found ${data.results.length} jobs.`);
            }
        } else {
            const text = await response.text();
            console.error("\n❌ Error Body:", text);
        }
    } catch (error) {
        console.error("\n❌ Request failed:", error.message);
    }
}

testWebhook();
