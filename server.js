/**
    const http = require("http");
    
    const server = http.createServer((req, res) => {
        const urlPath = req.url;
        if (urlPath === "/overview") {
            res.end('Welcome to nginx server overview');
        } else if (urlPath === "/api") {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(
                JSON.stringify({
                    city: "NginX City",
                    date_last_visited: "Now"
                })
            );
        } else {
            res.end("Successfully started a server");
        }
    });
    
    server.listen(3000, "127.0.0.1", () => {
        console.log("Listening for request");
    })
*/

////////////

