const fs = require('fs');
const { exec } = require('child_process');
const { Client } = require('ssh2');

// Config for both servers
const serverConfig = [
    {
        host: 'api.in-haus.ca',
        username: 'ubuntu',
        privateKey: fs.readFileSync('/home/diealm/inhaus/keys/inhaus-aws.pem'),
        envPath: '/home/ubuntu/In-Haus-Backend/.env',
        restartCommand: 'pm2 restart all'
    },
    {
        host: 'server.inteligencia.ec',
        username: 'diealm',
        privateKey: fs.readFileSync('/home/diealm/inhaus/keys/inteligencia.pem'),
        envPath: '/home/diealm/inhaus/inhaus-openai/.env',
        restartCommand: 'pm2 restart all'
    }
];

// Function to generate a new JWT secret
const generateNewSecret = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Function to update the .env file on a remote server
const updateEnvOnServer = (server, newSecret, callback) => {
    const conn = new Client();

    conn
        .on('ready', () => {
            console.log(`Connected to ${server.host}`);

            const updateCommand = `
                echo "JWT_SECRET=${newSecret}" > ${server.envPath} &&
                ${server.restartCommand}
            `;

            conn.exec(updateCommand, (err, stream) => {
                if (err) throw err;

                stream
                    .on('close', (code, signal) => {
                        console.log(`${server.host} updated and restarted (code: ${code}, signal: ${signal})`);
                        conn.end();
                        callback();
                    })
                    .stderr.on('data', (data) => {
                        console.error(`${server.host} error: ${data}`);
                    });
            });
        })
        .connect(server);
};

// Main execution function
const updateAndSyncSecrets = () => {
    const newSecret = generateNewSecret();
    console.log(`Generated new JWT_SECRET: ${newSecret}`);

    let completed = 0;
    const totalServers = serverConfig.length;

    serverConfig.forEach((server) => {
        updateEnvOnServer(server, newSecret, () => {
            completed++;
            if (completed === totalServers) {
                console.log('All servers updated and restarted successfully.');
            }
        });
    });
};

updateAndSyncSecrets();
