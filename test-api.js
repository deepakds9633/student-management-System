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
            const getReq = http.request(
                'http://localhost:8080/api/students/3',
                { method: 'GET', headers: { 'Authorization': 'Bearer ' + token } },
                getRes => {
                    let getBody = '';
                    getRes.on('data', d => getBody += d);
                    getRes.on('end', () => {
                        console.log("Status /api/students/3:", getRes.statusCode);
                        console.log("Headers /api/students/3:", getRes.headers);
                        console.log("Response /api/students/3:", getBody);

                        const getReq2 = http.request(
                            'http://localhost:8080/api/students',
                            { method: 'GET', headers: { 'Authorization': 'Bearer ' + token } },
                            getRes2 => {
                                let getBody2 = '';
                                getRes2.on('data', d => getBody2 += d);
                                getRes2.on('end', () => {
                                    console.log("Status /api/students:", getRes2.statusCode);
                                    console.log("Response /api/students excerpt:", getBody2.substring(0, 50));
                                });
                            }
                        );
                        getReq2.end();
                    });
                }
            );
            getReq.end();
        });
    }
);
loginReq.write(loginData);
loginReq.end();
