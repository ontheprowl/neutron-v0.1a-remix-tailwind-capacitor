import { useActionData, useLoaderData } from "@remix-run/react";
import { json, LoaderFunction, redirect } from "@remix-run/server-runtime";
import { googlePeople, oAuth2Client } from "~/firebase/gapis-config.server";
import fs from 'fs';
import { createUserSession, requireUser } from "~/session.server";
import { addFirestoreDocFromData, setFirestoreDocFromData } from "~/firebase/queries.server";
import { adminAuth, adminFirestore, auth, firestore } from "~/firebase/neutron-config.server";
import { google } from "googleapis";
import { DEFAULT_USER_STATE } from "~/models/user";
import { signInWithCredential, signInWithCustomToken } from "firebase/auth";
import { randomUUID } from "crypto";

const TOKEN_PATH = "tokens.json"


export async function action({ request }: { request: Request }) {
    const session = await requireUser(request, true);



    return redirect(`/${session?.metadata?.displayName}/dashboard`)

}

export const loader: LoaderFunction = async ({ request }) => {
    //TODO : pull cookie from request, add tokens to session, forward

    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const scope = url.searchParams.get("scope")
    try {
        if (code) {
            const { tokens } = await oAuth2Client.getToken(code)
            if (tokens.access_token && tokens.refresh_token) {
                oAuth2Client.setCredentials(tokens);
                const tokenInfoUID: string = (await oAuth2Client.getTokenInfo(tokens.access_token)).sub;

                const buffer = fs.readFileSync('token-uids.json');
                const tokenUIDMappings = JSON.parse(buffer.toString());
                const userUID = tokenUIDMappings[tokenInfoUID];

                if (userUID) {
                    return json({ status: 'user already' })

                }
                else {
                    // USER DOES NOT EXIST
                    oAuth2Client.credentials = tokens;
                    // LIFT DETAILS FROM GOOGLE PROFILE. POPULATE BASIC FIELDS.
                    const result = await googlePeople.people.get({
                        resourceName: 'people/me',
                        personFields: 'emailAddresses,names,phoneNumbers,coverPhotos,photos',
                    });
                    const email = result.data.emailAddresses[0].value;
                    const name = result.data.names[0]?.displayName;
                    const photoURL = result.data.photos[0]?.url;
                    const uid = randomUUID();


                    // CREATE NEW FIREBASE PASSWORD

                    const password = randomUUID();
                    // CREATE FIREBASE USER, WITH NEW UID
                    await adminAuth.createUser({ uid: uid, email: email, password: password, displayName: name, photoURL: photoURL });



                    // MAP TOKEN UID TO FIREBASE UID
                    tokenUIDMappings[tokenInfoUID] = uid;



                    // WRITE NEW MAPPING TO MAPPING FILE
                    fs.writeFileSync(`token-uids.json`, JSON.stringify(tokenUIDMappings))

                    // UPDATE METADATA
                    const userUIDRef = await setFirestoreDocFromData({ uid: uid }, 'userUIDS', `${name}`);

                    const metadataRef = await setFirestoreDocFromData({ ...DEFAULT_USER_STATE, email: email, id: uid, displayName: name, photoURL: photoURL }, `metadata`, uid);
                    const customToken = await adminAuth.createCustomToken(uid);

                    // STORE TOKENS FOR THIS USER
                    fs.mkdirSync(`/tokens/${uid}`, { recursive: true });
                    fs.writeFileSync(`/tokens/${uid}/tokens.json`, JSON.stringify(tokens), { flag: 'w' });


                    // LOG-IN AS NEWLY CREATED USER

                    const signedInCredentials = await signInWithCustomToken(auth, customToken);
                    const firebaseToken = await signedInCredentials.user.getIdToken();


                    return createUserSession({ request: request, metadata: { path: metadataRef.path }, userId: firebaseToken, remember: true, redirectTo: `/${name}/profile` })

                }
            }


            // 

        }
    } catch (e) {
        if (e) return console.error(e);

    }
    return null;
}