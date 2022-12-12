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
        const { data, contentType, filename } = args;

        const chunks: Buffer[] = [];

        // const stream = new WritableStream(chunks)
        for await (const chunk of data) {
            chunks.push(Buffer.from(chunk))
        }
        // Get the file as a buffer
        const buffer = Buffer.concat(chunks);

        if (!filename?.includes('.')) {
            // * NON FILE KEY DETECTED 
            if (buffer.toString().includes('[') || buffer.toString().includes('{')) {
                // * JSON DETECTED
                // * PURE JSON
                const temp = JSON.parse(buffer.toString())
                return JSON.stringify(temp)
            } else {
                // * PLAIN STRING DETECTED
                return buffer.toString();

            }

        }

        const uploadPath = await uploadRoutine(buffer, session, filename);
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