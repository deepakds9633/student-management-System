const { exec } = require('child_process');

exec('netstat -aon | findstr :8080 | findstr LISTENING', (err, stdout) => {
    if (stdout) {
        const lines = stdout.split('\n');
        for (let line of lines) {
            const parts = line.trim().split(/\s+/);
            if (parts.length >= 5) {
                const pid = parts[4];
                if (pid && pid !== '0') {
                    console.log(`Killing process on port 8080: PID ${pid}`);
                    exec(`taskkill /F /PID ${pid}`, (kErr, kOut) => {
                        console.log(kOut);
                    });
                }
            }
        }
    } else {
        console.log("No process found on port 8080");
    }
});
