import * as http from 'http'
import { IncomingMessage, ServerResponse } from 'node:http';
import { Report, Sqlite3} from './sqllite3';

export class Server {
    port = 9021;
    db: Sqlite3 = new Sqlite3();

    run():void {
        const server = http.createServer(this.listener.bind(this));  
        server.listen(this.port, () => {console.log("Server is running on " + this.port)});
    }

    listener(req:IncomingMessage,res:ServerResponse) {
        if(req.method == "POST") {
            var body = "";
            req.on('data', (chunk)=>{body += chunk});
            req.on('end',()=>{
                const payload = JSON.parse(body);
                //validate  and generate data elements
                if(payload["csp-report"]){
                    const report = payload["csp-report"];
                    const uri = report["document-uri"];
                    const blockedURI = report["blocked-uri"];
                    const violation = report["violated-policy"];
                    const timestamp = new Date();
                    const rp:Report = {raw:report, uri:uri, blockedURI:blockedURI, violation:violation ,timestamp:timestamp}
                    this.db.write(rp);
                }else{
                    console.log("CSP Payload is malformed: " + body);
                }
            })
            res.end();
        }else if(req.method == "GET"){
            this.db.readAll((x:Report[])=>{
                res.write("<body><table><tr><th>URI</th><th>BlockedURI</th><th>violation</th><th>timestamp</th></tr>")
                if(x) 
                    for(const row of x){
                        res.write(`<td>` + row.uri + `</td><td>` + row.blockedURI + `</td><td>` + row.violation + `</td><td>` + row.timestamp + `</td><td></td></tr>`)
                    }
                res.write("</table></body>")
                res.end();
            })
            //we show a status page
        }
        else{
            res.end();
        }
    }
}

