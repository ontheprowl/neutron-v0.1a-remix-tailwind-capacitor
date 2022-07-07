import { google } from "googleapis";
import fs from 'fs';
import { json } from "@remix-run/server-runtime";


const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const client_id = '611788892898-9re63jc6gon32vnbhf9598i0fkeda5dd.apps.googleusercontent.com';
const client_secret = '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';
const redirect_uris = 'http://localhost:3000/session/redirectHandler'



export const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris);

export async function authorizeAndExecute(onSuccess: (value?: any) => any, onFailure: (value?: any) => any, authGranted?: boolean): Promise<any> {


    const tokens = fs.readFileSync('tokens.json');
    // if (err) return getAccessToken(oAuth2Client, callback);
    const credentials = JSON.parse(tokens.toString());
    oAuth2Client.setCredentials(credentials);
    if (credentials.refresh_token) {
        return authGranted ? await onSuccess(oAuth2Client) : onSuccess();
    }
    return authGranted ? await onFailure(oAuth2Client) : onFailure();
    
}

// export async function authorizeWithProviderAndExecute(onSuccess: (value?: any) => any, onFailure: (value?: any) => any, authGranted?: boolean): Promise<any> {
    
// }

export const generateAuthUrl = () => {
    const authURL = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    return authURL
}

export let credentials: { refresh_token?: string | null, access_token?: string | null } = { refresh_token: null, access_token: null }


oAuth2Client.on('tokens', (creds) => {
    if (creds.refresh_token) {
        console.log('REFRESH_TOKEN : ' + creds.refresh_token)
        credentials.refresh_token = creds.refresh_token
    }
    console.log('ACCESS TOKEN : ' + creds.access_token)
})

