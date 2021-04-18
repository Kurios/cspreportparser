import { resolve } from 'node:path';
import {Database} from 'sqlite3';

export class Sqlite3 {
    database: Database;

    constructor(){
        this.database = new Database('sqlite3.db')
        this.database.run("CREATE TABLE IF NOT EXISTS reports (uri TEXT blockedURI TEXT violation TEXT rawJson TEXT timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)")
    }

    write(report:Report){
        let statement = this.database.prepare("INSERT INTO reports (uri,blockedURI,violation,rawJson,timestamp) VALUES (? ? ? ? ?)")
        statement.run(report.uri,report.blockedURI,report.violation,report.raw,report.timestamp);
    }

    readAll(x:(x:Report[])=>void):void {
        this.database.all("SELECT * FROM reports ORDER BY timestamp LIMIT 100",(err,rows)=>{
            x(rows);
        })
    }
}

export interface Report {
    raw:string
    uri:string
    blockedURI:string
    violation:string
    timestamp:Date
}