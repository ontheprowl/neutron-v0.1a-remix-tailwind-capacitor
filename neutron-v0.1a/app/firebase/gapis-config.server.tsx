import { google } from "googleapis";
import fs from 'fs';
import { adminFirestore } from "./neutron-config.server";
import * as client from 'https'


const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly', 'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/user.emails.read',
    'https://www.googleapis.com/auth/user.gender.read',
    'https://www.googleapis.com/auth/user.organization.read',
    'https://www.googleapis.com/auth/user.phonenumbers.read',
    'profile', 'email'];

const client_id = '611788892898-9re63jc6gon32vnbhf9598i0fkeda5dd.apps.googleusercontent.com';
const client_secret = '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';
const redirect_uris = 'http://localhost:3000/oauth/redirect'



export const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris);

google.options({ auth: oAuth2Client });

export const googlePeople = google.people("v1");

export async function authorizeAndExecute(onSuccess: (value?: any) => any, onFailure: (value?: any) => any, uid: string, authGranted?: boolean,): Promise<any> {
    var tokensDoc;
    if (!tokensDoc) {
        tokensDoc = await adminFirestore.doc(`users/tokens${uid}`).get();

    }
    const tokensData = tokensDoc.data();
    const tokens = atob(tokensData?.tokens);
    // if (err) return getAccessToken(oAuth2Client, callback);
    const credentials = JSON.parse(tokens);
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

export function downloadGooglePhotosImage(url: string, buffer: Buffer, encString: string) {
    client.get(url, (res) => {
        res.pipe(fs.createWriteStream(buffer));
        encString = buffer.toString('base64');

    });
}

