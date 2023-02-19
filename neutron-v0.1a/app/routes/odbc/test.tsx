import type { ActionFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import * as odbc from 'odbc'
import { trimNullValues } from "~/utils/utils.server";







/** Tally Integration - Load All Data */
export const action: ActionFunction = async ({ request, params }) => {


    


    const connection1 = await odbc.connect('DRIVER=Tally ODBC Driver64;DSN=TallyODBC64_9000;SERVER=(127.0.0.01);PORT=9000');
    // connection1 is now an open Connection
    const allTableNames = await connection1.query("SELECT $Name from ODBCTables");

    const allTableData: { [x: string]: any } = {}
    for (const tableEntry of allTableNames) {
        const tableName = tableEntry['$Name'];
        allTableData[tableName] = await connection1.query(`SELECT * FROM ${tableName}`);
    }


    const allTableDataJSON = JSON.parse(JSON.stringify(allTableData))


    trimNullValues(allTableDataJSON);



    console.dir('ODBC Connection established....')

    return json(allTableDataJSON);
}