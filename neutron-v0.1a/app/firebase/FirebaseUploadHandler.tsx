import type { File as GCloudFile } from "@google-cloud/storage";
import { writeAsyncIterableToWritable } from "@remix-run/node";
import { content } from "googleapis/build/src/apis/content";
import type { Readable } from "stream";

// TODO from Remix once types available
export declare type UploadHandlerArgs = {
    name: string;
    filename?: string | undefined;
    contentType: string;
    data: AsyncIterable<Uint8Array>;
};

// TODO from Remix once types available
export declare type UploadHandler = (
    args: UploadHandlerArgs
) => Promise<string | File | null | undefined>;

export type FirebaseStorageUploadHandler = {
    uploadRoutine(buffer: Buffer, session?: any, filename?: string): Promise<string>;
    filter?(args: UploadHandlerArgs): boolean | Promise<boolean>;
    session?: any;
};

export default function createFirebaseStorageFileHandler({
    uploadRoutine,
    filter,
    session
}: FirebaseStorageUploadHandler): UploadHandler {
    return async (args) => {
        console.log("ENTERED FIREBASE HANDLER ")
        const { data, contentType, filename } = args;



        console.log(filename)
        console.log(contentType)
        console.log(data)
        const chunks: Buffer[] = [];

        // const stream = new WritableStream(chunks)
        for await (const chunk of data) {
            chunks.push(Buffer.from(chunk))
        }
        // Get the file as a buffer
        const buffer = Buffer.concat(chunks);
        console.log(buffer)

        if (!filename?.includes('.')) {
            console.log("NON FILE KEY DETECTED")
            try {
                const temp = JSON.parse(buffer.toString())
                console.log("JSON EXTRACTED FROM BUFFER")
                console.dir(temp)
                return JSON.stringify(temp)
            }
            catch(e){
                console.log(`ERROR ENCOUNTERED : ERROR IS : ${e}`)
                return buffer.toString()
            }

        }

        const uploadPath = await uploadRoutine(buffer, session, filename);
        console.log(uploadPath)
        return uploadPath;

        // Save the Buffer to the file
        // await instance.save(buffer);

        // // Add the known content type to the file
        // await instance.setMetadata({
        //     "Content-Type": contentType,
        // });

        // // Make the file publicly readable - maintain other permissions
        // // https://googleapis.dev/nodejs/storage/latest/File.html#makePublic
        // await instance.makePublic();

        // // Return the public URL
        // return instance.publicUrl();
    };
}