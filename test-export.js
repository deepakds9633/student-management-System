const http = require('http');

const loginData = JSON.stringify({ username: 'admin', password: 'admin' });
const loginReq = http.request(
    'http://localhost:8080/api/auth/signin',
    { method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': loginData.length } },
    res => {
        let body = '';
        res.on('data', d => body += d);
        res.on('end', () => {
            const token = JSON.parse(body).token;
            console.log("Token:", token.substring(0, 10) + "...");

            // Test /api/export/marks/csv
            const getMarksReq = http.request(
                'http://localhost:8080/api/export/marks/csv',
                { method: 'GET', headers: { 'Authorization': 'Bearer ' + token } },
                getRes => {
                    let getBody = '';
                    getRes.on('data', d => getBody += d);
                    getRes.on('end', () => {
                        console.log("\n--- Response /api/export/marks/csv ---");
                        console.log("Status:", getRes.statusCode);
                        console.log("Content-Disposition:", getRes.headers['content-disposition']);
                        console.log("Response Body Excerpt:", getBody.substring(0, 500));
                    });
                }
            );
            getMarksReq.end();

            // Test /api/export/attendance/csv
            const getAttReq = http.request(
                'http://localhost:8080/api/export/attendance/csv',
                { method: 'GET', headers: { 'Authorization': 'Bearer ' + token } },
                getRes => {
                    let getBody = '';
                    getRes.on('data', d => getBody += d);
                    getRes.on('end', () => {
                        console.log("\n--- Response /api/export/attendance/csv ---");
                        console.log("Status:", getRes.statusCode);
                        console.log("Content-Disposition:", getRes.headers['content-disposition']);
                        console.log("Response Body Excerpt:", getBody.substring(0, 500));
                    });
                }
            );
            getAttReq.end();

        });
    }
);
loginReq.write(loginData);
loginReq.end();
