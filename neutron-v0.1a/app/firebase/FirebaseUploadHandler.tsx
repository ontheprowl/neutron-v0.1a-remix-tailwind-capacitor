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


/**
 * This type represents an Upload Handler that manages uploads of files received bytewise to the server via Remix Form submissions
 */
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
            console.log("NON FILE KEY DETECTED");
            if (buffer.toString().includes('[') || buffer.toString().includes('{')) {
                console.log("JSON DETECTED")
                console.log("PURE JSON " + buffer.toString())
                const temp = JSON.parse(buffer.toString())
                console.dir(temp)
                return JSON.stringify(temp)
            } else {
                console.log(`PLAIN STRING DETECTED`);
                return buffer.toString();

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